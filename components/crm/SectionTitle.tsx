"use client";

import React from "react";

interface SectionTitleProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  badge?: string;
  className?: string;
  rightAction?: React.ReactNode;
}

export function SectionTitle({
  children,
  title,
  subtitle,
  badge,
  className = "",
  rightAction,
}: SectionTitleProps) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        {/* Barra vertical primária de 3px (5.2) */}
        <div className="border-l-[3px] border-connect-blue pl-2.5 py-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {children || title}
            </h2>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-connect-blue/10 text-connect-blue border border-connect-blue/20">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground mt-0.5 font-normal">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {rightAction && <div>{rightAction}</div>}
    </div>
  );
}
