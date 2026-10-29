"use client";

import React from "react";
import { Users2, Trash2 } from "lucide-react";
import { TeamMember, ROLE_LABEL, STATUS_META } from "./types";

interface TeamMembersTableProps {
  team: TeamMember[];
  loading?: boolean;
  isAdmin?: boolean;
  onRequestRemove?: (member: TeamMember) => void;
}

const ROLE_BADGE: Record<string, string> = {
  ADMINISTRADOR: "bg-platz-gold/20 text-amber-700 dark:text-platz-gold border border-platz-gold/40",
  FINANCEIRO_VENDA: "bg-connect-blue/15 text-connect-blue border border-connect-blue/30",
  FINANCEIRO_ALUGUEL: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30",
  CORRETOR_VENDA: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  CORRETOR_ALUGUEL: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  CORRETOR: "bg-muted text-muted-foreground border border-border",
};

export function TeamMembersTable({ team, loading, isAdmin, onRequestRemove }: TeamMembersTableProps) {
  if (loading && team.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (team.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
          <Users2 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Nenhum colaborador cadastrado</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Use &quot;Convidar Colaborador&quot; para cadastrar corretores e administradores da imobiliária.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/60 text-[10px] text-muted-foreground font-bold uppercase tracking-wider border-b border-border">
            <tr>
              <th className="py-3 px-4">Nome do Profissional</th>
              <th className="py-3 px-4">Cargo / Nível</th>
              <th className="py-3 px-4 text-center">Leads em Carteira</th>
              <th className="py-3 px-4 text-center">Status Roleta</th>
              <th className="py-3 px-4 text-center">Check-in Hoje</th>
              <th className="py-3 px-4 text-right">E-mail</th>
              {isAdmin && <th className="py-3 px-4 text-center">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {team.map((member) => (
              <tr key={member.id} className="hover:bg-connect-blue/5 transition-colors">
                <td className="py-3.5 px-4 font-bold text-foreground">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-connect-blue text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {member.nome.charAt(0).toUpperCase()}
                    </div>
                    <span>{member.nome}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_BADGE[member.role]}`}>
                    {ROLE_LABEL[member.role]}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-foreground">{member.leadsAtivos}</td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_META[member.status].cls}`}>
                    {STATUS_META[member.status].label}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center text-muted-foreground">
                  {member.role === "CORRETOR_VENDA" || member.role === "CORRETOR_ALUGUEL" || member.role === "CORRETOR"
                    ? member.hasCheckedInToday
                      ? "Sim"
                      : "Não"
                    : "—"}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-muted-foreground">{member.email}</td>
                {isAdmin && (
                  <td className="py-3.5 px-4 text-center">
                    {member.role !== "ADMINISTRADOR" ? (
                      <button
                        type="button"
                        onClick={() => onRequestRemove?.(member)}
                        title={`Remover ${member.nome} da equipe`}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/40">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
