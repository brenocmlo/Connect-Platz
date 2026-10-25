import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { prisma } from "@/lib/db/prisma";
import { requireSession, ADMIN_ROLES } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { resolveUploadPath } from "@/app/api/upload/uploadStorage";
import { auditSnapshot, fillCoordinates, parsePropertyBody } from "../propertyPayload";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** PATCH /api/properties/[id] — edição parcial (somente administradores da organização). */
export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = requireSession(req, ADMIN_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: "Imóvel não encontrado." }, { status: 404 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  try {
    const current = await prisma.property.findFirst({
      where: { id: params.id, organizationId: session.organizationId },
    });
    if (!current) {
      return NextResponse.json({ error: "Imóvel não encontrado." }, { status: 404 });
    }

    const { data, errors } = parsePropertyBody(body, true);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" "), details: errors }, { status: 400 });
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nenhum campo válido para atualizar." }, { status: 400 });
    }

    await fillCoordinates(data, current as any);

    const updated = await prisma.property.update({
      where: { id: current.id },
      data: data as any,
      include: { units: true },
    });

    const visibilidade = "exibirNaLandingPage" in data && Object.keys(data).length === 1;
    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: visibilidade ? "Alterou visibilidade na vitrine" : "Editou imóvel",
      tipoAcao: visibilidade ? "STATUS_CHANGE" : "UPDATE",
      modulo: "EMPREENDIMENTOS",
      entidade: "Property",
      entidadeId: updated.id,
      entidadeNome: updated.nome,
      descricao: visibilidade
        ? `${session.nome} ${updated.exibirNaLandingPage ? "publicou" : "ocultou"} "${updated.nome}" na vitrine.`
        : `${session.nome} editou "${updated.nome}" (${Object.keys(data).join(", ")}).`,
      dadosAntes: auditSnapshot(current as any),
      dadosDepois: auditSnapshot(updated as any),
    });

    return NextResponse.json({ success: true, property: updated }, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao atualizar imóvel:", error);
    return NextResponse.json({ error: "Erro ao atualizar o imóvel." }, { status: 500 });
  }
}

/**
 * DELETE /api/properties/[id] — exclui o imóvel (somente administradores).
 * Com vendas ou reservas vinculadas o histórico precisa ser preservado: o imóvel é
 * desativado (isActive=false) e sai da vitrine, em vez de apagado.
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = requireSession(req, ADMIN_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: "Imóvel não encontrado." }, { status: 404 });
  }

  try {
    const property = await prisma.property.findFirst({
      where: { id: params.id, organizationId: session.organizationId },
      include: {
        _count: { select: { sales: true, bookings: true } },
        materials: { select: { url: true } },
      },
    });
    if (!property) {
      return NextResponse.json({ error: "Imóvel não encontrado." }, { status: 404 });
    }

    const vinculos = property._count.sales + property._count.bookings;
    const auditBase = {
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      modulo: "EMPREENDIMENTOS" as const,
      entidade: "Property",
      entidadeId: property.id,
      entidadeNome: property.nome,
      dadosAntes: auditSnapshot(property as any),
    };

    if (vinculos > 0) {
      await prisma.property.update({
        where: { id: property.id },
        data: { isActive: false, exibirNaLandingPage: false },
      });
      const motivo = `${property._count.sales} venda(s) e ${property._count.bookings} reserva(s) vinculada(s)`;
      await recordAudit({
        ...auditBase,
        acao: "Desativou imóvel",
        tipoAcao: "STATUS_CHANGE",
        descricao: `${session.nome} tentou excluir "${property.nome}"; o imóvel foi desativado por possuir ${motivo}.`,
      });
      return NextResponse.json(
        {
          success: true,
          deactivated: true,
          message: `"${property.nome}" possui ${motivo} e foi desativado (oculto do catálogo e da vitrine) em vez de excluído.`,
        },
        { status: 200 }
      );
    }

    await prisma.property.delete({ where: { id: property.id } });

    // Remove os arquivos físicos dos materiais (registros já caíram em cascata)
    await Promise.all(
      property.materials.map(async (m) => {
        const path = resolveUploadPath(m.url, "materials");
        if (path) await unlink(path).catch(() => undefined);
      })
    );

    await recordAudit({
      ...auditBase,
      acao: "Excluiu imóvel",
      tipoAcao: "DELETE",
      descricao: `${session.nome} excluiu "${property.nome}" do catálogo.`,
    });

    return NextResponse.json(
      { success: true, deleted: true, message: "Imóvel excluído com sucesso." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao excluir imóvel:", error);
    return NextResponse.json({ error: "Erro ao excluir o imóvel." }, { status: 500 });
  }
}
