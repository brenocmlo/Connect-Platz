import { CreditEmploymentType } from "@prisma/client";
import {
  ICreditPolicy,
  CreditQualificationData,
  CreditValidationResult,
} from "@/lib/core/interfaces/ICreditPolicy";

/**
 * Política de Análise de Crédito para Carteira Assinada (CLT)
 * Regra: Obrigatoriedade de contracheques/holerites dos últimos 3 meses.
 */
export class CltCreditPolicy implements ICreditPolicy {
  supports(type: CreditEmploymentType): boolean {
    return type === CreditEmploymentType.CLT;
  }

  validate(data: CreditQualificationData): CreditValidationResult {
    const errors: string[] = [];
    const requiredDocuments = ["3 últimos contracheques / holerites", "Documento de Identidade (RG/CNH)", "Comprovante de Residência"];

    if (!data.rendaDeclarada || data.rendaDeclarada <= 0) {
      errors.push("Renda declarada deve ser superior a zero para clientes CLT.");
    }

    if (data.hasContracheques === false) {
      errors.push("Para clientes CLT, é obrigatório o envio dos 3 últimos holerites.");
    }

    return {
      isValid: errors.length === 0,
      errors,
      requiredDocuments,
    };
  }
}

/**
 * Política de Análise de Crédito para Autônomos / Profissionais Liberais
 * Regra: Anexo de extratos bancários/IRPF + campo obrigatório de valor específico de renda em R$.
 */
export class AutonomoCreditPolicy implements ICreditPolicy {
  supports(type: CreditEmploymentType): boolean {
    return type === CreditEmploymentType.AUTONOMO;
  }

  validate(data: CreditQualificationData): CreditValidationResult {
    const errors: string[] = [];
    const requiredDocuments = [
      "Extratos bancários dos últimos 3 meses ou Declaração de IRPF",
      "Documento de Identidade (RG/CNH)",
      "Comprovante de Residência",
    ];

    if (!data.rendaEspecificaAutonomo || data.rendaEspecificaAutonomo <= 0) {
      errors.push(
        "Para clientes autônomos, é obrigatório preencher o valor específico de renda mensal em R$."
      );
    }

    if (data.hasExtratosBancarios === false) {
      errors.push("Obrigatório anexar extratos bancários ou IRPF do autônomo.");
    }

    return {
      isValid: errors.length === 0,
      errors,
      requiredDocuments,
    };
  }
}

/**
 * Open/Closed Principle: Registrador de Políticas de Crédito
 * Permite registrar novas políticas em tempo de execução sem alterar código existente.
 */
export class CreditPolicyRegistry {
  private policies: ICreditPolicy[] = [
    new CltCreditPolicy(),
    new AutonomoCreditPolicy(),
  ];

  registerPolicy(policy: ICreditPolicy) {
    this.policies.push(policy);
  }

  getPolicy(type: CreditEmploymentType): ICreditPolicy {
    const found = this.policies.find((p) => p.supports(type));
    if (!found) {
      // Política fallback padrão
      return {
        supports: () => true,
        validate: () => ({
          isValid: true,
          errors: [],
          requiredDocuments: ["Documentos comprobatórios de renda padrão"],
        }),
      };
    }
    return found;
  }
}
