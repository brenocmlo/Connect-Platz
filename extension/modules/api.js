// extension/modules/api.js
// Cliente HTTP para os endpoints da API Connect Platz

window.PlatzApi = {
  async request(endpoint, options = {}) {
    const baseUrl = await window.PlatzStorage.getApiUrl();
    const token = await window.PlatzStorage.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Erro ${response.status}: Falha na requisição.`);
    }

    return data;
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

  async getLeadByPhone(phone) {
    return this.request(`/api/extension/lead?phone=${encodeURIComponent(phone)}`, {
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
