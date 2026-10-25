"use client";

import React, { useState } from "react";
import {
  X,
  Printer,
  Download,
  Building2,
  User,
  CheckCircle2,
  FileText,
  CreditCard,
} from "lucide-react";
import { SaleItem } from "./types";
import { generateCommissionReceiptPdf } from "@/lib/services/receipt-pdf";

interface CommissionReceiptModalProps {
  sale: SaleItem | null;
  onClose: () => void;
}

export function CommissionReceiptModal({
  sale,
  onClose,
}: CommissionReceiptModalProps) {
  // Hooks antes de qualquer retorno antecipado (regras de hooks)
  const [selectedParticipantIdx, setSelectedParticipantIdx] = useState(0);

  if (!sale) return null;

  // Participantes elegíveis para recibo: apenas splits reais da venda (sem valores estimados)
  const participants = (sale.splits || [])
    .filter((s) => s.tipo !== "IMOBILIARIA")
    .map((s) => ({
      categoria: s.categoria,
      nome: s.beneficiario,
      valor: s.valor,
      percentual: s.percentual,
      pix: s.pix || "Chave PIX não informada",
      dataPagamento: s.dataPagamento || null,
    }));

  const currentParticipant = participants[selectedParticipantIdx] || participants[0];

  if (!currentParticipant) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center space-y-3">
          <FileText className="w-6 h-6 mx-auto text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Nenhum participante com comissão nesta venda.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-muted text-foreground text-xs font-semibold hover:bg-muted/70"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleDownloadPdf = () => {
    generateCommissionReceiptPdf({
      codigoVenda: sale.codigoVenda,
      beneficiarioNome: currentParticipant.nome,
      beneficiarioTipo: currentParticipant.categoria,
      documentoPix: currentParticipant.pix,
      valor: currentParticipant.valor,
      parcelaNumero: 1,
      totalParcelas: 1,
      dataPagamento: currentParticipant.dataPagamento || "Pendente",
      imovelNome: sale.imovelNome,
      unidadeNumero: sale.unidadeNumero || "—",
      compradorNome: sale.compradorNome,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-fade-in print:border-none print:shadow-none print:max-h-none print:w-full">
        {/* Barra superior de ações (oculta na impressão) */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-connect-blue/10 text-connect-blue flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Recibo Oficial de Comissão
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Venda #{sale.codigoVenda} • {sale.imovelNome}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-semibold shadow-xs transition-all"
              title="Baixar em PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-all"
              title="Imprimir Recibo"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Seletor de Participante (oculto na impressão) */}
        {participants.length > 1 && (
          <div className="px-6 py-2.5 bg-muted/20 border-b border-border flex items-center gap-2 overflow-x-auto print:hidden">
            <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
              Emitir para:
            </span>
            {participants.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedParticipantIdx(idx)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedParticipantIdx === idx
                    ? "bg-connect-blue text-white font-bold shadow-xs"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.categoria}: {p.nome}
              </button>
            ))}
          </div>
        )}

        {/* Folha do Recibo (Formatada e Timbrada) */}
        <div className="p-8 space-y-6 overflow-y-auto text-xs bg-white text-slate-900 print:p-6 print:text-black">
          {/* Cabeçalho Oficial Connect Platz */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-950 uppercase">
                Connect Platz Imobiliária
              </h2>
              <p className="text-[11px] font-bold text-amber-600 tracking-wider uppercase">
                Recibo de Liquidação de Honorários e Comissões
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-md text-slate-800">
                RECIBO #{sale.codigoVenda}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Data: {sale.dataVenda}
              </p>
            </div>
          </div>

          {/* Destaque do Valor Quitado */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Valor Líquido dos Honorários
              </span>
              <div className="text-2xl font-extrabold text-blue-700">
                {formatCurrency(currentParticipant.valor)}
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Liquidado / Pago
              </span>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                Participação: {currentParticipant.percentual}%
              </p>
            </div>
          </div>

          {/* Dados do Beneficiário */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-1">
              1. Identificação do Beneficiário
            </h4>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-500 block text-[10px]">Nome Completo</span>
                <span className="font-semibold text-slate-900">{currentParticipant.nome}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Função / Categoria</span>
                <span className="font-semibold text-slate-900">{currentParticipant.categoria}</span>
              </div>
            </div>
          </div>

          {/* Dados da Operação Imobiliária */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-1">
              2. Negociação Imobiliária de Referência
            </h4>
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-slate-500 block text-[10px]">Empreendimento</span>
                <span className="font-semibold text-slate-900">{sale.imovelNome}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Comprador / Titular</span>
                <span className="font-semibold text-slate-900">{sale.compradorNome}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Valor Geral de Vendas (VGV)</span>
                <span className="font-semibold text-slate-900">{formatCurrency(sale.vgv)}</span>
              </div>
            </div>
          </div>

          {/* Termo de Quitação Legal */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-600 leading-relaxed italic text-justify">
            Declaro para os devidos fins de direito que recebi da Connect Platz Imobiliária a quantia líquida acima descrita, correspondente à minha participação proporcional na corretagem e intermediação imobiliária, conferindo plena, geral e irrevogável quitação do referido valor.
          </div>

          {/* Assinaturas */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[10px]">
            <div>
              <div className="border-t border-slate-400 pt-1.5 mx-auto w-48 font-semibold text-slate-800">
                {currentParticipant.nome}
              </div>
              <span className="text-slate-500">Assinatura do Beneficiário</span>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1.5 mx-auto w-48 font-semibold text-slate-800">
                Administração Financeira
              </div>
              <span className="text-slate-500">Connect Platz Imobiliária</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
