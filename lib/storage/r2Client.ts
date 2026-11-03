// lib/storage/r2Client.ts
// Integração de Object Storage com Cloudflare R2 (compatível com API AWS S3) e CDN

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
}

let s3ClientInstance: S3Client | null = null;

function getS3Client(): S3Client {
  if (s3ClientInstance) return s3ClientInstance;

  const accountId = process.env.R2_ACCOUNT_ID || "";
  s3ClientInstance = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
  });

  return s3ClientInstance;
}

export interface UploadR2Params {
  key: string;
  buffer: Buffer;
  mimeType: string;
}

/**
 * Realiza o upload do buffer diretamente para o Cloudflare R2 e retorna a URL pública da CDN.
 */
export async function uploadToR2({ key, buffer, mimeType }: UploadR2Params): Promise<string> {
  const client = getS3Client();
  const bucket = process.env.R2_BUCKET_NAME || "";
  const publicBaseUrl = (process.env.R2_PUBLIC_URL || "").replace(/\/+$/, "");

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    CacheControl: "public, max-age=31536000, immutable",
  });

  await client.send(command);

  // Retorna a URL da CDN pública se configurada, ou fallback para caminho relativo
  if (publicBaseUrl) {
    return `${publicBaseUrl}/${key}`;
  }

  return `/uploads/${key}`;
}
