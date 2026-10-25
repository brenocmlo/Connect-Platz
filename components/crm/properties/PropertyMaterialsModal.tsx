"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Download,
  Share2,
  MessageSquare,
  Check,
  Building2,
  ExternalLink,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { PropertyCardData } from "./PropertyProductCard";
import { AddMaterialForm } from "./AddMaterialForm";
import { PropertyMaterialItem, usePropertyMaterials } from "./usePropertyMaterials";
import { useCrm } from "@/components/crm/CrmContext";

export type { PropertyMaterialItem } from "./usePropertyMaterials";

interface PropertyMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyCardData | null;
}


const absoluteUrl = (url: string) => (url.startsWith("http") ? url : `${window.location.origin}${url}`);

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR");
};

export function PropertyMaterialsModal({
  isOpen,
  onClose,
  property,
}: PropertyMaterialsModalProps) {
  const { user, setActionMessage } = useCrm();
  const canManage = user?.role === "ADMINISTRADOR";
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { materials, loading, error, reload, addFromFile, addLink, remove } = usePropertyMaterials(
    isOpen && property ? property.id : null
  );

  useEffect(() => {
    if (!isOpen) setShowAddForm(false);
  }, [isOpen]);

  if (!isOpen || !property) return null;

  const notify = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleCopyLink = async (item: PropertyMaterialItem) => {
    try {
      await navigator.clipboard.writeText(absoluteUrl(item.url));
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      notify("Não foi possível copiar o link.");
    }
  };

  const handleSendWhatsApp = (item: PropertyMaterialItem) => {
    const text = encodeURIComponent(
      `Olá! Segue o material oficial do empreendimento *${property.nome}*:\n\n📄 *${item.titulo}*\nAcesse pelo link: ${absoluteUrl(item.url)}\n\nFico à disposição para tirar qualquer dúvida!`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleDeleteItem = async (item: PropertyMaterialItem) => {
    if (!confirm(`Excluir o material "${item.titulo}"? O arquivo será removido do servidor.`)) return;
    setDeletingId(item.id);
    try {
      await remove(item.id);
      notify("Material excluído com sucesso.");
    } catch (err: any) {
      notify(err.message || "Erro ao excluir o material.");
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryBadge = (cat: PropertyMaterialItem["categoria"]) => {
    switch (cat) {
      case "BOOK":
        return "bg-connect-blue/15 text-connect-blue border-connect-blue/30";
      case "TABELA":
        return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
      case "MEMORIAL":
        return "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
      case "PLANTAS":
        return "bg-amber-500/15 text-amber-600 border-amber-500/30";
      case "DOCUMENTO":
        return "bg-slate-500/15 text-slate-600 border-slate-500/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between gap-3 bg-muted/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-connect-blue/15 text-connect-blue flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground truncate">
                  Materiais & Anexos Oficiais
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-connect-blue text-white uppercase tracking-wider">
                  Vendas
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {[property.nome, [property.bairro, property.cidade].filter(Boolean).join(", ")].filter(Boolean).join(" • ")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted bg-muted/60 border border-border transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground">
              {loading ? "Carregando materiais..." : `${materials.length} ${materials.length === 1 ? "material disponível" : "materiais disponíveis"} para envio ao cliente`}
            </span>
            {canManage && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-bold text-connect-blue hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? "Cancelar" : "Novo Anexo"}</span>
            </button>
            )}
          </div>

          {/* Form com Upload Real de Arquivo e Link */}
          {showAddForm && canManage && (
            <AddMaterialForm
              onAddFile={addFromFile}
              onAddLink={addLink}
              onSuccess={() => {
                setShowAddForm(false);
                notify("Material adicionado com sucesso!");
              }}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {error && (
            <div className="flex items-center justify-between gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-600 dark:text-red-400">
              <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{error}</span>
              <button type="button" onClick={reload} className="font-bold underline">Tentar novamente</button>
            </div>
          )}

          {loading && (
            <div className="space-y-2.5">
              {[0, 1].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          )}

          {!loading && !error && materials.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center border border-dashed border-border rounded-xl">
              <FileText className="w-7 h-7 text-muted-foreground" />
              <p className="text-xs font-semibold text-foreground">Nenhum material cadastrado</p>
              <p className="text-[11px] text-muted-foreground max-w-xs">
                {canManage ? "Envie books, tabelas, memoriais e plantas para a equipe compartilhar com os clientes." : "Os administradores ainda não enviaram materiais para este imóvel."}
              </p>
            </div>
          )}

          {/* Lista de Materiais */}
          <div className="space-y-2.5">
            {materials.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-connect-blue/40 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-connect-blue" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-foreground truncate">
                        {item.titulo}
                      </h4>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getCategoryBadge(
                          item.categoria
                        )}`}
                      >
                        {item.categoria}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                      <span>{item.tipo === "link" ? "Link externo" : item.tamanho || "—"}</span>
                      <span>•</span>
                      <span>Enviado em {formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                  <button
                    onClick={() => handleCopyLink(item)}
                    className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
                    title="Copiar link seguro"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>

                  <a
                    href={item.url}
                    {...(item.tipo === "link" ? { target: "_blank", rel: "noopener noreferrer" } : { download: "" })}
                    className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
                    title={item.tipo === "link" ? "Abrir link" : "Baixar arquivo"}
                  >
                    {item.tipo === "link" ? (
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </a>

                  <button
                    onClick={() => handleSendWhatsApp(item)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold transition-all shadow-xs hover:scale-[1.02] active:scale-95"
                    title="Enviar material no WhatsApp do cliente"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {canManage && (
                    <button
                      onClick={() => handleDeleteItem(item)}
                      disabled={deletingId === item.id}
                      className="p-2 rounded-lg border border-border bg-background hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Excluir material"
                    >
                      {deletingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer explicativo */}
        <div className="p-4 border-t border-border bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Books, plantas e tabelas oficiais compartilhados com a equipe e enviados ao cliente via WhatsApp.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
