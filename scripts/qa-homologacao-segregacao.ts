// scripts/qa-homologacao-segregacao.ts
// Orquestrador de Homologação de QA — Regras de Segregação e Perfis do CRM

import { BASE_URL, results } from "./qa/qa-helpers";
import { testCenario1, testCenario2 } from "./qa/qa-cenarios-1-2";
import { testCenario3, testCenario4, testCenario5 } from "./qa/qa-cenarios-3-4-5";

async function main() {
  console.log("=================================================================");
  console.log("🚀 INICIANDO HOMOLOGAÇÃO COMPLETA DE QA — CONNECT PLATZ CRM");
  console.log(`Target: ${BASE_URL}`);
  console.log("=================================================================\n");

  try {
    await testCenario1();
    await testCenario2();
    await testCenario3();
    await testCenario4();
    await testCenario5();

    console.log("\n=================================================================");
    console.log("🏁 RELATÓRIO CONSOLIDADO DE HOMOLOGAÇÃO DE QA");
    console.log("=================================================================");

    const aprovados = results.filter((r) => r.status === "APROVADO");
    const reprovados = results.filter((r) => r.status === "REPROVADO");

    console.log(`Total de Verificações: ${results.length}`);
    console.log(`Aprovadas: ${aprovados.length} ✅`);
    console.log(`Reprovadas: ${reprovados.length} ❌\n`);

    console.log("📋 CHECKLIST DETALHADO POR CENÁRIO:\n");
    for (const r of results) {
      const icon = r.status === "APROVADO" ? "✅ APROVADO" : "❌ REPROVADO";
      console.log(`[${icon}] ${r.scenario} • ${r.item}`);
      console.log(`   └─ Detalhe: ${r.details}\n`);
    }

    if (reprovados.length > 0) {
      console.error("❌ A homologação encontrou falhas críticas:");
      for (const r of reprovados) {
        console.error(` - [${r.scenario}] ${r.item}: ${r.details}`);
      }
      process.exit(1);
    } else {
      console.log("🎉 TODOS OS 5 CENÁRIOS FORAM 100% HOMOLOGADOS COM SUCESSO!");
      process.exit(0);
    }
  } catch (err: any) {
    console.error("💥 Erro fatal durante a homologação:", err?.message || err);
    process.exit(1);
  }
}

main();
