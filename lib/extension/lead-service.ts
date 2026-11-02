import { prisma } from "@/lib/db/prisma";
import { BusinessModality, Role } from "@prisma/client";
import { isAdmin } from "@/lib/auth/session";

export interface ExtensionLeadAuxData {
  funnelsList: Array<{
    id: string;
    nome: string;
    modalidade: BusinessModality;
    stages: Array<{ id: string; nome: string; cor: string | null; posicao: number }>;
  }>;
  propertiesList: Array<{
    id: string;
    nome: string;
    modalidade: string;
    valorVenda: unknown;
    valorDiaria: unknown;
  }>;
  brokersList: Array<{ id: string; nome: string }>;
}

export async function getExtensionLeadAuxData(
  organizationId: string,
  userRole: Role
): Promise<ExtensionLeadAuxData> {
  const [funnelsList, propertiesList, brokersList] = await Promise.all([
    prisma.funnel.findMany({
      where: { organizationId, isActive: true },
      include: {
        stages: {
          orderBy: { posicao: "asc" },
          select: { id: true, nome: true, cor: true, posicao: true },
        },
      },
      orderBy: { modalidade: "desc" },
    }),
    prisma.property.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, nome: true, modalidade: true, valorVenda: true, valorDiaria: true },
      orderBy: { nome: "asc" },
      take: 25,
    }),
    isAdmin(userRole)
      ? prisma.user.findMany({
          where: { organizationId, isActive: true },
          select: { id: true, nome: true },
          orderBy: { nome: "asc" },
        })
      : [],
  ]);

  return { funnelsList, propertiesList, brokersList };
}
