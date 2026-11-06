-- ==============================================================================
-- CONNECT PLATZ CRM & ERP — POLÍTICAS DE ROW LEVEL SECURITY (RLS) NO POSTGRESQL
-- ==============================================================================
-- Habilita RLS e cria funções de sessão e políticas de isolamento multi-tenant

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
-- FUNÇÕES AUXILIARES PARA CONSULTAR VARIÁVEIS DE SESSÃO
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
DROP POLICY IF EXISTS org_isolation_policy ON organizations;
CREATE POLICY org_isolation_policy ON organizations
  FOR ALL
  USING (id = current_app_org_id());

-- ------------------------------------------------------------------------------
-- 3. POLÍTICAS PARA USERS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS users_view_org_policy ON users;
CREATE POLICY users_view_org_policy ON users
  FOR SELECT
  USING ("organizationId" = current_app_org_id());

DROP POLICY IF EXISTS users_self_update_policy ON users;
CREATE POLICY users_self_update_policy ON users
  FOR UPDATE
  USING (
    "organizationId" = current_app_org_id() AND
    (id = current_app_user_id() OR current_app_user_role() LIKE 'ADMINISTRADOR%')
  );

-- ------------------------------------------------------------------------------
-- 4. POLÍTICAS PARA LEADS (ISOLAMENTO POR MODALIDADE E CORRETOR)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS leads_select_policy ON leads;
CREATE POLICY leads_select_policy ON leads
  FOR SELECT
  USING (
    "organizationId" = current_app_org_id() AND (
      current_app_user_role() LIKE 'ADMINISTRADOR%' OR
      (current_app_user_role() = 'FINANCEIRO_VENDA' AND modalidade = 'VENDA') OR
      (current_app_user_role() = 'FINANCEIRO_ALUGUEL' AND modalidade = 'ALUGUEL') OR
      (current_app_user_role() = 'CORRETOR_VENDA' AND modalidade = 'VENDA' AND ("corretorId" = current_app_user_id() OR ("isBolsao" = true AND "isClosed" = false))) OR
      (current_app_user_role() = 'CORRETOR_ALUGUEL' AND modalidade = 'ALUGUEL' AND ("corretorId" = current_app_user_id() OR ("isBolsao" = true AND "isClosed" = false))) OR
      ("corretorId" = current_app_user_id() OR ("isBolsao" = true AND "isClosed" = false))
    )
  );

DROP POLICY IF EXISTS leads_update_policy ON leads;
CREATE POLICY leads_update_policy ON leads
  FOR UPDATE
  USING (
    "organizationId" = current_app_org_id() AND (
      current_app_user_role() LIKE 'ADMINISTRADOR%' OR
      (current_app_user_role() = 'FINANCEIRO_VENDA' AND modalidade = 'VENDA') OR
      (current_app_user_role() = 'FINANCEIRO_ALUGUEL' AND modalidade = 'ALUGUEL') OR
      (current_app_user_role() = 'CORRETOR_VENDA' AND modalidade = 'VENDA' AND ("corretorId" = current_app_user_id() OR ("isBolsao" = true AND "isClosed" = false))) OR
      (current_app_user_role() = 'CORRETOR_ALUGUEL' AND modalidade = 'ALUGUEL' AND ("corretorId" = current_app_user_id() OR ("isBolsao" = true AND "isClosed" = false))) OR
      ("corretorId" = current_app_user_id() OR ("isBolsao" = true AND "isClosed" = false))
    )
  );

DROP POLICY IF EXISTS leads_insert_policy ON leads;
CREATE POLICY leads_insert_policy ON leads
  FOR INSERT
  WITH CHECK (
    "organizationId" = current_app_org_id()
  );

-- ------------------------------------------------------------------------------
-- 5. POLÍTICAS PARA TIMELINE E DOCUMENTOS DO LEAD
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS lead_timeline_policy ON lead_timeline;
CREATE POLICY lead_timeline_policy ON lead_timeline
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_timeline."leadId"
        AND leads."organizationId" = current_app_org_id()
        AND (
          current_app_user_role() LIKE 'ADMINISTRADOR%' OR
          (current_app_user_role() = 'FINANCEIRO_VENDA' AND leads.modalidade = 'VENDA') OR
          (current_app_user_role() = 'FINANCEIRO_ALUGUEL' AND leads.modalidade = 'ALUGUEL') OR
          leads."corretorId" = current_app_user_id()
        )
    )
  );

DROP POLICY IF EXISTS lead_documents_policy ON lead_documents;
CREATE POLICY lead_documents_policy ON lead_documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_documents."leadId"
        AND leads."organizationId" = current_app_org_id()
        AND (
          current_app_user_role() LIKE 'ADMINISTRADOR%' OR
          (current_app_user_role() = 'FINANCEIRO_VENDA' AND leads.modalidade = 'VENDA') OR
          (current_app_user_role() = 'FINANCEIRO_ALUGUEL' AND leads.modalidade = 'ALUGUEL') OR
          leads."corretorId" = current_app_user_id()
        )
    )
  );

-- ------------------------------------------------------------------------------
-- 6. POLÍTICAS PARA IMÓVEIS E ESPELHO DE VENDAS (PROPERTIES & PROPERTY_UNITS)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS properties_policy ON properties;
CREATE POLICY properties_policy ON properties
  FOR ALL
  USING ("organizationId" = current_app_org_id());

DROP POLICY IF EXISTS property_units_policy ON property_units;
CREATE POLICY property_units_policy ON property_units
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_units."propertyId"
        AND properties."organizationId" = current_app_org_id()
    )
  );

-- ------------------------------------------------------------------------------
-- 7. POLÍTICAS PARA ALUGUEL DE VERANEIO E LOCAÇÃO ANUAL
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS season_bookings_policy ON season_bookings;
CREATE POLICY season_bookings_policy ON season_bookings
  FOR ALL
  USING (
    "organizationId" = current_app_org_id() AND (
      current_app_user_role() IN ('ADMINISTRADOR', 'ADMINISTRADOR_ALUGUEL', 'FINANCEIRO_ALUGUEL') OR
      "corretorId" = current_app_user_id()
    )
  );

DROP POLICY IF EXISTS rental_contracts_policy ON rental_contracts;
CREATE POLICY rental_contracts_policy ON rental_contracts
  FOR ALL
  USING (
    "organizationId" = current_app_org_id() AND (
      current_app_user_role() IN ('ADMINISTRADOR', 'ADMINISTRADOR_ALUGUEL', 'FINANCEIRO_ALUGUEL') OR
      "corretorId" = current_app_user_id()
    )
  );

-- ------------------------------------------------------------------------------
-- 8. POLÍTICAS PARA VENDAS (SALES)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS sales_policy ON sales;
CREATE POLICY sales_policy ON sales
  FOR ALL
  USING (
    "organizationId" = current_app_org_id() AND (
      current_app_user_role() IN ('ADMINISTRADOR', 'ADMINISTRADOR_VENDA', 'FINANCEIRO_VENDA') OR
      "corretorId" = current_app_user_id()
    )
  );

-- ------------------------------------------------------------------------------
-- 9. POLÍTICAS PARA SPLIT DE COMISSÕES (COMMISSION_SPLITS)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS commission_splits_policy ON commission_splits;
CREATE POLICY commission_splits_policy ON commission_splits
  FOR ALL
  USING (
    current_app_user_role() IN ('ADMINISTRADOR', 'ADMINISTRADOR_VENDA', 'ADMINISTRADOR_ALUGUEL', 'FINANCEIRO_VENDA', 'FINANCEIRO_ALUGUEL') OR
    "userId" = current_app_user_id()
  );

-- ------------------------------------------------------------------------------
-- 10. POLÍTICAS PARA ERP / FLUXO DE CAIXA (CASH_FLOWS)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS cash_flows_policy ON cash_flows;
CREATE POLICY cash_flows_policy ON cash_flows
  FOR ALL
  USING (
    "organizationId" = current_app_org_id() AND (
      current_app_user_role() LIKE 'ADMINISTRADOR%' OR
      (current_app_user_role() = 'FINANCEIRO_VENDA' AND modalidade = 'VENDA') OR
      (current_app_user_role() = 'FINANCEIRO_ALUGUEL' AND modalidade = 'ALUGUEL')
    )
  );

-- ------------------------------------------------------------------------------
-- 11. POLÍTICAS PARA AGENDA (APPOINTMENTS)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS appointments_policy ON appointments;
CREATE POLICY appointments_policy ON appointments
  FOR ALL
  USING (
    "organizationId" = current_app_org_id() AND (
      current_app_user_role() LIKE 'ADMINISTRADOR%' OR
      "userId" = current_app_user_id()
    )
  );

-- ------------------------------------------------------------------------------
-- 12. POLÍTICAS PARA AUDIT_LOGS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS audit_logs_policy ON audit_logs;
CREATE POLICY audit_logs_policy ON audit_logs
  FOR ALL
  USING ("organizationId" = current_app_org_id());
