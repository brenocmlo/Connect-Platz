-- ==============================================================================
-- CONNECT PLATZ CRM & ERP — POLÍTICAS DE ROW LEVEL SECURITY (RLS) NO POSTGRESQL
-- ==============================================================================
-- Este script define o isolamento de dados no nível de linha (PostgreSQL RLS).
-- Garante a segregação por modalidade (VENDA vs ALUGUEL) e isolamento horizontal
-- entre corretores da mesma equipe (Zero-Trust).
-- 
-- Variáveis de sessão PostgreSQL utilizadas:
--   app.current_organization_id : UUID da organização atual
--   app.current_user_id         : UUID do usuário logado
--   app.current_user_role       : 'ADMINISTRADOR', 'FINANCEIRO_VENDA', 'FINANCEIRO_ALUGUEL', 'CORRETOR_VENDA', 'CORRETOR_ALUGUEL'
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
ALTER TABLE rental_contracts ENABLE ROW LEVEL SECURITY;
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
CREATE POLICY users_view_org_policy ON users
  FOR SELECT
  USING (organization_id = current_app_org_id());

CREATE POLICY users_self_update_policy ON users
  FOR UPDATE
  USING (
    organization_id = current_app_org_id() AND
    (id = current_app_user_id() OR current_app_user_role() = 'ADMINISTRADOR')
  );

-- ------------------------------------------------------------------------------
-- 4. POLÍTICAS PARA LEADS (ISOLAMENTO POR MODALIDADE E CORRETOR)
-- ------------------------------------------------------------------------------
CREATE POLICY leads_select_policy ON leads
  FOR SELECT
  USING (
    organization_id = current_app_org_id() AND (
      current_app_user_role() = 'ADMINISTRADOR' OR
      (current_app_user_role() = 'FINANCEIRO_VENDA' AND modalidade = 'VENDA') OR
      (current_app_user_role() = 'FINANCEIRO_ALUGUEL' AND modalidade = 'ALUGUEL') OR
      (current_app_user_role() = 'CORRETOR_VENDA' AND modalidade = 'VENDA' AND (corretor_id = current_app_user_id() OR (is_bolsao = true AND is_closed = false))) OR
      (current_app_user_role() = 'CORRETOR_ALUGUEL' AND modalidade = 'ALUGUEL' AND (corretor_id = current_app_user_id() OR (is_bolsao = true AND is_closed = false))) OR
      (current_app_user_role() = 'CORRETOR' AND (corretor_id = current_app_user_id() OR (is_bolsao = true AND is_closed = false)))
    )
  );

CREATE POLICY leads_update_policy ON leads
  FOR UPDATE
  USING (
    organization_id = current_app_org_id() AND (
      current_app_user_role() = 'ADMINISTRADOR' OR
      (current_app_user_role() = 'FINANCEIRO_VENDA' AND modalidade = 'VENDA') OR
      (current_app_user_role() = 'FINANCEIRO_ALUGUEL' AND modalidade = 'ALUGUEL') OR
      (current_app_user_role() = 'CORRETOR_VENDA' AND modalidade = 'VENDA' AND (corretor_id = current_app_user_id() OR (is_bolsao = true AND is_closed = false))) OR
      (current_app_user_role() = 'CORRETOR_ALUGUEL' AND modalidade = 'ALUGUEL' AND (corretor_id = current_app_user_id() OR (is_bolsao = true AND is_closed = false))) OR
      (current_app_user_role() = 'CORRETOR' AND (corretor_id = current_app_user_id() OR (is_bolsao = true AND is_closed = false)))
    )
  );

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
          current_app_user_role() = 'ADMINISTRADOR' OR
          (current_app_user_role() = 'FINANCEIRO_VENDA' AND leads.modalidade = 'VENDA') OR
          (current_app_user_role() = 'FINANCEIRO_ALUGUEL' AND leads.modalidade = 'ALUGUEL') OR
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
          current_app_user_role() = 'ADMINISTRADOR' OR
          (current_app_user_role() = 'FINANCEIRO_VENDA' AND leads.modalidade = 'VENDA') OR
          (current_app_user_role() = 'FINANCEIRO_ALUGUEL' AND leads.modalidade = 'ALUGUEL') OR
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
-- 7. POLÍTICAS PARA ALUGUEL DE VERANEIO E LOCAÇÃO ANUAL
-- ------------------------------------------------------------------------------
CREATE POLICY season_bookings_policy ON season_bookings
  FOR ALL
  USING (
    organization_id = current_app_org_id() AND (
      current_app_user_role() IN ('ADMINISTRADOR', 'FINANCEIRO_ALUGUEL') OR
      corretor_id = current_app_user_id()
    )
  );

CREATE POLICY rental_contracts_policy ON rental_contracts
  FOR ALL
  USING (
    organization_id = current_app_org_id() AND (
      current_app_user_role() IN ('ADMINISTRADOR', 'FINANCEIRO_ALUGUEL') OR
      corretor_id = current_app_user_id()
    )
  );

-- ------------------------------------------------------------------------------
-- 8. POLÍTICAS PARA VENDAS (SALES)
-- ------------------------------------------------------------------------------
CREATE POLICY sales_policy ON sales
  FOR ALL
  USING (
    organization_id = current_app_org_id() AND (
      current_app_user_role() IN ('ADMINISTRADOR', 'FINANCEIRO_VENDA') OR
      corretor_id = current_app_user_id()
    )
  );

-- ------------------------------------------------------------------------------
-- 9. POLÍTICAS PARA SPLIT DE COMISSÕES (COMMISSION_SPLITS)
-- ------------------------------------------------------------------------------
CREATE POLICY commission_splits_policy ON commission_splits
  FOR ALL
  USING (
    current_app_user_role() IN ('ADMINISTRADOR', 'FINANCEIRO_VENDA', 'FINANCEIRO_ALUGUEL') OR
    user_id = current_app_user_id()
  );

-- ------------------------------------------------------------------------------
-- 10. POLÍTICAS PARA ERP / FLUXO DE CAIXA (CASH_FLOWS)
-- ------------------------------------------------------------------------------
CREATE POLICY cash_flows_policy ON cash_flows
  FOR ALL
  USING (
    organization_id = current_app_org_id() AND (
      current_app_user_role() = 'ADMINISTRADOR' OR
      (current_app_user_role() = 'FINANCEIRO_VENDA' AND modalidade = 'VENDA') OR
      (current_app_user_role() = 'FINANCEIRO_ALUGUEL' AND modalidade = 'ALUGUEL')
    )
  );

-- ------------------------------------------------------------------------------
-- 11. POLÍTICAS PARA AGENDA (APPOINTMENTS)
-- ------------------------------------------------------------------------------
CREATE POLICY appointments_policy ON appointments
  FOR ALL
  USING (
    organization_id = current_app_org_id() AND (
      current_app_user_role() = 'ADMINISTRADOR' OR
      user_id = current_app_user_id()
    )
  );
