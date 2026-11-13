"use client";

import React from "react";
import { AlertTriangle, Building2, Loader2, ShieldAlert, Trash2 } from "lucide-react";
import type { PropertyCardData } from "./PropertyProductCard";
import { PropertyModalShell } from "./PropertyModalShell";
import { getModalityBadgeMeta } from "./propertyFicha";

interface DeletePropertyModalProps {
  property: PropertyCardData | null;
  defaultPermanent?: boolean;
  deleting?: boolean;
  onClose: () => void;
  onConfirm: (permanent: boolean) => Promise<void>;
}

export function DeletePropertyModal({
  property,
  defaultPermanent = false,
  deleting = false,
  onClose,
  onConfirm,
}: DeletePropertyModalProps) {
  const modalityMeta = property ? getModalityBadgeMeta(property.modalidade) : null;
  const linkedSales = property?._count?.sales ?? 0;

  return (
    <PropertyModalShell
      open={Boolean(property)}
      onClose={() => !deleting && onClose()}
      maxWidth="max-w-lg"
      ariaLabel={property ? `Excluir ${property.nome}` : "Excluir imóvel"}
      icon={
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
      }
      title={defaultPermanent ? "Apagar Imóvel Definitivamente" : "Remover / Excluir Imóvel"}
      subtitle="Confirme a ação desejada para este item do catálogo."
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            autoFocus
            disabled={deleting}
            onClick={onClose}
            className="h-10 rounded-lg border border-border bg-background px-4 text-xs font-bold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Cancelar
          </button>

          {!defaultPermanent && (
            <button
              type="button"
              disabled={deleting}
              onClick={() => onConfirm(false)}
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-500/20 disabled:opacity-50 dark:text-amber-300"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              <span>Remover / Desativar</span>
            </button>
          )}

          <button
            type="button"
            disabled={deleting}
            onClick={() => onConfirm(true)}
            className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 text-xs font-bold text-white shadow-md shadow-red-600/20 transition-all hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            <span>Apagar Definitivamente</span>
          </button>
        </div>
      }
    >
      {property && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3.5">
            {property.fotos?.[0] ? (
              <img
                src={property.fotos[0]}
                alt={property.nome}
                className="h-14 w-16 shrink-0 rounded-lg border border-border object-cover"
              />
            ) : (
              <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                <Building2 className="h-6 w-6 text-connect-blue/50" />
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="truncate text-sm font-bold text-foreground">{property.nome}</p>
                {modalityMeta && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${modalityMeta.className}`}>
                    {modalityMeta.label}
                  </span>
                )}
              </div>
              <p className="truncate text-[11px] text-muted-foreground">
                {[property.bairro || "Centro", property.cidade || "Fortaleza"].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>

          {linkedSales > 0 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-800 dark:text-amber-300">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="leading-relaxed">
                Este imóvel possui <strong>{linkedSales} venda(s)</strong> registrada(s). Ao usar{" "}
                <strong>Remover / Desativar</strong>, ele sai do catálogo e do site preservando o histórico. Ao{" "}
                <strong>Apagar Definitivamente</strong>, o imóvel e os registros vinculados são removidos sem reversão.
              </p>
            </div>
          )}

          <div className="space-y-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 text-[11px] leading-relaxed text-muted-foreground">
            {!defaultPermanent && (
              <p>
                <strong className="text-foreground">Remover / Desativar:</strong> remove o imóvel se não houver vendas,
                reservas ou contratos vinculados; caso contrário, apenas oculta do catálogo e da vitrine pública.
              </p>
            )}
            <p>
              <strong className="text-red-600 dark:text-red-400">Apagar Definitivamente:</strong> exclui o imóvel,
              suas unidades, materiais e eventuais vínculos de forma permanente.
            </p>
          </div>
        </div>
      )}
    </PropertyModalShell>
  );
}
