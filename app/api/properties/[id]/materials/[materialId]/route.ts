import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { prisma } from "@/lib/db/prisma";
import { requireSession, ADMIN_ROLES } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { resolveUploadPath } from "@/app/api/upload/uploadStorage";
import { deleteFromR2, extractR2KeyFromUrl } from "@/lib/storage/r2Client";
import { canEditPropertyForRole } from "@/lib/domain/properties/modalityScope";

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
      include: { property: { select: { nome: true, modalidade: true } } },
    });
    if (!material) {
      return NextResponse.json({ error: "Material não encontrado." }, { status: 404 });
    }
    if (!canEditPropertyForRole(material.property.modalidade, session.role)) {
      return NextResponse.json({ error: "Acesso negado para excluir material deste imóvel." }, { status: 403 });
    }

    await prisma.propertyMaterial.delete({ where: { id: material.id } });

    // Apaga o arquivo só se estiver dentro de public/uploads/materials ou no R2 e não for usado por outro registro
    const filePath = resolveUploadPath(material.url, "materials");
    const r2Key = extractR2KeyFromUrl(material.url, "materials");
    let arquivoRemovido = false;
    if (filePath || r2Key) {
      const emUso = await prisma.propertyMaterial.count({ where: { url: material.url } });
      if (emUso === 0) {
        if (r2Key) {
          arquivoRemovido = await deleteFromR2(r2Key);
        } else if (filePath) {
          arquivoRemovido = await unlink(filePath).then(() => true).catch(() => false);
        }
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
