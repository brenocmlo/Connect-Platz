"use client";

import React from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

export const inputClass =
  "w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue transition-all disabled:opacity-60 disabled:cursor-not-allowed";

interface ConfigFieldProps {
  label: string;
  icon?: React.ElementType;
  hint?: string;
  className?: string;
  children: React.ReactElement;
}

/** Rótulo + campo com ícone opcional à esquerda. */
export function ConfigField({ label, icon: Icon, hint, className = "", children }: ConfigFieldProps) {
  return (
    <div className={className}>
      <label className="block text-muted-foreground font-semibold mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />}
        {Icon
          ? React.cloneElement(children, {
              className: `${children.props.className || inputClass} pl-9`,
            })
          : children}
      </div>
      {hint && <span className="text-[10px] text-muted-foreground mt-1 block">{hint}</span>}
    </div>
  );
}

export function ConfigCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-card border border-border rounded-xl p-6 shadow-sm space-y-4 hover:border-connect-blue/30 transition-colors animate-fade-in-up ${className}`}
    >
      {children}
    </div>
  );
}

export function ConfigSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1].map((i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-3">
          <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="h-9 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConfigError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
      <span className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {message}
      </span>
      <button type="button" onClick={onRetry} className="flex items-center gap-1 font-bold">
        <RefreshCw className="w-3.5 h-3.5" />
        Tentar novamente
      </button>
    </div>
  );
}

interface SaveButtonProps {
  saving: boolean;
  label: string;
  icon?: React.ElementType;
  disabled?: boolean;
}

export function SaveButton({ saving, label, icon: Icon, disabled }: SaveButtonProps) {
  return (
    <button
      type="submit"
      disabled={saving || disabled}
      className="bg-connect-blue hover:bg-connect-blue/90 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-md shadow-connect-blue/20 hover:shadow-connect-blue/30 transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-60 disabled:hover:scale-100"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon ? <Icon className="w-4 h-4" /> : null}
      {saving ? "Salvando..." : label}
    </button>
  );
}

/** Mensagem efêmera no toast global do CRM. */
export function flash(setActionMessage: (m: string | null) => void, message: string, ms = 3500) {
  setActionMessage(message);
  setTimeout(() => setActionMessage(null), ms);
}
