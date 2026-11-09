import { describe, it, expect } from "vitest";
import {
  findMatchingPoiNeighborhood,
  resolveNeighborhoodPois,
  REGIONAL_POIS,
} from "@/lib/services/neighborhoodPois";
import { buildDirectory } from "@/app/api/properties/propertyDirectory";
import { PropertyModality } from "@prisma/client";

describe("Bairros Dinâmicos e Resolvedor Inteligente de POIs", () => {
  it("deve resolver POIs curados para bairros conhecidos", () => {
    const poisCoco = resolveNeighborhoodPois({ bairro: "Cocó", cidade: "Fortaleza" });
    expect(poisCoco.length).toBeGreaterThanOrEqual(4);
    expect(poisCoco.some((p) => p.label.includes("Parque Ecológico do Cocó"))).toBe(true);

    const poisMeireles = resolveNeighborhoodPois({ bairro: "Meireles", cidade: "Fortaleza" });
    expect(poisMeireles.some((p) => p.label.includes("Praia do Meireles"))).toBe(true);
  });

  it("deve ser insensível a maiúsculas e acentos na busca de bairros conhecidos", () => {
    const matchedCoco = findMatchingPoiNeighborhood("coco");
    expect(matchedCoco).toBe("Cocó");

    const matchedMeireles = findMatchingPoiNeighborhood("MEIRELES");
    expect(matchedMeireles).toBe("Meireles");

    const matchedPdd = findMatchingPoiNeighborhood("porto das dunas");
    expect(matchedPdd).toBe("Porto das Dunas");
  });

  it("deve priorizar POIs customizados do cadastro do imóvel quando presentes", () => {
    const custom = [
      { nome: "Padaria Artesanal Exclusiva", distancia: "50m" },
      { nome: "Colégio Bilíngue", distancia: "120m" },
    ];
    const pois = resolveNeighborhoodPois({
      bairro: "Meireles",
      cidade: "Fortaleza",
      customPois: custom,
    });

    expect(pois.length).toBe(2);
    expect(pois[0].label).toBe("Padaria Artesanal Exclusiva (50m)");
    expect(pois[1].label).toBe("Colégio Bilíngue (120m)");
  });

  it("deve gerar POIs metropolitanos automáticos para novos bairros nunca cadastrados", () => {
    const poisNovo = resolveNeighborhoodPois({
      bairro: "Cambeba",
      cidade: "Fortaleza",
    });

    expect(poisNovo.length).toBe(4);
    expect(poisNovo.some((p) => p.label.includes("Cambeba") || p.label.includes("Fortaleza"))).toBe(true);
    expect(poisNovo.some((p) => p.iconType === "route")).toBe(true);
    expect(poisNovo.some((p) => p.iconType === "shopping")).toBe(true);
  });

  it("deve ordenar bairros do diretório priorizando o maior volume de imóveis ativos", () => {
    const mockProperties = [
      {
        nome: "Apartamento 1",
        cidade: "Fortaleza",
        estado: "CE",
        bairro: "Cocó",
        modalidade: PropertyModality.VENDA,
      },
      {
        nome: "Apartamento 2",
        cidade: "Fortaleza",
        estado: "CE",
        bairro: "Cocó",
        modalidade: PropertyModality.VENDA,
      },
      {
        nome: "Apartamento 3",
        cidade: "Fortaleza",
        estado: "CE",
        bairro: "Cocó",
        modalidade: PropertyModality.VENDA,
      },
      {
        nome: "Apartamento 4",
        cidade: "Fortaleza",
        estado: "CE",
        bairro: "Aldeota",
        modalidade: PropertyModality.VENDA,
      },
      {
        nome: "Apartamento 5",
        cidade: "Fortaleza",
        estado: "CE",
        bairro: "Meireles",
        modalidade: PropertyModality.VENDA,
      },
      {
        nome: "Apartamento 6",
        cidade: "Fortaleza",
        estado: "CE",
        bairro: "Meireles",
        modalidade: PropertyModality.VENDA,
      },
    ];

    const directory = buildDirectory(mockProperties as any);
    expect(directory.length).toBe(1);
    const fortaleza = directory[0];
    expect(fortaleza.cidade).toBe("Fortaleza");

    // Cocó (3) deve vir antes de Meireles (2), que deve vir antes de Aldeota (1)
    expect(fortaleza.bairros[0].nome).toBe("Cocó");
    expect(fortaleza.bairros[0].total).toBe(3);

    expect(fortaleza.bairros[1].nome).toBe("Meireles");
    expect(fortaleza.bairros[1].total).toBe(2);

    expect(fortaleza.bairros[2].nome).toBe("Aldeota");
    expect(fortaleza.bairros[2].total).toBe(1);
  });
});
