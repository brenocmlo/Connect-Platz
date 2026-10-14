import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "./password";
import { signSessionToken } from "./jwt";
import { Role, CorretorStatus } from "@prisma/client";

/**
 * Garante a criação resiliente da organização Connect Platz e do administrador Robson Carvalho.
 * Permite que a aplicação funcione imediatamente no Coolify mesmo sem execução manual de seed.
 */
export async function ensureDefaultAdmin() {
  try {
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
      },
    });

    const defaultPasswordHash = await hashPassword("ConnectPlatz2026@");

    const admin = await prisma.user.upsert({
      where: { email: "robson@connectplatz.com.br" },
      update: { passwordHash: defaultPasswordHash, isActive: true },
      create: {
        organizationId: org.id,
        nome: "Robson Carvalho",
        email: "robson@connectplatz.com.br",
        passwordHash: defaultPasswordHash,
        role: Role.ADMINISTRADOR,
        status: CorretorStatus.DISPONIVEL,
        telefone: "(85) 99999-0001",
        isActive: true,
      },
    });

    // Cria funil padrão caso ainda não exista
    const funnelCount = await prisma.funnel.count({ where: { organizationId: org.id } });
    if (funnelCount === 0) {
      await prisma.funnel.create({
        data: {
          organizationId: org.id,
          nome: "Funil Geral Connect Platz",
          isDefault: true,
          isActive: true,
          stages: {
            create: [
              { nome: "Novo Lead", posicao: 1, cor: "#1266C7", slaMinutes: 30 },
              { nome: "Primeiro Contato", posicao: 2, cor: "#D9BB4C", slaMinutes: 120 },
              { nome: "Visita Agendada", posicao: 3, cor: "#3B82F6", slaMinutes: 1440 },
              { nome: "Proposta", posicao: 4, cor: "#10B981" },
              { nome: "Fechamento", posicao: 5, cor: "#059669" },
            ],
          },
        },
      });
    }

    const token = signSessionToken({
      userId: admin.id,
      email: admin.email,
      nome: admin.nome,
      role: admin.role,
      organizationId: admin.organizationId,
    });

    return {
      token,
      user: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        role: admin.role,
        organizationId: admin.organizationId,
        status: admin.status,
        hasCheckedInToday: true,
      },
    };
  } catch (error) {
    console.error("[AUTO-SEED] Erro ao inicializar admin no banco:", error);
    return null;
  }
}
