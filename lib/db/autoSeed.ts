import { prisma } from "./prisma";
import { Role, CorretorStatus, PropertyModality, PriceRange, BusinessModality } from "@prisma/client";
import { hashPassword } from "../auth/password";
import { businessDay } from "../utils/businessDay";

export async function ensureInitialSeed(): Promise<{ seeded: boolean; message: string }> {
  // Verifica se o administrador principal já está cadastrado
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@connectplatz.com.br" },
    select: { id: true, email: true },
  });

  if (existingAdmin) {
    return { seeded: false, message: "Base já inicializada com os perfis oficiais." };
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

  // 3. Os 7 Perfis Oficiais de Produção
  const officialUsers = [
    { nome: "Admin Geral", email: "admin@connectplatz.com.br", role: Role.ADMINISTRADOR, telefone: "(85) 99999-0001", creci: "00001-J" },
    { nome: "Robson Carvalho", email: "admin.venda@connectplatz.com.br", role: Role.ADMINISTRADOR_VENDA, telefone: "(85) 99999-0010", creci: "00002-J" },
    { nome: "Pietro", email: "admin.aluguel@connectplatz.com.br", role: Role.ADMINISTRADOR_ALUGUEL, telefone: "(85) 99999-0020", creci: "00003-J" },
    { nome: "Bianca", email: "financeiro.venda@connectplatz.com.br", role: Role.FINANCEIRO_VENDA, telefone: "(85) 99999-0002", creci: null },
    { nome: "Mikaelly", email: "financeiro.aluguel@connectplatz.com.br", role: Role.FINANCEIRO_ALUGUEL, telefone: "(85) 99999-0003", creci: null },
    { nome: "Lucas Santos", email: "corretor.venda@connectplatz.com.br", role: Role.CORRETOR_VENDA, telefone: "(85) 98888-1001", creci: "12345-F" },
    { nome: "Juliana Paes", email: "corretor.aluguel@connectplatz.com.br", role: Role.CORRETOR_ALUGUEL, telefone: "(85) 98888-2001", creci: "98765-F" },
  ];

  const today = businessDay();
  for (const u of officialUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { nome: u.nome, role: u.role, isActive: true },
      create: {
        organizationId: org.id,
        nome: u.nome,
        email: u.email,
        passwordHash: defaultPasswordHash,
        role: u.role,
        status: CorretorStatus.DISPONIVEL,
        telefone: u.telefone,
        creci: u.creci,
        isActive: true,
        lastLeadAssignedAt: new Date(),
      },
    });

    if (u.role === Role.CORRETOR_VENDA || u.role === Role.CORRETOR_ALUGUEL) {
      await prisma.checkIn.upsert({
        where: { userId_date: { userId: user.id, date: today } },
        update: {},
        create: { userId: user.id, date: today },
      });
    }
  }

  // 4. Funis Padrão (Vendas e Locações/Temporada)
  const ensureFunnel = async (
    nome: string,
    modalidade: BusinessModality,
    stages: { nome: string; posicao: number; cor: string; slaMinutes: number | null; actionOnExpire: string }[]
  ) => {
    const existing = await prisma.funnel.findFirst({ where: { organizationId: org.id, modalidade } });
    if (existing) return;
    const created = await prisma.funnel.create({
      data: { organizationId: org.id, nome, modalidade, isDefault: true },
    });
    for (const s of stages) {
      await prisma.funnelStage.create({ data: { funnelId: created.id, ...s } });
    }
  };

  await ensureFunnel("Funil de Vendas Imobiliárias", BusinessModality.VENDA, [
    { nome: "Novo Lead", posicao: 1, cor: "#1266C7", slaMinutes: 20, actionOnExpire: "transbordo" },
    { nome: "Primeiro Contato", posicao: 2, cor: "#0D478F", slaMinutes: 120, actionOnExpire: "bolsao" },
    { nome: "Análise de Crédito", posicao: 3, cor: "#8B5CF6", slaMinutes: 4320, actionOnExpire: "notificar" },
    { nome: "Visita Agendada", posicao: 4, cor: "#D9BB4C", slaMinutes: 2880, actionOnExpire: "notificar" },
    { nome: "Proposta Enviada", posicao: 5, cor: "#F59E0B", slaMinutes: 1440, actionOnExpire: "notificar" },
    { nome: "Fechado / Ganho", posicao: 6, cor: "#10B981", slaMinutes: null, actionOnExpire: "none" },
    { nome: "Encerrado", posicao: 7, cor: "#64748B", slaMinutes: null, actionOnExpire: "none" },
  ]);

  await ensureFunnel("Funil de Locações & Temporada", BusinessModality.ALUGUEL, [
    { nome: "Novo Lead Locação", posicao: 1, cor: "#1266C7", slaMinutes: 20, actionOnExpire: "transbordo" },
    { nome: "Contato Inicial", posicao: 2, cor: "#0D478F", slaMinutes: 120, actionOnExpire: "bolsao" },
    { nome: "Visita ao Imóvel", posicao: 3, cor: "#D9BB4C", slaMinutes: 2880, actionOnExpire: "notificar" },
    { nome: "Análise de Ficha & Garantia", posicao: 4, cor: "#8B5CF6", slaMinutes: 1440, actionOnExpire: "notificar" },
    { nome: "Contrato / Reserva Fechada", posicao: 5, cor: "#10B981", slaMinutes: null, actionOnExpire: "none" },
    { nome: "Perdido / Cancelado", posicao: 6, cor: "#64748B", slaMinutes: null, actionOnExpire: "none" },
  ]);

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

  const existingProperties = await prisma.property.count({ where: { organizationId: org.id } });
  if (existingProperties === 0) {
    for (const p of sampleProperties) {
      await prisma.property.upsert({
        where: {
          organizationId_slug: {
            organizationId: org.id,
            slug: p.slug,
          },
        },
        update: {},
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
  }

  console.log("✅ Auto-seed concluído com sucesso!");
  return { seeded: true, message: "Seed inicial executado com sucesso." };
}
