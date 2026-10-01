"use client";

import React from "react";
import { CrmProvider, useCrm } from "@/components/crm/CrmContext";
import { Sidebar } from "@/components/crm/Sidebar";
import { Topbar } from "@/components/crm/Topbar";

function CrmShell({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed, loading } = useCrm();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080C14] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-connect-blue" />
          <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
            Carregando Connect Platz CRM...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? "pl-20" : "pl-64"
        }`}
      >
        <Topbar />
        <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
      </div>
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
