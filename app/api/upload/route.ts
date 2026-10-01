import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      // Também verifica se veio no singular "file"
      const singleFile = formData.get("file") as File;
      if (singleFile) {
        files.push(singleFile);
      } else {
        return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
      }
    }

    const uploadDir = join(process.cwd(), "public", "uploads", "properties");
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const savedUrls: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Sanitiza o nome do arquivo
      const extension = file.name.split(".").pop() || "jpg";
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .toLowerCase();
      const filename = `${Date.now()}_${cleanName}.${extension}`;
      const filePath = join(uploadDir, filename);

      await writeFile(filePath, buffer);
      savedUrls.push(`/uploads/properties/${filename}`);
    }

    if (savedUrls.length === 0) {
      return NextResponse.json(
        { error: "Nenhum formato de imagem válido foi processado." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, urls: savedUrls }, { status: 201 });
  } catch (error: any) {
    console.error("Erro no upload de arquivos:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao realizar upload dos anexos." },
      { status: 500 }
    );
  }
}
