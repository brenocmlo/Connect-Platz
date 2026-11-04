"use client";

import React, { useState } from "react";
import { Server, Eye, EyeOff, Check, AlertCircle, Loader2, Sparkles } from "lucide-react";

interface MetaCapiGoogleCardProps {
  capiToken: string;
  capiTestEventCode: string;
  ga4MeasurementId: string;
  ga4Active: boolean;
  pixelIdForTesting: string;
  onChangeCapiToken: (v: string) => void;
  onChangeTestCode: (v: string) => void;
  onChangeGa4Id: (v: string) => void;
  onToggleGa4Active: (active: boolean) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

export function MetaCapiGoogleCard({
  capiToken,
  capiTestEventCode,
  ga4MeasurementId,
  ga4Active,
  pixelIdForTesting,
  onChangeCapiToken,
  onChangeTestCode,
  onChangeGa4Id,
  onToggleGa4Active,
  onSave,
  saving,
}: MetaCapiGoogleCardProps) {
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    if (!pixelIdForTesting) {
      setTestResult({
        success: false,
        message: "Configure e salve o ID do Pixel antes de realizar o teste de conexão.",
      });
      return;
    }
    if (!capiToken) {
      setTestResult({
        success: false,
        message: "Informe o Token de Acesso CAPI antes de testar.",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/integracoes/tracking/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pixelId: pixelIdForTesting,
          token: capiToken,
          testEventCode: capiTestEventCode || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Falha na comunicação com a Meta Graph API.");
      }

      setTestResult({
        success: true,
        message: data.message || "Conexão CAPI validada com sucesso!",
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || "Erro inesperado ao testar conexão CAPI.",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-connect-blue/40 transition-colors animate-fade-in-up space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Server className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Configurações Avançadas Server-Side & Google
          </span>
        </div>
        <h3 className="text-base font-bold text-foreground tracking-tight">
          API de Conversões da Meta (CAPI) & Google Analytics 4
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Token CAPI */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Token de Acesso CAPI (Opcional)
          </label>
          <div className="relative">
            <input
              type={showToken ? "text" : "password"}
              placeholder="EAAB..."
              value={capiToken}
              onChange={(e) => onChangeCapiToken(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-3 pr-10 py-2 text-xs font-mono text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue transition-all"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              title={showToken ? "Ocultar token" : "Exibir token"}
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Envia conversões do CRM direto pelo servidor (imune a bloqueadores).
          </p>
        </div>

        {/* Código de Evento de Teste */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Código de Evento de Teste (Meta)
          </label>
          <input
            type="text"
            placeholder="Ex: TEST12345"
            value={capiTestEventCode}
            onChange={(e) => onChangeTestCode(e.target.value.trim().toUpperCase())}
            maxLength={30}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue transition-all"
          />
          <p className="text-[11px] text-muted-foreground">
            Usado para depurar eventos CAPI na aba Eventos de Teste da Meta.
          </p>
        </div>

        {/* GA4 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              ID Google Analytics 4 (GA4)
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={ga4Active}
                onChange={(e) => onToggleGa4Active(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                  ga4Active
                    ? "bg-connect-blue border-connect-blue text-white"
                    : "border-border bg-background"
                }`}
              >
                {ga4Active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              Ativo
            </label>
          </div>
          <input
            type="text"
            placeholder="Ex: G-XXXXXXXXXX"
            value={ga4MeasurementId}
            onChange={(e) => onChangeGa4Id(e.target.value.trim().toUpperCase())}
            maxLength={25}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue transition-all"
          />
          <p className="text-[11px] text-muted-foreground">
            Rastreamento complementar de eventos GA4 no site.
          </p>
        </div>
      </div>

      {testResult && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-fade-in-up ${
            testResult.success
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
          }`}
        >
          {testResult.success ? (
            <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/60">
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testing || !capiToken}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border border-border bg-background hover:bg-muted text-foreground transition-all disabled:opacity-50"
        >
          {testing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-platz-gold" />
          )}
          Testar Conexão CAPI
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-connect-blue hover:bg-connect-blue-dark shadow-sm hover:shadow-connect-blue/20 transition-all disabled:opacity-50"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Salvar Configurações de Integração
        </button>
      </div>
    </div>
  );
}
