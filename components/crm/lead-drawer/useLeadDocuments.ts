"use client";

// Documentos do lead persistidos no banco (LeadDocument) — compartilhado pelo drawer e pelo modal de edição.

import { useCallback, useEffect, useState } from "react";
import {
  fetchLeadDocuments,
  uploadLeadDocument,
  removeLeadDocument,
  LeadDocumentItem,
} from "@/components/crm/leads/leadsApi";

export function useLeadDocuments(leadId: string | null | undefined) {
  const [documents, setDocuments] = useState<LeadDocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leadId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchLeadDocuments(leadId)
      .then((docs) => !cancelled && setDocuments(docs))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  const upload = useCallback(
    async (files: File[], tipo: string) => {
      if (!leadId || files.length === 0) return 0;
      setBusy(true);
      setError(null);
      let count = 0;
      try {
        for (const file of files) {
          const doc = await uploadLeadDocument(leadId, file, tipo);
          setDocuments((prev) => [doc, ...prev]);
          count++;
        }
      } catch (err: any) {
        setError(err?.message || "Falha ao anexar documento.");
      } finally {
        setBusy(false);
      }
      return count;
    },
    [leadId]
  );

  const remove = useCallback(
    async (docId: string) => {
      if (!leadId) return false;
      setBusy(true);
      setError(null);
      try {
        await removeLeadDocument(leadId, docId);
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        return true;
      } catch (err: any) {
        setError(err?.message || "Falha ao remover documento.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [leadId]
  );

  return { documents, isLoading, busy, error, upload, remove };
}

export function formatBytes(bytes?: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
