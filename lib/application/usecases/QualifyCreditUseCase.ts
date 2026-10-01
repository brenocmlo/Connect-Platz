import { ILeadRepository } from "@/lib/core/interfaces/ILeadRepository";
import { CreditPolicyRegistry } from "@/lib/domain/credit/CreditPolicies";
import { CreditEmploymentType, CreditAnalysisStatus } from "@prisma/client";

export interface QualifyCreditInput {
  leadId: string;
  userId: string;
  tipoOcupacao: CreditEmploymentType;
  rendaDeclarada?: number;
  rendaEspecificaAutonomo?: number;
  faixaRenda?: string;
  hasContracheques?: boolean;
  hasExtratosBancarios?: boolean;
}

/**
 * Open/Closed Principle: Utiliza o registry de políticas para validar o crédito
 * sem switch/case hardcoded, facilitando inclusão de novas modalidades no futuro.
 */
export class QualifyCreditUseCase {
  constructor(
    private readonly leadRepo: ILeadRepository,
    private readonly policyRegistry: CreditPolicyRegistry
  ) {}

  async execute(input: QualifyCreditInput) {
    const policy = this.policyRegistry.getPolicy(input.tipoOcupacao);
    const result = policy.validate(input);

    const status = result.isValid
      ? CreditAnalysisStatus.APROVADO
      : CreditAnalysisStatus.DOCUMENTACAO_PENDENTE;

    const updatedLead = await this.leadRepo.update(input.leadId, {
      tipoOcupacaoCredito: input.tipoOcupacao,
      rendaDeclarada: input.rendaDeclarada,
      rendaEspecificaAutonomo: input.rendaEspecificaAutonomo,
      faixaRenda: input.faixaRenda,
      statusCredito: status,
    });

    const statusText = result.isValid
      ? "Documentação de crédito completa e qualificada."
      : `Pendências: ${result.errors.join("; ")}`;

    await this.leadRepo.addTimeline({
      leadId: input.leadId,
      userId: input.userId,
      tipo: "nota",
      conteudo: `ESTEIRA DE CRÉDITO (${input.tipoOcupacao}): ${statusText} Documentos exigidos: ${result.requiredDocuments.join(", ")}.`,
    });

    return {
      lead: updatedLead,
      validation: result,
      status,
    };
  }
}
