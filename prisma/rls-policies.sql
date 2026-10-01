-- ==============================================================================
-- CONNECT PLATZ CRM & ERP — POLÍTICAS DE ROW LEVEL SECURITY (RLS) NO POSTGRESQL
-- ==============================================================================
-- Este script define o isolamento de dados no nível de linha (PostgreSQL RLS).
-- Ele garante que corretores só possam acessar seus próprios registros (leads, comissões,
-- compromissos) e que nenhum usuário acesse registros fora de sua organização.
-- 
-- Variáveis de sessão PostgreSQL utilizadas:
--   app.current_organization_id : UUID da organização atual
--   app.current_user_id         : UUID do usuário logado
--   app.current_user_role       : 'ADMINISTRADOR', 'DIRETOR', 'GERENTE', 'CORRETOR'
-- ==============================================================================

-- 1. HABILITAR RLS NAS TABELAS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- FUNÇÃO AUXILIAR PARA CONSULTAR VARIÁVEIS DE SESSÃO
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION current_app_org_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_organization_id', true), '')::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION current_app_user_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION current_app_user_role() RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('app.current_user_role', true), '')::TEXT;
$$ LANGUAGE SQL STABLE;

-- ------------------------------------------------------------------------------
-- 2. POLÍTICAS PARA ORGANIZATIONS
-- ------------------------------------------------------------------------------
CREATE POLICY org_isolation_policy ON organizations
  FOR ALL
  USING (id = current_app_org_id());

-- ------------------------------------------------------------------------------
-- 3. POLÍTICAS PARA USERS
-- ------------------------------------------------------------------------------
-- Membros da organização podem ver seus colegas (para roleta e equipe)
CREATE POLICY users_view_org_policy ON users
  FOR SELECT
  USING (organization_id = current_app_org_id());

-- Usuário pode alterar seu próprio status (Disponível, Em Visita, Pausa)
CREATE POLICY users_self_update_policy ON users
  FOR UPDATE
  USING (
    organization_id = current_app_org_id() AND
    (id = current_app_user_id() OR current_app_user_role() IN ('ADMINISTRADOR', 'DIRETOR'))
  );

-- ------------------------------------------------------------------------------
-- 4. POLÍTICAS PARA LEADS (REGRA DE OURO DE PRIVACIDADE E ISOLAMENTO)
-- ------------------------------------------------------------------------------
-- Administradores e Gerentes enxergam todos os leads da organização
-- Corretores só enxergam leads atribuídos a si mesmos OU leads no Bolsão disponível para resgate
CREATE POLICY leads_select_policy ON leads
  FOR SELECT
  USING (
    organization_id = current_app_org_id() AND (
      current_app_user_role() IN ('ADMINISTRADOR', 'DIRETOR', 'GERENTE') OR
      corretor_id = current_app_user_id() OR
      (is_bolsao = true AND is_closed = false)
    )
  );

-- Corretores só podem atualizar leads que estejam sob sua responsabilidade
-- ou assumir um lead do bolsão
CREATE POLICY leads_update_policy ON leads
  FOR UPDATE
  USING (
    organization_id = current_app_org_id() AND (
      current_app_user_role() IN ('ADMINISTRADOR', 'DIRETOR', 'GERENTE') OR
      corretor_id = current_app_user_id() OR
      (is_bolsao = true AND is_closed = false)
    )
  );

-- Inserção de leads: Administradores, Webhook Meta Ads ou Corretor criando lead próprio
CREATE POLICY leads_insert_policy ON leads
  FOR INSERT
  WITH CHECK (
    organization_id = current_app_org_id()
  );

-- ------------------------------------------------------------------------------
-- 5. POLÍTICAS PARA TIMELINE E DOCUMENTOS DO LEAD
-- ------------------------------------------------------------------------------
CREATE POLICY lead_timeline_policy ON lead_timeline
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_timeline.lead_id
        AND leads.organization_id = current_app_org_id()
        AND (
          current_app_user_role() IN ('ADMINISTRADOR', 'DIRETOR', 'GERENTE') OR
          leads.corretor_id = current_app_user_id()
        )
    )
  );

CREATE POLICY lead_documents_policy ON lead_documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_documents.lead_id
        AND leads.organization_id = current_app_org_id()
        AND (
          current_app_user_role() IN ('ADMINISTRADOR', 'DIRETOR', 'GERENTE') OR
          leads.corretor_id = current_app_user_id()
        )
    )
  );

-- ------------------------------------------------------------------------------
-- 6. POLÍTICAS PARA IMÓVEIS E ESPELHO DE VENDAS (PROPERTIES & PROPERTY_UNITS)
-- ------------------------------------------------------------------------------
CREATE POLICY properties_policy ON properties
  FOR ALL
  USING (organization_id = current_app_org_id());

CREATE POLICY property_units_policy ON property_units
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_units.property_id
        AND properties.organization_id = current_app_org_id()
    )
  );

-- ------------------------------------------------------------------------------
-- 7. POLÍTICAS PARA ALUGUEL DE VERANEIO (SEASON_BOOKINGS)
-- ------------------------------------------------------------------------------
CREATE POLICY season_bookings_policy ON season_bookings
  FOR ALL
  USING (organization_id = current_app_org_id());

-- ------------------------------------------------------------------------------
-- 8. POLÍTICAS PARA VENDAS (SALES)
-- ------------------------------------------------------------------------------
-- Corretores só enxergam vendas onde foram o titular; Administradores veem todas
CREATE POLICY sales_policy ON sales
  FOR ALL
  USING (
    organization_id = current_app_org_id() AND (
      current_app_user_role() IN ('ADMINISTRADOR', 'DIRETOR', 'GERENTE') OR
      corretor_id = current_app_user_id()
    )
  );

-- ------------------------------------------------------------------------------
-- 9. POLÍTICAS PARA SPLIT DE COMISSÕES (COMMISSION_SPLITS)
-- ------------------------------------------------------------------------------
-- Corretor só tem acesso aos seus próprios repasses de comissão
CREATE POLICY commission_splits_policy ON commission_splits
  FOR ALL
  USING (
    current_app_user_role() IN ('ADMINISTRADOR', 'DIRETOR') OR
    user_id = current_app_user_id()
  );

-- ------------------------------------------------------------------------------
-- 10. POLÍTICAS PARA ERP / FLUXO DE CAIXA (CASH_FLOWS)
-- ------------------------------------------------------------------------------
-- Apenas Administradores e Diretores têm acesso às movimentações de caixa
CREATE POLICY cash_flows_policy ON cash_flows
  FOR ALL
  USING (
    organization_id = current_app_org_id() AND
    current_app_user_role() IN ('ADMINISTRADOR', 'DIRETOR')
  );

-- ------------------------------------------------------------------------------
-- 11. POLÍTICAS PARA AGENDA (APPOINTMENTS)
-- ------------------------------------------------------------------------------
-- Corretor visualiza apenas sua própria agenda; Administrador pode ver de todos
CREATE POLICY appointments_policy ON appointments
  FOR ALL
  USING (
    organization_id = current_app_org_id() AND (
      current_app_user_role() IN ('ADMINISTRADOR', 'DIRETOR', 'GERENTE') OR
      user_id = current_app_user_id()
    )
  );
