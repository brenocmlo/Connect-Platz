"use client";

import React from "react";
import {
  Building2,
  Banknote,
  Flame,
  Megaphone,
  FileText,
  Calendar,
  Clock,
  Paperclip,
  CheckCircle2,
} from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { ScoreBadge, LeadTag } from "@/components/crm/primitives";
import { useCrm } from "@/components/crm/CrmContext";
import { LeadAbordagemSection } from "./LeadAbordagemSection";

interface LeadDetailsSectionsProps {
  lead: LeadDetail;
  onScheduleAppointment?: () => void;
}

export function LeadDetailsSections({
  lead,
  onScheduleAppointment,
}: LeadDetailsSectionsProps) {
  const { hideValues, formatMoney } = useCrm();

  const scoreValue =
    lead.score ??
    (lead.temperatura === "QUENTE" ? 88 : lead.temperatura === "MORNO" ? 64 : 36);

  const formattedOpportunity = lead.opportunityValue
    ? formatMoney(lead.opportunityValue)
    : "R$ 480.000,00";

  return (
    <div className="space-y-6 text-xs">
      {/* 1. OPORTUNIDADES & EMPREENDIMENTO DE INTERESSE */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Building2 className="w-4 h-4 text-connect-blue" />
          <span>Oportunidades & Interesse</span>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Empreendimento</span>
            <span className="font-bold text-foreground">
              {lead.empreendimentoInteresse || "Reserva Imperial"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Faixa de Oportunidade</span>
            <span className="font-extrabold text-connect-blue">
              A partir de {hideValues ? "••••" : formattedOpportunity}
            </span>
          </div>

          {lead.bairrosInteresse && lead.bairrosInteresse.length > 0 && (
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-muted-foreground">Região</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {lead.bairrosInteresse.map((b) => (
                  <span
                    key={b}
                    className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md font-medium"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. RENDA DECLARADA & SCORE DO LEAD */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Banknote className="w-3.5 h-3.5 text-emerald-500" />
            <span>Renda Declarada</span>
          </div>
          <div className="text-sm font-bold text-foreground">
            {lead.rendaDeclarada
              ? hideValues
                ? "••••"
                : formatMoney(lead.rendaDeclarada)
              : "Não informada"}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {lead.tipoOcupacaoCredito || "Perfil CLT / Assalariado"}
          </span>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span>Score do Lead</span>
          </div>
          <div>
            <ScoreBadge score={scoreValue} size="sm" showLabel={true} />
          </div>
          <span className="text-[10px] text-muted-foreground block truncate">
            {scoreValue >= 70
              ? "Alta probabilidade de conversão"
              : "Requer nutrição / follow-up"}
          </span>
        </div>
      </div>

      {/* 3. CAMPANHA & ORIGEM */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Megaphone className="w-4 h-4 text-connect-blue" />
          <span>Origem & Campanha</span>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Canal de Captação</span>
            <LeadTag variant="origin">{lead.source}</LeadTag>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Campanha</span>
            <span className="font-medium text-foreground truncate max-w-[200px]">
              {lead.campaignName || "Lançamento Frente Mar 2026"}
            </span>
          </div>

          {lead.adName && (
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
              <span>Anúncio</span>
              <span className="font-mono">{lead.adName}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. REGISTRO DE ABORDAGEM & INTERAÇÕES COM O LEAD */}
      <LeadAbordagemSection lead={lead} />

      {/* 5. COMPROMISSOS AGENDADOS (Seção 5.5: follow-up âmbar claro, etc.) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Clock className="w-4 h-4 text-connect-blue" />
            <span>Compromissos Agendados</span>
          </div>

          {onScheduleAppointment && (
            <button
              onClick={onScheduleAppointment}
              className="text-[11px] font-bold text-connect-blue hover:underline"
            >
              + Agendar
            </button>
          )}
        </div>

        <div className="space-y-2">
          {/* Card 1: Visita */}
          <div className="bg-card border border-border rounded-xl p-3 flex items-start justify-between gap-3 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-connect-blue border border-connect-blue/20">
                  Visita
                </span>
                <span className="text-xs font-bold text-foreground">
                  Apresentação de Decorado
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" /> 03/10/2026 às 15:00 • No Plantão de Vendas
              </p>
            </div>
          </div>

          {/* Card 2: Follow-up (Fundo âmbar claro conforme Seção 5.5) */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start justify-between gap-3 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 font-bold border border-amber-500/30">
                  Retorno / Follow-up
                </span>
                <span className="text-xs font-bold text-foreground">
                  Confirmar aprovação de crédito
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" /> 05/10/2026 às 10:00 • Ligação / WhatsApp
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. ANEXOS */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Paperclip className="w-4 h-4 text-connect-blue" />
          <span>Anexos & Documentos</span>
        </div>

        <div className="bg-card border border-dashed border-border rounded-xl p-6 text-center shadow-xs">
          <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs font-semibold text-foreground">Nenhum anexo enviado</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Documentos de RG, CPF e holerites serão exibidos aqui (máx. 10 MB)
          </p>
        </div>
      </div>

      {/* 7. DATAS IMPORTANTES */}
      <div className="bg-muted/40 border border-border/80 rounded-xl p-3.5 space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Data de Captação:</span>
          <span className="font-mono text-foreground font-semibold">
            {new Date(lead.createdAt || Date.now()).toLocaleDateString("pt-BR")} às 11:28
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Última Interação:</span>
          <span className="font-mono text-foreground font-semibold">
            {new Date().toLocaleDateString("pt-BR")} às 16:40
          </span>
        </div>
      </div>
    </div>
  );
}
