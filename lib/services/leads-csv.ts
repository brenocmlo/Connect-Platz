// lib/services/leads-csv.ts
// Utilitários para Exportação e Importação determinística de Leads em formato CSV para o Connect Platz CRM

import { LeadDetail } from "@/components/crm/LeadDrawer";
import { sourceLabel } from "@/components/crm/leads/leadSource";

/**
 * Exporta uma lista de leads para arquivo CSV com codificação UTF-8 com BOM
 * para garantir compatibilidade perfeita com Microsoft Excel e Google Planilhas.
 */
export function exportLeadsToCsv(leads: LeadDetail[], fileNamePrefix = "leads_connect_platz") {
  if (!leads || leads.length === 0) {
    throw new Error("Nenhum lead disponível para exportação.");
  }

  const headers = [
    "ID",
    "Nome",
    "Telefone",
    "E-mail",
    "Etapa",
    "Temperatura",
    "Score",
    "Corretor Responsável",
    "Empreendimento de Interesse",
    "Renda Declarada",
    "Origem",
    "SLA Estourado",
    "Compromissos",
    "Criado Em",
  ];

  const rows = leads.map((lead) => {
    return [
      lead.id,
      escapeCsv(lead.nome),
      escapeCsv(lead.telefone),
      escapeCsv(lead.email || ""),
      escapeCsv(lead.stage?.nome || ""),
      lead.temperatura || "",
      lead.score ?? "",
      escapeCsv(lead.corretor?.nome || (lead.isBolsao ? "Bolsão" : "")),
      escapeCsv(lead.empreendimentoInteresse || ""),
      lead.rendaDeclarada ? lead.rendaDeclarada.toString() : "",
      escapeCsv(lead.sourceLabel || sourceLabel(lead.source)),
      lead.slaBreached ? "SIM" : "NÃO",
      lead.compromissosCount || 0,
      lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("pt-BR") : "",
    ].join(";");
  });

  const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split("T")[0];
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileNamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsv(val: string): string {
  if (!val) return '""';
  const clean = val.replace(/"/g, '""');
  return `"${clean}"`;
}

export interface ParsedCsvLead {
  nome: string;
  telefone: string;
  email?: string;
  empreendimento?: string;
  renda?: string;
  origem?: string;
}

/**
 * Analisa o conteúdo de um arquivo CSV de leads e mapeia as colunas comuns
 */
export function parseLeadsCsv(content: string): ParsedCsvLead[] {
  const lines = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error("O arquivo CSV deve conter pelo menos uma linha de cabeçalho e uma de dados.");
  }

  // Detectar separador (vírgula ou ponto e vírgula)
  const headerLine = lines[0];
  const separator = headerLine.includes(";") ? ";" : ",";

  const headers = headerLine.split(separator).map((h) => cleanHeader(h));

  const nameIdx = headers.findIndex((h) => h.includes("nome") || h.includes("cliente"));
  const phoneIdx = headers.findIndex((h) => h.includes("tel") || h.includes("fone") || h.includes("whats") || h.includes("cel"));
  const emailIdx = headers.findIndex((h) => h.includes("email") || h.includes("e-mail") || h.includes("correio"));
  const propIdx = headers.findIndex((h) => h.includes("imovel") || h.includes("empreendimento") || h.includes("interesse") || h.includes("produto"));
  const rendaIdx = headers.findIndex((h) => h.includes("renda") || h.includes("salario") || h.includes("valor"));
  const originIdx = headers.findIndex((h) => h.includes("origem") || h.includes("canal") || h.includes("campanha") || h.includes("source"));

  if (nameIdx === -1 && phoneIdx === -1) {
    throw new Error("O cabeçalho do arquivo precisa conter ao menos uma coluna de 'Nome' ou 'Telefone'.");
  }

  const results: ParsedCsvLead[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(separator).map((col) => col.replace(/^["']|["']$/g, "").trim());
    if (rawCols.length === 0 || rawCols.every((c) => c === "")) continue;

    const nome = nameIdx !== -1 && rawCols[nameIdx] ? rawCols[nameIdx] : "";
    const telefone = phoneIdx !== -1 && rawCols[phoneIdx] ? rawCols[phoneIdx] : "";
    const email = emailIdx !== -1 && rawCols[emailIdx] ? rawCols[emailIdx] : undefined;
    const empreendimento = propIdx !== -1 && rawCols[propIdx] ? rawCols[propIdx] : undefined;
    const renda = rendaIdx !== -1 && rawCols[rendaIdx] ? rawCols[rendaIdx] : undefined;
    const origem = originIdx !== -1 && rawCols[originIdx] ? rawCols[originIdx] : "Importação CSV";

    // Nome e telefone são obrigatórios no cadastro (sem nomes/telefones fictícios)
    if (nome && telefone) {
      results.push({ nome, telefone, email, empreendimento, renda, origem });
    }
  }

  return results;
}

function cleanHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}
