"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Eye,
  Edit,
  Tag,
  UserCheck,
  ArrowRight,
  Bell,
  Calendar,
  Shuffle,
  ShieldAlert,
  Trash2,
  Check,
  Plus,
  ChevronRight,
} from "lucide-react";
import { LeadDetail } from "@/components/crm/LeadDrawer";

interface LeadCardMenuProps {
  lead: LeadDetail;
  onOpenDetails: () => void;
  onEdit: () => void;
  onAdvanceStage: () => void;
  onAddReminder: () => void;
  onScheduleVisit: () => void;
  onMoveToBolsao: () => void;
  onDelete: () => void;
  onUpdateTags?: (tags: string[]) => void;
}

const AVAILABLE_TAGS = [
  { id: "hot", name: "Cliente Quente", color: "#EA580C" },
  { id: "followup", name: "Follow-up/Sem Resposta", color: "#DB2777" },
  { id: "potential", name: "Potencial", color: "#0284C7" },
  { id: "urgent", name: "Urgente", color: "#DC2626" },
  { id: "rescheduled", name: "Cliente reagendou", color: "#0F766E" },
];

export function LeadCardMenu({
  lead,
  onOpenDetails,
  onEdit,
  onAdvanceStage,
  onAddReminder,
  onScheduleVisit,
  onMoveToBolsao,
  onDelete,
  onUpdateTags,
}: LeadCardMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTagsSubmenu, setShowTagsSubmenu] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [leadTags, setLeadTags] = useState<string[]>(lead.tags || []);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowTagsSubmenu(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleTag = (tagName: string) => {
    let nextTags: string[];
    if (leadTags.includes(tagName)) {
      nextTags = leadTags.filter((t) => t !== tagName);
    } else {
      nextTags = [...leadTags, tagName];
    }
    setLeadTags(nextTags);
    if (onUpdateTags) onUpdateTags(nextTags);
  };

  const handleAddNewTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const tag = newTagInput.trim();
    if (!leadTags.includes(tag)) {
      const nextTags = [...leadTags, tag];
      setLeadTags(nextTags);
      if (onUpdateTags) onUpdateTags(nextTags);
    }
    setNewTagInput("");
  };

  return (
    <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
        aria-label="Abrir menu do lead"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-2xl py-1 z-50 text-xs animate-in fade-in-0 zoom-in-95">
          {/* 1. Ver Detalhes */}
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenDetails();
            }}
            className="w-full text-left px-3 py-2 flex items-center gap-2 text-foreground hover:bg-connect-blue hover:text-white transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver Detalhes</span>
          </button>

          {/* 2. Editar */}
          <button
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
            className="w-full text-left px-3 py-2 flex items-center gap-2 text-foreground hover:bg-connect-blue hover:text-white transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>

          {/* 3. Etiquetas ▸ com Submenu */}
          <div
            className="relative"
            onMouseEnter={() => setShowTagsSubmenu(true)}
            onMouseLeave={() => setShowTagsSubmenu(false)}
          >
            <button
              onClick={() => setShowTagsSubmenu(!showTagsSubmenu)}
              className="w-full text-left px-3 py-2 flex items-center justify-between text-foreground hover:bg-connect-blue hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" />
                <span>Etiquetas</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {showTagsSubmenu && (
              <div className="absolute right-full top-0 mr-1 w-56 bg-card border border-border rounded-xl shadow-2xl p-2 z-50 animate-in fade-in-0 zoom-in-95">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
                  Etiquetas do Lead
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {AVAILABLE_TAGS.map((t) => {
                    const isApplied = leadTags.includes(t.name);
                    return (
                      <button
                        key={t.id}
                        onClick={() => toggleTag(t.name)}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-muted text-foreground transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: t.color }}
                          />
                          <span className="truncate">{t.name}</span>
                        </div>
                        {isApplied && <Check className="w-3.5 h-3.5 text-connect-blue font-bold" />}
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleAddNewTag} className="mt-2 pt-2 border-t border-border flex gap-1">
                  <input
                    type="text"
                    placeholder="Nova etiqueta..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    className="flex-1 bg-background border border-border rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-connect-blue"
                  />
                  <button
                    type="submit"
                    className="p-1 rounded-lg bg-connect-blue text-white hover:bg-connect-deep-blue"
                    title="Adicionar"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="h-px bg-border my-1" />

          {/* 4. Mudar corretor */}
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenDetails();
            }}
            className="w-full text-left px-3 py-2 flex items-center gap-2 text-foreground hover:bg-connect-blue hover:text-white transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Mudar corretor</span>
          </button>

          {/* 5. Avançar Etapa */}
          <button
            onClick={() => {
              setIsOpen(false);
              onAdvanceStage();
            }}
            className="w-full text-left px-3 py-2 flex items-center gap-2 text-foreground hover:bg-connect-blue hover:text-white transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Avançar Etapa</span>
          </button>

          {/* 6. Adicionar lembrete */}
          <button
            onClick={() => {
              setIsOpen(false);
              onAddReminder();
            }}
            className="w-full text-left px-3 py-2 flex items-center gap-2 text-foreground hover:bg-connect-blue hover:text-white transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Adicionar lembrete</span>
          </button>

          {/* 7. Agendar visita */}
          <button
            onClick={() => {
              setIsOpen(false);
              onScheduleVisit();
            }}
            className="w-full text-left px-3 py-2 flex items-center gap-2 text-foreground hover:bg-connect-blue hover:text-white transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Agendar visita</span>
          </button>

          {/* 8. Mudar funil */}
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenDetails();
            }}
            className="w-full text-left px-3 py-2 flex items-center gap-2 text-foreground hover:bg-connect-blue hover:text-white transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Mudar funil</span>
          </button>

          {/* 9. Mover para Bolsão */}
          <button
            onClick={() => {
              setIsOpen(false);
              onMoveToBolsao();
            }}
            className="w-full text-left px-3 py-2 flex items-center gap-2 text-amber-500 hover:bg-connect-blue hover:text-white transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Mover para Bolsão</span>
          </button>

          <div className="h-px bg-border my-1" />

          {/* 10. Excluir (vermelho) */}
          <button
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
            className="w-full text-left px-3 py-2 flex items-center gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="font-semibold">Excluir</span>
          </button>
        </div>
      )}
    </div>
  );
}
