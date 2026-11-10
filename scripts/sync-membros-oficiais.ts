// scripts/sync-membros-oficiais.ts
// Sincroniza os 7 membros oficiais do Connect Platz CRM e remove usuários legados de teste.

import { PrismaClient, Role, CorretorStatus } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";
import { businessDay } from "../lib/utils/businessDay";

const prisma = new PrismaClient();

const OFICIAIS = [
  {
    nome: "Admin Geral",
    email: "admin@connectplatz.com.br",
    role: Role.ADMINISTRADOR,
    telefone: "(85) 99999-0001",
    creci: "00001-J",
  },
  {
    nome: "Robson Carvalho",
    email: "admin.venda@connectplatz.com.br",
    role: Role.ADMINISTRADOR_VENDA,
    telefone: "(85) 99999-0010",
    creci: "00002-J",
  },
  {
    nome: "Pietro",
    email: "admin.aluguel@connectplatz.com.br",
    role: Role.ADMINISTRADOR_ALUGUEL,
    telefone: "(85) 99999-0020",
    creci: "00003-J",
  },
  {
    nome: "Bianca",
    email: "financeiro.venda@connectplatz.com.br",
    role: Role.FINANCEIRO_VENDA,
    telefone: "(85) 99999-0002",
    creci: null,
  },
  {
    nome: "Mikaelly",
    email: "financeiro.aluguel@connectplatz.com.br",
    role: Role.FINANCEIRO_ALUGUEL,
    telefone: "(85) 99999-0003",
    creci: null,
  },
  {
    nome: "Lucas Santos",
    email: "corretor.venda@connectplatz.com.br",
    role: Role.CORRETOR_VENDA,
    telefone: "(85) 98888-1001",
    creci: "12345-F",
  },
  {
    nome: "Juliana Paes",
    email: "corretor.aluguel@connectplatz.com.br",
    role: Role.CORRETOR_ALUGUEL,
    telefone: "(85) 98888-2001",
    creci: "98765-F",
  },
];

async function main() {
  console.log("🚀 Sincronizando os 7 membros oficiais do Connect Platz...");

  // 1. Organização
  let org = await prisma.organization.findFirst({
    where: { slug: "connect-platz" },
  });

  if (!org) {
    org = await prisma.organization.findFirst();
  }

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

  const defaultPasswordHash = await hashPassword("ConnectPlatz2026@");
  const today = businessDay();
  const officialEmails = OFICIAIS.map((u) => u.email.toLowerCase());

  // 2. Upsert dos 5 membros oficiais
  for (const item of OFICIAIS) {
    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {
        nome: item.nome,
        role: item.role,
        passwordHash: defaultPasswordHash,
        status: CorretorStatus.DISPONIVEL,
        telefone: item.telefone,
        creci: item.creci,
        isActive: true,
      },
      create: {
        organizationId: org.id,
        nome: item.nome,
        email: item.email,
        passwordHash: defaultPasswordHash,
        role: item.role,
        status: CorretorStatus.DISPONIVEL,
        telefone: item.telefone,
        creci: item.creci,
        isActive: true,
        lastLeadAssignedAt: new Date(),
      },
    });

    // Check-in diário para corretores ficarem aptos na roleta
    if (item.role === Role.CORRETOR_VENDA || item.role === Role.CORRETOR_ALUGUEL) {
      await prisma.checkIn.upsert({
        where: { userId_date: { userId: user.id, date: today } },
        update: {},
        create: { userId: user.id, date: today },
      });
    }

    console.log(`✅ [${item.role}] ${item.nome} (${item.email}) sincronizado com sucesso.`);
  }

  // 3. Remover ou inativar contas antigas de teste (ex: Mariana Oliveira, Rafael Mendes)
  const legacyUsers = await prisma.user.findMany({
    where: {
      organizationId: org.id,
      email: { notIn: officialEmails },
    },
    include: {
      _count: { select: { leads: true, salesAsTitular: true, rentalContractsAsTitular: true } },
    },
  });

  for (const legacy of legacyUsers) {
    if (
      legacy._count.leads === 0 &&
      legacy._count.salesAsTitular === 0 &&
      legacy._count.rentalContractsAsTitular === 0
    ) {
      await prisma.appointment.deleteMany({ where: { userId: legacy.id } });
      await prisma.checkIn.deleteMany({ where: { userId: legacy.id } });
      await prisma.user.delete({ where: { id: legacy.id } });
      console.log(`🗑️ Usuário de teste removido: ${legacy.nome} (${legacy.email})`);
    } else {
      await prisma.user.update({
        where: { id: legacy.id },
        data: { isActive: false, status: CorretorStatus.OFFLINE },
      });
      console.log(`⚠️ Usuário inativado (possui vínculos): ${legacy.nome} (${legacy.email})`);
    }
  }

  console.log("\n🎉 Concluído com sucesso! Os 7 perfis estão prontos para login com a senha: ConnectPlatz2026@");
}

main()
  .catch((err) => {
    console.error("❌ Erro ao sincronizar membros:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
