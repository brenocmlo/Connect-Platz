// scripts/cleanup-qa-users.ts
// Script utilitário para limpeza dos usuários temporários criados durante os testes de QA

import { prisma } from "../lib/db/prisma";

async function cleanup() {
  console.log("🧹 Iniciando limpeza de usuários temporários de teste QA...\n");

  // 1. Localiza os usuários temporários criados nos testes (padrão .qa. ou nome com QA)
  const qaUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: ".qa." } },
        { nome: { contains: "QA" } },
      ],
    },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
    },
  });

  if (qaUsers.length === 0) {
    console.log("✅ Nenhum usuário temporário de QA encontrado no banco de dados.");
    return;
  }

  console.log(`Encontrados ${qaUsers.length} usuários temporários de QA para remoção:`);
  for (const u of qaUsers) {
    console.log(` - [${u.role}] ${u.nome} (${u.email})`);
  }

  const ids = qaUsers.map((u) => u.id);

  // 2. Limpa quaisquer vínculos (check-ins, compromissos ou leads órfãos se houver)
  await prisma.checkIn.deleteMany({ where: { userId: { in: ids } } });
  await prisma.appointment.deleteMany({ where: { userId: { in: ids } } });
  await prisma.lead.updateMany({
    where: { corretorId: { in: ids } },
    data: { corretorId: null },
  });

  // 3. Exclui os usuários temporários
  const result = await prisma.user.deleteMany({
    where: { id: { in: ids } },
  });

  console.log(`\n🎉 ${result.count} usuários temporários de QA foram removidos com sucesso!\n`);
}

cleanup()
  .catch((err) => {
    console.error("❌ Erro durante a limpeza:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
