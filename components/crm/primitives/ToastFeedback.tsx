"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastFeedbackProps {
  message: string | null;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export function ToastFeedback({
  message,
  type = "success",
  onClose,
  duration = 3500,
}: ToastFeedbackProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-5 right-16 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-card border border-border shadow-xl backdrop-blur-md"
        >
          {type === "success" ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          )}

          <span className="text-xs font-semibold text-foreground tracking-tight">
            {message}
          </span>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground ml-1"
            aria-label="Fechar notificação"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
