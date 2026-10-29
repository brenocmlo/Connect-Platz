// app/api/equipes/equipesDeleteHandler.ts
import { NextRequest, NextResponse } from "next/server";
import { Role, CorretorStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { recordAudit } from "@/lib/services/audit-server";
import { SessionPayload } from "@/lib/auth/jwt";

export async function handleRemoveMember(req: NextRequest, session: SessionPayload) {
  let userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    try {
      const body = await req.json();
      userId = body.userId;
    } catch {
      // ignore
    }
  }

  if (!userId) {
    return NextResponse.json({ error: "ID do colaborador é obrigatório." }, { status: 400 });
  }

  try {
    const target = await prisma.user.findFirst({
      where: { id: userId, organizationId: session.organizationId, isActive: true },
      include: {
        _count: {
          select: { leads: { where: { isClosed: false } } },
        },
      },
    });

    if (!target) {
      return NextResponse.json({ error: "Colaborador não encontrado ou já removido." }, { status: 404 });
    }

    if (target.id === session.userId) {
      return NextResponse.json(
        { error: "Você não pode remover seu próprio usuário administrador." },
        { status: 400 }
      );
    }

    if (target.role === Role.ADMINISTRADOR) {
      return NextResponse.json(
        { error: "Usuários administradores não podem ser removidos por esta rota." },
        { status: 400 }
      );
    }

    // 1. Transfere leads ativos do corretor para o Bolsão de Leads
    const transferCount = target._count.leads;
    if (transferCount > 0) {
      await prisma.lead.updateMany({
        where: { corretorId: target.id, isClosed: false },
        data: {
          corretorId: null,
          isBolsao: true,
          bolsaoEnteredAt: new Date(),
        },
      });
    }

    // 2. Desvincula compromissos e limpa check-ins
    await prisma.appointment.deleteMany({ where: { userId: target.id } });
    await prisma.checkIn.deleteMany({ where: { userId: target.id } });

    // 3. Tenta exclusão definitiva; se houver histórico de vendas/comissões, inativa com segurança
    try {
      await prisma.lead.updateMany({
        where: { corretorId: target.id },
        data: { corretorId: null },
      });
      await prisma.user.delete({ where: { id: target.id } });
    } catch {
      await prisma.user.update({
        where: { id: target.id },
        data: {
          isActive: false,
          status: CorretorStatus.OFFLINE,
        },
      });
    }

    // 4. Registra auditoria
    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Remoção de Colaborador",
      tipoAcao: "DELETE",
      modulo: "EQUIPES",
      entidade: "User",
      entidadeId: target.id,
      entidadeNome: target.nome,
      descricao: `Colaborador ${target.nome} (${target.email}) removido da equipe pelo administrador.${
        transferCount > 0 ? ` ${transferCount} lead(s) transferido(s) para o Bolsão.` : ""
      }`,
      dadosAntes: {
        nome: target.nome,
        email: target.email,
        role: target.role,
        leadsAtivos: transferCount,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Colaborador ${target.nome} removido com sucesso.`,
      transferredLeads: transferCount,
    });
  } catch (err) {
    console.error("[EQUIPES] DELETE:", err);
    return NextResponse.json({ error: "Erro ao remover o colaborador da equipe." }, { status: 500 });
  }
}
