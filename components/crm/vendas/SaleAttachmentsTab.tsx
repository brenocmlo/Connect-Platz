"use client";

import React, { useRef } from "react";
import { Upload, FileText, CheckCircle2, Trash2, Paperclip } from "lucide-react";

export interface SaleAttachment {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
}

interface SaleAttachmentsTabProps {
  attachments: SaleAttachment[];
  onAddAttachments: (files: FileList) => void;
  onRemoveAttachment: (id: string) => void;
}

export function SaleAttachmentsTab({
  attachments,
  onAddAttachments,
  onRemoveAttachment,
}: SaleAttachmentsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddAttachments(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Input oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        className="hidden"
      />

      {/* Dropzone interativa */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 dark:border-[#242C3D] hover:border-connect-blue dark:hover:border-connect-blue rounded-2xl p-6 text-center space-y-2 cursor-pointer transition-all bg-slate-50/50 dark:bg-[#0E1726]/50 group"
      >
        <div className="w-12 h-12 rounded-xl bg-connect-blue/10 text-connect-blue flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
          <Upload className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
          Clique ou arraste arquivos para anexar
        </span>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Contrato de compra e venda assinado, espelho da proposta, comprovante de TED/PIX (PDF, PNG, JPG até 10 MB cada).
        </p>
      </div>

      {/* Lista de Arquivos Anexados */}
      {attachments.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-connect-blue" />
              Arquivos Anexados ({attachments.length})
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1726] border border-slate-200 dark:border-[#1F2937] text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {att.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {att.size} • Anexado em {att.uploadedAt}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveAttachment(att.id);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Remover anexo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground text-center">
          Nenhum documento anexado ainda para esta venda.
        </div>
      )}
    </div>
  );
}
