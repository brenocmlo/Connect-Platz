// lib/domain/properties/modalityScope.ts
// Regras puras (compartilhadas entre UI e API) para escopo de modalidades de imóveis por perfil.

export type PropertyModalidadeOption =
  | "VENDA"
  | "LOCACAO_ANUAL"
  | "VERANEIO_TEMPORADA"
  | "REPASSE"
  | "AMBOS";

export type UserModalityGroup = "VENDA" | "ALUGUEL" | "AMBOS";

export interface ModalityOptionMeta {
  value: PropertyModalidadeOption;
  label: string;
  shortLabel: string;
}

const MODALITY_META: Record<PropertyModalidadeOption, ModalityOptionMeta> = {
  VENDA: { value: "VENDA", label: "🏢 Venda Tradicional", shortLabel: "🏢 Venda" },
  LOCACAO_ANUAL: { value: "LOCACAO_ANUAL", label: "🔑 Locação Comum", shortLabel: "🔑 Locação Comum" },
  VERANEIO_TEMPORADA: { value: "VERANEIO_TEMPORADA", label: "🏖️ Temporada / Veraneio", shortLabel: "🏖️ Temporada" },
  REPASSE: { value: "REPASSE", label: "🔄 Repasse de Imóvel", shortLabel: "🔄 Repasse" },
  AMBOS: { value: "AMBOS", label: "✨ Ambos (Venda & Temporada)", shortLabel: "✨ Ambos" },
};

const ALL_EMPREENDIMENTO_ORDER: PropertyModalidadeOption[] = [
  "VENDA",
  "LOCACAO_ANUAL",
  "VERANEIO_TEMPORADA",
  "REPASSE",
  "AMBOS",
];

const ALL_AVULSO_ORDER: PropertyModalidadeOption[] = [
  "VENDA",
  "LOCACAO_ANUAL",
  "VERANEIO_TEMPORADA",
  "REPASSE",
];

const VENDA_ORDER: PropertyModalidadeOption[] = ["VENDA", "REPASSE"];
const ALUGUEL_ORDER: PropertyModalidadeOption[] = ["VERANEIO_TEMPORADA", "LOCACAO_ANUAL"];

/** Identifica a vertical operacional do perfil sem importar dependências de servidor. */
export function resolveRoleModalityGroup(role?: string | null): UserModalityGroup {
  if (!role || role === "ADMINISTRADOR") return "AMBOS";
  if (
    role === "ADMINISTRADOR_VENDA" ||
    role === "FINANCEIRO_VENDA" ||
    role === "CORRETOR_VENDA"
  ) {
    return "VENDA";
  }
  return "ALUGUEL";
}

/** Lista de modalidades que o perfil pode cadastrar. */
export function getAllowedPropertyModalities(
  role?: string | null,
  includeAmbos = true
): ModalityOptionMeta[] {
  const group = resolveRoleModalityGroup(role);
  const keys =
    group === "VENDA"
      ? VENDA_ORDER
      : group === "ALUGUEL"
      ? ALUGUEL_ORDER
      : includeAmbos
      ? ALL_EMPREENDIMENTO_ORDER
      : ALL_AVULSO_ORDER;

  return keys.map((k) => MODALITY_META[k]);
}

/** Modalidade inicial padrão ao abrir os modais ou omitir no payload de criação. */
export function getDefaultPropertyModalidade(role?: string | null): PropertyModalidadeOption {
  return resolveRoleModalityGroup(role) === "ALUGUEL" ? "VERANEIO_TEMPORADA" : "VENDA";
}

/** Valida se o perfil tem permissão para criar ou converter um imóvel para esta modalidade. */
export function isModalidadeAllowedForRole(
  modalidade: string | null | undefined,
  role?: string | null,
  includeAmbos = true
): boolean {
  if (!modalidade) return false;
  return getAllowedPropertyModalities(role, includeAmbos).some((opt) => opt.value === modalidade);
}

/** Verifica se o imóvel pertence à carteira visível do perfil (inclui AMBOS). */
export function isPropertyVisibleToRole(
  modalidade: string | null | undefined,
  role?: string | null
): boolean {
  const group = resolveRoleModalityGroup(role);
  if (group === "AMBOS") return true;
  if (group === "VENDA") {
    return !modalidade || modalidade === "VENDA" || modalidade === "REPASSE" || modalidade === "AMBOS";
  }
  return (
    modalidade === "VERANEIO_TEMPORADA" ||
    modalidade === "VERANEIO" ||
    modalidade === "LOCACAO_ANUAL" ||
    modalidade === "AMBOS"
  );
}

/** Verifica se um administrador pode editar um imóvel de determinada modalidade. */
export function canEditPropertyForRole(
  modalidade: string | null | undefined,
  role?: string | null
): boolean {
  if (role !== "ADMINISTRADOR" && role !== "ADMINISTRADOR_VENDA" && role !== "ADMINISTRADOR_ALUGUEL") {
    return false;
  }
  return isPropertyVisibleToRole(modalidade, role);
}

/** Verifica se um administrador pode apagar/desativar um imóvel relacionado aos seus tipos. */
export function canDeletePropertyForRole(
  modalidade: string | null | undefined,
  role?: string | null
): boolean {
  if (role !== "ADMINISTRADOR" && role !== "ADMINISTRADOR_VENDA" && role !== "ADMINISTRADOR_ALUGUEL") {
    return false;
  }
  return isPropertyVisibleToRole(modalidade, role);
}

/** Mensagem de erro padronizada ao tentar cadastrar/alterar fora do escopo do perfil. */
export function getModalityScopeErrorMessage(role?: string | null): string {
  const group = resolveRoleModalityGroup(role);
  if (group === "ALUGUEL") {
    return "Seu perfil permite cadastrar apenas imóveis de temporada ou locação.";
  }
  if (group === "VENDA") {
    return "Seu perfil permite cadastrar apenas imóveis de venda ou repasse.";
  }
  return "Modalidade não permitida.";
}
