"use client";

import React from "react";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Kanban,
  CalendarDays,
  BadgeDollarSign,
  TrendingUp,
  Building2,
  Palmtree,
  Trophy,
  BarChart3,
  Users2,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Check,
  LogOut,
  Sparkles,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { useCrm } from "./CrmContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/crm", icon: LayoutDashboard },
  { label: "Leads & Funis", href: "/crm/leads", icon: Kanban, badge: "SLA" },
  { label: "Agenda & Visitas", href: "/crm/agenda", icon: CalendarDays },
  { label: "Vendas & Comissões", href: "/crm/vendas", icon: BadgeDollarSign },
  { label: "Fluxo de Caixa & DRE", href: "/crm/fluxo-de-caixa", icon: TrendingUp, adminOnly: true },
  { label: "Empreendimentos & Espelho", href: "/crm/empreendimentos", icon: Building2 },
  { label: "Aluguel de Temporada", href: "/crm/temporada", icon: Palmtree },
  { label: "Ranking & Gamificação", href: "/crm/ranking", icon: Trophy, badge: "Top" },
  { label: "Relatórios & SLA BI", href: "/crm/relatorios", icon: BarChart3 },
  { label: "Gestão de Equipes", href: "/crm/equipes", icon: Users2, adminOnly: true },
  { label: "Configurações", href: "/crm/configuracoes", icon: Settings, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const {
    user,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    selectedBranch,
    setSelectedBranch,
    handleCheckIn,
    handleStatusChange,
    handleLogout,
  } = useCrm();

  const isCurrentActive = (href: string) => {
    if (href === "/crm") {
      return pathname === "/crm";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-[#0A0E17] border-r border-[#1C2537] flex flex-col transition-all duration-300 select-none ${
        isSidebarCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* 1. TOPO: LOGO E RECOLHIMENTO */}
      <div className="h-16 px-4 border-b border-[#1C2537] flex items-center justify-between">
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1266C7] to-[#0D478F] flex items-center justify-center shadow-lg shadow-connect-blue/20 flex-shrink-0">
              <span className="font-extrabold text-white text-base">CP</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-white leading-none">
                CONNECT <span className="text-[#D9BB4C]">PLATZ</span>
              </span>
              <span className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase mt-1">
                CRM & ERP IMOBILIÁRIO
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-br from-[#1266C7] to-[#0D478F] flex items-center justify-center shadow-lg shadow-connect-blue/20">
            <span className="font-extrabold text-white text-sm">CP</span>
          </div>
        )}

        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#151D2C] transition-colors"
          title={isSidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. SELETOR DE UNIDADE / FILIAL (SE EXPANDIDO) */}
      {!isSidebarCollapsed && (
        <div className="px-3.5 py-3 border-b border-[#1C2537]/60 bg-[#070B12]">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#D9BB4C]" /> Unidade Operacional
            </span>
          </div>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full bg-[#111827] border border-[#1F2937] hover:border-connect-blue/50 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="Sede Fortaleza — Aldeota">Sede Fortaleza — Aldeota</option>
            <option value="Filial Porto das Dunas — Aquiraz">Filial Porto das Dunas — Aquiraz</option>
            <option value="Filial Meireles & Beira-Mar">Filial Meireles & Beira-Mar</option>
          </select>
        </div>
      )}

      {/* 3. LISTA DE ITENS DE MENU */}
      <nav className="flex-1 overflow-y-auto px-3 py-3.5 space-y-1">
        {navItems.map((item) => {
          // Ocultar itens administrativos se o usuário não for Admin ou Diretor
          if (item.adminOnly && user && user.role !== "ADMINISTRADOR" && user.role !== "DIRETOR") {
            return null;
          }

          const active = isCurrentActive(item.href);
          const Icon = item.icon;

          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                active
                  ? "bg-gradient-to-r from-connect-blue to-[#0E51A0] text-white shadow-md shadow-connect-blue/25"
                  : "text-slate-400 hover:text-slate-100 hover:bg-[#131B2A]"
              }`}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  active ? "text-white" : "text-slate-400 group-hover:text-connect-blue"
                }`}
              />

              {!isSidebarCollapsed && (
                <span className="truncate flex-1 tracking-tight">{item.label}</span>
              )}

              {!isSidebarCollapsed && item.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-[#1F2937] text-[#D9BB4C] border border-[#D9BB4C]/30"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* 4. LINK RÁPIDO PARA O PORTAL EXTERNO */}
      {!isSidebarCollapsed && (
        <div className="px-3.5 pb-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0F1624] border border-[#1C2537] text-slate-400 hover:text-white hover:border-[#D9BB4C]/40 text-[11px] font-medium transition-all"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-[#D9BB4C]" />
              Ver Portal Público
            </span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      )}

      {/* 5. CARD INFERIOR: CHECK-IN, STATUS OPERACIONAL E PERFIL */}
      <div className="border-t border-[#1C2537] p-3 bg-[#080C14]">
        {/* CHECK-IN DIÁRIO */}
        {!isSidebarCollapsed && (
          <div className="mb-2.5">
            {!user?.hasCheckedInToday ? (
              <button
                onClick={handleCheckIn}
                className="w-full bg-[#1266C7] hover:bg-[#0D478F] text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-connect-blue/20 transition-all hover:scale-[1.02]"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Fazer Check-in Diário
              </button>
            ) : (
              <div className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Check-in Ativo Hoje
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            )}
          </div>
        )}

        {/* STATUS OPERACIONAL NA ROLETA */}
        {!isSidebarCollapsed && user?.hasCheckedInToday && (
          <div className="grid grid-cols-3 gap-1 bg-[#0F1624] p-1 rounded-lg border border-[#1C2537] mb-2.5 text-[10px] font-semibold text-center">
            <button
              onClick={() => handleStatusChange("DISPONIVEL")}
              className={`py-1 rounded transition-all ${
                user.status === "DISPONIVEL"
                  ? "bg-emerald-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Disponível
            </button>
            <button
              onClick={() => handleStatusChange("EM_VISITA")}
              title="Em Visita Externa (mantém presença)"
              className={`py-1 rounded transition-all ${
                user.status === "EM_VISITA"
                  ? "bg-amber-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Em Visita
            </button>
            <button
              onClick={() => handleStatusChange("PAUSA")}
              className={`py-1 rounded transition-all ${
                user.status === "PAUSA"
                  ? "bg-slate-700 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Pausa
            </button>
          </div>
        )}

        {/* PERFIL DO USUÁRIO & LOGOUT */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D9BB4C] to-[#F8DA56] text-slate-900 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
              {user?.nome ? user.nome.charAt(0).toUpperCase() : "U"}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-white truncate">{user?.nome || "Corretor"}</span>
                <span className="text-[10px] font-semibold text-[#D9BB4C] uppercase tracking-wide">
                  {user?.role || "CORRETOR"}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
            title="Sair do sistema"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
