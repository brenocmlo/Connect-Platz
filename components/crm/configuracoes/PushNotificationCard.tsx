"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  Smartphone,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";

export function PushNotificationCard() {
  const { setActionMessage } = useCrm();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [notifyLeads, setNotifyLeads] = useState(true);
  const [notifySla, setNotifySla] = useState(true);
  const [notifySound, setNotifySound] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setActionMessage("Seu navegador não suporta notificações nativas da Web.");
      setTimeout(() => setActionMessage(null), 3500);
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        setActionMessage("Notificações Web Push autorizadas com sucesso!");
        new Notification("Connect Platz CRM", {
          body: "Notificações nativas ativadas! Você receberá alertas em tempo real.",
          icon: "/icons/icon-192x192.png",
        });
      } else {
        setActionMessage("Permissão de notificações não foi concedida pelo navegador.");
      }
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const sendTestNotification = (type: "lead" | "sla" | "venda") => {
    if (permission !== "granted") {
      setActionMessage("Autorize as notificações acima antes de realizar o teste.");
      setTimeout(() => setActionMessage(null), 3500);
      return;
    }

    let title = "";
    let body = "";

    switch (type) {
      case "lead":
        title = "🔔 Novo Lead Atribuído via Roleta!";
        body = "Carlos Mendes acabou de entrar via Meta Ads. Imóvel de interesse: Villa Platz Beach.";
        break;
      case "sla":
        title = "⚠️ SLA Crítico Próximo do Limite!";
        body = "Lead Mariana Costa está há 18 min sem 1º contato (SLA de 20 min). Responda agora!";
        break;
      case "venda":
        title = "🎉 Nova Venda Registrada no CRM!";
        body = "Venda #108 confirmada: Unidade 402 - R$ 980.000. Parabéns à equipe!";
        break;
    }

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-192x192.png",
          vibrate: [200, 100, 200],
          data: { url: "/crm/leads" },
        } as any);
      });
    } else {
      new Notification(title, {
        body,
        icon: "/icons/icon-192x192.png",
      });
    }

    setActionMessage(`Notificação de teste (${type.toUpperCase()}) disparada no sistema!`);
    setTimeout(() => setActionMessage(null), 3500);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-connect-blue/10 flex items-center justify-center text-connect-blue shrink-0">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Notificações Web Push & Alertas Nativos PWA
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Avisos instantâneos de novos leads e timers de SLA no desktop e smartphone
            </p>
          </div>
        </div>

        {/* Status de Permissão */}
        <div className="flex items-center gap-2">
          {permission === "granted" ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Notificações Ativas
            </span>
          ) : permission === "denied" ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
              <AlertTriangle className="w-3.5 h-3.5" />
              Bloqueado no Navegador
            </span>
          ) : (
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1.5 rounded-lg bg-connect-blue text-white text-xs font-semibold hover:bg-connect-deep-blue transition-colors shadow-xs"
            >
              Ativar Notificações no Dispositivo
            </button>
          )}
        </div>
      </div>

      {/* Preferências de Disparo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30 cursor-pointer text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-foreground block">Novos Leads</span>
            <span className="text-[10px] text-muted-foreground">Alerta na Roleta Round-Robin</span>
          </div>
          <input
            type="checkbox"
            checked={notifyLeads}
            onChange={(e) => setNotifyLeads(e.target.checked)}
            className="w-4 h-4 rounded text-connect-blue focus:ring-connect-blue"
          />
        </label>

        <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30 cursor-pointer text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-foreground block">SLA Crítico</span>
            <span className="text-[10px] text-muted-foreground">Aviso aos 15 min de inatividade</span>
          </div>
          <input
            type="checkbox"
            checked={notifySla}
            onChange={(e) => setNotifySla(e.target.checked)}
            className="w-4 h-4 rounded text-connect-blue focus:ring-connect-blue"
          />
        </label>

        <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30 cursor-pointer text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-foreground block">Som & Vibração</span>
            <span className="text-[10px] text-muted-foreground">Feedback sonoro discreto</span>
          </div>
          <input
            type="checkbox"
            checked={notifySound}
            onChange={(e) => setNotifySound(e.target.checked)}
            className="w-4 h-4 rounded text-connect-blue focus:ring-connect-blue"
          />
        </label>
      </div>

      {/* Disparos de Teste Operacional */}
      <div className="pt-2">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground block mb-2">
          Testar Disparos em Tempo Real no Sistema Operacional
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => sendTestNotification("lead")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-connect-blue" />
            <span>Testar Novo Lead</span>
          </button>

          <button
            onClick={() => sendTestNotification("sla")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span>Testar SLA Crítico (20 min)</span>
          </button>

          <button
            onClick={() => sendTestNotification("venda")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-platz-gold/30 bg-platz-gold/5 hover:bg-platz-gold/10 text-foreground text-xs font-semibold transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-platz-gold" />
            <span>Testar Fechamento de Venda</span>
          </button>
        </div>
      </div>
    </div>
  );
}
