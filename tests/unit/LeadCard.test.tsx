import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LeadCard } from "@/components/crm/leads/LeadCard";
import { LeadDetail } from "@/components/crm/LeadDrawer";

vi.mock("@/components/crm/CrmContext", () => ({
  useCrm: () => ({
    hideValues: false,
    formatMoney: (val: number) => `R$ ${Number(val || 0).toLocaleString("pt-BR")}`,
  }),
}));

const mockLeadBase: LeadDetail = {
  id: "lead-123",
  stageId: "stage-ganho",
  nome: "Cliente Teste",
  telefone: "11999998888",
  email: "cliente@teste.com",
  temperatura: "QUENTE",
  source: "META_ADS",
  createdAt: new Date().toISOString(),
  stage: { id: "stage-ganho", nome: "Fechado / Ganho" },
  salesCount: 0,
};

describe("LeadCard — Alerta de Pendência Financeira", () => {
  it("TC-UNIT-01: Exibe alerta de Pendência Financeira quando lead está em Ganho e salesCount === 0", () => {
    const onRegisterSale = vi.fn();
    render(
      <LeadCard
        lead={{ ...mockLeadBase, salesCount: 0 }}
        onSelectLead={vi.fn()}
        onDragStart={vi.fn()}
        onRegisterSale={onRegisterSale}
      />
    );

    expect(screen.getByText("Pendência Financeira")).toBeInTheDocument();
    const btnCadastrar = screen.getByRole("button", { name: /cadastrar venda/i });
    expect(btnCadastrar).toBeInTheDocument();

    fireEvent.click(btnCadastrar);
    expect(onRegisterSale).toHaveBeenCalledTimes(1);
    expect(onRegisterSale).toHaveBeenCalledWith(expect.objectContaining({ id: "lead-123" }));
  });

  it("TC-UNIT-02: NÃO exibe alerta de Pendência Financeira quando lead possui venda registrada (salesCount >= 1)", () => {
    render(
      <LeadCard
        lead={{
          ...mockLeadBase,
          salesCount: 1,
          sales: [
            {
              id: "sale-1",
              codigoVenda: "CP-2026-001",
              valorVendaVGV: 500000,
              valorComissaoTotal: 25000,
              percentualComissao: 5,
              status: "ativa",
              statusComissao: "pendente",
              dataVenda: new Date().toISOString(),
            },
          ],
        }}
        onSelectLead={vi.fn()}
        onDragStart={vi.fn()}
      />
    );

    expect(screen.queryByText("Pendência Financeira")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cadastrar venda/i })).not.toBeInTheDocument();
    expect(screen.getByText("Venda Concluída")).toBeInTheDocument();
  });

  it("NÃO exibe alerta de Pendência Financeira quando o lead não está na etapa Ganho/Fechado", () => {
    render(
      <LeadCard
        lead={{
          ...mockLeadBase,
          stageId: "stage-1",
          stage: { id: "stage-1", nome: "Primeiro Contato" },
          salesCount: 0,
        }}
        onSelectLead={vi.fn()}
        onDragStart={vi.fn()}
      />
    );

    expect(screen.queryByText("Pendência Financeira")).not.toBeInTheDocument();
  });
});
