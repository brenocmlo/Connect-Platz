// app/api/configuracoes/organizacao/route.ts
// Dados corporativos da imobiliária. Gestores leem; somente Administrador/Diretor editam.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireSession, isDirector, MANAGER_ROLES, DIRECTOR_ROLES } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { getOrgSettings, updateOrgSettings, EmpresaConfig } from "@/lib/domain/settings/orgSettings";
import { normalizeBrPhone } from "@/lib/utils/phone";

export const dynamic = "force-dynamic";

// Campos extras de cadastro guardados junto aos contatos em settings.empresa
interface EmpresaCadastro extends EmpresaConfig {
  razaoSocial?: string;
  cidade?: string;
  uf?: string;
}

const orgSelect = {
  id: true,
  nome: true,
  slug: true,
  cnpj: true,
  creci: true,
  logoUrl: true,
  logoDarkUrl: true,
  primaryColor: true,
  secondaryColor: true,
  operatingStart: true,
  operatingEnd: true,
} as const;

const HEX = /^#[0-9A-Fa-f]{6}$/;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => (v ? v : null));

const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || v.startsWith("/") || v.startsWith("https://"), "URL de logo inválida.")
  .nullable()
  .optional()
  .transform((v) => (v ? v : null));

const OrgSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome fantasia.").max(150),
  cnpj: text(20),
  creci: text(30),
  logoUrl: imageUrl,
  logoDarkUrl: imageUrl,
  primaryColor: z.string().regex(HEX, "Cor primária inválida (use #RRGGBB)."),
  secondaryColor: z.string().regex(HEX, "Cor secundária inválida (use #RRGGBB)."),
  operatingStart: z.string().regex(HHMM, "Horário inicial inválido (HH:MM)."),
  operatingEnd: z.string().regex(HHMM, "Horário final inválido (HH:MM)."),
  empresa: z
    .object({
      razaoSocial: text(200),
      telefone: text(30),
      email: z
        .string()
        .trim()
        .max(150)
        .refine((v) => v === "" || z.string().email().safeParse(v).success, "E-mail comercial inválido.")
        .nullable()
        .optional()
        .transform((v) => (v ? v : null)),
      endereco: text(300),
      cidade: text(120),
      uf: text(2),
      site: text(300),
    })
    .default({}),
});

function cleanEmpresa(e: Record<string, string | null | undefined>): EmpresaCadastro {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(e)) if (v) out[k] = v;
  return out as EmpresaCadastro;
}

export async function GET(req: NextRequest) {
  const auth = requireSession(req, MANAGER_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId },
      select: orgSelect,
    });
    if (!org) {
      return NextResponse.json({ error: "Organização não encontrada." }, { status: 404 });
    }
    const settings = await getOrgSettings(session.organizationId);
    return NextResponse.json({
      organizacao: { ...org, empresa: (settings.empresa || {}) as EmpresaCadastro },
      canEdit: isDirector(session.role),
    });
  } catch (err) {
    console.error("[CONFIG/ORG] GET:", err);
    return NextResponse.json({ error: "Erro ao carregar os dados da imobiliária." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireSession(req, DIRECTOR_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const parsed = OrgSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const cnpjDigits = data.cnpj ? data.cnpj.replace(/\D/g, "") : null;
  if (cnpjDigits && cnpjDigits.length !== 14) {
    return NextResponse.json({ error: "CNPJ inválido: informe os 14 dígitos." }, { status: 400 });
  }
  if (data.operatingStart >= data.operatingEnd) {
    return NextResponse.json(
      { error: "O início da janela operacional deve ser anterior ao fim." },
      { status: 400 }
    );
  }

  const empresa = cleanEmpresa({
    ...data.empresa,
    telefone: data.empresa.telefone ? normalizeBrPhone(data.empresa.telefone) : null,
    uf: data.empresa.uf ? data.empresa.uf.toUpperCase() : null,
  });

  try {
    const before = await prisma.organization.findUnique({
      where: { id: session.organizationId },
      select: orgSelect,
    });
    if (!before) {
      return NextResponse.json({ error: "Organização não encontrada." }, { status: 404 });
    }
    const beforeSettings = await getOrgSettings(session.organizationId);

    const updated = await prisma.organization.update({
      where: { id: session.organizationId },
      data: {
        nome: data.nome,
        cnpj: cnpjDigits,
        creci: data.creci,
        logoUrl: data.logoUrl,
        logoDarkUrl: data.logoDarkUrl,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        operatingStart: data.operatingStart,
        operatingEnd: data.operatingEnd,
      },
      select: orgSelect,
    });
    await updateOrgSettings(session.organizationId, { empresa });

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Atualização dos Dados da Imobiliária",
      tipoAcao: "UPDATE",
      modulo: "CONFIGURACOES",
      entidade: "Organization",
      entidadeId: session.organizationId,
      entidadeNome: updated.nome,
      descricao: "Dados cadastrais, identidade visual e janela operacional atualizados.",
      dadosAntes: { ...before, empresa: beforeSettings.empresa || {} },
      dadosDepois: { ...updated, empresa },
    });

    return NextResponse.json({ organizacao: { ...updated, empresa }, canEdit: true });
  } catch (err) {
    console.error("[CONFIG/ORG] PATCH:", err);
    return NextResponse.json({ error: "Erro ao salvar os dados da imobiliária." }, { status: 500 });
  }
}
