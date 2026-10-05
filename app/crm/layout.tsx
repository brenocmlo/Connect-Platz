"use client";

import React from "react";
import { CrmProvider, useCrm } from "@/components/crm/CrmContext";
import { Sidebar } from "@/components/crm/Sidebar";
import { Topbar } from "@/components/crm/Topbar";
import { FloatingSupport } from "@/components/crm/FloatingSupport";
import { PwaInstallPrompt } from "@/components/crm/PwaInstallPrompt";

function CrmShell({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed, loading } = useCrm();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-primary" />
          <span className="text-xs text-muted-foreground font-semibold tracking-wider uppercase">
            Carregando Connect Platz CRM...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? "md:pl-16 pl-0" : "md:pl-56 pl-0"
        }`}
      >
        <Topbar />
        <main className="flex-1 p-3.5 md:p-6 overflow-x-hidden animate-fade-in">{children}</main>
      </div>
      <FloatingSupport />
      <PwaInstallPrompt />
    </div>
  );
}

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <CrmProvider>
      <CrmShell>{children}</CrmShell>
    </CrmProvider>
  );
}

