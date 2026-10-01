"use client";

import React from "react";
import { LeadDetail } from "../LeadDrawer";

interface LeadTrackingTabProps {
  lead: LeadDetail;
}

export function LeadTrackingTab({ lead }: LeadTrackingTabProps) {
  return (
    <div className="bg-[#0F1624] border border-[#1C2537] rounded-2xl p-5 space-y-4 text-xs">
      <h3 className="font-bold uppercase tracking-wider text-slate-400">Rastreamento de Origem & Criativo</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-slate-500 block text-[11px]">Canal / Origem:</span>
          <span className="text-blue-400 font-bold">{lead.source}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Campanha Meta Ads:</span>
          <span className="text-white font-medium">{lead.campaignName || "Lançamento Villa Platz 2026"}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Nome do Criativo / Anúncio:</span>
          <span className="text-white">{lead.adName || "Vídeo 03 - Vista Mar 3 Suítes"}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">ID do Formulário Instantâneo:</span>
          <span className="text-slate-300 font-mono">{lead.formId || "form_meta_882910"}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">UTM Source:</span>
          <span className="text-slate-300 font-mono">{lead.utmSource || "instagram_feed"}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">UTM Campaign:</span>
          <span className="text-slate-300 font-mono">{lead.utmCampaign || "campanha_alto_padrao"}</span>
        </div>
      </div>
    </div>
  );
}
