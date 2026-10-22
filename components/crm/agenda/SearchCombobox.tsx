"use client";

// Combobox com busca (padrão shadcn/Habitus): input + lista suspensa filtrada, navegável por teclado.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Check, X, Loader2 } from "lucide-react";

export interface ComboOption {
  id: string;
  label: string;
  sublabel?: string | null;
}

interface SearchComboboxProps {
  options: ComboOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
  emptyText?: string;
  loading?: boolean;
  required?: boolean;
  disabled?: boolean;
}

export function SearchCombobox({
  options,
  value,
  onChange,
  placeholder = "Buscar...",
  emptyText = "Nenhum resultado encontrado",
  loading = false,
  required = false,
  disabled = false,
}: SearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value) || null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? options.filter(
          (o) => o.label.toLowerCase().includes(q) || (o.sublabel || "").toLowerCase().includes(q)
        )
      : options;
    return base.slice(0, 50);
  }, [options, query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const choose = (opt: ComboOption) => {
    onChange(opt.id);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && open && filtered[highlight]) {
      e.preventDefault();
      choose(filtered[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          disabled={disabled}
          // Campo "required" nativo valida a seleção (valor real, não o texto digitado)
          required={required && !selected}
          placeholder={selected ? selected.label : placeholder}
          value={open ? query : selected?.label || ""}
          onFocus={() => {
            setOpen(true);
            setHighlight(0);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onKeyDown={handleKeyDown}
          className="w-full bg-background border border-border rounded-lg pl-8 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue disabled:opacity-60"
          role="combobox"
          aria-expanded={open}
        />
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin" />
        ) : (
          selected &&
          !disabled && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpar seleção"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )
        )}
      </div>

      {open && !disabled && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 w-full max-h-52 overflow-y-auto bg-card border border-border rounded-lg shadow-xl p-1 animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {filtered.length === 0 ? (
            <li className="px-2.5 py-2 text-[11px] text-muted-foreground">
              {loading ? "Carregando..." : emptyText}
            </li>
          ) : (
            filtered.map((opt, idx) => (
              <li
                key={opt.id}
                role="option"
                aria-selected={opt.id === value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(opt);
                }}
                onMouseEnter={() => setHighlight(idx)}
                className={`px-2.5 py-1.5 rounded-md cursor-pointer flex items-center justify-between gap-2 ${
                  idx === highlight ? "bg-connect-blue text-white" : "text-foreground"
                }`}
              >
                <span className="min-w-0">
                  <span className="block text-xs font-semibold truncate">{opt.label}</span>
                  {opt.sublabel && (
                    <span
                      className={`block text-[10px] truncate ${
                        idx === highlight ? "text-white/80" : "text-muted-foreground"
                      }`}
                    >
                      {opt.sublabel}
                    </span>
                  )}
                </span>
                {opt.id === value && <Check className="w-3.5 h-3.5 shrink-0" />}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
