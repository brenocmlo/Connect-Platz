"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { MetaSitePixelCard } from "./MetaSitePixelCard";
import { MetaCrmPixelCard } from "./MetaCrmPixelCard";
import { MetaCapiGoogleCard } from "./MetaCapiGoogleCard";
import { UtmGeneratorCard } from "./UtmGeneratorCard";
import { InjectedScriptViewerCard } from "./InjectedScriptViewerCard";
import { TrackingSettings, DEFAULT_TRACKING_SETTINGS } from "@/lib/tracking/tracking-settings";

export function MetaPixelCapiTab() {
  const [settings, setSettings] = useState<TrackingSettings>(DEFAULT_TRACKING_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/integracoes/tracking", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Erro ao carregar configurações.");
      if (data.settings) setSettings(data.settings);
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Não foi possível carregar as configurações." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/integracoes/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Erro ao salvar configurações.");

      setFeedback({
        type: "success",
        message: "Configurações de Meta Pixel, CAPI e GA4 salvas e sincronizadas com sucesso!",
      });
      if (data.settings) setSettings(data.settings);
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Erro ao salvar configurações de rastreamento." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-connect-blue" />
        <span className="text-xs font-semibold">Carregando parâmetros de rastreamento e CAPI...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in-up">
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 shadow-xs transition-all ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-[11px] font-semibold underline hover:opacity-80 ml-2 shrink-0"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Grid Superior: Card 1 (Site Pixel) & Card 2 (CRM Pixel) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        <MetaSitePixelCard
          pixelId={settings.sitePixelId}
          isActive={settings.sitePixelActive}
          onChangePixelId={(val) => setSettings((s) => ({ ...s, sitePixelId: val }))}
          onToggleActive={(active) => setSettings((s) => ({ ...s, sitePixelActive: active }))}
        />

        <MetaCrmPixelCard
          pixelId={settings.crmPixelId}
          isActive={settings.crmPixelActive}
          sitePixelIdFallback={settings.sitePixelId}
          onChangePixelId={(val) => setSettings((s) => ({ ...s, crmPixelId: val }))}
          onToggleActive={(active) => setSettings((s) => ({ ...s, crmPixelActive: active }))}
        />
      </div>

      {/* Card 3: Configurações Avançadas Server-Side (CAPI) & GA4 */}
      <MetaCapiGoogleCard
        capiToken={settings.capiToken}
        capiTestEventCode={settings.capiTestEventCode}
        ga4MeasurementId={settings.ga4MeasurementId}
        ga4Active={settings.ga4Active}
        pixelIdForTesting={settings.sitePixelId || settings.crmPixelId}
        onChangeCapiToken={(val) => setSettings((s) => ({ ...s, capiToken: val }))}
        onChangeTestCode={(val) => setSettings((s) => ({ ...s, capiTestEventCode: val }))}
        onChangeGa4Id={(val) => setSettings((s) => ({ ...s, ga4MeasurementId: val }))}
        onToggleGa4Active={(active) => setSettings((s) => ({ ...s, ga4Active: active }))}
        onSave={handleSave}
        saving={saving}
      />

      {/* Grid Inferior: Card 4 (Gerador de UTMs) & Card 5 (Script Injetado) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        <UtmGeneratorCard />
        <InjectedScriptViewerCard pixelId={settings.sitePixelId} />
      </div>
    </div>
  );
}
