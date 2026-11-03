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
      const url = shadowRoot.getElementById("platz-input-url")?.value || "http://localhost:3001";
      const email = shadowRoot.getElementById("platz-input-email")?.value;
      const password = shadowRoot.getElementById("platz-input-password")?.value;

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
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Cadastrando...";
      }

      const nome = shadowRoot.getElementById("platz-new-name")?.value;
      const telefone = shadowRoot.getElementById("platz-new-phone")?.value;
      const modalidade = shadowRoot.getElementById("platz-new-modality")?.value || "VENDA";
      const propertyInteresse = shadowRoot.getElementById("platz-new-property")?.value || "";
      const corretorId = shadowRoot.getElementById("platz-new-corretor")?.value;
      const observacoes = shadowRoot.getElementById("platz-new-obs")?.value;

      try {
        await window.PlatzApi.createLead({ nome, telefone, modalidade, propertyInteresse, corretorId, observacoes });
        showToast("Lead salvo no Connect Platz!");
        detectActiveChat(true);
      } catch (err) {
        showToast(`Erro: ${err.message}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "+ Cadastrar no Connect Platz";
        }
      }
    };
  },

  attachLeadEvents(ctx) {
    const { shadowRoot, showToast, currentLead, currentUser, detectActiveChat, onFilterChange } = ctx;
    if (!currentLead) return;

    // 0. Abrir Lead diretamente no CRM
    const openLeadCrmBtn = shadowRoot.getElementById("platz-open-lead-crm-btn");
    if (openLeadCrmBtn) {
      openLeadCrmBtn.onclick = async () => {
        const apiUrl = await window.PlatzStorage.getApiUrl();
        const funnelParam = currentLead.funil?.id ? `funnelId=${currentLead.funil.id}&` : "";
        window.open(`${apiUrl}/crm/leads?${funnelParam}leadId=${currentLead.id}`, "_blank");
      };
    }

    // 1. Mudança de Etapa
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

    // 2. Mudança de Modalidade (Venda vs Locação)
    const btnVenda = shadowRoot.getElementById("platz-modality-venda-btn");
    const btnAluguel = shadowRoot.getElementById("platz-modality-aluguel-btn");

    if (btnVenda) {
      btnVenda.onclick = async () => {
        if (currentLead.modalidade === "VENDA") return;
        try {
          await window.PlatzApi.updateLead({ leadId: currentLead.id, modalidade: "VENDA" });
          showToast("Lead migrado para o Funil de Vendas!");
          detectActiveChat(true);
        } catch (err) {
          showToast(`Erro: ${err.message}`);
        }
      };
    }

    if (btnAluguel) {
      btnAluguel.onclick = async () => {
        if (currentLead.modalidade === "ALUGUEL") return;
        try {
          await window.PlatzApi.updateLead({ leadId: currentLead.id, modalidade: "ALUGUEL" });
          showToast("Lead migrado para o Funil de Locação!");
          detectActiveChat(true);
        } catch (err) {
          showToast(`Erro: ${err.message}`);
        }
      };
    }

    // 3. Empreendimento de Interesse
    const propSelect = shadowRoot.getElementById("platz-property-select");
    if (propSelect) {
      propSelect.onchange = async () => {
        if (!propSelect.value) return;
        try {
          await window.PlatzApi.updateLead({ leadId: currentLead.id, propertyInteresse: propSelect.value });
          showToast("Empreendimento vinculado ao lead!");
          detectActiveChat(true);
        } catch (err) {
          showToast(`Erro: ${err.message}`);
        }
      };
    }

    // 4. Reatribuição de Corretor
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

    // 5. Categorias de Templates
    const catTabs = shadowRoot.querySelectorAll(".platz-category-tab");
    catTabs.forEach((tab) => {
      tab.onclick = () => {
        const cat = tab.getAttribute("data-cat");
        if (onFilterChange) onFilterChange(cat);
      };
    });

    // 6. Templates Rápidos
    const templateItems = shadowRoot.querySelectorAll(".platz-template-item");
    templateItems.forEach((item) => {
      item.onclick = async () => {
        const rawText = decodeURIComponent(item.getAttribute("data-template-text"));
        const apiUrl = await window.PlatzStorage.getApiUrl();
        const formatted = window.PlatzTemplates.formatText(rawText, currentLead, currentUser, apiUrl);
        const result = window.PlatzTemplates.injectIntoWhatsApp(formatted);
        showToast(result.message);

        if (!currentLead.firstContactAt) {
          window.PlatzApi.addTimeline(
            currentLead.id,
            `Envio de template: "${item.querySelector('.platz-template-title')?.textContent || 'Template'}"`,
            "whatsapp",
            true
          ).then(() => detectActiveChat(true));
        }
      };
    });

    // 7. Salvar Nota na Timeline
    const timelineForm = shadowRoot.getElementById("platz-add-timeline-form");
    if (timelineForm) {
      timelineForm.onsubmit = async (e) => {
        e.preventDefault();
        const textEl = shadowRoot.getElementById("platz-timeline-text");
        const text = textEl?.value;
        if (!text) return;
        try {
          await window.PlatzApi.addTimeline(currentLead.id, text, "whatsapp");
          if (textEl) textEl.value = "";
          showToast("Anotação salva no CRM!");
          detectActiveChat(true);
        } catch (err) {
          showToast(`Erro: ${err.message}`);
        }
      };
    }

    // 8. Ações por Perfil
    this.attachRoleActions(ctx);
  },

  attachRoleActions(ctx) {
    const { shadowRoot, showToast, currentLead, detectActiveChat } = ctx;

    // Ação: Solicitar Fechamento (Corretor Venda / Admin)
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

    // Ação: Validar Crédito (Financeiro Venda / Admin)
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

    // Ação: Confirmar Caução (Financeiro Aluguel / Admin)
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

    // Ação: Fechar Reserva Direta (Corretor Aluguel / Admin)
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
            propertyId: currentLead.propertyInteresse || "Imóvel Selecionado",
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
