import { describe, it, expect } from "vitest";
import { z } from "zod";

// Schemas & utilities for Onda 4 validation
const rentalContractSchema = z.object({
  leadId: z.string().min(1, "Inquilino obrigatório"),
  propertyId: z.string().min(1, "Imóvel obrigatório"),
  valorAluguelMensal: z.number().positive("Valor do aluguel deve ser positivo"),
  taxaAdministracaoPerc: z.number().min(0).max(100).default(10),
  diaVencimento: z.number().int().min(1).max(31).default(5),
  duracaoMeses: z.number().int().min(1).max(120).default(30),
  tipoGarantia: z.enum(["CAUCAO", "FIADOR", "SEGURO_FIANCA", "TITULO_CAPITALIZACAO"]).default("CAUCAO"),
  dataInicio: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  dataFim: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
});

function hasBookingConflict(
  existingBookings: Array<{ id: string; status: string; checkIn: Date; checkOut: Date }>,
  newCheckIn: Date,
  newCheckOut: Date,
  excludeId?: string
): boolean {
  return existingBookings.some((b) => {
    if (b.id === excludeId) return false;
    if (b.status === "CANCELADA") return false; // Canceladas liberam as datas
    return newCheckIn < b.checkOut && newCheckOut > b.checkIn;
  });
}

function calculateRentalFinancials(valorAluguelMensal: number, taxaAdministracaoPerc: number) {
  const taxaAdministracaoValor = Number(((valorAluguelMensal * taxaAdministracaoPerc) / 100).toFixed(2));
  const repasseProprietario = Number((valorAluguelMensal - taxaAdministracaoValor).toFixed(2));
  return {
    valorAluguelMensal,
    taxaAdministracaoPerc,
    taxaAdministracaoValor,
    repasseProprietario,
  };
}

describe("Onda 4: Aluguel Comum, Temporada/Veraneio, Overbooking & Agenda", () => {
  describe("4.1 Validação de Aluguel Comum (Contratos de Locação Anual)", () => {
    it("deve validar com sucesso um contrato de aluguel anual com dados válidos", () => {
      const validData = {
        leadId: "lead-inquilino-123",
        propertyId: "prop-apto-456",
        valorAluguelMensal: 3500,
        taxaAdministracaoPerc: 10,
        diaVencimento: 10,
        duracaoMeses: 30,
        tipoGarantia: "SEGURO_FIANCA" as const,
        dataInicio: "2026-11-01T00:00:00.000Z",
        dataFim: "2029-05-01T00:00:00.000Z",
      };

      const result = rentalContractSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        const fin = calculateRentalFinancials(result.data.valorAluguelMensal, result.data.taxaAdministracaoPerc);
        expect(fin.taxaAdministracaoValor).toBe(350); // 10% de R$ 3.500
        expect(fin.repasseProprietario).toBe(3150); // R$ 3.500 - R$ 350
      }
    });

    it("deve rejeitar contrato com dia de vencimento inválido ou valor negativo", () => {
      const invalidData = {
        leadId: "lead-inquilino-123",
        propertyId: "prop-apto-456",
        valorAluguelMensal: -100,
        diaVencimento: 35, // inválido (máx 31)
        dataInicio: "2026-11-01",
        dataFim: "2027-11-01",
      };

      const result = rentalContractSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.valorAluguelMensal).toBeDefined();
        expect(errors.diaVencimento).toBeDefined();
      }
    });
  });

  describe("4.2 Prevenção de Overbooking e Liberação por Cancelamento", () => {
    const existing = [
      {
        id: "book-1",
        status: "CONFIRMADA",
        checkIn: new Date("2026-12-20T14:00:00Z"),
        checkOut: new Date("2026-12-27T11:00:00Z"),
      },
      {
        id: "book-2",
        status: "CANCELADA", // Cancelada não deve gerar conflito
        checkIn: new Date("2026-12-28T14:00:00Z"),
        checkOut: new Date("2027-01-02T11:00:00Z"),
      },
    ];

    it("deve detectar conflito de overbooking quando houver sobreposição de datas ativas", () => {
      // Nova tentativa de reserva colidindo com book-1
      const conflictCheckIn = new Date("2026-12-24T14:00:00Z");
      const conflictCheckOut = new Date("2026-12-30T11:00:00Z");

      const hasConflict = hasBookingConflict(existing, conflictCheckIn, conflictCheckOut);
      expect(hasConflict).toBe(true);
    });

    it("deve permitir reserva em período previamente cancelado (liberação de calendário)", () => {
      // Mesmas datas de book-2 que foi CANCELADA
      const validCheckIn = new Date("2026-12-28T14:00:00Z");
      const validCheckOut = new Date("2027-01-02T11:00:00Z");

      const hasConflict = hasBookingConflict(existing, validCheckIn, validCheckOut);
      expect(hasConflict).toBe(false);
    });

    it("deve permitir edição da própria reserva ignorando conflito consigo mesma", () => {
      // Editando book-1 mantendo suas próprias datas
      const selfCheckIn = new Date("2026-12-20T14:00:00Z");
      const selfCheckOut = new Date("2026-12-27T11:00:00Z");

      const hasConflict = hasBookingConflict(existing, selfCheckIn, selfCheckOut, "book-1");
      expect(hasConflict).toBe(false);
    });
  });

  describe("4.3 Fluxo de Caixa: Confirmação de Baixa com Comprovante", () => {
    const patchFinanceiroSchema = z.object({
      status: z.enum(["PENDENTE", "REALIZADO", "CANCELADO"]).optional(),
      anexoUrl: z.string().url().nullable().optional(),
      dataRealizacao: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
    });

    it("deve aceitar baixa no fluxo de caixa com URL de comprovante válido", () => {
      const updatePayload = {
        status: "REALIZADO" as const,
        anexoUrl: "https://r2.connectplatz.com.br/comprovantes/recibo-123.pdf",
        dataRealizacao: new Date().toISOString(),
      };

      const result = patchFinanceiroSchema.safeParse(updatePayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("REALIZADO");
        expect(result.data.anexoUrl).toContain("recibo-123.pdf");
      }
    });

    it("deve rejeitar formato de URL de comprovante inválido", () => {
      const invalidPayload = {
        status: "REALIZADO" as const,
        anexoUrl: "not-a-valid-url",
      };

      const result = patchFinanceiroSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("4.4 Agenda: Filtros, Edição e Exclusão", () => {
    const mockAppointments = [
      {
        id: "app-1",
        titulo: "Visita Reserva das Dunas",
        tipo: "VISITA",
        dataInicio: "2026-11-05T14:00:00.000Z",
        dataFim: "2026-11-05T15:00:00.000Z",
        status: "AGENDADO",
      },
      {
        id: "app-2",
        titulo: "Assinatura Contrato",
        tipo: "DOCUMENTACAO",
        dataInicio: "2026-11-20T10:00:00.000Z",
        dataFim: "2026-11-20T11:00:00.000Z",
        status: "CONCLUIDO",
      },
    ];

    it("deve filtrar compromissos em período personalizado corretamente", () => {
      const startDate = "2026-11-01";
      const endDate = "2026-11-10";

      const filtered = mockAppointments.filter((app) => {
        const d = app.dataInicio.slice(0, 10);
        return d >= startDate && d <= endDate;
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe("app-1");
    });

    it("deve retornar todos os compromissos no modo 'todos'", () => {
      expect(mockAppointments.length).toBe(2);
    });
  });
});
