// instrumentation.ts
// Hook nativo do Next.js para inicialização do servidor e telemetria de performance

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Inicialização do runtime com monitoramento ativo
    console.log("[INSTRUMENTATION] Connect Platz CRM inicializado no modo servidor.");
  }
}
