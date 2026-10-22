"use client";

import React, { useMemo } from "react";
import { CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { formatCpf, validateCpf } from "@/lib/services/compliance";

interface CpfInputProps {
  value: string;
  onChange: (cpf: string, isValid: boolean) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export function CpfInput({
  value,
  onChange,
  className = "",
  placeholder = "000.000.000-00",
  required = false,
}: CpfInputProps) {
  const clean = value.replace(/\D/g, "");
  const isValid = useMemo(() => {
    if (clean.length === 11) return validateCpf(clean);
    return false;
  }, [clean]);

  const isComplete = clean.length === 11;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value);
    const valid = formatted.replace(/\D/g, "").length === 11 ? validateCpf(formatted) : false;
    onChange(formatted, valid);
  };

  return (
    <div className="relative">
      <input
        type="text"
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        maxLength={14}
        className={`w-full bg-muted/60 border rounded-xl p-2.5 text-xs text-foreground font-mono focus:outline-none focus:ring-2 transition-all pr-8 ${
          isComplete
            ? isValid
              ? "border-emerald-500/60 focus:ring-emerald-500"
              : "border-red-500/60 focus:ring-red-500"
            : "border-border focus:ring-connect-blue"
        } ${className}`}
      />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
        {isComplete ? (
          isValid ? (
            <span title="CPF Válido">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 animate-in zoom-in-50" />
            </span>
          ) : (
            <span title="CPF Inválido">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-in zoom-in-50" />
            </span>
          )
        ) : (
          <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground/60" />
        )}
      </div>
    </div>
  );
}
