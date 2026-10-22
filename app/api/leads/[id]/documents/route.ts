import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import { refreshLeadScore } from "@/lib/services/lead-score";
import { canViewLead, canModifyLead, findOrgLead, badRequest, forbidden, isUuid } from "../../_lib/leadAccess";
import { zodMessage } from "../../_lib/leadPayload";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

const DocumentSchema = z.object({
  tipo: z.string().trim().max(60).default("anexo"),
  nomeArquivo: z.string().trim().min(1).max(255),
  // Somente arquivos enviados por /api/upload (armazenamento local da aplicação)
  fileUrl: z.string().regex(/^\/uploads\/[\w\-/.]+$/, "URL de arquivo inválida."),
  fileSize: z.number().int().nonnegative().optional(),
  mimeType: z.string().max(120).optional(),
});

/** GET: documentos anexados ao lead. */
export async function GET(req: NextRequest, { params }: Params) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;
  try {
    const found = await findOrgLead(params.id, session);
    if (found.error) return found.error;
    if (!canViewLead(found.lead, session)) {
      return NextResponse.json({ error: "Acesso não autorizado a este registro." }, { status: 403 });
    }
    const documents = await prisma.leadDocument.findMany({
      where: { leadId: params.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ documents }, { status: 200 });
  } catch (error: any) {
    console.error("API /api/leads/[id]/documents GET error:", error?.message);
    return NextResponse.json({ error: "Erro ao carregar documentos." }, { status: 500 });
  }
}

/** POST: vincula ao lead um arquivo já enviado via /api/upload. */
export async function POST(req: NextRequest, { params }: Params) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  let input;
  try {
    input = DocumentSchema.parse(await req.json());
  } catch (err) {
    return badRequest(err instanceof z.ZodError ? zodMessage(err) : "JSON inválido.");
  }

  try {
    const found = await findOrgLead(params.id, session);
    if (found.error) return found.error;
    const { lead } = found;
    if (!canModifyLead(lead, session)) return forbidden("Você não tem permissão para anexar documentos a este lead.");

    const document = await prisma.leadDocument.create({ data: { leadId: lead.id, ...input } });
    await prisma.leadTimeline.create({
      data: { leadId: lead.id, userId: session.userId, tipo: "documento", conteudo: `Documento anexado: ${input.nomeArquivo}.` },
    });
    await refreshLeadScore(lead.id);
    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "LEAD_DOCUMENTO_ANEXADO",
      tipoAcao: "CREATE",
      modulo: "LEADS",
      entidade: "LeadDocument",
      entidadeId: document.id,
      entidadeNome: input.nomeArquivo,
      descricao: `Documento "${input.nomeArquivo}" anexado ao lead "${lead.nome}".`,
    });
    return NextResponse.json({ document }, { status: 201 });
  } catch (error: any) {
    console.error("API /api/leads/[id]/documents POST error:", error?.message);
    return NextResponse.json({ error: "Erro ao anexar documento." }, { status: 500 });
  }
}

/** DELETE ?docId=: remove o vínculo do documento com o lead. */
export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;
  const docId = new URL(req.url).searchParams.get("docId");
  if (!isUuid(docId)) return badRequest("Documento inválido.");

  try {
    const found = await findOrgLead(params.id, session);
    if (found.error) return found.error;
    const { lead } = found;
    if (!canModifyLead(lead, session)) return forbidden("Você não tem permissão para remover documentos deste lead.");

    const document = await prisma.leadDocument.findFirst({ where: { id: docId!, leadId: lead.id } });
    if (!document) return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });

    await prisma.leadDocument.delete({ where: { id: document.id } });
    await prisma.leadTimeline.create({
      data: { leadId: lead.id, userId: session.userId, tipo: "documento", conteudo: `Documento removido: ${document.nomeArquivo}.` },
    });
    await refreshLeadScore(lead.id);
    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "LEAD_DOCUMENTO_REMOVIDO",
      tipoAcao: "DELETE",
      modulo: "LEADS",
      entidade: "LeadDocument",
      entidadeId: document.id,
      entidadeNome: document.nomeArquivo,
      descricao: `Documento "${document.nomeArquivo}" removido do lead "${lead.nome}".`,
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("API /api/leads/[id]/documents DELETE error:", error?.message);
    return NextResponse.json({ error: "Erro ao remover documento." }, { status: 500 });
  }
}
