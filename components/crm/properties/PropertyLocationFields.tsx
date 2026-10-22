"use client";

import React, { useState } from "react";
import { Loader2, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { formatCep, REGIONAL_NEIGHBORHOODS } from "@/lib/services/location";
import { fieldInput, fieldLabel } from "./PropertyModalShell";

export interface PropertyLocationValue {
  cep: string;
  cidade: string;
  estado: string;
  bairro: string;
  endereco: string;
  latitude: number | null;
  longitude: number | null;
  /** Logradouro retornado pelo CEP: se o usuário editar o endereço, as coordenadas são recalculadas no servidor. */
  logradouroCep?: string;
}

export const EMPTY_LOCATION: PropertyLocationValue = {
  cep: "",
  cidade: "",
  estado: "CE",
  bairro: "",
  endereco: "",
  latitude: null,
  longitude: null,
};

/** Campos de localização enviados à API (coordenadas só quando ainda correspondem ao endereço). */
export function locationPayload(v: PropertyLocationValue) {
  const coordsValidas = v.latitude != null && v.longitude != null && (v.logradouroCep ?? "") === v.endereco;
  return {
    cep: v.cep.replace(/\D/g, "") || null,
    cidade: v.cidade.trim() || null,
    estado: v.estado.trim() || null,
    bairro: v.bairro.trim() || null,
    endereco: v.endereco.trim() || null,
    latitude: coordsValidas ? v.latitude : null,
    longitude: coordsValidas ? v.longitude : null,
  };
}

const KNOWN_CITIES = ["Fortaleza", "Aquiraz", "Eusébio", "Caucaia"];

interface Props {
  value: PropertyLocationValue;
  onChange: (next: PropertyLocationValue) => void;
  idPrefix: string;
}

// CEP com preenchimento automático (ViaCEP via /api/location/cep) + cidade, bairro e endereço.
export function PropertyLocationFields({ value, onChange, idPrefix }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "notfound" | "error">("idle");
  const set = (patch: Partial<PropertyLocationValue>) => onChange({ ...value, ...patch });

  const handleCep = async (raw: string) => {
    const cep = formatCep(raw);
    const clean = cep.replace(/\D/g, "");
    set({ cep });
    if (clean.length !== 8) {
      setStatus("idle");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch(`/api/location/cep/${clean}`);
      if (res.status === 404) return setStatus("notfound");
      if (!res.ok) return setStatus("error");
      const { data } = await res.json();
      onChange({
        ...value,
        cep,
        cidade: data.cidade || value.cidade,
        estado: data.uf || value.estado,
        bairro: data.bairro || value.bairro,
        endereco: data.logradouro || value.endereco,
        logradouroCep: data.logradouro || value.endereco,
        // Centróide do município não serve para rota: o servidor geocodifica o endereço final
        latitude: data.coordsService === "nominatim" ? data.latitude ?? null : null,
        longitude: data.coordsService === "nominatim" ? data.longitude ?? null : null,
      });
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  };

  const suggestions = REGIONAL_NEIGHBORHOODS[value.cidade] || [];

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-connect-blue/20 bg-connect-blue/5 p-3">
        <label htmlFor={`${idPrefix}-cep`} className="mb-1 flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-connect-blue">
            <Search className="h-3.5 w-3.5" /> CEP (preenchimento automático)
          </span>
          {status === "loading" && (
            <span className="flex items-center gap-1 text-[10px] text-connect-blue">
              <Loader2 className="h-3 w-3 animate-spin" /> Buscando endereço...
            </span>
          )}
          {status === "ok" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
          {(status === "notfound" || status === "error") && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-red-500">
              <AlertCircle className="h-3 w-3" />
              {status === "notfound" ? "CEP não encontrado" : "Falha ao consultar o CEP"}
            </span>
          )}
        </label>
        <input
          id={`${idPrefix}-cep`}
          type="text"
          inputMode="numeric"
          maxLength={9}
          value={value.cep}
          onChange={(e) => handleCep(e.target.value)}
          placeholder="00000-000"
          className={`${fieldInput} font-mono`}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={`${idPrefix}-cidade`} className={fieldLabel}>Cidade</label>
          <input
            id={`${idPrefix}-cidade`}
            type="text"
            list={`${idPrefix}-cidades`}
            value={value.cidade}
            onChange={(e) => set({ cidade: e.target.value })}
            placeholder="Ex.: Fortaleza"
            className={fieldInput}
          />
          <datalist id={`${idPrefix}-cidades`}>
            {KNOWN_CITIES.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-bairro`} className={fieldLabel}>Bairro</label>
          <input
            id={`${idPrefix}-bairro`}
            type="text"
            list={`${idPrefix}-bairros`}
            value={value.bairro}
            onChange={(e) => set({ bairro: e.target.value })}
            placeholder="Selecione ou digite..."
            className={fieldInput}
          />
          <datalist id={`${idPrefix}-bairros`}>
            {suggestions.map((b) => <option key={b} value={b} />)}
          </datalist>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-uf`} className={fieldLabel}>UF</label>
          <input
            id={`${idPrefix}-uf`}
            type="text"
            maxLength={2}
            value={value.estado}
            onChange={(e) => set({ estado: e.target.value.toUpperCase() })}
            className={`${fieldInput} uppercase`}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-endereco`} className={fieldLabel}>Endereço (rua, número)</label>
        <input
          id={`${idPrefix}-endereco`}
          type="text"
          value={value.endereco}
          onChange={(e) => set({ endereco: e.target.value })}
          placeholder="Av. Beira Mar, 1200"
          className={fieldInput}
        />
        <p className="mt-1 text-[10px] text-muted-foreground">
          As coordenadas para Waze e Google Maps são calculadas automaticamente a partir do endereço.
        </p>
      </div>
    </div>
  );
}

interface TipologiaValue {
  area_m2: string;
  quartos: string;
  suites: string;
  vagas: string;
}

export const EMPTY_TIPOLOGIA: TipologiaValue = { area_m2: "", quartos: "", suites: "", vagas: "" };

/** Converte a tipologia para números, mantendo 0 e omitindo campos vazios. */
export function tipologiaPayload(t: TipologiaValue): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(t)) {
    if (v === "") continue;
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) out[k] = n;
  }
  return out;
}

const TIPOLOGIA_FIELDS: { key: keyof TipologiaValue; label: string }[] = [
  { key: "area_m2", label: "Área privativa (m²)" },
  { key: "quartos", label: "Quartos" },
  { key: "suites", label: "Suítes" },
  { key: "vagas", label: "Vagas" },
];

export function PropertyTipologiaFields({ value, onChange }: { value: TipologiaValue; onChange: (v: TipologiaValue) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {TIPOLOGIA_FIELDS.map(({ key, label }) => (
        <div key={key}>
          <label className="mb-1 block text-[11px] text-muted-foreground">{label}</label>
          <input
            type="number"
            min="0"
            step={key === "area_m2" ? "0.01" : "1"}
            value={value[key]}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
            className={fieldInput}
          />
        </div>
      ))}
    </div>
  );
}
