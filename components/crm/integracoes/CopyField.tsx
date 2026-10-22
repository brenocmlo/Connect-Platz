"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyFieldProps {
  value: string;
  tone?: "primary" | "gold";
  title?: string;
}

/** Campo monoespaçado somente leitura com botão de copiar. */
export function CopyField({ value, tone = "primary", title = "Copiar" }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard indisponível (contexto inseguro): o usuário pode selecionar o texto manualmente
    }
  };

  return (
    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted border border-border">
      <code
        className={`text-xs font-mono flex-1 break-all font-semibold select-all ${
          tone === "gold" ? "text-amber-700 dark:text-platz-gold" : "text-connect-blue"
        }`}
      >
        {value}
      </code>
      <button
        type="button"
        onClick={copy}
        className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-colors shrink-0"
        title={title}
      >
        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
