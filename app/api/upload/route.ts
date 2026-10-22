import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { requireSession } from "@/lib/auth/session";
import {
  MAX_FILES_PER_REQUEST,
  MAX_UPLOAD_BYTES,
  UPLOAD_FOLDERS,
  UPLOAD_ROOT,
  buildSafeFilename,
  formatFileSize,
  isUploadFolder,
  validateUpload,
} from "./uploadStorage";

export const dynamic = "force-dynamic";

/**
 * POST /api/upload (multipart): campos `files` (múltiplos) ou `file`, e `folder`
 * (materials | properties | site | leads | avatars). Exige sessão.
 * A requisição é atômica: se qualquer arquivo for inválido, nada é gravado.
 */
export async function POST(req: NextRequest) {
  const auth = requireSession(req);
  if (auth.error) return auth.error;

  // Rejeita cedo corpos claramente acima do limite total permitido
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_UPLOAD_BYTES * MAX_FILES_PER_REQUEST) {
    return NextResponse.json({ error: "Envio excede o tamanho máximo permitido." }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requisição multipart inválida." }, { status: 400 });
  }

  const rawFolder = formData.get("folder");
  const folder = rawFolder === null || rawFolder === "" ? "materials" : rawFolder;
  if (!isUploadFolder(folder)) {
    return NextResponse.json(
      { error: `Pasta de destino inválida. Use uma de: ${UPLOAD_FOLDERS.join(", ")}.` },
      { status: 400 }
    );
  }

  const files = [...formData.getAll("files"), formData.get("file")].filter(
    (f): f is File => typeof f === "object" && f !== null && "arrayBuffer" in f
  );
  if (files.length === 0) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }
  if (files.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json(
      { error: `Envie no máximo ${MAX_FILES_PER_REQUEST} arquivos por vez.` },
      { status: 400 }
    );
  }

  // 1. Valida todos antes de gravar qualquer um
  const prepared: { file: File; buffer: Buffer; ext: string; mime: string; category: string }[] = [];
  for (const file of files) {
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `"${file.name}" excede o limite de 25 MB por arquivo.` },
        { status: 413 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const check = validateUpload(file, buffer);
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
    prepared.push({ file, buffer, ext: check.kind.ext, mime: check.kind.mime, category: check.kind.category });
  }

  try {
    const uploadDir = join(UPLOAD_ROOT, folder);
    await mkdir(uploadDir, { recursive: true });

    const savedFiles = [];
    for (const item of prepared) {
      const filename = buildSafeFilename(item.file.name, item.ext);
      await writeFile(join(uploadDir, filename), item.buffer);
      savedFiles.push({
        url: `/uploads/${folder}/${filename}`,
        name: item.file.name,
        size: item.buffer.length,
        formattedSize: formatFileSize(item.buffer.length),
        mime: item.mime,
        type: item.category === "pdf" ? "pdf" : item.category === "image" ? "image" : "doc",
      });
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
    return NextResponse.json({ error: "Erro ao gravar os arquivos enviados." }, { status: 500 });
  }
}
