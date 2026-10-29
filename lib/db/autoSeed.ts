import { prisma } from "./prisma";
import { Role, CorretorStatus, PropertyModality, PriceRange } from "@prisma/client";
import { hashPassword } from "../auth/password";
import { businessDay } from "../utils/businessDay";

export async function ensureInitialSeed(): Promise<{ seeded: boolean; message: string }> {
  // Verifica se o administrador principal já está cadastrado
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "robson@connectplatz.com.br" },
    select: { id: true, email: true },
  });

  if (existingAdmin) {
    return { seeded: false, message: "Base já inicializada com Robson Carvalho." };
  }

  console.log("🌱 Executando auto-seed inicial Connect Platz...");

  // 1. Organização Oficial
  const org = await prisma.organization.upsert({
    where: { slug: "connect-platz" },
    update: {},
    create: {
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

  // 2. Senha padrão segura com Bcrypt
  const defaultPasswordHash = await hashPassword("ConnectPlatz2026@");

  // 3. Administrador Geral (Robson Carvalho)
  await prisma.user.upsert({
    where: { email: "robson@connectplatz.com.br" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      organizationId: org.id,
      nome: "Robson Carvalho",
      email: "robson@connectplatz.com.br",
      passwordHash: defaultPasswordHash,
      role: Role.ADMINISTRADOR,
      status: CorretorStatus.DISPONIVEL,
      telefone: "(85) 99999-0001",
    },
  });

  // 4. Corretores de Exemplo com Check-in diário
  const corretoresData = [
    { nome: "Lucas Santos", email: "lucas.corretor@connectplatz.com.br", telefone: "(85) 98888-1001", creci: "12345-F" },
    { nome: "Mariana Oliveira", email: "mariana.corretor@connectplatz.com.br", telefone: "(85) 98888-1002", creci: "23456-F" },
    { nome: "Rafael Mendes", email: "rafael.corretor@connectplatz.com.br", telefone: "(85) 98888-1003", creci: "34567-F" },
  ];

  const today = businessDay();
  for (const c of corretoresData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: { passwordHash: defaultPasswordHash },
      create: {
        organizationId: org.id,
        nome: c.nome,
        email: c.email,
        passwordHash: defaultPasswordHash,
        role: Role.CORRETOR_VENDA,
        status: CorretorStatus.DISPONIVEL,
        telefone: c.telefone,
        creci: c.creci,
        lastLeadAssignedAt: new Date(),
      },
    });

    await prisma.checkIn.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      update: {},
      create: { userId: user.id, date: today },
    });
  }

  // 5. Funil Padrão e Etapas com SLA
  let funnel = await prisma.funnel.findFirst({
    where: { organizationId: org.id, nome: "Funil de Vendas Imobiliárias" },
  });

  if (!funnel) {
    funnel = await prisma.funnel.create({
      data: {
        organizationId: org.id,
        nome: "Funil de Vendas Imobiliárias",
        isDefault: true,
      },
    });

    const stages = [
      { nome: "Novo Lead", posicao: 1, cor: "#1266C7", slaMinutes: 20, actionOnExpire: "transbordo" },
      { nome: "Primeiro Contato", posicao: 2, cor: "#0D478F", slaMinutes: 120, actionOnExpire: "bolsao" },
      { nome: "Visita Agendada", posicao: 3, cor: "#D9BB4C", slaMinutes: 2880, actionOnExpire: "notificar" },
      { nome: "Proposta Enviada", posicao: 4, cor: "#F59E0B", slaMinutes: 1440, actionOnExpire: "notificar" },
      { nome: "Análise de Crédito", posicao: 5, cor: "#8B5CF6", slaMinutes: 4320, actionOnExpire: "notificar" },
      { nome: "Fechado / Ganho", posicao: 6, cor: "#10B981", slaMinutes: null, actionOnExpire: "none" },
      { nome: "Encerrado", posicao: 7, cor: "#64748B", slaMinutes: null, actionOnExpire: "none" },
    ];

    for (const stage of stages) {
      await prisma.funnelStage.create({
        data: {
          funnelId: funnel.id,
          nome: stage.nome,
          posicao: stage.posicao,
          cor: stage.cor,
          slaMinutes: stage.slaMinutes,
          actionOnExpire: stage.actionOnExpire,
        },
      });
    }
  }

  // 6. Catálogo de Imóveis Principais
  const sampleProperties = [
    {
      nome: "Villa Platz Beach Residence",
      slug: "villa-platz-beach-residence",
      modalidade: PropertyModality.VERANEIO_TEMPORADA,
      faixaPreco: PriceRange.LUXO_FRENTE_MAR,
      valorDiaria: 1200.0,
      valorVenda: null,
      taxaLimpeza: 250.0,
      cidade: "Aquiraz",
      estado: "CE",
      bairro: "Porto das Dunas",
      endereco: "Av. Caminho do Sol, 400 - Porto das Dunas",
      descricao: "Magnífica casa pé na areia com 5 suítes climatizadas, piscina de borda infinita, churrasqueira e deck privativo a poucos metros do Beach Park.",
      caracteristicas: { quartos: 5, suites: 5, banheiros: 6, vagas: 4, area_m2: 450 },
      diferenciais: ["Pé na areia", "Piscina Privativa", "Churrasqueira", "Wi-Fi 500MB", "Ar Condicionado"],
      fotos: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      nome: "Edifício Platinum Meireles",
      slug: "edificio-platinum-meireles",
      modalidade: PropertyModality.VENDA,
      faixaPreco: PriceRange.ALTO_PADRAO,
      valorDiaria: null,
      valorVenda: 1850000.0,
      taxaLimpeza: null,
      cidade: "Fortaleza",
      estado: "CE",
      bairro: "Meireles",
      endereco: "Rua Silva Jatahy, 800 - Meireles",
      descricao: "Apartamento de alto padrão no quadrilátero nobre do Meireles com varanda gourmet integrada, 4 suítes plenas e vista mar definitiva.",
      caracteristicas: { quartos: 4, suites: 4, banheiros: 5, vagas: 3, area_m2: 178 },
      diferenciais: ["Vista Mar", "Pronto para Morar", "Varanda Gourmet", "Piscina com Raia", "Academia"],
      fotos: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      nome: "Residencial Jardins de Platz",
      slug: "residencial-jardins-de-platz",
      modalidade: PropertyModality.VENDA,
      faixaPreco: PriceRange.MEDIO,
      valorDiaria: null,
      valorVenda: 720000.0,
      taxaLimpeza: null,
      cidade: "Fortaleza",
      estado: "CE",
      bairro: "Aldeota",
      endereco: "Rua Vicente Leite, 1200 - Aldeota",
      descricao: "Lançamento exclusivo com plantas modernas de 3 quartos, área de lazer completa entregue equipada e decorada.",
      caracteristicas: { quartos: 3, suites: 2, banheiros: 3, vagas: 2, area_m2: 95 },
      diferenciais: ["Lançamento", "Financiamento Facilitado", "Área de Lazer", "Coworking", "Pet Place"],
      fotos: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  ];

  for (const p of sampleProperties) {
    await prisma.property.upsert({
      where: {
        organizationId_slug: {
          organizationId: org.id,
          slug: p.slug,
        },
      },
      update: {
        nome: p.nome,
        modalidade: p.modalidade,
        faixaPreco: p.faixaPreco,
        valorDiaria: p.valorDiaria,
        valorVenda: p.valorVenda,
        taxaLimpeza: p.taxaLimpeza,
        cidade: p.cidade,
        estado: p.estado,
        bairro: p.bairro,
        endereco: p.endereco,
        descricao: p.descricao,
        caracteristicas: p.caracteristicas,
        diferenciais: p.diferenciais,
        fotos: p.fotos,
      },
      create: {
        organizationId: org.id,
        nome: p.nome,
        slug: p.slug,
        modalidade: p.modalidade,
        faixaPreco: p.faixaPreco,
        valorDiaria: p.valorDiaria,
        valorVenda: p.valorVenda,
        taxaLimpeza: p.taxaLimpeza,
        cidade: p.cidade,
        estado: p.estado,
        bairro: p.bairro,
        endereco: p.endereco,
        descricao: p.descricao,
        caracteristicas: p.caracteristicas,
        diferenciais: p.diferenciais,
        fotos: p.fotos,
      },
    });
  }

  console.log("✅ Auto-seed concluído com sucesso!");
  return { seeded: true, message: "Seed inicial executado com sucesso." };
}
