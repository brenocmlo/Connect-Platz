import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CreditEmploymentType, CorretorStatus, Role, User } from "@prisma/client";
import {
  computeLeadScore,
  temperatureFromScore,
  mergeScoreRules,
  DEFAULT_SCORE_RULES,
} from "@/lib/domain/scoring/leadScore";
import {
  CltCreditPolicy,
  AutonomoCreditPolicy,
  CreditPolicyRegistry,
} from "@/lib/domain/credit/CreditPolicies";
import { IngestLeadUseCase } from "@/lib/application/usecases/IngestLeadUseCase";
import { DistributeLeadUseCase } from "@/lib/application/usecases/DistributeLeadUseCase";
import { RoundRobinDistributionStrategy } from "@/lib/domain/distribution/RoundRobinDistributionStrategy";
import { ILeadRepository } from "@/lib/core/interfaces/ILeadRepository";
import { IUserRepository } from "@/lib/core/interfaces/IUserRepository";
import {
  formatPropertyPrice,
  formatCardPriceLabel,
  propertySpecs,
  propertyPublicUrl,
  getModalityBadgeMeta,
  buildFichaText,
} from "@/components/crm/properties/propertyFicha";
import { initUtmCapture, getCapturedUtmData } from "@/lib/tracking/utmCapture";
import {
  optionalMoney,
  parsePhone,
  parseDate,
  mergeBairros,
  CreateLeadSchema,
} from "@/app/api/leads/_lib/leadPayload";

vi.mock("@/lib/services/lead-score", () => ({
  refreshLeadScore: vi.fn().mockResolvedValue({ score: 45, temperatura: "MORNO" }),
}));

function makeBroker(id: string, role: Role): User {
  return {
    id,
    organizationId: "org-1",
    nome: id === "b-venda" ? "Lucas Vendas" : "Juliana Aluguel",
    email: `${id}@connectplatz.com.br`,
    passwordHash: "hash",
    role,
    telefone: "85999990000",
    creci: null,
    bio: null,
    photoUrl: null,
    status: CorretorStatus.DISPONIVEL,
    isActive: true,
    lastLeadAssignedAt: null,
    emergencyResetToken: null,
    emergencyResetExpiresAt: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  } as User;
}

describe("Regras de Negócio — Connect Platz CRM", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("1. Score Determinístico e Temperatura de Leads", () => {
    it("calcula pontuação exata por critério e aplica teto máximo de 100", () => {
      const t0 = new Date("2026-11-18T10:00:00Z");
      const tFast = new Date("2026-11-18T10:03:00Z");
      const scoreFull = computeLeadScore({
        telefone: "85991234567",
        email: "cliente@connectplatz.com.br",
        hasPropertyInterest: true,
        rendaDeclarada: 15000,
        createdAt: t0,
        firstContactAt: tFast,
        documentsCount: 2,
        stagePosition: 5,
      });
      expect(scoreFull).toBe(100);

      const scorePartial = computeLeadScore({
        telefone: "85991234567",
        email: "c@x.com",
        rendaDeclarada: 5000,
        createdAt: t0,
        firstContactAt: new Date("2026-11-18T10:20:00Z"),
        stagePosition: 3,
      });
      // 10 (fone) + 5 (email) + 8 (renda parcial) + 8 (resp <=30m) + 8 (analise) = 39
      expect(scorePartial).toBe(39);
    });

    it("classifica temperatura (FRIO, MORNO, QUENTE) e permite regras customizadas", () => {
      expect(temperatureFromScore(39)).toBe("FRIO");
      expect(temperatureFromScore(40)).toBe("MORNO");
      expect(temperatureFromScore(74)).toBe("MORNO");
      expect(temperatureFromScore(75)).toBe("QUENTE");

      const custom = mergeScoreRules({ hotThreshold: 85, warmThreshold: 50 });
      expect(custom.phonePoints).toBe(DEFAULT_SCORE_RULES.phonePoints);
      expect(temperatureFromScore(80, custom)).toBe("MORNO");
      expect(temperatureFromScore(85, custom)).toBe("QUENTE");
    });
  });

  describe("2. Políticas de Qualificação de Crédito (CLT, Autônomo e Extensão OCP)", () => {
    it("valida regras CLT (renda > 0 e holerites obrigatórios)", () => {
      const policy = new CltCreditPolicy();
      expect(policy.supports(CreditEmploymentType.CLT)).toBe(true);
      expect(policy.validate({ employmentType: CreditEmploymentType.CLT, rendaDeclarada: 0, hasContracheques: false }).isValid).toBe(false);

      const valid = policy.validate({ employmentType: CreditEmploymentType.CLT, rendaDeclarada: 7500, hasContracheques: true });
      expect(valid.isValid).toBe(true);
      expect(valid.requiredDocuments[0]).toMatch(/contracheques/i);
    });

    it("valida regras Autônomo, registro dinâmico OCP e fallback seguro", () => {
      const autonomo = new AutonomoCreditPolicy();
      expect(autonomo.validate({ employmentType: CreditEmploymentType.AUTONOMO, rendaEspecificaAutonomo: 0, hasExtratosBancarios: false }).isValid).toBe(false);
      expect(autonomo.validate({ employmentType: CreditEmploymentType.AUTONOMO, rendaEspecificaAutonomo: 12000, hasExtratosBancarios: true }).isValid).toBe(true);

      const registry = new CreditPolicyRegistry();
      registry.registerPolicy({
        supports: (t) => t === CreditEmploymentType.EMPRESARIO,
        validate: () => ({ isValid: true, errors: [], requiredDocuments: ["Contrato Social", "DECORE"] }),
      });
      expect(registry.getPolicy(CreditEmploymentType.EMPRESARIO).validate({ employmentType: CreditEmploymentType.EMPRESARIO }).requiredDocuments).toContain("DECORE");
      expect(registry.getPolicy(CreditEmploymentType.APOSENTADO_PENSIONISTA).validate({ employmentType: CreditEmploymentType.APOSENTADO_PENSIONISTA }).isValid).toBe(true);
    });
  });

  describe("3. Ingestão de Leads, Deduplicação, Fila Noturna e Modalidade", () => {
    const createMocks = () => {
      const leadRepo: ILeadRepository = {
        findById: vi.fn(),
        findDuplicate: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(async (data) => ({ id: "lead-new", ...data })),
        update: vi.fn(),
        addTimeline: vi.fn().mockResolvedValue({} as any),
        findExpiredSlaLeads: vi.fn().mockResolvedValue([]),
        findInactiveLeads: vi.fn().mockResolvedValue([]),
        findManyWithFilter: vi.fn().mockResolvedValue([]),
      };
      const userRepo: IUserRepository = {
        findByEmail: vi.fn(),
        findById: vi.fn(),
        create: vi.fn(),
        updateStatus: vi.fn(),
        updateLastLeadAssignedAt: vi.fn().mockResolvedValue({} as any),
        findEligibleCorretores: vi.fn().mockResolvedValue([]),
        registerCheckIn: vi.fn(),
        hasCheckedInToday: vi.fn(),
      };
      const distribute = new DistributeLeadUseCase(userRepo, new RoundRobinDistributionStrategy());
      const ingest = new IngestLeadUseCase(leadRepo, distribute);
      return { leadRepo, userRepo, distribute, ingest };
    };

    it("rejeita lead sem telefone e sem e-mail quando allowMissingContact é falso", async () => {
      const { ingest } = createMocks();
      await expect(
        ingest.execute({ organizationId: "org-1", funnelId: "f-1", stageId: "s-1", nome: "Sem Contato", telefone: "" })
      ).rejects.toThrow(/ao menos telefone ou e-mail/i);
    });

    it("deduplica lead reincidente registrando RECAPTURA na timeline sem duplicar cadastro", async () => {
      const { leadRepo, ingest } = createMocks();
      (leadRepo.findDuplicate as any).mockResolvedValue({ id: "lead-old", corretor: { nome: "Lucas Vendas" } });

      const res = await ingest.execute({
        organizationId: "org-1",
        funnelId: "f-1",
        stageId: "s-1",
        nome: "Cliente Recorrente",
        telefone: "(85) 99988-7766",
        campaignName: "Campanha Meireles",
        mensagem: "Quero planta de 3 quartos",
      });

      expect(res.isDuplicate).toBe(true);
      expect(leadRepo.create).not.toHaveBeenCalled();
      expect(leadRepo.addTimeline).toHaveBeenCalledWith(
        expect.objectContaining({ leadId: "lead-old", conteudo: expect.stringContaining("RECAPTURA") })
      );
    });

    it("distribui por modalidade na janela operacional, envia ao bolsão sem corretor compatível e retém na fila noturna fora do horário", async () => {
      const { leadRepo, userRepo, distribute, ingest } = createMocks();
      const brokerAluguel = makeBroker("b-aluguel", Role.CORRETOR_ALUGUEL);
      const brokerVenda = makeBroker("b-venda", Role.CORRETOR_VENDA);

      vi.spyOn(distribute, "isWithinOperatingHours").mockReturnValue(true);
      (userRepo.findEligibleCorretores as any).mockResolvedValue([brokerVenda, brokerAluguel]);

      const resAluguel = await ingest.execute({
        organizationId: "org-1",
        funnelId: "f-aluguel",
        stageId: "s-1",
        modalidade: "ALUGUEL",
        nome: "Locatário",
        telefone: "85988887777",
      });
      expect(resAluguel.isDuplicate).toBe(false);
      expect(leadRepo.create).toHaveBeenCalledWith(expect.objectContaining({ corretorId: "b-aluguel", modalidade: "ALUGUEL", isBolsao: false }));

      (userRepo.findEligibleCorretores as any).mockResolvedValue([brokerVenda]);
      await ingest.execute({ organizationId: "org-1", funnelId: "f-aluguel", stageId: "s-1", modalidade: "ALUGUEL", nome: "Sem Corretor Aluguel", telefone: "85988886666" });
      expect(leadRepo.create).toHaveBeenLastCalledWith(expect.objectContaining({ corretorId: null, isBolsao: true, isNightQueue: false }));

      vi.spyOn(distribute, "isWithinOperatingHours").mockReturnValue(false);
      await ingest.execute({ organizationId: "org-1", funnelId: "f-1", stageId: "s-1", modalidade: "VENDA", nome: "Madrugada", telefone: "85988885555" });
      expect(leadRepo.create).toHaveBeenLastCalledWith(expect.objectContaining({ isNightQueue: true, isBolsao: false, slaDueAt: null }));
    });
  });

  describe("4. Precificação, Specs, Badges e Ficha Comercial de Imóveis", () => {
    it("formata preços e labels para Venda, Locação Anual, Temporada, Repasse e fallback", () => {
      expect(formatPropertyPrice({ id: "1", nome: "A", modalidade: "VENDA", valorVenda: 850000 })).toContain("850.000");
      expect(formatPropertyPrice({ id: "2", nome: "B", modalidade: "LOCACAO_ANUAL", valorAluguel: 3500 })).toContain("/mês");
      expect(formatPropertyPrice({ id: "3", nome: "C", modalidade: "VERANEIO_TEMPORADA", valorDiaria: 1200 })).toContain("/dia");
      expect(formatPropertyPrice({ id: "4", nome: "D", modalidade: "REPASSE", valorRepasse: 95000 })).toContain("Repasse");
      expect(formatPropertyPrice({ id: "5", nome: "E", modalidade: "VENDA" })).toBe("Consulte valores");

      expect(formatCardPriceLabel({ id: "1", nome: "Emp", tipoCadastro: "EMPREENDIMENTO", valorVenda: 500000 })).toMatch(/^A partir de /);
      expect(formatCardPriceLabel({ id: "2", nome: "Avulso", tipoCadastro: "AVULSO", valorVenda: 500000 })).not.toMatch(/^A partir de /);
    });

    it("preserva zero em especificações, gera URL pública e monta ficha com taxa de limpeza", () => {
      const specs = propertySpecs({ id: "1", nome: "Studio", caracteristicas: { area_m2: 38, quartos: 1, suites: 0, vagas: 1 } });
      expect(specs.find((s) => s.key === "suites")?.value).toBe("0");

      expect(propertyPublicUrl({ id: "1", nome: "Casa", slug: "casa-mar", exibirNaLandingPage: true }, "https://cp.com")).toBe("https://cp.com/?imovel=casa-mar#vitrine");
      expect(propertyPublicUrl({ id: "1", nome: "Oculta", slug: "oculta", exibirNaLandingPage: false }, "https://cp.com")).toBeNull();
      expect(getModalityBadgeMeta("REPASSE").label).toContain("Repasse");

      const ficha = buildFichaText(
        { id: "t1", nome: "Villa Praia", modalidade: "VERANEIO_TEMPORADA", valorDiaria: 950, taxaLimpeza: 200, cidade: "Aquiraz", estado: "CE" },
        "https://cp.com"
      );
      expect(ficha).toContain("Villa Praia");
      expect(ficha).toContain("Taxa de Limpeza");
    });
  });

  describe("5. Captura UTM & Payload de Leads", () => {
    it("persiste parâmetros UTM, propertyId, propertyNome e cookies Meta (_fbp/_fbc)", () => {
      sessionStorage.clear();
      document.cookie = "_fbp=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = "_fbc=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      window.history.replaceState({}, "", "/?utm_source=meta&utm_medium=cpc&utm_campaign=porto&propertyId=p-77&propertyNome=Villa%20Platz&fbclid=fbclid-99");

      const captured = initUtmCapture();
      expect(captured).toMatchObject({ utmSource: "meta", utmMedium: "cpc", utmCampaign: "porto", propertyId: "p-77", propertyNome: "Villa Platz" });
      expect(captured.fbp).toMatch(/^fb\.1\./);
      expect(captured.fbc).toContain("fbclid-99");
      expect(getCapturedUtmData().propertyId).toBe("p-77");
    });

    it("normaliza valores monetários BR, telefone, datas e schema CreateLeadSchema", () => {
      expect(optionalMoney.parse("R$ 12.500,50")).toBe(12500.5);
      expect(parsePhone("+55 (85) 99123-4567")).toBe("85991234567");
      expect(parsePhone("123")).toBeNull();
      expect(parseDate("25/11/2026")?.toISOString()).toBe("2026-11-25T00:00:00.000Z");
      expect(mergeBairros(["Meireles"], "Aldeota", "Meireles")).toEqual(["Meireles", "Aldeota"]);

      const parsed = CreateLeadSchema.safeParse({
        nome: "Ana Silva",
        telefone: "(85) 99988-7766",
        modalidade: "ALUGUEL",
        empreendimentoInteresse: "Villa Platz",
        rendaDeclarada: "R$ 8.500,00",
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) expect(parsed.data.rendaDeclarada).toBe(8500);
    });
  });
});
