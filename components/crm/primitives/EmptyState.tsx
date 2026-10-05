"use client";

import React from "react";
import { FolderSearch, Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = FolderSearch,
  actionLabel,
  onActionClick,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center border border-dashed border-border/80 rounded-2xl bg-card/40 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-muted/80 text-muted-foreground flex items-center justify-center mb-3 shadow-xs">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>

      <h4 className="text-sm font-bold text-foreground mb-1">{title}</h4>

      {description && (
        <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}

      {actionLabel && onActionClick && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
