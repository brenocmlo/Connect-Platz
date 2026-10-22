import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  buildAddressFormatted,
  getGoogleMapsNavigationUrl,
  getPropertyLocationDetails,
  getWazeNavigationUrl,
  hasLocationInput,
  resolvePropertyCoordinates,
} from "@/lib/services/location";

export const dynamic = "force-dynamic";

const optionalCoord = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number().finite().optional()
);

const RouteSchema = z.object({
  endereco: z.string().trim().max(300).optional().nullable(),
  bairro: z.string().trim().max(120).optional().nullable(),
  cidade: z.string().trim().max(120).optional().nullable(),
  estado: z.string().trim().max(60).optional().nullable(),
  cep: z.string().trim().max(10).optional().nullable(),
  latitude: optionalCoord,
  longitude: optionalCoord,
});

/**
 * GET /api/location/property?slug=... | ?cep=...&endereco=...&bairro=...&cidade=...
 * Detalhes de localização (endereço, coordenadas, mapa, rotas). Sem dados => 400.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug")?.trim();
    const input: Record<string, any> = {
      cep: searchParams.get("cep"),
      bairro: searchParams.get("bairro"),
      cidade: searchParams.get("cidade"),
      estado: searchParams.get("estado"),
      endereco: searchParams.get("endereco"),
      latitude: searchParams.get("latitude") ? Number(searchParams.get("latitude")) : undefined,
      longitude: searchParams.get("longitude") ? Number(searchParams.get("longitude")) : undefined,
    };

    // Imóvel publicado: usa os dados cadastrados (CEP e coordenadas reais)
    if (slug) {
      const property = await prisma.property.findFirst({
        where: { slug, isActive: true },
        select: { cep: true, bairro: true, cidade: true, estado: true, endereco: true, latitude: true, longitude: true },
      });
      if (property) {
        for (const [key, value] of Object.entries(property)) {
          if (value !== null && value !== undefined && value !== "") input[key] = value;
        }
      }
    }

    const data = await getPropertyLocationDetails(input);
    if (!data) {
      return NextResponse.json(
        { error: "Informe CEP, endereço, bairro ou coordenadas do imóvel." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200, headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200" } }
    );
  } catch (err: any) {
    console.error("Erro ao resolver localização do imóvel:", err);
    return NextResponse.json({ error: "Falha ao consultar API de localização" }, { status: 500 });
  }
}

/**
 * POST /api/location/property
 * Body: { endereco, latitude?, longitude?, cep?, bairro?, cidade?, estado? }
 * Retorna { wazeUrl, googleMapsUrl, addressFormatted, latitude, longitude } (geocodifica se faltar coordenada).
 */
export async function POST(req: NextRequest) {
  try {
    const raw = await req.json().catch(() => null);
    const parsed = RouteSchema.safeParse(raw || {});
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados de localização inválidos.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const input = parsed.data;
    if (!hasLocationInput(input)) {
      return NextResponse.json(
        { error: "Informe o endereço, o CEP ou as coordenadas do imóvel." },
        { status: 400 }
      );
    }

    const coords = await resolvePropertyCoordinates(input);
    const cepData = coords.cepData;
    const addressFormatted = buildAddressFormatted({
      endereco: input.endereco || cepData?.logradouro,
      bairro: input.bairro || cepData?.bairro,
      cidade: input.cidade || cepData?.cidade,
      estado: input.estado || cepData?.uf,
      cep: input.cep,
    });
    const nav = { latitude: coords.latitude, longitude: coords.longitude, address: addressFormatted };

    return NextResponse.json(
      {
        success: true,
        wazeUrl: getWazeNavigationUrl(nav),
        googleMapsUrl: getGoogleMapsNavigationUrl(nav),
        addressFormatted,
        latitude: coords.latitude ?? null,
        longitude: coords.longitude ?? null,
        service: coords.service ?? null,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Erro ao gerar rotas do imóvel:", err);
    return NextResponse.json({ error: "Falha ao gerar rotas do imóvel." }, { status: 500 });
  }
}
