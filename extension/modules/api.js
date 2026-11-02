// extension/modules/api.js
// Cliente HTTP para os endpoints da API Connect Platz via Background Service Worker ou Fetch direto

window.PlatzApi = {
  async directFetch(fullUrl, options) {
    try {
      const response = await fetch(fullUrl, options);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}: Falha na requisição.`);
      }
      return data;
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
        throw new Error(
          "Não foi possível conectar ao servidor CRM em " +
            fullUrl +
            ". Verifique se o backend está rodando no terminal (porta 3001)."
        );
      }
      throw err;
    }
  },

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

    // 1. Tenta usar o service worker se o contexto da extensão estiver ativo
    const hasValidContext =
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      !!chrome.runtime.id &&
      typeof chrome.runtime.sendMessage === "function";

    if (hasValidContext) {
      return new Promise((resolve, reject) => {
        try {
          chrome.runtime.sendMessage(
            { action: "api_fetch", url: fullUrl, options: fetchOptions },
            (response) => {
              if (chrome.runtime.lastError) {
                // Se o service worker estiver dormente ou invalidado, faz fallback para fetch direto
                this.directFetch(fullUrl, fetchOptions).then(resolve).catch(reject);
                return;
              }
              if (!response || !response.ok) {
                reject(new Error(response?.error || "Falha na resposta do servidor."));
              } else {
                resolve(response.data);
              }
            }
          );
        } catch {
          this.directFetch(fullUrl, fetchOptions).then(resolve).catch(reject);
        }
      });
    }

    // 2. Fallback direto se contexto da extensão estiver reiniciando
    return this.directFetch(fullUrl, fetchOptions);
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
