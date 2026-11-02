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
  let isCollapsed = false;

  function init() {
    if (document.getElementById("connect-platz-extension-root")) return;

    const host = document.createElement("div");
    host.id = "connect-platz-extension-root";
    document.body.appendChild(host);

    shadowRoot = host.attachShadow({ mode: "open" });

    // Injetar estilos isolados
    const styleTag = document.createElement("style");
    styleTag.textContent = window.PlatzStyles;
    shadowRoot.appendChild(styleTag);

    // Contêiner principal da Sidebar
    const sidebarEl = document.createElement("div");
    sidebarEl.className = "platz-sidebar";
    sidebarEl.id = "platz-sidebar-container";
    shadowRoot.appendChild(sidebarEl);

    // Botão de Recolher/Expandir
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "platz-toggle-btn";
    toggleBtn.id = "platz-toggle-btn";
    toggleBtn.innerHTML = "›";
    toggleBtn.title = "Ocultar/Expandir Connect Platz";
    toggleBtn.onclick = toggleSidebar;
    sidebarEl.appendChild(toggleBtn);

    // Toast feedback
    const toast = document.createElement("div");
    toast.className = "platz-toast";
    toast.id = "platz-toast";
    shadowRoot.appendChild(toast);

    checkAuthAndRender();
    startWhatsAppObserver();
  }

  function showToast(message) {
    const toast = shadowRoot.getElementById("platz-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 3000);
  }

  async function toggleSidebar() {
    isCollapsed = !isCollapsed;
    const sidebar = shadowRoot.getElementById("platz-sidebar-container");
    const toggle = shadowRoot.getElementById("platz-toggle-btn");
    if (isCollapsed) {
      sidebar.classList.add("collapsed");
      toggle.innerHTML = "‹";
    } else {
      sidebar.classList.remove("collapsed");
      toggle.innerHTML = "›";
    }
    await window.PlatzStorage.setCollapsed(isCollapsed);
  }

  async function checkAuthAndRender() {
    const token = await window.PlatzStorage.getToken();
    currentUser = await window.PlatzStorage.getUser();
    isCollapsed = await window.PlatzStorage.isCollapsed();

    if (isCollapsed) {
      const sidebar = shadowRoot.getElementById("platz-sidebar-container");
      const toggle = shadowRoot.getElementById("platz-toggle-btn");
      sidebar?.classList.add("collapsed");
      if (toggle) toggle.innerHTML = "‹";
    }

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
    container.insertAdjacentHTML("beforeend", window.PlatzUI.renderNotFoundView(currentPhone, availableBrokers, currentUser.role, currentName));
    window.PlatzHandlers.attachHeaderEvents(getHandlerContext());
    window.PlatzHandlers.attachNotFoundEvents(getHandlerContext());
  }

  function renderLead() {
    const container = resetContainer();
    container.insertAdjacentHTML("beforeend", window.PlatzUI.renderHeader(currentUser));
    container.insertAdjacentHTML("beforeend", window.PlatzUI.renderLeadView(currentLead, currentUser, currentTemplates, availableBrokers));
    window.PlatzHandlers.attachHeaderEvents(getHandlerContext());
    window.PlatzHandlers.attachLeadEvents(getHandlerContext());
  }

  function extractActiveContact() {
    const headerEl = document.querySelector('header');
    if (!headerEl) return null;

    let name = "";
    let phone = null;

    // 1. Extrai o nome do contato exibido no cabeçalho
    const titleElements = headerEl.querySelectorAll(
      'span[title], div[role="button"] span[dir="auto"], [data-testid="conversation-info-header"] span'
    );
    for (const el of titleElements) {
      const text = (el.getAttribute("title") || el.textContent || "").trim();
      if (text && text !== "online" && !text.startsWith("visto") && !text.startsWith("clique")) {
        name = text;
        break;
      }
    }

    // Se o nome contiver telefone puro
    if (name) {
      const digits = name.replace(/\D/g, "");
      if (digits.length >= 10 && digits.length <= 13) {
        phone = digits;
      }
    }

    // 2. Extrai JID das mensagens ativas no chat (div[data-id])
    if (!phone) {
      const msgElements = document.querySelectorAll('div[data-id*="@c.us"], div[data-id*="@s.whatsapp.net"]');
      for (const el of msgElements) {
        const dataId = el.getAttribute("data-id") || "";
        const match = dataId.match(/^(?:true|false)_(\d{10,14})@/);
        if (match && match[1]) {
          phone = match[1];
          break;
        }
      }
    }

    // 3. Extrai telefone do avatar no cabeçalho
    if (!phone) {
      const avatarImg = headerEl.querySelector('img[src*="u="]');
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
    if (sameContact && !forceReload) return;

    currentPhone = phone;
    currentName = name;

    try {
      const data = await window.PlatzApi.getLead(phone, name);
      if (data.found && data.lead) {
        currentLead = data.lead;
        availableBrokers = data.availableBrokers || [];
        renderLead();
      } else {
        currentLead = null;
        availableBrokers = data.availableBrokers || [];
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
    setInterval(() => detectActiveChat(), 2000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
