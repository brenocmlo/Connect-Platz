import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LeadCardMenu } from "@/components/crm/leads/LeadCardMenu";
import { LeadDetail } from "@/components/crm/LeadDrawer";

const mockLead: LeadDetail = {
  id: "lead-abc",
  stageId: "stage-1",
  nome: "Lucas Ferreira",
  telefone: "11977776666",
  email: "lucas@teste.com",
  temperatura: "MORNO",
  source: "META_ADS",
  createdAt: new Date().toISOString(),
};

describe("LeadCardMenu — Permissão de Troca de Corretor (RBAC)", () => {
  it("TC-UNIT-03: Exibe a opção 'Mudar corretor' quando isAdmin === true", () => {
    const onChangeBroker = vi.fn();
    render(
      <LeadCardMenu
        lead={mockLead}
        isAdmin={true}
        onChangeBroker={onChangeBroker}
        onOpenDetails={vi.fn()}
        onEdit={vi.fn()}
        onAdvanceStage={vi.fn()}
        onAddReminder={vi.fn()}
        onScheduleVisit={vi.fn()}
        onMoveToBolsao={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // Abre o menu suspenso
    fireEvent.click(screen.getByLabelText("Abrir menu do lead"));

    const btnMudar = screen.getByRole("button", { name: /mudar corretor/i });
    expect(btnMudar).toBeInTheDocument();

    fireEvent.click(btnMudar);
    expect(onChangeBroker).toHaveBeenCalledTimes(1);
  });

  it("TC-UNIT-04: NÃO exibe a opção 'Mudar corretor' quando isAdmin === false", () => {
    render(
      <LeadCardMenu
        lead={mockLead}
        isAdmin={false}
        onChangeBroker={vi.fn()}
        onOpenDetails={vi.fn()}
        onEdit={vi.fn()}
        onAdvanceStage={vi.fn()}
        onAddReminder={vi.fn()}
        onScheduleVisit={vi.fn()}
        onMoveToBolsao={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText("Abrir menu do lead"));

    expect(screen.queryByRole("button", { name: /mudar corretor/i })).not.toBeInTheDocument();
  });
});
