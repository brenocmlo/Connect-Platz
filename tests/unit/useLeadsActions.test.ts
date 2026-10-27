import { describe, it, expect, vi } from "vitest";
import { useLeadsActions } from "@/components/crm/leads/useLeadsActions";
import { LeadDetail } from "@/components/crm/LeadDrawer";
import { FunnelColumn } from "@/components/crm/leads/KanbanBoard";

vi.mock("@/components/crm/leads/leadsApi", () => ({
  patchLead: vi.fn().mockImplementation((id, patch) => Promise.resolve({ id, ...patch, nome: "doca pereira" })),
  deleteLead: vi.fn().mockResolvedValue({ success: true }),
  createLead: vi.fn().mockResolvedValue({ id: "new-lead" }),
  addTimelineEntry: vi.fn().mockResolvedValue({ id: "tl-1" }),
}));

describe("useLeadsActions — Gatilhos de Etapa", () => {
  const mockLead: LeadDetail = {
    id: "lead-1",
    stageId: "stage-novo",
    nome: "doca pereira",
    telefone: "85988335991",
    temperatura: "QUENTE",
    source: "MANUAL",
  };

  const mockStages: FunnelColumn[] = [
    { id: "stage-novo", nome: "Novo Lead", posicao: 1, cor: "#1266C7", slaMinutes: 20 },
    { id: "stage-visita", nome: "Visita Agendada", posicao: 2, cor: "#D97706", slaMinutes: 1440 },
    { id: "stage-ganho", nome: "Fechado / Ganho", posicao: 3, cor: "#22C55E", slaMinutes: null },
  ];

  it("Abre modal de agendamento na agenda ao mover lead para etapa com 'Visita'", async () => {
    const onPromptAppointment = vi.fn();
    const onPromptSale = vi.fn();
    const setLeads = vi.fn();
    const replaceLead = vi.fn();
    const notify = vi.fn();

    const actions = useLeadsActions({
      leads: [mockLead],
      setLeads,
      stages: mockStages,
      funnelId: "funnel-1",
      selectedLead: null,
      setSelectedLead: vi.fn(),
      replaceLead,
      notify,
      onPromptAppointment,
      onPromptSale,
    });

    await actions.handleChangeStage("lead-1", "stage-visita");
    expect(onPromptAppointment).toHaveBeenCalledTimes(1);
    expect(onPromptAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ id: "lead-1", stageId: "stage-visita" })
    );
    expect(onPromptSale).not.toHaveBeenCalled();
  });

  it("Abre modal de venda ao mover lead para etapa Ganho/Fechado", async () => {
    const onPromptAppointment = vi.fn();
    const onPromptSale = vi.fn();

    const actions = useLeadsActions({
      leads: [mockLead],
      setLeads: vi.fn(),
      stages: mockStages,
      funnelId: "funnel-1",
      selectedLead: null,
      setSelectedLead: vi.fn(),
      replaceLead: vi.fn(),
      notify: vi.fn(),
      onPromptAppointment,
      onPromptSale,
    });

    await actions.handleChangeStage("lead-1", "stage-ganho");
    expect(onPromptSale).toHaveBeenCalledTimes(1);
    expect(onPromptAppointment).not.toHaveBeenCalled();
  });
});
