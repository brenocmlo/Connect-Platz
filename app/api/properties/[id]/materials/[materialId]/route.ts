import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { prisma } from "@/lib/db/prisma";
import { requireSession, ADMIN_ROLES } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { resolveUploadPath } from "@/app/api/upload/uploadStorage";

export const dynamic = "force-dynamic";

type Params = { params: { id: string; materialId: string } };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** DELETE /api/properties/[id]/materials/[materialId] — remove registro e arquivo físico (administradores). */
export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = requireSession(req, ADMIN_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  if (!UUID_RE.test(params.id) || !UUID_RE.test(params.materialId)) {
    return NextResponse.json({ error: "Material não encontrado." }, { status: 404 });
  }

  try {
    const material = await prisma.propertyMaterial.findFirst({
      where: {
        id: params.materialId,
        propertyId: params.id,
        property: { organizationId: session.organizationId },
      },
      include: { property: { select: { nome: true } } },
    });
    if (!material) {
      return NextResponse.json({ error: "Material não encontrado." }, { status: 404 });
    }

    await prisma.propertyMaterial.delete({ where: { id: material.id } });

    // Apaga o arquivo só se estiver dentro de public/uploads/materials e não for usado por outro registro
    const filePath = resolveUploadPath(material.url, "materials");
    let arquivoRemovido = false;
    if (filePath) {
      const emUso = await prisma.propertyMaterial.count({ where: { url: material.url } });
      if (emUso === 0) {
        arquivoRemovido = await unlink(filePath).then(() => true).catch(() => false);
      }
    }

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Excluiu material de vendas",
      tipoAcao: "DELETE",
      modulo: "EMPREENDIMENTOS",
      entidade: "PropertyMaterial",
      entidadeId: material.id,
      entidadeNome: material.titulo,
      descricao: `${session.nome} excluiu "${material.titulo}" de "${material.property.nome}".`,
    });

    return NextResponse.json({ success: true, arquivoRemovido }, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir material:", error);
    return NextResponse.json({ error: "Erro ao excluir o material." }, { status: 500 });
  }
}
