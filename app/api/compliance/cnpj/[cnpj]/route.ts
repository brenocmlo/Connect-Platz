import { NextRequest, NextResponse } from "next/server";
import { fetchCnpjData, validateCnpj } from "@/lib/services/compliance";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { cnpj: string } }
) {
  try {
    const rawCnpj = params.cnpj;
    if (!rawCnpj) {
      return NextResponse.json({ error: "CNPJ não informado" }, { status: 400 });
    }

    const cleanCnpj = rawCnpj.replace(/\D/g, "");
    if (!validateCnpj(cleanCnpj)) {
      return NextResponse.json(
        { error: "CNPJ inválido de acordo com a validação do Módulo 11 da Receita Federal." },
        { status: 400 }
      );
    }

    const cnpjData = await fetchCnpjData(cleanCnpj);
    if (!cnpjData) {
      return NextResponse.json(
        { error: "Dados cadastrais do CNPJ não foram localizados na Receita Federal." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: cnpjData },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
        },
      }
    );
  } catch (err: any) {
    console.error("Erro na consulta de CNPJ:", err);
    return NextResponse.json(
      { error: "Falha interna ao consultar base cadastral da Receita Federal." },
      { status: 500 }
    );
  }
}
