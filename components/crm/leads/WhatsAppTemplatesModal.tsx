"use client";

import React, { useState } from "react";
import {
  X,
  MessageSquare,
  Send,
  Copy,
  Check,
  Sparkles,
  Building2,
  User,
  ExternalLink,
} from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { useCrm } from "@/components/crm/CrmContext";

interface WhatsAppTemplatesModalProps {
  isOpen: boolean;
  lead: LeadDetail | null;
  onClose: () => void;
}

interface TemplateOption {
  id: string;
  title: string;
  badge: string;
  getText: (lead: LeadDetail, corretorNome: string) => string;
}

const templates: TemplateOption[] = [
  {
    id: "apresentacao",
    title: "1º Contato / Apresentação",
    badge: "Novo Lead",
    getText: (lead, corretorNome) =>
      `Olá, ${lead.nome}! Tudo bem? Sou ${corretorNome}, da Connect Platz Imobiliária. Vi seu interesse no empreendimento ${lead.empreendimentoInteresse || "Reserva Imperial"}. Gostaria de receber a apresentação completa em PDF ou tirar alguma dúvida por aqui?`,
  },
  {
    id: "visita",
    title: "Agendamento de Visita",
    badge: "Visita",
    getText: (lead) =>
      `Olá, ${lead.nome}! Que tal agendarmos uma visita para você conhecer a maquete e o decorado do ${lead.empreendimentoInteresse || "Reserva Imperial"}? Tenho horários disponíveis nesta semana. Qual dia e horário fica melhor para você?`,
  },
  {
    id: "simulacao",
    title: "Envio de Simulação de Pagamento",
    badge: "Proposta",
    getText: (lead) =>
      `Olá, ${lead.nome}! Preparei uma simulação de fluxo de pagamento com as melhores condições para o ${lead.empreendimentoInteresse || "Reserva Imperial"}. Posso te enviar os valores de entrada e parcelas para sua análise?`,
  },
  {
    id: "followup",
    title: "Follow-up / Retorno",
    badge: "Nutrição",
    getText: (lead) =>
      `Olá, ${lead.nome}! Passando para saber se você conseguiu avaliar as informações do ${lead.empreendimentoInteresse || "Reserva Imperial"} que te enviei. Surgiu alguma dúvida sobre a localização ou valores? Estou à sua disposição!`,
  },
];

export function WhatsAppTemplatesModal({
  isOpen,
  lead,
  onClose,
}: WhatsAppTemplatesModalProps) {
  const { user } = useCrm();
  const corretorNome = user?.nome || "Corretor Connect Platz";

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0].id);
  const [customText, setCustomText] = useState<string>("");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !lead) return null;

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const initialText = currentTemplate.getText(lead, corretorNome);
  const activeMessage = customText !== "" ? customText : initialText;

  const cleanPhone = lead.telefone.replace(/\D/g, "");

  const handleSelectTemplate = (tpl: TemplateOption) => {
    setSelectedTemplateId(tpl.id);
    setCustomText(tpl.getText(lead, corretorNome));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(activeMessage);
    const url = `https://wa.me/55${cleanPhone}?text=${encoded}`;
    window.open(url, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Modelos Rápidos de Mensagem WhatsApp
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Envio direto via wa.me para {lead.nome} ({lead.telefone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Seletor de Templates em Chips */}
          <div>
            <label className="block text-muted-foreground font-semibold mb-2 text-[11px] uppercase tracking-wider">
              Escolha o Objetivo da Mensagem:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedTemplateId === tpl.id
                      ? "border-emerald-500 bg-emerald-500/10 text-foreground font-bold shadow-xs"
                      : "border-border bg-background/50 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="block text-xs font-semibold">{tpl.title}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {tpl.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Área de Edição da Mensagem */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
              <span className="font-semibold">Pré-visualização & Edição:</span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-connect-blue hover:underline"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copiado!" : "Copiar Texto"}</span>
              </button>
            </div>

            <textarea
              rows={5}
              value={activeMessage}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-3 text-foreground leading-relaxed focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
            />
          </div>

          <p className="text-[11px] text-muted-foreground italic bg-muted/40 p-2.5 rounded-lg border border-border">
            Ao clicar abaixo, o WhatsApp Web ou aplicativo oficial será aberto diretamente na conversa do cliente com o texto pronto para envio.
          </p>
        </div>

        {/* Rodapé de Ações */}
        <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md shadow-emerald-600/20 hover:scale-[1.02]"
          >
            <Send className="w-4 h-4" />
            <span>Abrir no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
