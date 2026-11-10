"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// lib/utils/businessDay.ts
var BUSINESS_TIMEZONE = "America/Fortaleza";
function businessDay(at = /* @__PURE__ */ new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(at);
  return /* @__PURE__ */ new Date(`${parts}T00:00:00.000Z`);
}

// prisma/seed.ts
var import_client = require("@prisma/client");

// lib/auth/password.ts
var import_bcryptjs = __toESM(require("bcryptjs"));
var DEFAULT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 12;
async function hashPassword(plainTextPassword) {
  if (!plainTextPassword || plainTextPassword.length < 6) {
    throw new Error("A senha deve conter no m\xEDnimo 6 caracteres.");
  }
  const salt = await import_bcryptjs.default.genSalt(DEFAULT_SALT_ROUNDS);
  return import_bcryptjs.default.hash(plainTextPassword, salt);
}

// prisma/seed.ts
var prisma = new import_client.PrismaClient();
async function main() {
  console.log("Iniciando seed de dados Connect Platz...");
  const org = await prisma.organization.upsert({
    where: { slug: "connect-platz" },
    update: {},
    create: {
      nome: "Connect Platz Imobili\xE1ria",
      slug: "connect-platz",
      cnpj: "53.758.699/0001-10",
      creci: "023456-J",
      primaryColor: "#1266C7",
      secondaryColor: "#D9BB4C",
      bolsaoEnabled: true,
      bolsaoTimeoutMin: 20,
      operatingStart: "09:00",
      operatingEnd: "22:00"
    }
  });
  console.log(`Organiza\xE7\xE3o: ${org.nome} (${org.id})`);
  const defaultPasswordHash = await hashPassword("ConnectPlatz2026@");
  const officialUsers = [
    { nome: "Admin Geral", email: "admin@connectplatz.com.br", role: import_client.Role.ADMINISTRADOR, telefone: "(85) 99999-0001", creci: "00001-J" },
    { nome: "Robson Carvalho", email: "admin.venda@connectplatz.com.br", role: import_client.Role.ADMINISTRADOR_VENDA, telefone: "(85) 99999-0010", creci: "00002-J" },
    { nome: "Pietro", email: "admin.aluguel@connectplatz.com.br", role: import_client.Role.ADMINISTRADOR_ALUGUEL, telefone: "(85) 99999-0020", creci: "00003-J" },
    { nome: "Bianca", email: "financeiro.venda@connectplatz.com.br", role: import_client.Role.FINANCEIRO_VENDA, telefone: "(85) 99999-0002", creci: null },
    { nome: "Mikaelly", email: "financeiro.aluguel@connectplatz.com.br", role: import_client.Role.FINANCEIRO_ALUGUEL, telefone: "(85) 99999-0003", creci: null },
    { nome: "Lucas Santos", email: "corretor.venda@connectplatz.com.br", role: import_client.Role.CORRETOR_VENDA, telefone: "(85) 98888-1001", creci: "12345-F" },
    { nome: "Juliana Paes", email: "corretor.aluguel@connectplatz.com.br", role: import_client.Role.CORRETOR_ALUGUEL, telefone: "(85) 98888-2001", creci: "98765-F" }
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
        status: import_client.CorretorStatus.DISPONIVEL,
        telefone: u.telefone,
        creci: u.creci,
        isActive: true,
        lastLeadAssignedAt: /* @__PURE__ */ new Date()
      }
    });
    if (u.role === import_client.Role.CORRETOR_VENDA || u.role === import_client.Role.CORRETOR_ALUGUEL) {
      await prisma.checkIn.upsert({
        where: { userId_date: { userId: user.id, date: today } },
        update: {},
        create: { userId: user.id, date: today }
      });
    }
    console.log(`Perfil oficial ativo [${u.role}]: ${user.nome} (${user.email})`);
  }
  const ensureFunnel = async (nome, modalidade, stages) => {
    const existing = await prisma.funnel.findFirst({ where: { organizationId: org.id, modalidade } });
    if (existing) return;
    const created = await prisma.funnel.create({
      data: { organizationId: org.id, nome, modalidade, isDefault: true }
    });
    for (const s of stages) {
      await prisma.funnelStage.create({ data: { funnelId: created.id, ...s } });
    }
  };
  await ensureFunnel("Funil de Vendas Imobili\xE1rias", import_client.BusinessModality.VENDA, [
    { nome: "Novo Lead", posicao: 1, cor: "#1266C7", slaMinutes: 20, actionOnExpire: "transbordo" },
    { nome: "Primeiro Contato", posicao: 2, cor: "#0D478F", slaMinutes: 120, actionOnExpire: "bolsao" },
    { nome: "An\xE1lise de Cr\xE9dito", posicao: 3, cor: "#8B5CF6", slaMinutes: 4320, actionOnExpire: "notificar" },
    { nome: "Visita Agendada", posicao: 4, cor: "#D9BB4C", slaMinutes: 2880, actionOnExpire: "notificar" },
    { nome: "Proposta Enviada", posicao: 5, cor: "#F59E0B", slaMinutes: 1440, actionOnExpire: "notificar" },
    { nome: "Fechado / Ganho", posicao: 6, cor: "#10B981", slaMinutes: null, actionOnExpire: "none" },
    { nome: "Encerrado", posicao: 7, cor: "#64748B", slaMinutes: null, actionOnExpire: "none" }
  ]);
  await ensureFunnel("Funil de Loca\xE7\xF5es & Temporada", import_client.BusinessModality.ALUGUEL, [
    { nome: "Novo Lead Loca\xE7\xE3o", posicao: 1, cor: "#1266C7", slaMinutes: 20, actionOnExpire: "transbordo" },
    { nome: "Contato Inicial", posicao: 2, cor: "#0D478F", slaMinutes: 120, actionOnExpire: "bolsao" },
    { nome: "Visita ao Im\xF3vel", posicao: 3, cor: "#D9BB4C", slaMinutes: 2880, actionOnExpire: "notificar" },
    { nome: "An\xE1lise de Ficha & Garantia", posicao: 4, cor: "#8B5CF6", slaMinutes: 1440, actionOnExpire: "notificar" },
    { nome: "Contrato / Reserva Fechada", posicao: 5, cor: "#10B981", slaMinutes: null, actionOnExpire: "none" },
    { nome: "Perdido / Cancelado", posicao: 6, cor: "#64748B", slaMinutes: null, actionOnExpire: "none" }
  ]);
  const propertiesData = [
    {
      nome: "Villa Platz Beach Residence",
      slug: "villa-platz-beach-residence",
      modalidade: import_client.PropertyModality.VERANEIO_TEMPORADA,
      faixaPreco: import_client.PriceRange.LUXO_FRENTE_MAR,
      valorDiaria: 1200,
      valorVenda: null,
      taxaLimpeza: 250,
      cidade: "Aquiraz",
      estado: "CE",
      bairro: "Porto das Dunas",
      endereco: "Av. Caminho do Sol, 400 - Porto das Dunas",
      descricao: "Magn\xEDfica casa p\xE9 na areia com 5 su\xEDtes climatizadas, piscina de borda infinita, churrasqueira e deck privativo a poucos metros do Beach Park.",
      caracteristicas: { quartos: 5, suites: 5, banheiros: 6, vagas: 4, area_m2: 450 },
      diferenciais: ["P\xE9 na areia", "Piscina Privativa", "Churrasqueira", "Wi-Fi 500MB", "Ar Condicionado"],
      fotos: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      nome: "Edif\xEDcio Platinum Meireles",
      slug: "edificio-platinum-meireles",
      modalidade: import_client.PropertyModality.VENDA,
      faixaPreco: import_client.PriceRange.ALTO_PADRAO,
      valorDiaria: null,
      valorVenda: 185e4,
      taxaLimpeza: null,
      cidade: "Fortaleza",
      estado: "CE",
      bairro: "Meireles",
      endereco: "Rua Silva Jatahy, 800 - Meireles",
      descricao: "Apartamento de alto padr\xE3o no quadril\xE1tero nobre do Meireles com varanda gourmet integrada, 4 su\xEDtes plenas e vista mar definitiva.",
      caracteristicas: { quartos: 4, suites: 4, banheiros: 5, vagas: 3, area_m2: 178 },
      diferenciais: ["Vista Mar", "Pronto para Morar", "Varanda Gourmet", "Piscina com Raia", "Academia"],
      fotos: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      nome: "Residencial Jardins de Platz",
      slug: "residencial-jardins-de-platz",
      modalidade: import_client.PropertyModality.VENDA,
      faixaPreco: import_client.PriceRange.MEDIO,
      valorDiaria: null,
      valorVenda: 72e4,
      taxaLimpeza: null,
      cidade: "Fortaleza",
      estado: "CE",
      bairro: "Aldeota",
      endereco: "Rua Vicente Leite, 1200 - Aldeota",
      descricao: "Lan\xE7amento exclusivo com plantas modernas de 3 quartos, \xE1rea de lazer completa entregue equipada e decorada.",
      caracteristicas: { quartos: 3, suites: 2, banheiros: 3, vagas: 2, area_m2: 95 },
      diferenciais: ["Lan\xE7amento", "Financiamento Facilitado", "\xC1rea de Lazer", "Coworking", "Pet Place"],
      fotos: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      nome: "Casa Mandara Beach Resort",
      slug: "casa-mandara-beach-resort",
      modalidade: import_client.PropertyModality.VERANEIO_TEMPORADA,
      faixaPreco: import_client.PriceRange.LUXO_FRENTE_MAR,
      valorDiaria: 1600,
      valorVenda: null,
      taxaLimpeza: 300,
      cidade: "Aquiraz",
      estado: "CE",
      bairro: "Praia do Jap\xE3o",
      endereco: "Rodovia CE-025 - Praia do Jap\xE3o",
      descricao: "Casa de luxo em resort fechado p\xE9 na areia com complexo aqu\xE1tico, seguran\xE7a armada 24h e restaurante exclusivo.",
      caracteristicas: { quartos: 4, suites: 4, banheiros: 5, vagas: 3, area_m2: 320 },
      diferenciais: ["Resort Fechado", "Acesso \xE0 Praia", "Clube Completo", "Quadras de T\xEAnis"],
      fotos: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      nome: "Mans\xE3o Alphaville Eus\xE9bio",
      slug: "mansao-alphaville-eusebio",
      modalidade: import_client.PropertyModality.VENDA,
      faixaPreco: import_client.PriceRange.ALTO_PADRAO,
      valorDiaria: null,
      valorVenda: 24e5,
      taxaLimpeza: null,
      cidade: "Eus\xE9bio",
      estado: "CE",
      bairro: "Alphaville",
      endereco: "Av. Alphaville, Lote 15 - Eus\xE9bio",
      descricao: "Mans\xE3o duplex contempor\xE2nea com energia solar instalada, piscina aquecida privativa, automa\xE7\xE3o residencial e paisagismo assinado.",
      caracteristicas: { quartos: 4, suites: 4, banheiros: 6, vagas: 4, area_m2: 410 },
      diferenciais: ["Energia Solar", "Piscina Aquecida", "Seguran\xE7a 24h", "Automa\xE7\xE3o Residencial"],
      fotos: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      nome: "Cobertura Beira Mar Fortaleza",
      slug: "cobertura-beira-mar-fortaleza",
      modalidade: import_client.PropertyModality.VENDA,
      faixaPreco: import_client.PriceRange.LUXO_FRENTE_MAR,
      valorDiaria: null,
      valorVenda: 39e5,
      taxaLimpeza: null,
      cidade: "Fortaleza",
      estado: "CE",
      bairro: "Mucuripe",
      endereco: "Av. Beira Mar, 4200 - Mucuripe",
      descricao: "Cobertura duplex cinematogr\xE1fica com vista panor\xE2mica de toda a orla de Fortaleza, piscina privativa e acabamentos em m\xE1rmore importado.",
      caracteristicas: { quartos: 4, suites: 4, banheiros: 6, vagas: 4, area_m2: 380 },
      diferenciais: ["Frente Mar Absoluta", "Piscina Privativa", "Luxo", "Vista Panor\xE2mica"],
      fotos: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      nome: "Villa Cumbuco Kitesurf Paradise",
      slug: "villa-cumbuco-kitesurf-paradise",
      modalidade: import_client.PropertyModality.VERANEIO_TEMPORADA,
      faixaPreco: import_client.PriceRange.ALTO_PADRAO,
      valorDiaria: 950,
      valorVenda: null,
      taxaLimpeza: 200,
      cidade: "Caucaia",
      estado: "CE",
      bairro: "Cumbuco",
      endereco: "Praia do Cumbuco, 350",
      descricao: "Casa de praia ideal para praticantes de kitesurf e fam\xEDlias, com gramado amplo, piscina e sa\xEDda direta para as dunas e praia.",
      caracteristicas: { quartos: 4, suites: 3, banheiros: 4, vagas: 3, area_m2: 280 },
      diferenciais: ["P\xE9 na areia", "Guarderia de Kitesurf", "Piscina", "Churrasqueira"],
      fotos: [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      nome: "Platz Business Tower",
      slug: "platz-business-tower",
      modalidade: import_client.PropertyModality.VENDA,
      faixaPreco: import_client.PriceRange.MEDIO,
      valorDiaria: null,
      valorVenda: 45e4,
      taxaLimpeza: null,
      cidade: "Fortaleza",
      estado: "CE",
      bairro: "Coc\xF3",
      endereco: "Av. Santos Dumont, 5500 - Coc\xF3",
      descricao: "Salas comerciais inteligentes e corporativas em frente ao Parque do Coc\xF3 com heliponto, audit\xF3rio e estacionamento rotativo.",
      caracteristicas: { quartos: 1, suites: 0, banheiros: 1, vagas: 1, area_m2: 45 },
      diferenciais: ["Salas Comerciais", "Heliponto", "Estacionamento Rotativo", "Audit\xF3rio"],
      fotos: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
      ]
    }
  ];
  const existingProperties = await prisma.property.count({ where: { organizationId: org.id } });
  if (existingProperties === 0) {
    for (const p of propertiesData) {
      await prisma.property.upsert({
        where: {
          organizationId_slug: {
            organizationId: org.id,
            slug: p.slug
          }
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
          fotos: p.fotos
        }
      });
      console.log(`Im\xF3vel cadastrado: ${p.nome} (${p.cidade} - ${p.bairro})`);
    }
  }
  console.log("Seed conclu\xEDdo com sucesso!");
}
main().catch((e) => {
  console.error("Erro no seed:", e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
