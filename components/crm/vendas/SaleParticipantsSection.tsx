"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { ParticipantRole, ROLE_LABEL } from "./saleSplitHelper";
import { LookupMember } from "@/components/crm/agenda/useCrmLookups";

export interface ParticipantFormState {
  userId: string;
  percentual: number;
  desconto: number;
  bonus: number;
}

export type ParticipantsForm = Record<ParticipantRole, ParticipantFormState>;

export const EMPTY_PARTICIPANT: ParticipantFormState = { userId: "", percentual: 0, desconto: 0, bonus: 0 };

interface SaleParticipantsSectionProps {
  participants: ParticipantsForm;
  onChange: (role: ParticipantRole, patch: Partial<ParticipantFormState>) => void;
  hasCorretor2: boolean;
  setHasCorretor2: (val: boolean) => void;
  members: LookupMember[];
  /** Corretor logado: titular fixo e demais papéis definidos pela gestão */
  lockedTitular?: { id: string; nome: string } | null;
}

const fieldClass =
  "w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-connect-blue";

const ROLE_HINT: Partial<Record<ParticipantRole, string>> = {
  GERENTE: "Opcional",
  GESTOR: "Opcional",
  CAPTADOR: "Opcional",
};

export function SaleParticipantsSection({
  participants,
  onChange,
  hasCorretor2,
  setHasCorretor2,
  members,
  lockedTitular,
}: SaleParticipantsSectionProps) {
  const renderRow = (role: ParticipantRole, extra?: React.ReactNode) => {
    const state = participants[role];
    const isLocked = role === "CORRETOR_1" && Boolean(lockedTitular);
    return (
      <div key={role} className="grid grid-cols-6 gap-2 items-end">
        <div className="col-span-4">
          <label className="flex items-center justify-between font-medium text-muted-foreground mb-0.5">
            <span>
              {ROLE_LABEL[role]}
              {role === "CORRETOR_1" && " (Titular) *"}
              {ROLE_HINT[role] && (
                <span className="ml-1 text-[10px] text-muted-foreground/70">· {ROLE_HINT[role]}</span>
              )}
            </span>
            {extra}
          </label>
          {isLocked ? (
            <input type="text" readOnly value={lockedTitular!.nome} className={`${fieldClass} bg-muted/50 cursor-not-allowed`} />
          ) : (
            <select
              value={state.userId}
              onChange={(e) => onChange(role, { userId: e.target.value })}
              required={role === "CORRETOR_1" || state.percentual > 0}
              className={fieldClass}
            >
              <option value="">{role === "CORRETOR_1" ? "Selecione o corretor" : "Sem participante"}</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="col-span-2">
          <label className="block font-medium text-muted-foreground mb-0.5">% da base líquida</label>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={state.percentual}
            onChange={(e) => onChange(role, { percentual: Math.max(0, Number(e.target.value) || 0) })}
            className={`${fieldClass} font-mono`}
          />
        </div>
      </div>
    );
  };

  const canPickOthers = members.length > 0;

  return (
    <div className="space-y-3 pt-2">
      <span className="font-bold text-foreground block uppercase tracking-wider text-[11px] border-l-[3px] border-connect-blue pl-2">
        Divisão de Participantes (Split)
      </span>

      {renderRow("CORRETOR_1")}

      {/* Desconto e bônus do titular */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block font-medium text-muted-foreground mb-0.5">Desconto Corretor 1 (R$)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={participants.CORRETOR_1.desconto}
            onChange={(e) => onChange("CORRETOR_1", { desconto: Math.max(0, Number(e.target.value) || 0) })}
            className={`${fieldClass} font-mono`}
          />
        </div>
        <div>
          <label className="block font-medium text-muted-foreground mb-0.5">Bônus Corretor 1 (R$)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={participants.CORRETOR_1.bonus}
            onChange={(e) => onChange("CORRETOR_1", { bonus: Math.max(0, Number(e.target.value) || 0) })}
            className={`${fieldClass} font-mono`}
          />
        </div>
      </div>

      {canPickOthers ? (
        <>
          {!hasCorretor2 ? (
            <button
              type="button"
              onClick={() => setHasCorretor2(true)}
              className="text-xs font-semibold text-connect-blue hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Segundo Corretor
            </button>
          ) : (
            <div className="p-2.5 rounded-xl bg-connect-blue/5 border border-connect-blue/20">
              {renderRow(
                "CORRETOR_2",
                <button
                  type="button"
                  onClick={() => {
                    setHasCorretor2(false);
                    onChange("CORRETOR_2", { userId: "", percentual: 0 });
                  }}
                  className="text-[10px] text-red-500 hover:underline flex items-center gap-0.5"
                >
                  <Trash2 className="w-3 h-3" /> Remover
                </button>
              )}
            </div>
          )}
          {renderRow("GERENTE")}
          {renderRow("GESTOR")}
          {renderRow("CAPTADOR")}
        </>
      ) : (
        <p className="text-[11px] text-muted-foreground bg-muted/40 border border-border rounded-lg p-2.5">
          Gerente, Gestor e Captador são definidos pela gestão. A parcela não alocada fica com a imobiliária.
        </p>
      )}
    </div>
  );
}
