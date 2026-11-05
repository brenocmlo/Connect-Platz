"use client";

import React from "react";
import { Users, FileText, BarChart3 } from "lucide-react";

interface SiteAboutSectionProps {
  sobreTitulo: string;
  setSobreTitulo: (v: string) => void;
  sobreSubtitulo: string;
  setSobreSubtitulo: (v: string) => void;
  sobreTexto: string;
  setSobreTexto: (v: string) => void;
  sobreEstatistica1Valor: string;
  setSobreEstatistica1Valor: (v: string) => void;
  sobreEstatistica1Rotulo: string;
  setSobreEstatistica1Rotulo: (v: string) => void;
  sobreEstatistica2Valor: string;
  setSobreEstatistica2Valor: (v: string) => void;
  sobreEstatistica2Rotulo: string;
  setSobreEstatistica2Rotulo: (v: string) => void;
  sobreEstatistica3Valor: string;
  setSobreEstatistica3Valor: (v: string) => void;
  sobreEstatistica3Rotulo: string;
  setSobreEstatistica3Rotulo: (v: string) => void;
}

export function SiteAboutSection({
  sobreTitulo,
  setSobreTitulo,
  sobreSubtitulo,
  setSobreSubtitulo,
  sobreTexto,
  setSobreTexto,
  sobreEstatistica1Valor,
  setSobreEstatistica1Valor,
  sobreEstatistica1Rotulo,
  setSobreEstatistica1Rotulo,
  sobreEstatistica2Valor,
  setSobreEstatistica2Valor,
  sobreEstatistica2Rotulo,
  setSobreEstatistica2Rotulo,
  sobreEstatistica3Valor,
  setSobreEstatistica3Valor,
  sobreEstatistica3Rotulo,
  setSobreEstatistica3Rotulo,
}: SiteAboutSectionProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5 animate-in fade-in-0 duration-200">
      <div>
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Users className="w-4 h-4 text-connect-blue" />
          Conteúdo Institucional "Sobre Nós"
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure os textos, diferenciais e números de autoridade exibidos na seção institucional da vitrine.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">
            Título da Seção
          </label>
          <input
            type="text"
            value={sobreTitulo}
            onChange={(e) => setSobreTitulo(e.target.value)}
            placeholder="Ex: POR QUE A CONNECT PLATZ?"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">
            Subtítulo / Chamada Institucional
          </label>
          <input
            type="text"
            value={sobreSubtitulo}
            onChange={(e) => setSobreSubtitulo(e.target.value)}
            placeholder="Ex: Comprar, vender ou alugar é uma decisão importante..."
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">
            Texto Institucional Completo
          </label>
          <textarea
            rows={3}
            value={sobreTexto}
            onChange={(e) => setSobreTexto(e.target.value)}
            placeholder="Conte a história, missão e diferenciais da Connect Platz..."
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-connect-blue focus:outline-none"
          />
        </div>

        <div>
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2 pt-2 border-t border-border">
            <BarChart3 className="w-3.5 h-3.5 text-platz-gold" />
            Pins de Estatísticas & Destaques
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-muted/40 border border-border rounded-lg space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                Destaque 1
              </span>
              <input
                type="text"
                value={sobreEstatistica1Valor}
                onChange={(e) => setSobreEstatistica1Valor(e.target.value)}
                placeholder="Valor (ex: 120+)"
                className="w-full bg-background border border-border rounded px-2 py-1 text-xs font-bold text-foreground"
              />
              <input
                type="text"
                value={sobreEstatistica1Rotulo}
                onChange={(e) => setSobreEstatistica1Rotulo(e.target.value)}
                placeholder="Rótulo (ex: imóveis ativos)"
                className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-muted-foreground"
              />
            </div>

            <div className="p-3 bg-muted/40 border border-border rounded-lg space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                Destaque 2
              </span>
              <input
                type="text"
                value={sobreEstatistica2Valor}
                onChange={(e) => setSobreEstatistica2Valor(e.target.value)}
                placeholder="Valor (ex: 8)"
                className="w-full bg-background border border-border rounded px-2 py-1 text-xs font-bold text-foreground"
              />
              <input
                type="text"
                value={sobreEstatistica2Rotulo}
                onChange={(e) => setSobreEstatistica2Rotulo(e.target.value)}
                placeholder="Rótulo (ex: cidades do Ceará)"
                className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-muted-foreground"
              />
            </div>

            <div className="p-3 bg-muted/40 border border-border rounded-lg space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                Destaque 3
              </span>
              <input
                type="text"
                value={sobreEstatistica3Valor}
                onChange={(e) => setSobreEstatistica3Valor(e.target.value)}
                placeholder="Valor (ex: 45+)"
                className="w-full bg-background border border-border rounded px-2 py-1 text-xs font-bold text-foreground"
              />
              <input
                type="text"
                value={sobreEstatistica3Rotulo}
                onChange={(e) => setSobreEstatistica3Rotulo(e.target.value)}
                placeholder="Rótulo (ex: temporada no litoral)"
                className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
