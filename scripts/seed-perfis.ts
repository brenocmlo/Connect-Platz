import { PrismaClient, Role, CorretorStatus, BusinessModality, LeadTemperature, LeadSource } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";
import { businessDay } from "../lib/utils/businessDay";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando cadastro de usuários de teste para cada perfil...\n");

  // 1. Organização
  let org = await prisma.organization.findFirst({
    where: { slug: "connect-platz" },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        nome: "Connect Platz Imobiliária",
        slug: "connect-platz",
        cnpj: "53.758.699/0001-10",
        creci: "023456-J",
        primaryColor: "#1266C7",
        secondaryColor: "#D9BB4C",
        bolsaoEnabled: true,
        bolsaoTimeoutMin: 20,
        operatingStart: "09:00",
        operatingEnd: "22:00",
      },
    });
  }

  const defaultPassword = "ConnectPlatz2026@";
  const defaultPasswordHash = await hashPassword(defaultPassword);

  // 2. Os 5 Usuários Oficiais
  const usersToSeed = [
    {
      nome: "Robson Carvalho (Administrador)",
      email: "admin@connectplatz.com.br",
      role: Role.ADMINISTRADOR,
      telefone: "(85) 99999-0001",
      creci: "00001-J",
    },
    {
      nome: "Beatriz Mendes (Financeiro Vendas)",
      email: "financeiro.venda@connectplatz.com.br",
      role: Role.FINANCEIRO_VENDA,
      telefone: "(85) 99999-0002",
      creci: null,
    },
    {
      nome: "Carlos Drummond (Financeiro Aluguéis)",
      email: "financeiro.aluguel@connectplatz.com.br",
      role: Role.FINANCEIRO_ALUGUEL,
      telefone: "(85) 99999-0003",
      creci: null,
    },
    {
      nome: "Lucas Santos (Corretor Vendas)",
      email: "corretor.venda@connectplatz.com.br",
      role: Role.CORRETOR_VENDA,
      telefone: "(85) 98888-1001",
      creci: "12345-F",
    },
    {
      nome: "Juliana Paes (Corretora Aluguéis)",
      email: "corretor.aluguel@connectplatz.com.br",
      role: Role.CORRETOR_ALUGUEL,
      telefone: "(85) 98888-2001",
      creci: "98765-F",
    },
  ];

  const createdUsers: Record<string, any> = {};

  for (const u of usersToSeed) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        nome: u.nome,
        role: u.role,
        passwordHash: defaultPasswordHash,
        status: CorretorStatus.DISPONIVEL,
        telefone: u.telefone,
        creci: u.creci,
      },
      create: {
        organizationId: org.id,
        nome: u.nome,
        email: u.email,
        passwordHash: defaultPasswordHash,
        role: u.role,
        status: CorretorStatus.DISPONIVEL,
        telefone: u.telefone,
        creci: u.creci,
        lastLeadAssignedAt: new Date(),
      },
    });

    createdUsers[u.role] = user;

    // Check-in diário para corretores ficarem aptos na roleta
    if (u.role === Role.CORRETOR_VENDA || u.role === Role.CORRETOR_ALUGUEL) {
      const today = businessDay();
      await prisma.checkIn.upsert({
        where: { userId_date: { userId: user.id, date: today } },
        update: {},
        create: { userId: user.id, date: today },
      });
    }

    console.log(`✅ Usuário configurado: [${u.role}] ${u.email}`);
  }

  // 3. Garantir Funil de Vendas
  let funnelVendas = await prisma.funnel.findFirst({
    where: { organizationId: org.id, modalidade: BusinessModality.VENDA },
    include: { stages: { orderBy: { posicao: "asc" } } },
  });

  if (!funnelVendas) {
    funnelVendas = await prisma.funnel.create({
      data: {
        organizationId: org.id,
        nome: "Funil de Vendas Imobiliárias",
        modalidade: BusinessModality.VENDA,
        isDefault: true,
      },
      include: { stages: true },
    });

    const stagesVendas = [
      { nome: "Novo Lead", posicao: 1, cor: "#1266C7", slaMinutes: 20 },
      { nome: "Primeiro Contato", posicao: 2, cor: "#0D478F", slaMinutes: 120 },
      { nome: "Visita Agendada", posicao: 3, cor: "#D9BB4C", slaMinutes: 2880 },
      { nome: "Proposta Enviada", posicao: 4, cor: "#F59E0B", slaMinutes: 1440 },
      { nome: "Fechado / Ganho", posicao: 5, cor: "#10B981", slaMinutes: null },
      { nome: "Perdido / Encerrado", posicao: 6, cor: "#64748B", slaMinutes: null },
    ];

    for (const s of stagesVendas) {
      await prisma.funnelStage.create({
        data: {
          funnelId: funnelVendas.id,
          nome: s.nome,
          posicao: s.posicao,
          cor: s.cor,
          slaMinutes: s.slaMinutes,
        },
      });
    }

    funnelVendas = await prisma.funnel.findUnique({
      where: { id: funnelVendas.id },
      include: { stages: { orderBy: { posicao: "asc" } } },
    });
  }

  // 4. Garantir Funil de Locações e Temporada
  let funnelAluguel = await prisma.funnel.findFirst({
    where: { organizationId: org.id, modalidade: BusinessModality.ALUGUEL },
    include: { stages: { orderBy: { posicao: "asc" } } },
  });

  if (!funnelAluguel) {
    const newFunnel = await prisma.funnel.create({
      data: {
        organizationId: org.id,
        nome: "Funil de Locações & Temporada",
        modalidade: BusinessModality.ALUGUEL,
        isDefault: true,
      },
    });

    const stagesAluguel = [
      { nome: "Novo Lead Locação", posicao: 1, cor: "#1266C7", slaMinutes: 20 },
      { nome: "Contato Inicial", posicao: 2, cor: "#0D478F", slaMinutes: 120 },
      { nome: "Visita ao Imóvel", posicao: 3, cor: "#D9BB4C", slaMinutes: 2880 },
      { nome: "Análise de Ficha & Garantia", posicao: 4, cor: "#8B5CF6", slaMinutes: 1440 },
      { nome: "Contrato / Reserva Fechada", posicao: 5, cor: "#10B981", slaMinutes: null },
      { nome: "Perdido / Cancelado", posicao: 6, cor: "#64748B", slaMinutes: null },
    ];

    for (const s of stagesAluguel) {
      await prisma.funnelStage.create({
        data: {
          funnelId: newFunnel.id,
          nome: s.nome,
          posicao: s.posicao,
          cor: s.cor,
          slaMinutes: s.slaMinutes,
        },
      });
    }

    funnelAluguel = await prisma.funnel.findUnique({
      where: { id: newFunnel.id },
      include: { stages: { orderBy: { posicao: "asc" } } },
    });
    console.log("✅ Funil de Locações & Temporada criado com sucesso!");
  }

  // 5. Criar Leads Demonstrativos
  const stageVendaNovo = funnelVendas?.stages[0];
  const stageVendaGanho = funnelVendas?.stages.find((s) => s.posicao === 5) || funnelVendas?.stages[0];
  const stageAluguelNovo = funnelAluguel?.stages[0];

  // Lead 1: Venda do Corretor Venda
  if (stageVendaNovo && funnelVendas) {
    await prisma.lead.upsert({
      where: { id: "11111111-1111-4111-a111-111111111111" },
      update: {},
      create: {
        id: "11111111-1111-4111-a111-111111111111",
        organizationId: org.id,
        funnelId: funnelVendas.id,
        stageId: stageVendaNovo.id,
        corretorId: createdUsers[Role.CORRETOR_VENDA].id,
        nome: "Dr. Eduardo Monteiro",
        telefone: "(85) 98765-4321",
        email: "eduardo.monteiro@email.com",
        modalidade: BusinessModality.VENDA,
        temperatura: LeadTemperature.QUENTE,
        source: LeadSource.META_ADS,
        observacoes: "Interesse em cobertura na Beira Mar.",
        score: 88,
      },
    });
  }

  // Lead 2: Venda Aguardando Financeiro (para testar aprovação do Financeiro Vendas)
  if (stageVendaGanho && funnelVendas) {
    await prisma.lead.upsert({
      where: { id: "22222222-2222-4222-a222-222222222222" },
      update: {},
      create: {
        id: "22222222-2222-4222-a222-222222222222",
        organizationId: org.id,
        funnelId: funnelVendas.id,
        stageId: stageVendaGanho.id,
        corretorId: createdUsers[Role.CORRETOR_VENDA].id,
        nome: "Marcos Paulo Silveira",
        telefone: "(85) 99123-8877",
        email: "marcos.paulo@email.com",
        modalidade: BusinessModality.VENDA,
        financialApprovalStatus: "PENDENTE",
        temperatura: LeadTemperature.QUENTE,
        source: LeadSource.MANUAL_CORRETOR,
        observacoes: "Proposta aceita verbalmente. Aguardando formalização e lançamento pelo Financeiro.",
        score: 95,
      },
    });
  }

  // Lead 3: Aluguel do Corretor Aluguel
  if (stageAluguelNovo && funnelAluguel) {
    await prisma.lead.upsert({
      where: { id: "33333333-3333-4333-a333-333333333333" },
      update: {},
      create: {
        id: "33333333-3333-4333-a333-333333333333",
        organizationId: org.id,
        funnelId: funnelAluguel.id,
        stageId: stageAluguelNovo.id,
        corretorId: createdUsers[Role.CORRETOR_ALUGUEL].id,
        nome: "Dra. Camila Vasconcelos",
        telefone: "(85) 98111-2233",
        email: "camila.vasconcelos@email.com",
        modalidade: BusinessModality.ALUGUEL,
        temperatura: LeadTemperature.MORNO,
        source: LeadSource.CATALOGO_SITE,
        observacoes: "Interesse em locação anual de apartamento no Meireles ou temporada no Villa Platz.",
        score: 72,
      },
    });
  }

  // 6. Lançamentos Iniciais de Fluxo de Caixa para Locações & Temporada
  const aluguelFlowsCount = await prisma.cashFlow.count({
    where: { organizationId: org.id, modalidade: BusinessModality.ALUGUEL },
  });

  if (aluguelFlowsCount === 0) {
    const today = new Date();
    await prisma.cashFlow.createMany({
      data: [
        {
          organizationId: org.id,
          tipo: "RECEITA",
          categoria: "Aluguel Veraneio",
          descricao: "Diárias Temporada • Villa Platz Beach Bangalô Coral",
          valor: 6250.0,
          dataVencimento: today,
          dataPagamento: today,
          status: "PAGO",
          meioPagamento: "PIX",
          modalidade: BusinessModality.ALUGUEL,
          centroCusto: "Temporada / Veraneio",
        },
        {
          organizationId: org.id,
          tipo: "RECEITA",
          categoria: "Taxa de Limpeza Temporada",
          descricao: "Taxa de Limpeza Check-in • Villa Platz Beach",
          valor: 250.0,
          dataVencimento: today,
          dataPagamento: today,
          status: "PAGO",
          meioPagamento: "PIX",
          modalidade: BusinessModality.ALUGUEL,
          centroCusto: "Temporada / Veraneio",
        },
        {
          organizationId: org.id,
          tipo: "DESPESA",
          categoria: "Repasse Proprietário Temporada",
          descricao: "Repasse Líquido Proprietário • Bangalô Coral",
          valor: 4800.0,
          dataVencimento: today,
          dataPagamento: today,
          status: "PAGO",
          meioPagamento: "TED",
          modalidade: BusinessModality.ALUGUEL,
          centroCusto: "Temporada / Veraneio",
        },
        {
          organizationId: org.id,
          tipo: "RECEITA",
          categoria: "Aluguel Veraneio",
          descricao: "Reserva Confirmada • Solarium Porto das Dunas",
          valor: 4000.0,
          dataVencimento: today,
          dataPagamento: today,
          status: "PAGO",
          meioPagamento: "CARTAO_CREDITO",
          modalidade: BusinessModality.ALUGUEL,
          centroCusto: "Temporada / Veraneio",
        },
        {
          organizationId: org.id,
          tipo: "RECEITA",
          categoria: "Aluguel Veraneio",
          descricao: "Reserva Prevista • Villa Cumbuco Kitesurf",
          valor: 3500.0,
          dataVencimento: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
          status: "PENDENTE",
          meioPagamento: "PIX",
          modalidade: BusinessModality.ALUGUEL,
          centroCusto: "Temporada / Veraneio",
        },
        {
          organizationId: org.id,
          tipo: "DESPESA",
          categoria: "Repasse Proprietário Temporada",
          descricao: "Repasse Previsto Proprietário • Villa Cumbuco",
          valor: 2700.0,
          dataVencimento: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12),
          status: "PENDENTE",
          meioPagamento: "TED",
          modalidade: BusinessModality.ALUGUEL,
          centroCusto: "Temporada / Veraneio",
        },
      ],
    });
  }

  console.log("\n🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
