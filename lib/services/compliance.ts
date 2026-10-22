/**
 * Módulo de Compliance e Validação Cadastral (GovTech)
 * 100% determinístico e resiliente com consumo de dados públicos oficiais.
 */

export interface CnpjData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacaoCadastral: string;
  isAtiva: boolean;
  dataAbertura?: string;
  cnaePrincipal?: {
    codigo: number | string;
    descricao: string;
  };
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  qsa?: Array<{
    nome: string;
    qualificacao: string;
  }>;
  service: "brasilapi" | "receitaws" | "cache";
}

const cnpjCache = new Map<string, CnpjData>();

/**
 * Validação algorítmica de CPF via Módulo 11 (dois dígitos verificadores)
 */
export function validateCpf(cpfInput: string): boolean {
  const clean = cpfInput.replace(/\D/g, "");
  if (clean.length !== 11) return false;

  // Rejeita sequências repetidas conhecidas (000.000.000-00, 111.111.111-11, etc.)
  if (/^(\d)\1{10}$/.test(clean)) return false;

  // 1º Dígito Verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  // 2º Dígito Verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

/**
 * Validação algorítmica de CNPJ via Módulo 11 (dois dígitos verificadores)
 */
export function validateCnpj(cnpjInput: string): boolean {
  const clean = cnpjInput.replace(/\D/g, "");
  if (clean.length !== 14) return false;

  // Rejeita sequências repetidas
  if (/^(\d)\1{13}$/.test(clean)) return false;

  // 1º Dígito Verificador
  let length = clean.length - 2;
  let numbers = clean.substring(0, length);
  const digits = clean.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0), 10)) return false;

  // 2º Dígito Verificador
  length = length + 1;
  numbers = clean.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1), 10)) return false;

  return true;
}

/**
 * Formata string para máscara de CPF: 000.000.000-00
 */
export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * Formata string para máscara de CNPJ: 00.000.000/0000-00
 */
export function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

/**
 * Consulta dados cadastrais e situação na Receita Federal via BrasilAPI com fallback para ReceitaWS
 */
export async function fetchCnpjData(cnpjInput: string): Promise<CnpjData | null> {
  const clean = cnpjInput.replace(/\D/g, "");
  if (!validateCnpj(clean)) return null;

  if (cnpjCache.has(clean)) {
    return cnpjCache.get(clean)!;
  }

  // 1. Tenta BrasilAPI
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const data = await res.json();
      const situacao = (data.descricao_situacao_cadastral || "ATIVA").toUpperCase();
      const isAtiva = situacao === "ATIVA";

      const result: CnpjData = {
        cnpj: clean,
        razaoSocial: data.razao_social || "",
        nomeFantasia: data.nome_fantasia || data.razao_social || "",
        situacaoCadastral: situacao,
        isAtiva,
        dataAbertura: data.data_inicio_atividade,
        cnaePrincipal: {
          codigo: data.cnae_fiscal,
          descricao: data.cnae_fiscal_descricao || "",
        },
        endereco: {
          logradouro: `${data.descricao_tipo_de_logradouro || ""} ${data.logradouro || ""}`.trim(),
          numero: data.numero || "S/N",
          complemento: data.complemento || "",
          bairro: data.bairro || "",
          municipio: data.municipio || "",
          uf: data.uf || "",
          cep: data.cep || "",
        },
        qsa: data.qsa?.map((socio: any) => ({
          nome: socio.nome_socio || socio.nome,
          qualificacao: socio.qualificacao_socio || socio.qualificacao_representante_legal || "Sócio",
        })),
        service: "brasilapi",
      };

      cnpjCache.set(clean, result);
      return result;
    }
  } catch {
    // Fallback gracioso
  }

  // 2. Fallback: ReceitaWS
  try {
    const resFallback = await fetch(`https://receitaws.com.br/v1/cnpj/${clean}`, {
      headers: { Accept: "application/json" },
    });

    if (resFallback.ok) {
      const data = await resFallback.json();
      if (data.status !== "ERROR") {
        const situacao = (data.situacao || "ATIVA").toUpperCase();
        const result: CnpjData = {
          cnpj: clean,
          razaoSocial: data.nome || "",
          nomeFantasia: data.fantasia || data.nome || "",
          situacaoCadastral: situacao,
          isAtiva: situacao === "ATIVA",
          dataAbertura: data.abertura,
          cnaePrincipal: {
            codigo: data.atividade_principal?.[0]?.code || "",
            descricao: data.atividade_principal?.[0]?.text || "",
          },
          endereco: {
            logradouro: data.logradouro || "",
            numero: data.numero || "S/N",
            complemento: data.complemento || "",
            bairro: data.bairro || "",
            municipio: data.municipio || "",
            uf: data.uf || "",
            cep: data.cep?.replace(/\D/g, "") || "",
          },
          qsa: data.qsa?.map((socio: any) => ({
            nome: socio.nome,
            qualificacao: socio.qual,
          })),
          service: "receitaws",
        };

        cnpjCache.set(clean, result);
        return result;
      }
    }
  } catch {
    // Falha silenciosa
  }

  return null;
}
