"use client";

import React, { useEffect } from "react";
import { X, Filter, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  activeCount?: number;
  onApply?: () => void;
  onReset?: () => void;
  children: React.ReactNode;
}

export function FilterSheet({
  isOpen,
  onClose,
  title = "Filtros Avançados",
  subtitle = "Refine sua busca com filtros específicos",
  activeCount = 0,
  onApply,
  onReset,
  children,
}: FilterSheetProps) {
  // Fechar com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* 1. OVERLAY ESCURECIDO (bg-black/60) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* 2. SHEET LATERAL DIREITO (slide-in da direita) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="relative z-10 w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-2xl"
          >
            {/* Cabeçalho */}
            <div className="h-16 px-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-connect-blue/10 text-connect-blue flex items-center justify-center">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">{title}</h3>
                    {activeCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-connect-blue text-white">
                        {activeCount}
                      </span>
                    )}
                  </div>
                  {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Fechar filtros"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo com scroll */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">{children}</div>

            {/* Rodapé Fixo */}
            <div className="p-4 border-t border-border bg-card/90 flex items-center justify-between gap-3">
              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Fechar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onApply) onApply();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold transition-all shadow-md shadow-connect-blue/20 hover:scale-[1.02]"
                >
                  Ver Resultados
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
