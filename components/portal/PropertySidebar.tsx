import React from "react";
import { Compass, MapPin, MessageCircle } from "lucide-react";

export interface PropertySidebarProps {
  enderecoCompleto: string;
  gmapsUrl: string;
  wazeUrl: string;
  waUrl: string;
  pois?: Array<{ label: string; iconType?: string }>;
  ctaSlot?: React.ReactNode;
}

export function PropertySidebar({
  enderecoCompleto,
  gmapsUrl,
  wazeUrl,
  waUrl,
  pois,
  ctaSlot,
}: PropertySidebarProps) {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
        <h3 className="text-base font-bold flex items-center gap-2">
          <MapPin className="w-4 h-4 text-connect-blue" />
          Localização & Mobilidade
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {enderecoCompleto}
        </p>

        {pois && pois.length > 0 && (
          <div className="pt-2 border-t border-border space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              📍 Pontos de Interesse por Perto:
            </span>
            <div className="space-y-1.5">
              {pois.map((poi, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-connect-blue shrink-0" />
                  <span>{poi.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <a
            href={gmapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors text-center"
          >
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            Google Maps
          </a>
          <a
            href={wazeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors text-center"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-500" />
            Waze
          </a>
        </div>

        <div className="pt-4 border-t border-border">
          {ctaSlot || (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Tenho Interesse neste Imóvel</span>
            </a>
          )}
          <span className="text-[11px] text-muted-foreground text-center block mt-2">
            Atendimento direto com corretor credenciado CRECI 023456-J
          </span>
        </div>
      </div>
    </div>
  );
}
