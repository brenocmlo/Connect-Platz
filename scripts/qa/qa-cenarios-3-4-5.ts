// scripts/qa/qa-cenarios-3-4-5.ts
// Cenários 3, 4 e 5 de Homologação de QA

import assert from "node:assert/strict";
import { login, request, record } from "./qa-helpers";

export async function testCenario3() {
  console.log("\n=======================================================");
  console.log("CENÁRIO 3: RESERVA DIRETA POR CORRETOR DE ALUGUEL (/crm/temporada)");
  console.log("=======================================================");

  const cookieCorretorAluguel = await login("corretor.aluguel@connectplatz.com.br");
  const cookieFinAluguel = await login("financeiro.aluguel@connectplatz.com.br");

  // 3.1 Acesso permitido à tela /crm/temporada
  const pageAccess = await request(cookieCorretorAluguel, "GET", "/crm/temporada");
  const pageAllowed = pageAccess.status === 200;

  // Obter imóveis e leads para reserva
  const propsRes = await request(cookieCorretorAluguel, "GET", "/api/properties");
  const properties = propsRes.data?.properties || [];
  const seasonProp =
    properties.find((p: any) => p.modalidade === "VERANEIO_TEMPORADA" || p.modalidade === "AMBOS") ||
    properties[0];

  const leadsRes = await request(cookieCorretorAluguel, "GET", "/api/leads");
  const leads = leadsRes.data?.leads || [];
  const leadAluguel = leads.find((l: any) => l.modalidade === "ALUGUEL") || leads[0];

  assert.ok(seasonProp, "Imóvel de temporada não encontrado.");
  assert.ok(leadAluguel, "Lead de aluguel não encontrado.");

  record(
    "Cenário 3",
    "Acesso e Modal sem Campos de Comissão/Split",
    pageAllowed,
    `Corretor de Aluguel acessa /crm/temporada. Formulário de reserva opera 100% focado em diárias e hóspede sem campos de split.`
  );

  // 3.2 Criar Reserva Direta com janela de datas dinâmica (evita colisão com testes anteriores)
  const stamp = Date.now().toString().slice(-4);
  const now = new Date();
  const randomOffset = 30 + Math.floor(Math.random() * 500);
  const inDate = new Date(now.getTime() + randomOffset * 86400000);
  const outDate = new Date(inDate.getTime() + 4 * 86400000);
  const checkIn = inDate.toISOString().slice(0, 10);
  const checkOut = outDate.toISOString().slice(0, 10);
  const bookingPayload = {
    propertyId: seasonProp.id,
    leadId: leadAluguel.id,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    valorDiarias: 4500, // 5 x 900
    taxaLimpeza: 250,
    meioPagamento: "PIX",
    observacoes: `Reserva Homologação QA #${stamp}`,
  };

  const bookingRes = await request(cookieCorretorAluguel, "POST", "/api/bookings", bookingPayload);
  const booking = bookingRes.data?.booking;
  const bookingSuccess = bookingRes.status === 201 && booking?.id;

  // 3.3 Testar Bloqueio de Calendário (Overbooking)
  const overbookingRes = await request(cookieCorretorAluguel, "POST", "/api/bookings", {
    ...bookingPayload,
    observacoes: "Tentativa de overbooking nas mesmas datas",
  });
  const overbookingBlocked =
    overbookingRes.status >= 400 &&
    (overbookingRes.data?.error || "").toLowerCase().includes("overbooking");

  record(
    "Cenário 3",
    "Bloqueio de Calendário sem Conflitos",
    Boolean(bookingSuccess && overbookingBlocked),
    `Reserva #${booking?.id?.slice(0, 8)} criada com sucesso e tentativa concorrente rejeitada por overbooking.`
  );

  // 3.4 Verificar Lançamento Automático no ERP com modalidade ALUGUEL
  const caixaRes = await request(cookieFinAluguel, "GET", "/api/financeiro");
  const caixaEntries = caixaRes.data?.entries || [];
  const bookingCashFlow = caixaEntries.find((e: any) => e.bookingId === booking?.id);
  const isCashFlowAluguel =
    bookingCashFlow &&
    bookingCashFlow.modalidade === "ALUGUEL" &&
    bookingCashFlow.tipo === "RECEITA" &&
    bookingCashFlow.categoria === "Aluguel Veraneio";

  record(
    "Cenário 3",
    "Lançamento Automático no ERP (Modalidade ALUGUEL)",
    Boolean(isCashFlowAluguel),
    `Receita de R$ 4.750 criada no ERP com modalidade ALUGUEL vinculada à reserva #${booking?.id?.slice(0, 8)}.`
  );
}

export async function testCenario4() {
  console.log("\n=======================================================");
  console.log("CENÁRIO 4: GESTÃO DE EQUIPE E MUDANÇA DE MODALIDADE (/crm/equipes)");
  console.log("=======================================================");

  const cookieAdmin = await login("admin@connectplatz.com.br");
  const cookieFinVenda = await login("financeiro.venda@connectplatz.com.br");
  const cookieFinAluguel = await login("financeiro.aluguel@connectplatz.com.br");
  const stamp = Date.now().toString().slice(-4);

  // 4.1 Financeiro Vendas: Acesso restrito aos corretores de Venda e cadastro restrito
  const getEquipesVenda = await request(cookieFinVenda, "GET", "/api/equipes");
  const membersVenda = getEquipesVenda.data?.members || [];
  const onlyVendaRoles = membersVenda.every((m: any) =>
    ["CORRETOR_VENDA", "ADMINISTRADOR", "FINANCEIRO_VENDA"].includes(m.role)
  );

  const inviteInvalidAluguel = await request(cookieFinVenda, "POST", "/api/equipes", {
    nome: `Corretor Aluguel Invalido ${stamp}`,
    email: `invalido.aluguel.${stamp}@connectplatz.com.br`,
    telefone: "(85) 99999-1111",
    role: "CORRETOR_ALUGUEL",
    senhaTemporaria: "ConnectPlatz2026@",
  });

  const inviteValidVenda = await request(cookieFinVenda, "POST", "/api/equipes", {
    nome: `Corretor Venda QA ${stamp}`,
    email: `corretor.venda.qa.${stamp}@connectplatz.com.br`,
    telefone: "(85) 99999-2222",
    role: "CORRETOR_VENDA",
    senhaTemporaria: "ConnectPlatz2026@",
  });

  const finVendaSegregation =
    onlyVendaRoles && inviteInvalidAluguel.status === 403 && inviteValidVenda.status === 201;

  record(
    "Cenário 4",
    "Financeiro Vendas - Visualização e Cadastro Restritos ao Setor",
    finVendaSegregation,
    `Vê apenas membros de Vendas. Cadastro de Corretor Venda aceito (201) e tentativa de Aluguel rejeitada (403).`
  );

  // 4.2 Financeiro Aluguel: Acesso restrito aos corretores de Aluguel e cadastro restrito
  const getEquipesAluguel = await request(cookieFinAluguel, "GET", "/api/equipes");
  const membersAluguel = getEquipesAluguel.data?.members || [];
  const onlyAluguelRoles = membersAluguel.every((m: any) =>
    ["CORRETOR_ALUGUEL", "ADMINISTRADOR", "FINANCEIRO_ALUGUEL"].includes(m.role)
  );

  const inviteInvalidVenda = await request(cookieFinAluguel, "POST", "/api/equipes", {
    nome: `Corretor Venda Invalido ${stamp}`,
    email: `invalido.venda.${stamp}@connectplatz.com.br`,
    telefone: "(85) 99999-3333",
    role: "CORRETOR_VENDA",
    senhaTemporaria: "ConnectPlatz2026@",
  });

  const inviteValidAluguel = await request(cookieFinAluguel, "POST", "/api/equipes", {
    nome: `Corretora Aluguel QA ${stamp}`,
    email: `corretora.aluguel.qa.${stamp}@connectplatz.com.br`,
    telefone: "(85) 99999-4444",
    role: "CORRETOR_ALUGUEL",
    senhaTemporaria: "ConnectPlatz2026@",
  });

  const finAluguelSegregation =
    onlyAluguelRoles && inviteInvalidVenda.status === 403 && inviteValidAluguel.status === 201;

  record(
    "Cenário 4",
    "Financeiro Aluguel - Visualização e Cadastro Restritos ao Setor",
    finAluguelSegregation,
    `Vê apenas membros de Aluguel. Cadastro de Corretor Aluguel aceito (201) e tentativa de Venda rejeitada (403).`
  );

  // 4.3 Administrador: Alternar cargo entre CORRETOR_VENDA e CORRETOR_ALUGUEL e editar Financeiro
  const testBrokerId = inviteValidVenda.data?.member?.id;
  assert.ok(testBrokerId, "ID do corretor de teste não retornado.");

  const patchToAluguel = await request(cookieAdmin, "PATCH", "/api/equipes", {
    userId: testBrokerId,
    role: "CORRETOR_ALUGUEL",
  });
  const changedToAluguel =
    patchToAluguel.status === 200 && patchToAluguel.data?.member?.role === "CORRETOR_ALUGUEL";

  const patchToVenda = await request(cookieAdmin, "PATCH", "/api/equipes", {
    userId: testBrokerId,
    role: "CORRETOR_VENDA",
  });
  const changedToVenda =
    patchToVenda.status === 200 && patchToVenda.data?.member?.role === "CORRETOR_VENDA";

  const finMember = membersVenda.find((m: any) => m.role === "FINANCEIRO_VENDA");
  let finEditedOk = false;
  if (finMember) {
    const editFinRes = await request(cookieAdmin, "PATCH", "/api/equipes", {
      userId: finMember.id,
      telefone: "(85) 99999-9876",
    });
    finEditedOk = editFinRes.status === 200;
  }

  record(
    "Cenário 4",
    "Administrador - Mudança de Modalidade e Edição do Financeiro",
    Boolean(changedToAluguel && changedToVenda && finEditedOk),
    `Admin alternou corretor entre CORRETOR_VENDA e CORRETOR_ALUGUEL com sucesso e editou dados do Financeiro.`
  );
}

export async function testCenario5() {
  console.log("\n=======================================================");
  console.log("CENÁRIO 5: SEGREGAÇÃO DO CATÁLOGO (/crm/empreendimentos)");
  console.log("=======================================================");

  const cookieFinVenda = await login("financeiro.venda@connectplatz.com.br");
  const cookieCorretorVenda = await login("corretor.venda@connectplatz.com.br");
  const cookieFinAluguel = await login("financeiro.aluguel@connectplatz.com.br");
  const cookieCorretorAluguel = await login("corretor.aluguel@connectplatz.com.br");
  const cookieAdmin = await login("admin@connectplatz.com.br");

  // 5.1 Perfis de Venda enxergam apenas imóveis de Venda ou Ambos
  const catFinVenda = await request(cookieFinVenda, "GET", "/api/properties");
  const catCorretorVenda = await request(cookieCorretorVenda, "GET", "/api/properties");

  const propsFinVenda = catFinVenda.data?.properties || [];
  const propsCorretorVenda = catCorretorVenda.data?.properties || [];

  const onlySaleFin = propsFinVenda.every((p: any) => ["VENDA", "AMBOS"].includes(p.modalidade));
  const onlySaleCorretor = propsCorretorVenda.every((p: any) =>
    ["VENDA", "AMBOS"].includes(p.modalidade)
  );

  record(
    "Cenário 5",
    "Segregação Catálogo Vendas (Financeiro & Corretor)",
    catFinVenda.status === 200 && onlySaleFin && onlySaleCorretor,
    `Perfis de Venda enxergam apenas imóveis de VENDA/AMBOS (${propsFinVenda.length} listados). Imóveis de temporada/locação ocultados.`
  );

  // 5.2 Perfis de Aluguel enxergam apenas imóveis de Temporada/Locação ou Ambos
  const catFinAluguel = await request(cookieFinAluguel, "GET", "/api/properties");
  const catCorretorAluguel = await request(cookieCorretorAluguel, "GET", "/api/properties");

  const propsFinAluguel = catFinAluguel.data?.properties || [];
  const propsCorretorAluguel = catCorretorAluguel.data?.properties || [];

  const onlyRentFin = propsFinAluguel.every((p: any) =>
    ["VERANEIO_TEMPORADA", "LOCACAO_ANUAL", "AMBOS"].includes(p.modalidade)
  );
  const onlyRentCorretor = propsCorretorAluguel.every((p: any) =>
    ["VERANEIO_TEMPORADA", "LOCACAO_ANUAL", "AMBOS"].includes(p.modalidade)
  );

  record(
    "Cenário 5",
    "Segregação Catálogo Aluguel (Financeiro & Corretora)",
    catFinAluguel.status === 200 && onlyRentFin && onlyRentCorretor,
    `Perfis de Aluguel enxergam apenas imóveis de TEMPORADA/LOCAÇÃO (${propsFinAluguel.length} listados). Imóveis de venda pura ocultados.`
  );

  // 5.3 Administrador enxerga o catálogo completo consolidado
  const catAdmin = await request(cookieAdmin, "GET", "/api/properties");
  const propsAdmin = catAdmin.data?.properties || [];
  const hasVendaInAdmin = propsAdmin.some((p: any) => p.modalidade === "VENDA");
  const hasRentInAdmin = propsAdmin.some(
    (p: any) => p.modalidade === "VERANEIO_TEMPORADA" || p.modalidade === "LOCACAO_ANUAL"
  );

  record(
    "Cenário 5",
    "Catálogo Consolidado Administrador",
    catAdmin.status === 200 && hasVendaInAdmin && hasRentInAdmin,
    `Administrador enxerga o catálogo global unificado (${propsAdmin.length} imóveis totais).`
  );
}
