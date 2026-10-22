"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Medal } from "lucide-react";
import { AnimatedCrown } from "@/components/crm/AnimatedCrown";
import { useCrm } from "@/components/crm/CrmContext";
import { formatCompactBRL } from "@/components/crm/dashboard/format";
import { BrokerRankItem } from "./types";
import { RankAvatar } from "./RankAvatar";

const PLACE_STYLE: Record<number, { block: string; ring: string; medal: string; height: string }> = {
  1: {
    block: "border-t-2 border-platz-gold bg-amber-50 dark:bg-amber-500/10",
    ring: "ring-4 ring-platz-gold/60 shadow-lg shadow-platz-gold/25",
    medal: "",
    height: "sm:pt-2",
  },
  2: { block: "bg-card", ring: "ring-2 ring-slate-300 dark:ring-slate-500", medal: "text-slate-400", height: "sm:mt-6" },
  3: { block: "bg-card", ring: "ring-2 ring-amber-600/60", medal: "text-amber-600", height: "sm:mt-10" },
};

/** Pódio 1º/2º/3º (5.9): coroa animada no 1º, medalhas prata/bronze no 2º e 3º. */
export function RankingPodium({ podium }: { podium: BrokerRankItem[] }) {
  const { hideValues } = useCrm();
  const reduceMotion = useReducedMotion();
  if (podium.length === 0) return null;

  // Ordem visual clássica: 2º · 1º · 3º (no mobile, 1º · 2º · 3º)
  const visual = [podium[1], podium[0], podium[2]].filter(Boolean) as BrokerRankItem[];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-start">
      {visual.map((item, idx) => {
        const style = PLACE_STYLE[item.posicao] || PLACE_STYLE[3];
        return (
          <motion.div
            key={item.id}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : idx * 0.08, ease: [0, 0, 0.2, 1] }}
            className={`${style.block} ${style.height} ${
              item.posicao === 1 ? "order-first sm:order-none" : ""
            } border border-border rounded-2xl p-5 shadow-sm hover:border-connect-blue/40 transition-colors flex flex-col items-center text-center gap-2`}
          >
            <div className="relative mt-3">
              {item.posicao === 1 && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                  <AnimatedCrown size="md" />
                </div>
              )}
              <RankAvatar
                nome={item.nome}
                initials={item.avatar}
                photoUrl={item.photoUrl}
                className={`w-14 h-14 text-lg ${style.ring}`}
                fallbackClassName={item.posicao === 1 ? "bg-platz-gold text-slate-950" : "bg-connect-blue text-white"}
              />
            </div>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                item.posicao === 1 ? "bg-platz-gold text-slate-950" : "bg-muted text-muted-foreground"
              }`}
            >
              {item.posicao !== 1 && <Medal className={`w-3 h-3 ${style.medal}`} />}
              {item.posicao}º Lugar
            </span>
            <span className="text-sm font-bold text-foreground truncate max-w-full">{item.nome}</span>
            <span className="text-xs font-extrabold text-connect-blue dark:text-blue-400">
              {hideValues ? "••••••" : formatCompactBRL(item.vgv)} · VGV
            </span>
            <span className="text-[11px] text-muted-foreground">
              {item.vendas} {item.vendas === 1 ? "venda" : "vendas"} · {item.visitas} visitas · {item.captacoes} captações
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
