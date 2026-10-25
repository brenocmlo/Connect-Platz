import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getRequestSession, requireSession, ADMIN_ROLES } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { resolvePublicOrganizationId } from "@/app/api/properties/propertyPayload";

export const dynamic = "force-dynamic";

// Configurações do site público, persistidas em Organization.settings.site (JSON).
const hex = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Cor deve estar no formato #RRGGBB.");
const text = (max: number) => z.string().trim().max(max);
const urlOrPath = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === "" || v.startsWith("/uploads/") || /^https:\/\//i.test(v), "Imagem deve ser um upload ou URL https.");

const SiteSettingsSchema = z
  .object({
    heroImage: urlOrPath,
    heroTitle: text(160),
    heroHighlight: text(200),
    heroSubtitle: text(400),
    siteTitle: text(120),
    siteSlogan: text(200),
    corretorNome: text(160),
    creci: text(40),
    whatsapp: text(30).refine((v) => v === "" || /^\d{10,13}$/.test(v.replace(/\D/g, "")), "WhatsApp inválido: informe DDD + número."),
    email: z.union([z.literal(""), z.string().trim().email("E-mail inválido.").max(160)]),
    pixelId: z.string().trim().regex(/^\d{0,20}$/, "Pixel ID deve conter apenas números."),
    siteAtivo: z.boolean(),
    themePreset: text(40),
    primaryColor: hex,
    secondaryColor: hex,
  })
  .partial()
  .strict(); // chaves fora da lista são rejeitadas

type SiteSettingsData = z.infer<typeof SiteSettingsSchema>;

// Padrões neutros: identidade visual e textos institucionais; contatos ficam vazios até o gestor configurar.
const DEFAULT_SITE_SETTINGS: Required<SiteSettingsData> = {
  heroImage: "",
  heroTitle: "Seja qual for o seu momento de vida,",
  heroHighlight: "a Connect Platz tem o imóvel certo para você.",
  heroSubtitle: "Venda e temporada em Fortaleza e no litoral, com corretores especialistas e crédito facilitado.",
  siteTitle: "Connect Platz Imóveis & Veraneio",
  siteSlogan: "",
  corretorNome: "",
  creci: "",
  whatsapp: "",
  email: "",
  pixelId: "",
  siteAtivo: true,
  themePreset: "connect-blue",
  primaryColor: "#1266C7",
  secondaryColor: "#D9BB4C",
};

async function readSettings(organizationId: string) {
  const org = await prisma.organization.findUnique({ where: { id: organizationId }, select: { settings: true } });
  const all = (org?.settings as Record<string, any> | null) || {};
  const site = (all.site as SiteSettingsData | undefined) || {};
  return { all, site: { ...DEFAULT_SITE_SETTINGS, ...site } };
}

/** GET /api/site-settings — público (vitrine). Com sessão, lê a organização do usuário. */
export async function GET(req: NextRequest) {
  try {
    const session = getRequestSession(req);
    const orgId = session?.organizationId || (await resolvePublicOrganizationId());
    if (!orgId) {
      return NextResponse.json({ success: true, settings: DEFAULT_SITE_SETTINGS }, { status: 200 });
    }
    const { site } = await readSettings(orgId);
    return NextResponse.json(
      { success: true, settings: site },
      { status: 200, headers: { "Cache-Control": session ? "private, no-store" : "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("Erro ao ler configurações do site:", error);
    return NextResponse.json({ error: "Erro ao carregar configurações do site." }, { status: 500 });
  }
}

/** POST /api/site-settings — somente administradores; valida as chaves permitidas. */
export async function POST(req: NextRequest) {
  const auth = requireSession(req, ADMIN_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  const parsed = SiteSettingsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const message =
      first?.code === "unrecognized_keys"
        ? `Campos não permitidos: ${(first as any).keys.join(", ")}.`
        : first?.message || "Configurações inválidas.";
    return NextResponse.json({ error: message, details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const { all, site: before } = await readSettings(session.organizationId);
    const patch = { ...parsed.data };
    if (patch.whatsapp) patch.whatsapp = patch.whatsapp.replace(/\D/g, "");
    const merged = { ...before, ...patch };

    await prisma.organization.update({
      where: { id: session.organizationId },
      data: { settings: { ...all, site: merged } as any },
    });

    const changed = Object.keys(patch).filter((k) => (before as any)[k] !== (merged as any)[k]);
    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Atualizou configurações do site",
      tipoAcao: "UPDATE",
      modulo: "CONFIGURACOES",
      entidade: "SiteSettings",
      entidadeId: session.organizationId,
      entidadeNome: "Site público",
      descricao: `${session.nome} atualizou o site público${changed.length ? ` (${changed.join(", ")})` : ""}.`,
      dadosAntes: Object.fromEntries(changed.map((k) => [k, (before as any)[k]])),
      dadosDepois: Object.fromEntries(changed.map((k) => [k, (merged as any)[k]])),
    });

    return NextResponse.json({ success: true, settings: merged }, { status: 200 });
  } catch (error) {
    console.error("Erro ao salvar configurações do site:", error);
    return NextResponse.json({ error: "Erro ao salvar configurações do site." }, { status: 500 });
  }
}
