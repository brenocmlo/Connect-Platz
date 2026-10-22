"use client";

import React, { useEffect, useState } from "react";
import { Bell, CheckCircle2, CalendarClock } from "lucide-react";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { ConfigCard } from "./ConfigUi";

const STORAGE_KEY = "connect_platz_notification_prefs";

interface NotificationPrefs {
  sla: boolean;
  newLead: boolean;
  appointments: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = { sla: true, newLead: true, appointments: true };

const items: { key: keyof NotificationPrefs; title: string; desc: string; icon: React.ElementType; tint: string }[] = [
  {
    key: "sla",
    title: "Alertas de Estouro de SLA",
    desc: "Aviso antes do transbordo do lead para o bolsão",
    icon: Bell,
    tint: "bg-connect-blue/10 text-connect-blue",
  },
  {
    key: "newLead",
    title: "Novo Lead Atribuído",
    desc: "Notificar quando a roleta distribuir uma oportunidade para você",
    icon: CheckCircle2,
    tint: "bg-emerald-500/10 text-emerald-500",
  },
  {
    key: "appointments",
    title: "Compromissos & Visitas do Dia",
    desc: "Lembretes dos agendamentos marcados na sua agenda",
    icon: CalendarClock,
    tint: "bg-amber-500/10 text-amber-500",
  },
];

/** Preferências de alerta deste dispositivo (salvas localmente, aplicadas imediatamente). */
export function NotificationPreferencesCard() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch {
      // armazenamento indisponível: mantém padrão
    }
  }, []);

  const toggle = (key: keyof NotificationPrefs, value: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignora: preferência vale apenas para a sessão atual
      }
      return next;
    });
  };

  return (
    <ConfigCard>
      <SectionTitle title="Preferências de Notificação" />
      <p className="text-xs text-muted-foreground">
        Escolha quais alertas exibir neste dispositivo. As preferências são salvas automaticamente neste navegador.
      </p>

      <div className="space-y-3 pt-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <label
              key={it.key}
              className="flex items-center justify-between p-3.5 bg-muted/40 rounded-lg cursor-pointer hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${it.tint}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground block">{it.title}</span>
                  <span className="text-[11px] text-muted-foreground">{it.desc}</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs[it.key]}
                onChange={(e) => toggle(it.key, e.target.checked)}
                className="w-4 h-4 rounded text-connect-blue focus:ring-connect-blue"
              />
            </label>
          );
        })}
      </div>
    </ConfigCard>
  );
}
