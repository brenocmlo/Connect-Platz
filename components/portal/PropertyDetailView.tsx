import React from "react";
import {
  Bath,
  Bed,
  Car,
  CheckCircle2,
  Compass,
  Maximize2,
} from "lucide-react";

// components/portal/PropertyDetailView.tsx
// Subcomponentes modulares para a página dedicada do imóvel (SEO & Experiência do Usuário).

interface PropertyGalleryProps {
  nome: string;
  fotos?: string[];
}

export function PropertyGallery({ nome, fotos }: PropertyGalleryProps) {
  if (!fotos || fotos.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
      <div className="md:col-span-2 relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted border border-border/60 shadow-sm">
        <img
          src={fotos[0]}
          alt={`${nome} - Fachada principal`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
        {fotos.slice(1, 3).map((foto, idx) => (
          <div
            key={idx}
            className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted border border-border/60"
          >
            <img
              src={foto}
              alt={`${nome} - Imagem ${idx + 2}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {fotos.length > 3 && (
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted border border-border/60 flex items-center justify-center bg-black/40 text-white font-medium text-sm">
            <img
              src={fotos[3]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <span className="relative z-10 font-bold">
              +{fotos.length - 3} fotos
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface PropertySpecsProps {
  caracteristicas?: Record<string, any> | null;
  diferenciais?: string[];
  descricao?: string | null;
}

export function PropertySpecs({ caracteristicas, diferenciais, descricao }: PropertySpecsProps) {
  const carac = caracteristicas || {};

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5 text-connect-blue" />
          Características do Imóvel
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {carac.quartos && (
            <div className="p-3 rounded-xl bg-muted/50 border border-border/50 text-center">
              <Bed className="w-5 h-5 mx-auto mb-1 text-connect-blue" />
              <span className="text-lg font-bold block">{carac.quartos}</span>
              <span className="text-xs text-muted-foreground">Quartos</span>
            </div>
          )}
          {carac.banheiros && (
            <div className="p-3 rounded-xl bg-muted/50 border border-border/50 text-center">
              <Bath className="w-5 h-5 mx-auto mb-1 text-connect-blue" />
              <span className="text-lg font-bold block">{carac.banheiros}</span>
              <span className="text-xs text-muted-foreground">Banheiros</span>
            </div>
          )}
          {carac.vagas && (
            <div className="p-3 rounded-xl bg-muted/50 border border-border/50 text-center">
              <Car className="w-5 h-5 mx-auto mb-1 text-connect-blue" />
              <span className="text-lg font-bold block">{carac.vagas}</span>
              <span className="text-xs text-muted-foreground">Vagas</span>
            </div>
          )}
          {carac.area_m2 && (
            <div className="p-3 rounded-xl bg-muted/50 border border-border/50 text-center">
              <Maximize2 className="w-5 h-5 mx-auto mb-1 text-connect-blue" />
              <span className="text-lg font-bold block">{carac.area_m2}m²</span>
              <span className="text-xs text-muted-foreground">Área Privativa</span>
            </div>
          )}
        </div>

        {diferenciais && diferenciais.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              Diferenciais e Lazer
            </h3>
            <div className="flex flex-wrap gap-2">
              {diferenciais.map((dif, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-connect-blue/10 text-connect-blue border border-connect-blue/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {dif}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {descricao && (
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-lg font-bold mb-3">Sobre o Imóvel</h2>
          <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
            {descricao}
          </div>
        </div>
      )}
    </div>
  );
}

interface PropertyFinancialInfoProps {
  modalidade?: string;
  valorVenda?: number | null;
  valorDiaria?: number | null;
  taxaLimpeza?: number | null;
  valorAluguel?: number | null;
  valorCondominio?: number | null;
  valorIptu?: number | null;
  valorRepasse?: number | null;
  entradaRepasse?: number | null;
  parcelasRepasse?: number | null;
  valorParcelaRepasse?: number | null;
  saldoDevedor?: number | null;
  parcelaMensal?: number | null;
  titularOriginario?: string | null;
  clausulaRepasse?: string | null;
}

export function PropertyFinancialInfo({
  modalidade,
  valorVenda,
  valorDiaria,
  taxaLimpeza,
  valorAluguel,
  valorCondominio,
  valorIptu,
  valorRepasse,
  entradaRepasse,
  parcelasRepasse,
  valorParcelaRepasse,
  saldoDevedor,
  parcelaMensal,
  titularOriginario,
  clausulaRepasse,
}: PropertyFinancialInfoProps) {
  const isRepasse = modalidade === "REPASSE" || Boolean(valorRepasse);
  const isLocacao = modalidade === "LOCACAO_ANUAL" || Boolean(valorAluguel);
  const isTemporada = modalidade === "VERANEIO_TEMPORADA" || modalidade === "AMBOS" || Boolean(valorDiaria);

  if (!isRepasse && !isLocacao && !isTemporada) return null;

  const brl = (val?: number | null) =>
    val ? `R$ ${Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";

  const tituloSeção = isRepasse
    ? "Condições Financeiras do Repasse"
    : isTemporada
    ? "Valores e Taxas de Temporada"
    : "Encargos e Condições de Locação";

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <Compass className="w-5 h-5 text-connect-blue" />
        {tituloSeção}
      </h2>

      {isTemporada && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                Valor da Diária
              </span>
              <span className="text-lg font-extrabold text-foreground block mt-1">
                {brl(valorDiaria)} <span className="text-xs font-normal text-muted-foreground">/ noite</span>
              </span>
              <span className="text-[11px] text-muted-foreground">Valor base por pernoite</span>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/60 border border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Taxa de Limpeza
              </span>
              <span className="text-lg font-extrabold text-foreground block mt-1">
                {taxaLimpeza ? brl(taxaLimpeza) : "Incluso ou sob consulta"}
              </span>
              <span className="text-[11px] text-muted-foreground">Cobrada uma única vez por estadia</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-connect-blue/10 border border-connect-blue/20 text-xs text-foreground space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-connect-blue">
              <span>🏖️ Composição da Reserva:</span>
            </span>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Total da estadia = (Quantidade de noites × Diária) + Taxa de limpeza única. O bloqueio de calendário é formalizado diretamente com o corretor.
            </p>
          </div>
        </div>
      )}

      {isRepasse && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                Valor Total do Ágio
              </span>
              <span className="text-lg font-extrabold text-foreground block mt-1">
                {brl(valorRepasse || valorVenda)}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {parcelasRepasse && parcelasRepasse > 1
                  ? `Entrada ${brl(entradaRepasse)} + ${parcelasRepasse}x parceladas`
                  : "Negociável com entrada + parcelamento"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/60 border border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Saldo Devedor a Assumir
              </span>
              <span className="text-lg font-extrabold text-foreground block mt-1">
                {brl(saldoDevedor)}
              </span>
              <span className="text-[11px] text-muted-foreground">Financiamento ativo no banco/construtora</span>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/60 border border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Parcela Mensal do Financiamento
              </span>
              <span className="text-lg font-extrabold text-foreground block mt-1">
                {parcelaMensal ? brl(parcelaMensal) : "Sob consulta"}
              </span>
              <span className="text-[11px] text-muted-foreground">Valor pago diretamente ao banco</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <span>⚠️ Regra Jurídica do Repasse:</span>
              {titularOriginario && <span className="font-normal opacity-80">(Titular originário: {titularOriginario})</span>}
            </span>
            <p className="text-[11px] leading-relaxed opacity-90">
              {clausulaRepasse ||
                "O imóvel continua registrado no nome do financista original até a liquidação final. O adquirente assume o pagamento regular das parcelas. Em caso de atraso superior a 3 meses consecutivos, haverá rescisão contratual com perda integral dos valores pagos e retomada do imóvel."}
            </p>
          </div>
        </div>
      )}

      {isLocacao && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Aluguel Mensal
            </span>
            <span className="text-lg font-extrabold text-foreground block mt-1">
              {brl(valorAluguel)}
            </span>
            <span className="text-[11px] text-muted-foreground">Locação contrato padrão</span>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/60 border border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Condomínio Estimado
            </span>
            <span className="text-lg font-extrabold text-foreground block mt-1">
              {valorCondominio ? brl(valorCondominio) : "Incluso ou sob consulta"}
            </span>
            <span className="text-[11px] text-muted-foreground">Variação conforme condomínio</span>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/60 border border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              IPTU / Mensal
            </span>
            <span className="text-lg font-extrabold text-foreground block mt-1">
              {valorIptu ? brl(valorIptu) : "Sob consulta"}
            </span>
            <span className="text-[11px] text-muted-foreground">Ou cota única anual</span>
          </div>
        </div>
      )}
    </div>
  );
}

export { PropertySidebar, type PropertySidebarProps } from "./PropertySidebar";
