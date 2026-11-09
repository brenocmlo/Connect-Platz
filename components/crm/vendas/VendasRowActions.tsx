"use client";

import React from "react";
import {
  MoreHorizontal,
  Eye,
  FileText,
  CreditCard,
  Pencil,
  Trash2,
} from "lucide-react";
import type { SaleItem } from "./types";

interface VendasRowActionsProps {
  sale: SaleItem;
  isNearBottom: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  canManagePayments: boolean;
  onViewDetails: (sale: SaleItem) => void;
  onViewReceipt: (sale: SaleItem) => void;
  onEditPayment: (sale: SaleItem) => void;
  onEditSale?: (sale: SaleItem) => void;
  onRequestDelete?: (sale: SaleItem) => void;
}

export function VendasRowActions({
  sale,
  isNearBottom,
  isOpen,
  onToggle,
  onClose,
  canManagePayments,
  onViewDetails,
  onViewReceipt,
  onEditPayment,
  onEditSale,
  onRequestDelete,
}: VendasRowActionsProps) {
  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Abrir ações da venda"
        className={`p-1.5 rounded-lg transition-colors ${
          isOpen
            ? "bg-connect-blue text-white shadow-sm"
            : "text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-muted"
        }`}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-30 cursor-default"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Menu Dropdown com posicionamento inteligente */}
          <div
            className={`absolute right-0 z-40 w-48 rounded-xl border border-border bg-card p-1 text-left shadow-2xl shadow-black/60 backdrop-blur-md animate-in fade-in-0 zoom-in-95 ${
              isNearBottom ? "bottom-9 origin-bottom-right" : "top-9 origin-top-right"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                onViewDetails(sale);
                onClose();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-connect-blue hover:text-white"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver detalhes</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onViewReceipt(sale);
                onClose();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-connect-blue hover:text-white"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ver recibo</span>
            </button>

            {canManagePayments && (
              <button
                type="button"
                onClick={() => {
                  onEditPayment(sale);
                  onClose();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-connect-blue hover:text-white"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Editar pagamento</span>
              </button>
            )}

            {canManagePayments && onEditSale && (
              <button
                type="button"
                onClick={() => {
                  onEditSale(sale);
                  onClose();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-connect-blue hover:text-white"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Editar venda</span>
              </button>
            )}

            {canManagePayments && onRequestDelete && (
              <button
                type="button"
                onClick={() => {
                  onRequestDelete(sale);
                  onClose();
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-border px-3 pt-1.5 pb-1 text-xs font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-600 hover:text-white"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir venda</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
