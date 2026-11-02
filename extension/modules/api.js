// extension/modules/api.js
// Cliente HTTP para os endpoints da API Connect Platz via Background Service Worker (anti-CORS)

window.PlatzApi = {
  async directFetch(fullUrl, options) {
    const response = await fetch(fullUrl, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Erro ${response.status}: Falha na requisição.`);
    }
    return data;
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

    // 1. Prioriza o background service worker para contornar restrições de CORS e CSP do WhatsApp Web
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      return new Promise((resolve, reject) => {
        try {
          chrome.runtime.sendMessage(
            { action: "api_fetch", url: fullUrl, options: fetchOptions },
            (response) => {
              if (chrome.runtime.lastError) {
                // Caso o service worker esteja inativo ou ocorra erro de mensagem, tenta fetch direto
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

    // 2. Fallback para fetch direto
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

  async getLeadByPhone(phone) {
    return this.getLead(phone);
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
