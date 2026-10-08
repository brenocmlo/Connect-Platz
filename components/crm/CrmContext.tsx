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

export type PeriodFilter = "hoje" | "7d" | "mes" | "30d" | "ano" | "todos";

export interface CrmNotification {
  id: string;
  title: string;
  message: string;
  type: "lead" | "sla" | "sale" | "booking";
  read: boolean;
  createdAt: string;
}

export type ThemeMode = "dark" | "light";
export type FontSizePreference = "small" | "normal" | "large" | "extra-large";

interface CrmContextType {
  user: UserSession | null;
  token: string | null;
  loading: boolean;
  theme: ThemeMode;
  toggleTheme: () => void;
  fontSize: FontSizePreference;
  setFontSize: (size: FontSizePreference) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  hideValues: boolean;
  toggleHideValues: () => void;
  formatMoney: (value: number) => string;
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

  // Tema Light / Dark (Padrão Dark do Habitus)
  const [theme, setTheme] = useState<ThemeMode>("dark");
  // Acessibilidade: Escala de Tamanho de Fonte (Padrão: normal / 100%)
  const [fontSize, setFontSizeState] = useState<FontSizePreference>("normal");
  // Mascarar valores financeiros (olho 👁 no PageHeader)
  const [hideValues, setHideValues] = useState<boolean>(false);

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
    // Inicializar Tema Light/Dark
    const savedTheme = (localStorage.getItem("connect_platz_theme") as ThemeMode) || "dark";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Inicializar Tamanho de Fonte de Acessibilidade
    const savedFontSize = (localStorage.getItem("connect_platz_font_size") as FontSizePreference) || "normal";
    setFontSizeState(savedFontSize);
    document.documentElement.setAttribute("data-font-size", savedFontSize);

    // Inicializar Mascaramento de Valores
    const savedHideValues = localStorage.getItem("connect_platz_hide_values") === "true";
    setHideValues(savedHideValues);

    // Auto-recolher sidebar em mobile (< 768px)
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
    }

    const defaultDemoUser: UserSession = {
      id: "user-robson-1",
      nome: "Robson Carvalho",
      email: "robson@connectplatz.com.br",
      role: "ADMINISTRADOR",
      status: "DISPONIVEL",
      organizationId: "org-platz-1",
      hasCheckedInToday: true,
      creci: "12345-J",
    };
    const defaultDemoToken = "jwt-session-connect-platz-token";

    const storedToken = localStorage.getItem("connect_platz_token");
    const storedUser = localStorage.getItem("connect_platz_user");

    if (!storedToken || !storedUser) {
      // Auto-inicializa com o usuário demo para que a tela carregue imediatamente
      localStorage.setItem("connect_platz_token", defaultDemoToken);
      localStorage.setItem("connect_platz_user", JSON.stringify(defaultDemoUser));
      setUser(defaultDemoUser);
      setToken(defaultDemoToken);
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setToken(storedToken);
    } catch {
      localStorage.setItem("connect_platz_token", defaultDemoToken);
      localStorage.setItem("connect_platz_user", JSON.stringify(defaultDemoUser));
      setUser(defaultDemoUser);
      setToken(defaultDemoToken);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("connect_platz_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const applyFontSize = (size: FontSizePreference) => {
    setFontSizeState(size);
    localStorage.setItem("connect_platz_font_size", size);
    document.documentElement.setAttribute("data-font-size", size);
  };

  const fontSizesList: FontSizePreference[] = ["small", "normal", "large", "extra-large"];

  const increaseFontSize = () => {
    const currentIndex = fontSizesList.indexOf(fontSize);
    if (currentIndex < fontSizesList.length - 1) {
      applyFontSize(fontSizesList[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const currentIndex = fontSizesList.indexOf(fontSize);
    if (currentIndex > 0) {
      applyFontSize(fontSizesList[currentIndex - 1]);
    }
  };

  const resetFontSize = () => {
    applyFontSize("normal");
  };

  const toggleHideValues = () => {
    setHideValues((prev) => {
      const next = !prev;
      localStorage.setItem("connect_platz_hide_values", String(next));
      return next;
    });
  };

  const formatMoney = (value: number) => {
    if (hideValues) return "••••";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

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
    setUser(null);
    setToken(null);
    window.location.href = "/login";
  };

  return (
    <CrmContext.Provider
      value={{
        user,
        token,
        loading,
        theme,
        toggleTheme,
        fontSize,
        setFontSize: applyFontSize,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        hideValues,
        toggleHideValues,
        formatMoney,
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
