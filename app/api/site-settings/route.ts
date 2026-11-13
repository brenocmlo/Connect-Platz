import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getRequestSession, requireSession, ADMIN_ROLES } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { resolvePublicOrganizationId } from "@/app/api/properties/propertyPayload";
import { DEFAULT_VITRINE_SUBTITULO, DEFAULT_VITRINE_TITULO } from "@/lib/domain/portal/vitrineShowcase";

export const dynamic = "force-dynamic";

// Configurações do site público, persistidas em Organization.settings.site (JSON).
const hex = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Cor deve estar no formato #RRGGBB.");
const text = (max: number) => z.string().trim().max(max);
const urlOrPath = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === "" || v.startsWith("/uploads/") || /^https:\/\//i.test(v), "Imagem deve ser um upload ou URL https.");

const VitrineCardSchema = z.object({
  id: text(80),
  propertyId: z
    .string()
    .trim()
    .max(64)
    .refine((v) => v === "" || /^[0-9a-f-]{36}$/i.test(v), "ID de imóvel inválido.")
    .optional()
    .default(""),
  tag: text(40),
  eyebrow: text(40),
  titulo: text(80),
  foto: urlOrPath.optional().default(""),
  modalidade: z.enum(["", "VENDA", "ALUGUEL", "VERANEIO", "REPASSE"]).optional().default(""),
  tipoImovel: text(40).optional().default("TODOS"),
  quartosMin: z.enum(["", "2", "3", "4"]).optional().default(""),
});

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
    // Regras de Simulação de Crédito (Item 27)
    simuladorTaxaAnual: z.number().min(0.01).max(0.5).default(0.105),
    simuladorPrazoMeses: z.number().int().min(12).max(480).default(360),
    simuladorComprometimento: z.number().min(0.05).max(0.7).default(0.3),
    simuladorEntradaMinima: z.number().min(0.05).max(0.9).default(0.2),
    // Sobre Nós Editável (Item 28)
    sobreTitulo: text(160).optional(),
    sobreSubtitulo: text(300).optional(),
    sobreTexto: text(2000).optional(),
    sobreEstatistica1Valor: text(50).optional(),
    sobreEstatistica1Rotulo: text(100).optional(),
    sobreEstatistica2Valor: text(50).optional(),
    sobreEstatistica2Rotulo: text(100).optional(),
    sobreEstatistica3Valor: text(50).optional(),
    sobreEstatistica3Rotulo: text(100).optional(),
    sobreEstatistica4Valor: text(50).optional(),
    sobreEstatistica4Rotulo: text(100).optional(),
    // Tipos customizados de imóveis (Item 29)
    customPropertyTypes: z.array(z.string().trim().max(60)).max(20).optional(),
    // Vitrine de Capítulos / Categorias editável com imóveis reais
    vitrineSubtitulo: text(160).optional(),
    vitrineTitulo: text(200).optional(),
    vitrineCards: z.array(VitrineCardSchema).max(12).optional(),
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
  simuladorTaxaAnual: 0.105,
  simuladorPrazoMeses: 360,
  simuladorComprometimento: 0.3,
  simuladorEntradaMinima: 0.2,
  sobreTitulo: "POR QUE A CONNECT PLATZ?",
  sobreSubtitulo: "Comprar, vender ou alugar é uma decisão importante. Você merece a confiança de quem conhece a região.",
  sobreTexto: "Somos especialistas no mercado imobiliário do Ceará, com atuação focada em lançamentos, revendas e aluguel de temporada nas melhores praias do litoral.",
  sobreEstatistica1Valor: "120+",
  sobreEstatistica1Rotulo: "imóveis ativos",
  sobreEstatistica2Valor: "8",
  sobreEstatistica2Rotulo: "cidades do Ceará",
  sobreEstatistica3Valor: "45+",
  sobreEstatistica3Rotulo: "temporada no litoral",
  sobreEstatistica4Valor: "7 dias",
  sobreEstatistica4Rotulo: "atendimento por semana",
  customPropertyTypes: ["Apartamento", "Casa", "Cobertura", "Casa de praia", "Chácara"],
  vitrineSubtitulo: DEFAULT_VITRINE_SUBTITULO,
  vitrineTitulo: DEFAULT_VITRINE_TITULO,
  vitrineCards: [],
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
      { status: 200, headers: { "Cache-Control": session ? "private, no-store" : "public, s-maxage=5, stale-while-revalidate=30" } }
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

    const changed = Object.keys(patch).filter(
      (k) => JSON.stringify((before as any)[k]) !== JSON.stringify((merged as any)[k])
    );
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

    try {
      revalidatePath("/");
    } catch (revalErr) {
      console.warn("Falha ao revalidar cache do site:", revalErr);
    }

    return NextResponse.json({ success: true, settings: merged }, { status: 200 });
  } catch (error) {
    console.error("Erro ao salvar configurações do site:", error);
    return NextResponse.json({ error: "Erro ao salvar configurações do site." }, { status: 500 });
  }
}
