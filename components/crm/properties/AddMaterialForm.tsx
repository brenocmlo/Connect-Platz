"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Link2, FileCheck2, Loader2 } from "lucide-react";
import { MAX_MATERIAL_BYTES, MaterialCategoria, formatBytes } from "./usePropertyMaterials";

interface AddMaterialFormProps {
  onAddFile: (file: File, titulo: string, categoria: MaterialCategoria) => Promise<unknown>;
  onAddLink: (url: string, titulo: string, categoria: MaterialCategoria) => Promise<unknown>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddMaterialForm({ onAddFile, onAddLink, onSuccess, onCancel }: AddMaterialFormProps) {
  const [uploadMode, setUploadMode] = useState<"file" | "link">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState<MaterialCategoria>("BOOK");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_MATERIAL_BYTES) {
      setSelectedFile(null);
      setUploadError(`"${file.name}" tem ${formatBytes(file.size)} e excede o limite de 25 MB.`);
      e.target.value = "";
      return;
    }
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

    if (uploadMode === "file" && !selectedFile) {
      setUploadError("Selecione um arquivo PDF ou documento para anexar.");
      return;
    }
    if (uploadMode === "link" && !/^https:\/\//i.test(newUrl.trim())) {
      setUploadError("Informe um link https do documento ou repositório em nuvem.");
      return;
    }

    setUploading(true);
    try {
      if (uploadMode === "file" && selectedFile) {
        await onAddFile(selectedFile, newTitle.trim() || selectedFile.name, newCategory);
      } else {
        await onAddLink(newUrl.trim(), newTitle.trim() || "Documento", newCategory);
      }
      onSuccess();
    } catch (err: any) {
      setUploadError(err.message || "Falha ao salvar o material.");
    } finally {
      setUploading(false);
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
            accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx"
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
                  ({formatBytes(selectedFile.size)})
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <UploadCloud className="w-6 h-6 mx-auto text-connect-blue" />
                <p className="font-semibold text-foreground">
                  Clique para selecionar o PDF, planta ou documento
                </p>
                <p className="text-[10px] text-muted-foreground">
                  PDF, DOCX, XLSX, PNG, JPG ou WEBP (até 25 MB)
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
              <span>{uploadMode === "file" ? "Enviando arquivo..." : "Salvando..."}</span>
            </>
          ) : (
            <span>Salvar Anexo</span>
          )}
        </button>
      </div>
    </form>
  );
}
