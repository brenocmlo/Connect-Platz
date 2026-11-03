// extension/modules/storage.js
// Gerenciamento de armazenamento local com proteção contra invalidação de contexto

window.PlatzStorage = {
  DEFAULT_API_URL: "http://localhost:3001",
  _memoryCache: {},

  isContextValid() {
    try {
      if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.id) {
        return false;
      }
      return !!chrome.runtime.getManifest();
    } catch {
      return false;
    }
  },

  async get(key, defaultValue = null) {
    // 1. Se contexto foi invalidado, tenta ler do localStorage
    if (!this.isContextValid()) {
      try {
        const localVal = window.localStorage.getItem("platz_" + key);
        if (localVal !== null) return JSON.parse(localVal);
      } catch {}
      return this._memoryCache[key] !== undefined ? this._memoryCache[key] : defaultValue;
    }

    // 2. Leitura com chrome.storage.local
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime?.lastError) {
            resolve(this._memoryCache[key] !== undefined ? this._memoryCache[key] : defaultValue);
            return;
          }
          const val = result?.[key] !== undefined ? result[key] : defaultValue;
          this._memoryCache[key] = val;
          try {
            window.localStorage.setItem("platz_" + key, JSON.stringify(val));
          } catch {}
          resolve(val);
        });
      } catch {
        resolve(this._memoryCache[key] !== undefined ? this._memoryCache[key] : defaultValue);
      }
    });
  },

  async set(key, value) {
    this._memoryCache[key] = value;
    try {
      window.localStorage.setItem("platz_" + key, JSON.stringify(value));
    } catch {}

    if (!this.isContextValid()) return true;

    return new Promise((resolve) => {
      try {
        chrome.storage.local.set({ [key]: value }, () => resolve(true));
      } catch {
        resolve(true);
      }
    });
  },

  async getApiUrl() {
    let url = await this.get("platz_api_url", this.DEFAULT_API_URL);
    // Se estiver vazio ou apontando para a porta 3000 antiga, atualiza para 3001
    if (!url || String(url).includes(":3000")) {
      url = this.DEFAULT_API_URL;
      await this.set("platz_api_url", url);
    }
    return String(url).trim().replace(/\/+$/, "");
  },

  async setApiUrl(url) {
    const cleanUrl = String(url || this.DEFAULT_API_URL).trim().replace(/\/+$/, "");
    return this.set("platz_api_url", cleanUrl);
  },

  async getToken() {
    return this.get("platz_token", null);
  },

  async setToken(token) {
    return this.set("platz_token", token);
  },

  async getUser() {
    return this.get("platz_user", null);
  },

  async setUser(user) {
    return this.set("platz_user", user);
  },

  async isCollapsed() {
    return this.get("platz_sidebar_collapsed", false);
  },

  async setCollapsed(collapsed) {
    return this.set("platz_sidebar_collapsed", !!collapsed);
  },

  async clearAuth() {
    delete this._memoryCache["platz_token"];
    delete this._memoryCache["platz_user"];
    try {
      window.localStorage.removeItem("platz_platz_token");
      window.localStorage.removeItem("platz_platz_user");
    } catch {}

    if (!this.isContextValid()) return true;

    return new Promise((resolve) => {
      try {
        chrome.storage.local.remove(["platz_token", "platz_user"], () => resolve(true));
      } catch {
        resolve(true);
      }
    });
  },
};
