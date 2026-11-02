// extension/modules/handlers.js
// Manipuladores de eventos de formulários, botões e ações da Sidebar

window.PlatzHandlers = {
  attachHeaderEvents(ctx) {
    const { shadowRoot, showToast, renderLogin, onLogout } = ctx;

    const logoutBtn = shadowRoot.getElementById("platz-logout-btn");
    if (logoutBtn) {
      logoutBtn.onclick = async () => {
        await window.PlatzStorage.clearAuth();
        if (onLogout) onLogout();
        showToast("Desconectado com sucesso.");
        renderLogin();
      };
    }

    const openCrmBtn = shadowRoot.getElementById("platz-open-crm-btn");
    if (openCrmBtn) {
      openCrmBtn.onclick = async () => {
        const url = await window.PlatzStorage.getApiUrl();
        window.open(`${url}/crm/leads`, "_blank");
      };
    }
  },

  attachLoginEvents(ctx) {
    const { shadowRoot, showToast, checkAuthAndRender, renderLogin } = ctx;
    const form = shadowRoot.getElementById("platz-login-form");
    if (!form) return;

    form.onsubmit = async (e) => {
      e.preventDefault();
      const url = shadowRoot.getElementById("platz-input-url").value;
      const email = shadowRoot.getElementById("platz-input-email").value;
      const password = shadowRoot.getElementById("platz-input-password").value;

      try {
        await window.PlatzStorage.setApiUrl(url);
        await window.PlatzApi.login(email, password);
        showToast("Login realizado com sucesso!");
        checkAuthAndRender();
      } catch (err) {
        renderLogin(err.message || "Credenciais inválidas.");
      }
    };
  },

  attachNotFoundEvents(ctx) {
    const { shadowRoot, showToast, detectActiveChat } = ctx;
    const form = shadowRoot.getElementById("platz-create-lead-form");
    if (!form) return;

    form.onsubmit = async (e) => {
      e.preventDefault();
      const nome = shadowRoot.getElementById("platz-new-name").value;
      const telefone = shadowRoot.getElementById("platz-new-phone").value;
      const modalidade = shadowRoot.getElementById("platz-new-modality")?.value;
      const corretorId = shadowRoot.getElementById("platz-new-corretor")?.value;
      const observacoes = shadowRoot.getElementById("platz-new-obs")?.value;

      try {
        await window.PlatzApi.createLead({ nome, telefone, modalidade, corretorId, observacoes });
        showToast("Lead cadastrado com sucesso no Connect Platz!");
        detectActiveChat(true);
      } catch (err) {
        showToast(`Erro: ${err.message}`);
      }
    };
  },

  attachLeadEvents(ctx) {
    const { shadowRoot, showToast, currentLead, currentUser, detectActiveChat } = ctx;
    if (!currentLead) return;

    // 1. Mudança de Etapa no Funil
    const stageSelect = shadowRoot.getElementById("platz-stage-select");
    if (stageSelect) {
      stageSelect.onchange = async () => {
        try {
          await window.PlatzApi.updateLead({ leadId: currentLead.id, stageId: stageSelect.value });
          showToast("Etapa atualizada com sucesso!");
        } catch (err) {
          showToast(`Erro: ${err.message}`);
        }
      };
    }

    // 2. Reatribuição de Corretor (Admin)
    const brokerSelect = shadowRoot.getElementById("platz-reassign-broker-select");
    if (brokerSelect) {
      brokerSelect.onchange = async () => {
        if (!brokerSelect.value) return;
        try {
          await window.PlatzApi.updateLead({ leadId: currentLead.id, corretorId: brokerSelect.value });
          showToast("Lead reatribuído com sucesso!");
        } catch (err) {
          showToast(`Erro: ${err.message}`);
        }
      };
    }

    // 3. Templates Rápidos
    const templateItems = shadowRoot.querySelectorAll(".platz-template-item");
    templateItems.forEach((item) => {
      item.onclick = async () => {
        const rawText = decodeURIComponent(item.getAttribute("data-template-text"));
        const apiUrl = await window.PlatzStorage.getApiUrl();
        const formatted = window.PlatzTemplates.formatText(rawText, currentLead, currentUser, apiUrl);
        const result = window.PlatzTemplates.injectIntoWhatsApp(formatted);
        showToast(result.message);

        // Se ainda não registrou primeiro contato, registrar abordagem
        if (!currentLead.firstContactAt) {
          window.PlatzApi.addTimeline(currentLead.id, `Envio de template: "${item.querySelector('.platz-template-title').textContent}"`, "whatsapp", true)
            .then(() => detectActiveChat(true));
        }
      };
    });

    // 4. Salvar Nota na Timeline
    const timelineForm = shadowRoot.getElementById("platz-add-timeline-form");
    if (timelineForm) {
      timelineForm.onsubmit = async (e) => {
        e.preventDefault();
        const text = shadowRoot.getElementById("platz-timeline-text").value;
        try {
          await window.PlatzApi.addTimeline(currentLead.id, text, "whatsapp");
          shadowRoot.getElementById("platz-timeline-text").value = "";
          showToast("Anotação salva no CRM!");
          detectActiveChat(true);
        } catch (err) {
          showToast(`Erro: ${err.message}`);
        }
      };
    }

    // 5. Ações por Perfil
    this.attachRoleActions(ctx);
  },

  attachRoleActions(ctx) {
    const { shadowRoot, showToast, currentLead, detectActiveChat } = ctx;

    // Ação: Solicitar Fechamento (Corretor Venda)
    const btnFechamento = shadowRoot.getElementById("platz-btn-solicitar-fechamento");
    if (btnFechamento) {
      btnFechamento.onclick = async () => {
        const valor = prompt("Informe o valor da proposta comercial (R$):", "500000");
        if (!valor) return;
        const obs = prompt("Observações adicionais para o setor Financeiro:", "Cliente aprovou condições");
        try {
          const res = await window.PlatzApi.executeAction("SOLICITAR_FECHAMENTO", currentLead.id, { valorProposta: valor, observacoes: obs });
          showToast(res.message);
          detectActiveChat(true);
        } catch (err) {
          showToast(`Erro: ${err.message}`);
        }
      };
    }

    // Ação: Validar Crédito (Financeiro Venda)
    const btnCredito = shadowRoot.getElementById("platz-btn-validar-credito");
    if (btnCredito) {
      btnCredito.onclick = async () => {
        const banco = prompt("Banco da aprovação de crédito:", "Caixa Econômica");
        try {
          const res = await window.PlatzApi.executeAction("VALIDAR_CREDITO_BANCARIO", currentLead.id, { banco });
          showToast(res.message);
          detectActiveChat(true);
        } catch (err) {
          showToast(`Erro: ${err.message}`);
        }
      };
    }

    // Ação: Confirmar Pagamento de Reserva (Financeiro Aluguel)
    const btnReservaFin = shadowRoot.getElementById("platz-btn-confirmar-pagamento-reserva");
    if (btnReservaFin) {
      btnReservaFin.onclick = async () => {
        try {
          const res = await window.PlatzApi.executeAction("CONFIRMAR_PAGAMENTO_RESERVA", currentLead.id);
          showToast(res.message);
          detectActiveChat(true);
        } catch (err) {
          showToast(`Erro: ${err.message}`);
        }
      };
    }

    // Ação: Fechar Reserva Direta (Corretor Aluguel)
    const btnReservaCorretor = shadowRoot.getElementById("platz-btn-reserva-direta");
    if (btnReservaCorretor) {
      btnReservaCorretor.onclick = async () => {
        const checkIn = prompt("Data de Check-in (AAAA-MM-DD):", new Date().toISOString().split("T")[0]);
        if (!checkIn) return;
        const checkOut = prompt("Data de Check-out (AAAA-MM-DD):", new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0]);
        if (!checkOut) return;
        const valor = prompt("Valor total das diárias (R$):", "1500");
        try {
          const res = await window.PlatzApi.executeAction("FECHAR_RESERVA_DIRETA", currentLead.id, {
            propertyId: currentLead.reservaRecente?.imovelNome || "default",
            checkInDate: checkIn,
            checkOutDate: checkOut,
            valorDiarias: valor,
          });
          showToast(res.message);
          detectActiveChat(true);
        } catch (err) {
          showToast(`Erro: ${err.message}`);
        }
      };
    }
  },
};
