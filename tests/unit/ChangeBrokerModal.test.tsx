import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChangeBrokerModal } from "@/components/crm/leads/ChangeBrokerModal";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { LookupMember } from "@/components/crm/agenda/useCrmLookups";

const mockLead: LeadDetail = {
  id: "lead-456",
  stageId: "stage-1",
  nome: "Juliana Mendes",
  telefone: "11988887777",
  email: "juliana@teste.com",
  temperatura: "QUENTE",
  source: "META_ADS",
  createdAt: new Date().toISOString(),
  corretor: { id: "broker-1", nome: "Carlos Corretor" },
};

const mockMembers: LookupMember[] = [
  { id: "broker-1", nome: "Carlos Corretor", role: "CORRETOR" },
  { id: "broker-2", nome: "Mariana Imóveis", role: "CORRETOR" },
  { id: "broker-3", nome: "Fernando Consultor", role: "CORRETOR" },
];

describe("ChangeBrokerModal — Transferência de Carteira", () => {
  it("Renderiza a lista de corretores e permite busca por nome", () => {
    render(
      <ChangeBrokerModal
        isOpen={true}
        lead={mockLead}
        members={mockMembers}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByText("Mudar Corretor Responsável")).toBeInTheDocument();
    expect(screen.getByText("Mariana Imóveis")).toBeInTheDocument();
    expect(screen.getByText("Fernando Consultor")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/buscar corretor por nome/i);
    fireEvent.change(searchInput, { target: { value: "Mariana" } });

    expect(screen.getByText("Mariana Imóveis")).toBeInTheDocument();
    expect(screen.queryByText("Fernando Consultor")).not.toBeInTheDocument();
  });

  it("Executa onSuccess ao selecionar novo corretor e confirmar transferência", async () => {
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    render(
      <ChangeBrokerModal
        isOpen={true}
        lead={mockLead}
        members={mockMembers}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />
    );

    // Clica no corretor "Mariana Imóveis"
    fireEvent.click(screen.getByText("Mariana Imóveis"));

    const btnConfirmar = screen.getByRole("button", { name: /confirmar transferência/i });
    expect(btnConfirmar).not.toBeDisabled();

    fireEvent.click(btnConfirmar);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith("lead-456", "broker-2", "Mariana Imóveis");
    });
  });
});
