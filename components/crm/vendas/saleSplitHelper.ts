import { SplitItem, SaleItem } from "./types";

interface SplitCalculationParams {
  vgvValue: number;
  percentualComissao: number;
  corretor1: string;
  corretor1Pct: number;
  hasCorretor2: boolean;
  corretor2: string;
  corretor2Pct: number;
  gerente: string;
  gerentePct: number;
  gestor: string;
  gestorPct: number;
  captador: string;
  captadorPct: number;
  descontoCorretor: number;
  bonusCorretor: number;
}

export function calculateSaleValues(params: SplitCalculationParams) {
  const comissaoTotalBruta = (params.vgvValue * params.percentualComissao) / 100;
  const impostoEstimado = comissaoTotalBruta * 0.06;
  const baseLiquida = comissaoTotalBruta - impostoEstimado;

  const valorCorretor1 =
    baseLiquida * (params.corretor1Pct / 100) - params.descontoCorretor + params.bonusCorretor;
  const valorCorretor2 = params.hasCorretor2 ? baseLiquida * (params.corretor2Pct / 100) : 0;
  const valorGerente = baseLiquida * (params.gerentePct / 100);
  const valorGestor = baseLiquida * (params.gestorPct / 100);
  const valorCaptador = baseLiquida * (params.captadorPct / 100);

  const somaParticipantes =
    valorCorretor1 + valorCorretor2 + valorGerente + valorGestor + valorCaptador;
  const receitaImobiliaria = Math.max(0, comissaoTotalBruta - impostoEstimado - somaParticipantes);

  return {
    comissaoTotalBruta,
    impostoEstimado,
    baseLiquida,
    valorCorretor1,
    valorCorretor2,
    valorGerente,
    valorGestor,
    valorCaptador,
    receitaImobiliaria,
  };
}

export function buildSaleSplits(
  params: SplitCalculationParams,
  calculated: ReturnType<typeof calculateSaleValues>
): SplitItem[] {
  return [
    {
      id: `sp-imob-${Date.now()}`,
      beneficiario: "Connect Platz Imobiliária",
      categoria: "Imobiliária",
      percentual: Math.round(
        (calculated.receitaImobiliaria / calculated.comissaoTotalBruta) * 100
      ),
      valor: calculated.receitaImobiliaria,
      status: "PAGO",
    },
    {
      id: `sp-c1-${Date.now()}`,
      beneficiario: params.corretor1,
      categoria: "Corretor 1",
      percentual: params.corretor1Pct,
      valor: calculated.valorCorretor1,
      status: "PENDENTE",
      pix: "lucas.corretor@pix.com",
    },
    ...(params.hasCorretor2
      ? [
          {
            id: `sp-c2-${Date.now()}`,
            beneficiario: params.corretor2,
            categoria: "Corretor 2",
            percentual: params.corretor2Pct,
            valor: calculated.valorCorretor2,
            status: "PENDENTE" as const,
            pix: "segundo.corretor@pix.com",
          },
        ]
      : []),
    {
      id: `sp-ger-${Date.now()}`,
      beneficiario: params.gerente,
      categoria: "Gerente",
      percentual: params.gerentePct,
      valor: calculated.valorGerente,
      status: "PENDENTE",
      pix: "mariana.gerente@pix.com",
    },
    {
      id: `sp-ges-${Date.now()}`,
      beneficiario: params.gestor,
      categoria: "Gestor",
      percentual: params.gestorPct,
      valor: calculated.valorGestor,
      status: "PENDENTE",
    },
    {
      id: `sp-cap-${Date.now()}`,
      beneficiario: params.captador,
      categoria: "Captador",
      percentual: params.captadorPct,
      valor: calculated.valorCaptador,
      status: "PENDENTE",
      pix: "rafael.captador@pix.com",
    },
  ];
}
