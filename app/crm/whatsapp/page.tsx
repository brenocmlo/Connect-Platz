"use client";

import React, { useState } from "react";
import {
  Download,
  ExternalLink,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Chrome,
  FolderOpen,
  Sliders,
  Check,
  ShieldCheck,
  Kanban,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/crm/PageHeader";
import { SectionTitle } from "@/components/crm/SectionTitle";

export default function WhatsAppExtensionPage() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    const link = document.createElement("a");
    link.href = "/downloads/connect-platz-whatsapp-crm.zip";
    link.download = "connect-platz-whatsapp-crm.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Extensão WhatsApp Web"
        subtitle="Integre o WhatsApp Web ao CRM para sincronizar conversas, atualizar etapas e captar leads sem sair do chat"
      />

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-connect-blue via-[#0D478F] to-[#082852] text-white p-6 sm:p-8 shadow-xl shadow-connect-blue/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-platz-gold" />
              <span>Manifest V3 Oficial • Chrome & Edge</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Transforme o WhatsApp Web em sua Central de Vendas
            </h2>
            <p className="text-sm text-white/85 leading-relaxed">
              Com a extensão oficial da Connect Platz, você consulta dados do lead, envia modelos de mensagem homologados e move etapas do funil diretamente de dentro do chat do cliente.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-platz-gold hover:bg-[#F8DA56] text-slate-900 font-bold text-sm shadow-lg shadow-black/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              {downloading ? (
                <>
                  <Check className="w-4 h-4 text-slate-900" />
                  <span>Baixando Arquivo...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-900" />
                  <span>Baixar Extensão (.zip)</span>
                </>
              )}
            </button>

            <a
              href="https://web.whatsapp.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Abrir WhatsApp Web</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>
      </div>

      {/* Tutorial Passo a Passo */}
      <div className="space-y-4">
        <SectionTitle>Como Instalar em 4 Passos Rápidos</SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Passo 1 */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm hover:border-connect-blue/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-connect-blue/10 text-connect-blue flex items-center justify-center font-bold text-base">
                1
              </div>
              <Download className="w-4 h-4 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Baixar e Extrair</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Clique no botão de download acima para baixar o arquivo <strong>.zip</strong> e extraia o conteúdo em uma pasta do seu computador (ex.: Documentos ou Área de Trabalho).
            </p>
          </div>

          {/* Passo 2 */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm hover:border-connect-blue/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-connect-blue/10 text-connect-blue flex items-center justify-center font-bold text-base">
                2
              </div>
              <Chrome className="w-4 h-4 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Abrir Extensões</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No navegador Google Chrome ou Microsoft Edge, digite na barra de endereços: <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-[11px] text-connect-blue">chrome://extensions</code> e pressione Enter.
            </p>
          </div>

          {/* Passo 3 */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm hover:border-connect-blue/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-connect-blue/10 text-connect-blue flex items-center justify-center font-bold text-base">
                3
              </div>
              <Sliders className="w-4 h-4 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Modo Desenvolvedor</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No canto superior direito da página de extensões, ative a chave <strong>Modo do desenvolvedor</strong>. Três novos botões aparecerão no topo da tela.
            </p>
          </div>

          {/* Passo 4 */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm hover:border-connect-blue/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-base">
                4
              </div>
              <FolderOpen className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Carregar Pasta</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Clique em <strong>Carregar sem compactação</strong> e selecione a pasta extraída. A extensão Connect Platz será ativada instantaneamente!
            </p>
          </div>
        </div>
      </div>

      {/* Recursos Integrados */}
      <div className="space-y-4">
        <SectionTitle>Recursos Disponíveis Dentro do WhatsApp Web</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Kanban className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Painel Lateral com Dados do Lead</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ao abrir qualquer conversa no WhatsApp Web, o painel lateral busca automaticamente o contato no CRM e exibe o histórico, empreendimento de interesse e etapa atual.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-connect-blue/10 text-connect-blue flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Ações Rápidas de Atendimento</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Avance o lead de etapa com 1 clique, altere a temperatura (Quente, Morno, Frio), adicione notas de visita e solicite aprovação financeira sem trocar de aba.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-platz-gold/15 text-platz-gold flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Modelos Homologados</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Acesse a biblioteca oficial de templates pré-aprovados pela imobiliária para primeiro contato, lembretes de visita e apresentação de oportunidades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
