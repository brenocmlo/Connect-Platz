// scripts/reorderStagesInDb.ts
// Reordena as etapas do funil de vendas conforme especificação:
// 1. Novo Lead
// 2. Primeiro Contato
// 3. Análise de Crédito
// 4. Visita Agendada
// 5. Proposta Enviada
// 6. Fechado / Ganho
// 7. Encerrado

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Atualizando posições das etapas do funil...");

  // Passo intermediário para evitar colisão de restrições únicas (se houver)
  await prisma.$executeRawUnsafe(`
    UPDATE funnel_stages SET posicao = posicao + 100 WHERE nome IN ('Análise de Crédito', 'Visita Agendada', 'Proposta Enviada');
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE funnel_stages SET posicao = 3 WHERE nome ILIKE '%Análise%';
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE funnel_stages SET posicao = 4 WHERE nome ILIKE '%Visita%';
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE funnel_stages SET posicao = 5 WHERE nome ILIKE '%Proposta%';
  `);

  console.log("Etapas reordenadas com sucesso: Análise de Crédito (3) -> Visita Agendada (4) -> Proposta Enviada (5)!");
}

main()
  .catch((err) => {
    console.error("Erro na reordenação de etapas:", err);
  })
  .finally(() => prisma.$disconnect());
