"use client";

import { useCallback, useEffect, useState } from "react";
import type { CrmNotification } from "./CrmContext";

const READ_KEY = "connect_platz_notifications_read";

function loadReadIds(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

/** Busca notificações reais em /api/notificacoes e guarda localmente apenas quais já foram lidas. */
export function useCrmNotifications(enabled: boolean) {
  const [notifications, setNotifications] = useState<CrmNotification[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notificacoes", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const readIds = loadReadIds();
      setNotifications(
        (data.notifications || []).map((n: CrmNotification) => ({ ...n, read: readIds.has(n.id) }))
      );
    } catch {
      // Sem rede: mantém a última lista carregada
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [enabled, load]);

  const markNotificationsAsRead = () => {
    setNotifications((prev) => {
      const ids = prev.map((n) => n.id);
      try {
        const merged = Array.from(new Set([...Array.from(loadReadIds()), ...ids])).slice(-200);
        localStorage.setItem(READ_KEY, JSON.stringify(merged));
      } catch {}
      return prev.map((n) => ({ ...n, read: true }));
    });
  };

  return { notifications, markNotificationsAsRead };
}
