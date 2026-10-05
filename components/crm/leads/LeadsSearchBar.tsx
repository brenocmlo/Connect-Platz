"use client";

import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

interface LeadsSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenFilters: () => void;
  hasActiveFilters?: boolean;
}

export function LeadsSearchBar({
  searchQuery,
  setSearchQuery,
  onOpenFilters,
  hasActiveFilters = false,
}: LeadsSearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Busque por nome, e-mail ou telefone…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue shadow-xs transition-all"
        />
      </div>

      <button
        onClick={onOpenFilters}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-xs transition-all ${
          hasActiveFilters
            ? "bg-connect-blue/15 border-connect-blue text-connect-blue font-bold"
            : "bg-card border-border hover:bg-muted text-foreground"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="hidden sm:inline">Filtros</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 rounded-full bg-connect-blue animate-pulse" />
        )}
      </button>
    </div>
  );
}
