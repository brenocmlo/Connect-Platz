"use client";

import React, { useMemo, useState } from "react";
import { Code2, Copy, Check, Info } from "lucide-react";

interface InjectedScriptViewerCardProps {
  pixelId: string;
}

export function InjectedScriptViewerCard({ pixelId }: InjectedScriptViewerCardProps) {
  const [copied, setCopied] = useState(false);
  const activeId = pixelId || "1088120237434119";

  const scriptCode = useMemo(() => {
    return `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${activeId}');
fbq('track', 'PageView');
</script>
<noscript>
  <img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${activeId}&ev=PageView&noscript=1" />
</noscript>
<!-- End Meta Pixel Code -->`;
  }, [activeId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scriptCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-connect-blue/40 transition-colors animate-fade-in-up space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-connect-blue/10 text-connect-blue">
              <Code2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Script Injetado no Site
            </span>
          </div>
          <h3 className="text-base font-bold text-foreground tracking-tight">
            Código do Meta Pixel Ativo
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Este código já é carregado automaticamente em todas as páginas públicas da Connect Platz com o ID configurado.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-background hover:bg-muted text-foreground transition-all shrink-0 shadow-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copiado!" : "Copiar Script"}
        </button>
      </div>

      {/* Code Box */}
      <div className="relative rounded-xl bg-[#0B0F19] text-[#93A1B8] border border-[#1E293B] p-3.5 overflow-x-auto text-[11px] font-mono leading-relaxed select-all">
        <pre className="text-emerald-400/90 whitespace-pre">
          {scriptCode}
        </pre>
      </div>

      {/* Callout de Eventos Rastreados */}
      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
        <div className="leading-relaxed">
          <span className="font-semibold text-emerald-900 dark:text-emerald-200">
            Eventos rastreados automaticamente:
          </span>{" "}
          <span className="font-medium">PageView</span> (visita ao site),{" "}
          <span className="font-medium">ViewContent</span> (visualização da ficha do imóvel),{" "}
          <span className="font-medium">AddToCart</span> (simulação de parcelas/favorito),{" "}
          <span className="font-medium">InitiateCheckout</span> (início de proposta/agendamento),{" "}
          <span className="font-medium">Lead</span> (envio de contato com parâmetros UTM e cookies de clique) e{" "}
          <span className="font-bold underline decoration-emerald-500/50">Purchase</span> (conversão de venda ganha no CRM com VGV em R$).
        </div>
      </div>
    </div>
  );
}
