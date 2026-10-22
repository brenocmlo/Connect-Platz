import { NextRequest, NextResponse } from "next/server";
import { getPropertyLocationDetails } from "@/lib/services/location";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || undefined;
    const cep = searchParams.get("cep") || undefined;
    const bairro = searchParams.get("bairro") || undefined;
    const cidade = searchParams.get("cidade") || undefined;
    const estado = searchParams.get("estado") || undefined;
    const endereco = searchParams.get("endereco") || undefined;

    const data = await getPropertyLocationDetails({
      slug,
      cep,
      bairro,
      cidade,
      estado,
      endereco,
    });

    return NextResponse.json(
      { success: true, data },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
        },
      }
    );
  } catch (err: any) {
    console.error("Erro ao resolver localização do imóvel:", err);
    return NextResponse.json(
      { error: "Falha ao consultar API de localização" },
      { status: 500 }
    );
  }
}
