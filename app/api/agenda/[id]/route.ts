// app/api/agenda/[id]/route.ts
// Atualização (status/desfecho) e exclusão de um compromisso — checa organização e posse.

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { updateAppointment, deleteAppointment } from "../shared";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json().catch(() => null);
    return await updateAppointment(req, auth.session, params.id, body);
  } catch (error: any) {
    console.error("Erro ao atualizar compromisso:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar compromisso." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;

  try {
    return await deleteAppointment(req, auth.session, params.id);
  } catch (error: any) {
    console.error("Erro ao excluir compromisso:", error);
    return NextResponse.json({ error: "Erro interno ao excluir compromisso." }, { status: 500 });
  }
}
