// components/crm/leads/leadsApi.ts
// Cliente HTTP das rotas de Leads. O cookie HttpOnly de sessão vai automaticamente (same-origin);
// toda função lança Error com a mensagem da API quando a resposta não é 2xx.

import { LeadDetail } from "@/components/crm/LeadDrawer";
import { FunnelColumn } from "./KanbanBoard";

export interface LeadsResponse {
  leads: LeadDetail[];
  stages: FunnelColumn[];
  funnel: { id: string; nome: string } | null;
  funnels: { id: string; nome: string }[];
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json", ...(init?.headers || {}) } : init?.headers,
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Falha na requisição (${res.status}).`);
  return data as T;
}

/** Normaliza o lead vindo da API para o formato da interface. */
export function normalizeLead(raw: any): LeadDetail {
  return {
    ...raw,
    rendaDeclarada: raw.rendaDeclarada !== null && raw.rendaDeclarada !== undefined ? Number(raw.rendaDeclarada) : null,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    score: typeof raw.score === "number" ? raw.score : null,
    compromissosCount: raw.compromissosCount ?? 0,
    createdAt: raw.createdAt ?? null,
    corretor: raw.corretor ? { id: raw.corretor.id, nome: raw.corretor.nome } : null,
  };
}

export async function fetchLeads(funnelId?: string | null): Promise<LeadsResponse> {
  const qs = funnelId ? `?funnelId=${encodeURIComponent(funnelId)}` : "";
  const data = await request<any>(`/api/leads${qs}`);
  return {
    leads: (data.leads || []).map(normalizeLead),
    stages: data.stages || [],
    funnel: data.funnel || null,
    funnels: data.funnels || [],
  };
}

export async function createLead(payload: Record<string, unknown>): Promise<LeadDetail> {
  const data = await request<any>("/api/leads", { method: "POST", body: JSON.stringify(payload) });
  return normalizeLead(data.lead);
}

export async function patchLead(leadId: string, payload: Record<string, unknown>): Promise<LeadDetail> {
  const data = await request<any>(`/api/leads/${leadId}`, { method: "PATCH", body: JSON.stringify(payload) });
  return normalizeLead(data.lead);
}

export async function deleteLead(leadId: string): Promise<void> {
  await request(`/api/leads/${leadId}`, { method: "DELETE" });
}

export interface TimelineEntry {
  id: string;
  tipo: string;
  conteudo: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  user?: { id: string; nome: string } | null;
}

export async function fetchTimeline(leadId: string): Promise<TimelineEntry[]> {
  const data = await request<{ timeline: TimelineEntry[] }>(`/api/leads/${leadId}/timeline`);
  return data.timeline || [];
}

export async function addTimelineEntry(leadId: string, payload: Record<string, unknown>): Promise<TimelineEntry> {
  const data = await request<{ entry: TimelineEntry }>(`/api/leads/${leadId}/timeline`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.entry;
}

/** Evento global para propagar um lead atualizado fora do fluxo principal (ex.: primeiro contato). */
export const LEAD_UPDATED_EVENT = "crm:lead-updated";

export function broadcastLeadUpdated(lead: LeadDetail): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<LeadDetail>(LEAD_UPDATED_EVENT, { detail: lead }));
  }
}

/**
 * Registra o primeiro contato ao clicar em WhatsApp/telefone (idempotente na API).
 * Não bloqueia a ação do usuário; o lead atualizado é propagado via evento global.
 */
export function registerFirstContact(lead: Pick<LeadDetail, "id" | "firstContactAt">, canal: string): void {
  if (lead.firstContactAt) return;
  patchLead(lead.id, { action: "REGISTRAR_CONTATO", canal })
    .then(broadcastLeadUpdated)
    .catch((err) => console.warn("Não foi possível registrar o primeiro contato:", err?.message));
}

export interface LeadDocumentItem {
  id: string;
  tipo: string;
  nomeArquivo: string;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  createdAt: string;
}

export async function fetchLeadDocuments(leadId: string): Promise<LeadDocumentItem[]> {
  const data = await request<{ documents: LeadDocumentItem[] }>(`/api/leads/${leadId}/documents`);
  return data.documents || [];
}

/** Envia o arquivo para /api/upload (pasta "leads") e vincula ao lead. */
export async function uploadLeadDocument(leadId: string, file: File, tipo: string): Promise<LeadDocumentItem> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", "leads");
  const res = await fetch("/api/upload", { method: "POST", body: form, credentials: "same-origin" });
  const uploaded = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(uploaded?.error || "Falha no envio do arquivo.");
  const saved = uploaded.firstFile || uploaded.files?.[0];
  const data = await request<{ document: LeadDocumentItem }>(`/api/leads/${leadId}/documents`, {
    method: "POST",
    body: JSON.stringify({
      tipo,
      nomeArquivo: file.name,
      fileUrl: saved?.url || uploaded.firstUrl,
      fileSize: file.size,
      mimeType: file.type || undefined,
    }),
  });
  return data.document;
}

export async function removeLeadDocument(leadId: string, docId: string): Promise<void> {
  await request(`/api/leads/${leadId}/documents?docId=${encodeURIComponent(docId)}`, { method: "DELETE" });
}
