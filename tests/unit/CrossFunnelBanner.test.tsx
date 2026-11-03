import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CrossFunnelBanner } from "@/components/crm/leads/CrossFunnelBanner";
import { OtherFunnelMatch } from "@/components/crm/leads/leadsApi";

describe("CrossFunnelBanner Component", () => {
  const mockMatches: OtherFunnelMatch[] = [
    {
      id: "lead-1",
      nome: "Pedro Cifoni",
      telefone: "8582146667",
      funilId: "funil-locacoes",
      funilNome: "Funil de Locações & Temporada",
      stageNome: "Novo Lead Locação",
    },
  ];

  it("não deve renderizar nada se o array de matches estiver vazio", () => {
    const { container } = render(
      <CrossFunnelBanner
        matches={[]}
        currentFunnelId="funil-vendas"
        onGoToFunnel={vi.fn()}
        onMigrateLead={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("deve renderizar o banner com os dados do lead e botões de ação", () => {
    render(
      <CrossFunnelBanner
        matches={mockMatches}
        currentFunnelId="funil-vendas"
        onGoToFunnel={vi.fn()}
        onMigrateLead={vi.fn()}
      />
    );

    expect(screen.getByText("1 lead encontrado em outro funil:")).toBeInTheDocument();
    expect(screen.getByText("Pedro Cifoni")).toBeInTheDocument();
    expect(screen.getByText("Funil de Locações & Temporada")).toBeInTheDocument();
    expect(screen.getByText(/Novo Lead Locação/)).toBeInTheDocument();
  });

  it("deve disparar onGoToFunnel ao clicar em 'Ir para funil'", () => {
    const handleGoTo = vi.fn();
    render(
      <CrossFunnelBanner
        matches={mockMatches}
        currentFunnelId="funil-vendas"
        onGoToFunnel={handleGoTo}
        onMigrateLead={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Ir para funil"));
    expect(handleGoTo).toHaveBeenCalledWith("funil-locacoes", "lead-1");
  });

  it("deve disparar onMigrateLead ao clicar em 'Trazer para cá'", () => {
    const handleMigrate = vi.fn().mockResolvedValue(undefined);
    render(
      <CrossFunnelBanner
        matches={mockMatches}
        currentFunnelId="funil-vendas"
        onGoToFunnel={vi.fn()}
        onMigrateLead={handleMigrate}
      />
    );

    fireEvent.click(screen.getByText("Trazer para cá"));
    expect(handleMigrate).toHaveBeenCalledWith("lead-1", "funil-vendas");
  });
});
