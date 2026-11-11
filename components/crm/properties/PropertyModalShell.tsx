"use client";

import React, { useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface PropertyModalShellProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  maxWidth?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  ariaLabel?: string;
}

// Casca padrão dos modais de imóveis: overlay bg-black/60, fade + zoom-in leve, tokens light/dark.
export function PropertyModalShell({
  open,
  onClose,
  title,
  subtitle,
  icon,
  maxWidth = "max-w-2xl",
  children,
  footer,
  ariaLabel,
}: PropertyModalShellProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
            className={`relative flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl`}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            {title && (
              <div className="flex items-center gap-3 border-b border-border px-5 py-4 pr-14 sm:px-6">
                {icon}
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-foreground">{title}</h2>
                  {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

            {footer && <div className="border-t border-border bg-muted/20 px-5 py-3.5 sm:px-6">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Classes de formulário padronizadas (mesma altura h-10 e remoção de controles nativos no Safari/WebKit).
export const fieldLabel = "mb-1 block truncate text-xs font-semibold text-foreground";
export const fieldInput =
  "h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground [color-scheme:light] dark:[color-scheme:dark] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue";
export const fieldSelect =
  "h-10 w-full cursor-pointer appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-9 text-xs text-foreground [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue";
export const fieldTextarea =
  "min-h-[84px] w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue";
export const fieldHint = "mb-1 block text-[11px] text-muted-foreground";

export function SelectWithChevron({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}
