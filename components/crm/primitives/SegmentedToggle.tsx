"use client";

import React from "react";
import { motion } from "framer-motion";

export interface ToggleOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ElementType;
  badge?: string | number;
}

interface SegmentedToggleProps<T extends string = string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: "default" | "primary";
  size?: "sm" | "md";
  className?: string;
}

export function SegmentedToggle<T extends string = string>({
  options,
  value,
  onChange,
  variant = "default",
  size = "md",
  className = "",
}: SegmentedToggleProps<T>) {
  const sizeClasses = size === "sm" ? "p-0.5 text-xs" : "p-1 text-xs";
  const itemPadding = size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5";

  return (
    <div
      className={`inline-flex items-center rounded-lg bg-muted border border-border/60 ${sizeClasses} ${className}`}
      role="tablist"
    >
      {options.map((option) => {
        const isActive = option.value === value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={`relative flex items-center gap-1.5 rounded-md font-semibold transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${itemPadding} ${
              isActive
                ? variant === "primary"
                  ? "text-white"
                  : "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={`segmented-active-${variant}`}
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className={`absolute inset-0 rounded-md shadow-xs ${
                  variant === "primary"
                    ? "bg-connect-blue shadow-connect-blue/30"
                    : "bg-card border border-border/80"
                }`}
              />
            )}

            <span className="relative z-10 flex items-center gap-1.5">
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{option.label}</span>
              {option.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? variant === "primary"
                        ? "bg-white/20 text-white"
                        : "bg-muted text-foreground"
                      : "bg-background/80 text-muted-foreground"
                  }`}
                >
                  {option.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
