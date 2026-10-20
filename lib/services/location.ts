export interface LocationData {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

// Bairros mais frequentes da imobiliária para sugestão rápida
export const REGIONAL_NEIGHBORHOODS: Record<string, string[]> = {
  Fortaleza: [
    "Meireles",
    "Aldeota",
    "Mucuripe",
    "Cocó",
    "Praia de Iracema",
    "Dionísio Torres",
    "Varjota",
    "Guararapes",
    "Fátima",
    "Papicu",
    "Engenheiro Luciano Cavalcante",
  ],
  Aquiraz: [
    "Porto das Dunas",
    "Prainha",
    "Centro",
    "Camocim",
    "Japuara",
    "Iguape",
  ],
  Eusébio: [
    "Centro",
    "Urucunema",
    "Coaçu",
    "Tamandatuba",
    "Mangabeira",
    "Amador",
  ],
  Itajaí: [
    "Praia Brava",
    "Centro",
    "Fazenda",
    "Cabeçudas",
    "Ressacada",
    "São João",
  ],
  "Balneário Camboriú": [
    "Centro",
    "Barra Sul",
    "Barra Norte",
    "Pioneiros",
    "Nações",
    "Praia dos Amores",
  ],
};

/**
 * Busca dados de endereço via ViaCEP com fallback para BrasilAPI
 */
export async function fetchAddressByCep(cepInput: string): Promise<LocationData | null> {
  const cleanCep = cepInput.replace(/\D/g, "");
  if (cleanCep.length !== 8) return null;

  try {
    // 1. Tenta ViaCEP (primário)
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      if (!data.erro) {
        return {
          cep: cleanCep,
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          uf: data.uf || "",
        };
      }
    }
  } catch {
    // Fallback gracioso
  }

  try {
    // 2. Fallback: BrasilAPI
    const resFallback = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
    if (resFallback.ok) {
      const data = await resFallback.json();
      return {
        cep: cleanCep,
        logradouro: data.street || "",
        bairro: data.neighborhood || "",
        cidade: data.city || "",
        uf: data.state || "",
      };
    }
  } catch {
    // Silencioso
  }

  return null;
}
