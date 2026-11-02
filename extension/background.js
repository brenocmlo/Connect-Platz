// extension/background.js
// Service Worker em segundo plano para contornar políticas de CORS e CSP do WhatsApp Web

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "api_fetch") {
    const { url, options } = request;

    const executeFetch = (targetUrl) => {
      fetch(targetUrl, options)
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
          // Se falhar ao conectar em :3000, tenta automaticamente em :3001
          if (targetUrl.includes(":3000")) {
            const fallbackUrl = targetUrl.replace(":3000", ":3001");
            return executeFetch(fallbackUrl);
          }

          sendResponse({
            ok: false,
            status: 0,
            error:
              "Não foi possível conectar ao servidor CRM em " +
              targetUrl +
              ". Certifique-se de que o sistema está rodando (porta 3001).",
          });
        });
    };

    executeFetch(url);
    return true; // Mantém a conexão aberta para resposta assíncrona
  }
});
