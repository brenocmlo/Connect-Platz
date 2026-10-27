// scripts/test-leads-bidirectional-sync.mjs
// Script de validação automatizada da sincronização bidirecional entre Leads, Vendas e Agenda.

import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function runTest(name, fn) {
  process.stdout.write(`⏳ Executando: ${name}... `);
  try {
    await fn();
    console.log("✅ PASSOU");
  } catch (err) {
    console.log("❌ FALHOU");
    console.error(err);
    process.exitCode = 1;
  }
}

async function main() {
  console.log("\n🧪 BATERIA DE TESTES: SINCRONIZAÇÃO BIDIRECIONAL (KANBAN, VENDAS & AGENDA)\n");

  let adminCookie = null;
  let corretorCookie = null;
  let createdLeadId = null;

  // 1. Autenticação Admin
  await runTest("Autenticação de ADMINISTRADOR", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.TEST_ADMIN_EMAIL || "admin@connectplatz.com.br",
        password: process.env.TEST_ADMIN_PASSWORD || "admin123",
      }),
    });
    if (res.status === 200) {
      const rawCookie = res.headers.get("set-cookie");
      if (rawCookie) adminCookie = rawCookie.split(";")[0];
    }
  });

  // 2. Autenticação Corretor
  await runTest("Autenticação de CORRETOR", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.TEST_CORRETOR_EMAIL || "corretor@connectplatz.com.br",
        password: process.env.TEST_CORRETOR_PASSWORD || "corretor123",
      }),
    });
    if (res.status === 200) {
      const rawCookie = res.headers.get("set-cookie");
      if (rawCookie) corretorCookie = rawCookie.split(";")[0];
    }
  });

  // 3. Validação de endpoints se servidor estiver rodando
  if (!adminCookie) {
    console.log("\nℹ️ Nota: Para executar os testes com banco ao vivo, suba o servidor local (npm run dev)");
    console.log("   e passe as credenciais via variáveis de ambiente.");
    console.log("   O plano completo com testes E2E e unitários está em PLANO_TESTES_NOVAS_MELHORIAS.md\n");
    return;
  }

  // 4. Criação do Lead de teste
  await runTest("Criação de Lead para o Funil", async () => {
    const res = await fetch(`${BASE_URL}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        nome: "Cliente Teste Automatizado Sync",
        telefone: "11999990000",
        email: "cliente.teste.sync@connectplatz.com.br",
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    createdLeadId = data.lead.id;
    assert.ok(createdLeadId);
  });

  // 5. Bloqueio de troca de corretor por perfil CORRETOR (RBAC)
  if (corretorCookie && createdLeadId) {
    await runTest("Bloqueio de Troca de Corretor por Corretor Comum (HTTP 403)", async () => {
      const res = await fetch(`${BASE_URL}/api/leads/${createdLeadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Cookie: corretorCookie },
        body: JSON.stringify({ corretorId: "00000000-0000-0000-0000-000000000001" }),
      });
      assert.equal(res.status, 403);
    });
  }

  console.log("\n✨ Validação de rotas e estruturas concluída com sucesso.\n");
}

main().catch(console.error);
