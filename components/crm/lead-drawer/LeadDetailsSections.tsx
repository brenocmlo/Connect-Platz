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
  Plus,
  AlertTriangle,
  DollarSign,
  Loader2,
} from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { ScoreBadge, LeadTag } from "@/components/crm/primitives";
import { useCrm } from "@/components/crm/CrmContext";
import { LeadAbordagemSection } from "./LeadAbordagemSection";
import { LeadAttachmentsSection } from "./LeadAttachmentsSection";
import { LeadSaleSection } from "./LeadSaleSection";

interface LeadDetailsSectionsProps {
  lead: LeadDetail;
  onScheduleAppointment?: () => void;
  onRegisterSale?: () => void;
}

export function LeadDetailsSections({
  lead,
  onScheduleAppointment,
  onRegisterSale,
}: LeadDetailsSectionsProps) {
  const { hideValues, formatMoney } = useCrm();

  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [loadingAppts, setLoadingAppts] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function loadAppointments() {
      if (!lead.id) return;
      setLoadingAppts(true);
      try {
        const res = await fetch(`/api/agenda?leadId=${lead.id}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data.appointments)) {
            setAppointments(data.appointments);
          }
        }
      } catch (err) {
        console.warn("Erro ao buscar compromissos do lead:", err);
      } finally {
        if (!cancelled) setLoadingAppts(false);
      }
    }
    loadAppointments();
    return () => {
      cancelled = true;
    };
  }, [lead.id]);

  const isWinningStage = Boolean(
    lead.stage?.nome.toLowerCase().includes("ganho") ||
    lead.stage?.nome.toLowerCase().includes("fechado")
  );
  const hasPendenciaFinanceira = isWinningStage && (!lead.salesCount || lead.salesCount === 0);

  const scoreValue =
    lead.score ??
    (lead.temperatura === "QUENTE" ? 88 : lead.temperatura === "MORNO" ? 64 : 36);

  const formattedOpportunity = lead.opportunityValue
    ? formatMoney(lead.opportunityValue)
    : "R$ 480.000,00";

  return (
    <div className="space-y-6 text-xs">
      {/* ALERTA DE PENDÊNCIA FINANCEIRA SE O LEAD ESTÁ EM GANHO SEM VENDA */}
      {hasPendenciaFinanceira && (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 space-y-2 animate-in fade-in-0">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Pendência Financeira — Venda Não Registrada</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Este lead foi movido para Ganho, mas ainda não possui o registro oficial de VGV e divisão de comissões.
          </p>
          {onRegisterSale && (
            <button
              type="button"
              onClick={onRegisterSale}
              className="w-full py-2 px-3 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Cadastrar Venda & Comissões Agora</span>
            </button>
          )}
        </div>
      )}

      {/* DETALHES DA VENDA E COMISSÃO (QUANDO HÁ VENDA CADASTRADA) */}
      <LeadSaleSection lead={lead} />

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

      {/* 4. OBSERVAÇÕES DO LEAD */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <FileText className="w-4 h-4 text-connect-blue" />
          <span>Observações do Lead</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs">
          {lead.observacoes ? (
            <p className="text-foreground text-xs leading-relaxed whitespace-pre-wrap">
              {lead.observacoes}
            </p>
          ) : (
            <p className="text-muted-foreground italic text-xs">
              Nenhuma observação registrada para este lead ainda. Clique em "Editar Lead" para registrar anotações e preferências.
            </p>
          )}
        </div>
      </div>

      {/* 5. REGISTRO DE ABORDAGEM & INTERAÇÕES COM O LEAD */}
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
              className="text-[11px] font-bold text-connect-blue hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Agendar
            </button>
          )}
        </div>

        <div className="space-y-2">
          {loadingAppts ? (
            <div className="p-4 text-center text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-connect-blue" />
              <span>Carregando compromissos...</span>
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-4 text-center">
              <p className="text-muted-foreground italic text-xs">
                Nenhum compromisso agendado para este lead.
              </p>
            </div>
          ) : (
            appointments.map((app) => {
              const dateStr = new Date(app.dataInicio).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
              const timeStr = new Date(app.dataInicio).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const isFollowUp = app.tipo === "FOLLOW_UP" || app.tipo?.toLowerCase().includes("retorno");
              const isVisita = app.tipo === "VISITA";

              return (
                <div
                  key={app.id}
                  className={`border rounded-xl p-3 shadow-xs space-y-1 ${
                    isFollowUp
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-card border-border"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isVisita
                            ? "bg-blue-500/10 text-connect-blue border-connect-blue/20"
                            : isFollowUp
                            ? "bg-amber-500/20 text-amber-600 border-amber-500/30"
                            : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                        }`}
                      >
                        {app.tipo === "VISITA" ? "Visita" : app.tipo === "FOLLOW_UP" ? "Retorno / Follow-up" : app.tipo}
                      </span>
                      <span className="text-xs font-bold text-foreground truncate">
                        {app.titulo}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {app.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted-foreground/70" />
                    <span>{dateStr} às {timeStr}</span>
                    {app.user?.nome && <span>• {app.user.nome}</span>}
                    {app.property?.nome && <span>• {app.property.nome}</span>}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 6. ANEXOS FUNCIONAIS & DOCUMENTOS */}
      <LeadAttachmentsSection lead={lead} />

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
