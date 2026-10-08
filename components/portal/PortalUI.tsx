"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* Título de seção no padrão RE/MAX: título forte, barra curta de destaque e subtítulo. */
export function PortalSectionTitle({
  eyebrow,
  title,
  lead,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="text-sm text-portal-slate">{eyebrow}</p>}
      <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-portal-ink sm:text-3xl">
        {lead && <span className="block font-normal italic">{lead}</span>}
        {title}
      </h2>
      <span
        aria-hidden
        className={`mt-4 block h-[3px] w-12 rounded-full bg-platz-gold ${centered ? "mx-auto" : ""}`}
      />
      {subtitle && (
        <p className="mt-4 text-sm leading-relaxed text-portal-slate sm:text-base">{subtitle}</p>
      )}
    </div>
  );
}

export function CarouselArrow({
  direction,
  onClick,
  disabled,
  className = "",
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Anterior" : "Próximo"}
      className={`flex h-11 w-11 items-center justify-center rounded-full border border-portal-line bg-portal-surface text-portal-ink shadow-lg shadow-portal-navy/10 transition-all duration-200 hover:border-connect-blue/40 hover:text-connect-blue active:scale-95 disabled:pointer-events-none disabled:opacity-35 ${className}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

/* Entrada fadeInUp ao entrar na viewport (seção 5.11 do AGENTS). */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (reduce || !mounted) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* Count-up que escreve direto no DOM, sem re-render por frame. */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    const render = (v: number) => {
      el.textContent = `${Math.round(v).toLocaleString("pt-BR")}${suffix}`;
    };
    if (reduce) {
      render(value);
      return;
    }
    const controls = animate(0, value, { duration: 1.4, ease: [0, 0, 0.2, 1], onUpdate: render });
    return () => controls.stop();
  }, [inView, value, suffix, reduce]);

  return <span ref={ref}>0{suffix}</span>;
}

export function PortalLogo({ subtitle = true }: { subtitle?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-connect-blue to-connect-deep-blue text-sm font-black text-white ring-1 ring-white/15">
        CP
      </span>
      <span className="flex flex-col">
        <span className="text-base font-black leading-none tracking-tight text-white sm:text-lg">
          CONNECT <span className="text-platz-gold">PLATZ</span>
        </span>
        {subtitle && (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/60">
            Imobiliária e Veraneio
          </span>
        )}
      </span>
    </span>
  );
}
