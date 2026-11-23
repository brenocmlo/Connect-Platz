import { expect, test, type Page } from "@playwright/test";
import { createAdminCookie, mockAllApis } from "./mobileMocks";

const VIEWPORTS = [
  { name: "mobile-se", width: 320, height: 568 },
  { name: "mobile-iphone", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
] as const;

const CRM_ROUTES = [
  "/crm",
  "/crm/leads",
  "/crm/agenda",
  "/crm/whatsapp",
  "/crm/vendas",
  "/crm/temporada",
  "/crm/fluxo-de-caixa",
  "/crm/empreendimentos",
  "/crm/ranking",
  "/crm/ranking/tv",
  "/crm/relatorios",
  "/crm/equipes",
  "/crm/integracoes",
  "/crm/auditoria",
  "/crm/configuracoes",
];

async function assertNoHorizontalOverflow(page: Page, label: string) {
  const m = await page.evaluate(() => ({
    docWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(m.docWidth, `${label}: docWidth (${m.docWidth}) > innerWidth (${m.innerWidth})`).toBeLessThanOrEqual(
    m.innerWidth
  );
  expect(m.bodyWidth, `${label}: bodyWidth (${m.bodyWidth}) > innerWidth (${m.innerWidth})`).toBeLessThanOrEqual(
    m.innerWidth
  );
}

async function assertInsideViewport(page: Page, box: { x: number; width: number } | null, label: string) {
  expect(box, `${label}: elemento nao encontrado`).not.toBeNull();
  if (!box) return;
  const vw = page.viewportSize()?.width ?? 0;
  expect(box.x, `${label}: x negativo (${box.x})`).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width, `${label}: estoura direita (${box.x + box.width} > ${vw})`).toBeLessThanOrEqual(vw + 1);
}

async function authenticateCrm(page: Page, baseURL: string) {
  await mockAllApis(page);
  await page.context().addCookies([createAdminCookie(baseURL)]);
}

test.describe("Landing Page & Public Routes - Mobile First", () => {
  for (const vp of VIEWPORTS) {
    test(`Landing (/) sem overflow em ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      test.setTimeout(90_000);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await mockAllApis(page);

      const res = await page.goto("/", { waitUntil: "domcontentloaded" });
      expect(res?.status()).toBeLessThan(400);
      await page.waitForTimeout(500);
      await assertNoHorizontalOverflow(page, `/ @ ${vp.name}`);

      const heroTablist = page.getByRole("tablist", { name: "Modalidade" });
      for (const tabLabel of ["Comprar", "Alugar", "Temporada", "Repasses"]) {
        const tab = heroTablist.getByRole("tab", { name: tabLabel });
        await expect(tab).toBeVisible();
        await assertInsideViewport(page, await tab.boundingBox(), `Hero tab ${tabLabel} @ ${vp.name}`);
      }

      if (vp.width < 768) {
        const openMenuBtn = page.getByRole("button", { name: /abrir menu/i });
        if (await openMenuBtn.isVisible()) {
          await openMenuBtn.click();
          await page.waitForTimeout(250);
          await assertNoHorizontalOverflow(page, `/ mobile menu aberto @ ${vp.name}`);
          const closeBtn = page.getByRole("button", { name: /fechar menu/i });
          if (await closeBtn.isVisible()) await closeBtn.click();
        }
      }

      const gridToggle = page.getByRole("button", { name: /ver em grade/i }).first();
      if (await gridToggle.isVisible()) {
        await gridToggle.click();
        await page.waitForTimeout(200);
        await assertNoHorizontalOverflow(page, `/ listings grade @ ${vp.name}`);
      }

      const footer = page.locator("footer").first();
      if (await footer.count()) {
        await footer.scrollIntoViewIfNeeded();
        await assertNoHorizontalOverflow(page, `/ footer @ ${vp.name}`);
      }

      const contactBtn = page.getByRole("button", { name: /falar com especialista|agendar atendimento|contato/i }).first();
      if (await contactBtn.isVisible()) {
        await contactBtn.click();
        await page.waitForTimeout(250);
        await assertNoHorizontalOverflow(page, `/ modal contato @ ${vp.name}`);
        await page.keyboard.press("Escape").catch(() => {});
      }
    });
  }

  test("Login (/login) e catalogo sem overflow em 320px e 375px", async ({ page }) => {
    test.setTimeout(90_000);
    await mockAllApis(page);
    for (const vp of VIEWPORTS.slice(0, 2)) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/login", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(300);
      await assertNoHorizontalOverflow(page, `/login @ ${vp.name}`);
      const submit = page.getByRole("button", { name: /entrar/i });
      await expect(submit).toBeVisible();
      await assertInsideViewport(page, await submit.boundingBox(), `Botao entrar @ ${vp.name}`);

      await page.goto("/imoveis/villa-platz-residence", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(300);
      await assertNoHorizontalOverflow(page, `/imoveis/villa-platz-residence @ ${vp.name}`);
    }
  });
});

test.describe("CRM Shell Navigation & Interactive Mobile Checks", () => {
  test("BottomBar, Sidebar off-canvas e popovers dentro da viewport (320px vs 768px)", async ({ page, baseURL }) => {
    test.setTimeout(90_000);
    await authenticateCrm(page, baseURL || "http://localhost:3010");
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/crm", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    const sidebar = page.locator("aside").first();
    const sidebarBoxClosed = await sidebar.boundingBox();
    expect((sidebarBoxClosed?.x ?? 0) + (sidebarBoxClosed?.width ?? 0)).toBeLessThanOrEqual(5);

    const menuTrigger = page.getByRole("button", { name: /menu/i }).last();
    await expect(menuTrigger).toBeVisible();
    await menuTrigger.click();
    await page.waitForTimeout(450);
    const sidebarBoxOpen = await sidebar.boundingBox();
    expect(sidebarBoxOpen?.x ?? -10).toBeGreaterThanOrEqual(-0.5);
    await page.mouse.click(280, 200);
    await page.waitForTimeout(350);

    const periodBtn = page.locator("button", { hasText: /Mês atual|Todos|Hoje|Personalizado/i }).first();
    if (await periodBtn.isVisible()) {
      await periodBtn.click();
      await page.waitForTimeout(200);
      await assertNoHorizontalOverflow(page, "PeriodSelector aberto @ 320px");
      await periodBtn.click();
    }

    const bellBtn = page.getByRole("button", { name: /notifica/i }).first();
    if (await bellBtn.isVisible()) {
      await bellBtn.click();
      await page.waitForTimeout(200);
      await assertNoHorizontalOverflow(page, "NotificationPopover aberto @ 320px");
      await bellBtn.click();
    }

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(250);
    await expect(page.locator("nav.md\\:hidden")).toBeHidden();
  });
});

test.describe("CRM All Routes Zero Horizontal Overflow Matrix", () => {
  for (const vp of VIEWPORTS) {
    test(`Todas as rotas do CRM sem overflow horizontal em ${vp.name} (${vp.width}x${vp.height})`, async ({
      page,
      baseURL,
    }) => {
      test.setTimeout(120_000);
      await authenticateCrm(page, baseURL || "http://localhost:3010");
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const route of CRM_ROUTES) {
        const res = await page.goto(route, { waitUntil: "domcontentloaded" });
        expect(res?.status(), `${route} status`).toBeLessThan(400);
        await page.waitForTimeout(350);
        await assertNoHorizontalOverflow(page, `${route} @ ${vp.name}`);
      }
    });
  }
});

test.describe("CRM Interactive Views & Modals - Mobile 375x812 & 320x568", () => {
  test("Leads Drawer, Lista, Agenda views, Financeiro DRE, Empreendimentos e Configuracoes", async ({
    page,
    baseURL,
  }) => {
    test.setTimeout(120_000);
    await authenticateCrm(page, baseURL || "http://localhost:3010");
    await page.setViewportSize({ width: 320, height: 568 });

    await page.goto("/crm/leads", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(450);
    await assertNoHorizontalOverflow(page, "/crm/leads Kanban @ 320px");

    const listBtn = page.getByRole("button", { name: /^lista$/i }).first();
    if (await listBtn.isVisible()) {
      await listBtn.click();
      await page.waitForTimeout(250);
      await assertNoHorizontalOverflow(page, "/crm/leads Lista @ 320px");
    }

    const leadTitle = page.getByText("Mariana Albuquerque").first();
    if (await leadTitle.isVisible()) {
      await leadTitle.click();
      await page.waitForTimeout(250);
      await assertNoHorizontalOverflow(page, "LeadDrawer @ 320px");
      await page.keyboard.press("Escape").catch(() => {});
    }

    const novoLeadBtn = page.getByRole("button", { name: /novo lead/i }).first();
    if (await novoLeadBtn.isVisible()) {
      await novoLeadBtn.click();
      await page.waitForTimeout(250);
      await assertNoHorizontalOverflow(page, "NewLeadModal @ 320px");
      const closeModal = page.getByRole("button", { name: /cancelar|fechar/i }).first();
      if (await closeModal.isVisible()) await closeModal.click();
    }

    await page.goto("/crm/agenda", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    for (const viewLabel of [/^dia$/i, /^semana$/i, /^mês$/i, /^todos$/i]) {
      const viewBtn = page.getByRole("button", { name: viewLabel }).first();
      if (await viewBtn.isVisible()) {
        await viewBtn.click();
        await page.waitForTimeout(200);
        await assertNoHorizontalOverflow(page, `Agenda ${viewLabel} @ 320px`);
      }
    }

    await page.goto("/crm/fluxo-de-caixa", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    for (const tabText of [/DRE/i, /Proje/i]) {
      const btn = page.getByRole("button", { name: tabText }).first();
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(250);
        await assertNoHorizontalOverflow(page, `Fluxo ${tabText} @ 320px`);
      }
    }

    await page.goto("/crm/empreendimentos", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    const siteCfgBtn = page.getByRole("button", { name: /configurações.*site/i }).first();
    if (await siteCfgBtn.isVisible()) {
      await siteCfgBtn.click();
      await page.waitForTimeout(250);
      await assertNoHorizontalOverflow(page, "Empreendimentos SiteConfig @ 320px");
    }

    await page.goto("/crm/configuracoes", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    for (const tabText of [/Minha Conta/i, /Notifica/i, /Imobili/i, /SLA/i, /Score/i]) {
      const tab = page.getByRole("button", { name: tabText }).first();
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(250);
        await assertNoHorizontalOverflow(page, `Config ${tabText} @ 320px`);
      }
    }

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/crm/vendas", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    const novaVendaBtn = page.getByRole("button", { name: /nova venda/i }).first();
    if (await novaVendaBtn.isVisible()) {
      await novaVendaBtn.click();
      await page.waitForTimeout(250);
      await assertNoHorizontalOverflow(page, "NewSaleModal @ 375px");
    }
  });
});
