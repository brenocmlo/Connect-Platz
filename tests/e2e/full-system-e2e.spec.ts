import { test, expect, Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import jwt from "jsonwebtoken";

function readJwtSecret(): string {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const m = fs.readFileSync(envPath, "utf8").match(/^JWT_SECRET=(.+)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  return process.env.JWT_SECRET || "connect-platz-e2e-fallback-secret";
}

const JWT_SECRET = readJwtSecret();

const USERS = {
  ADMIN: { id: "usr-admin", nome: "Admin Geral", email: "admin@connectplatz.com.br", role: "ADMINISTRADOR", organizationId: "org-1", ativoRoleta: true, isAtivo: true, checkInHoje: false },
  CORRETOR_VENDA: { id: "usr-cv", nome: "Lucas Santos", email: "corretor.venda@connectplatz.com.br", role: "CORRETOR_VENDA", organizationId: "org-1", ativoRoleta: true, isAtivo: true, checkInHoje: true },
  CORRETOR_ALUGUEL: { id: "usr-ca", nome: "Juliana Paes", email: "corretor.aluguel@connectplatz.com.br", role: "CORRETOR_ALUGUEL", organizationId: "org-1", ativoRoleta: true, isAtivo: true, checkInHoje: true },
};

const PROPERTIES = [
  { id: "prop-1", nome: "Villa Platz Beach Residence", construtora: "Platz Incorporadora", tipo: "Casa de Praia", modalidade: "VERANEIO_TEMPORADA", statusObra: "PRONTO_PARA_MORAR", cidade: "Aquiraz", bairro: "Porto das Dunas", uf: "CE", precoAPartir: 1200, valorDiaria: 1200, quartos: 4, banheiros: 5, vagas: 4, publicadoVitrine: true, ativo: true, refCode: "REF-706832", fotos: [] },
  { id: "prop-2", nome: "Residencial Meireles Premium", construtora: "Connect Construtora", tipo: "Apartamento", modalidade: "VENDA", statusObra: "LANCAMENTO", cidade: "Fortaleza", bairro: "Meireles", uf: "CE", precoAPartir: 890000, quartos: 3, banheiros: 3, vagas: 2, publicadoVitrine: true, ativo: true, refCode: "REF-401290", fotos: [] },
];

const SITE_SETTINGS = {
  siteOnline: true,
  heroTitle: "Encontre o imóvel perfeito no Ceará",
  heroSubtitle: "Lançamentos, revendas e casas de temporada selecionadas.",
  vitrineSubtitulo: "Sua vida mudou de fase?",
  vitrineTitulo: "Encontre o imóvel certo para o próximo capítulo.",
  vitrineCards: [
    { id: "ch-1", propertyId: "prop-1", eyebrow: "PORTO DAS DUNAS • AQUIRAZ", titulo: "VILLA PLATZ BEACH RESIDENCE", tag: "TEMPORADA", foto: "" },
    { id: "ch-2", propertyId: "prop-2", eyebrow: "MEIRELES • FORTALEZA", titulo: "RESIDENCIAL MEIRELES PREMIUM", tag: "LANÇAMENTO", foto: "" },
  ],
};

function signUserCookie(user: typeof USERS.ADMIN): string {
  return jwt.sign(
    { userId: user.id, email: user.email, nome: user.nome, role: user.role, organizationId: user.organizationId },
    JWT_SECRET,
    { expiresIn: "2h" }
  );
}

async function mockCrmApis(page: Page, user: typeof USERS.ADMIN) {
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3010";
  const token = signUserCookie(user);
  await page.context().addCookies([
    { name: "connect_platz_token", value: token, url: baseUrl, httpOnly: true, sameSite: "Lax" },
  ]);

  const handlers: Record<string, unknown> = {
    "/api/auth/me": { user },
    "/api/notificacoes": { notifications: [], unreadCount: 0 },
    "/api/dashboard": {
      period: { key: "mes", label: "Mês atual" },
      scope: user.role.startsWith("CORRETOR") ? "corretor" : "organizacao",
      financial: {
        vgvTotal: 8450000,
        totalSales: 9,
        averageTicket: 938888,
        commissionReceived: 338000,
        commissionPaid: 142400,
        commissionPending: 89000,
        trends: { vgvTotal: 24.5, totalSales: 12.5, averageTicket: 8.2, commissionReceived: 18.0, commissionPaid: 10.4, commissionPending: -5.2 },
      },
      cashFlow: user.role.startsWith("CORRETOR") ? null : { balance: 284500, inflow: 412000, outflow: 127500, balanceTrend: 15.8 },
      operational: {
        docs: { total: 14, emAnalise: 5, aprovadas: 8, reprovadas: 1 },
        visits: { total: 28, agendadas: 11, realizadas: 17, trend: 14.2 },
        brokers: { disponiveis: 6, ativos: 8 },
        leads: { captados: 112, hoje: 8, trend: 19.4 },
        conversion: { rate: 8.4, trendPoints: 1.3 },
      },
      salesSeries: {
        anual: [{ label: "Nov", vgv: 890000, vendas: 1 }],
        mensal: [{ label: "Sem 1", vgv: 890000, vendas: 1 }],
        semanal: [{ label: "Seg", vgv: 890000, vendas: 1 }],
      },
      funnels: [
        {
          id: "fun-1",
          nome: "Funil Vendas Principal",
          totalLeads: 4,
          stages: [{ id: "st-1", nome: "Novo Lead", cor: "#1266C7", count: 4, conversionPct: 100 }],
        },
      ],
      hotLeads: [],
      appointments: [],
      teamPerformance: { anual: [], mensal: [], semanal: [] },
      activities: [],
    },
    "/api/leads": {
      leads: [{ id: "lead-1", nome: "Mariana Albuquerque", telefone: "85999112233", email: "mariana@email.com", stageId: "st-1", temperatura: "QUENTE", score: 92, source: "META_ADS", corretorId: user.id, corretor: { id: user.id, nome: user.nome }, isBolsao: false, slaBreached: false, createdAt: "2026-11-13T10:00:00.000Z" }],
      stages: [{ id: "st-1", nome: "Novo Lead", cor: "#1266C7", ordem: 1, slaMinutos: 20, funnelId: "fun-1" }],
      funnels: [{ id: "fun-1", nome: "Funil Vendas Principal", tipo: "VENDA" }],
      corretores: [USERS.CORRETOR_VENDA, USERS.CORRETOR_ALUGUEL],
      bolsaoCount: 0,
    },
    "/api/properties": {
      properties: PROPERTIES,
      cidades: ["Fortaleza", "Aquiraz"],
      bairros: ["Meireles", "Porto das Dunas"],
      total: PROPERTIES.length,
      directory: [{ cidade: "Fortaleza", comprar: ["Apartamento"], alugar: [], bairros: [{ nome: "Meireles", modalidades: ["VENDA"] }] }],
    },
    "/api/site-settings": { success: true, settings: SITE_SETTINGS },
    "/api/bookings": {
      bookings: [{ id: "bk-1", imovelNome: PROPERTIES[0].nome, locatarioNome: "Camila Vasconcelos", checkIn: "20/11/2026", checkOut: "25/11/2026", diarias: 5, valorDiaria: 1200, taxaLimpeza: 220, valorTotal: 6220, meioPagamento: "PIX", status: "CONFIRMADA" }],
      properties: [PROPERTIES[0]],
    },
    "/api/rentals": { contracts: [], properties: [PROPERTIES[0]] },
    "/api/vendas": { sales: [], corretores: [USERS.CORRETOR_VENDA], properties: [PROPERTIES[1]], leads: [] },
    "/api/equipe": { members: [USERS.ADMIN, USERS.CORRETOR_VENDA, USERS.CORRETOR_ALUGUEL] },
    "/api/auditoria": {
      logs: [
        {
          id: "log-1",
          dataHora: "2026-11-13T11:00:00.000Z",
          acao: "UPDATE",
          actionLabel: "Publicou imóvel na vitrine",
          modulo: "EMPREENDIMENTOS",
          detalhes: "Publicou imóvel na vitrine",
          ip: "127.0.0.1",
          usuario: { id: "usr-admin", nome: "Admin Geral", role: "ADMINISTRADOR" },
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
      stats: { total: 1, sensitive: 0, logins: 1, activeUsers: 1 },
      users: [{ id: "usr-admin", nome: "Admin Geral", role: "ADMINISTRADOR" }],
    },
  };

  await page.route("**/api/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (handlers[pathname]) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(handlers[pathname]) });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
}

test.describe("E2E Completo — Connect Platz CRM", () => {
  test("1. Portal Público exibe Vitrine de Capítulos e redireciona /crm não autenticado para /login", async ({ page }) => {
    await page.route("**/api/properties**", (r) =>
      r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ properties: PROPERTIES, cidades: ["Fortaleza", "Aquiraz"], bairros: ["Meireles", "Porto das Dunas"], total: 2, directory: [] }) })
    );
    await page.route("**/api/site-settings**", (r) =>
      r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, settings: SITE_SETTINGS }) })
    );

    await page.goto("/");
    await expect(page.getByText(/Encontre o imóvel certo para o próximo capítulo/i)).toBeVisible();
    await expect(page.getByText("VILLA PLATZ BEACH RESIDENCE").first()).toBeVisible();

    await page.goto("/crm");
    await expect(page).toHaveURL(/\/login/);
  });

  test("2. Segurança RBAC: Corretores são bloqueados de rotas administrativas e redirecionados com ?denied=true", async ({ page }) => {
    await mockCrmApis(page, USERS.CORRETOR_VENDA);
    for (const restrictedRoute of ["/crm/fluxo-de-caixa", "/crm/equipes", "/crm/integracoes", "/crm/auditoria"]) {
      await page.goto(restrictedRoute);
      await expect(page).toHaveURL(/\/crm\/leads\?denied=true/);
    }
  });

  test("3. Administrador acessa Dashboard, Editor da Vitrine de Capítulos e Auditoria", async ({ page }) => {
    await mockCrmApis(page, USERS.ADMIN);
    await page.goto("/crm", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 15000 });

    await page.getByRole("link", { name: "Empreendimentos" }).click();
    await page.getByRole("button", { name: /Configurações Site/i }).click({ timeout: 15000 });
    await page.getByRole("button", { name: /Vitrine de Capítulos/i }).click();
    await expect(page.getByRole("button", { name: /Carregar Imóveis Reais/i })).toBeVisible();

    await page.getByRole("link", { name: /Log e Auditoria/i }).click();
    await expect(page.getByText(/Log & Auditoria do Sistema/i)).toBeVisible({ timeout: 15000 });
  });

  test("4. Corretor de Vendas navega no Kanban sem menus de gestão", async ({ page }) => {
    await mockCrmApis(page, USERS.CORRETOR_VENDA);
    await page.goto("/crm/leads");
    await expect(page.getByText("Mariana Albuquerque")).toBeVisible();
    await expect(page.getByRole("link", { name: "Fluxo de Caixa" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Equipe" })).toHaveCount(0);
  });

  test("5. Corretor de Aluguel acessa Locações e Temporada com prevenção de overbooking", async ({ page }) => {
    await mockCrmApis(page, USERS.CORRETOR_ALUGUEL);
    await page.goto("/crm/temporada");
    await expect(page.getByText(/Gestão de Aluguel & Temporada/i)).toBeVisible();
    await expect(page.getByText("Camila Vasconcelos")).toBeVisible();
    await expect(page.getByText(/100% Protegido/i)).toBeVisible();
  });
});
