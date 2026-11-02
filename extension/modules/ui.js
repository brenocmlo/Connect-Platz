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

  renderHeader(user) {
    if (!user) {
      return `
        <div class="platz-header">
          <div class="platz-brand">
            <span class="platz-logo-badge">CONNECT PLATZ</span>
            <span style="font-size: 10px; font-weight: 600; color: #64748B;">CRM WhatsApp</span>
          </div>
        </div>`;
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
          <button class="platz-icon-btn" id="platz-open-crm-btn" title="Abrir CRM"><span>CRM ↗</span></button>
          <button class="platz-icon-btn" id="platz-logout-btn" title="Desconectar"><span>Sair</span></button>
        </div>
      </div>`;
  },

  renderLoginView(error = null, defaultApiUrl = "http://localhost:3001") {
    return `
      <div class="platz-body">
        <div class="platz-card" style="margin-top: 10px;">
          <div class="platz-card-title">Acesso Connect Platz CRM</div>
          <p style="font-size: 10px; color: #64748B; margin-bottom: 8px;">Conecte sua conta do CRM para integrar este atendimento.</p>
          ${error ? `<div style="background: #FEF2F2; color: #DC2626; padding: 6px; border-radius: 6px; font-size: 10px; margin-bottom: 8px; border: 1px solid #FCA5A5;">${error}</div>` : ""}
          <form id="platz-login-form" style="display: flex; flex-direction: column; gap: 8px;">
            <div>
              <label style="font-size: 9px; font-weight: 700; color: #64748B;">SERVIDOR CRM</label>
              <input type="text" id="platz-input-url" class="platz-input" value="${defaultApiUrl}" placeholder="http://localhost:3001" />
            </div>
            <div>
              <label style="font-size: 9px; font-weight: 700; color: #64748B;">E-MAIL</label>
              <input type="email" id="platz-input-email" class="platz-input" placeholder="admin@connectplatz.com.br" required />
            </div>
            <div>
              <label style="font-size: 9px; font-weight: 700; color: #64748B;">SENHA</label>
              <input type="password" id="platz-input-password" class="platz-input" placeholder="Sua senha" required />
            </div>
            <button type="submit" class="platz-btn-primary" style="margin-top: 4px;">Entrar no Connect Platz</button>
          </form>
          <div style="margin-top: 10px; background: #F1F5F9; padding: 6px; border-radius: 6px; font-size: 9px; color: #475569;">
            <strong>Acesso Admin:</strong> <code>admin@connectplatz.com.br</code><br/>
            <strong>Senha padrão:</strong> <code>ConnectPlatz2026@</code>
          </div>
        </div>
      </div>`;
  },

  renderEmptyChatView() {
    return `
      <div class="platz-body">
        <div class="platz-empty-box">
          <div style="font-size: 24px; margin-bottom: 6px;">💬</div>
          <div style="font-weight: 700; font-size: 12px; color: #1E293B; margin-bottom: 2px;">Nenhuma conversa ativa</div>
          <p style="font-size: 10px; color: #64748B;">Abra uma conversa no WhatsApp para ver ou cadastrar o lead no CRM.</p>
        </div>
      </div>`;
  },

  renderNotFoundView(phone, brokersList = [], userRole = "", name = "", propertiesList = []) {
    const isAdmin = userRole === "ADMINISTRADOR";
    const displayName = name || (phone ? `+${phone}` : "Novo Contato");
    return `
      <div class="platz-body">
        <div class="platz-card" style="border-left: 3px solid #D97706;">
          <div class="platz-card-title">Novo Contato Identificado</div>
          <div style="font-size: 12px; font-weight: 700; color: #0F172A;">${displayName}</div>
          <p style="font-size: 10px; color: #64748B; margin-top: 2px;">Este contato ainda não está na sua base do CRM.</p>
        </div>
        <div class="platz-card">
          <div class="platz-card-title">Cadastrar Lead no CRM</div>
          <form id="platz-create-lead-form" style="display: flex; flex-direction: column; gap: 6px;">
            <div>
              <label style="font-size: 9px; font-weight: 700; color: #64748B;">NOME DO LEAD *</label>
              <input type="text" id="platz-new-name" class="platz-input" value="${name || ""}" placeholder="Nome do cliente" required />
            </div>
            <div>
              <label style="font-size: 9px; font-weight: 700; color: #64748B;">TELEFONE / WHATSAPP *</label>
              <input type="text" id="platz-new-phone" class="platz-input" value="${phone || ""}" placeholder="DDD + Número" required />
            </div>
            <div>
              <label style="font-size: 9px; font-weight: 700; color: #64748B;">MODALIDADE</label>
              <select id="platz-new-modality" class="platz-select">
                <option value="VENDA" selected>🏢 Vendas & Lançamentos</option>
                <option value="ALUGUEL">🏖️ Locação & Temporada</option>
              </select>
            </div>
            <div>
              <label style="font-size: 9px; font-weight: 700; color: #64748B;">EMPREENDIMENTO DE INTERESSE</label>
              <select id="platz-new-property" class="platz-select">
                <option value="">Selecione um imóvel...</option>
                ${propertiesList.map((p) => `<option value="${p.nome}">${p.nome}</option>`).join("")}
              </select>
            </div>
            ${isAdmin ? `
              <div>
                <label style="font-size: 9px; font-weight: 700; color: #64748B;">CORRETOR RESPONSÁVEL</label>
                <select id="platz-new-corretor" class="platz-select">
                  <option value="">Atribuir a mim</option>
                  ${brokersList.map((b) => `<option value="${b.id}">${b.nome}</option>`).join("")}
                </select>
              </div>` : ""}
            <div>
              <label style="font-size: 9px; font-weight: 700; color: #64748B;">OBSERVAÇÕES</label>
              <textarea id="platz-new-obs" class="platz-textarea" rows="2" placeholder="Observações iniciais..."></textarea>
            </div>
            <button type="submit" class="platz-btn-primary" style="margin-top: 4px;">+ Cadastrar no Connect Platz</button>
          </form>
        </div>
      </div>`;
  },

  renderLeadView(lead, user, templates = [], brokersList = [], funnelsList = [], propertiesList = [], activeFilter = "Todos") {
    const tempClass = lead.temperatura === "QUENTE" ? "platz-pill-quente" : lead.temperatura === "MORNO" ? "platz-pill-morno" : "platz-pill-frio";
    const tempEmoji = lead.temperatura === "QUENTE" ? "🔥" : lead.temperatura === "MORNO" ? "☕" : "🧊";
    const slaHtml = lead.firstContactAt
      ? `<span class="platz-pill platz-pill-sla-ok">✓ 1º Contato</span>`
      : lead.slaBreached
      ? `<span class="platz-pill platz-pill-sla-alert">⚠️ SLA Vencido</span>`
      : `<span class="platz-pill platz-pill-morno">⏱️ SLA Aberto</span>`;

    const filteredTemplates = activeFilter === "Todos"
      ? templates
      : templates.filter((t) => t.category.toLowerCase() === activeFilter.toLowerCase());

    return `
      <div class="platz-body">
        <div class="platz-card">
          <div class="platz-lead-header">
            <div>
              <div class="platz-lead-name">${lead.nome}</div>
              <div class="platz-lead-phone">📱 ${lead.telefone}</div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
              <span class="platz-pill ${tempClass}">${tempEmoji} ${lead.score}/100</span>
              <button class="platz-icon-btn" id="platz-open-lead-crm-btn" style="padding: 2px 5px; font-size: 9px;" title="Ver Lead no CRM">
                CRM ↗
              </button>
            </div>
          </div>
          <div class="platz-badge-row">
            ${slaHtml}
            <span class="platz-pill" style="background: #F1F5F9; color: #475569;">${lead.modalidade === "ALUGUEL" ? "Locação/Temporada" : "Venda"}</span>
            ${lead.corretor ? `<span class="platz-pill" style="background: #EFF6FF; color: #1E40AF;">👤 ${lead.corretor.nome.split(" ")[0]}</span>` : ""}
          </div>
        </div>

        <div class="platz-card">
          <div class="platz-card-title">Modalidade & Funil</div>
          <div class="platz-segmented">
            <button class="platz-segmented-btn ${lead.modalidade === 'VENDA' ? 'active' : ''}" id="platz-modality-venda-btn" data-modality="VENDA">🏢 Vendas</button>
            <button class="platz-segmented-btn ${lead.modalidade === 'ALUGUEL' ? 'active' : ''}" id="platz-modality-aluguel-btn" data-modality="ALUGUEL">🏖️ Temporada</button>
          </div>
          <label style="font-size: 9px; font-weight: 700; color: #64748B; display: block; margin-bottom: 2px;">ETAPA: ${lead.funil?.nome || ""}</label>
          <select id="platz-stage-select" class="platz-select">
            ${(lead.funil?.stages || []).map((st) => `<option value="${st.id}" ${st.id === lead.etapaAtual?.id ? "selected" : ""}>${st.nome}</option>`).join("")}
          </select>
        </div>

        <div class="platz-card">
          <div class="platz-card-title">Empreendimento de Interesse</div>
          <select id="platz-property-select" class="platz-select">
            <option value="">Vincular imóvel...</option>
            ${propertiesList.map((p) => `<option value="${p.nome}" ${lead.propertyInteresse === p.nome ? "selected" : ""}>${p.nome} ${p.valorVenda ? `(R$ ${(Number(p.valorVenda)/1000).toFixed(0)}k)` : ""}</option>`).join("")}
          </select>
          ${lead.propertyInteresse ? `<div style="font-size: 9px; color: #1266C7; font-weight: 600; margin-top: 3px;">📍 ${lead.propertyInteresse}</div>` : ""}
        </div>

        ${this.renderRoleSpecificSection(lead, user, brokersList)}

        <div class="platz-card">
          <div class="platz-card-title">Templates de WhatsApp</div>
          <div class="platz-category-tabs">
            <button class="platz-category-tab ${activeFilter === 'Todos' ? 'active' : ''}" data-cat="Todos">Todos</button>
            <button class="platz-category-tab ${activeFilter === 'Venda' ? 'active' : ''}" data-cat="Venda">🏢 Venda</button>
            <button class="platz-category-tab ${activeFilter === 'Temporada' ? 'active' : ''}" data-cat="Temporada">🏖️ Temporada</button>
            <button class="platz-category-tab ${activeFilter === 'Financeiro' ? 'active' : ''}" data-cat="Financeiro">💳 Financeiro</button>
          </div>
          <div class="platz-templates-grid">
            ${filteredTemplates.map((tpl) => `
              <div class="platz-template-item" data-template-id="${tpl.id}" data-template-text="${encodeURIComponent(tpl.text)}">
                <div class="platz-template-title">${tpl.title}</div>
                <div class="platz-template-preview">${tpl.text}</div>
              </div>`).join("")}
          </div>
        </div>

        <div class="platz-card">
          <div class="platz-card-title">Registrar Abordagem / Nota</div>
          <form id="platz-add-timeline-form" style="display: flex; flex-direction: column; gap: 5px;">
            <textarea id="platz-timeline-text" class="platz-textarea" rows="2" placeholder="Resumo do contato..." required></textarea>
            <button type="submit" class="platz-btn-primary" style="padding: 6px 8px;">+ Salvar Nota no CRM</button>
          </form>
          ${lead.historicoRecente && lead.historicoRecente.length > 0 ? `
            <div style="margin-top: 6px; border-top: 1px solid #F1F5F9; padding-top: 4px;">
              <div style="font-size: 9px; font-weight: 700; color: #94A3B8; text-transform: uppercase; margin-bottom: 3px;">Histórico Recente</div>
              ${lead.historicoRecente.slice(0, 3).map((item) => `
                <div class="platz-timeline-item">
                  <div class="platz-timeline-meta">
                    <span>${item.autorNome || "Sistema"}</span>
                    <span>${new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div>${item.conteudo}</div>
                </div>`).join("")}
            </div>` : ""}
        </div>
      </div>`;
  },

  renderRoleSpecificSection(lead, user, brokersList = []) {
    const role = user?.role;
    if (role === "ADMINISTRADOR") {
      return `
        <div class="platz-card" style="border-left: 3px solid #1266C7;">
          <div class="platz-card-title">Gestão & Ações Rápidas (Admin)</div>
          <div style="margin-bottom: 6px;">
            <label style="font-size: 9px; font-weight: 700; color: #64748B;">CORRETOR RESPONSÁVEL</label>
            <select id="platz-reassign-broker-select" class="platz-select">
              <option value="">Reatribuir corretor...</option>
              ${brokersList.map((b) => `<option value="${b.id}" ${b.id === lead.corretor?.id ? "selected" : ""}>${b.nome}</option>`).join("")}
            </select>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
            <button id="platz-btn-solicitar-fechamento" class="platz-btn-secondary" style="justify-content: center; font-size: 9px;">📝 Fechamento</button>
            <button id="platz-btn-validar-credito" class="platz-btn-secondary" style="justify-content: center; font-size: 9px;">✓ Crédito</button>
            <button id="platz-btn-reserva-direta" class="platz-btn-secondary" style="justify-content: center; font-size: 9px;">🏖️ Reservar</button>
            <button id="platz-btn-confirmar-pagamento-reserva" class="platz-btn-secondary" style="justify-content: center; font-size: 9px;">✓ Caução</button>
          </div>
        </div>`;
    }

    if (role === "CORRETOR_VENDA") {
      return `
        <div class="platz-card" style="border-left: 3px solid #1266C7;">
          <div class="platz-card-title">Ação Comercial (Venda)</div>
          <button id="platz-btn-solicitar-fechamento" class="platz-btn-primary" style="background: #059669;">📝 Solicitar Fechamento ao Financeiro</button>
        </div>`;
    }

    if (role === "FINANCEIRO_VENDA") {
      return `
        <div class="platz-card" style="border-left: 3px solid #10B981;">
          <div class="platz-card-title">Análise de Crédito & VGV</div>
          <div style="font-size: 10px; margin-bottom: 4px;"><strong>Status:</strong> ${lead.statusCredito || "NÃO INICIADA"}</div>
          <button id="platz-btn-validar-credito" class="platz-btn-secondary" style="width: 100%; justify-content: center;">✓ Aprovar Crédito Bancário</button>
        </div>`;
    }

    if (role === "CORRETOR_ALUGUEL") {
      return `
        <div class="platz-card" style="border-left: 3px solid #D97706;">
          <div class="platz-card-title">Reserva de Temporada</div>
          <button id="platz-btn-reserva-direta" class="platz-btn-primary" style="background: #D97706;">🏖️ Registrar Reserva de Temporada</button>
        </div>`;
    }

    if (role === "FINANCEIRO_ALUGUEL") {
      return `
        <div class="platz-card" style="border-left: 3px solid #D97706;">
          <div class="platz-card-title">Financeiro de Temporada</div>
          <button id="platz-btn-confirmar-pagamento-reserva" class="platz-btn-secondary" style="width: 100%; justify-content: center;">✓ Confirmar Sinal / Caução</button>
        </div>`;
    }

    return "";
  },
};
