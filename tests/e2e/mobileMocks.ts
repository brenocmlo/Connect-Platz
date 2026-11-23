import fs from "node:fs";
import path from "node:path";
import jwt from "jsonwebtoken";
import type { Page } from "@playwright/test";

export function readJwtSecret(): string {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
    return process.env.JWT_SECRET;
  }
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const line = fs
      .readFileSync(envPath, "utf-8")
      .split(/\r?\n/)
      .find((l) => l.trim().startsWith("JWT_SECRET="));
    if (line) {
      return line.split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
    }
  }
  throw new Error("JWT_SECRET nao encontrado para autenticar testes E2E.");
}

export function createAdminCookie(baseURL: string) {
  const token = jwt.sign(
    {
      userId: "usr-admin",
      email: "admin@connectplatz.com.br",
      nome: "Admin Geral",
      role: "ADMINISTRADOR",
      organizationId: "org-1",
    },
    readJwtSecret(),
    { expiresIn: "2h" }
  );
  return { name: "connect_platz_token", value: token, url: baseURL };
}

const NOW_ISO = new Date().toISOString();
const IN_TWO_HOURS_ISO = new Date(Date.now() + 7200_000).toISOString();

const MOCK_USER = {
  id: "usr-admin",
  nome: "Admin Geral",
  email: "admin@connectplatz.com.br",
  telefone: "(85) 99999-0000",
  creci: "CRECI 12345-CE",
  bio: "Diretoria comercial",
  photoUrl: null,
  role: "ADMINISTRADOR",
  status: "DISPONIVEL",
  organizationId: "org-1",
  hasCheckedInToday: true,
};

const MOCK_PROPERTIES = [
  {
    id: "prop-1",
    nome: "Villa Platz Residence",
    slug: "villa-platz-residence",
    modalidade: "VENDA",
    tipoCadastro: "EMPREENDIMENTO",
    tipoImovel: "Apartamento",
    statusConstrucao: "LANCAMENTO",
    valorVenda: 850000,
    valorDiaria: null,
    valorAluguel: null,
    cidade: "Aquiraz",
    estado: "CE",
    bairro: "Porto das Dunas",
    endereco: "Av. Litoranea, 1200",
    construtora: "Platz Construtora",
    exibirNaLandingPage: true,
    isActive: true,
    fotos: [],
    caracteristicas: { quartos: 3, suites: 2, banheiros: 3, vagas: 2, area_m2: 145 },
    units: [],
  },
  {
    id: "prop-2",
    nome: "Sunset Beach Cumbuco",
    slug: "sunset-beach-cumbuco",
    modalidade: "VERANEIO_TEMPORADA",
    tipoCadastro: "IMOVEL_AVULSO",
    tipoImovel: "Casa de praia",
    statusConstrucao: "PRONTO",
    valorVenda: null,
    valorDiaria: 1200,
    valorAluguel: null,
    cidade: "Caucaia",
    estado: "CE",
    bairro: "Cumbuco",
    endereco: "Rua da Praia, 45",
    construtora: "Particular",
    exibirNaLandingPage: true,
    isActive: true,
    fotos: [],
    caracteristicas: { quartos: 4, suites: 3, banheiros: 4, vagas: 3, area_m2: 260 },
    units: [],
  },
];

const MOCK_SITE_SETTINGS = {
  heroImage: "",
  heroTitle: "Seja qual for o seu momento de vida,",
  heroHighlight: "a Connect Platz tem o imóvel certo para você.",
  heroSubtitle: "Venda e temporada no Ceará com atendimento especialista.",
  siteTitle: "Connect Platz Imóveis",
  siteSlogan: "Inteligência imobiliária",
  corretorNome: "Admin Geral",
  creci: "CRECI 12345-CE",
  whatsapp: "85999990000",
  email: "contato@connectplatz.com.br",
  pixelId: "1234567890",
  siteAtivo: true,
  themePreset: "connect-blue",
  primaryColor: "#1266C7",
  secondaryColor: "#D9BB4C",
  simuladorTaxaAnual: 0.105,
  simuladorPrazoMeses: 360,
  simuladorComprometimento: 0.3,
  simuladorEntradaMinima: 0.2,
  sobreTitulo: "POR QUE A CONNECT PLATZ?",
  sobreSubtitulo: "Atendimento completo em lançamentos e temporada.",
  sobreTexto: "Curadoria de imóveis de alto padrão no Ceará.",
  sobreEstatistica1Valor: "120+",
  sobreEstatistica1Rotulo: "imóveis ativos",
  sobreEstatistica2Valor: "8",
  sobreEstatistica2Rotulo: "cidades",
  sobreEstatistica3Valor: "45+",
  sobreEstatistica3Rotulo: "litoral",
  sobreEstatistica4Valor: "7 dias",
  sobreEstatistica4Rotulo: "suporte",
  customPropertyTypes: ["Apartamento", "Casa", "Cobertura"],
  vitrineSubtitulo: "Seleção exclusiva",
  vitrineTitulo: "Imóveis para cada estilo",
  vitrineCards: [],
};

const DASHBOARD_DATA = {
  period: { key: "mes", label: "Mês atual" },
  scope: "organizacao",
  financial: {
    vgvTotal: 2550000,
    totalSales: 3,
    averageTicket: 850000,
    commissionReceived: 127500,
    commissionPaid: 65000,
    commissionPending: 25000,
    trends: {
      vgvTotal: 14.2,
      totalSales: 20,
      averageTicket: 5.5,
      commissionReceived: 12,
      commissionPaid: 8,
      commissionPending: -5,
    },
  },
  cashFlow: { inflow: 150000, outflow: 42000, balance: 108000 },
  operational: {
    docs: { total: 8, emAnalise: 3, aprovadas: 4, reprovadas: 1 },
    visits: { scheduled: 6, completed: 4, total: 10, trend: 10 },
    brokers: { disponiveis: 4, ativos: 5 },
    leads: { captados: 32, hoje: 4, trend: 15 },
    conversion: { rate: 12.5, trendPoints: 1.5 },
  },
  salesSeries: {
    anual: [{ label: "Jan", vgv: 850000, vendas: 1 }, { label: "Fev", vgv: 1700000, vendas: 2 }],
    mensal: [{ label: "Sem 1", vgv: 850000, vendas: 1 }],
    semanal: [{ label: "Seg", vgv: 850000, vendas: 1 }],
  },
  funnels: [
    {
      id: "fun-1",
      nome: "Funil Vendas",
      totalLeads: 12,
      stages: [
        { id: "st-1", nome: "Novo Lead", cor: "#1266C7", slaMinutes: 20, count: 6, reached: 12, sharePct: 100, conversionPct: 100 },
        { id: "st-2", nome: "Atendimento", cor: "#0D9488", slaMinutes: 60, count: 4, reached: 6, sharePct: 50, conversionPct: 50 },
      ],
    },
  ],
  hotLeads: [
    { id: "lead-1", nome: "Mariana Albuquerque", telefone: "85998887766", score: 88, temperatura: "QUENTE", etapa: "Atendimento", corretor: "Lucas Vendas", atualizadoEm: NOW_ISO },
  ],
  appointments: [
    { id: "app-1", tipo: "VISITA", titulo: "Visita Villa Platz", status: "AGENDADO", inicio: NOW_ISO, fim: IN_TWO_HOURS_ISO, cliente: "Mariana Albuquerque", responsavel: "Lucas Vendas", empreendimento: "Villa Platz Residence" },
  ],
  team: { corretores: [{ id: "usr-cor1", nome: "Lucas Vendas", photoUrl: null, vendas: 3, vgv: 2550000 }] },
  activities: [{ id: "act-1", origem: "timeline", tipo: "nota", titulo: "Nota registrada", descricao: "Mariana — Interesse confirmado", autor: "Admin Geral", criadoEm: NOW_ISO }],
};

export async function mockAllApis(page: Page) {
  await page.route("**/api/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;

    if (pathname === "/api/auth/me") {
      return route.fulfill({ json: { ...MOCK_USER, user: MOCK_USER } });
    }
    if (pathname === "/api/notificacoes") {
      return route.fulfill({ json: { notifications: [{ id: "n1", title: "Novo Lead", message: "Lead recebido via Meta Ads", type: "lead", read: false, createdAt: "há 5m" }] } });
    }
    if (pathname === "/api/properties") {
      return route.fulfill({
        json: {
          properties: MOCK_PROPERTIES,
          cidades: ["Aquiraz", "Caucaia"],
          bairros: ["Porto das Dunas", "Cumbuco"],
          total: MOCK_PROPERTIES.length,
          directory: [{ cidade: "Aquiraz", estado: "CE", comprar: ["Apartamentos à venda em Aquiraz"], alugar: [], bairros: [{ nome: "Porto das Dunas", total: 1, modalidades: ["VENDA"] }] }],
        },
      });
    }
    if (pathname === "/api/site-settings") {
      return route.fulfill({ json: { success: true, settings: MOCK_SITE_SETTINGS } });
    }
    if (pathname === "/api/dashboard") return route.fulfill({ json: DASHBOARD_DATA });
    if (pathname === "/api/leads") {
      return route.fulfill({
        json: {
          funnel: { id: "fun-1", nome: "Funil Vendas", modalidade: "VENDA" },
          funnels: [{ id: "fun-1", nome: "Funil Vendas", modalidade: "VENDA" }],
          stages: [
            { id: "st-1", nome: "Novo Lead", cor: "#1266C7", posicao: 1, slaMinutes: 20 },
            { id: "st-2", nome: "Atendimento", cor: "#0D9488", posicao: 2, slaMinutes: 60 },
          ],
          leads: [
            {
              id: "lead-1", nome: "Mariana Albuquerque", email: "mariana@exemplo.com", telefone: "85998887766",
              stageId: "st-1", funnelId: "fun-1", score: 88, temperatura: "QUENTE", valorEstimado: 850000, rendaDeclarada: 22000,
              origem: "META_ADS", originLabel: "Meta Ads", campaignName: "Verão Dunas", propertyId: "prop-1", propertyName: "Villa Platz Residence",
              corretor: { id: "usr-cor1", nome: "Lucas Vendas" }, tags: [{ id: "t1", nome: "Cliente Quente", cor: "#F97316" }],
              appointmentsCount: 1, isBolsao: false, isClosed: false, createdAt: NOW_ISO, updatedAt: NOW_ISO,
            },
          ],
        },
      });
    }
    if (pathname === "/api/agenda") {
      return route.fulfill({
        json: {
          appointments: [{
            id: "app-1", tipo: "VISITA", titulo: "Visita Villa Platz", status: "AGENDADO",
            dataInicio: NOW_ISO, dataFim: IN_TWO_HOURS_ISO, lead: { id: "lead-1", nome: "Mariana Albuquerque" },
            property: { id: "prop-1", nome: "Villa Platz Residence", bairro: "Porto das Dunas" }, user: { id: "usr-cor1", nome: "Lucas Vendas" },
          }],
        },
      });
    }
    if (pathname === "/api/vendas") {
      return route.fulfill({
        json: {
          sales: [{
            id: "sale-1", codigoVenda: 86, dataVenda: NOW_ISO.slice(0, 10), compradorNome: "Mariana Albuquerque",
            imovelNome: "Villa Platz Residence", construtora: "Platz Construtora", unidadeNumero: "802",
            vgv: 850000, impostoValor: 2550, impostoPercentual: 6, proximoPagamento: NOW_ISO.slice(0, 10),
            corretorTitular: "Lucas Vendas", gestor: "Admin Geral", captador: "Lucas Vendas", comissaoTotal: 42500,
            splits: [{ id: "sp-1", beneficiarioNome: "Lucas Vendas", beneficiarioTipo: "CORRETOR_TITULAR", percentual: 50, valor: 21250, status: "PAGO" }],
          }],
        },
      });
    }
    if (pathname === "/api/bookings") {
      return route.fulfill({ json: { bookings: [{ id: "bk-1", imovelNome: "Sunset Beach Cumbuco", locatarioNome: "Carlos Silva", checkIn: NOW_ISO.slice(0, 10), checkOut: IN_TWO_HOURS_ISO.slice(0, 10), diarias: 3, valorDiaria: 1200, taxaLimpeza: 250, valorTotal: 3850, meioPagamento: "PIX", status: "CONFIRMADA" }] } });
    }
    if (pathname === "/api/rentals") {
      return route.fulfill({ json: { contracts: [{ id: "rc-1", imovelNome: "Apartamento Meireles", inquilinoNome: "Beatriz Costa", proprietarioNome: "João Souza", valorMensal: 4500, diaVencimento: 5, status: "ATIVO", inicioVigencia: NOW_ISO.slice(0, 10), fimVigencia: NOW_ISO.slice(0, 10) }] } });
    }
    if (pathname === "/api/financeiro") {
      return route.fulfill({
        json: {
          kpis: { saldoAtual: 108000, totalReceitasPagas: 150000, totalDespesasPagas: 42000, totalReceitasPendentes: 25000, totalDespesasPendentes: 8000 },
          entries: [{ id: "cf-1", tipo: "RECEITA", categoria: "Comissão de Venda", descricao: "Venda Cód 86", valor: 42500, dataVencimento: NOW_ISO.slice(0, 10), status: "PAGO", meioPagamento: "PIX", modalidade: "VENDA" }],
        },
      });
    }
    if (pathname === "/api/ranking") {
      const top = [{ id: "usr-cor1", posicao: 1, nome: "Lucas Vendas", avatar: "LV", photoUrl: null, cargo: "Corretor", vgv: 2550000, vendas: 3, visitas: 12, documentos: 5, captacoes: 2, compromissos: 10, taxaConversao: 25, leads: 12, aderenciaSla: 96, noPodio: true }];
      return route.fulfill({ json: { period: { key: "mes", label: "Mês atual" }, podium: top, fullRanking: top, highlights: [{ titulo: "Mais Vendas", icone: "leads", nome: "Lucas Vendas", avatar: "LV", metrica: "12", rotuloMetrica: "leads" }], leader: top[0], currentUserId: "usr-admin" } });
    }
    if (pathname === "/api/metas") return route.fulfill({ json: { goals: [{ id: "g1", title: "Meta VGV", targetValue: 5000000, currentValue: 2550000, period: "mes" }], canManage: true } });
    if (pathname === "/api/ranking/tv") {
      return route.fulfill({
        json: {
          organization: { nome: "Connect Platz", logoUrl: null, slogan: "War Room" },
          quote: { frase: "Consistência gera resultado.", autor: "Connect Platz" },
          period: { key: "mes", label: "Mês atual", semanaNumero: 4 },
          kpis: { vgvTotal: 2550000, ticketMedio: 850000, analisesTotal: 8, aprovacoesTotal: 5, taxaConversaoAnaliseAprovacao: 62.5, vendasTotal: 3, taxaConversaoAprovacaoVenda: 60, ipc: 0.95, totalCorretoresAtivos: 5, corretoresProdutivosPct: 80, corretoresProdutivosQtd: 4 },
          brokers: {
            analises: { items: [{ posicao: 1, corretorId: "usr-cor1", corretorNome: "Lucas Vendas", avatar: "LV", hoje: 2, mes: 8, valor: 8 }], totalHoje: 2, totalMes: 8, total: 8 },
            aprovacoes: { items: [{ posicao: 1, corretorId: "usr-cor1", corretorNome: "Lucas Vendas", avatar: "LV", hoje: 1, mes: 5, valor: 5 }], totalHoje: 1, totalMes: 5, total: 5 },
            vendas: { items: [{ posicao: 1, corretorId: "usr-cor1", corretorNome: "Lucas Vendas", avatar: "LV", vd: 3, vgv: 2550000 }], totalVd: 3, totalVgv: 2550000 },
          },
          updatedAt: NOW_ISO,
        },
      });
    }
    if (pathname === "/api/relatorios") {
      return route.fulfill({
        json: {
          period: { key: "mes", label: "Mês atual" }, scope: "organizacao", investmentAvailable: true,
          summaries: [{ id: "vgv", title: "VGV Comercial Total", shortLabel: "VGV & Vendas", value: 2550000, prefix: "R$ ", decimals: 0, changePercent: 14, changePositive: true, sublabel: "3 vendas no período", category: "Faturamento", iconName: "DollarSign" }],
          vgvSeries: { mensal: [{ label: "Nov", realizado: 2550000, anterior: 1900000 }], semanal: [{ label: "Sem 4", realizado: 850000, anterior: 500000 }], diario: [{ label: "Hoje", realizado: 850000, anterior: 0 }] },
          conversionSeries: [{ label: "Nov", realizado: 12.5, anterior: 10 }],
          commissionSeries: [{ label: "Nov", realizado: 127500, anterior: 95000 }],
          funnelVelocity: { funil: "Funil Vendas", stages: [{ etapa: "Novo Lead", cor: "#1266C7", leadsAbertos: 6, tempoHoras: 4, slaHoras: 1, taxaPassagem: 50, status: "critico" }] },
          channels: [{ canal: "Meta Ads", cor: "#1266C7", leads: 18, vendas: 2, vgv: 1700000, investimento: 5000, ticketMedio: 850000, roiMultiplicador: 340, cpl: 277.78, taxaConversao: 11.1 }],
          campaigns: [], closedLeads: [],
        },
      });
    }
    if (pathname === "/api/equipes") return route.fulfill({ json: { members: [{ id: "usr-cor1", nome: "Lucas Vendas", email: "lucas@connectplatz.com.br", role: "CORRETOR_VENDA", status: "DISPONIVEL", leadsAtivos: 8, hasCheckedInToday: true, lastLeadAssignedAt: null }], onlineCount: 1 } });
    if (pathname === "/api/integracoes/status") return route.fulfill({ json: { channels: {} } });
    if (pathname === "/api/integracoes/tracking") return route.fulfill({ json: { settings: { sitePixelId: "123", sitePixelActive: true, crmPixelId: "", crmPixelActive: false, capiToken: "", capiTestEventCode: "", ga4MeasurementId: "", ga4Active: false } } });
    if (pathname === "/api/auditoria") return route.fulfill({ json: { logs: [{ id: "au-1", dataHoraFormatada: "23/11/2026 10:00", acao: "LOGIN", tipoAcao: "LOGIN", modulo: "AUTH", detalhes: "Login realizado", ipOrigem: "127.0.0.1", dispositivo: "Chrome Mobile", usuario: { id: "usr-admin", nome: "Admin Geral", email: "admin@connectplatz.com.br", role: "ADMINISTRADOR" }, entidadeAfetada: { tipo: "User" }, timestamp: NOW_ISO }], total: 1, page: 1, pageSize: 25, totalPages: 1, stats: { total: 1, logins: 1, sensiveis: 0, usuariosComAcoes: 1 }, usuarios: [{ id: "usr-admin", nome: "Admin Geral" }] } });
    if (pathname === "/api/configuracoes/perfil") return route.fulfill({ json: { profile: MOCK_USER } });
    if (pathname === "/api/configuracoes/organizacao") return route.fulfill({ json: { organizacao: { id: "org-1", nome: "Connect Platz", slug: "connect-platz", cnpj: "12345678000199", creci: "12345-J", logoUrl: null, logoDarkUrl: null, primaryColor: "#1266C7", secondaryColor: "#D9BB4C", operatingStart: "08:00", operatingEnd: "20:00", empresa: { cidade: "Fortaleza", uf: "CE" } }, canEdit: true } });
    if (pathname === "/api/configuracoes/sla") return route.fulfill({ json: { bolsaoEnabled: true, bolsaoTimeoutMin: 30, operatingStart: "08:00", operatingEnd: "20:00", funnel: { id: "fun-1", nome: "Funil Vendas" }, stages: [{ id: "st-1", nome: "Novo Lead", posicao: 1, cor: "#1266C7", slaMinutes: 20, actionOnExpire: "bolsao" }] } });
    if (pathname === "/api/configuracoes/score") return route.fulfill({ json: { rules: { phonePoints: 10, emailPoints: 5, propertyPoints: 10, incomePoints: 15, fastResponsePoints: 15, docPoints: 10, visitPoints: 15, proposalPoints: 20, highIncomeMin: 10000, hotThreshold: 75, warmThreshold: 40 } } });

    return route.fulfill({ json: { ok: true } });
  });
}
