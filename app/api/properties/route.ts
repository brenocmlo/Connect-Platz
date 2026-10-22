import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { PropertyModality, UnitStatus } from "@prisma/client";
import { getRequestSession, requireSession, MANAGER_ROLES } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";
import {
  auditSnapshot,
  fillCoordinates,
  generateSlug,
  parsePropertyBody,
  resolvePublicOrganizationId,
  toNumberOrNull,
} from "./propertyPayload";
import { buildDirectory } from "./propertyDirectory";

export const dynamic = "force-dynamic";

/**
 * GET /api/properties
 * Público: `?portal=true` (ou sem sessão) lista só imóveis ativos e liberados para a vitrine.
 * Com sessão: catálogo ativo da organização do usuário.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modalidade = searchParams.get("modalidade");
    const localizacao = searchParams.get("localizacao");
    const tipoCadastro = searchParams.get("tipoCadastro");
    const session = getRequestSession(req);
    const portal = searchParams.get("portal") === "true" || !session;

    const orgId = session?.organizationId || (await resolvePublicOrganizationId());

    const cacheHeader = portal
      ? "public, s-maxage=60, stale-while-revalidate=300"
      : "private, no-cache, no-store, must-revalidate";

    if (!orgId) {
      return NextResponse.json(
        { properties: [], cidades: [], bairros: [], total: 0, directory: [] },
        { status: 200, headers: { "Cache-Control": cacheHeader } }
      );
    }

    const baseWhere: any = { organizationId: orgId, isActive: true };
    if (portal) baseWhere.exibirNaLandingPage = true;

    const where: any = { ...baseWhere };
    if (tipoCadastro && tipoCadastro !== "TODOS") where.tipoCadastro = tipoCadastro;
    if (modalidade === "VENDA") {
      where.modalidade = { in: [PropertyModality.VENDA, PropertyModality.AMBOS] };
    } else if (modalidade === "VERANEIO" || modalidade === "VERANEIO_TEMPORADA") {
      where.modalidade = { in: [PropertyModality.VERANEIO_TEMPORADA, PropertyModality.AMBOS] };
    }
    if (localizacao) {
      where.OR = [
        { bairro: { contains: localizacao, mode: "insensitive" } },
        { cidade: { contains: localizacao, mode: "insensitive" } },
        { nome: { contains: localizacao, mode: "insensitive" } },
      ];
    }

    const [properties, allActive] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          units: { orderBy: [{ pavimento: "desc" }, { numeroUnidade: "asc" }] },
          ...(portal ? {} : { _count: { select: { materials: true, sales: true } } }),
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.property.findMany({
        where: baseWhere,
        select: { nome: true, cidade: true, estado: true, bairro: true, modalidade: true, caracteristicas: true },
      }),
    ]);

    const cidades = Array.from(new Set(allActive.map((p) => p.cidade).filter(Boolean))) as string[];
    const bairros = Array.from(new Set(allActive.map((p) => p.bairro).filter(Boolean))) as string[];

    return NextResponse.json(
      { properties, cidades, bairros, total: properties.length, directory: buildDirectory(allActive) },
      { status: 200, headers: { "Cache-Control": cacheHeader } }
    );
  } catch (error: any) {
    console.error("Erro em GET /api/properties:", error);
    return NextResponse.json({ error: "Erro ao carregar o catálogo de imóveis." }, { status: 500 });
  }
}

/** POST /api/properties — cadastro de empreendimento/imóvel avulso (somente gestores). */
export async function POST(req: NextRequest) {
  const auth = requireSession(req, MANAGER_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { data, errors } = parsePropertyBody(body, false);
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" "), details: errors }, { status: 400 });
  }

  try {
    await fillCoordinates(data);

    const property = await prisma.property.create({
      data: {
        ...(data as any),
        organizationId: session.organizationId,
        slug: generateSlug(data.nome),
      },
    });

    // Matriz de unidades (opcional): só com parâmetros explícitos, sem valores inventados
    const cfg = body?.unidadesConfig;
    if (property.tipoCadastro === "EMPREENDIMENTO" && cfg && typeof cfg === "object") {
      const blocos: string[] = Array.isArray(cfg.blocos) && cfg.blocos.length > 0 ? cfg.blocos.map(String).slice(0, 20) : [];
      const andares = Math.min(Math.max(Math.trunc(toNumberOrNull(cfg.andares) ?? 0), 0), 200);
      const porAndar = Math.min(Math.max(Math.trunc(toNumberOrNull(cfg.unidadesPorAndar) ?? 0), 0), 50);
      const valorBase = toNumberOrNull(cfg.valorBase) ?? (data.valorVenda as number | null);
      const areaBase = toNumberOrNull(cfg.areaBase);
      const unitEntries: any[] = [];
      // Sem valor base não há como precificar as unidades: a matriz não é gerada
      for (const bloco of valorBase !== null ? blocos : []) {
        for (let a = 1; a <= andares; a++) {
          for (let u = 1; u <= porAndar; u++) {
            unitEntries.push({
              propertyId: property.id,
              bloco,
              pavimento: `${a}º Andar`,
              numeroUnidade: `${a}${String(u).padStart(2, "0")}`,
              status: UnitStatus.DISPONIVEL,
              valor: (valorBase as number) * (1 + (a - 1) * 0.02),
              areaPrivativa: areaBase,
            });
          }
        }
      }
      if (unitEntries.length > 0) await prisma.propertyUnit.createMany({ data: unitEntries });
    }

    const created = await prisma.property.findUnique({ where: { id: property.id }, include: { units: true } });

    await recordAudit({
      req,
      organizationId: session.organizationId,
      userId: session.userId,
      acao: "Cadastrou imóvel",
      tipoAcao: "CREATE",
      modulo: "EMPREENDIMENTOS",
      entidade: "Property",
      entidadeId: property.id,
      entidadeNome: property.nome,
      descricao: `${session.nome} cadastrou ${property.tipoCadastro === "AVULSO" ? "o imóvel avulso" : "o empreendimento"} "${property.nome}".`,
      dadosDepois: auditSnapshot(property),
    });

    return NextResponse.json({ success: true, property: created }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao cadastrar imóvel:", error);
    return NextResponse.json({ error: "Erro ao cadastrar imóvel/empreendimento." }, { status: 500 });
  }
}
