import { NextRequest, NextResponse } from "next/server";
import { fetchAddressByCep } from "@/lib/services/location";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { cep: string } }
) {
  try {
    const rawCep = params.cep;
    if (!rawCep) {
      return NextResponse.json({ error: "CEP não informado" }, { status: 400 });
    }

    const cleanCep = rawCep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      return NextResponse.json(
        { error: "CEP inválido. Deve conter exatamente 8 dígitos numéricos." },
        { status: 400 }
      );
    }

    const address = await fetchAddressByCep(cleanCep);
    if (!address) {
      return NextResponse.json(
        { error: "CEP não localizado nas bases da BrasilAPI e ViaCEP." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: address },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
        },
      }
    );
  } catch (err: any) {
    console.error("Erro na consulta de CEP:", err);
    return NextResponse.json(
      { error: "Falha interna ao processar consulta de CEP" },
      { status: 500 }
    );
  }
}
