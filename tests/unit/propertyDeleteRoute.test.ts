import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const {
  mockFindFirst,
  mockDelete,
  mockUpdate,
  mockTransaction,
  mockRecordAudit,
  mockRevalidatePath,
  mockDeleteFromR2,
  mockRequireSession,
} = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockDelete: vi.fn(),
  mockUpdate: vi.fn(),
  mockTransaction: vi.fn(),
  mockRecordAudit: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockDeleteFromR2: vi.fn(),
  mockRequireSession: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("@/lib/services/audit-server", () => ({
  recordAudit: mockRecordAudit,
}));

vi.mock("@/lib/storage/r2Client", () => ({
  deleteFromR2: mockDeleteFromR2,
  extractR2KeyFromUrl: () => null,
}));

vi.mock("@/lib/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/session")>("@/lib/auth/session");
  return {
    ...actual,
    requireSession: mockRequireSession,
  };
});

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    property: {
      findFirst: mockFindFirst,
      delete: mockDelete,
      update: mockUpdate,
    },
    sale: { deleteMany: vi.fn() },
    seasonBooking: { deleteMany: vi.fn() },
    rentalContract: { deleteMany: vi.fn() },
    appointment: { updateMany: vi.fn() },
    propertyUnit: { deleteMany: vi.fn() },
    propertyMaterial: { deleteMany: vi.fn() },
    $transaction: mockTransaction,
  },
}));

import { DELETE, PATCH } from "@/app/api/properties/[id]/route";

const PROP_ID = "11111111-1111-4111-8111-111111111111";
const ORG_ID = "00000000-0000-0000-0000-000000000001";

function sessionFor(role: string) {
  return {
    error: null,
    session: {
      userId: "user-1",
      organizationId: ORG_ID,
      role,
      nome: "Gestor Teste",
      email: "gestor@connectplatz.com.br",
    },
  };
}

describe("DELETE /api/properties/[id] — Permissão Admin Venda vs Admin Aluguel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDelete.mockResolvedValue({ id: PROP_ID });
    mockUpdate.mockResolvedValue({ id: PROP_ID, isActive: false });
    mockTransaction.mockResolvedValue([]);
    mockRecordAudit.mockResolvedValue(undefined);
  });

  it("permite ADMINISTRADOR_VENDA apagar imóvel de VENDA e REPASSE", async () => {
    mockRequireSession.mockReturnValue(sessionFor("ADMINISTRADOR_VENDA"));
    mockFindFirst.mockResolvedValue({
      id: PROP_ID,
      nome: "Residencial Venda",
      modalidade: "VENDA",
      materials: [],
      _count: { sales: 0, bookings: 0, rentalContracts: 0 },
    });

    const req = new NextRequest(`http://localhost/api/properties/${PROP_ID}`, { method: "DELETE" });
    const res = await DELETE(req, { params: { id: PROP_ID } });
    expect(res.status).toBe(200);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: PROP_ID } });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/crm/empreendimentos");
  });

  it("bloqueia (403) ADMINISTRADOR_VENDA ao tentar apagar imóvel de VERANEIO_TEMPORADA", async () => {
    mockRequireSession.mockReturnValue(sessionFor("ADMINISTRADOR_VENDA"));
    mockFindFirst.mockResolvedValue({
      id: PROP_ID,
      nome: "Villa Praia Temporada",
      modalidade: "VERANEIO_TEMPORADA",
      materials: [],
      _count: { sales: 0, bookings: 0, rentalContracts: 0 },
    });

    const req = new NextRequest(`http://localhost/api/properties/${PROP_ID}`, { method: "DELETE" });
    const res = await DELETE(req, { params: { id: PROP_ID } });
    expect(res.status).toBe(403);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("permite ADMINISTRADOR_ALUGUEL apagar imóvel de VERANEIO_TEMPORADA e LOCACAO_ANUAL", async () => {
    mockRequireSession.mockReturnValue(sessionFor("ADMINISTRADOR_ALUGUEL"));
    mockFindFirst.mockResolvedValue({
      id: PROP_ID,
      nome: "Villa Temporada",
      modalidade: "LOCACAO_ANUAL",
      materials: [],
      _count: { sales: 0, bookings: 0, rentalContracts: 0 },
    });

    const req = new NextRequest(`http://localhost/api/properties/${PROP_ID}`, { method: "DELETE" });
    const res = await DELETE(req, { params: { id: PROP_ID } });
    expect(res.status).toBe(200);
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  it("bloqueia (403) ADMINISTRADOR_ALUGUEL ao tentar apagar imóvel de VENDA", async () => {
    mockRequireSession.mockReturnValue(sessionFor("ADMINISTRADOR_ALUGUEL"));
    mockFindFirst.mockResolvedValue({
      id: PROP_ID,
      nome: "Lançamento Venda",
      modalidade: "VENDA",
      materials: [],
      _count: { sales: 0, bookings: 0, rentalContracts: 0 },
    });

    const req = new NextRequest(`http://localhost/api/properties/${PROP_ID}`, { method: "DELETE" });
    const res = await DELETE(req, { params: { id: PROP_ID } });
    expect(res.status).toBe(403);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("desativa e revalida vitrine pública quando há reservas/vendas vinculadas sem ?permanent=true", async () => {
    mockRequireSession.mockReturnValue(sessionFor("ADMINISTRADOR_ALUGUEL"));
    mockFindFirst.mockResolvedValue({
      id: PROP_ID,
      nome: "Casa com Reservas",
      modalidade: "VERANEIO_TEMPORADA",
      materials: [],
      _count: { sales: 0, bookings: 2, rentalContracts: 0 },
    });

    const req = new NextRequest(`http://localhost/api/properties/${PROP_ID}`, { method: "DELETE" });
    const res = await DELETE(req, { params: { id: PROP_ID } });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.deactivated).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: PROP_ID },
      data: { isActive: false, exibirNaLandingPage: false },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/crm/empreendimentos");
  });

  it("permite exclusão definitiva (?permanent=true) pelo Admin Aluguel mesmo com vínculos", async () => {
    mockRequireSession.mockReturnValue(sessionFor("ADMINISTRADOR_ALUGUEL"));
    mockFindFirst.mockResolvedValue({
      id: PROP_ID,
      nome: "Casa com Reservas",
      modalidade: "VERANEIO_TEMPORADA",
      materials: [],
      _count: { sales: 0, bookings: 2, rentalContracts: 0 },
    });

    const req = new NextRequest(`http://localhost/api/properties/${PROP_ID}?permanent=true`, { method: "DELETE" });
    const res = await DELETE(req, { params: { id: PROP_ID } });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.deleted).toBe(true);
    expect(body.permanent).toBe(true);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
  });

  it("bloqueia (403) PATCH de imóvel de outra modalidade e permite na própria modalidade", async () => {
    mockRequireSession.mockReturnValue(sessionFor("ADMINISTRADOR_VENDA"));
    mockFindFirst.mockResolvedValue({
      id: PROP_ID,
      nome: "Apartamento Temporada",
      modalidade: "VERANEIO_TEMPORADA",
    });

    const deniedReq = new NextRequest(`http://localhost/api/properties/${PROP_ID}`, {
      method: "PATCH",
      body: JSON.stringify({ exibirNaLandingPage: false }),
    });
    const deniedRes = await PATCH(deniedReq, { params: { id: PROP_ID } });
    expect(deniedRes.status).toBe(403);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
