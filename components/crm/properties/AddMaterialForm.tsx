"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Link2, FileCheck2, Loader2 } from "lucide-react";
import { PropertyMaterialItem } from "./PropertyMaterialsModal";

interface AddMaterialFormProps {
  onSuccess: (newItem: PropertyMaterialItem) => void;
  onCancel: () => void;
}

export function AddMaterialForm({ onSuccess, onCancel }: AddMaterialFormProps) {
  const [uploadMode, setUploadMode] = useState<"file" | "link">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState<PropertyMaterialItem["categoria"]>("BOOK");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadError(null);
    if (!newTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setNewTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (uploadMode === "file") {
      if (!selectedFile) {
        setUploadError("Selecione um arquivo PDF ou documento para anexar.");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("folder", "materials");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Erro no upload do arquivo.");
        }

        const uploadedFile = data.firstFile;
        const newItem: PropertyMaterialItem = {
          id: `mat-${Date.now()}`,
          titulo: newTitle.trim() || selectedFile.name,
          categoria: newCategory,
          tamanho: uploadedFile.formattedSize || "1.5 MB",
          dataAtualizacao: "Agora",
          url: uploadedFile.url,
          tipo: "pdf",
        };

        onSuccess(newItem);
      } catch (err: any) {
        setUploadError(err.message || "Falha ao enviar arquivo.");
      } finally {
        setUploading(false);
      }
    } else {
      if (!newUrl.trim()) {
        setUploadError("Informe a URL do documento ou repositório em nuvem.");
        return;
      }
      const newItem: PropertyMaterialItem = {
        id: `mat-${Date.now()}`,
        titulo: newTitle.trim() || "Documento Oficial",
        categoria: newCategory,
        tamanho: "Link Web",
        dataAtualizacao: "Agora",
        url: newUrl.trim(),
        tipo: "link",
      };
      onSuccess(newItem);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-muted/40 border border-border rounded-xl space-y-3 text-xs animate-in fade-in-0"
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-foreground">Adicionar Novo Arquivo / Anexo</span>
        <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setUploadMode("file")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
              uploadMode === "file" ? "bg-connect-blue text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UploadCloud className="w-3 h-3" /> Arquivo Local
          </button>
          <button
            type="button"
            onClick={() => setUploadMode("link")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
              uploadMode === "link" ? "bg-connect-blue text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Link2 className="w-3 h-3" /> Link em Nuvem
          </button>
        </div>
      </div>

      {uploadMode === "file" ? (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-connect-blue/30 hover:border-connect-blue rounded-xl p-4 text-center cursor-pointer bg-connect-blue/5 hover:bg-connect-blue/10 transition-colors"
          >
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2 text-connect-blue font-bold">
                <FileCheck2 className="w-5 h-5 text-emerald-500" />
                <span className="truncate max-w-[320px]">{selectedFile.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <UploadCloud className="w-6 h-6 mx-auto text-connect-blue" />
                <p className="font-semibold text-foreground">
                  Clique para selecionar o PDF, planta ou documento
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Suporta PDF, DOCX, XLSX e Imagens (até 25 MB)
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <input
            type="url"
            placeholder="URL do documento ou nuvem (ex: https://drive.google.com/...)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
            required
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <input
          type="text"
          placeholder="Título (ex.: Tabela Promocional Outubro)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
          required
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value as any)}
          className="bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none cursor-pointer"
        >
          <option value="BOOK">Book / Apresentação</option>
          <option value="TABELA">Tabela de Preços</option>
          <option value="MEMORIAL">Memorial Descritivo</option>
          <option value="PLANTAS">Plantas / Implantação</option>
          <option value="DOCUMENTO">Documento / Contrato</option>
        </select>
      </div>

      {uploadError && <p className="text-[11px] text-red-500 font-semibold">{uploadError}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={uploading}
          className="px-4 py-1.5 rounded-lg bg-connect-blue text-white font-bold hover:bg-connect-blue/90 disabled:opacity-60 flex items-center gap-1.5"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Enviando arquivo...</span>
            </>
          ) : (
            <span>Salvar Anexo</span>
          )}
        </button>
      </div>
    </form>
  );
}
