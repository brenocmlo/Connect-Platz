"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Users,
  Inbox,
  ArrowRight,
} from "lucide-react";
import { parseLeadsCsv, ParsedCsvLead } from "@/lib/services/leads-csv";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { createLead, patchLead } from "./leadsApi";

interface ImportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedLeads: LeadDetail[]) => void;
  availableStages: { id: string; nome: string }[];
  funnelId: string | null;
}

export function ImportLeadsModal({
  isOpen,
  onClose,
  onImportSuccess,
  availableStages,
  funnelId,
}: ImportLeadsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedLeads, setParsedLeads] = useState<ParsedCsvLead[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState(availableStages[0]?.id || "");
  const [distributionMode, setDistributionMode] = useState<"responsavel" | "bolsao">("responsavel");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setFile(selected);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = parseLeadsCsv(content);
          if (parsed.length === 0) {
            setErrorMsg("Nenhum registro válido de lead foi encontrado no arquivo.");
            setParsedLeads([]);
          } else {
            setParsedLeads(parsed);
          }
        } catch (err: any) {
          setErrorMsg(err.message || "Erro ao processar o arquivo CSV.");
          setParsedLeads([]);
        }
      };
      reader.readAsText(selected, "UTF-8");
    }
  };

  // Cada linha é gravada via POST /api/leads (auditoria e score no servidor); falhas são reportadas
  const handleConfirmImport = async () => {
    if (parsedLeads.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);

    const created: LeadDetail[] = [];
    const failures: string[] = [];
    for (const p of parsedLeads) {
      try {
        let lead = await createLead({
          nome: p.nome,
          telefone: p.telefone,
          email: p.email,
          empreendimentoInteresse: p.empreendimento,
          renda: p.renda,
          origem: p.origem,
          etapaId: selectedStageId,
          funnelId,
        });
        if (distributionMode === "bolsao") {
          lead = await patchLead(lead.id, { action: "MOVER_BOLSAO" });
        }
        created.push(lead);
      } catch (err: any) {
        failures.push(`${p.nome}: ${err?.message || "erro"}`);
      }
    }

    setIsProcessing(false);
    if (created.length > 0) onImportSuccess(created);
    if (failures.length > 0) {
      setErrorMsg(
        `${created.length} lead(s) importado(s); ${failures.length} falharam — ${failures.slice(0, 3).join(" | ")}${
          failures.length > 3 ? " …" : ""
        }`
      );
      setParsedLeads((prev) => prev.filter((p) => failures.some((f) => f.startsWith(`${p.nome}:`))));
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Cabeçalho */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-connect-blue/10 text-connect-blue flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Importar Leads via Planilha
              </h3>
              <p className="text-xs text-muted-foreground">
                Faça upload de um arquivo CSV para cadastrar e distribuir múltiplos leads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Zona de Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,text/csv"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-connect-blue/60 bg-muted/30 hover:bg-muted/50 rounded-xl p-6 text-center cursor-pointer transition-all space-y-2 group"
          >
            <div className="w-12 h-12 mx-auto rounded-xl bg-connect-blue/10 text-connect-blue flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-xs font-semibold text-foreground">
              {file ? file.name : "Clique para selecionar um arquivo CSV ou arraste aqui"}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Formato aceito: .CSV com colunas (Nome, Telefone, E-mail, Empreendimento, Renda)
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Configurações de Ingestão */}
          {parsedLeads.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Etapa de Entrada no Funil
                  </label>
                  <select
                    value={selectedStageId}
                    onChange={(e) => setSelectedStageId(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-medium focus:ring-1 focus:ring-connect-blue"
                  >
                    {availableStages.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Método de Distribuição
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDistributionMode("responsavel")}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        distributionMode === "responsavel"
                          ? "border-connect-blue bg-connect-blue/10 text-connect-blue"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      Atribuir a mim
                    </button>
                    <button
                      type="button"
                      onClick={() => setDistributionMode("bolsao")}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        distributionMode === "bolsao"
                          ? "border-connect-blue bg-connect-blue/10 text-connect-blue"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      Bolsão
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview dos primeiros leads */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Pré-visualização dos primeiros registros</span>
                  <span className="text-connect-blue font-bold">
                    {parsedLeads.length} leads identificados
                  </span>
                </div>

                <div className="bg-background border border-border rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted text-muted-foreground text-[11px] font-semibold sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Nome</th>
                        <th className="py-2 px-3">Telefone</th>
                        <th className="py-2 px-3">Interesse</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parsedLeads.slice(0, 5).map((l, i) => (
                        <tr key={i} className="hover:bg-muted/40">
                          <td className="py-2 px-3 font-medium text-foreground">{l.nome}</td>
                          <td className="py-2 px-3 text-muted-foreground font-mono">{l.telefone}</td>
                          <td className="py-2 px-3 text-muted-foreground">{l.empreendimento || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedLeads.length === 0 || isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-connect-blue/20"
          >
            {isProcessing ? (
              <span>Importando...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Importar {parsedLeads.length} Leads</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
