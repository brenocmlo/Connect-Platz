import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stat } from "fs/promises";
import { prisma } from "@/lib/db/prisma";
import { requireSession, ADMIN_ROLES } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { formatFileSize, resolveUploadPath } from "@/app/api/upload/uploadStorage";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

const MATERIAL_CATEGORIAS = ["BOOK", "TABELA", "MEMORIAL", "PLANTAS", "DOCUMENTO"] as const;

const MaterialSchema = z.object({
  titulo: z.string().trim().min(2, "Informe o título do material.").max(160),
  categoria: z.enum(MATERIAL_CATEGORIAS, { errorMap: () => ({ message: "Categoria inválida." }) }),
  url: z.string().trim().min(1, "Envie o arquivo antes de cadastrar o material."),
  tipo: z.enum(["pdf", "image", "doc", "link"]).default("pdf"),
});

async function findProperty(id: string, organizationId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return prisma.property.findFirst({ where: { id, organizationId }, select: { id: true, nome: true } });
}

/** GET /api/properties/[id]/materials — qualquer usuário logado da organização. */
export async function GET(req: NextRequest, { params }: Params) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const property = await findProperty(params.id, session.organizationId);
    if (!property) return NextResponse.json({ error: "Imóvel não encontrado." }, { status: 404 });

    const materials = await prisma.propertyMaterial.findMany({
      where: { propertyId: property.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, materials }, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar materiais:", error);
    return NextResponse.json({ error: "Erro ao listar os materiais do imóvel." }, { status: 500 });
  }
}

/**
 * POST /api/properties/[id]/materials — registra um material já enviado via /api/upload
 * (pasta `materials`). Somente administradores. O tamanho é lido do arquivo gravado.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const auth = requireSession(req, ADMIN_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  const parsed = MaterialSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message || "Dados do material inválidos.";
    return NextResponse.json({ error: first, details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const input = parsed.data;

  // Link externo (nuvem) exige https; arquivo precisa ter sido enviado para /uploads/materials
  const isLink = input.tipo === "link";
  if (isLink && !/^https:\/\/[^\s]+$/i.test(input.url)) {
    return NextResponse.json({ error: "Informe um link https válido." }, { status: 400 });
  }
  const filePath = isLink ? null : resolveUploadPath(input.url, "materials");
  if (!isLink && !filePath) {
    return NextResponse.json({ error: "Arquivo inválido: use a URL retornada pelo upload de materiais." }, { status: 400 });
  }

  try {
    const property = await findProperty(params.id, session.organizationId);
    if (!property) return NextResponse.json({ error: "Imóvel não encontrado." }, { status: 404 });

    const info = filePath ? await stat(filePath).catch(() => null) : null;
    if (!isLink && (!info || !info.isFile())) {
      return NextResponse.json({ error: "Arquivo não encontrado no servidor. Envie-o novamente." }, { status: 400 });
    }

    const material = await prisma.propertyMaterial.create({
      data: {
        propertyId: property.id,
        titulo: input.titulo,
        categoria: input.categoria,
        url: input.url,
        tipo: input.tipo,
        tamanho: info ? formatFileSize(info.size) : null,
        createdById: session.userId,
      },
    });

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Adicionou material de vendas",
      tipoAcao: "CREATE",
      modulo: "EMPREENDIMENTOS",
      entidade: "PropertyMaterial",
      entidadeId: material.id,
      entidadeNome: material.titulo,
      descricao: `${session.nome} adicionou "${material.titulo}" (${material.categoria}) em "${property.nome}".`,
    });

    return NextResponse.json({ success: true, material }, { status: 201 });
  } catch (error) {
    console.error("Erro ao cadastrar material:", error);
    return NextResponse.json({ error: "Erro ao cadastrar o material." }, { status: 500 });
  }
}
