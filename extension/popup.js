// extension/popup.js
// Gerenciamento do Popup de Configurações da Extensão

document.addEventListener("DOMContentLoaded", async () => {
  const apiUrlInput = document.getElementById("api-url");
  const saveUrlBtn = document.getElementById("save-url-btn");
  const statusText = document.getElementById("status-text");
  const statusDot = document.querySelector(".status-dot");
  const userCard = document.getElementById("user-card");
  const userName = document.getElementById("user-name");
  const userRole = document.getElementById("user-role");
  const userOrg = document.getElementById("user-org");
  const logoutBtn = document.getElementById("logout-btn");
  const openCrmBtn = document.getElementById("open-crm-btn");

  const roleLabels = {
    ADMINISTRADOR: "Gestão / Administrador",
    FINANCEIRO_VENDA: "Financeiro Vendas",
    FINANCEIRO_ALUGUEL: "Financeiro Aluguel",
    CORRETOR_VENDA: "Corretor Vendas",
    CORRETOR_ALUGUEL: "Corretor Temporada",
  };

  // Carregar URL atual
  const currentUrl = await window.PlatzStorage.getApiUrl();
  apiUrlInput.value = currentUrl;

  // Salvar URL
  saveUrlBtn.addEventListener("click", async () => {
    const newUrl = apiUrlInput.value.trim();
    if (newUrl) {
      await window.PlatzStorage.setApiUrl(newUrl);
      saveUrlBtn.textContent = "Salvo com sucesso!";
      setTimeout(() => (saveUrlBtn.textContent = "Salvar URL"), 2000);
      checkStatus();
    }
  });

  // Abrir CRM
  openCrmBtn.addEventListener("click", async () => {
    const url = await window.PlatzStorage.getApiUrl();
    chrome.tabs.create({ url: `${url}/crm` });
  });

  // Logout
  logoutBtn.addEventListener("click", async () => {
    await window.PlatzStorage.clearAuth();
    checkStatus();
  });

  async function checkStatus() {
    const token = await window.PlatzStorage.getToken();
    const user = await window.PlatzStorage.getUser();

    if (!token || !user) {
      statusDot.style.background = "#EF4444";
      statusText.style.color = "#DC2626";
      statusText.textContent = "Não Conectado";
      userCard.style.display = "none";
      logoutBtn.style.display = "none";
      return;
    }

    try {
      const res = await window.PlatzApi.checkAuth();
      const updatedUser = res.user;
      await window.PlatzStorage.setUser(updatedUser);

      statusDot.style.background = "#10B981";
      statusText.style.color = "#059669";
      statusText.textContent = "Conectado";

      userName.textContent = updatedUser.nome;
      userRole.textContent = roleLabels[updatedUser.role] || updatedUser.role;
      userOrg.textContent = updatedUser.organizationNome || "Connect Platz";
      userCard.style.display = "block";
      logoutBtn.style.display = "block";
    } catch {
      statusDot.style.background = "#F59E0B";
      statusText.style.color = "#D97706";
      statusText.textContent = "Sessão Expirada";
      userCard.style.display = "none";
      logoutBtn.style.display = "block";
    }
  }

  checkStatus();
});
