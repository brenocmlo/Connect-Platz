"use client";

import React, { useState } from "react";
import { ShieldCheck, FileCheck } from "lucide-react";
import { LeadDetail } from "../LeadDrawer";

interface LeadInfoTabProps {
  lead: LeadDetail;
}

export function LeadInfoTab({ lead }: LeadInfoTabProps) {
  const [creditType, setCreditType] = useState<string>(lead.tipoOcupacaoCredito || "CLT");
  const [specificIncome, setSpecificIncome] = useState<number>(lead.rendaEspecificaAutonomo || 0);
  const [selectedIncomeRange, setSelectedIncomeRange] = useState<string>(lead.faixaRenda || "5 a 10 SM");

  return (
    <div className="space-y-6">
      {/* ESTEIRA DE CRÉDITO IMOBILIÁRIO COM REGRAS CONTRATUAIS */}
      <div className="bg-[#0F1624] border border-[#1C2537] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#D9BB4C] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D9BB4C]" />
            Esteira de Qualificação de Crédito Bancário
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold">Exigência Bancária Connect Platz</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Tipo de Ocupação Profissional</label>
            <select
              value={creditType}
              onChange={(e) => setCreditType(e.target.value)}
              className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white focus:outline-none focus:border-connect-blue"
            >
              <option value="CLT">Carteira Assinada (CLT)</option>
              <option value="AUTONOMO">Autônomo / Profissional Liberal</option>
              <option value="EMPRESARIO">Empresário / Sócio PJ</option>
              <option value="OUTRO">Aposentado / Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Faixa de Renda Familiar</label>
            <select
              value={selectedIncomeRange}
              onChange={(e) => setSelectedIncomeRange(e.target.value)}
              className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white focus:outline-none focus:border-connect-blue"
            >
              <option value="Até 3 SM">Até 3 Salários Mínimos (R$ 4.236)</option>
              <option value="3 a 5 SM">3 a 5 Salários Mínimos (R$ 4.236 - R$ 7.060)</option>
              <option value="5 a 10 SM">5 a 10 Salários Mínimos (R$ 7.060 - R$ 14.120)</option>
              <option value="10 a 20 SM">10 a 20 Salários Mínimos (R$ 14.120 - R$ 28.240)</option>
              <option value="Acima de 20 SM">Acima de 20 Salários Mínimos (&gt; R$ 28.240)</option>
            </select>
          </div>
        </div>

        {/* REGRAS ESPECÍFICAS CLT VS AUTÔNOMO */}
        {creditType === "CLT" ? (
          <div className="p-3.5 bg-blue-950/40 border border-blue-800/80 rounded-xl text-xs space-y-1">
            <p className="font-bold text-blue-300 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-400" />
              Regra Contratual CLT (Carteira Assinada):
            </p>
            <p className="text-slate-300 text-[11px]">
              É obrigatório anexar os <strong>3 últimos contracheques / holerites</strong> e comprovante de carteira de trabalho para aprovação do financiamento junto à Caixa ou banco privado.
            </p>
          </div>
        ) : (
          <div className="p-3.5 bg-amber-950/40 border border-amber-800/80 rounded-xl text-xs space-y-2">
            <p className="font-bold text-[#F8DA56] flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#F8DA56]" />
              Regra Contratual Autônomo / Profissional Liberal:
            </p>
            <p className="text-slate-300 text-[11px]">
              É obrigatório anexar os <strong>extratos bancários completos dos últimos 3 meses</strong> ou última declaração de IRPF com recibo de entrega.
            </p>
            <div>
              <label className="block text-[11px] font-bold text-white mb-1">
                Valor Específico de Renda Mensal Declarada (R$):
              </label>
              <input
                type="number"
                placeholder="Ex: 9500"
                value={specificIncome || ""}
                onChange={(e) => setSpecificIncome(Number(e.target.value))}
                className="w-full bg-[#080C14] border border-amber-700/70 rounded-xl p-2.5 text-white text-xs focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* DADOS PESSOAIS */}
      <div className="bg-[#0F1624] border border-[#1C2537] rounded-2xl p-5 space-y-3 text-xs">
        <h3 className="font-bold uppercase tracking-wider text-slate-400">Dados Pessoais do Titular</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-slate-500 block text-[11px]">CPF:</span>
            <span className="text-white font-mono">{lead.cpf || "Não informado"}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Estado Civil:</span>
            <span className="text-white">{lead.estadoCivil || "Solteiro(a)"}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Profissão:</span>
            <span className="text-white">{lead.profissao || "Não declarada"}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Bairros de Interesse:</span>
            <span className="text-white">
              {lead.bairrosInteresse?.join(", ") || "Meireles, Aldeota"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
