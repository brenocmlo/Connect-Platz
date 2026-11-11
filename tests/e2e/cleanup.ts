import { PrismaClient } from "@prisma/client";

/**
 * Remove registros criados em testes para entidades sem rota HTTP DELETE
 * (ex.: RentalContract e seus lançamentos CashFlow / logs vinculados).
 */
export async function deleteRentalContractById(contractId: string) {
  if (!contractId) return;
  const prisma = new PrismaClient();
  try {
    await prisma.cashFlow.deleteMany({ where: { rentalContractId: contractId } });
    await prisma.auditLog.deleteMany({ where: { entidade: "RentalContract", entidadeId: contractId } });
    await prisma.rentalContract.deleteMany({ where: { id: contractId } });
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteLeadWithRelationsById(leadId: string) {
  if (!leadId) return;
  const prisma = new PrismaClient();
  try {
    const bookings = await prisma.seasonBooking.findMany({ where: { leadId }, select: { id: true } });
    for (const b of bookings) {
      await prisma.cashFlow.deleteMany({ where: { bookingId: b.id } });
    }
    await prisma.seasonBooking.deleteMany({ where: { leadId } });
    const contracts = await prisma.rentalContract.findMany({ where: { leadId }, select: { id: true } });
    for (const c of contracts) {
      await prisma.cashFlow.deleteMany({ where: { rentalContractId: c.id } });
    }
    await prisma.rentalContract.deleteMany({ where: { leadId } });
    await prisma.appointment.deleteMany({ where: { leadId } });
    await prisma.lead.deleteMany({ where: { id: leadId } });
  } finally {
    await prisma.$disconnect();
  }
}
