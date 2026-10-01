"use client";

import React from "react";
import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";

interface AnimatedCrownProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AnimatedCrown({ size = "md", className = "" }: AnimatedCrownProps) {
  const iconSize = size === "lg" ? "w-8 h-8" : size === "md" ? "w-6 h-6" : "w-4 h-4";
  const glowSize = size === "lg" ? "w-14 h-14" : size === "md" ? "w-10 h-10" : "w-7 h-7";

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Halo de Brilho Dourado Pulsante */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.35, 0.7, 0.35],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute rounded-full bg-gradient-to-tr from-[#D9BB4C]/40 to-[#F8DA56]/60 blur-md ${glowSize}`}
      />

      {/* Coroa com Leve Flutuação */}
      <motion.div
        animate={{
          y: [-2, 2, -2],
          rotate: [-1.5, 1.5, -1.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10 flex items-center justify-center"
      >
        <Crown className={`${iconSize} text-[#F8DA56] drop-shadow-[0_2px_8px_rgba(217,187,76,0.6)]`} />
      </motion.div>

      {/* Partículas de Brilho */}
      <motion.div
        animate={{
          opacity: [0, 1, 0],
          scale: [0.6, 1.1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 0.4,
          ease: "easeInOut",
        }}
        className="absolute -top-1.5 -right-1 text-[#F8DA56]"
      >
        <Sparkles className="w-3.5 h-3.5" />
      </motion.div>
    </div>
  );
}
