"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Building, Loader2 } from "lucide-react";
import { useCrmLookups, LookupProperty } from "@/components/crm/agenda/useCrmLookups";

interface PropertyInterestSelectorProps {
  value: string;
  onChange: (value: string, propertyDetails?: { bairro?: string | null; cidade?: string | null }) => void;
  modality: "VENDA" | "ALUGUEL";
  disabled?: boolean;
}

const CUSTOM_OPTION = "__OUTRO__";

export function PropertyInterestSelector({
  value,
  onChange,
  modality,
  disabled = false,
}: PropertyInterestSelectorProps) {
  const { properties, loading } = useCrmLookups({
    enabled: true,
    properties: true,
    leads: false,
    members: false,
  });

  // Filtra empreendimentos pela modalidade ativa
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (!p.modalidade || p.modalidade === "AMBOS") return true;
      if (modality === "VENDA") {
        return p.modalidade === "VENDA" || p.modalidade === "REPASSE";
      }
      return (
        p.modalidade === "LOCACAO_ANUAL" ||
        p.modalidade === "VERANEIO_TEMPORADA" ||
        p.modalidade === "ALUGUEL"
      );
    });
  }, [properties, modality]);

  // Checa se o valor atual corresponde a algum empreendimento da lista
  const matchingProperty = useMemo(() => {
    if (!value) return null;
    return filteredProperties.find(
      (p) => p.nome.trim().toLowerCase() === value.trim().toLowerCase()
    );
  }, [filteredProperties, value]);

  const [isCustom, setIsCustom] = useState(false);
  const [customText, setCustomText] = useState("");

  // Sincroniza se o valor inicial/externo for um nome customizado
  useEffect(() => {
    if (!value) {
      setIsCustom(false);
      setCustomText("");
    } else if (!matchingProperty && !loading) {
      setIsCustom(true);
      setCustomText(value);
    } else {
      setIsCustom(false);
      setCustomText("");
    }
  }, [value, matchingProperty, loading]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVal = e.target.value;
    if (selectedVal === CUSTOM_OPTION) {
      setIsCustom(true);
      onChange(customText.trim());
    } else {
      setIsCustom(false);
      const prop = filteredProperties.find((p) => p.nome === selectedVal);
      onChange(selectedVal, prop ? { bairro: prop.bairro, cidade: prop.cidade } : undefined);
    }
  };

  const handleCustomTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setCustomText(text);
    onChange(text);
  };

  const selectValue = isCustom ? CUSTOM_OPTION : matchingProperty?.nome || (value ? CUSTOM_OPTION : "");

  return (
    <div className="space-y-1.5">
      <label className="block text-foreground font-semibold">
        Empreendimento de Interesse
      </label>
      <div className="relative">
        <Building className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <select
          value={selectValue}
          onChange={handleSelectChange}
          disabled={disabled}
          className="w-full pl-9 pr-8 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-connect-blue appearance-none transition-colors"
        >
          <option value="">Selecione um empreendimento (opcional)...</option>
          {filteredProperties.length > 0 && (
            <optgroup label={`Empreendimentos de ${modality === "ALUGUEL" ? "Aluguel" : "Venda"}`}>
              {filteredProperties.map((p) => (
                <option key={p.id} value={p.nome}>
                  {p.nome}
                  {p.bairro ? ` — ${p.bairro}` : ""}
                  {p.cidade ? ` (${p.cidade})` : ""}
                </option>
              ))}
            </optgroup>
          )}
          <option value={CUSTOM_OPTION}>Outro / Não listado...</option>
        </select>
        {loading && (
          <Loader2 className="absolute right-3 top-2.5 w-3.5 h-3.5 text-muted-foreground animate-spin pointer-events-none" />
        )}
      </div>

      {isCustom && (
        <input
          type="text"
          placeholder="Digite o nome do empreendimento ou condomínio..."
          value={customText}
          onChange={handleCustomTextChange}
          autoFocus
          className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-2 focus:ring-connect-blue animate-fade-in"
        />
      )}
    </div>
  );
}
