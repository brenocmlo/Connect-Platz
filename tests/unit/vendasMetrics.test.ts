import { describe, it, expect, vi, afterEach } from "vitest";
import { periodWindow, inWindow, saleTime, computeTotals } from "@/components/crm/vendas/vendasMetrics";
import { SaleItem } from "@/components/crm/vendas/types";

describe("vendasMetrics — Janelas e Filtros de Período", () => {
  it("periodWindow('mes') inclui todas as vendas do mês corrente", () => {
    const window = periodWindow("mes");
    expect(window).not.toBeNull();
    const [start, end] = window!;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const saleEarlyMonth: Partial<SaleItem> = { dataVendaIso: `${year}-${month}-01` };
    const saleLateMonth: Partial<SaleItem> = { dataVendaIso: `${year}-${month}-27` };

    expect(inWindow(saleEarlyMonth as SaleItem, window)).toBe(true);
    expect(inWindow(saleLateMonth as SaleItem, window)).toBe(true);
  });

  describe("com data fixa em 31/03/2026", () => {
    afterEach(() => vi.useRealTimers());
    const at = (iso: string) => ({ dataVendaIso: iso }) as SaleItem;
    const fix = () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 2, 31, 10, 0, 0));
    };

    it("'mes' inclui o dia 31 e exclui o último dia do mês anterior; offset=1 é o mês anterior", () => {
      fix();
      expect(inWindow(at("2026-03-31"), periodWindow("mes"))).toBe(true);
      expect(inWindow(at("2026-03-01"), periodWindow("mes"))).toBe(true);
      expect(inWindow(at("2026-02-28"), periodWindow("mes"))).toBe(false);
      expect(inWindow(at("2026-02-28"), periodWindow("mes", 1))).toBe(true);
      expect(inWindow(at("2026-02-01"), periodWindow("mes", 1))).toBe(true);
      expect(inWindow(at("2026-03-01"), periodWindow("mes", 1))).toBe(false);
    });

    it("'7d' cobre 25..31/03 e offset=1 cobre 18..24/03 sem sobreposição", () => {
      fix();
      expect(inWindow(at("2026-03-25"), periodWindow("7d"))).toBe(true);
      expect(inWindow(at("2026-03-24"), periodWindow("7d"))).toBe(false);
      expect(inWindow(at("2026-03-24"), periodWindow("7d", 1))).toBe(true);
      expect(inWindow(at("2026-03-18"), periodWindow("7d", 1))).toBe(true);
      expect(inWindow(at("2026-03-17"), periodWindow("7d", 1))).toBe(false);
    });

    it("'ano' com offset=1 é o ano anterior inteiro", () => {
      fix();
      expect(inWindow(at("2025-12-31"), periodWindow("ano", 1))).toBe(true);
      expect(inWindow(at("2026-01-01"), periodWindow("ano", 1))).toBe(false);
      expect(inWindow(at("2026-12-31"), periodWindow("ano"))).toBe(true);
    });
  });

  it("computeTotals calcula corretamente VGV, total de vendas e comissões", () => {
    const mockSales: Partial<SaleItem>[] = [
      {
        id: "s1",
        status: "ativa",
        vgv: 500000,
        splits: [
          { id: "sp1", tipo: "IMOBILIARIA", status: "PAGO", valor: 10000, beneficiario: "Imobiliária", categoria: "IMOBILIARIA", percentual: 2 },
          { id: "sp2", tipo: "CORRETOR_TITULAR", status: "PAGO", valor: 15000, beneficiario: "Lucas", categoria: "CORRETOR", percentual: 3 },
        ],
      },
      {
        id: "s2",
        status: "ativa",
        vgv: 300000,
        splits: [
          { id: "sp3", tipo: "IMOBILIARIA", status: "PENDENTE", valor: 6000, beneficiario: "Imobiliária", categoria: "IMOBILIARIA", percentual: 2 },
          { id: "sp4", tipo: "CORRETOR_TITULAR", status: "PENDENTE", valor: 9000, beneficiario: "Lucas", categoria: "CORRETOR", percentual: 3 },
        ],
      },
      {
        id: "s3",
        status: "cancelada",
        vgv: 200000,
        splits: [],
      },
    ];

    const totals = computeTotals(mockSales as SaleItem[]);
    expect(totals.totalVendas).toBe(2);
    expect(totals.vgvTotal).toBe(800000);
    expect(totals.comissaoRecebida).toBe(10000);
    expect(totals.comissoesPagas).toBe(15000);
    expect(totals.comissoesPendentes).toBe(9000);
  });
});
