"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  MessageSquare,
  Send,
  Copy,
  Check,
  Building2,
  Palmtree,
  Calendar,
  DollarSign,
  RotateCcw,
  Sparkles,
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
  category: "Venda" | "Temporada" | "Geral";
  icon: React.ComponentType<{ className?: string }>;
  getText: (data: {
    saudacao: string;
    primeiroNome: string;
    nomeCompleto: string;
    empreendimento: string;
    corretor: string;
    catalogoUrl: string;
  }) => string;
}

const templatePresets: TemplateOption[] = [
  {
    id: "apresentacao_venda",
    title: "1º Contato — Apresentação (Venda)",
    category: "Venda",
    icon: Building2,
    getText: ({ saudacao, primeiroNome, empreendimento, corretor, catalogoUrl }) =>
      `${saudacao}, ${primeiroNome}! Tudo bem? Sou ${corretor}, da Connect Platz Imobiliária. Vi seu interesse no ${empreendimento}. Preparei o material completo com fotos, plantas e valores para você: ${catalogoUrl}. Gostaria de receber o PDF ou tirar alguma dúvida por aqui?`,
  },
  {
    id: "apresentacao_aluguel",
    title: "1º Contato — Aluguel de Temporada",
    category: "Temporada",
    icon: Palmtree,
    getText: ({ saudacao, primeiroNome, empreendimento, corretor, catalogoUrl }) =>
      `${saudacao}, ${primeiroNome}! Tudo bem? Sou ${corretor}, especialista em locações de temporada na Connect Platz. Vi seu interesse no ${empreendimento}. Para quais datas de check-in e check-out você planeja sua estadia? Segue o link com fotos dos bangalôs: ${catalogoUrl}`,
  },
  {
    id: "visita",
    title: "Agendamento de Visita",
    category: "Geral",
    icon: Calendar,
    getText: ({ saudacao, primeiroNome, empreendimento, corretor }) =>
      `${saudacao}, ${primeiroNome}! Aqui é ${corretor}, da Connect Platz. Que tal agendarmos uma visita para você conhecer o ${empreendimento} de perto nesta semana? Tenho horários reservados na quinta e no sábado. Qual período fica melhor para você?`,
  },
  {
    id: "simulacao",
    title: "Simulação de Financiamento",
    category: "Venda",
    icon: DollarSign,
    getText: ({ saudacao, primeiroNome, empreendimento, corretor }) =>
      `${saudacao}, ${primeiroNome}! Aqui é ${corretor}, da Connect Platz. Concluí a simulação do plano de pagamento para o ${empreendimento} com entrada facilitada e aprovação junto ao banco parceiro. Posso te enviar o resumo com o valor das parcelas?`,
  },
  {
    id: "followup",
    title: "Follow-up Sem Resposta",
    category: "Geral",
    icon: RotateCcw,
    getText: ({ saudacao, primeiroNome, empreendimento, corretor }) =>
      `${saudacao}, ${primeiroNome}! Passando rapidinho para saber se você conseguiu dar uma olhada nas informações do ${empreendimento} que te enviei. Surgiu alguma dúvida? Permaneço totalmente à sua disposição aqui na Connect Platz!`,
  },
  {
    id: "reserva_temporada",
    title: "Confirmação de Reserva de Veraneio",
    category: "Temporada",
    icon: Palmtree,
    getText: ({ saudacao, primeiroNome, empreendimento, corretor }) =>
      `${saudacao}, ${primeiroNome}! Aqui é ${corretor}. Seu período no ${empreendimento} já está pré-reservado no nosso calendário. Para confirmarmos o bloqueio e emitirmos o contrato de locação de temporada, podemos alinhar os dados do titular e a taxa de reserva?`,
  },
];

export function WhatsAppTemplatesModal({
  isOpen,
  lead,
  onClose,
}: WhatsAppTemplatesModalProps) {
  const { user } = useCrm();
  const corretorNome = user?.nome || "Consultor Connect Platz";

  // Obter saudação dinâmica pelo horário
  const saudacaoPeriodo = useMemo(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "Bom dia";
    if (hora >= 12 && hora < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  const primeiroNome = useMemo(() => {
    if (!lead?.nome) return "Cliente";
    return lead.nome.trim().split(" ")[0];
  }, [lead?.nome]);

  const nomeCompleto = lead?.nome || "Cliente";
  const empreendimento = lead?.empreendimentoInteresse || "Empreendimento Connect Platz";
  const catalogoUrl = "https://connectplatz.com.br/catalogo";

  const dynamicContext = useMemo(
    () => ({
      saudacao: saudacaoPeriodo,
      primeiroNome,
      nomeCompleto,
      empreendimento,
      corretor: corretorNome,
      catalogoUrl,
    }),
    [saudacaoPeriodo, primeiroNome, nomeCompleto, empreendimento, corretorNome]
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("apresentacao_venda");
  const [customText, setCustomText] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Inicializa texto quando abre ou muda lead
  React.useEffect(() => {
    if (lead) {
      const initialTpl = templatePresets.find((t) => t.id === selectedTemplateId) || templatePresets[0];
      setCustomText(initialTpl.getText(dynamicContext));
    }
  }, [lead, selectedTemplateId, dynamicContext]);

  if (!isOpen || !lead) return null;

  const cleanPhone = lead.telefone.replace(/\D/g, "");

  const handleSelectTemplate = (tpl: TemplateOption) => {
    setSelectedTemplateId(tpl.id);
    setCustomText(tpl.getText(dynamicContext));
  };

  const handleInsertTag = (tagValue: string) => {
    setCustomText((prev) => `${prev} ${tagValue}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(customText);
    const url = `https://wa.me/55${cleanPhone}?text=${encoded}`;
    window.open(url, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[92vh]">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Modelos Dinâmicos de WhatsApp (wa.me)
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Destinatário: <strong className="text-foreground">{lead.nome}</strong> ({lead.telefone})
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

        {/* Corpo com Scroll */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Seletor de Templates em Grid */}
          <div className="space-y-2">
            <span className="block text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
              1. Selecione o Objetivo da Abordagem:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {templatePresets.map((tpl) => {
                const Icon = tpl.icon;
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/10 text-foreground font-bold shadow-xs"
                        : "border-border bg-background/50 hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? "text-emerald-500" : "text-muted-foreground"}`} />
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold leading-tight">{tpl.title}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {tpl.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Variáveis Dinâmicas Interativas */}
          <div className="space-y-1.5">
            <span className="block text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
              2. Variáveis Dinâmicas Inseríveis:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleInsertTag(primeiroNome)}
                className="px-2 py-1 rounded-md bg-muted hover:bg-connect-blue/10 hover:text-connect-blue border border-border text-[10px] font-mono transition-colors"
              >
                + &#123;{primeiroNome}&#125;
              </button>
              <button
                type="button"
                onClick={() => handleInsertTag(empreendimento)}
                className="px-2 py-1 rounded-md bg-muted hover:bg-connect-blue/10 hover:text-connect-blue border border-border text-[10px] font-mono transition-colors"
              >
                + &#123;{empreendimento}&#125;
              </button>
              <button
                type="button"
                onClick={() => handleInsertTag(saudacaoPeriodo)}
                className="px-2 py-1 rounded-md bg-muted hover:bg-connect-blue/10 hover:text-connect-blue border border-border text-[10px] font-mono transition-colors"
              >
                + &#123;{saudacaoPeriodo}&#125;
              </button>
              <button
                type="button"
                onClick={() => handleInsertTag(corretorNome)}
                className="px-2 py-1 rounded-md bg-muted hover:bg-connect-blue/10 hover:text-connect-blue border border-border text-[10px] font-mono transition-colors"
              >
                + &#123;{corretorNome}&#125;
              </button>
              <button
                type="button"
                onClick={() => handleInsertTag(catalogoUrl)}
                className="px-2 py-1 rounded-md bg-muted hover:bg-connect-blue/10 hover:text-connect-blue border border-border text-[10px] font-mono transition-colors"
              >
                + &#123;Link Catálogo&#125;
              </button>
            </div>
          </div>

          {/* Área de Edição da Mensagem */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
              <span className="font-semibold uppercase tracking-wider text-[10px]">3. Mensagem Personalizada:</span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-connect-blue hover:underline"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copiado!" : "Copiar Mensagem"}</span>
              </button>
            </div>

            <textarea
              rows={5}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-3 text-foreground leading-relaxed focus:ring-1 focus:ring-emerald-500 transition-all font-sans text-xs"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center gap-2 text-[11px] text-muted-foreground">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              O botão abaixo abrirá diretamente o WhatsApp oficial via deep link seguro (<strong>wa.me</strong>) com o texto preenchido.
            </span>
          </div>
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md shadow-emerald-600/20 hover:scale-[1.02] active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Abrir no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
