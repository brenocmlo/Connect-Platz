// extension/modules/templates.js
// Formatação e injeção de templates oficiais no WhatsApp Web

window.PlatzTemplates = {
  getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  },

  formatText(templateText, lead, user, baseUrl = "") {
    const primeiroNome = lead?.nome ? lead.nome.trim().split(/\s+/)[0] : "Cliente";
    const nomeCompleto = lead?.nome || "Cliente";
    const corretor = user?.nome || "Consultor Connect Platz";
    const saudacao = this.getGreeting();
    const empreendimento = lead?.empreendimentoInteresse || lead?.vendaRecente?.imovelNome || lead?.reservaRecente?.imovelNome || "Empreendimento Connect Platz";
    const catalogoUrl = baseUrl ? `${baseUrl}/catalogo` : "https://connectplatz.com.br/catalogo";

    return templateText
      .replace(/{saudacao}/g, saudacao)
      .replace(/{primeiroNome}/g, primeiroNome)
      .replace(/{nomeCompleto}/g, nomeCompleto)
      .replace(/{corretor}/g, corretor)
      .replace(/{empreendimento}/g, empreendimento)
      .replace(/{catalogoUrl}/g, catalogoUrl);
  },

  injectIntoWhatsApp(text) {
    // Procura o campo de digitação do WhatsApp Web
    const inputSelectors = [
      'div[contenteditable="true"][data-tab="10"]',
      'div[contenteditable="true"][data-tab="6"]',
      'footer div[contenteditable="true"]',
      'div[contenteditable="true"]',
    ];

    let inputBox = null;
    for (const selector of inputSelectors) {
      const el = document.querySelector(selector);
      if (el && el.offsetParent !== null) {
        inputBox = el;
        break;
      }
    }

    if (!inputBox) {
      // Fallback: copia para a área de transferência
      navigator.clipboard.writeText(text);
      return { success: true, fallback: true, message: "Texto copiado para a área de transferência!" };
    }

    inputBox.focus();

    // Inserir texto nativamente para engatilhar o React do WhatsApp
    const success = document.execCommand("insertText", false, text);
    if (!success) {
      inputBox.textContent = text;
      inputBox.dispatchEvent(new InputEvent("input", { bubbles: true }));
    }

    return { success: true, fallback: false, message: "Template inserido na conversa!" };
  },
};
