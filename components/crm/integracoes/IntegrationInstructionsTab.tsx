"use client";

import React from "react";
import { KeyRound, Eye, ShieldCheck, AlertTriangle } from "lucide-react";
import { ChannelDef } from "./channels";
import { CopyField } from "./CopyField";

interface IntegrationInstructionsTabProps {
  channel: ChannelDef;
  webhookUrl: string;
  /** undefined = não carregada; null = não configurada no servidor. */
  channelKey?: string | null;
  canRevealKeys: boolean;
  keysError?: string | null;
  signatureConfigured?: boolean;
  onRevealKeys: () => void;
}

const PLACEHOLDER = "SUA_CHAVE";

const PORTAL_STEPS: Record<string, React.ReactNode> = {
  "grupo-olx": (
    <>
      No <strong>Portal do Anunciante (ZAP / Viva Real / OLX)</strong>, abra as configurações de integração de leads e
      cole a URL com <code>?token=</code> abaixo, com envio em JSON.
    </>
  ),
  "dream-casa": (
    <>
      Em <strong>Painel Dream Casa &gt; Integrações &gt; Webhook de Leads</strong>, cole a URL com <code>?token=</code> abaixo.
    </>
  ),
  "chaves-na-mao": (
    <>
      No menu <strong>Repasse de Leads / Webhook</strong> da conta anunciante Chaves na Mão, cadastre a URL com{" "}
      <code>?token=</code> abaixo.
    </>
  ),
  "landing-page": (
    <>
      No Elementor, selecione o formulário, vá em <strong>Actions After Submit &gt; Webhook</strong> e cole a URL com{" "}
      <code>?token=</code> abaixo. Campos nome, telefone e e-mail são mapeados automaticamente.
    </>
  ),
};

const SAMPLE_PAYLOAD = JSON.stringify(
  {
    nome: "Nome do Cliente",
    telefone: "DDD + número",
    email: "cliente@dominio.com",
    campanha: "Nome da campanha",
    codigoImovel: "REF do imóvel",
    mensagem: "Mensagem enviada pelo cliente",
  },
  null,
  2
);

export function IntegrationInstructionsTab({
  channel,
  webhookUrl,
  channelKey,
  canRevealKeys,
  keysError,
  signatureConfigured,
  onRevealKeys,
}: IntegrationInstructionsTabProps) {
  const keyValue = typeof channelKey === "string" ? channelKey : PLACEHOLDER;
  const isMeta = channel.auth === "meta";

  const keyBlock = (
    <div className="space-y-2">
      <p className="font-semibold text-foreground flex items-center gap-1.5">
        <KeyRound className="w-3.5 h-3.5 text-platz-gold" />
        {isMeta ? "Token de verificação (Verify Token)" : "Chave de autenticação"}
        <span className="font-mono text-[10px] text-muted-foreground">({channel.keyEnv})</span>
      </p>
      {typeof channelKey === "string" ? (
        <CopyField value={channelKey} tone="gold" title="Copiar chave" />
      ) : channelKey === null ? (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Chave não configurada. Defina a variável <code className="font-mono">{channel.keyEnv}</code> no servidor;
            em produção as requisições sem chave são bloqueadas.
          </span>
        </div>
      ) : canRevealKeys ? (
        <button
          type="button"
          onClick={onRevealKeys}
          className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-connect-blue" />
          Exibir chave (acesso auditado)
        </button>
      ) : (
        <p className="text-muted-foreground">
          Solicite a chave ao Administrador. Nos exemplos abaixo ela aparece como <code className="font-mono">{PLACEHOLDER}</code>.
        </p>
      )}
      {keysError && <p className="text-rose-600 dark:text-rose-400">{keysError}</p>}
    </div>
  );

  return (
    <div className="space-y-4 text-xs text-muted-foreground">
      <div className="space-y-2">
        <p className="font-semibold text-foreground">1. URL do webhook</p>
        <CopyField value={webhookUrl} title="Copiar URL" />
      </div>

      {keyBlock}

      {isMeta && (
        <div className="space-y-2">
          <p className="font-semibold text-foreground">2. Configuração no Facebook Developers</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>
              Em <strong>Webhooks &gt; Page</strong>, informe a URL acima como <em>Callback URL</em> e o Verify Token acima.
            </li>
            <li>
              Assine o campo <code className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">leadgen</code>.
            </li>
            <li>
              Cada entrega é validada pela assinatura <code className="font-mono">X-Hub-Signature-256</code> com o App
              Secret do aplicativo (variável <code className="font-mono">META_APP_SECRET</code> no servidor).
            </li>
          </ol>
          {signatureConfigured === false && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>META_APP_SECRET não configurado: a assinatura das entregas não pode ser validada.</span>
            </div>
          )}
        </div>
      )}

      {channel.auth === "google" && (
        <div className="space-y-2">
          <p className="font-semibold text-foreground">2. Configuração no Google Ads</p>
          <p>
            No formulário de lead da campanha, abra <strong>Integração de dados de leads &gt; Webhook</strong>, cole a URL
            acima no campo <em>URL do webhook</em> e a chave no campo <em>Chave</em> (enviada como{" "}
            <code className="font-mono">google_key</code>). Depois clique em <em>Enviar dados de teste</em>.
          </p>
        </div>
      )}

      {channel.auth === "url-token" && (
        <div className="space-y-2">
          <p className="font-semibold text-foreground">2. Configuração no canal</p>
          <p>{PORTAL_STEPS[channel.id]}</p>
          <p className="font-semibold text-foreground pt-1">URL com chave (para portais que só aceitam URL)</p>
          <CopyField value={`${webhookUrl}?token=${encodeURIComponent(keyValue)}`} title="Copiar URL com chave" />
          <p className="text-[11px]">
            Se a ferramenta permitir cabeçalhos, prefira enviar a chave em <code className="font-mono">x-api-key</code>.
          </p>
        </div>
      )}

      {channel.auth === "header" && (
        <div className="space-y-2">
          <p className="font-semibold text-foreground">2. Envio autenticado (n8n, Make, Zapier, cURL)</p>
          <p>
            Envie <code className="font-mono">POST</code> em JSON com o cabeçalho{" "}
            <code className="font-mono">x-api-key: {keyValue}</code> ou{" "}
            <code className="font-mono">Authorization: Bearer {keyValue}</code>.
          </p>
          <pre className="p-3 rounded-xl bg-muted text-foreground border border-border text-[11px] font-mono overflow-x-auto">
            {SAMPLE_PAYLOAD}
          </pre>
          <p className="text-[11px]">Campos obrigatórios: nome e telefone ou e-mail.</p>
        </div>
      )}

      <div className="p-2.5 rounded-xl bg-connect-blue/5 border border-connect-blue/20 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-connect-blue shrink-0 mt-0.5" />
        <span>
          Requisições sem chave válida recebem <strong>401</strong>. O status passa a &quot;Conectado&quot; assim que o
          primeiro lead deste canal for recebido.
        </span>
      </div>
    </div>
  );
}
