import { PrismaClient, Role, CorretorStatus, PropertyModality, PriceRange } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed de dados Connect Platz...");

  // 1. Criar Organização Oficial
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

  console.log(`Organização: ${org.nome} (${org.id})`);

  // 2. Senha padrão segura com Bcrypt (salt rounds >= 12)
  const defaultPasswordHash = await hashPassword("ConnectPlatz2026@");

  // 3. Criar Administrador (Robson Carvalho)
  const admin = await prisma.user.upsert({
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
  console.log(`Administrador: ${admin.nome} (${admin.email})`);

  // 4. Criar Corretores de Exemplo
  const corretoresData = [
    {
      nome: "Lucas Santos",
      email: "lucas.corretor@connectplatz.com.br",
      telefone: "(85) 98888-1001",
      creci: "12345-F",
    },
    {
      nome: "Mariana Oliveira",
      email: "mariana.corretor@connectplatz.com.br",
      telefone: "(85) 98888-1002",
      creci: "23456-F",
    },
    {
      nome: "Rafael Mendes",
      email: "rafael.corretor@connectplatz.com.br",
      telefone: "(85) 98888-1003",
      creci: "34567-F",
    },
  ];

  for (const c of corretoresData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: { passwordHash: defaultPasswordHash },
      create: {
        organizationId: org.id,
        nome: c.nome,
        email: c.email,
        passwordHash: defaultPasswordHash,
        role: Role.CORRETOR,
        status: CorretorStatus.DISPONIVEL,
        telefone: c.telefone,
        creci: c.creci,
        lastLeadAssignedAt: new Date(),
      },
    });

    // Check-in de hoje para o corretor ficar disponível na roleta
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.checkIn.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      update: {},
      create: { userId: user.id, date: today },
    });

    console.log(`Corretor ativo com check-in: ${user.nome} (${user.email})`);
  }

  // 5. Criar Funil de Vendas com Etapas e SLAs
  let funnelVendas = await prisma.funnel.findFirst({
    where: { organizationId: org.id, nome: "Funil de Vendas Imobiliárias" },
  });

  if (!funnelVendas) {
    funnelVendas = await prisma.funnel.create({
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
          funnelId: funnelVendas.id,
          nome: stage.nome,
          posicao: stage.posicao,
          cor: stage.cor,
          slaMinutes: stage.slaMinutes,
          actionOnExpire: stage.actionOnExpire,
        },
      });
    }
  }

  // 6. Cadastrar Imóveis Completos para o Sistema (Puxados pela Landing Page)
  const propertiesData = [
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
    {
      nome: "Casa Mandara Beach Resort",
      slug: "casa-mandara-beach-resort",
      modalidade: PropertyModality.VERANEIO_TEMPORADA,
      faixaPreco: PriceRange.LUXO_FRENTE_MAR,
      valorDiaria: 1600.0,
      valorVenda: null,
      taxaLimpeza: 300.0,
      cidade: "Aquiraz",
      estado: "CE",
      bairro: "Praia do Japão",
      endereco: "Rodovia CE-025 - Praia do Japão",
      descricao: "Casa de luxo em resort fechado pé na areia com complexo aquático, segurança armada 24h e restaurante exclusivo.",
      caracteristicas: { quartos: 4, suites: 4, banheiros: 5, vagas: 3, area_m2: 320 },
      diferenciais: ["Resort Fechado", "Acesso à Praia", "Clube Completo", "Quadras de Tênis"],
      fotos: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      nome: "Mansão Alphaville Eusébio",
      slug: "mansao-alphaville-eusebio",
      modalidade: PropertyModality.VENDA,
      faixaPreco: PriceRange.ALTO_PADRAO,
      valorDiaria: null,
      valorVenda: 2400000.0,
      taxaLimpeza: null,
      cidade: "Eusébio",
      estado: "CE",
      bairro: "Alphaville",
      endereco: "Av. Alphaville, Lote 15 - Eusébio",
      descricao: "Mansão duplex contemporânea com energia solar instalada, piscina aquecida privativa, automação residencial e paisagismo assinado.",
      caracteristicas: { quartos: 4, suites: 4, banheiros: 6, vagas: 4, area_m2: 410 },
      diferenciais: ["Energia Solar", "Piscina Aquecida", "Segurança 24h", "Automação Residencial"],
      fotos: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      nome: "Cobertura Beira Mar Fortaleza",
      slug: "cobertura-beira-mar-fortaleza",
      modalidade: PropertyModality.VENDA,
      faixaPreco: PriceRange.LUXO_FRENTE_MAR,
      valorDiaria: null,
      valorVenda: 3900000.0,
      taxaLimpeza: null,
      cidade: "Fortaleza",
      estado: "CE",
      bairro: "Mucuripe",
      endereco: "Av. Beira Mar, 4200 - Mucuripe",
      descricao: "Cobertura duplex cinematográfica com vista panorâmica de toda a orla de Fortaleza, piscina privativa e acabamentos em mármore importado.",
      caracteristicas: { quartos: 4, suites: 4, banheiros: 6, vagas: 4, area_m2: 380 },
      diferenciais: ["Frente Mar Absoluta", "Piscina Privativa", "Luxo", "Vista Panorâmica"],
      fotos: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      nome: "Villa Cumbuco Kitesurf Paradise",
      slug: "villa-cumbuco-kitesurf-paradise",
      modalidade: PropertyModality.VERANEIO_TEMPORADA,
      faixaPreco: PriceRange.ALTO_PADRAO,
      valorDiaria: 950.0,
      valorVenda: null,
      taxaLimpeza: 200.0,
      cidade: "Caucaia",
      estado: "CE",
      bairro: "Cumbuco",
      endereco: "Praia do Cumbuco, 350",
      descricao: "Casa de praia ideal para praticantes de kitesurf e famílias, com gramado amplo, piscina e saída direta para as dunas e praia.",
      caracteristicas: { quartos: 4, suites: 3, banheiros: 4, vagas: 3, area_m2: 280 },
      diferenciais: ["Pé na areia", "Guarderia de Kitesurf", "Piscina", "Churrasqueira"],
      fotos: [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      nome: "Platz Business Tower",
      slug: "platz-business-tower",
      modalidade: PropertyModality.VENDA,
      faixaPreco: PriceRange.MEDIO,
      valorDiaria: null,
      valorVenda: 450000.0,
      taxaLimpeza: null,
      cidade: "Fortaleza",
      estado: "CE",
      bairro: "Cocó",
      endereco: "Av. Santos Dumont, 5500 - Cocó",
      descricao: "Salas comerciais inteligentes e corporativas em frente ao Parque do Cocó com heliponto, auditório e estacionamento rotativo.",
      caracteristicas: { quartos: 1, suites: 0, banheiros: 1, vagas: 1, area_m2: 45 },
      diferenciais: ["Salas Comerciais", "Heliponto", "Estacionamento Rotativo", "Auditório"],
      fotos: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  ];

  for (const p of propertiesData) {
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
    console.log(`Imóvel cadastrado/atualizado: ${p.nome} (${p.cidade} - ${p.bairro})`);
  }

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
