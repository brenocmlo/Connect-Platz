// Cálculo 100% determinístico do split de comissões (usado pelo modal e pela API).
// Fluxo: VGV × % bruta = comissão bruta → − imposto = base líquida →
// cada participante recebe % da base líquida (± desconto/bônus) → imobiliária fica com o restante.

export type ParticipantRole = "CORRETOR_1" | "CORRETOR_2" | "GESTOR" | "CAPTADOR";

/** Mapeamento papel na venda → CommissionBeneficiaryType do Prisma. */
export const ROLE_TO_BENEFICIARY: Record<ParticipantRole, string> = {
  CORRETOR_1: "CORRETOR_TITULAR",
  CORRETOR_2: "CO_CORRETOR",
  GESTOR: "SOCIO_GESTOR",
  CAPTADOR: "CAPTACAO",
};

export const ROLE_LABEL: Record<ParticipantRole, string> = {
  CORRETOR_1: "Corretor 1",
  CORRETOR_2: "Corretor 2",
  GESTOR: "Gestor / Sócio",
  CAPTADOR: "Captador",
};

/** Rótulo amigável a partir do beneficiarioTipo persistido. */
export const BENEFICIARY_LABEL: Record<string, string> = {
  CORRETOR_TITULAR: "Corretor 1",
  CO_CORRETOR: "Corretor 2",
  SOCIO_GESTOR: "Gestor / Sócio",
  CAPTACAO: "Captador",
  IMOBILIARIA: "Imobiliária",
  PARCEIRO_EXTERNO: "Parceiro Externo",
};

export interface ParticipantInput {
  role: ParticipantRole;
  userId?: string | null;
  nome: string;
  percentual: number; // % sobre a base líquida
  desconto?: number; // R$
  bonus?: number; // R$
}

export interface SplitCalculationParams {
  vgvValue: number;
  percentualComissao: number; // % bruta sobre o VGV
  impostoPercentual: number; // % sobre a comissão bruta
  participants: ParticipantInput[];
}

export interface CalculatedParticipant extends ParticipantInput {
  valor: number;
}

export interface SaleCalculation {
  comissaoTotalBruta: number;
  impostoEstimado: number;
  baseLiquida: number;
  participants: CalculatedParticipant[];
  somaParticipantes: number;
  percentualParticipantes: number; // % da base líquida alocada a participantes
  receitaImobiliaria: number; // restante da base líquida
  percentualImobiliaria: number;
  excedente: number; // > 0 quando a soma passa de 100% da base líquida
  isOverAllocated: boolean;
}

const round2 = (n: number) => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;
const safe = (n: number | undefined) => (Number.isFinite(n) ? Number(n) : 0);

export function calculateSaleValues(params: SplitCalculationParams): SaleCalculation {
  const comissaoTotalBruta = round2((safe(params.vgvValue) * safe(params.percentualComissao)) / 100);
  const impostoEstimado = round2((comissaoTotalBruta * safe(params.impostoPercentual)) / 100);
  const baseLiquida = round2(comissaoTotalBruta - impostoEstimado);

  const participants = params.participants.map((p) => ({
    ...p,
    valor: round2((baseLiquida * safe(p.percentual)) / 100 - safe(p.desconto) + safe(p.bonus)),
  }));

  const somaParticipantes = round2(participants.reduce((acc, p) => acc + p.valor, 0));
  const restante = round2(baseLiquida - somaParticipantes);
  const isOverAllocated = restante < -0.004 || participants.some((p) => p.valor < 0);

  return {
    comissaoTotalBruta,
    impostoEstimado,
    baseLiquida,
    participants,
    somaParticipantes,
    percentualParticipantes: baseLiquida > 0 ? round2((somaParticipantes / baseLiquida) * 100) : 0,
    receitaImobiliaria: Math.max(0, restante),
    percentualImobiliaria: baseLiquida > 0 ? round2((Math.max(0, restante) / baseLiquida) * 100) : 0,
    excedente: restante < 0 ? round2(-restante) : 0,
    isOverAllocated,
  };
}
