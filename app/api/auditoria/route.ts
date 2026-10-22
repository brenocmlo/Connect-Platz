// app/api/auditoria/route.ts
// Trilha de auditoria (audit_logs). GET restrito à gestão, paginado e filtrável.
// POST registra eventos originados no cliente (o servidor usa recordAudit diretamente).

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireSession, getClientIp, MANAGER_ROLES } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const MAX_PAGE_SIZE = 100;
const SENSITIVE_MODULES = ["FLUXO_DE_CAIXA", "CONFIGURACOES"];

const CreateAuditLogSchema = z.object({
  acao: z.string().trim().min(1).max(200),
  tipoAcao: z.string().trim().min(1).max(40),
  modulo: z.string().trim().min(1).max(40),
  detalhes: z.string().trim().max(2000).default(""),
  entidadeAfetada: z
    .object({
      tipo: z.string().max(80).optional(),
      id: z.string().max(80).optional(),
      nome: z.string().max(200).optional(),
    })
    .optional(),
  dadosAntes: z.record(z.unknown()).nullable().optional(),
  dadosDepois: z.record(z.unknown()).nullable().optional(),
});

interface AuditDetalhes {
  tipoAcao?: string;
  modulo?: string;
  descricao?: string;
  entidadeNome?: string;
  dispositivo?: string;
  ator?: string;
  dadosAntes?: Record<string, unknown>;
  dadosDepois?: Record<string, unknown>;
}

function jsonPath(path: string, value: string): Prisma.AuditLogWhereInput {
  return { detalhes: { path: [path], equals: value } };
}

function parseDate(value: string | null, endOfDay = false): Date | null {
  if (!value) return null;
  const d = new Date(value.length === 10 ? `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}-03:00` : value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateTime(d: Date): string {
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Fortaleza",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function GET(req: NextRequest) {
  const auth = requireSession(req, MANAGER_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(sp.get("pageSize") || "25", 10) || 25));
  const modulo = sp.get("modulo");
  const tipoAcao = sp.get("tipoAcao");
  const userId = sp.get("userId");
  const q = sp.get("q")?.trim();
  const from = parseDate(sp.get("from"));
  const to = parseDate(sp.get("to"), true);

  const and: Prisma.AuditLogWhereInput[] = [{ organizationId: session.organizationId }];
  if (modulo && modulo !== "ALL") and.push(jsonPath("modulo", modulo));
  if (tipoAcao && tipoAcao !== "ALL") and.push(jsonPath("tipoAcao", tipoAcao));
  if (userId === "SISTEMA") and.push({ userId: null });
  else if (userId && userId !== "ALL") and.push({ userId });
  if (from || to) and.push({ createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } });
  if (q) {
    and.push({
      OR: [
        { acao: { contains: q, mode: "insensitive" } },
        { entidade: { contains: q, mode: "insensitive" } },
        { ipAddress: { contains: q } },
        { user: { nome: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } },
        { detalhes: { path: ["descricao"], string_contains: q } },
        { detalhes: { path: ["entidadeNome"], string_contains: q } },
      ],
    });
  }
  const where: Prisma.AuditLogWhereInput = { AND: and };

  try {
    const [rows, total, logins, sensiveis, usersWithActions, usuarios] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, nome: true, email: true, role: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.count({ where }),
      prisma.auditLog.count({ where: { AND: [...and, jsonPath("tipoAcao", "LOGIN")] } }),
      prisma.auditLog.count({
        where: {
          AND: [
            ...and,
            {
              OR: [
                jsonPath("tipoAcao", "DELETE"),
                ...SENSITIVE_MODULES.map((m) => jsonPath("modulo", m)),
                { acao: { contains: "senha", mode: "insensitive" } },
              ],
            },
          ],
        },
      }),
      prisma.auditLog.groupBy({ by: ["userId"], where: { AND: [...and, { userId: { not: null } }] } }),
      prisma.user.findMany({
        where: { organizationId: session.organizationId },
        select: { id: true, nome: true },
        orderBy: { nome: "asc" },
      }),
    ]);

    const logs = rows.map((l) => {
      const d = ((l.detalhes as AuditDetalhes | null) || {}) as AuditDetalhes;
      const atorNome = d.ator || "Sistema";
      return {
        id: l.id,
        timestamp: l.createdAt.toISOString(),
        dataHoraFormatada: formatDateTime(l.createdAt),
        usuario: l.user
          ? { id: l.user.id, nome: l.user.nome, email: l.user.email, role: l.user.role }
          : { id: null, nome: atorNome, email: null, role: d.ator ? "INTEGRAÇÃO" : "SISTEMA" },
        acao: l.acao,
        tipoAcao: d.tipoAcao || "OUTRO",
        modulo: d.modulo || "SISTEMA",
        detalhes: d.descricao || l.entidade,
        ipOrigem: l.ipAddress || null,
        dispositivo: d.dispositivo || null,
        entidadeAfetada: {
          tipo: l.entidade,
          id: l.entidadeId || undefined,
          nome: d.entidadeNome || undefined,
        },
        dadosAntes: d.dadosAntes ?? null,
        dadosDepois: d.dadosDepois ?? null,
      };
    });

    return NextResponse.json({
      logs,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      stats: { total, logins, sensiveis, usuariosComAcoes: usersWithActions.length },
      usuarios,
    });
  } catch (err) {
    console.error("[AUDITORIA] GET:", err);
    return NextResponse.json({ error: "Erro ao consultar os logs de auditoria." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const parsed = CreateAuditLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Evento de auditoria inválido." },
      { status: 400 }
    );
  }
  const v = parsed.data;

  try {
    const log = await prisma.auditLog.create({
      data: {
        organizationId: session.organizationId,
        userId: session.userId,
        acao: v.acao,
        entidade: v.entidadeAfetada?.tipo || v.modulo,
        entidadeId: v.entidadeAfetada?.id || null,
        ipAddress: getClientIp(req),
        detalhes: {
          tipoAcao: v.tipoAcao,
          modulo: v.modulo,
          descricao: v.detalhes,
          entidadeNome: v.entidadeAfetada?.nome,
          dispositivo: req.headers.get("user-agent") || undefined,
          origem: "cliente",
          dadosAntes: v.dadosAntes ?? undefined,
          dadosDepois: v.dadosDepois ?? undefined,
        } as Prisma.InputJsonValue,
      },
      select: { id: true, createdAt: true },
    });
    return NextResponse.json({ success: true, id: log.id }, { status: 201 });
  } catch (err) {
    console.error("[AUDITORIA] POST:", err);
    return NextResponse.json({ error: "Erro ao salvar o log de auditoria." }, { status: 500 });
  }
}
