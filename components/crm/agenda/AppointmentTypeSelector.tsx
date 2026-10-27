"use client";

import React from "react";
import { APPOINTMENT_FORM_TYPES, AppointmentEnumType } from "./types";

interface AppointmentTypeSelectorProps {
  selectedType: AppointmentEnumType;
  onChange: (type: AppointmentEnumType) => void;
}

export function AppointmentTypeSelector({ selectedType, onChange }: AppointmentTypeSelectorProps) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">
        Tipo de Compromisso *
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {APPOINTMENT_FORM_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-1.5 p-2 rounded-lg border text-left transition-all ${
              selectedType === t.id
                ? "bg-muted border-connect-blue ring-1 ring-connect-blue text-foreground font-bold"
                : "bg-background border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
            <span className="truncate text-[11px]">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
