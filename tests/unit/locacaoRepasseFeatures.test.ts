import { describe, it, expect } from "vitest";
import { calculateSaleValues } from "@/components/crm/vendas/saleSplitHelper";
import { formatPrice, matchesFilters, isLocacao, isRepasse } from "@/components/portal/portalUtils";
import { parsePropertyBody } from "@/app/api/properties/propertyPayload";
import type { PropertyItem, PortalFilters } from "@/components/portal/types";

describe("Recursos de Locação Comum e Repasse", () => {
  describe("Split de Vendas com Repasse (Cessão de Direitos)", () => {
    it("calcula comissão sobre o ágio (valor do repasse) quando baseCalculoComissao = REPASSE", () => {
      // Exemplo: Imóvel com repasse de R$ 80.000, saldo de R$ 220.000 -> VGV R$ 300.000.
      // Comissão de 5% sobre os R$ 80.000 = R$ 4.000 bruto.
      // Imposto de 6% sobre R$ 4.000 = R$ 240 -> Base líquida = R$ 3.760.
      const calc = calculateSaleValues({
        vgvValue: 300000,
        percentualComissao: 5,
        impostoPercentual: 6,
        isRepasse: true,
        valorRepasse: 80000,
        saldoDevedor: 220000,
        baseCalculoComissao: "REPASSE",
        participants: [
          { role: "CORRETOR_1", userId: "u1", nome: "Corretor 1", percentual: 50 },
          { role: "CAPTADOR", userId: "u2", nome: "Captador", percentual: 10 },
        ],
      });

      expect(calc.baseComissaoValor).toBe(80000);
      expect(calc.comissaoTotalBruta).toBe(4000); // 5% de 80.000
      expect(calc.impostoEstimado).toBe(240); // 6% de 4.000
      expect(calc.baseLiquida).toBe(3760); // 4000 - 240
      expect(calc.participants[0].valor).toBe(1880); // 50% de 3760
      expect(calc.participants[1].valor).toBe(376); // 10% de 3760
      expect(calc.repasseLiquidoVendedor).toBe(76000); // 80.000 - 4.000
    });

    it("calcula comissão sobre o VGV Total quando baseCalculoComissao = VGV", () => {
      // Exemplo: Repasse de R$ 80.000, saldo de R$ 220.000 -> VGV R$ 300.000.
      // Comissão de 5% sobre os R$ 300.000 = R$ 15.000 bruto.
      const calc = calculateSaleValues({
        vgvValue: 300000,
        percentualComissao: 5,
        impostoPercentual: 6,
        isRepasse: true,
        valorRepasse: 80000,
        saldoDevedor: 220000,
        baseCalculoComissao: "VGV",
        participants: [
          { role: "CORRETOR_1", userId: "u1", nome: "Corretor 1", percentual: 50 },
        ],
      });

      expect(calc.baseComissaoValor).toBe(300000);
      expect(calc.comissaoTotalBruta).toBe(15000);
      expect(calc.impostoEstimado).toBe(900);
      expect(calc.baseLiquida).toBe(14100);
      expect(calc.participants[0].valor).toBe(7050);
    });
  });

  describe("Sanitização de Payload de Imóveis no Cadastro", () => {
    it("converte campos de locação comum e repasse em números válidos", () => {
      const { data, errors } = parsePropertyBody(
        {
          nome: "Apartamento Repasse Meireles",
          cidade: "Fortaleza",
          modalidade: "REPASSE",
          valorRepasse: 120000,
          entradaRepasse: 40000,
          parcelasRepasse: 12,
          valorParcelaRepasse: 6666.67,
          saldoDevedor: 250000,
          parcelaMensal: 2150.5,
          titularOriginario: "Carlos Eduardo da Silva",
          valorAluguel: 3500,
          valorCondominio: 650,
          valorIptu: 180,
        },
        false
      );

      expect(errors).toHaveLength(0);
      expect(data.valorRepasse).toBe(120000);
      expect(data.entradaRepasse).toBe(40000);
      expect(data.parcelasRepasse).toBe(12);
      expect(data.valorParcelaRepasse).toBe(6666.67);
      expect(data.saldoDevedor).toBe(250000);
      expect(data.parcelaMensal).toBe(2150.5);
      expect(data.titularOriginario).toBe("Carlos Eduardo da Silva");
      expect(data.valorAluguel).toBe(3500);
      expect(data.valorCondominio).toBe(650);
      expect(data.valorIptu).toBe(180);
      expect(data.modalidade).toBe("REPASSE");
    });
  });

  describe("Portal e Filtros de Vitrine (portalUtils)", () => {
    const imovelRepasse: PropertyItem = {
      id: "p1",
      nome: "Repasse Condomínio Gran Sol",
      slug: "repasse-gran-sol",
      modalidade: "REPASSE",
      valorRepasse: 95000,
      saldoDevedor: 280000,
      cidade: "Aquiraz",
      bairro: "Porto das Dunas",
      estado: "CE",
      caracteristicas: { quartos: 3 },
    };

    const imovelLocacao: PropertyItem = {
      id: "p2",
      nome: "Apartamento Beira Mar Aluguel",
      slug: "apt-beira-mar-aluguel",
      modalidade: "LOCACAO_ANUAL",
      valorAluguel: 4500,
      valorCondominio: 800,
      cidade: "Fortaleza",
      bairro: "Meireles",
      estado: "CE",
      caracteristicas: { quartos: 2 },
    };

    const imovelVenda: PropertyItem = {
      id: "p3",
      nome: "Mansão Alphaville",
      slug: "mansao-alphaville",
      modalidade: "VENDA",
      valorVenda: 1800000,
      cidade: "Eusébio",
      bairro: "Alphaville",
      estado: "CE",
      caracteristicas: { quartos: 4 },
    };

    it("identifica corretamente modalidades com isLocacao e isRepasse", () => {
      expect(isRepasse(imovelRepasse)).toBe(true);
      expect(isRepasse(imovelLocacao)).toBe(false);

      expect(isLocacao(imovelLocacao)).toBe(true);
      expect(isLocacao(imovelVenda)).toBe(false);
    });

    it("formata preços de repasse com 'Repasse R$ ...'", () => {
      expect(formatPrice(imovelRepasse)).toBe("Repasse R$ 95.000");
    });

    it("formata preços de locação com 'R$ ... / mês'", () => {
      expect(formatPrice(imovelLocacao)).toBe("R$ 4.500 / mês");
    });

    it("filtra corretamente por modalidade REPASSE", () => {
      const filters: PortalFilters = {
        modalidade: "REPASSE",
        localizacao: "",
        tipoImovel: "TODOS",
        quartosMin: "TODOS",
        faixaPreco: "TODOS",
      };

      expect(matchesFilters(imovelRepasse, filters)).toBe(true);
      expect(matchesFilters(imovelLocacao, filters)).toBe(false);
      expect(matchesFilters(imovelVenda, filters)).toBe(false);
    });

    it("filtra corretamente por modalidade ALUGUEL", () => {
      const filters: PortalFilters = {
        modalidade: "ALUGUEL",
        localizacao: "",
        tipoImovel: "TODOS",
        quartosMin: "TODOS",
        faixaPreco: "TODOS",
      };

      expect(matchesFilters(imovelLocacao, filters)).toBe(true);
      expect(matchesFilters(imovelRepasse, filters)).toBe(false);
      expect(matchesFilters(imovelVenda, filters)).toBe(false);
    });

    it("filtra por faixa de preço de aluguel", () => {
      const filterFaixa: PortalFilters = {
        modalidade: "ALUGUEL",
        localizacao: "",
        tipoImovel: "TODOS",
        quartosMin: "TODOS",
        faixaPreco: "4000-7000",
      };

      expect(matchesFilters(imovelLocacao, filterFaixa)).toBe(true);

      const filterFaixaBaixa: PortalFilters = {
        ...filterFaixa,
        faixaPreco: "0-2000",
      };
      expect(matchesFilters(imovelLocacao, filterFaixaBaixa)).toBe(false);
    });
  });
});
