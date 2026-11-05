import { describe, it, expect } from "vitest";
import { z } from "zod";
import { resolvePeriod, parsePeriod } from "@/app/api/dashboard/_lib/period";
import { computeDre, DreEntry } from "@/lib/services/dre";
import { inferPropertyType, matchesFilters, PROPERTY_TYPES } from "@/components/portal/portalUtils";

describe("Onda 5: Dashboard BI, DRE, Ranking & Portal Dinâmico", () => {
  describe("5.1 Filtros de Período e Personalizado no Dashboard e Ranking", () => {
    it("deve resolver período personalizado calculando intervalo e período anterior equivalente", () => {
      const customRange = { start: "2026-11-01", end: "2026-11-10" };
      const period = resolvePeriod("personalizado", new Date(), customRange);

      expect(period.key).toBe("personalizado");
      expect(period.current).not.toBeNull();
      if (period.current) {
        expect(period.current.start.getDate()).toBe(1);
        expect(period.current.start.getMonth()).toBe(10); // Nov (0-indexed: 10)
        expect(period.current.end.getDate()).toBe(10);
        expect(period.current.end.getMonth()).toBe(10);
      }
      expect(period.previous).not.toBeNull();
      if (period.previous) {
        // Período anterior deve ter exatamente a mesma duração
        const durationCurrent = period.current!.end.getTime() - period.current!.start.getTime();
        const durationPrevious = period.previous.end.getTime() - period.previous.start.getTime();
        expect(Math.round(durationCurrent / 1000)).toBe(Math.round(durationPrevious / 1000));
      }
    });

    it("deve resolver período 'todos' sem limites de data (todo o histórico)", () => {
      const period = resolvePeriod("todos");
      expect(period.key).toBe("todos");
      expect(period.current).toBeNull();
      expect(period.previous).toBeNull();
    });

    it("deve aceitar 'personalizado' como período válido", () => {
      expect(parsePeriod("personalizado")).toBe("personalizado");
    });
  });

  describe("5.2 DRE: Período Personalizado e Todos", () => {
    const entries: DreEntry[] = [
      {
        tipo: "RECEITA",
        categoria: "Comissão Venda",
        valor: 50000,
        status: "PAGO",
        dataVencimento: "2026-10-15",
        dataLiquidacao: "2026-10-15",
      },
      {
        tipo: "RECEITA",
        categoria: "Comissão Venda",
        valor: 80000,
        status: "PAGO",
        dataVencimento: "2026-11-05",
        dataLiquidacao: "2026-11-05",
      },
      {
        tipo: "DESPESA",
        categoria: "Split Comissão",
        valor: 40000,
        status: "PAGO",
        dataVencimento: "2026-11-10",
        dataLiquidacao: "2026-11-10",
      },
    ];

    it("deve calcular o DRE consolidado no modo 'TODOS'", () => {
      const dre = computeDre(entries, "TODOS", "COMPETENCIA");
      expect(dre.receitaBruta).toBe(130000); // 50k + 80k
      expect(dre.custosVariaveis).toBe(40000);
    });

    it("deve calcular o DRE restrito a um intervalo de datas personalizado", () => {
      const customRange = { start: "2026-11-01", end: "2026-11-30" };
      const dre = computeDre(entries, "PERSONALIZADO", "COMPETENCIA", customRange);

      expect(dre.receitaBruta).toBe(80000); // Apenas a entrada de novembro
      expect(dre.custosVariaveis).toBe(40000);
    });
  });

  describe("5.3 Tipos de Imóvel: Suporte a 'Chácara' e Inferência no Portal", () => {
    it("deve incluir 'Chacara' na lista de tipos suportados", () => {
      const hasChacara = PROPERTY_TYPES.some((t) => t.value === "Chacara");
      expect(hasChacara).toBe(true);
    });

    it("deve inferir corretamente 'Chacara' a partir de textos com termos rurais", () => {
      expect(inferPropertyType("Chácara de lazer em Guaramiranga")).toBe("Chacara");
      expect(inferPropertyType("Sítio cinematográfico")).toBe("Chacara");
      expect(inferPropertyType("Fazenda para criação")).toBe("Chacara");
    });

    it("deve filtrar imóveis por tipo 'Chacara'", () => {
      const mockProperty = {
        id: "prop-1",
        nome: "Chácara Recanto Verde",
        slug: "chacara-recanto-verde",
        modalidade: "VENDA" as const,
        descricao: "Bela chácara com árvores frutíferas e piscina.",
        valorVenda: 450000,
        bairro: "Sítio São João",
        cidade: "Aquiraz",
      };

      const match = matchesFilters(mockProperty as any, {
        modalidade: "VENDA",
        localizacao: "",
        tipoImovel: "Chacara",
        quartosMin: "TODOS",
        faixaPreco: "TODOS",
      });

      expect(match).toBe(true);
    });
  });

  describe("5.4 Configurações do Site: Regras de Crédito e Sobre Nós", () => {
    const SiteSettingsValidator = z.object({
      simuladorTaxaAnual: z.number().min(0.01).max(0.5),
      simuladorPrazoMeses: z.number().int().min(12).max(480),
      simuladorComprometimento: z.number().min(0.05).max(0.7),
      simuladorEntradaMinima: z.number().min(0.05).max(0.9),
      sobreTitulo: z.string().optional(),
      sobreSubtitulo: z.string().optional(),
      sobreTexto: z.string().optional(),
    });

    it("deve validar regras customizadas de simulação de crédito e sobre nós", () => {
      const payload = {
        simuladorTaxaAnual: 0.098,
        simuladorPrazoMeses: 420,
        simuladorComprometimento: 0.35,
        simuladorEntradaMinima: 0.15,
        sobreTitulo: "Conheça a Connect Platz Imobiliária",
        sobreSubtitulo: "Mais de 10 anos de excelência no litoral cearense",
        sobreTexto: "Nossa história começou com um objetivo simples: conectar pessoas a lares extraordinários.",
      };

      const result = SiteSettingsValidator.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.simuladorTaxaAnual).toBe(0.098);
        expect(result.data.simuladorPrazoMeses).toBe(420);
      }
    });
  });
});
