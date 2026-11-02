// extension/background.js
// Service Worker em segundo plano para contornar políticas de CORS e CSP do WhatsApp Web

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "api_fetch") {
    const { url, options } = request;

    fetch(url, options)
      .then(async (response) => {
        const text = await response.text();
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = { raw: text };
        }

        if (!response.ok) {
          sendResponse({
            ok: false,
            status: response.status,
            error: data.error || `Erro ${response.status}: Falha no servidor.`,
          });
        } else {
          sendResponse({
            ok: true,
            status: response.status,
            data,
          });
        }
      })
      .catch((err) => {
        sendResponse({
          ok: false,
          status: 0,
          error: err.message || "Não foi possível conectar ao servidor CRM. Verifique se o sistema está em execução.",
        });
      });

    return true; // Mantém a conexão aberta para resposta assíncrona
  }
});
