"use client";

import { useEffect, useMemo, useState } from "react";
import type { DirectoryCity, PortalFilters, PropertyItem } from "./types";
import { INITIAL_FILTERS, matchesFilters } from "./portalUtils";

// Carrega o portfólio público do CRM e aplica os filtros da vitrine.
export function usePortalProperties() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [directoryCities, setDirectoryCities] = useState<DirectoryCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filters, setFilters] = useState<PortalFilters>(INITIAL_FILTERS);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const res = await fetch("/api/properties?portal=true");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!active) return;
        setProperties(data.properties || []);
        setDirectoryCities(data.directory || []);
      } catch (err) {
        console.error("Erro ao carregar dados do sistema:", err);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () => properties.filter((p) => matchesFilters(p, filters)),
    [properties, filters]
  );

  const updateFilter = <K extends keyof PortalFilters>(key: K, value: PortalFilters[K]) =>
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // As faixas de preço mudam entre venda e diária.
      ...(key === "modalidade" ? { faixaPreco: "TODOS" } : {}),
    }));

  const applyFilters = (partial: Partial<PortalFilters>) =>
    setFilters({ ...INITIAL_FILTERS, ...partial });

  const resetFilters = () => setFilters(INITIAL_FILTERS);

  return {
    properties,
    filtered,
    directoryCities,
    loading,
    error,
    filters,
    updateFilter,
    applyFilters,
    resetFilters,
  };
}
