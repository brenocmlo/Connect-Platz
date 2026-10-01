"use client";

import React from "react";
import { UploadCloud, FileText } from "lucide-react";

export function LeadDocsTab() {
  return (
    <div className="space-y-4 text-xs">
      <div className="border-2 border-dashed border-[#1C2537] hover:border-connect-blue/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#080C14]">
        <UploadCloud className="w-8 h-8 text-connect-blue mx-auto mb-2" />
        <p className="font-bold text-white">Clique para anexar contracheques, extratos ou documentos</p>
        <p className="text-[11px] text-slate-500 mt-1">Formatos suportados: PDF, JPG, PNG (até 30MB)</p>
      </div>

      <div className="space-y-2">
        <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
          Documentos Já Anexados
        </span>
        <div className="p-3 bg-[#0F1624] border border-[#1C2537] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-connect-blue" />
            <div>
              <p className="font-bold text-white">Holerite_Agosto_2026.pdf</p>
              <p className="text-[10px] text-slate-500">1.2 MB • Comprovante de Renda CLT</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
            Validado
          </span>
        </div>
      </div>
    </div>
  );
}
