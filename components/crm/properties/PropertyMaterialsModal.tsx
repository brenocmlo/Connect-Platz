"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  Download,
  Share2,
  MessageSquare,
  Upload,
  Check,
  Building2,
  Calendar,
  Sparkles,
  ExternalLink,
  Plus,
} from "lucide-react";
import { PropertyCardData } from "./PropertyProductCard";

export interface PropertyMaterialItem {
  id: string;
  titulo: string;
  categoria: "BOOK" | "TABELA" | "MEMORIAL" | "PLANTAS" | "TOUR";
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

export function PropertyMaterialsModal({
  isOpen,
  onClose,
  property,
}: PropertyMaterialsModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<PropertyMaterialItem["categoria"]>("BOOK");
  const [materials, setMaterials] = useState<PropertyMaterialItem[]>([
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
    {
      id: "mat-5",
      titulo: "Tour Virtual 360° & Vídeo de Apresentação",
      categoria: "TOUR",
      tamanho: "Link Web",
      dataAtualizacao: "Recente",
      url: "https://tour.connectplatz.com.br/reserva-imperial",
      tipo: "link",
    },
  ]);

  if (!isOpen || !property) return null;

  const handleCopyLink = (item: PropertyMaterialItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendWhatsApp = (item: PropertyMaterialItem) => {
    const text = encodeURIComponent(
      `Olá! Segue o material oficial do empreendimento *${property.nome}*:\n\n📄 *${item.titulo}*\nAcesse pelo link oficial: ${item.url}\n\nFico à total disposição para tirar qualquer dúvida!`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleDownload = (item: PropertyMaterialItem) => {
    window.open(item.url, "_blank");
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newItem: PropertyMaterialItem = {
      id: `mat-${Date.now()}`,
      titulo: newTitle.trim(),
      categoria: newCategory,
      tamanho: "2.4 MB",
      dataAtualizacao: "Agora",
      url: `https://materiais.connectplatz.com.br/${newTitle.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      tipo: "pdf",
    };
    setMaterials((prev) => [newItem, ...prev]);
    setNewTitle("");
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
      case "TOUR":
        return "bg-sky-500/15 text-sky-600 border-sky-500/30";
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
                  Materiais & Anexos
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-connect-blue text-white uppercase tracking-wider">
                  Vendas
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {property.nome} • {property.bairro || "Centro"}, {property.cidade || "Balneário Camboriú"}
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
              {materials.length} arquivos disponíveis para envio ao cliente
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-bold text-connect-blue hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? "Cancelar" : "Novo Anexo"}</span>
            </button>
          </div>

          {/* Form para adicionar novo material */}
          {showAddForm && (
            <form
              onSubmit={handleAddMaterial}
              className="p-4 bg-muted/40 border border-border rounded-xl space-y-3 text-xs animate-in fade-in-0"
            >
              <div className="font-bold text-foreground">Adicionar Novo Arquivo / Material</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Título (ex.: Tabela Promocional Outubro)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
                  required
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none cursor-pointer"
                >
                  <option value="BOOK">Book / Apresentação</option>
                  <option value="TABELA">Tabela de Preços</option>
                  <option value="MEMORIAL">Memorial Descritivo</option>
                  <option value="PLANTAS">Plantas / Implantação</option>
                  <option value="TOUR">Tour Virtual / Link</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-connect-blue text-white font-bold hover:bg-connect-blue/90"
                >
                  Salvar Material
                </button>
              </div>
            </form>
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
                    title="Baixar arquivo / Abrir link"
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
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/10 flex items-center justify-between text-xs text-muted-foreground">
          <span>Arquivos hospedados no CDN oficial da imobiliária</span>
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
