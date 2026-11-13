"use client";

import React, { useRef, useState } from "react";
import { Building2, Loader2, RotateCcw, Upload } from "lucide-react";

interface SiteVitrineCardPreviewProps {
  titulo: string;
  tag: string;
  eyebrow: string;
  previewFoto: string;
  hasCustomFoto: boolean;
  hasLinkedProperty: boolean;
  onChangeFoto: (url: string) => void;
}

export function SiteVitrineCardPreview({
  titulo,
  tag,
  eyebrow,
  previewFoto,
  hasCustomFoto,
  hasLinkedProperty,
  onChangeFoto,
}: SiteVitrineCardPreviewProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setUploadError("Selecione uma imagem PNG, JPG ou WebP.");
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "site");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.urls?.[0]) {
        setUploadError(data?.error || "Erro ao enviar foto.");
        return;
      }
      onChangeFoto(data.urls[0]);
    } catch {
      setUploadError("Falha de conexão ao enviar imagem.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-border bg-card text-center shadow-sm">
        <div className="relative aspect-[7/6]">
          <div className="h-full w-full overflow-hidden rounded-t-xl bg-muted">
            {previewFoto ? (
              <img src={previewFoto} alt={titulo} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                <Building2 className="h-6 w-6 text-connect-blue/40" />
                <span className="mt-1 text-[10px] font-semibold">Sem foto</span>
              </div>
            )}
          </div>
          <span className="absolute bottom-0 left-3 z-10 max-w-[calc(100%-1.5rem)] translate-y-1/2 truncate rounded-md bg-slate-900 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
            {tag || "DESTAQUE"}
          </span>
        </div>
        <div className="px-2.5 pb-3 pt-4">
          <span className="block truncate text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
            {eyebrow || "IMÓVEIS"}
          </span>
          <span className="mt-0.5 block truncate text-[11px] font-bold uppercase text-foreground">
            {titulo || "Título do Card"}
          </span>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2 text-[11px] font-bold text-foreground hover:border-connect-blue/50 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3 text-connect-blue" />}
          <span>{uploading ? "Enviando..." : hasCustomFoto ? "Trocar foto" : "Foto customizada"}</span>
        </button>
        {hasCustomFoto && hasLinkedProperty && (
          <button
            type="button"
            onClick={() => onChangeFoto("")}
            title="Voltar para a foto original do imóvel"
            aria-label="Restaurar foto original do imóvel"
            className="flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        )}
      </div>
      {uploadError && <p className="text-[11px] font-medium text-red-500">{uploadError}</p>}
    </div>
  );
}
