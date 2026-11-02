// extension/modules/api.js
// Cliente HTTP para os endpoints da API Connect Platz via Background Service Worker

window.PlatzApi = {
  async request(endpoint, options = {}) {
    const baseUrl = await window.PlatzStorage.getApiUrl();
    const token = await window.PlatzStorage.getToken();
    const fullUrl = `${baseUrl}${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const fetchOptions = {
      ...options,
      headers,
    };

    // 1. Se a extensão foi recarregada no Chrome sem refresh da aba
    if (!window.PlatzStorage.isContextValid()) {
      throw new Error(
        "A extensão foi atualizada no Chrome. Por favor, recarregue a aba do WhatsApp (F5 ou Cmd+R) para continuar."
      );
    }

    // 2. Envia a requisição para o background service worker (evita CORS e CSP)
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(
          { action: "api_fetch", url: fullUrl, options: fetchOptions },
          (response) => {
            if (chrome.runtime?.lastError) {
              const errMsg = chrome.runtime.lastError.message || "";
              if (errMsg.toLowerCase().includes("invalidated")) {
                reject(
                  new Error("A extensão foi atualizada. Pressione F5 para recarregar o WhatsApp Web.")
                );
              } else {
                reject(new Error(errMsg || "Falha na comunicação com o serviço da extensão."));
              }
              return;
            }

            if (!response || !response.ok) {
              reject(new Error(response?.error || "Falha na resposta do servidor CRM."));
            } else {
              resolve(response.data);
            }
          }
        );
      } catch {
        reject(
          new Error("A extensão foi atualizada. Pressione F5 para recarregar o WhatsApp Web.")
        );
      }
    });
  },

  async login(email, password) {
    const res = await this.request("/api/extension/auth", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.token && res.user) {
      await window.PlatzStorage.setToken(res.token);
      await window.PlatzStorage.setUser(res.user);
    }
    return res;
  },

  async checkAuth() {
    return this.request("/api/extension/auth", { method: "GET" });
  },

  async getLead(phone, name = "") {
    const params = new URLSearchParams();
    if (phone) params.set("phone", phone);
    if (name) params.set("name", name);
    return this.request(`/api/extension/lead?${params.toString()}`, {
      method: "GET",
    });
  },

  async createLead(leadData) {
    return this.request("/api/extension/lead", {
      method: "POST",
      body: JSON.stringify(leadData),
    });
  },

  async updateLead(updateData) {
    return this.request("/api/extension/lead", {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  },

  async addTimeline(leadId, texto, canal = "whatsapp", isFirstContact = false) {
    return this.request("/api/extension/timeline", {
      method: "POST",
      body: JSON.stringify({ leadId, texto, canal, isFirstContact }),
    });
  },

  async getTemplates() {
    return this.request("/api/extension/templates", { method: "GET" });
  },

  async executeAction(action, leadId, payload = {}) {
    return this.request("/api/extension/actions", {
      method: "POST",
      body: JSON.stringify({ action, leadId, payload }),
    });
  },
};
