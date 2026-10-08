"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Paperclip,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  Download,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { useCrm } from "@/components/crm/CrmContext";

export interface LeadAttachmentFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  dataUrl?: string;
}

interface LeadAttachmentsSectionProps {
  lead: LeadDetail;
}

export function LeadAttachmentsSection({ lead }: LeadAttachmentsSectionProps) {
  const { setActionMessage } = useCrm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<LeadAttachmentFile[]>([]);

  // Carrega anexos persistidos ou amostras padrão vinculadas ao lead
  useEffect(() => {
    try {
      const storageKey = `lead_attachments_${lead.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setAttachments(JSON.parse(saved));
      } else {
        // Amostras iniciais realistas para homologação
        const defaultSample: LeadAttachmentFile[] = [
          {
            id: `att-${lead.id}-1`,
            name: `cnh_frente_verso_${lead.nome.toLowerCase().replace(/\s+/g, "_")}.pdf`,
            size: "1.24 MB",
            type: "application/pdf",
            uploadedAt: "Ontem às 15:30",
          },
          {
            id: `att-${lead.id}-2`,
            name: `comprovante_renda_holerite.pdf`,
            size: "840 KB",
            type: "application/pdf",
            uploadedAt: "Hoje às 10:15",
          },
        ];
        setAttachments(defaultSample);
        localStorage.setItem(storageKey, JSON.stringify(defaultSample));
      }
    } catch (e) {
      // Fallback
    }
  }, [lead.id, lead.nome]);

  const saveAttachments = (newAttachments: LeadAttachmentFile[]) => {
    setAttachments(newAttachments);
    try {
      localStorage.setItem(`lead_attachments_${lead.id}`, JSON.stringify(newAttachments));
    } catch (e) {
      // Fallback
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const filesArray = Array.from(e.target.files);
    const newItems: LeadAttachmentFile[] = filesArray.map((file) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      type: file.type || "application/pdf",
      uploadedAt: `Hoje às ${new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
    }));

    const updated = [...newItems, ...attachments];
    saveAttachments(updated);

    if (setActionMessage) {
      setActionMessage(
        `${newItems.length} arquivo(s) anexado(s) com sucesso ao lead ${lead.nome}!`
      );
      setTimeout(() => setActionMessage(null), 4000);
    }

    e.target.value = "";
  };

  const handleRemove = (id: string, name: string) => {
    const updated = attachments.filter((a) => a.id !== id);
    saveAttachments(updated);
    if (setActionMessage) {
      setActionMessage(`Anexo "${name}" removido.`);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleDownload = (att: LeadAttachmentFile) => {
    // Simula download de arquivo de documentação
    const blob = new Blob([`Documento Connect Platz: ${att.name}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = att.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          {attachments.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-connect-blue/10 text-connect-blue font-bold">
              {attachments.length}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
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

      {/* Lista de Documentos Anexados */}
      {attachments.length > 0 && (
        <div className="space-y-1.5">
          {attachments.map((att) => {
            const isImage = att.name.match(/\.(jpg|jpeg|png)$/i);

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
                      {att.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {att.size} • {att.uploadedAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownload(att)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-connect-blue hover:bg-connect-blue/10 transition-colors"
                    title="Baixar documento"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(att.id, att.name)}
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
