"use client";

import React, { useEffect, useRef, useState } from "react";

interface CountUpNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number; // segundos
  className?: string;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Count-Up: interpola do último valor exibido até o novo valor (ease-out cubic).
 * - Na montagem parte de 0; nas trocas (ex.: filtro de período) parte do valor atual na tela.
 * - Cancela o requestAnimationFrame pendente ao trocar o valor ou desmontar.
 * - Respeita prefers-reduced-motion (troca instantânea).
 */
export function CountUpNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.2,
  className = "",
}: CountUpNumberProps) {
  const target = Number.isFinite(value) ? value : 0;
  const [displayValue, setDisplayValue] = useState<number>(0);
  const displayRef = useRef<number>(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = displayRef.current;

    if (prefersReducedMotion() || from === target || duration <= 0) {
      displayRef.current = target;
      setDisplayValue(target);
      return;
    }

    const durationMs = duration * 1000;
    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (startTimestamp === null) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = progress < 1 ? from + (target - from) * eased : target;

      displayRef.current = current;
      setDisplayValue(current);

      frameRef.current = progress < 1 ? window.requestAnimationFrame(step) : null;
    };

    frameRef.current = window.requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [target, duration]);

  const formatted = displayValue.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
