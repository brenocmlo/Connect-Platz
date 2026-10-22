// app/api/upload/uploadStorage.ts
// Regras de armazenamento de uploads: pastas permitidas, tipos validados por assinatura
// (magic bytes), extensão derivada do tipo detectado e resolução segura de caminhos.

import { join, resolve, sep } from "path";

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB por arquivo
export const MAX_FILES_PER_REQUEST = 20;

export const UPLOAD_FOLDERS = ["materials", "properties", "site", "leads", "avatars"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const UPLOAD_ROOT = join(process.cwd(), "public", "uploads");

export function isUploadFolder(value: unknown): value is UploadFolder {
  return typeof value === "string" && (UPLOAD_FOLDERS as readonly string[]).includes(value);
}

interface FileKind {
  mime: string;
  ext: string;
  category: "image" | "pdf" | "doc" | "sheet";
  aliases?: string[];
}

const KINDS: Record<string, FileKind> = {
  pdf: { mime: "application/pdf", ext: "pdf", category: "pdf" },
  png: { mime: "image/png", ext: "png", category: "image" },
  jpeg: { mime: "image/jpeg", ext: "jpg", category: "image", aliases: ["image/jpg", "image/pjpeg"] },
  webp: { mime: "image/webp", ext: "webp", category: "image" },
  gif: { mime: "image/gif", ext: "gif", category: "image" },
  docx: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ext: "docx", category: "doc" },
  xlsx: { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ext: "xlsx", category: "sheet" },
  doc: { mime: "application/msword", ext: "doc", category: "doc" },
  xls: { mime: "application/vnd.ms-excel", ext: "xls", category: "sheet" },
};

// MIME types genéricos que alguns navegadores/SOs enviam para Office; o conteúdo decide.
const GENERIC_MIMES = ["", "application/octet-stream", "application/zip", "application/x-zip-compressed"];

const startsWith = (buf: Buffer, bytes: number[], offset = 0) =>
  buf.length >= offset + bytes.length && bytes.every((b, i) => buf[offset + i] === b);

/** Detecta o tipo real do arquivo pela assinatura. Retorna null para tipos não suportados. */
export function detectFileKind(buf: Buffer): FileKind | null {
  if (startsWith(buf, [0x25, 0x50, 0x44, 0x46, 0x2d])) return KINDS.pdf; // %PDF-
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return KINDS.png;
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return KINDS.jpeg;
  if (startsWith(buf, [0x52, 0x49, 0x46, 0x46]) && startsWith(buf, [0x57, 0x45, 0x42, 0x50], 8)) return KINDS.webp;
  if (startsWith(buf, [0x47, 0x49, 0x46, 0x38])) return KINDS.gif; // GIF8
  if (startsWith(buf, [0x50, 0x4b, 0x03, 0x04])) {
    // OOXML (zip): os nomes das entradas ficam em texto puro nos cabeçalhos locais
    const head = buf.subarray(0, Math.min(buf.length, 64 * 1024)).toString("latin1");
    if (!head.includes("[Content_Types].xml")) return null;
    if (head.includes("word/")) return KINDS.docx;
    if (head.includes("xl/")) return KINDS.xlsx;
    return null;
  }
  if (startsWith(buf, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) {
    // Documento OLE2 legado (.doc/.xls): decide pelo MIME declarado em validateUpload
    return KINDS.doc;
  }
  return null;
}

export type UploadValidation =
  | { ok: true; kind: FileKind }
  | { ok: false; status: 400 | 413 | 415; error: string };

/** Valida tamanho, tipo declarado e assinatura de um arquivo. */
export function validateUpload(file: File, buf: Buffer): UploadValidation {
  const name = file.name || "arquivo";
  if (file.size === 0 || buf.length === 0) {
    return { ok: false, status: 400, error: `"${name}" está vazio.` };
  }
  if (file.size > MAX_UPLOAD_BYTES || buf.length > MAX_UPLOAD_BYTES) {
    return { ok: false, status: 413, error: `"${name}" excede o limite de 25 MB por arquivo.` };
  }

  const declared = (file.type || "").toLowerCase();
  if (declared.includes("svg") || declared.includes("html") || declared.includes("xml") || declared.includes("javascript")) {
    return { ok: false, status: 415, error: `"${name}": SVG, HTML e scripts não são permitidos.` };
  }

  let kind = detectFileKind(buf);
  if (!kind) {
    return {
      ok: false,
      status: 415,
      error: `"${name}": formato não suportado ou conteúdo inválido. Envie PDF, PNG, JPG, WEBP, DOCX ou XLSX.`,
    };
  }
  if (kind === KINDS.doc && (declared === KINDS.xls.mime || /\.xls$/i.test(name))) kind = KINDS.xls;

  const matches = declared === kind.mime || kind.aliases?.includes(declared) || GENERIC_MIMES.includes(declared);
  if (!matches) {
    return { ok: false, status: 415, error: `"${name}": o conteúdo do arquivo não corresponde ao tipo informado (${declared}).` };
  }
  return { ok: true, kind };
}

/** Nome seguro: timestamp + base sanitizada + extensão derivada do tipo detectado. */
export function buildSafeFilename(originalName: string, ext: string): string {
  const base =
    (originalName || "arquivo")
      .replace(/\.[^/.]+$/, "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase()
      .slice(0, 50) || "arquivo";
  const rand = Math.random().toString(36).slice(2, 8);
  return `${Date.now()}_${rand}_${base}.${ext}`;
}

/**
 * Converte uma URL pública (/uploads/<pasta>/<arquivo>) no caminho físico, garantindo que
 * o resultado fique dentro de public/uploads/<pasta>. Retorna null se for inválida.
 */
export function resolveUploadPath(url: string, expectedFolder?: UploadFolder): string | null {
  const match = /^\/uploads\/([a-z]+)\/([A-Za-z0-9_.-]+)$/.exec(url || "");
  if (!match) return null;
  const [, folder, filename] = match;
  if (!isUploadFolder(folder) || (expectedFolder && folder !== expectedFolder)) return null;
  if (filename.includes("..")) return null;
  const folderDir = resolve(UPLOAD_ROOT, folder);
  const full = resolve(folderDir, filename);
  return full.startsWith(folderDir + sep) ? full : null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
