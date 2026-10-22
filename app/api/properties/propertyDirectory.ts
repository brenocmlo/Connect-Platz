// app/api/properties/propertyDirectory.ts
// Diretório do portal ("Apartamentos à venda em X") gerado a partir dos imóveis reais publicados.

import { PropertyModality } from "@prisma/client";

interface DirectorySource {
  nome: string;
  cidade: string | null;
  estado: string | null;
  modalidade: PropertyModality;
  caracteristicas: unknown;
}

export interface DirectoryCity {
  cidade: string;
  estado: string;
  comprar: string[];
  alugar: string[];
}

// Tipo do imóvel no plural, inferido do campo `tipo` das características ou do nome.
function tipoPlural(p: DirectorySource): string {
  const tipo = String((p.caracteristicas as any)?.tipo || p.nome || "").toLowerCase();
  if (tipo.includes("cobertura")) return "Coberturas";
  if (tipo.includes("studio") || tipo.includes("flat") || tipo.includes("kitnet")) return "Studios e flats";
  if (tipo.includes("sala") || tipo.includes("comercial")) return "Salas comerciais";
  if (tipo.includes("lote") || tipo.includes("terreno")) return "Lotes e terrenos";
  if (tipo.includes("casa") || tipo.includes("villa") || tipo.includes("mansão")) return "Casas";
  if (tipo.includes("apartamento") || tipo.includes("residencial") || tipo.includes("edifício")) return "Apartamentos";
  return "Imóveis";
}

export function buildDirectory(items: DirectorySource[]): DirectoryCity[] {
  const byCity = new Map<string, { estado: string; comprar: Set<string>; alugar: Set<string> }>();
  for (const p of items) {
    if (!p.cidade) continue;
    const entry = byCity.get(p.cidade) || { estado: p.estado || "", comprar: new Set<string>(), alugar: new Set<string>() };
    const tipo = tipoPlural(p);
    if (p.modalidade !== PropertyModality.VERANEIO_TEMPORADA) entry.comprar.add(`${tipo} à venda em ${p.cidade}`);
    if (p.modalidade !== PropertyModality.VENDA) entry.alugar.add(`${tipo} para temporada em ${p.cidade}`);
    byCity.set(p.cidade, entry);
  }
  return Array.from(byCity.entries())
    .map(([cidade, e]) => ({ cidade, estado: e.estado, comprar: Array.from(e.comprar), alugar: Array.from(e.alugar) }))
    .sort((a, b) => a.cidade.localeCompare(b.cidade, "pt-BR"));
}
