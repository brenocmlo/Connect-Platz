"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Kanban,
  CalendarDays,
  MessageSquare,
  BadgeDollarSign,
  TrendingUp,
  Building2,
  Trophy,
  BarChart3,
  Users2,
  UserCircle,
  Settings,
  Layers,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCheck,
  Check,
  ExternalLink,
} from "lucide-react";
import { useCrm } from "./CrmContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  isExternal?: boolean;
  adminOnly?: boolean;
}

// 5.2 Ordem dos itens oficiais da Sidebar Connect Platz
const navItems: NavItem[] = [
  { label: "Dashboard", href: "/crm", icon: LayoutDashboard },
  { label: "Leads", href: "/crm/leads", icon: Kanban, badge: "SLA" },
  { label: "Agenda", href: "/crm/agenda", icon: CalendarDays, badge: "Novidade" },
  {
    label: "WhatsApp",
    href: "https://wa.me/558599999999",
    icon: MessageSquare,
    isExternal: true,
  },
  { label: "Vendas e Comissões", href: "/crm/vendas", icon: BadgeDollarSign },
  { label: "Fluxo de Caixa", href: "/crm/fluxo-de-caixa", icon: TrendingUp, adminOnly: true },
  { label: "Empreendimentos", href: "/crm/empreendimentos", icon: Building2 },
  { label: "Ranking", href: "/crm/ranking", icon: Trophy, badge: "Top" },
  { label: "Relatórios BI", href: "/crm/relatorios", icon: BarChart3 },
  { label: "Equipe", href: "/crm/equipes", icon: Users2, adminOnly: true },
  { label: "Integrações", href: "/crm/integracoes", icon: Layers, adminOnly: true },
  { label: "Log e Auditoria", href: "/crm/auditoria", icon: ShieldCheck, adminOnly: true },
  { label: "Configurações", href: "/crm/configuracoes", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const {
    user,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    handleCheckIn,
    handleStatusChange,
    handleLogout,
  } = useCrm();

  const isCurrentActive = (href: string) => {
    if (href === "/crm") return pathname === "/crm";
    if (href.startsWith("/crm/")) return pathname.startsWith(href);
    return false;
  };

  return (
    <>
      {/* Backdrop overlay para mobile */}
      {!isSidebarCollapsed && (
        <div
          onClick={() => setIsSidebarCollapsed(true)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-card border-r border-border flex flex-col transition-all duration-300 select-none ${
          isSidebarCollapsed
            ? "w-16 -translate-x-full md:translate-x-0"
            : "w-56 translate-x-0 shadow-2xl md:shadow-none"
        }`}
      >
      {/* 1. CABEÇALHO DA SIDEBAR: LOGO + BOTÃO DE RECOLHER (5.2) */}
      <div className="h-16 px-3 border-b border-border flex items-center justify-between">
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1266C7] to-[#0D478F] flex items-center justify-center shadow-md shadow-connect-blue/20 flex-shrink-0">
              <span className="font-extrabold text-white text-sm">CP</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-extrabold tracking-tight text-foreground leading-none">
                CONNECT <span className="text-[#D9BB4C]">PLATZ</span>
              </span>
              <span className="text-[8px] font-semibold text-muted-foreground tracking-wider uppercase mt-0.5">
                CRM IMOBILIÁRIO
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-br from-[#1266C7] to-[#0D478F] flex items-center justify-center shadow-md shadow-connect-blue/20">
            <span className="font-extrabold text-white text-xs">CP</span>
          </div>
        )}

        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title={isSidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
          aria-label={isSidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. LISTA DE NAVEGAÇÃO DOS 12 ITENS PADRÃO CONNECT PLATZ (5.2) */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {navItems.map((item) => {
          if (item.adminOnly && user && user.role !== "ADMINISTRADOR" && user.role !== "DIRETOR") {
            return null;
          }

          const active = !item.isExternal && isCurrentActive(item.href);
          const Icon = item.icon;

          if (isSidebarCollapsed) {
            return (
              <a
                key={item.label}
                href={item.href}
                target={item.isExternal ? "_blank" : undefined}
                rel={item.isExternal ? "noreferrer" : undefined}
                title={item.label}
                className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto transition-all ${
                  active
                    ? "bg-connect-blue text-white shadow-md shadow-connect-blue/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
              </a>
            );
          }

          return (
            <a
              key={item.label}
              href={item.href}
              target={item.isExternal ? "_blank" : undefined}
              rel={item.isExternal ? "noreferrer" : undefined}
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  setIsSidebarCollapsed(true);
                }
              }}
              className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-all group ${
                active
                  ? "rounded-full bg-connect-blue text-white shadow-md shadow-connect-blue/25"
                  : "rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105 ${
                  active ? "text-white" : "text-muted-foreground group-hover:text-connect-blue"
                }`}
              />
              <span className="truncate flex-1 tracking-tight">{item.label}</span>

              {item.isExternal && (
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-60" />
              )}

              {item.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    active
                      ? "bg-white/20 text-white"
                      : item.badge === "Novidade"
                      ? "bg-connect-blue/15 text-connect-blue border border-connect-blue/30"
                      : "bg-muted text-[#D9BB4C] border border-[#D9BB4C]/30"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* 3. RODAPÉ DA SIDEBAR: CHECK-IN COMPACTO & AVATAR COM LOGOUT (5.2) */}
      <div className="border-t border-border p-2.5 bg-card">
        {/* Check-in e status operacional (se expandido) */}
        {!isSidebarCollapsed && (
          <div className="mb-2">
            {!user?.hasCheckedInToday ? (
              <button
                onClick={handleCheckIn}
                className="w-full bg-connect-blue hover:bg-connect-deep-blue text-white text-[11px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <UserCheck className="w-3 h-3" />
                Check-in Diário
              </button>
            ) : (
              <div className="flex items-center justify-between px-2 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/40 text-[10px] text-emerald-400 font-medium">
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ativo na Roleta
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            )}
          </div>
        )}

        {/* Avatar, Nome, Cargo e Logout */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#D9BB4C] to-[#F8DA56] text-slate-900 font-extrabold text-[11px] flex items-center justify-center flex-shrink-0">
              {user?.nome ? user.nome.charAt(0).toUpperCase() : "U"}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-[11px] font-bold text-foreground truncate">
                  {user?.nome || "Corretor"}
                </span>
                <span className="text-[9px] font-semibold text-[#D9BB4C] uppercase tracking-wide">
                  {user?.role || "CORRETOR"}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="p-1 text-muted-foreground hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
            title="Sair do sistema"
            aria-label="Sair do sistema"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}

