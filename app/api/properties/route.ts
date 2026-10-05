import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { PropertyModality, PriceRange, UnitStatus } from "@prisma/client";
import { initialSampleProperties } from "@/components/crm/properties/sampleProperties";

export const dynamic = "force-dynamic";

function generateSlug(text: string): string {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return `${base}-${Date.now().toString(36)}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modalidade = searchParams.get("modalidade");
    const localizacao = searchParams.get("localizacao");
    const tipoCadastro = searchParams.get("tipoCadastro");
    const portal = searchParams.get("portal");

    const org = await prisma.organization.findFirst({
      where: { slug: "connect-platz" },
    });
    const orgId = org?.id;

    const where: any = {
      isActive: true,
      ...(orgId ? { organizationId: orgId } : {}),
    };

    // No portal público, exibe apenas os autorizados para a Landing Page
    if (portal === "true") {
      where.exibirNaLandingPage = true;
    }

    if (tipoCadastro && tipoCadastro !== "TODOS") {
      where.tipoCadastro = tipoCadastro;
    }

    if (modalidade && modalidade !== "TODOS") {
      if (modalidade === "VENDA") {
        where.modalidade = { in: [PropertyModality.VENDA, PropertyModality.AMBOS] };
      } else if (modalidade === "VERANEIO" || modalidade === "VERANEIO_TEMPORADA") {
        where.modalidade = { in: [PropertyModality.VERANEIO_TEMPORADA, PropertyModality.AMBOS] };
      }
    }

    if (localizacao) {
      where.OR = [
        { bairro: { contains: localizacao, mode: "insensitive" } },
        { cidade: { contains: localizacao, mode: "insensitive" } },
        { nome: { contains: localizacao, mode: "insensitive" } },
      ];
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        units: {
          orderBy: [{ pavimento: "desc" }, { numeroUnidade: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const allActive = await prisma.property.findMany({
      where: { isActive: true },
      select: { cidade: true, bairro: true, modalidade: true },
    });

    const cidadesUnicas = Array.from(
      new Set(allActive.map((p) => p.cidade).filter(Boolean))
    ) as string[];
    const bairrosUnicos = Array.from(
      new Set(allActive.map((p) => p.bairro).filter(Boolean))
    ) as string[];

    const directory = [
      {
        cidade: "Fortaleza",
        estado: "CE",
        comprar: [
          "Apartamentos à venda em Fortaleza",
          "Casas à venda em Fortaleza",
          "Studios e kitnets à venda em Fortaleza",
          "Casas em condomínio em Fortaleza",
          "Salas comerciais à venda em Fortaleza",
        ],
        alugar: [
          "Apartamentos para alugar em Fortaleza",
          "Casas para alugar em Fortaleza",
          "Studios e flats para alugar em Fortaleza",
          "Casas de temporada em Fortaleza",
          "Salas comerciais para alugar em Fortaleza",
        ],
      },
      {
        cidade: "Aquiraz (Porto das Dunas)",
        estado: "CE",
        comprar: [
          "Casas pé na areia em Aquiraz",
          "Apartamentos no Porto das Dunas",
          "Casas em condomínio fechado em Aquiraz",
          "Lotes e terrenos em Aquiraz",
          "Mansões de luxo em Aquiraz",
        ],
        alugar: [
          "Casas de Veraneio no Porto das Dunas",
          "Flats de temporada perto do Beach Park",
          "Casas com piscina privativa em Aquiraz",
          "Resorts pé na areia por temporada",
          "Casas de praia para fins de semana",
        ],
      },
      {
        cidade: "Eusébio",
        estado: "CE",
        comprar: [
          "Casas em Alphaville Eusébio",
          "Casas duplex em condomínio no Eusébio",
          "Lotes residenciais no Eusébio",
          "Mansões sustentáveis no Eusébio",
          "Apartamentos compactos no Eusébio",
        ],
        alugar: [
          "Casas em condomínio para alugar no Eusébio",
          "Casas de temporada no Eusébio",
          "Galpões e salas no Eusébio",
          "Casas mobiliadas no Eusébio",
          "Imóveis corporativos no Eusébio",
        ],
      },
      {
        cidade: "Caucaia (Cumbuco)",
        estado: "CE",
        comprar: [
          "Casas de praia no Cumbuco",
          "Apartamentos com vista mar no Cumbuco",
          "Pousadas à venda no Cumbuco",
          "Terrenos para kitesurf no Cumbuco",
          "Casas em condomínio na Caucaia",
        ],
        alugar: [
          "Casas de Veraneio no Cumbuco (Kitesurf)",
          "Apartamentos de temporada no Cumbuco",
          "Casas pé na areia com piscina no Cumbuco",
          "Flats mobiliados no Cumbuco",
          "Bangalôs de praia por temporada",
        ],
      },
    ];

    const finalProperties =
      properties && properties.length > 0 ? properties : initialSampleProperties;

    return NextResponse.json(
      {
        properties: finalProperties,
        cidades: cidadesUnicas.length > 0 ? cidadesUnicas : ["Fortaleza", "Aquiraz", "Itajaí"],
        bairros: bairrosUnicos.length > 0 ? bairrosUnicos : ["Meireles", "Aldeota", "Porto das Dunas"],
        total: finalProperties.length,
        directory,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.warn("API /api/properties error, falling back to sample properties:", error?.message);
    return NextResponse.json(
      {
        properties: initialSampleProperties,
        cidades: ["Fortaleza", "Aquiraz", "Itajaí"],
        bairros: ["Meireles", "Aldeota", "Porto das Dunas"],
        total: initialSampleProperties.length,
        directory: [],
      },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const org = await prisma.organization.findFirst({
      where: { slug: "connect-platz" },
    });
    if (!org) {
      return NextResponse.json({ error: "Organização não encontrada." }, { status: 404 });
    }

    const body = await req.json();
    const {
      nome,
      tipoCadastro = "EMPREENDIMENTO",
      exibirNaLandingPage = true,
      modalidade = "VENDA",
      faixaPreco = "MEDIO",
      estagioObra,
      valorVenda,
      valorDiaria,
      taxaLimpeza,
      endereco,
      bairro,
      cidade,
      estado = "CE",
      descricao,
      fotos = [],
      caracteristicas = {},
      diferenciais = [],
      unidadesConfig,
    } = body;

    if (!nome) {
      return NextResponse.json({ error: "O nome é obrigatório." }, { status: 400 });
    }

    const slug = generateSlug(nome);

    const property = await prisma.property.create({
      data: {
        organizationId: org.id,
        nome,
        slug,
        tipoCadastro,
        exibirNaLandingPage: Boolean(exibirNaLandingPage),
        modalidade: modalidade as PropertyModality,
        faixaPreco: (faixaPreco as PriceRange) || PriceRange.MEDIO,
        estagioObra: estagioObra || (tipoCadastro === "AVULSO" ? "Pronto para Morar" : "Lançamento"),
        valorVenda: valorVenda ? Number(valorVenda) : null,
        valorDiaria: valorDiaria ? Number(valorDiaria) : null,
        taxaLimpeza: taxaLimpeza ? Number(taxaLimpeza) : null,
        endereco,
        bairro,
        cidade: cidade || "Fortaleza",
        estado: estado || "CE",
        descricao,
        fotos: fotos.length > 0 ? fotos : ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"],
        caracteristicas,
        diferenciais,
      },
    });

    // Se for empreendimento com geração de espelho de unidades
    if (tipoCadastro === "EMPREENDIMENTO" && unidadesConfig) {
      const { blocos = ["Torre A"], andares = 4, unidadesPorAndar = 4, valorBase = valorVenda || 800000, areaBase = 100 } = unidadesConfig;
      const unitEntries: any[] = [];

      for (const bloco of blocos) {
        for (let a = 1; a <= Number(andares); a++) {
          const pavimento = `${a}º Andar`;
          for (let u = 1; u <= Number(unidadesPorAndar); u++) {
            const numeroUnidade = `${a}0${u}`;
            unitEntries.push({
              propertyId: property.id,
              bloco,
              pavimento,
              numeroUnidade,
              status: UnitStatus.DISPONIVEL,
              valor: Number(valorBase) * (1 + (a - 1) * 0.02),
              areaPrivativa: Number(areaBase),
            });
          }
        }
      }

      if (unitEntries.length > 0) {
        await prisma.propertyUnit.createMany({
          data: unitEntries,
        });
      }
    }

    const createdWithUnits = await prisma.property.findUnique({
      where: { id: property.id },
      include: { units: true },
    });

    return NextResponse.json({ success: true, property: createdWithUnits }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao cadastrar imóvel:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao cadastrar imóvel/empreendimento." },
      { status: 500 }
    );
  }
}
