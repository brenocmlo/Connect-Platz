"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCrmNotifications } from "./useCrmNotifications";

export interface UserSession {
  id: string;
  nome: string;
  email: string;
  role: "ADMINISTRADOR" | "CORRETOR";
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [slaBreachedCount, setSlaBreachedCount] = useState(2);
  const [actionMessage, setActionMessage] = useState<string | null>(null);


  // Notificações reais (leads recebidos, SLA estourado, compromissos do dia)
  const { notifications, markNotificationsAsRead } = useCrmNotifications(Boolean(token));

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

    // Gerenciamento de Sidebar responsiva (desktop expandida, mobile recolhida)
    if (typeof window !== "undefined") {
      setIsSidebarCollapsed(window.innerWidth < 768);
      const handleResize = () => {
        if (window.innerWidth < 768) {
          setIsSidebarCollapsed(true);
        }
      };
      window.addEventListener("resize", handleResize);
      // clean up listener on unmount
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {

    // Inicialização da Sessão Autenticada via Cookie HttpOnly
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setUser(data.user);
            // Flag de sessão ativa (o token real trafega só no cookie HttpOnly)
            setToken("cookie-session");
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Erro ao carregar sessão:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
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
    if (user?.id) localStorage.setItem(`connect_platz_font_size_${user.id}`, size);
    document.documentElement.setAttribute("data-font-size", size);
  };

  // Ao trocar de usuário logado, aplica a preferência de acessibilidade individual dele
  useEffect(() => {
    if (!user?.id) return;
    const perUser = localStorage.getItem(`connect_platz_font_size_${user.id}`) as FontSizePreference | null;
    if (perUser && perUser !== fontSize) {
      setFontSizeState(perUser);
      localStorage.setItem("connect_platz_font_size", perUser);
      document.documentElement.setAttribute("data-font-size", perUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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



  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleCheckIn = async (): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch("/api/auth/checkin", {
        method: "POST",
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
        headers: { "Content-Type": "application/json" },
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // Ignora erro de rede no logout
    }
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
