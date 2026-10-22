"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  Phone,
  Mail,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  Calendar,
  XCircle,
  Loader2,
} from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { broadcastLeadUpdated } from "@/components/crm/leads/leadsApi";
import { useLeadTimeline, formatTimelineDate } from "./useLeadTimeline";

export type CanalAbordagem = "whatsapp" | "ligacao" | "reuniao" | "email" | "anotacao";
export type DesfechoAbordagem = "respondeu" | "sem_resposta" | "reagendou" | "sem_interesse";

export interface AbordagemItem {
  id: string;
  canal: CanalAbordagem;
  desfecho: DesfechoAbordagem;
  conteudo: string;
  corretorNome: string;
  dataHora: string;
}

interface LeadAbordagemSectionProps {
  lead: LeadDetail;
}

const canaisConfig: Record<
  CanalAbordagem,
  { label: string; icon: React.ElementType; colorClass: string; badgeClass: string }
> = {
  whatsapp: {
    label: "WhatsApp",
    icon: MessageSquare,
    colorClass: "text-emerald-500",
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  ligacao: {
    label: "Ligação",
    icon: Phone,
    colorClass: "text-connect-blue",
    badgeClass: "bg-connect-blue/15 text-connect-blue border-connect-blue/30",
  },
  reuniao: {
    label: "Visita / Reunião",
    icon: Users,
    colorClass: "text-amber-500",
    badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  email: {
    label: "E-mail",
    icon: Mail,
    colorClass: "text-sky-500",
    badgeClass: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
  },
  anotacao: {
    label: "Nota Interna",
    icon: FileText,
    colorClass: "text-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
};

const desfechosConfig: Record<
  DesfechoAbordagem,
  { label: string; icon: React.ElementType; badgeClass: string }
> = {
  respondeu: {
    label: "Respondeu com interesse",
    icon: CheckCircle2,
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  sem_resposta: {
    label: "Sem resposta / Não atendeu",
    icon: Clock,
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  reagendou: {
    label: "Reagendou retorno",
    icon: Calendar,
    badgeClass: "bg-blue-500/10 text-connect-blue border-connect-blue/20",
  },
  sem_interesse: {
    label: "Sem interesse agora",
    icon: XCircle,
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
};

const CONTACT_CHANNELS: CanalAbordagem[] = ["whatsapp", "ligacao", "reuniao", "email"];

export function LeadAbordagemSection({ lead }: LeadAbordagemSectionProps) {
  const { entries, isLoading, error: loadError, add } = useLeadTimeline(lead.id);
  const [canal, setCanal] = useState<CanalAbordagem>("whatsapp");
  const [desfecho, setDesfecho] = useState<DesfechoAbordagem>("respondeu");
  const [conteudo, setConteudo] = useState("");
  const [justSent, setJustSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Abordagens = registros "abordagem" da timeline persistida do lead
  const abordagens: AbordagemItem[] = entries
    .filter((e) => e.tipo === "abordagem")
    .map((e) => ({
      id: e.id,
      canal: (e.metadata?.canal as CanalAbordagem) || "anotacao",
      desfecho: (e.metadata?.desfecho as DesfechoAbordagem) || "respondeu",
      conteudo: e.conteudo || "",
      corretorNome: e.user?.nome || "Sistema",
      dataHora: formatTimelineDate(e.createdAt),
    }));

  const handleSalvarAbordagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conteudo.trim() || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const entry = await add({ tipo: "abordagem", canal, desfecho, conteudo: conteudo.trim() });
      setConteudo("");
      setJustSent(true);
      setTimeout(() => setJustSent(false), 3000);
      // Contato efetivo registra o primeiro contato no servidor: reflete no SLA/Kanban
      if (!lead.firstContactAt && CONTACT_CHANNELS.includes(canal)) {
        broadcastLeadUpdated({ ...lead, firstContactAt: entry.createdAt });
      }
    } catch (err: any) {
      setSaveError(err?.message || "Não foi possível registrar a abordagem.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* 1. TÍTULO DA SEÇÃO */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <MessageSquare className="w-4 h-4 text-connect-blue" />
          <span>Abordagens & Contatos com o Lead</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-connect-blue/10 text-connect-blue border border-connect-blue/20">
          {abordagens.length} {abordagens.length === 1 ? "contato" : "contatos"}
        </span>
      </div>

      {/* 2. FORMULÁRIO DE ENVIO DA ABORDAGEM */}
      <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm space-y-3">
        {/* Seletor do Canal de Contato */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
            Canal de Abordagem:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(canaisConfig) as CanalAbordagem[]).map((cKey) => {
              const cfg = canaisConfig[cKey];
              const Icon = cfg.icon;
              const isSelected = canal === cKey;
              return (
                <button
                  type="button"
                  key={cKey}
                  onClick={() => setCanal(cKey)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? `${cfg.badgeClass} ring-1 ring-connect-blue/30 shadow-xs font-bold`
                      : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className={`w-3 h-3 ${cfg.colorClass}`} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Seletor do Desfecho / Feedback */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
            Resultado do Contato:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(desfechosConfig) as DesfechoAbordagem[]).map((dKey) => {
              const dCfg = desfechosConfig[dKey];
              const DIcon = dCfg.icon;
              const isSelected = desfecho === dKey;
              return (
                <button
                  type="button"
                  key={dKey}
                  onClick={() => setDesfecho(dKey)}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 ${
                    isSelected
                      ? `${dCfg.badgeClass} ring-1 ring-border font-bold`
                      : "bg-muted/30 border-border/80 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <DIcon className="w-2.5 h-2.5" />
                  {dCfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Textarea para descrever a abordagem */}
        <form onSubmit={handleSalvarAbordagem} className="space-y-2 pt-1">
          <div className="relative">
            <textarea
              rows={3}
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Descreva a abordagem realizada com o lead... (ex: Conversei por telefone, apresentei a tabela com 30% de entrada, cliente pediu para enviar opções pelo WhatsApp)."
              className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-connect-blue/30 focus:border-connect-blue resize-none transition-all"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            {saveError ? (
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{saveError}</span>
            ) : justSent ? (
              <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 animate-in fade-in-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> Abordagem registrada com sucesso!
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground">
                Dica: Registros de abordagem atualizam o histórico do corretor.
              </span>
            )}

            <button
              type="submit"
              disabled={!conteudo.trim() || saving}
              className="px-4 py-2 bg-connect-blue hover:bg-connect-deep-blue text-white rounded-lg text-xs font-bold disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98] flex-shrink-0"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Registrar Abordagem</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. FEED HISTÓRICO DE ABORDAGENS REALIZADAS */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-muted-foreground block">
          Histórico de Abordagens Registradas:
        </label>

        {isLoading ? (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : loadError ? (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center text-rose-600 dark:text-rose-400 text-xs">
            {loadError}
          </div>
        ) : abordagens.length === 0 ? (
          <div className="bg-muted/30 border border-dashed border-border rounded-xl p-4 text-center text-muted-foreground text-xs">
            Nenhuma abordagem registrada para este lead ainda.
          </div>
        ) : (
          <div className="space-y-2">
            {abordagens.map((item) => {
              const canalCfg = canaisConfig[item.canal] || canaisConfig.anotacao;
              const desfechoCfg = desfechosConfig[item.desfecho] || desfechosConfig.respondeu;
              const CanalIcon = canalCfg.icon;

              return (
                <div
                  key={item.id}
                  className="bg-card border border-border/80 rounded-xl p-3 shadow-xs space-y-2 hover:border-connect-blue/30 transition-all"
                >
                  {/* Topo do card: Canal + Desfecho + Data */}
                  <div className="flex items-center justify-between gap-2 text-[10px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${canalCfg.badgeClass}`}
                      >
                        <CanalIcon className="w-2.5 h-2.5" />
                        {canalCfg.label}
                      </span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-full border ${desfechoCfg.badgeClass}`}
                      >
                        {desfechoCfg.label}
                      </span>
                    </div>

                    <span className="text-muted-foreground font-mono flex-shrink-0">{item.dataHora}</span>
                  </div>

                  {/* Conteúdo da abordagem */}
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {item.conteudo}
                  </p>

                  {/* Autor */}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                    <span className="flex items-center gap-1">
                      <span>Por:</span>
                      <strong className="text-foreground/90">{item.corretorNome}</strong>
                    </span>
                    <span className="text-[9px] text-muted-foreground/70">
                      Connect Platz CRM
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
