// extension/modules/ui.js
// Renderizador dos componentes visuais do Connect Platz CRM dentro do Shadow DOM

window.PlatzUI = {
  getRoleLabel(role) {
    const map = {
      ADMINISTRADOR: "Gestão / Admin",
      FINANCEIRO_VENDA: "Financeiro Vendas",
      FINANCEIRO_ALUGUEL: "Financeiro Aluguel",
      CORRETOR_VENDA: "Corretor Vendas",
      CORRETOR_ALUGUEL: "Corretor Temporada",
    };
    return map[role] || role;
  },

  renderHeader(user, isCollapsed) {
    if (!user) {
      return `
        <div class="platz-header">
          <div class="platz-brand">
            <span class="platz-logo-badge">CONNECT PLATZ</span>
            <span style="font-size: 11px; font-weight: 600; color: #64748B;">CRM WhatsApp</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="platz-header">
        <div class="platz-brand">
          <span class="platz-logo-badge">PLATZ</span>
          <div class="platz-user-badge">
            <span class="platz-user-name">${user.nome.split(" ")[0]}</span>
            <span class="platz-user-role">${this.getRoleLabel(user.role)}</span>
          </div>
        </div>
        <div class="platz-header-actions">
          <button class="platz-icon-btn" id="platz-open-crm-btn" title="Abrir Connect Platz CRM">
            <span>CRM ↗</span>
          </button>
          <button class="platz-icon-btn" id="platz-logout-btn" title="Desconectar">
            <span>Sair</span>
          </button>
        </div>
      </div>
    `;
  },

  renderLoginView(error = null, defaultApiUrl = "") {
    return `
      <div class="platz-body">
        <div class="platz-card" style="margin-top: 20px;">
          <div class="platz-card-title">Acesso Connect Platz CRM</div>
          <p style="font-size: 11px; color: #64748B; margin-bottom: 12px;">
            Conecte sua conta para integrar o atendimento do WhatsApp com o CRM.
          </p>

          ${error ? `<div style="background: #FEF2F2; color: #DC2626; padding: 8px; border-radius: 6px; font-size: 11px; margin-bottom: 12px; border: 1px solid #FCA5A5;">${error}</div>` : ""}

          <form id="platz-login-form" style="display: flex; flex-direction: column; gap: 10px;">
            <div>
              <label style="font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase;">Servidor CRM</label>
              <input type="text" id="platz-input-url" class="platz-input" value="${defaultApiUrl}" placeholder="http://localhost:3000" />
            </div>
            <div>
              <label style="font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase;">E-mail</label>
              <input type="email" id="platz-input-email" class="platz-input" placeholder="seu.email@connectplatz.com.br" required />
            </div>
            <div>
              <label style="font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase;">Senha</label>
              <input type="password" id="platz-input-password" class="platz-input" placeholder="Sua senha" required />
            </div>
            <button type="submit" class="platz-btn-primary" style="margin-top: 6px;">
              Entrar no Connect Platz
            </button>
          </form>
        </div>
      </div>
    `;
  },

  renderEmptyChatView() {
    return `
      <div class="platz-body">
        <div class="platz-empty-box">
          <div style="font-size: 28px; margin-bottom: 8px;">💬</div>
          <div style="font-weight: 700; font-size: 13px; color: #1E293B; margin-bottom: 4px;">Nenhuma conversa selecionada</div>
          <p style="font-size: 11px; color: #64748B;">
            Clique em uma conversa do WhatsApp para visualizar ou cadastrar o lead no Connect Platz.
          </p>
        </div>
      </div>
    `;
  },

  renderNotFoundView(phone, brokersList = [], userRole = "") {
    const isAdmin = userRole === "ADMINISTRADOR";
    return `
      <div class="platz-body">
        <div class="platz-card" style="border-left: 3px solid #D97706;">
          <div class="platz-card-title">Novo Contato Identificado</div>
          <div style="font-size: 12px; font-weight: 700; color: #0F172A;">+${phone}</div>
          <p style="font-size: 11px; color: #64748B; margin-top: 4px;">
            Este número de telefone ainda não está cadastrado na sua base do CRM.
          </p>
        </div>

        <div class="platz-card">
          <div class="platz-card-title">Cadastrar Lead no Funil</div>
          <form id="platz-create-lead-form" style="display: flex; flex-direction: column; gap: 8px;">
            <input type="hidden" id="platz-new-phone" value="${phone}" />
            <div>
              <label style="font-size: 10px; font-weight: 700; color: #64748B;">NOME DO LEAD *</label>
              <input type="text" id="platz-new-name" class="platz-input" placeholder="Ex: Roberto Carlos" required />
            </div>
            ${isAdmin ? `
              <div>
                <label style="font-size: 10px; font-weight: 700; color: #64748B;">MODALIDADE</label>
                <select id="platz-new-modality" class="platz-select">
                  <option value="VENDA">Vendas</option>
                  <option value="ALUGUEL">Locação / Temporada</option>
                </select>
              </div>
              <div>
                <label style="font-size: 10px; font-weight: 700; color: #64748B;">CORRETOR RESPONSÁVEL</label>
                <select id="platz-new-corretor" class="platz-select">
                  <option value="">Atribuir a mim</option>
                  ${brokersList.map((b) => `<option value="${b.id}">${b.nome}</option>`).join("")}
                </select>
              </div>
            ` : ""}
            <div>
              <label style="font-size: 10px; font-weight: 700; color: #64748B;">OBSERVAÇÕES INICIAIS</label>
              <textarea id="platz-new-obs" class="platz-textarea" rows="2" placeholder="Ex: Interessado em apto 3 quartos..."></textarea>
            </div>
            <button type="submit" class="platz-btn-primary" style="margin-top: 4px;">
              + Cadastrar no Connect Platz
            </button>
          </form>
        </div>
      </div>
    `;
  },

  renderLeadView(lead, user, templates = [], brokersList = []) {
    const role = user?.role;
    const tempClass = lead.temperatura === "QUENTE" ? "platz-pill-quente" : lead.temperatura === "MORNO" ? "platz-pill-morno" : "platz-pill-frio";
    const tempEmoji = lead.temperatura === "QUENTE" ? "🔥" : lead.temperatura === "MORNO" ? "☕" : "🧊";

    // SLA Badge
    let slaHtml = "";
    if (lead.firstContactAt) {
      slaHtml = `<span class="platz-pill platz-pill-sla-ok">✓ 1º Contato Realizado</span>`;
    } else if (lead.slaBreached) {
      slaHtml = `<span class="platz-pill platz-pill-sla-alert">⚠️ SLA Estourado</span>`;
    } else {
      slaHtml = `<span class="platz-pill platz-pill-morno">⏱️ SLA em Aberto</span>`;
    }

    return `
      <div class="platz-body">
        <!-- Card Principal do Lead -->
        <div class="platz-card">
          <div class="platz-lead-header">
            <div>
              <div class="platz-lead-name">${lead.nome}</div>
              <div class="platz-lead-phone">📱 ${lead.telefone}</div>
              ${lead.email ? `<div style="font-size: 10px; color: #94A3B8;">✉️ ${lead.email}</div>` : ""}
            </div>
            <div style="text-align: right;">
              <span class="platz-pill ${tempClass}">${tempEmoji} ${lead.score}/100</span>
            </div>
          </div>
          <div class="platz-badge-row">
            ${slaHtml}
            <span class="platz-pill" style="background: #F1F5F9; color: #475569;">${lead.modalidade === "ALUGUEL" ? "Locação/Temporada" : "Venda"}</span>
            ${lead.corretor ? `<span class="platz-pill" style="background: #EFF6FF; color: #1E40AF;">👤 ${lead.corretor.nome.split(" ")[0]}</span>` : ""}
          </div>
        </div>

        <!-- Funil e Etapa -->
        <div class="platz-card">
          <div class="platz-card-title">Etapa no Funil: ${lead.funil?.nome || ""}</div>
          <select id="platz-stage-select" class="platz-select">
            ${(lead.funil?.stages || []).map((st) => `
              <option value="${st.id}" ${st.id === lead.etapaAtual?.id ? "selected" : ""}>
                ${st.nome}
              </option>
            `).join("")}
          </select>
        </div>

        <!-- Módulos Específicos por Perfil (Segregação de Perfis) -->
        ${this.renderRoleSpecificSection(lead, user, brokersList)}

        <!-- Templates Oficiais de WhatsApp -->
        <div class="platz-card">
          <div class="platz-card-title">Templates Rápidos Connect Platz</div>
          <div class="platz-templates-grid">
            ${templates.slice(0, 4).map((tpl) => `
              <div class="platz-template-item" data-template-id="${tpl.id}" data-template-text="${encodeURIComponent(tpl.text)}">
                <div class="platz-template-title">${tpl.title}</div>
                <div class="platz-template-preview">${tpl.text}</div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Registro Rápido na Linha do Tempo -->
        <div class="platz-card">
          <div class="platz-card-title">Registrar Abordagem / Nota</div>
          <form id="platz-add-timeline-form" style="display: flex; flex-direction: column; gap: 6px;">
            <textarea id="platz-timeline-text" class="platz-textarea" rows="2" placeholder="Resumo do contato... (ex: 'Cliente gostou do valor')" required></textarea>
            <button type="submit" class="platz-btn-primary" style="padding: 6px 10px;">
              + Salvar Nota no CRM
            </button>
          </form>

          ${lead.historicoRecente && lead.historicoRecente.length > 0 ? `
            <div style="margin-top: 10px; border-top: 1px solid #F1F5F9; padding-top: 6px;">
              <div style="font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase; margin-bottom: 4px;">Histórico Recente</div>
              ${lead.historicoRecente.slice(0, 3).map((item) => `
                <div class="platz-timeline-item">
                  <div class="platz-timeline-meta">
                    <span>${item.autorNome || "Sistema"}</span>
                    <span>${new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div>${item.conteudo}</div>
                </div>
              `).join("")}
            </div>
          ` : ""}
        </div>
      </div>
    `;
  },

  renderRoleSpecificSection(lead, user, brokersList = []) {
    const role = user?.role;

    // 1. ADMINISTRADOR: Reatribuição de Corretor
    if (role === "ADMINISTRADOR") {
      return `
        <div class="platz-card" style="border-left: 3px solid #1266C7;">
          <div class="platz-card-title">Gestão de Corretor Responsável</div>
          <select id="platz-reassign-broker-select" class="platz-select">
            <option value="">Selecione para reatribuir...</option>
            ${brokersList.map((b) => `
              <option value="${b.id}" ${b.id === lead.corretor?.id ? "selected" : ""}>
                ${b.nome}
              </option>
            `).join("")}
          </select>
        </div>
      `;
    }

    // 2. CORRETOR DE VENDAS: Solicitar Fechamento Comercial
    if (role === "CORRETOR_VENDA") {
      return `
        <div class="platz-card" style="background: #F8FAFC; border: 1px solid #BFDBFE;">
          <div class="platz-card-title" style="color: #1266C7;">Ação Comercial (Venda)</div>
          <p style="font-size: 11px; color: #475569; margin-bottom: 8px;">
            Cliente concordou com a compra? Solicite a formalização para o setor financeiro.
          </p>
          <button id="platz-btn-solicitar-fechamento" class="platz-btn-primary" style="background: #059669;">
            📝 Solicitar Fechamento ao Financeiro
          </button>
        </div>
      `;
    }

    // 3. FINANCEIRO DE VENDAS: Aprovação de Crédito & VGV
    if (role === "FINANCEIRO_VENDA") {
      return `
        <div class="platz-card" style="border-left: 3px solid #10B981;">
          <div class="platz-card-title">Análise de Crédito & VGV</div>
          <div style="font-size: 11px; margin-bottom: 6px;">
            <strong>Status de Crédito:</strong> ${lead.statusCredito || "NÃO INICIADA"}
          </div>
          ${lead.vendaRecente ? `
            <div style="font-size: 11px; margin-bottom: 8px;">
              <strong>VGV da Venda:</strong> R$ ${lead.vendaRecente.vgv?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          ` : ""}
          <button id="platz-btn-validar-credito" class="platz-btn-secondary" style="width: 100%; justify-content: center;">
            ✓ Aprovar Crédito Bancário
          </button>
        </div>
      `;
    }

    // 4. CORRETOR DE ALUGUEL: Fechar Reserva Direta de Temporada
    if (role === "CORRETOR_ALUGUEL") {
      return `
        <div class="platz-card" style="background: #FFFBEB; border: 1px solid #FDE68A;">
          <div class="platz-card-title" style="color: #D97706;">Reserva de Temporada</div>
          <p style="font-size: 11px; color: #78350F; margin-bottom: 8px;">
            Feche a locação de temporada e bloqueie o calendário diretamente.
          </p>
          <button id="platz-btn-reserva-direta" class="platz-btn-primary" style="background: #D97706;">
            🏖️ Registrar Reserva de Temporada
          </button>
        </div>
      `;
    }

    // 5. FINANCEIRO DE ALUGUEL: Confirmação de Caução/Pagamento
    if (role === "FINANCEIRO_ALUGUEL") {
      return `
        <div class="platz-card" style="border-left: 3px solid #D97706;">
          <div class="platz-card-title">Financeiro de Temporada</div>
          ${lead.reservaRecente ? `
            <div style="font-size: 11px; margin-bottom: 6px;">
              <strong>Reserva:</strong> R$ ${lead.reservaRecente.valorTotal?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${lead.reservaRecente.status})
            </div>
          ` : ""}
          <button id="platz-btn-confirmar-pagamento-reserva" class="platz-btn-secondary" style="width: 100%; justify-content: center;">
            ✓ Confirmar Sinal / Caução
          </button>
        </div>
      `;
    }

    return "";
  },
};
