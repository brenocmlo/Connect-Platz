"use client";

import React, { useState, useRef } from "react";
import { Upload, CheckCircle2, FileText, Trash2 } from "lucide-react";

interface DocumentSlot {
  id: string;
  label: string;
  uploaded: boolean;
  fileName?: string;
}

const initialDocs: DocumentSlot[] = [
  { id: "rg", label: "Documento de Identidade (RG/CNH)", uploaded: true, fileName: "cnh_frente_verso.pdf" },
  { id: "cpf", label: "CPF", uploaded: true, fileName: "cpf_regular.pdf" },
  { id: "renda", label: "Comprovante de Renda / Holerite", uploaded: false },
  { id: "estado_civil", label: "Certidão de Estado Civil", uploaded: false },
  { id: "fgts", label: "Extrato do FGTS", uploaded: false },
  { id: "irpf", label: "Declaração de IRPF + Recibo", uploaded: false },
];

export function LeadDocumentUploadSlots() {
  const [docs, setDocs] = useState<DocumentSlot[]>(initialDocs);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerUpload = (slotId: string) => {
    setActiveSlotId(slotId);
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && activeSlotId) {
      const file = e.target.files[0];
      setDocs((prev) =>
        prev.map((d) =>
          d.id === activeSlotId ? { ...d, uploaded: true, fileName: file.name } : d
        )
      );
      e.target.value = "";
    }
  };

  const handleRemoveDoc = (slotId: string) => {
    setDocs((prev) =>
      prev.map((d) => (d.id === slotId ? { ...d, uploaded: false, fileName: undefined } : d))
    );
  };

  return (
    <div className="space-y-3">
      {/* Input oculto para upload de arquivo real */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        className="hidden"
      />

      <div className="text-[11px] text-muted-foreground flex items-center justify-between">
        <span>Formatos suportados: PDF, PNG, JPG (até 10 MB)</span>
        <span className="font-semibold text-foreground">
          {docs.filter((d) => d.uploaded).length} de {docs.length} enviados
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className={`border rounded-xl p-3 flex items-center justify-between gap-2 transition-all ${
              doc.uploaded
                ? "bg-emerald-500/5 border-emerald-500/30"
                : "bg-background border-border hover:border-connect-blue/50"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  doc.uploaded
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {doc.uploaded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{doc.label}</p>
                <p className="text-[10px] text-muted-foreground font-mono truncate">
                  {doc.uploaded ? doc.fileName : "Pendente de envio"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {doc.uploaded && (
                <button
                  type="button"
                  onClick={() => handleRemoveDoc(doc.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Remover documento"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleTriggerUpload(doc.id)}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  doc.uploaded
                    ? "text-emerald-600 hover:bg-emerald-500/10"
                    : "bg-connect-blue/10 text-connect-blue hover:bg-connect-blue/20"
                }`}
                title={doc.uploaded ? "Substituir documento" : "Fazer upload de arquivo"}
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
