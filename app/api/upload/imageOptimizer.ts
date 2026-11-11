// app/api/upload/imageOptimizer.ts
// Conversão e redimensionamento automático de imagens enviadas para formato WebP com Sharp.
// Corrige orientação EXIF, remove metadados/GPS (LGPD) e preserva transparência (PNG).

import sharp from "sharp";
import type { UploadFolder } from "./uploadStorage";

export interface ImagePreset {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

const FOLDER_PRESETS: Record<UploadFolder, ImagePreset> = {
  avatars: { maxWidth: 800, maxHeight: 800, quality: 85 },
  logos: { maxWidth: 1000, maxHeight: 1000, quality: 88 },
  properties: { maxWidth: 1920, maxHeight: 1920, quality: 82 },
  site: { maxWidth: 1920, maxHeight: 1920, quality: 82 },
  materials: { maxWidth: 1920, maxHeight: 1920, quality: 82 },
  leads: { maxWidth: 2048, maxHeight: 2048, quality: 85 },
};

export interface OptimizeImageInput {
  buffer: Buffer;
  mime: string;
  ext: string;
  folder: UploadFolder;
}

export interface OptimizeImageResult {
  buffer: Buffer;
  mime: string;
  ext: string;
  originalSize: number;
  optimizedSize: number;
  converted: boolean;
  width?: number;
  height?: number;
}

export function getPresetForFolder(folder: UploadFolder): ImagePreset {
  return FOLDER_PRESETS[folder] || FOLDER_PRESETS.properties;
}

export function replaceFileExtension(filename: string, newExt: string): string {
  const cleanName = (filename || "arquivo").trim();
  if (/\.[^/.]+$/.test(cleanName)) {
    return cleanName.replace(/\.[^/.]+$/, `.${newExt}`);
  }
  return `${cleanName}.${newExt}`;
}

/**
 * Converte imagens raster (PNG, JPEG, WebP, GIF estático) para WebP otimizado
 * respeitando dimensões máximas por pasta, orientação EXIF e canal alfa.
 * GIFs animados (pages > 1) são preservados no formato original para manter a animação.
 */
export async function optimizeImageToWebp(
  input: OptimizeImageInput
): Promise<OptimizeImageResult> {
  const { buffer, mime, ext, folder } = input;
  const originalSize = buffer.length;
  const preset = getPresetForFolder(folder);

  try {
    const meta = await sharp(buffer, { animated: true, limitInputPixels: 100_000_000 }).metadata();

    if (mime === "image/gif" && (meta.pages ?? 1) > 1) {
      return {
        buffer,
        mime,
        ext,
        originalSize,
        optimizedSize: originalSize,
        converted: false,
        width: meta.width,
        height: meta.pageHeight || meta.height,
      };
    }

    const needsResize =
      (meta.width ?? 0) > preset.maxWidth || (meta.height ?? 0) > preset.maxHeight;

    let pipeline = sharp(buffer, { limitInputPixels: 100_000_000 }).rotate();

    if (needsResize) {
      pipeline = pipeline.resize({
        width: preset.maxWidth,
        height: preset.maxHeight,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    const { data: webpBuffer, info } = await pipeline
      .webp({
        quality: preset.quality,
        alphaQuality: 100,
        effort: 4,
        smartSubsample: true,
      })
      .toBuffer({ resolveWithObject: true });

    if (mime === "image/webp" && !needsResize && !meta.exif && webpBuffer.length >= originalSize) {
      return {
        buffer,
        mime: "image/webp",
        ext: "webp",
        originalSize,
        optimizedSize: originalSize,
        converted: false,
        width: meta.width,
        height: meta.height,
      };
    }

    return {
      buffer: webpBuffer,
      mime: "image/webp",
      ext: "webp",
      originalSize,
      optimizedSize: webpBuffer.length,
      converted: true,
      width: info.width,
      height: info.height,
    };
  } catch (error) {
    console.warn("[UPLOAD/WEBP] Falha ao otimizar imagem; mantendo original validado:", error);
    return {
      buffer,
      mime,
      ext,
      originalSize,
      optimizedSize: originalSize,
      converted: false,
    };
  }
}
