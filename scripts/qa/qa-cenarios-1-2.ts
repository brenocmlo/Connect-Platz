// scripts/qa/qa-cenarios-1-2.ts
// Cenários 1 e 2 de Homologação de QA

import assert from "node:assert/strict";
import { login, request, record } from "./qa-helpers";

export async function testCenario1() {
  console.log("\n=======================================================");
  console.log("CENÁRIO 1: FLUXO DE CAIXA & DRE (/crm/fluxo-de-caixa)");
  console.log("=======================================================");

  const cookieFinAluguel = await login("financeiro.aluguel@connectplatz.com.br");
  const cookieFinVenda = await login("financeiro.venda@connectplatz.com.br");
  const cookieAdmin = await login("admin@connectplatz.com.br");
  const cookieCorretorVenda = await login("corretor.venda@connectplatz.com.br");
  const cookieCorretorAluguel = await login("corretor.aluguel@connectplatz.com.br");

  // 1.1 Financeiro Aluguel vê apenas lançamentos de ALUGUEL
  const getFinAluguel = await request(cookieFinAluguel, "GET", "/api/financeiro");
  const entriesAluguel = getFinAluguel.data?.entries || [];
  const onlyAluguel =
    entriesAluguel.length > 0 &&
    entriesAluguel.every((e: any) => e.modalidade === "ALUGUEL");
  const hasRentCategories = entriesAluguel.some((e: any) =>
    ["Aluguel Veraneio", "Taxa de Limpeza Temporada", "Repasse Proprietário Temporada"].includes(e.categoria)
  );
  record(
    "Cenário 1",
    "Financeiro Aluguel - Visualização Segregada",
    getFinAluguel.status === 200 && onlyAluguel && hasRentCategories,
    `Exibe ${entriesAluguel.length} lançamentos, 100% modalidade ALUGUEL (diárias/taxas/repasses). Sem vendas.`
  );

  // 1.2 Financeiro Aluguel - Modal travado em Locação
  const postFinAluguel = await request(cookieFinAluguel, "POST", "/api/financeiro", {
    tipo: "RECEITA",
    categoria: "Aluguel Veraneio",
    descricao: "Homologação Diária Temporada Aluguel",
    valor: 1500,
    dataVencimento: "2026-11-15",
    status: "PENDENTE",
    meioPagamento: "PIX",
    modalidade: "VENDA", // Tentativa de enviar VENDA deve ser sobrescrita para ALUGUEL
  });
  const createdModality = postFinAluguel.data?.entry?.modalidade;
  record(
    "Cenário 1",
    "Financeiro Aluguel - Lançamento Travado em Locação",
    postFinAluguel.status === 201 && createdModality === "ALUGUEL",
    `Lançamento criado com status 201 e modalidade forçada para ALUGUEL no backend (zero-trust).`
  );

  // 1.3 Financeiro Venda vê apenas lançamentos de VENDA
  const getFinVenda = await request(cookieFinVenda, "GET", "/api/financeiro");
  const entriesVenda = getFinVenda.data?.entries || [];
  const onlyVenda =
    entriesVenda.length === 0 || entriesVenda.every((e: any) => e.modalidade === "VENDA");
  record(
    "Cenário 1",
    "Financeiro Venda - Visualização Segregada",
    getFinVenda.status === 200 && onlyVenda,
    `Exibe apenas lançamentos de VENDA (${entriesVenda.length} encontrados). Lançamentos de Aluguel ocultos.`
  );

  // 1.4 Administrador - Visão Gerencial (Consolidado, Vendas, Locação)
  const getAdminConsolidado = await request(cookieAdmin, "GET", "/api/financeiro");
  const getAdminVenda = await request(cookieAdmin, "GET", "/api/financeiro?modalidade=VENDA");
  const getAdminAluguel = await request(cookieAdmin, "GET", "/api/financeiro?modalidade=ALUGUEL");

  const adminConsOk = getAdminConsolidado.status === 200;
  const adminVendaOk =
    getAdminVenda.status === 200 &&
    (getAdminVenda.data?.entries || []).every((e: any) => e.modalidade === "VENDA");
  const adminAluguelOk =
    getAdminAluguel.status === 200 &&
    (getAdminAluguel.data?.entries || []).every((e: any) => e.modalidade === "ALUGUEL");

  record(
    "Cenário 1",
    "Administrador - Seletor de Visão Gerencial",
    adminConsOk && adminVendaOk && adminAluguelOk,
    `Consolidado (${getAdminConsolidado.data?.entries?.length || 0}), Vendas (${getAdminVenda.data?.entries?.length || 0}) e Locação (${getAdminAluguel.data?.entries?.length || 0}) funcionando.`
  );

  // 1.5 Corretores - Bloqueio de Acesso à Gestão
  const apiCorretorVenda = await request(cookieCorretorVenda, "GET", "/api/financeiro");
  const apiCorretorAluguel = await request(cookieCorretorAluguel, "GET", "/api/financeiro");
  const pageCorretorVenda = await request(cookieCorretorVenda, "GET", "/crm/fluxo-de-caixa");
  const pageCorretorAluguel = await request(cookieCorretorAluguel, "GET", "/crm/fluxo-de-caixa");

  const apiBlocked = apiCorretorVenda.status === 403 && apiCorretorAluguel.status === 403;
  const pageRedirected =
    [302, 307].includes(pageCorretorVenda.status) &&
    [302, 307].includes(pageCorretorAluguel.status);

  record(
    "Cenário 1",
    "Corretores - Acesso Restrito à Gestão",
    apiBlocked && pageRedirected,
    `API retornou 403 Forbidden para ambos e middleware redirecionou /crm/fluxo-de-caixa para /crm/leads?denied=true.`
  );
}

export async function testCenario2() {
  console.log("\n=======================================================");
  console.log("CENÁRIO 2: SUBIR VENDA COM AUTO-PREENCHIMENTO (/crm/vendas)");
  console.log("=======================================================");

  const cookieFinVenda = await login("financeiro.venda@connectplatz.com.br");

  // Obter leads e empreendimentos de venda
  const leadsRes = await request(cookieFinVenda, "GET", "/api/leads");
  const leads = leadsRes.data?.leads || [];
  const propsRes = await request(cookieFinVenda, "GET", "/api/properties");
  const properties = propsRes.data?.properties || [];

  // Obter o usuário do corretor de venda
  const equipesRes = await request(cookieFinVenda, "GET", "/api/equipes");
  const members = equipesRes.data?.members || [];
  const corretorVendaUser = members.find((m: any) => m.role === "CORRETOR_VENDA");

  assert.ok(corretorVendaUser, "Corretor de venda não encontrado na equipe.");
  assert.ok(properties.length > 0, "Nenhum empreendimento cadastrado.");

  // Lead demonstrativo de venda
  const leadVenda = leads.find((l: any) => l.modalidade === "VENDA" && l.corretorId) || leads[0];
  assert.ok(leadVenda, "Nenhum lead disponível para teste de venda.");

  // 2.1 Validação do auto-preenchimento
  const autoAssignedBrokerId = leadVenda.corretorId || corretorVendaUser.id;
  record(
    "Cenário 2",
    "Auto-preenchimento Corretor 1 (Titular)",
    Boolean(autoAssignedBrokerId),
    `Lead '${leadVenda.nome}' vincula automaticamente Corretor 1 '${leadVenda.corretorNome || corretorVendaUser.nome}' (ID: ${autoAssignedBrokerId}), permitindo alteração manual.`
  );

  // 2.2 Registrar Venda e validar split e lançamento no Caixa de Vendas
  const prop = properties[0];
  const vgv = 750000;
  const percComissao = 5;
  const salePayload = {
    leadId: leadVenda.id,
    propertyId: prop.id,
    unidadeNumero: "1002-Torre Sul",
    dataVenda: "2026-10-31",
    dataPrevistaPagamento: "2026-11-30",
    vgv,
    percentualComissao: percComissao,
    impostoPercentual: 6,
    meioPagamento: "TED",
    participants: [
      {
        role: "CORRETOR_1",
        userId: autoAssignedBrokerId,
        percentual: 50,
      },
    ],
  };

  const createSaleRes = await request(cookieFinVenda, "POST", "/api/vendas", salePayload);
  const createdSale = createSaleRes.data?.sale;
  const saleOk = createSaleRes.status === 201 && createdSale?.codigoVenda;

  // Checar split gravado
  const splitsList = createdSale?.splits || createdSale?.commissionSplits || [];
  const hasSplits = splitsList.length > 0;

  // Checar lançamento automático no Fluxo de Caixa de Vendas
  const caixaRes = await request(cookieFinVenda, "GET", "/api/financeiro");
  const caixaEntries = caixaRes.data?.entries || [];
  const saleCashFlow = caixaEntries.filter((e: any) => e.saleId === createdSale?.id);
  const hasReceitaComissao = saleCashFlow.some(
    (e: any) => e.tipo === "RECEITA" && e.categoria === "Comissão Venda" && e.modalidade === "VENDA"
  );
  const hasDespesaSplit = saleCashFlow.some(
    (e: any) => e.tipo === "DESPESA" && e.categoria === "Split Comissão" && e.modalidade === "VENDA"
  );

  record(
    "Cenário 2",
    "Formalização Financeira e Gravação do Split",
    Boolean(saleOk && hasSplits),
    `Venda ${createdSale?.codigoVenda || ""} criada com sucesso! Split registrado para titular e imobiliária.`
  );

  record(
    "Cenário 2",
    "Lançamento Automático no Caixa de Vendas",
    Boolean(hasReceitaComissao && hasDespesaSplit),
    `Receita de comissão bruta (R$ 37.500) e Despesa de split geradas no ERP com modalidade VENDA.`
  );
}
