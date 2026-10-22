"use client";

import React, { useState } from "react";
import { MoreHorizontal, ChevronLeft, ChevronRight, FileText, Eye, CreditCard } from "lucide-react";
import { SaleItem } from "./types";

interface VendasTableProps {
  sales: SaleItem[];
  hideValues?: boolean;
  /** "Editar pagamento" só aparece para a diretoria */
  canManagePayments?: boolean;
  onViewDetails: (sale: SaleItem) => void;
  onViewReceipt: (sale: SaleItem) => void;
  onEditPayment: (sale: SaleItem) => void;
}

export function VendasTable({
  sales,
  hideValues = false,
  canManagePayments = false,
  onViewDetails,
  onViewReceipt,
  onEditPayment,
}: VendasTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(sales.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSales = sales.slice(startIndex, startIndex + pageSize);

  const formatCurrency = (val: number) => {
    if (hideValues) return "••••••";
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden space-y-4">
      {/* Table Sub-bar: Counter, Per Page, Pagination */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800 dark:text-white">
            {sales.length} vendas registradas
          </span>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Mostrar</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-muted border border-border text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 font-semibold focus:outline-none"
            >
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex items-center bg-muted border border-border rounded-lg p-0.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3 px-4">Data / Cód.</th>
              <th className="py-3 px-4">Cliente</th>
              <th className="py-3 px-4">Empreendimento</th>
              <th className="py-3 px-4">VGV</th>
              <th className="py-3 px-4">Imposto</th>
              <th className="py-3 px-4">Próx. Pagamento</th>
              <th className="py-3 px-4">Corretor</th>
              <th className="py-3 px-4">Gerente</th>
              <th className="py-3 px-4">Gestor</th>
              <th className="py-3 px-4">Captador</th>
              <th className="py-3 px-4 text-right">Comissão Corretor</th>
              <th className="py-3 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedSales.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-400">
                  Nenhuma venda encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              paginatedSales.map((sale) => {
                const corretorValor = sale.splits
                  .filter((s) => s.tipo === "CORRETOR_TITULAR" || s.tipo === "CO_CORRETOR")
                  .reduce((acc, s) => acc + s.valor, 0);
                const imposto = sale.impostoValor;

                return (
                  <tr
                    key={sale.id}
                    className="hover:bg-connect-blue/5 dark:hover:bg-connect-blue/10 transition-colors group"
                  >
                    {/* Data / Cód */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {sale.dataVenda}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {sale.codigoVenda}
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {sale.compradorNome}
                    </td>

                    {/* Empreendimento */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {sale.imovelNome}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {[sale.construtora, sale.unidadeNumero && `Unid. ${sale.unidadeNumero}`]
                          .filter(Boolean)
                          .join(" • ") || "—"}
                      </div>
                    </td>

                    {/* VGV (Verde) */}
                    <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {formatCurrency(sale.vgv)}
                    </td>

                    {/* Imposto */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      <div>{formatCurrency(imposto)}</div>
                      <span className="text-[10px] text-muted-foreground">
                        ({sale.impostoPercentual.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%)
                      </span>
                    </td>

                    {/* Próx. Pagamento */}
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap font-mono">
                      {sale.proximoPagamento || "—"}
                    </td>

                    {/* Corretor (avatar + nome; rótulos "CORRETOR 1/2" quando dividido) */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-connect-blue text-white text-[9px] font-bold flex items-center justify-center">
                          {sale.corretorTitular.charAt(0)}
                        </div>
                        <div>
                          {sale.segundoCorretor ? (
                            <div className="text-[10px]">
                              <span className="text-[9px] font-bold text-connect-blue block">CORRETOR 1:</span>
                              <span className="font-medium text-slate-800 dark:text-slate-200">{sale.corretorTitular}</span>
                              <span className="text-[9px] font-bold text-platz-gold block mt-0.5">CORRETOR 2:</span>
                              <span className="font-medium text-slate-800 dark:text-slate-200">{sale.segundoCorretor}</span>
                            </div>
                          ) : (
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {sale.corretorTitular}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Gerente */}
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {sale.gerente || "—"}
                    </td>

                    {/* Gestor */}
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {sale.gestor || "—"}
                    </td>

                    {/* Captador */}
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {sale.captador || "—"}
                    </td>

                    {/* Comissão Corretor (cor primária) */}
                    <td className="py-3 px-4 text-right font-bold text-connect-blue dark:text-blue-400 whitespace-nowrap">
                      {formatCurrency(corretorValor)}
                    </td>

                    {/* Ações ⋯ */}
                    <td className="py-3 px-4 text-center relative whitespace-nowrap">
                      <button
                        onClick={() =>
                          setOpenActionId(openActionId === sale.id ? null : sale.id)
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-muted transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {openActionId === sale.id && (
                        <div className="absolute right-4 top-10 z-20 w-44 bg-card border border-border rounded-xl shadow-xl animate-fade-in py-1 text-left">
                          <button
                            onClick={() => {
                              onViewDetails(sale);
                              setOpenActionId(null);
                            }}
                            className="w-full px-3 py-1.5 flex items-center gap-2 text-foreground hover:bg-connect-blue hover:text-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver detalhes
                          </button>
                          <button
                            onClick={() => {
                              onViewReceipt(sale);
                              setOpenActionId(null);
                            }}
                            className="w-full px-3 py-1.5 flex items-center gap-2 text-foreground hover:bg-connect-blue hover:text-white transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Ver recibo
                          </button>
                          {canManagePayments && (
                            <button
                              onClick={() => {
                                onEditPayment(sale);
                                setOpenActionId(null);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-foreground hover:bg-connect-blue hover:text-white transition-colors"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Editar pagamento
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
