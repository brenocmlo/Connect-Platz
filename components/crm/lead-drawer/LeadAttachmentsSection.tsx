"use client";

import React, { useRef } from "react";
import {
  Paperclip,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  Download,
  Plus,
  Loader2,
} from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { useCrm } from "@/components/crm/CrmContext";
import { useLeadDocuments, formatBytes } from "./useLeadDocuments";

interface LeadAttachmentsSectionProps {
  lead: LeadDetail;
}

export function LeadAttachmentsSection({ lead }: LeadAttachmentsSectionProps) {
  const { setActionMessage } = useCrm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { documents: attachments, isLoading, busy, error, upload, remove } = useLeadDocuments(lead.id);

  const flash = (msg: string) => {
    if (!setActionMessage) return;
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    const count = await upload(files, "anexo");
    if (count > 0) flash(`${count} arquivo(s) anexado(s) ao lead ${lead.nome}.`);
  };

  const handleRemove = async (id: string, name: string) => {
    if (await remove(id)) flash(`Anexo "${name}" removido.`);
  };

  return (
    <div className="space-y-2.5">
      {/* Input oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        className="hidden"
      />

      {/* Cabeçalho da Seção */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Paperclip className="w-4 h-4 text-connect-blue" />
          <span>Anexos & Documentos</span>
          {(isLoading || busy) && <Loader2 className="w-3.5 h-3.5 animate-spin text-connect-blue" />}
          {attachments.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-connect-blue/10 text-connect-blue font-bold">
              {attachments.length}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="text-xs font-bold text-connect-blue hover:text-connect-deep-blue flex items-center gap-1 hover:underline"
        >
          <Plus className="w-3.5 h-3.5" />
          Anexar
        </button>
      </div>

      {/* Dropzone de Upload */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border hover:border-connect-blue/60 bg-muted/20 hover:bg-muted/40 rounded-xl p-4 text-center cursor-pointer transition-all space-y-1.5 group"
      >
        <div className="w-9 h-9 rounded-lg bg-connect-blue/10 text-connect-blue flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
          <Upload className="w-4 h-4" />
        </div>
        <p className="text-xs font-bold text-foreground">
          Clique ou arraste para anexar documentos
        </p>
        <p className="text-[10px] text-muted-foreground">
          RG, CPF, Holerites, Comprovantes de Renda (PDF, PNG, JPG até 10 MB)
        </p>
      </div>

      {error && (
        <p className="text-[11px] text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-2.5 py-1.5">
          {error}
        </p>
      )}

      {/* Lista de Documentos Anexados */}
      {attachments.length > 0 && (
        <div className="space-y-1.5">
          {attachments.map((att) => {
            const isImage = att.mimeType?.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(att.nomeArquivo);

            return (
              <div
                key={att.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border hover:border-connect-blue/30 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-connect-blue/10 text-connect-blue flex items-center justify-center shrink-0">
                    {isImage ? <ImageIcon className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate max-w-[190px]">
                      {att.nomeArquivo}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {[formatBytes(att.fileSize), new Date(att.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={att.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={att.nomeArquivo}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-connect-blue hover:bg-connect-blue/10 transition-colors"
                    title="Baixar documento"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemove(att.id, att.nomeArquivo)}
                    disabled={busy}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Remover anexo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
