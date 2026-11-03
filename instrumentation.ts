// instrumentation.ts
// Hook nativo do Next.js para inicialização do servidor e telemetria de performance

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Inicialização do runtime com monitoramento ativo
    console.log("[INSTRUMENTATION] Connect Platz CRM inicializado no modo servidor.");
    const { ensureDatabaseEnums } = await import("@/lib/db/ensureEnums");
    ensureDatabaseEnums().catch((err) => {
      console.warn("[INSTRUMENTATION] Falha ao verificar enums:", err?.message || err);
    });
  }
}
