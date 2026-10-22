"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Check,
  ImageIcon,
  Loader2,
  Building2,
} from "lucide-react";
import { PropertyCardData } from "./PropertyProductCard";
import { PropertyImagePresets } from "./PropertyImagePresets";

interface EditPropertyImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyCardData | null;
  onSuccess: (updatedProperty: PropertyCardData) => void;
}

export function EditPropertyImageModal({
  isOpen,
  onClose,
  property,
  onSuccess,
}: EditPropertyImageModalProps) {
  const [selectedImage, setSelectedImage] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"UPLOAD" | "PRESETS" | "URL">("UPLOAD");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (property) {
      const currentCover =
        property.fotos && property.fotos.length > 0 ? property.fotos[0] : "";
      setSelectedImage(currentCover);
      setUrlInput(currentCover);
    }
  }, [property]);

  if (!isOpen || !property) return null;

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione uma imagem válida (PNG, JPG, WebP).");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "properties");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.urls && data.urls.length > 0) {
        const uploadedUrl = data.urls[0];
        setSelectedImage(uploadedUrl);
        setUrlInput(uploadedUrl);
      } else {
        alert(data.error || "Erro no upload da imagem.");
      }
    } catch (err) {
      console.error(err);
      alert("Falha de conexão ao enviar imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setSelectedImage(urlInput.trim());
    }
  };

  const handleSave = async () => {
    if (!selectedImage) {
      alert("Selecione ou faça upload de uma imagem para o imóvel.");
      return;
    }

    setIsSaving(true);
    try {
      const otherPhotos = (property.fotos || []).filter((f) => f !== selectedImage);
      const newFotos = [selectedImage, ...otherPhotos];

      const res = await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fotos: newFotos }),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = data.property || {
          ...property,
          fotos: newFotos,
        };
        onSuccess(updated);
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Erro ao salvar foto do imóvel.");
      }
    } catch (err) {
      console.error("Erro ao atualizar imagem do imóvel:", err);
      alert("Falha ao salvar alterações de imagem.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header do Modal */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-connect-blue/10 flex items-center justify-center text-connect-blue">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Alterar Imagem do Imóvel
              </h2>
              <p className="text-xs text-muted-foreground truncate max-w-xs">
                {property.nome} • {property.bairro || "Centro"}, {property.cidade || "Fortaleza"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-5 space-y-5 flex-1">
          {/* 1. Preview da Imagem Selecionada */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">
              Visualização da Imagem de Capa
            </label>
            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border bg-muted/40 flex items-center justify-center">
              {selectedImage ? (
                <>
                  <img
                    src={selectedImage}
                    alt={property.nome}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-platz-gold text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                    Foto de Capa
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground/60 p-4">
                  <Building2 className="w-10 h-10 mx-auto mb-1 text-connect-blue/30" />
                  <span className="text-xs font-semibold">Nenhuma imagem selecionada</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. Seletores de Origem da Imagem (Upload, Presets, URL) */}
          <div className="bg-muted/50 p-1 rounded-xl flex items-center gap-1 border border-border/50 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("UPLOAD")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "UPLOAD"
                  ? "bg-card text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-connect-blue" />
              <span>Enviar Imagem</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("PRESETS")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "PRESETS"
                  ? "bg-card text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-platz-gold" />
              <span>Presets Rápidos</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("URL")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "URL"
                  ? "bg-card text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>Link Direto</span>
            </button>
          </div>

          {/* 3. Conteúdo da Aba Ativa */}
          {activeTab === "UPLOAD" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-connect-blue/60 rounded-xl p-6 text-center cursor-pointer bg-card/60 hover:bg-muted/40 transition-all flex flex-col items-center justify-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-connect-blue">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs font-bold">Processando upload...</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-connect-blue/10 flex items-center justify-center text-connect-blue">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Clique para escolher uma imagem
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      PNG, JPG ou WebP (máx. 10MB)
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "PRESETS" && (
            <PropertyImagePresets
              selectedImage={selectedImage}
              onSelect={(url) => setSelectedImage(url)}
            />
          )}

          {activeTab === "URL" && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">
                Cole a URL pública da imagem:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://exemplo.com/foto-do-imovel.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-2 rounded-lg bg-connect-blue/10 hover:bg-connect-blue text-connect-blue hover:text-white border border-connect-blue/30 text-xs font-bold transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé de Ações */}
        <div className="p-4 border-t border-border flex items-center justify-end gap-2.5 bg-muted/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !selectedImage}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-connect-blue hover:bg-[#0D478F] text-white shadow-md shadow-connect-blue/20 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Salvar Nova Capa</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
