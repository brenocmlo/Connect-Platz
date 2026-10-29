// app/api/leads/_lib/leadUpdate.ts
// Monta a atualização de um lead (PATCH) a partir do payload validado:
// dados de cadastro, etapa, etiquetas, bolsão, primeiro contato e troca de corretor.

import { Lead, FunnelStage, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { SessionPayload } from "@/lib/auth/jwt";
import { isAdmin, isFinanceiro } from "@/lib/auth/session";
import { resolveLeadSource, sourceLabel } from "@/components/crm/leads/leadSource";
import { INTERESSE_PREFIX, isUuid } from "./leadAccess";
import { leadDataFields, parsePhone, parseDate, mergeBairros } from "./leadPayload";

export const LEAD_ACTIONS = [
  "ASSUMIR_BOLSAO",
  "MOVER_BOLSAO",
  "REGISTRAR_CONTATO",
  "MUDAR_ETAPA",
  "SOLICITAR_FECHAMENTO",
  "ATUALIZAR_CREDITO",
  "ATUALIZAR_TAGS",
  "EDITAR",
] as const;

export const UpdateLeadSchema = z.object({
  action: z.enum(LEAD_ACTIONS).optional(),
  stageId: z.string().optional().nullable(),
  etapaId: z.string().optional().nullable(),
  corretorId: z.string().optional().nullable(),
  financialApprovalStatus: z.enum(["PENDENTE", "APROVADO", "REJEITADO"]).optional().nullable(),
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres.").optional(),
  telefone: z.string().optional(),
  canal: z.string().max(40).optional(),
  statusCredito: z
    .enum(["NAO_INICIADA", "EM_ANALISE", "DOCUMENTACAO_PENDENTE", "APROVADO", "REPROVADO", "CONDICIONADO"])
    .optional(),
  ...leadDataFields,
});

export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>;
type LeadWithStage = Lead & {
  stage: FunnelStage;
  corretor?: { id: string; nome: string } | null;
};

export interface LeadUpdatePlan {
  data: Prisma.LeadUncheckedUpdateInput;
  events: { tipo: string; conteudo: string; metadata?: Prisma.InputJsonValue }[];
  changed: string[];
  isStageChange: boolean;
}

export class LeadUpdateError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

/** Campos simples de texto que são copiados diretamente quando enviados. */
const TEXT_FIELDS = ["cpf", "rg", "profissao", "estadoCivil", "regimeCasamento", "faixaRenda", "campaignName"] as const;

const FIELD_LABELS: Record<string, string> = {
  nome: "nome",
  telefone: "telefone",
  email: "e-mail",
  rendaDeclarada: "renda declarada",
  observacoes: "observações",
  source: "origem",
  adName: "empreendimento de interesse",
  bairrosInteresse: "região de interesse",
};

export async function buildLeadUpdate(
  lead: LeadWithStage,
  input: UpdateLeadInput,
  session: SessionPayload
): Promise<LeadUpdatePlan> {
  const plan: LeadUpdatePlan = { data: {}, events: [], changed: [], isStageChange: false };
  const set = (key: string, value: unknown) => {
    (plan.data as Record<string, unknown>)[key] = value;
    plan.changed.push(key);
  };

  // 1. Bolsão
  if (input.action === "ASSUMIR_BOLSAO") {
    if (!lead.isBolsao || lead.isClosed) throw new LeadUpdateError("Este lead não está disponível no bolsão.");
    set("corretorId", session.userId);
    set("isBolsao", false);
    set("bolsaoEnteredAt", null);
    set("slaBreached", false);
    set("slaDueAt", new Date(Date.now() + 20 * 60 * 1000)); // SLA obrigatório de 20 min
    plan.events.push({ tipo: "transbordo", conteudo: `Lead resgatado do Bolsão Compartilhado por ${session.nome}.` });
    return plan;
  }
  if (input.action === "MOVER_BOLSAO") {
    if (lead.isBolsao) throw new LeadUpdateError("Este lead já está no bolsão.");
    set("isBolsao", true);
    set("corretorId", null);
    set("bolsaoEnteredAt", new Date());
    plan.events.push({ tipo: "transbordo", conteudo: `Lead movido para o Bolsão Compartilhado por ${session.nome}.` });
    return plan;
  }

  // 2. Primeiro contato
  if (input.action === "REGISTRAR_CONTATO" && !lead.firstContactAt) {
    set("firstContactAt", new Date());
    const canal = input.canal ? ` via ${input.canal}` : "";
    plan.events.push({ tipo: "contato", conteudo: `Primeiro contato registrado${canal} por ${session.nome}.` });
  }

  // 3. Mudança de etapa (somente etapas do mesmo funil)
  const targetStageId = input.stageId || input.etapaId;
  if (targetStageId && targetStageId !== lead.stageId) {
    const nextStage = isUuid(targetStageId)
      ? await prisma.funnelStage.findUnique({ where: { id: targetStageId } })
      : null;
    if (!nextStage || nextStage.funnelId !== lead.funnelId) {
      throw new LeadUpdateError("A etapa informada não pertence ao funil deste lead.");
    }
    set("stageId", nextStage.id);
    set("slaBreached", false);
    set("slaDueAt", nextStage.slaMinutes ? new Date(Date.now() + nextStage.slaMinutes * 60 * 1000) : null);
    plan.isStageChange = true;
    plan.events.push({
      tipo: "status_change",
      conteudo: `Etapa alterada de "${lead.stage.nome}" para "${nextStage.nome}".`,
      metadata: { de: lead.stage.nome, para: nextStage.nome },
    });

    const isClosingStage = /vend|fechad|ganh/i.test(nextStage.nome);
    if (isClosingStage && lead.financialApprovalStatus !== "APROVADO") {
      set("financialApprovalStatus", "PENDENTE");
      plan.events.push({
        tipo: "fechamento_solicitado",
        conteudo: `Fechamento comercial registrado por ${session.nome}. Enviado para precificação e formalização do Financeiro.`,
      });
    }
  }

  // 3.1 Ação explícita de solicitar fechamento
  if (input.action === "SOLICITAR_FECHAMENTO") {
    set("financialApprovalStatus", "PENDENTE");
    plan.events.push({
      tipo: "fechamento_solicitado",
      conteudo: `Fechamento comercial solicitado por ${session.nome}. Aguardando lançamento de valores pelo Financeiro.`,
    });
  }

  // 3.2 Atualização de status financeiro
  if (input.financialApprovalStatus && input.financialApprovalStatus !== lead.financialApprovalStatus) {
    set("financialApprovalStatus", input.financialApprovalStatus);
    plan.events.push({
      tipo: "aprovacao_financeira",
      conteudo: `Status financeiro alterado para "${input.financialApprovalStatus}" por ${session.nome}.`,
    });
  }

  // 4. Troca de corretor (administradores e gestores financeiros da modalidade)
  if (input.corretorId !== undefined && input.corretorId !== lead.corretorId && input.action !== "REGISTRAR_CONTATO") {
    const canChangeBroker = isAdmin(session.role) || isFinanceiro(session.role);
    if (!canChangeBroker) throw new LeadUpdateError("Você não tem permissão para trocar o corretor do lead.", 403);
    const target = input.corretorId && isUuid(input.corretorId)
      ? await prisma.user.findFirst({
          where: { id: input.corretorId, organizationId: session.organizationId, isActive: true },
          select: { id: true, nome: true },
        })
      : null;
    if (!target) throw new LeadUpdateError("Corretor informado não pertence à sua organização.");
    set("corretorId", target.id);
    set("isBolsao", false);
    const prevName = lead.corretor?.nome;
    const deTexto = prevName ? `de ${prevName} ` : "";
    plan.events.push({
      tipo: "transbordo",
      conteudo: `Lead transferido ${deTexto}para ${target.nome} por ${session.nome}.`,
      metadata: { de: prevName || null, para: target.nome },
    });
  }

  // 5. Etiquetas
  if (input.tags) {
    const before = [...lead.tags].sort().join("|");
    if (before !== [...input.tags].sort().join("|")) {
      set("tags", input.tags);
      plan.events.push({
        tipo: "etiquetas",
        conteudo: input.tags.length ? `Etiquetas atualizadas: ${input.tags.join(", ")}.` : "Etiquetas removidas.",
      });
    }
  }

  // 6. Dados cadastrais
  applyDataFields(lead, input, set);
  const dataChanges = plan.changed.filter((k) => k in FIELD_LABELS || (TEXT_FIELDS as readonly string[]).includes(k));
  if (dataChanges.length > 0) {
    const labels = dataChanges.map((k) => FIELD_LABELS[k] || k);
    plan.events.push({ tipo: "edicao", conteudo: `Dados do lead atualizados (${labels.join(", ")}) por ${session.nome}.` });
  }
  if (plan.changed.includes("observacoes") && input.observacoes) {
    plan.events.push({ tipo: "nota", conteudo: input.observacoes });
  }

  return plan;
}

function applyDataFields(lead: LeadWithStage, input: UpdateLeadInput, set: (k: string, v: unknown) => void) {
  if (input.nome !== undefined && input.nome !== lead.nome) set("nome", input.nome);
  if (input.telefone !== undefined) {
    const phone = parsePhone(input.telefone);
    if (!phone) throw new LeadUpdateError("Telefone inválido. Informe DDD + número (10 ou 11 dígitos).");
    if (phone !== lead.telefone) set("telefone", phone);
  }
  if (input.email !== undefined && (input.email || null) !== lead.email) set("email", input.email || null);

  for (const key of TEXT_FIELDS) {
    const value = input[key];
    if (value !== undefined && (value || null) !== (lead[key] ?? null)) set(key, value || null);
  }
  if (input.tipoOcupacaoCredito !== undefined && input.tipoOcupacaoCredito !== lead.tipoOcupacaoCredito) {
    set("tipoOcupacaoCredito", input.tipoOcupacaoCredito || null);
  }
  if (input.statusCredito && input.statusCredito !== lead.statusCredito) set("statusCredito", input.statusCredito);

  const dataNascimento = parseDate(input.dataNascimento);
  if (dataNascimento !== undefined) set("dataNascimento", dataNascimento);

  const renda = input.rendaDeclarada ?? input.renda;
  if (renda !== undefined && renda !== Number(lead.rendaDeclarada ?? NaN)) set("rendaDeclarada", renda);
  if (input.rendaInformal !== undefined) set("rendaInformal", input.rendaInformal);
  if (input.rendaEspecificaAutonomo !== undefined) set("rendaEspecificaAutonomo", input.rendaEspecificaAutonomo);

  if (input.observacoes !== undefined && (input.observacoes?.trim() || null) !== lead.observacoes) {
    set("observacoes", input.observacoes?.trim() || null);
  }

  const origem = input.origem ?? input.source;
  if (origem) {
    const resolved = resolveLeadSource(origem);
    if (sourceLabel(resolved.source, resolved.utmSource) !== sourceLabel(lead.source, lead.utmSource)) {
      set("source", resolved.source);
      if (resolved.utmSource) set("utmSource", resolved.utmSource);
    }
  }

  if (input.empreendimentoInteresse !== undefined) {
    const adName = input.empreendimentoInteresse ? `${INTERESSE_PREFIX}${input.empreendimentoInteresse}` : null;
    if (adName !== lead.adName) set("adName", adName);
  }

  const bairros = mergeBairros(input.bairrosInteresse, input.bairro, input.cidade);
  if (bairros && bairros.join("|") !== lead.bairrosInteresse.join("|")) set("bairrosInteresse", bairros);
}

/** Resumo serializável (antes/depois) dos campos alterados para a auditoria. */
export function summarizeChanges(lead: Lead, plan: LeadUpdatePlan) {
  const toPlain = (v: unknown) =>
    v instanceof Date ? v.toISOString() : v instanceof Prisma.Decimal ? Number(v) : v ?? null;
  const antes: Record<string, unknown> = {};
  const depois: Record<string, unknown> = {};
  for (const key of Array.from(new Set(plan.changed))) {
    antes[key] = toPlain((lead as Record<string, unknown>)[key]);
    depois[key] = toPlain((plan.data as Record<string, unknown>)[key]);
  }
  return { antes, depois };
}
