// extension/content.js
// Script de conteúdo injetado no WhatsApp Web (web.whatsapp.com)

(function () {
  let shadowRoot = null;
  let currentPhone = null;
  let currentName = null;
  let currentUser = null;
  let currentLead = null;
  let currentTemplates = [];
  let availableBrokers = [];
  let availableFunnels = [];
  let availableProperties = [];
  let activeTemplateCategory = "Todos";
  let isCollapsed = false;

  function updateWhatsAppLayout(collapsed) {
    let styleEl = document.getElementById("platz-wa-page-style");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "platz-wa-page-style";
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = collapsed
      ? "#app { width: 100% !important; margin-right: 0 !important; }"
      : "#app { width: calc(100% - 320px) !important; margin-right: 320px !important; transition: width 0.22s cubic-bezier(0.16, 1, 0.3, 1), margin-right 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important; }";
  }

  function init() {
    if (document.getElementById("connect-platz-extension-root")) return;

    const host = document.createElement("div");
    host.id = "connect-platz-extension-root";
    document.body.appendChild(host);

    shadowRoot = host.attachShadow({ mode: "open" });

    const styleTag = document.createElement("style");
    styleTag.textContent = window.PlatzStyles;
    shadowRoot.appendChild(styleTag);

    const sidebarEl = document.createElement("div");
    sidebarEl.className = "platz-sidebar";
    sidebarEl.id = "platz-sidebar-container";
    shadowRoot.appendChild(sidebarEl);

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "platz-toggle-btn";
    toggleBtn.id = "platz-toggle-btn";
    toggleBtn.innerHTML = "›";
    toggleBtn.title = "Ocultar/Expandir Connect Platz";
    toggleBtn.onclick = toggleSidebar;
    sidebarEl.appendChild(toggleBtn);

    const toast = document.createElement("div");
    toast.className = "platz-toast";
    toast.id = "platz-toast";
    shadowRoot.appendChild(toast);

    checkAuthAndRender();
    startWhatsAppObserver();
  }

  function showToast(message) {
    const toast = shadowRoot?.getElementById("platz-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 3000);
  }

  async function toggleSidebar() {
    isCollapsed = !isCollapsed;
    const sidebar = shadowRoot?.getElementById("platz-sidebar-container");
    const toggle = shadowRoot?.getElementById("platz-toggle-btn");
    if (isCollapsed) {
      sidebar?.classList.add("collapsed");
      if (toggle) toggle.innerHTML = "‹";
    } else {
      sidebar?.classList.remove("collapsed");
      if (toggle) toggle.innerHTML = "›";
    }
    updateWhatsAppLayout(isCollapsed);
    await window.PlatzStorage.setCollapsed(isCollapsed);
  }

  async function checkAuthAndRender() {
    const token = await window.PlatzStorage.getToken();
    currentUser = await window.PlatzStorage.getUser();
    isCollapsed = await window.PlatzStorage.isCollapsed();

    const sidebar = shadowRoot?.getElementById("platz-sidebar-container");
    const toggle = shadowRoot?.getElementById("platz-toggle-btn");
    if (isCollapsed) {
      sidebar?.classList.add("collapsed");
      if (toggle) toggle.innerHTML = "‹";
    } else {
      sidebar?.classList.remove("collapsed");
      if (toggle) toggle.innerHTML = "›";
    }
    updateWhatsAppLayout(isCollapsed);

    if (!token || !currentUser) {
      renderLogin();
      return;
    }

    try {
      const authRes = await window.PlatzApi.checkAuth();
      currentUser = authRes.user;
      await window.PlatzStorage.setUser(currentUser);
      await loadTemplates();
      renderCurrentState();
    } catch {
      await window.PlatzStorage.clearAuth();
      currentUser = null;
      renderLogin("Sessão expirada. Faça login novamente.");
    }
  }

  async function loadTemplates() {
    try {
      const res = await window.PlatzApi.getTemplates();
      currentTemplates = res.templates || [];
    } catch {
      currentTemplates = [];
    }
  }

  function renderCurrentState() {
    if (!currentUser) return renderLogin();
    if (!currentPhone && !currentName) return renderEmptyChat();
    if (!currentLead) return renderNotFound();
    renderLead();
  }

  function resetContainer() {
    const container = shadowRoot.getElementById("platz-sidebar-container");
    const toggle = shadowRoot.getElementById("platz-toggle-btn");
    container.innerHTML = "";
    container.appendChild(toggle);
    return container;
  }

  function getHandlerContext() {
    return {
      shadowRoot,
      showToast,
      currentUser,
      currentLead,
      detectActiveChat,
      checkAuthAndRender,
      renderLogin,
      onLogout: () => { currentUser = null; },
      onFilterChange: (cat) => {
        activeTemplateCategory = cat;
        renderLead();
      },
    };
  }

  function renderLogin(error = null) {
    const container = resetContainer();
    container.insertAdjacentHTML("beforeend", window.PlatzUI.renderHeader(null));
    window.PlatzStorage.getApiUrl().then((apiUrl) => {
      container.insertAdjacentHTML("beforeend", window.PlatzUI.renderLoginView(error, apiUrl));
      window.PlatzHandlers.attachLoginEvents(getHandlerContext());
    });
  }

  function renderEmptyChat() {
    const container = resetContainer();
    container.insertAdjacentHTML("beforeend", window.PlatzUI.renderHeader(currentUser));
    container.insertAdjacentHTML("beforeend", window.PlatzUI.renderEmptyChatView());
    window.PlatzHandlers.attachHeaderEvents(getHandlerContext());
  }

  function renderNotFound() {
    const container = resetContainer();
    container.insertAdjacentHTML("beforeend", window.PlatzUI.renderHeader(currentUser));
    container.insertAdjacentHTML(
      "beforeend",
      window.PlatzUI.renderNotFoundView(currentPhone, availableBrokers, currentUser.role, currentName, availableProperties)
    );
    window.PlatzHandlers.attachHeaderEvents(getHandlerContext());
    window.PlatzHandlers.attachNotFoundEvents(getHandlerContext());
  }

  function renderLead() {
    const container = resetContainer();
    container.insertAdjacentHTML("beforeend", window.PlatzUI.renderHeader(currentUser));
    container.insertAdjacentHTML(
      "beforeend",
      window.PlatzUI.renderLeadView(
        currentLead,
        currentUser,
        currentTemplates,
        availableBrokers,
        availableFunnels,
        availableProperties,
        activeTemplateCategory
      )
    );
    window.PlatzHandlers.attachHeaderEvents(getHandlerContext());
    window.PlatzHandlers.attachLeadEvents(getHandlerContext());
  }

  function extractActiveContact() {
    const mainEl = document.getElementById("main") || document.querySelector('[data-testid="conversation-panel-wrapper"]');
    const activeSideItem = document.querySelector('#pane-side div[aria-selected="true"]');
    if (!mainEl && !activeSideItem) return null;

    let name = "";
    let phone = null;

    if (mainEl) {
      const headerEl = mainEl.querySelector("header") || mainEl;
      const titleSelectors = [
        '[data-testid="conversation-info-header"] span[dir="auto"]',
        '[data-testid="conversation-info-header"] span',
        'header span[title]',
        'header div[role="button"] span[dir="auto"]',
        'header span[dir="auto"]',
      ];

      for (const sel of titleSelectors) {
        const el = headerEl.querySelector(sel);
        if (el) {
          const val = (el.getAttribute("title") || el.textContent || "").trim();
          if (
            val &&
            val.toLowerCase() !== "online" &&
            !val.toLowerCase().startsWith("visto") &&
            !val.toLowerCase().startsWith("digitando") &&
            !val.toLowerCase().startsWith("clique")
          ) {
            name = val;
            break;
          }
        }
      }
    }

    if (!name && activeSideItem) {
      const sideTitleEl = activeSideItem.querySelector('span[title], span[dir="auto"]');
      if (sideTitleEl) {
        name = (sideTitleEl.getAttribute("title") || sideTitleEl.textContent || "").trim();
      }
    }

    if (name) {
      const digits = name.replace(/\D/g, "");
      if (digits.length >= 10 && digits.length <= 13) {
        phone = digits;
      }
    }

    if (!phone && mainEl) {
      const msgElements = mainEl.querySelectorAll("div[data-id]");
      for (const el of msgElements) {
        const dataId = el.getAttribute("data-id") || "";
        const match =
          dataId.match(/(\d{10,14})@c\.us/) ||
          dataId.match(/(\d{10,14})@s\.whatsapp\.net/) ||
          dataId.match(/^(?:true|false)_(\d{10,14})@/);
        if (match && match[1]) {
          phone = match[1];
          break;
        }
      }
    }

    if (!phone && mainEl) {
      const avatarImg = mainEl.querySelector('header img[src*="u="]');
      if (avatarImg) {
        const match = avatarImg.src.match(/u=(\d{10,14})/);
        if (match && match[1]) phone = match[1];
      }
    }

    if (!name && !phone) return null;
    return { name, phone };
  }

  async function detectActiveChat(forceReload = false) {
    if (!currentUser) return;

    const contact = extractActiveContact();
    if (!contact) {
      if (currentPhone !== null || currentName !== null) {
        currentPhone = null;
        currentName = null;
        currentLead = null;
        renderEmptyChat();
      }
      return;
    }

    const { phone, name } = contact;
    const sameContact = phone === currentPhone && name === currentName;
    if (sameContact && !forceReload && currentLead !== undefined) return;

    currentPhone = phone;
    currentName = name;

    try {
      const data = await window.PlatzApi.getLead(phone, name);
      availableBrokers = data.availableBrokers || [];
      availableFunnels = data.availableFunnels || [];
      availableProperties = data.availableProperties || [];

      if (data.found && data.lead) {
        currentLead = data.lead;
        renderLead();
      } else {
        currentLead = null;
        renderNotFound();
      }
    } catch {
      currentLead = null;
      renderNotFound();
    }
  }

  function startWhatsAppObserver() {
    const observer = new MutationObserver(() => detectActiveChat());
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("click", () => {
      setTimeout(() => detectActiveChat(), 300);
    });

    setInterval(() => detectActiveChat(), 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
