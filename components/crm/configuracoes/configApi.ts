// components/crm/configuracoes/configApi.ts
// Helpers de acesso às APIs de configurações (cookie de sessão same-origin, sem Bearer).

import { useCallback, useEffect, useState } from "react";

export async function requestJson<T>(url: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    cache: "no-store",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `Falha na requisição (${res.status}).`);
  }
  return data as T;
}

/** Carrega um recurso de configuração com estados de loading/erro e recarga manual. */
export function useConfigResource<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await requestJson<T>(url));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, setData, loading, error, reload };
}

/** Envia um arquivo de imagem para /api/upload e devolve a URL pública. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.firstUrl) {
    throw new Error(data?.error || "Falha ao enviar a imagem.");
  }
  return data.firstUrl as string;
}

/** Formata DDD + número para exibição: (85) 99999-8877. */
export function formatBrPhone(digits: string | null | undefined): string {
  const d = String(digits || "").replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return d;
}

/** Exibe CNPJ com máscara 00.000.000/0000-00. */
export function formatCnpj(digits: string | null | undefined): string {
  const d = String(digits || "").replace(/\D/g, "");
  if (d.length !== 14) return d;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}
