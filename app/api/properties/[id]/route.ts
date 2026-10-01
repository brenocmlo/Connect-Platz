import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

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
      },
      include: { units: true },
    });

    return NextResponse.json({ success: true, property: updated }, { status: 200 });
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
    await prisma.property.delete({
      where: { id },
    });

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
