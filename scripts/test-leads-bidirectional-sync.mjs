// scripts/test-leads-bidirectional-sync.mjs
// Testes de integração (TC-API-01..06 de PLANO_TESTES_NOVAS_MELHORIAS.md) contra um servidor rodando.
// Uso: node scripts/test-leads-bidirectional-sync.mjs  (TEST_BASE_URL, TEST_*_EMAIL, TEST_PASSWORD opcionais)
// Atenção: grava dados reais (lead, compromisso e venda de teste) no banco apontado pelo servidor.

import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const PASSWORD = process.env.TEST_PASSWORD || "ConnectPlatz2026@";
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "robson@connectplatz.com.br";
const CORRETOR_EMAIL = process.env.TEST_CORRETOR_EMAIL || "lucas.corretor@connectplatz.com.br";

let failures = 0;

async function runTest(name, fn) {
  process.stdout.write(`⏳ ${name}... `);
  try {
    await fn();
    console.log("✅ PASSOU");
  } catch (err) {
    failures++;
    console.log("❌ FALHOU");
    console.error(`   ${err.message}`);
  }
}

async function login(email) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  assert.equal(res.status, 200, `login ${email} → HTTP ${res.status}`);
  return res.headers.get("set-cookie").split(";")[0];
}

async function api(cookie, method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => null) };
}

const getLead = async (cookie, id) => (await api(cookie, "GET", `/api/leads/${id}`)).data.lead;

async function main() {
  console.log("\n🧪 SINCRONIZAÇÃO BIDIRECIONAL — LEADS, VENDAS & AGENDA\n");

  const admin = await login(ADMIN_EMAIL);
  const corretor = await login(CORRETOR_EMAIL);
  const { data: team } = await api(admin, "GET", "/api/equipes");
  const lucas = team.members.find((m) => m.email === CORRETOR_EMAIL);
  const other = team.members.find((m) => m.role === "CORRETOR" && m.id !== lucas.id);
  const { data: props } = await api(admin, "GET", "/api/properties");
  const property = props.properties[0];
  assert.ok(lucas && other && property, "seed incompleto: precisa de 2 corretores e 1 empreendimento");

  const stamp = Date.now();
  const { status, data } = await api(admin, "POST", "/api/leads", {
    nome: `Teste Sync ${stamp}`,
    telefone: `1198${String(stamp).slice(-7)}`,
    email: `teste.sync.${stamp}@connectplatz.com.br`,
  });
  assert.equal(status, 201, `criação do lead → HTTP ${status} ${JSON.stringify(data)}`);
  const leadId = data.lead.id;
  let appointmentId;

  await runTest("TC-API-01: ADMINISTRADOR transfere lead de corretor", async () => {
    const res = await api(admin, "PATCH", `/api/leads/${leadId}`, { corretorId: lucas.id });
    assert.equal(res.status, 200, JSON.stringify(res.data));
    const lead = await getLead(admin, leadId);
    assert.equal(lead.corretorId, lucas.id);
    assert.equal(lead.isBolsao, false);
    const ev = lead.timeline.find((t) => t.tipo === "transbordo");
    assert.ok(ev, "sem evento 'transbordo' na timeline");
    assert.match(ev.conteudo, new RegExp(lucas.nome));
    const { data: audit } = await api(admin, "GET", "/api/auditoria?limit=50");
    assert.ok(audit.logs.some((l) => JSON.stringify(l).includes(leadId)), "sem registro de auditoria do lead");
  });

  await runTest("TC-API-02: CORRETOR não pode transferir lead (HTTP 403)", async () => {
    const res = await api(corretor, "PATCH", `/api/leads/${leadId}`, { corretorId: other.id });
    assert.equal(res.status, 403, JSON.stringify(res.data));
    assert.match(res.data.error, /administradores/i);
    const lead = await getLead(admin, leadId);
    assert.equal(lead.corretorId, lucas.id);
    assert.ok(!lead.timeline.some((t) => t.tipo === "transbordo" && t.conteudo.includes(other.nome)));
  });

  await runTest("TC-API-04: agendar VISITA avança lead para etapa de Visita", async () => {
    const res = await api(admin, "POST", "/api/agenda", {
      tipo: "VISITA",
      titulo: "Visita Teste Automatizado",
      dataInicio: new Date(Date.now() + 86400000).toISOString(),
      dataFim: new Date(Date.now() + 90000000).toISOString(),
      leadId,
    });
    assert.equal(res.status, 201, JSON.stringify(res.data));
    appointmentId = res.data.appointment.id;
    const lead = await getLead(admin, leadId);
    assert.match(lead.stage.nome, /visit/i);
    const ev = lead.timeline.find((t) => t.tipo === "visita");
    assert.ok(ev, "sem evento 'visita' na timeline");
    assert.match(ev.conteudo, /\d{2}\/\d{2}\/\d{4}/);
    assert.match(ev.conteudo, /Lead avançado no funil para "[^"]*Visit/i);
  });

  await runTest("TC-API-06: GET /api/agenda?leadId filtra compromissos do lead", async () => {
    const res = await api(admin, "GET", `/api/agenda?leadId=${leadId}`);
    assert.equal(res.status, 200);
    assert.ok(res.data.appointments.length >= 1, "nenhum compromisso retornado");
    for (const a of res.data.appointments) {
      assert.equal(a.leadId, leadId);
      assert.ok("user" in a && "lead" in a && "property" in a, "faltam relações user/lead/property");
    }
  });

  await runTest("TC-API-05: concluir visita registra desfecho na timeline", async () => {
    const resultadoVisita = "Cliente adorou a planta de 3 quartos, solicitou simulação com 30% de entrada.";
    const res = await api(admin, "PATCH", `/api/agenda/${appointmentId}`, { status: "CONCLUIDO", resultadoVisita });
    assert.equal(res.status, 200, JSON.stringify(res.data));
    const lead = await getLead(admin, leadId);
    const ev = lead.timeline.find((t) => t.tipo === "status_change" && t.metadata?.appointmentId === appointmentId);
    assert.ok(ev, "sem evento de conclusão na timeline");
    assert.ok(ev.conteudo.includes(resultadoVisita));
    assert.deepEqual(ev.metadata, { appointmentId, status: "CONCLUIDO", resultadoVisita });
  });

  await runTest("TC-API-03: registrar venda move lead para Ganho e zera SLA", async () => {
    const vgv = 500000;
    const res = await api(admin, "POST", "/api/vendas", {
      leadId,
      propertyId: property.id,
      dataVenda: new Date().toISOString().slice(0, 10),
      vgv,
      percentualComissao: 5,
      meioPagamento: "PIX",
      participants: [{ role: "CORRETOR_1", userId: lucas.id, percentual: 100 }],
    });
    assert.equal(res.status, 201, JSON.stringify(res.data));
    const lead = await getLead(admin, leadId);
    assert.match(lead.stage.nome, /vend|fechad|ganh/i);
    assert.equal(lead.slaBreached, false);
    assert.ok(lead.salesCount >= 1);
    const ev = lead.timeline.find((t) => t.tipo === "venda");
    assert.ok(ev, "sem evento 'venda' na timeline");
    assert.ok(ev.conteudo.includes(res.data.sale.codigoVenda), "timeline sem o código da venda");
    assert.ok(ev.conteudo.includes(property.nome));
    assert.ok(ev.conteudo.includes((vgv).toLocaleString("pt-BR", { minimumFractionDigits: 2 })));
    for (const k of ["saleId", "codigoVenda", "vgv", "comissaoBruta"]) assert.ok(k in ev.metadata, `metadata sem ${k}`);
  });

  console.log(failures ? `\n❌ ${failures} teste(s) falharam.\n` : "\n🎉 Todos os testes passaram.\n");
  process.exitCode = failures ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
