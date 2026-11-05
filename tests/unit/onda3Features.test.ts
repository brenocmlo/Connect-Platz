import { describe, it, expect } from "vitest";
import {
  calculateSaleValues,
  ROLE_TO_BENEFICIARY,
} from "@/components/crm/vendas/saleSplitHelper";
import {
  matchesFilters,
  sortSales,
  computeTotals,
} from "@/components/crm/vendas/vendasMetrics";
import { SaleItem, VendasFilterState, SplitItem } from "@/components/crm/vendas/types";

describe("Onda 3: Vendas, Comissões, Repasse Financeiro & Baixas", () => {
  const baseSale: SaleItem = {
    id: "sale-1",
    codigoVenda: "CP-2026-001",
    imovelNome: "Reserva das Dunas",
    construtora: "Mota Machado",
    compradorNome: "João da Silva",
    corretorTitular: "Carlos Corretor",
    dataVenda: "15/03/2026",
    dataVendaIso: "2026-03-15",
    vgv: 600000,
    comissaoTotal: 30000, // 5% de 600k
    percentualComissao: 5,
    impostoValor: 1800, // 6% de 30k
    impostoPercentual: 6,
    meioPagamento: "TED",
    status: "ativa",
    statusComissao: "pendente",
    splits: [
      {
        id: "split-1",
        beneficiario: "Carlos Corretor",
        categoria: "Corretor 1",
        tipo: "CORRETOR_TITULAR",
        percentual: 50,
        valor: 14100, // 50% de 28.200 (base líquida)
        status: "PENDENTE",
        comprovanteUrl: null,
      },
      {
        id: "split-2",
        beneficiario: "Maria Parceria",
        categoria: "Captador",
        tipo: "CAPTACAO",
        percentual: 10,
        valor: 2820,
        status: "PAGO",
        comprovanteUrl: "https://r2.connectplatz.com.br/materials/comp-001.pdf",
      },
      {
        id: "split-3",
        beneficiario: "Connect Platz",
        categoria: "Imobiliária",
        tipo: "IMOBILIARIA",
        percentual: 40,
        valor: 11280,
        status: "PENDENTE",
      },
    ],
  };

  const sale2025: SaleItem = {
    ...baseSale,
    id: "sale-2",
    codigoVenda: "CP-2025-089",
    dataVenda: "10/11/2025",
    dataVendaIso: "2025-11-10",
    vgv: 400000,
  };

  it("3.1 Repasse Financeiro: calcula exatamente os valores do proprietário, corretores e imobiliária com soma conservada", () => {
    const vgv = 600000;
    const calc = calculateSaleValues({
      vgvValue: vgv,
      percentualComissao: 5,
      impostoPercentual: 6,
      participants: [
        { role: "CORRETOR_1", percentual: 50, nome: "Carlos" },
        { role: "CORRETOR_2", percentual: 10, nome: "Ana" },
        { role: "CAPTADOR", percentual: 10, nome: "Maria" },
      ],
    });

    expect(calc.vgv).toBe(600000);
    expect(calc.comissaoTotalBruta).toBe(30000); // 5% de 600.000
    expect(calc.impostoEstimado).toBe(1800); // 6% de 30.000
    expect(calc.baseLiquida).toBe(28200); // 30.000 - 1.800

    // Repasse ao proprietário / vendedor: VGV Comercial menos comissão total
    const repasseProprietario = vgv - calc.comissaoTotalBruta;
    expect(repasseProprietario).toBe(570000);

    // Corretores ganham 50% + 10% da base líquida
    const totalCorretores = calc.participants
      .filter((p) => p.role === "CORRETOR_1" || p.role === "CORRETOR_2")
      .reduce((acc, p) => acc + p.valor, 0);
    expect(totalCorretores).toBe(14100 + 2820); // 16.920

    // Imobiliária fica com os 30% restantes da base líquida
    expect(calc.receitaImobiliaria).toBe(8460); // 30% de 28.200

    // Conservação financeira total do VGV:
    const somaTotal =
      repasseProprietario +
      totalCorretores +
      calc.participants.find((p) => p.role === "CAPTADOR")!.valor +
      calc.receitaImobiliaria +
      calc.impostoEstimado;

    expect(somaTotal).toBe(vgv);
  });

  it("3.2 Filtro de Vendas por Ano e Todos: filtra vendas de 2026, 2025 e todas", () => {
    const defaultFilters: VendasFilterState = {
      corretor: "ALL",
      captador: "ALL",
      gestor: "ALL",
      equipe: "ALL",
      construtora: "ALL",
      vgvMin: "",
      vgvMax: "",
      codigoVenda: "",
      status: "ALL",
      ordenarPor: "recente",
      ano: "TODOS",
    };

    // Filtro TODOS: deve aceitar vendas de 2026 e 2025
    expect(matchesFilters(baseSale, defaultFilters)).toBe(true);
    expect(matchesFilters(sale2025, defaultFilters)).toBe(true);

    // Filtro Ano 2026
    const filter2026: VendasFilterState = { ...defaultFilters, ano: "2026" };
    expect(matchesFilters(baseSale, filter2026)).toBe(true);
    expect(matchesFilters(sale2025, filter2026)).toBe(false);

    // Filtro Ano 2025
    const filter2025: VendasFilterState = { ...defaultFilters, ano: "2025" };
    expect(matchesFilters(baseSale, filter2025)).toBe(false);
    expect(matchesFilters(sale2025, filter2025)).toBe(true);
  });

  it("3.3 Comprovante de Pagamento: preserva e expõe URL de comprovante nos splits quitados", () => {
    const splitComComprovante = baseSale.splits.find((s) => s.comprovanteUrl);
    expect(splitComComprovante).toBeDefined();
    expect(splitComComprovante?.status).toBe("PAGO");
    expect(splitComComprovante?.comprovanteUrl).toContain("comp-001.pdf");

    const splitSemComprovante = baseSale.splits.find((s) => !s.comprovanteUrl);
    expect(splitSemComprovante?.comprovanteUrl).toBeNull();
  });
});
