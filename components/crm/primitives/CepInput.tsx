"use client";

import React, { useState } from "react";
import { MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { formatCep, LocationData } from "@/lib/services/location";

interface CepInputProps {
  value: string;
  onChange: (cep: string) => void;
  onAddressFound: (address: LocationData) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export function CepInput({
  value,
  onChange,
  onAddressFound,
  className = "",
  placeholder = "Ex: 60165-121",
  required = false,
}: CepInputProps) {
  const [loading, setLoading] = useState(false);
  const [foundSuccess, setFoundSuccess] = useState(false);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    onChange(formatted);

    const clean = formatted.replace(/\D/g, "");
    if (clean.length === 8) {
      setLoading(true);
      setFoundSuccess(false);
      try {
        const res = await fetch(`/api/location/cep/${clean}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            onAddressFound(json.data);
            setFoundSuccess(true);
            setTimeout(() => setFoundSuccess(false), 2500);
          }
        }
      } catch (err) {
        console.error("Falha ao buscar CEP:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={handleCepChange}
        maxLength={9}
        className={`w-full bg-muted/60 border border-border rounded-xl p-2.5 text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-connect-blue transition-all pr-8 ${className}`}
      />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-connect-blue" />
        ) : foundSuccess ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 animate-in zoom-in-50" />
        ) : (
          <MapPin className="w-3.5 h-3.5" />
        )}
      </div>
    </div>
  );
}
