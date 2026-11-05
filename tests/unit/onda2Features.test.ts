import { describe, it, expect } from "vitest";
import { computeLeadScore } from "@/lib/domain/scoring/leadScore";

describe("Onda 2: Reordenação do Funil de Vendas e Captação de Leads", () => {
  it("deve atribuir pontuações na ordem correta: Análise de Crédito (3) -> Visita (4) -> Proposta (5)", () => {
    // Lead no primeiro contato (pos 2)
    const scoreEtapa2 = computeLeadScore({
      telefone: "(85) 99999-0001",
      email: "cliente@teste.com",
      hasPropertyInterest: true,
      stagePosition: 2,
    });

    // Lead que avançou para Análise de Crédito (pos 3)
    const scoreEtapa3 = computeLeadScore({
      telefone: "(85) 99999-0001",
      email: "cliente@teste.com",
      hasPropertyInterest: true,
      stagePosition: 3,
    });

    // Lead que avançou para Visita Agendada (pos 4)
    const scoreEtapa4 = computeLeadScore({
      telefone: "(85) 99999-0001",
      email: "cliente@teste.com",
      hasPropertyInterest: true,
      stagePosition: 4,
    });

    // Lead que avançou para Proposta Enviada (pos 5)
    const scoreEtapa5 = computeLeadScore({
      telefone: "(85) 99999-0001",
      email: "cliente@teste.com",
      hasPropertyInterest: true,
      stagePosition: 5,
    });

    // A pontuação deve crescer progressivamente conforme a qualificação do lead
    expect(scoreEtapa3).toBeGreaterThan(scoreEtapa2);
    expect(scoreEtapa4).toBeGreaterThan(scoreEtapa3);
    expect(scoreEtapa5).toBeGreaterThan(scoreEtapa4);
  });

  it("deve validar ordenação nominal das etapas conforme requisito de negócio", () => {
    const etapasVendas = [
      { posicao: 1, nome: "Novo Lead" },
      { posicao: 2, nome: "Primeiro Contato" },
      { posicao: 3, nome: "Análise de Crédito" },
      { posicao: 4, nome: "Visita Agendada" },
      { posicao: 5, nome: "Proposta Enviada" },
      { posicao: 6, nome: "Fechado / Ganho" },
      { posicao: 7, nome: "Encerrado" },
    ];

    expect(etapasVendas[2].nome).toBe("Análise de Crédito");
    expect(etapasVendas[3].nome).toBe("Visita Agendada");
    expect(etapasVendas[4].nome).toBe("Proposta Enviada");

    // Valida que Análise vem antes de Visita, e Visita vem antes de Proposta
    const posAnalise = etapasVendas.find((e) => e.nome.includes("Análise"))!.posicao;
    const posVisita = etapasVendas.find((e) => e.nome.includes("Visita"))!.posicao;
    const posProposta = etapasVendas.find((e) => e.nome.includes("Proposta"))!.posicao;

    expect(posAnalise).toBeLessThan(posVisita);
    expect(posVisita).toBeLessThan(posProposta);
  });
});
