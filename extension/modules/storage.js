// extension/modules/storage.js
// Gerenciamento de armazenamento local da extensão via chrome.storage.local com proteção anti-invalidação

window.PlatzStorage = {
  DEFAULT_API_URL: "http://localhost:3001",
  _memoryCache: {},

  isContextValid() {
    try {
      return typeof chrome !== "undefined" && !!chrome.runtime && !!chrome.runtime.id;
    } catch {
      return false;
    }
  },

  async get(key, defaultValue = null) {
    if (!this.isContextValid()) {
      return this._memoryCache[key] !== undefined ? this._memoryCache[key] : defaultValue;
    }

    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            resolve(this._memoryCache[key] !== undefined ? this._memoryCache[key] : defaultValue);
            return;
          }
          const val = result?.[key] !== undefined ? result[key] : defaultValue;
          this._memoryCache[key] = val;
          resolve(val);
        });
      } catch {
        resolve(this._memoryCache[key] !== undefined ? this._memoryCache[key] : defaultValue);
      }
    });
  },

  async set(key, value) {
    this._memoryCache[key] = value;
    if (!this.isContextValid()) return true;

    return new Promise((resolve) => {
      try {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            // Silencioso se o contexto foi invalidado
          }
          resolve(true);
        });
      } catch {
        resolve(true);
      }
    });
  },

  async getApiUrl() {
    const url = await this.get("platz_api_url", this.DEFAULT_API_URL);
    return String(url || this.DEFAULT_API_URL).trim().replace(/\/+$/, "");
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
