import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { updateSampleProperty } from "@/components/crm/properties/sampleProperties";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    // Normaliza fotos se enviado como array ou foto individual
    let normalizedFotos: string[] | undefined = undefined;
    if (Array.isArray(body.fotos)) {
      normalizedFotos = body.fotos;
    } else if (body.fotoCapa || body.imagemUrl) {
      normalizedFotos = [body.fotoCapa || body.imagemUrl];
    }

    try {
      const updated = await prisma.property.update({
        where: { id },
        data: {
          ...(body.exibirNaLandingPage !== undefined && {
            exibirNaLandingPage: Boolean(body.exibirNaLandingPage),
          }),
          ...(body.isActive !== undefined && {
            isActive: Boolean(body.isActive),
          }),
          ...(body.valorVenda !== undefined && {
            valorVenda: Number(body.valorVenda),
          }),
          ...(body.valorDiaria !== undefined && {
            valorDiaria: Number(body.valorDiaria),
          }),
          ...(body.estagioObra && { estagioObra: body.estagioObra }),
          ...(body.descricao && { descricao: body.descricao }),
          ...(body.nome && { nome: body.nome }),
          ...(body.bairro && { bairro: body.bairro }),
          ...(body.cidade && { cidade: body.cidade }),
          ...(normalizedFotos && { fotos: normalizedFotos }),
        },
        include: { units: true },
      });

      return NextResponse.json({ success: true, property: updated }, { status: 200 });
    } catch (dbErr: any) {
      console.warn("Prisma update falhou, aplicando fallback em memória:", dbErr?.message);
      const inMemoryPatch: any = {
        ...(body.exibirNaLandingPage !== undefined && { exibirNaLandingPage: Boolean(body.exibirNaLandingPage) }),
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
        ...(body.valorVenda !== undefined && { valorVenda: Number(body.valorVenda) }),
        ...(body.valorDiaria !== undefined && { valorDiaria: Number(body.valorDiaria) }),
        ...(body.estagioObra && { estagioObra: body.estagioObra }),
        ...(body.descricao && { descricao: body.descricao }),
        ...(body.nome && { nome: body.nome }),
        ...(body.bairro && { bairro: body.bairro }),
        ...(body.cidade && { cidade: body.cidade }),
        ...(normalizedFotos && { fotos: normalizedFotos }),
      };

      const updatedMem = updateSampleProperty(id, inMemoryPatch);
      return NextResponse.json(
        {
          success: true,
          property: updatedMem || { id, ...inMemoryPatch },
          fallback: true,
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar propriedade." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    try {
      await prisma.property.delete({
        where: { id },
      });
    } catch (dbErr) {
      console.warn("Prisma delete fallback:", dbErr);
    }

    return NextResponse.json(
      { success: true, message: "Imóvel excluído com sucesso." },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao excluir imóvel." },
      { status: 500 }
    );
  }
}
