"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, Star, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadZoneProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

export function ImageUploadZone({
  images,
  onChange,
  maxImages = 12,
  label = "Fotos & Anexos do Imóvel",
}: ImageUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.urls) {
        onChange([...images, ...data.urls].slice(0, maxImages));
      } else {
        alert(data.error || "Erro ao fazer upload das imagens.");
      }
    } catch (err) {
      console.error(err);
      alert("Falha de conexão ao enviar arquivos.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const selected = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([selected, ...rest]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider">
          {label}
        </label>
        <span className="text-[11px] text-slate-400">
          {images.length} de {maxImages} fotos anexadas
        </span>
      </div>

      {/* Caixa de Upload Drag & Drop */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-connect-blue bg-connect-blue/10 scale-[1.01]"
            : "border-[#1C2537] hover:border-connect-blue/50 bg-[#080C14] hover:bg-[#0A0E17]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          {uploading ? (
            <div className="flex flex-col items-center space-y-2 text-connect-blue">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-xs font-bold">Enviando e processando anexos...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-connect-blue/15 flex items-center justify-center text-connect-blue mb-1">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-extrabold text-white">
                Clique para anexar imagens ou arraste para cá
              </p>
              <p className="text-[11px] text-slate-500">
                Suporta PNG, JPG, JPEG e WebP (até 10MB por foto)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Grid de Miniaturas Anexadas */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="relative group rounded-xl overflow-hidden border border-[#1C2537] bg-[#0A0E17] aspect-video"
            >
              <img src={url} alt={`Anexo ${idx + 1}`} className="w-full h-full object-cover" />

              {/* Tag de Foto Principal */}
              {idx === 0 && (
                <span className="absolute top-1 left-1 bg-[#D9BB4C] text-black text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow">
                  Capa
                </span>
              )}

              {/* Ações no Hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetPrimary(idx);
                    }}
                    className="p-1 rounded bg-[#111827] text-[#D9BB4C] hover:bg-[#D9BB4C] hover:text-black transition-colors"
                    title="Definir como foto de capa"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(idx);
                  }}
                  className="p-1 rounded bg-red-950 text-red-400 hover:bg-red-800 hover:text-white transition-colors"
                  title="Remover foto"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
