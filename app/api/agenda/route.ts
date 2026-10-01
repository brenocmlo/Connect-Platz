import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { container } from "@/lib/container";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token ausente" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const tokenService = container.tokenService;
    const payload = await tokenService.verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        organizationId: payload.organizationId,
        ...(payload.role === "CORRETOR" ? { userId: payload.userId } : {}),
      },
      include: {
        user: { select: { id: true, nome: true } },
        lead: { select: { id: true, nome: true, telefone: true } },
        property: { select: { id: true, nome: true, endereco: true, bairro: true } },
      },
      orderBy: { dataInicio: "asc" },
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    console.error("Erro ao listar compromissos da agenda:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token ausente" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const tokenService = container.tokenService;
    const payload = await tokenService.verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    }

    const body = await req.json();
    const { tipo, titulo, dataInicio, dataFim, leadId, propertyId, observacoes } = body;

    if (!titulo || !dataInicio || !dataFim) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        organizationId: payload.organizationId,
        userId: payload.userId,
        tipo: tipo || "VISITA",
        titulo,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        leadId: leadId || null,
        propertyId: propertyId || null,
        observacoes: observacoes || null,
      },
      include: {
        lead: { select: { id: true, nome: true, telefone: true } },
        property: { select: { id: true, nome: true, endereco: true } },
      },
    });

    return NextResponse.json({ appointment, message: "Compromisso agendado com sucesso!" }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar compromisso:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token ausente" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const tokenService = container.tokenService;
    const payload = await tokenService.verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, resultadoVisita } = body;

    if (!id) {
      return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(resultadoVisita ? { resultadoVisita } : {}),
      },
    });

    return NextResponse.json({ appointment: updated, message: "Status do compromisso atualizado!" });
  } catch (error: any) {
    console.error("Erro ao atualizar compromisso:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
