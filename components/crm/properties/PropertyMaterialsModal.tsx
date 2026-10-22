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
} from "lucide-react";
import { PropertyCardData } from "./PropertyProductCard";
import { AddMaterialForm } from "./AddMaterialForm";

export interface PropertyMaterialItem {
  id: string;
  titulo: string;
  categoria: "BOOK" | "TABELA" | "MEMORIAL" | "PLANTAS" | "DOCUMENTO";
  tamanho: string;
  dataAtualizacao: string;
  url: string;
  tipo: "pdf" | "link";
}

interface PropertyMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyCardData | null;
}

const DEFAULT_MATERIALS: PropertyMaterialItem[] = [
  {
    id: "mat-1",
    titulo: "Book Comercial de Apresentação",
    categoria: "BOOK",
    tamanho: "14.2 MB",
    dataAtualizacao: "Atualizado ontem",
    url: "https://materiais.connectplatz.com.br/book-apresentacao.pdf",
    tipo: "pdf",
  },
  {
    id: "mat-2",
    titulo: "Tabela de Vendas & Fluxo de Pagamento",
    categoria: "TABELA",
    tamanho: "1.8 MB",
    dataAtualizacao: "Atualizada hoje",
    url: "https://materiais.connectplatz.com.br/tabela-vendas.pdf",
    tipo: "pdf",
  },
  {
    id: "mat-3",
    titulo: "Memorial Descritivo & Acabamentos",
    categoria: "MEMORIAL",
    tamanho: "3.5 MB",
    dataAtualizacao: "02/10/2026",
    url: "https://materiais.connectplatz.com.br/memorial-descritivo.pdf",
    tipo: "pdf",
  },
  {
    id: "mat-4",
    titulo: "Caderno de Plantas Humanizadas & Implantação",
    categoria: "PLANTAS",
    tamanho: "8.7 MB",
    dataAtualizacao: "28/09/2026",
    url: "https://materiais.connectplatz.com.br/plantas-humanizadas.pdf",
    tipo: "pdf",
  },
];

export function PropertyMaterialsModal({
  isOpen,
  onClose,
  property,
}: PropertyMaterialsModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const storageKey = property ? `connect_platz_materials_${property.id}` : "";
  const [materials, setMaterials] = useState<PropertyMaterialItem[]>(DEFAULT_MATERIALS);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Filtra qualquer resquício de tour virtual antigo em cache
        const sanitized = parsed.filter(
          (item: any) => item.categoria !== "TOUR" && !item.titulo?.toLowerCase().includes("tour")
        );
        setMaterials(sanitized.length > 0 ? sanitized : DEFAULT_MATERIALS);
      } catch {
        setMaterials(DEFAULT_MATERIALS);
      }
    } else {
      setMaterials(DEFAULT_MATERIALS);
    }
  }, [storageKey]);

  if (!isOpen || !property) return null;

  const saveMaterialsState = (items: PropertyMaterialItem[]) => {
    setMaterials(items);
    if (storageKey && typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  };

  const handleCopyLink = (item: PropertyMaterialItem) => {
    const fullUrl = item.url.startsWith("http") ? item.url : `${window.location.origin}${item.url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendWhatsApp = (item: PropertyMaterialItem) => {
    const fullUrl = item.url.startsWith("http") ? item.url : `${window.location.origin}${item.url}`;
    const text = encodeURIComponent(
      `Olá! Segue o material oficial do empreendimento *${property.nome}*:\n\n📄 *${item.titulo}*\nAcesse pelo link oficial: ${fullUrl}\n\nFico à total disposição para tirar qualquer dúvida!`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleDownload = (item: PropertyMaterialItem) => {
    const fullUrl = item.url.startsWith("http") ? item.url : `${window.location.origin}${item.url}`;
    window.open(fullUrl, "_blank");
  };

  const handleDeleteItem = (id: string) => {
    const updated = materials.filter((m) => m.id !== id);
    saveMaterialsState(updated);
  };

  const handleSuccessAdd = (newItem: PropertyMaterialItem) => {
    saveMaterialsState([newItem, ...materials]);
    setShowAddForm(false);
  };

  const getCategoryBadge = (cat: PropertyMaterialItem["categoria"]) => {
    switch (cat) {
      case "BOOK":
        return "bg-connect-blue/15 text-connect-blue border-connect-blue/30";
      case "TABELA":
        return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
      case "MEMORIAL":
        return "bg-purple-500/15 text-purple-600 border-purple-500/30";
      case "PLANTAS":
        return "bg-amber-500/15 text-amber-600 border-amber-500/30";
      case "DOCUMENTO":
        return "bg-slate-500/15 text-slate-600 border-slate-500/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
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
                {property.nome} • {property.bairro || "Meireles"}, {property.cidade || "Fortaleza"}
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
              {materials.length} arquivos disponíveis para envio imediato ao cliente
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-bold text-connect-blue hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? "Cancelar" : "Novo Anexo"}</span>
            </button>
          </div>

          {/* Form com Upload Real de Arquivo e Link */}
          {showAddForm && (
            <AddMaterialForm
              onSuccess={handleSuccessAdd}
              onCancel={() => setShowAddForm(false)}
            />
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
                      <span>{item.tamanho}</span>
                      <span>•</span>
                      <span>{item.dataAtualizacao}</span>
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

                  <button
                    onClick={() => handleDownload(item)}
                    className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
                    title="Baixar arquivo / Abrir documento"
                  >
                    {item.tipo === "pdf" ? (
                      <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>

                  <button
                    onClick={() => handleSendWhatsApp(item)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold transition-all shadow-xs hover:scale-[1.02] active:scale-95"
                    title="Enviar material no WhatsApp do cliente"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 rounded-lg border border-border bg-background hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                    title="Remover anexo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer explicativo */}
        <div className="p-4 border-t border-border bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Envio oficial de books, plantas e tabelas da imobiliária via WhatsApp e CDN seguro.</span>
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
