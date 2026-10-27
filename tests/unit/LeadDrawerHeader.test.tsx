import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LeadDrawerHeader } from "@/components/crm/lead-drawer/LeadDrawerHeader";
import { LeadDetail } from "@/components/crm/LeadDrawer";

vi.mock("@/components/crm/leads/leadsApi", () => ({
  registerFirstContact: vi.fn(),
}));

const mockLead: LeadDetail = {
  id: "lead-1",
  stageId: "stage-1",
  nome: "Maria Souza",
  telefone: "11988887777",
  email: "maria@teste.com",
  temperatura: "MORNO",
  source: "META_ADS",
  createdAt: new Date().toISOString(),
  corretor: { id: "u1", nome: "Carlos Corretor" },
} as LeadDetail;

describe("LeadDrawerHeader — Troca de corretor (RBAC)", () => {
  it("TC-UNIT-05: admin vê 'Mudar corretor' ao lado do corretor e o clique dispara o callback", () => {
    const onChangeBroker = vi.fn();
    render(
      <LeadDrawerHeader
        lead={mockLead}
        onClose={vi.fn()}
        isAdmin={true}
        onChangeBroker={onChangeBroker}
      />
    );

    expect(screen.getByText("Carlos Corretor")).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: /mudar corretor/i });
    fireEvent.click(btn);
    expect(onChangeBroker).toHaveBeenCalledTimes(1);
    expect(onChangeBroker).toHaveBeenCalledWith(mockLead);
  });

  it("TC-UNIT-05: não-admin vê o corretor mas NÃO vê 'Mudar corretor'", () => {
    render(
      <LeadDrawerHeader
        lead={mockLead}
        onClose={vi.fn()}
        isAdmin={false}
        onChangeBroker={vi.fn()}
      />
    );

    expect(screen.getByText("Carlos Corretor")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /mudar corretor/i })).not.toBeInTheDocument();
  });
});
