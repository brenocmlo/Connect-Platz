import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

export const dynamic = "force-dynamic";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const folder = (formData.get("folder") as string) || "materials";

    if (!files || files.length === 0) {
      const singleFile = formData.get("file") as File;
      if (singleFile) {
        files.push(singleFile);
      } else {
        return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
      }
    }

    const uploadDir = join(process.cwd(), "public", "uploads", folder);
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const savedFiles: {
      url: string;
      name: string;
      size: number;
      formattedSize: string;
      type: string;
    }[] = [];

    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    for (const file of files) {
      // Aceita imagens ou documentos da lista permitida
      const isAllowed = file.type.startsWith("image/") || allowedMimes.includes(file.type);
      if (!isAllowed) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Sanitiza o nome do arquivo preservando a extensão
      const originalExtension = file.name.split(".").pop() || "pdf";
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .toLowerCase()
        .slice(0, 50);

      const filename = `${Date.now()}_${cleanName}.${originalExtension}`;
      const filePath = join(uploadDir, filename);

      await writeFile(filePath, buffer);

      const url = `/uploads/${folder}/${filename}`;
      savedFiles.push({
        url,
        name: file.name,
        size: file.size,
        formattedSize: formatFileSize(file.size),
        type: file.type.includes("pdf") ? "pdf" : file.type.startsWith("image/") ? "image" : "doc",
      });
    }

    if (savedFiles.length === 0) {
      return NextResponse.json(
        { error: "Nenhum formato de arquivo permitido foi processado. Suportamos PDF, PNG, JPG, DOCX e XLSX." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        urls: savedFiles.map((f) => f.url),
        files: savedFiles,
        firstUrl: savedFiles[0].url,
        firstFile: savedFiles[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro no upload de arquivos:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao realizar upload dos anexos." },
      { status: 500 }
    );
  }
}
