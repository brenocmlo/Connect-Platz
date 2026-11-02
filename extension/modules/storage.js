// extension/modules/storage.js
// Gerenciamento de armazenamento local da extensão via chrome.storage.local

window.PlatzStorage = {
  DEFAULT_API_URL: "http://localhost:3000",

  async get(key, defaultValue = null) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] !== undefined ? result[key] : defaultValue);
      });
    });
  },

  async set(key, value) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => resolve(true));
    });
  },

  async getApiUrl() {
    const url = await this.get("platz_api_url", this.DEFAULT_API_URL);
    return String(url).replace(/\/+$/, "");
  },

  async setApiUrl(url) {
    const cleanUrl = String(url).trim().replace(/\/+$/, "");
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
    return new Promise((resolve) => {
      chrome.storage.local.remove(["platz_token", "platz_user"], () => resolve(true));
    });
  },
};
