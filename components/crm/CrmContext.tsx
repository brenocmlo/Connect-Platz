"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface UserSession {
  id: string;
  nome: string;
  email: string;
  role: "ADMINISTRADOR" | "DIRETOR" | "GERENTE" | "CORRETOR";
  status: "DISPONIVEL" | "EM_VISITA" | "PAUSA" | "OFFLINE";
  organizationId: string;
  hasCheckedInToday: boolean;
  creci?: string;
  photoUrl?: string;
}

export type PeriodFilter = "hoje" | "7d" | "mes" | "30d" | "ano";

export interface CrmNotification {
  id: string;
  title: string;
  message: string;
  type: "lead" | "sla" | "sale" | "booking";
  read: boolean;
  createdAt: string;
}

interface CrmContextType {
  user: UserSession | null;
  token: string | null;
  loading: boolean;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  selectedPeriod: PeriodFilter;
  setSelectedPeriod: (period: PeriodFilter) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  slaBreachedCount: number;
  setSlaBreachedCount: (count: number) => void;
  notifications: CrmNotification[];
  unreadCount: number;
  markNotificationsAsRead: () => void;
  actionMessage: string | null;
  setActionMessage: (msg: string | null) => void;
  handleCheckIn: () => Promise<boolean>;
  handleStatusChange: (newStatus: "DISPONIVEL" | "EM_VISITA" | "PAUSA" | "OFFLINE") => Promise<void>;
  handleLogout: () => void;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros Globais da Shell
  const [selectedBranch, setSelectedBranch] = useState("Sede Fortaleza — Aldeota");
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("mes");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [slaBreachedCount, setSlaBreachedCount] = useState(2);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Notificações em tempo real
  const [notifications, setNotifications] = useState<CrmNotification[]>([
    {
      id: "notif-1",
      title: "Novo Lead Meta Ads",
      message: "Lead 'Eduardo Matos' recebido via criativo Villa Platz Beach.",
      type: "lead",
      read: false,
      createdAt: "Há 10 min",
    },
    {
      id: "notif-2",
      title: "Alerta de SLA Estourado",
      message: "O lead 'Camila Vasconcelos' está há mais de 20 min sem contato inicial.",
      type: "sla",
      read: false,
      createdAt: "Há 25 min",
    },
    {
      id: "notif-3",
      title: "Reserva de Veraneio Confirmada",
      message: "Reserva #408 confirmada com pagamento via PIX para o condomínio Solarium.",
      type: "booking",
      read: true,
      createdAt: "Há 2 horas",
    },
  ]);

  useEffect(() => {
    const storedToken = localStorage.getItem("connect_platz_token");
    const storedUser = localStorage.getItem("connect_platz_user");

    if (!storedToken || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setToken(storedToken);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleCheckIn = async (): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch("/api/auth/checkin", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        if (user) {
          const updatedUser = { ...user, hasCheckedInToday: true, status: "DISPONIVEL" as const };
          setUser(updatedUser);
          localStorage.setItem("connect_platz_user", JSON.stringify(updatedUser));
        }
        setActionMessage("Check-in confirmado com sucesso! Você está ativo na Roleta Round-Robin.");
        setTimeout(() => setActionMessage(null), 5000);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Erro no check-in:", err);
      return false;
    }
  };

  const handleStatusChange = async (newStatus: "DISPONIVEL" | "EM_VISITA" | "PAUSA" | "OFFLINE") => {
    if (!token) return;
    try {
      const res = await fetch("/api/auth/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        if (user) {
          const updatedUser = { ...user, status: newStatus };
          setUser(updatedUser);
          localStorage.setItem("connect_platz_user", JSON.stringify(updatedUser));
        }
        setActionMessage(`Status operacional alterado para: ${newStatus}`);
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err) {
      console.error("Erro ao alterar status:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("connect_platz_token");
    localStorage.removeItem("connect_platz_user");
    router.push("/login");
  };

  return (
    <CrmContext.Provider
      value={{
        user,
        token,
        loading,
        selectedBranch,
        setSelectedBranch,
        selectedPeriod,
        setSelectedPeriod,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        slaBreachedCount,
        setSlaBreachedCount,
        notifications,
        unreadCount,
        markNotificationsAsRead,
        actionMessage,
        setActionMessage,
        handleCheckIn,
        handleStatusChange,
        handleLogout,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error("useCrm deve ser utilizado dentro de um CrmProvider");
  }
  return context;
}
