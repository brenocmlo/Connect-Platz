// app/api/leads/_lib/leadPayload.ts
// Esquemas de validação (zod) e utilitários de payload das rotas de Leads.

import { z } from "zod";
import { normalizeBrPhone } from "@/lib/utils/phone";

/** Aceita número ou texto em formato brasileiro ("R$ 5.000,00") e devolve number. */
export const optionalMoney = z.preprocess((v) => {
  if (v === "" || v === null || v === undefined) return undefined;
  if (typeof v === "number") return v;
  let s = String(v).replace(/[^\d,.-]/g, "");
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : v;
}, z.number({ invalid_type_error: "Valor monetário inválido." }).nonnegative().optional());

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();

export const tagsSchema = z
  .array(z.string().trim().min(1).max(40))
  .max(20, "Máximo de 20 etiquetas por lead.")
  .transform((tags) => Array.from(new Set(tags)));

export const CreditEmploymentEnum = z.enum(["CLT", "AUTONOMO", "EMPRESARIO", "APOSENTADO_PENSIONISTA", "OUTRO"]);

/** Campos editáveis de cadastro, compartilhados entre POST (criação) e PATCH (edição). */
export const leadDataFields = {
  email: z.string().trim().email("E-mail inválido.").optional().nullable().or(z.literal("")),
  rendaDeclarada: optionalMoney,
  renda: optionalMoney, // alias do plano de testes
  rendaInformal: optionalMoney,
  rendaEspecificaAutonomo: optionalMoney,
  faixaRenda: optionalText(60),
  tipoOcupacaoCredito: CreditEmploymentEnum.optional().nullable(),
  bairrosInteresse: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  observacoes: optionalText(5000),
  origem: optionalText(120),
  source: optionalText(120),
  tags: tagsSchema.optional(),
  empreendimentoInteresse: optionalText(150),
  cpf: optionalText(20),
  rg: optionalText(30),
  profissao: optionalText(120),
  estadoCivil: optionalText(40),
  regimeCasamento: optionalText(60),
  dataNascimento: optionalText(30),
  campaignName: optionalText(150),
  bairro: optionalText(80),
  cidade: optionalText(80),
};

export const CreateLeadSchema = z.object({
  nome: z.string().trim().min(2, "Nome é obrigatório (mínimo 2 caracteres)."),
  telefone: z.string().min(8, "Telefone é obrigatório."),
  etapaId: z.string().optional().nullable(),
  stageId: z.string().optional().nullable(),
  funnelId: z.string().optional().nullable(),
  corretorId: z.string().optional().nullable(),
  ...leadDataFields,
});

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;

/** Valida e normaliza o telefone para DDD + número (10/11 dígitos). */
export function parsePhone(input: string): string | null {
  const phone = normalizeBrPhone(input);
  return phone.length === 10 || phone.length === 11 ? phone : null;
}

/** Converte "dd/mm/aaaa" ou ISO em Date (ou null/undefined). */
export function parseDate(input: string | null | undefined): Date | null | undefined {
  if (input === undefined) return undefined;
  if (!input) return null;
  const br = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const d = br ? new Date(`${br[3]}-${br[2]}-${br[1]}T00:00:00Z`) : new Date(input);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Mensagem legível do primeiro erro de validação do zod. */
export function zodMessage(err: z.ZodError): string {
  const issue = err.issues[0];
  if (!issue) return "Dados inválidos.";
  const field = issue.path.join(".");
  return field ? `${field}: ${issue.message}` : issue.message;
}

/** Junta bairro/cidade informados aos bairros de interesse existentes (sem duplicar). */
export function mergeBairros(base: string[] | undefined, bairro?: string | null, cidade?: string | null): string[] | undefined {
  const extra = [bairro, cidade].filter((v): v is string => Boolean(v && v.trim()));
  if (!base && extra.length === 0) return undefined;
  return Array.from(new Set([...(base || []), ...extra.map((v) => v.trim())]));
}
