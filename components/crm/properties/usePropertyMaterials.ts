"use client";

// Materiais de vendas de um imóvel persistidos no servidor (/api/properties/[id]/materials).
import { useCallback, useEffect, useState } from "react";

export type MaterialCategoria = "BOOK" | "TABELA" | "MEMORIAL" | "PLANTAS" | "DOCUMENTO";

export interface PropertyMaterialItem {
  id: string;
  titulo: string;
  categoria: MaterialCategoria;
  url: string;
  tamanho: string | null;
  tipo: "pdf" | "image" | "doc" | "link";
  createdAt: string;
  updatedAt?: string;
}

export const MAX_MATERIAL_BYTES = 25 * 1024 * 1024;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function readError(res: Response, fallback: string) {
  const data = await res.json().catch(() => null);
  return data?.error || fallback;
}

export function usePropertyMaterials(propertyId: string | null) {
  const [materials, setMaterials] = useState<PropertyMaterialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/properties/${propertyId}/materials`, { cache: "no-store" });
      if (!res.ok) throw new Error(await readError(res, "Não foi possível carregar os materiais."));
      const data = await res.json();
      setMaterials(data.materials || []);
    } catch (err: any) {
      setMaterials([]);
      setError(err.message || "Não foi possível carregar os materiais.");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    setMaterials([]);
    load();
  }, [load]);

  /** Envia o arquivo (pasta materials) e registra o material. Lança erro com mensagem amigável. */
  const addFromFile = async (file: File, titulo: string, categoria: MaterialCategoria) => {
    if (!propertyId) throw new Error("Imóvel não selecionado.");
    if (file.size > MAX_MATERIAL_BYTES) throw new Error("O arquivo excede o limite de 25 MB.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "materials");
    const up = await fetch("/api/upload", { method: "POST", body: formData });
    if (!up.ok) throw new Error(await readError(up, "Erro no upload do arquivo."));
    const uploaded = (await up.json()).firstFile;

    return register({ titulo, categoria, url: uploaded.url, tipo: uploaded.type || "pdf" });
  };

  const addLink = (url: string, titulo: string, categoria: MaterialCategoria) =>
    register({ titulo, categoria, url, tipo: "link" });

  const register = async (payload: { titulo: string; categoria: MaterialCategoria; url: string; tipo: string }) => {
    const res = await fetch(`/api/properties/${propertyId}/materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await readError(res, "Erro ao cadastrar o material."));
    const { material } = await res.json();
    setMaterials((prev) => [material, ...prev]);
    return material as PropertyMaterialItem;
  };

  const remove = async (materialId: string) => {
    const res = await fetch(`/api/properties/${propertyId}/materials/${materialId}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await readError(res, "Erro ao excluir o material."));
    setMaterials((prev) => prev.filter((m) => m.id !== materialId));
  };

  return { materials, loading, error, reload: load, addFromFile, addLink, remove };
}
