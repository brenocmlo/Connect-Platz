import { CreditEmploymentType } from "@prisma/client";

export interface CreditQualificationData {
  tipoOcupacao: CreditEmploymentType;
  rendaDeclarada?: number;
  rendaEspecificaAutonomo?: number;
  faixaRenda?: string;
  hasContracheques?: boolean;
  hasExtratosBancarios?: boolean;
}

export interface CreditValidationResult {
  isValid: boolean;
  errors: string[];
  requiredDocuments: string[];
}

/**
 * Open/Closed Principle: Políticas de crédito segregadas por tipo de ocupação.
 * Novas políticas (ex.: Empresário, Servidor Público) podem ser adicionadas sem alterar o código existente.
 */
export interface ICreditPolicy {
  supports(type: CreditEmploymentType): boolean;
  validate(data: CreditQualificationData): CreditValidationResult;
}
