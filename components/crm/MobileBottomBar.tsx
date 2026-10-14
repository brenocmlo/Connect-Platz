"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Kanban,
  CalendarDays,
  BadgeDollarSign,
  Menu,
} from "lucide-react";
import { useCrm } from "./CrmContext";

/**
 * Barra de navegação inferior exclusiva para dispositivos móveis (smartphones).
 * Proporciona ergonomia de toque nativa estilo aplicativo móvel (PWA).
 */
export function MobileBottomBar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useCrm();

  const tabs = [
    { label: "Dashboard", href: "/crm", icon: LayoutDashboard },
    { label: "Leads", href: "/crm/leads", icon: Kanban },
    { label: "Agenda", href: "/crm/agenda", icon: CalendarDays },
    { label: "Vendas", href: "/crm/vendas", icon: BadgeDollarSign },
  ];

  const isCurrentActive = (href: string) => {
    if (href === "/crm") return pathname === "/crm";
    return pathname.startsWith(href);
  };

  return (
    <nav
      aria-label="Navegação móvel inferior"
      className="fixed bottom-0 left-0 right-0 z-30 h-[calc(3.75rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around px-2 md:hidden shadow-xl"
    >
      {tabs.map((tab) => {
        const active = isCurrentActive(tab.href);
        const Icon = tab.icon;
        return (
          <a
            key={tab.label}
            href={tab.href}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              active
                ? "text-connect-blue font-bold scale-105"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? "text-connect-blue" : ""}`} />
            <span className="text-[10px] tracking-tight mt-1">{tab.label}</span>
          </a>
        );
      })}

      {/* Botão de abrir menu lateral completo */}
      <button
        type="button"
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="flex flex-col items-center justify-center flex-1 py-1 text-muted-foreground hover:text-foreground transition-all"
        aria-label="Abrir menu completo"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] tracking-tight mt-1">Menu</span>
      </button>
    </nav>
  );
}
