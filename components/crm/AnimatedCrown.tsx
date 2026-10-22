"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";

interface AnimatedCrownProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Coroa do 1º lugar (AGENTS.md 5.11):
 * crown-float (translateY 0 ↔ -6px, rotate -3° ↔ 3°, 2.4s), crown-glow (opacity .45→.9, scale 1→1.15, 2.4s)
 * e crown-sparkle (opacity 0→1→0, scale .4→1→.6, 1.8s). Estática com prefers-reduced-motion.
 */
export function AnimatedCrown({ size = "md", className = "" }: AnimatedCrownProps) {
  const reduceMotion = useReducedMotion();
  const iconSize = size === "lg" ? "w-8 h-8" : size === "md" ? "w-6 h-6" : "w-4 h-4";
  const glowSize = size === "lg" ? "w-14 h-14" : size === "md" ? "w-10 h-10" : "w-7 h-7";
  const sparkleSize = size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5";
  const loop = (duration: number, delay = 0) =>
    reduceMotion ? { duration: 0 } : { duration, delay, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} aria-hidden="true">
      {/* Halo dourado pulsante */}
      <motion.div
        animate={reduceMotion ? { opacity: 0.6 } : { scale: [1, 1.15, 1], opacity: [0.45, 0.9, 0.45] }}
        transition={loop(2.4)}
        className={`absolute rounded-full bg-gradient-to-tr from-[#D9BB4C]/40 to-[#F8DA56]/60 blur-md ${glowSize}`}
      />

      {/* Coroa flutuando e balançando */}
      <motion.div
        animate={reduceMotion ? { y: 0, rotate: 0 } : { y: [0, -6, 0], rotate: [-3, 3, -3] }}
        transition={loop(2.4)}
        className="relative z-10 flex items-center justify-center"
      >
        <Crown className={`${iconSize} fill-[#F8DA56]/30 text-[#D9BB4C] dark:text-[#F8DA56] drop-shadow-[0_2px_8px_rgba(217,187,76,0.6)]`} />
      </motion.div>

      {/* Faíscas */}
      {!reduceMotion && (
        <motion.div
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
          transition={loop(1.8, 0.4)}
          className="absolute -top-1.5 -right-1 text-[#F8DA56]"
        >
          <Sparkles className={sparkleSize} />
        </motion.div>
      )}
    </div>
  );
}
