"use client";

import React, { useState } from "react";
import { Copy, Check, Code, ExternalLink, ShieldCheck } from "lucide-react";

interface IntegrationInstructionsTabProps {
  itemId: string;
  webhookUrl: string;
  verifyToken: string;
}

export function IntegrationInstructionsTab({
  itemId,
  webhookUrl,
  verifyToken,
}: IntegrationInstructionsTabProps) {
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const copyToClipboard = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 3000);
  };

  const sampleJson = JSON.stringify(
    {
      nome: "Dr. Roberto Medeiros",
      telefone: "85991234567",
      email: "roberto.medeiros@exemplo.com.br",
      campanha: "Lançamento Connect Platz Tower",
      codigoImovel: "REF-204",
      mensagem: "Gostaria de agendar visita na unidade decorada.",
    },
    null,
    2
  );

  return (
    <div className="space-y-3.5 text-xs">
      <div className="space-y-2.5 text-slate-600 dark:text-slate-300">
        <p className="font-semibold text-slate-800 dark:text-white">
          1. URL Oficial de Recebimento de Leads (Webhook Endpoint):
        </p>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937]">
          <code className="text-xs font-mono text-connect-blue flex-1 truncate font-semibold">
            {webhookUrl}
          </code>
          <button
            type="button"
            onClick={() => copyToClipboard(webhookUrl, setCopiedWebhook)}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#161F30] text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            title="Copiar URL do Webhook"
          >
            {copiedWebhook ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        {copiedWebhook && (
          <span className="text-[11px] text-emerald-600 font-semibold block">
            ✓ URL copiada para a área de transferência!
          </span>
        )}

        {/* Instruções Específicas por Canal */}
        {itemId === "meta-ads" && (
          <div className="space-y-2.5 pt-1">
            <p className="font-semibold text-slate-800 dark:text-white">
              2. Token de Verificação (Verify Token) exigido pela Meta:
            </p>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937]">
              <code className="text-xs font-mono text-amber-600 dark:text-platz-gold flex-1 truncate font-semibold">
                {verifyToken}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(verifyToken, setCopiedToken)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#161F30] text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                title="Copiar Verify Token"
              >
                {copiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copiedToken && (
              <span className="text-[11px] text-emerald-600 font-semibold block">
                ✓ Token de verificação copiado!
              </span>
            )}
            <p>
              3. No painel do <strong>Facebook Developers &gt; Webhooks</strong>, assine o evento:{" "}
              <code className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">leadgen</code>.
            </p>
          </div>
        )}

        {itemId === "google-ads" && (
          <div className="space-y-2.5 pt-1">
            <p className="font-semibold text-slate-800 dark:text-white">
              2. Chave de Validação da Empresa (Google Key):
            </p>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-[#080C14] border border-slate-200 dark:border-[#1F2937]">
              <code className="text-xs font-mono text-amber-600 dark:text-platz-gold flex-1 truncate font-semibold">
                connect_platz_google_ads_key
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard("connect_platz_google_ads_key", setCopiedToken)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#161F30] text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                {copiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p>
              3. No Google Ads, acesse <strong>Recursos &gt; Extensão de Formulário de Lead &gt; Webhook</strong>, cole a URL e a Google Key acima e clique em <em>Enviar dados de teste</em>.
            </p>
          </div>
        )}

        {itemId === "grupo-olx" && (
          <div className="space-y-2 pt-1">
            <p className="font-semibold text-slate-800 dark:text-white">
              2. Integração Portal do Anunciante (ZAP / Viva Real / OLX):
            </p>
            <p>
              Cole a URL do Webhook nas configurações de <strong>Notificação em Tempo Real (LeadZap)</strong> no Portal do Anunciante com formato de carga JSON ativado.
            </p>
          </div>
        )}

        {itemId === "dream-casa" && (
          <div className="space-y-2 pt-1">
            <p className="font-semibold text-slate-800 dark:text-white">
              2. Painel Imobiliária Dream Casa:
            </p>
            <p>
              Acesse <strong>Painel Dream Casa &gt; Integrações &gt; Webhook de Leads</strong> e cole a URL oficial do seu Connect Platz.
            </p>
          </div>
        )}

        {itemId === "chaves-na-mao" && (
          <div className="space-y-2 pt-1">
            <p className="font-semibold text-slate-800 dark:text-white">
              2. Notificações Chaves na Mão:
            </p>
            <p>
              Cadastre a URL no menu de <strong>Repasse de Leads / Webhook</strong> da sua conta anunciante Chaves na Mão.
            </p>
          </div>
        )}

        {itemId === "landing-page" && (
          <div className="space-y-2.5 pt-1">
            <p className="font-semibold text-slate-800 dark:text-white">
              2. Configuração no Elementor PRO (WordPress) ou Formulários Customizados:
            </p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>No Elementor, selecione o formulário da página de captura.</li>
              <li>Vá em <strong>Actions After Submit</strong> e adicione <strong>Webhook</strong>.</li>
              <li>No bloco Webhook que aparecer, cole a URL acima. Os campos Nome, Telefone e E-mail serão mapeados automaticamente.</li>
            </ol>
          </div>
        )}

        {itemId === "api-webhooks" && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-white">
                2. Exemplo de Payload JSON (n8n, Make, Zapier, Python, cURL):
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(sampleJson, setCopiedPayload)}
                className="text-[11px] font-bold text-connect-blue hover:text-connect-deep-blue flex items-center gap-1"
              >
                {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copiar JSON
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-[11px] font-mono overflow-x-auto">
              {sampleJson}
            </pre>
            <p className="text-[11px] text-muted-foreground">
              Cabeçalho opcional em produção: <code>Authorization: Bearer connect_platz_custom_api_token</code>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
