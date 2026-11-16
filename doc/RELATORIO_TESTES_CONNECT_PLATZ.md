# Relatório Consolidado de Testes — Connect Platz CRM

**Data de Execução:** 13/11/2026  
**Ambiente:** macOS • Node.js `v20.20.2` • Vitest `v2.1.9` • Playwright `v1.64.1` (Chromium Headless)

---

## 1. Resumo Executivo

| Categoria | Ferramenta / Escopo | Arquivos Executados | Casos de Teste | Resultado |
|---|---|---:|---:|---|
| **Testes Unitários & Componentes** | `vitest run` (`tests/unit/*.test.{ts,tsx}`) | 26 | 119 | **119/119 Aprovados** |
| **Testes de Segurança** | `vitest run` (`tests/unit/securitySuite.test.ts`) | 1 | 13 | **13/13 Aprovados** |
| **Testes de Ponta a Ponta (E2E)** | `playwright test` (`tests/e2e/full-system-e2e.spec.ts`) | 1 | 5 | **5/5 Aprovados** |
| **Total Geral Executado** | — | **28** | **137** | **137/137 Aprovados (100%)** |

> **Observação de Escopo (E2E):** Como o banco PostgreSQL local não estava ativo no momento da execução, a suíte E2E (`tests/e2e/full-system-e2e.spec.ts`) foi executada contra o servidor real do Next.js (`npx next dev -p 3010`) utilizando tokens JWT assinados com `JWT_SECRET` do `.env` e interceptação determinística das rotas `/api/**` no navegador Chromium.

---

## 2. Testes Unitários e de Componentes (`npm test`)

Executados via `npm test` (`vitest run`), cobrindo **26 arquivos** e **119 casos** de regras de negócio, métricas, otimização de imagem, RBAC e componentes React:

| Arquivo | Testes | O que valida |
|---|---:|---|
| `tests/unit/rbacAndRoletaModality.test.ts` | 11 | Segregação dos 7 perfis e distribuição de Roleta por modalidade (Venda x Aluguel) |
| `tests/unit/locacaoRepasseFeatures.test.ts` | 10 | Regras de locação anual, temporada, repasse e prevenção de conflitos |
| `tests/unit/onda4Features.test.ts` | 9 | Funcionalidades de governança, auditoria e metas |
| `tests/unit/onda5Features.test.ts` | 9 | Recursos avançados de BI, exportação e configurações |
| `tests/unit/propertyDeleteRoute.test.ts` | 7 | Permissão de exclusão de imóveis para `ADMINISTRADOR`, `ADMINISTRADOR_VENDA` e `ADMINISTRADOR_ALUGUEL` |
| `tests/unit/propertyModalityScope.test.ts` | 7 | Escopo de modalidades visíveis e editáveis por perfil |
| `tests/unit/vitrineShowcase.test.tsx` | 5 | Vitrine de Capítulos ("Sua vida mudou de fase?") e vínculo com imóveis reais |
| `tests/unit/bairrosDinamicos.test.ts` | 5 | Diretório dinâmico de bairros/cidades por modalidade |
| `tests/unit/vendasMetrics.test.ts` | 5 | Cálculos determinísticos de VGV, comissões, impostos e splits |
| `tests/unit/onda1Features.test.ts` | 5 | Regras base do CRM, SLA e Score |
| `tests/unit/TrendBadgeSanitization.test.tsx` | 4 | Sanitização de sinais/setas (`+`, `-`, `%`) sem duplicação visual |
| `tests/unit/CrossFunnelBanner.test.tsx` | 4 | Banner de transição entre funis (Venda / Locação) |
| `tests/unit/imageOptimizer.test.ts` | 4 | Otimização de imagens (`sharp`) e conversão para WebP/AVIF |
| `tests/unit/period.test.ts` | 4 | Filtros temporais (`Mês atual`, `Semana`, `Ano`, `Tudo`) |
| `tests/unit/useLeadsActions.test.ts` | 4 | Ações rápidas do Kanban de Leads |
| `tests/unit/LeadCard.test.tsx` | 3 | Renderização de card de Lead, Score e badges de SLA |
| `tests/unit/onda3Features.test.ts` | 3 | Fluxos operacionais intermediários |
| `tests/unit/cacheService.test.ts` | 3 | Serviço de cache em memória com invalidação |
| `tests/unit/useDebounce.test.ts` | 3 | Debounce determinístico de campos de busca |
| `tests/unit/onda2Features.test.ts` | 2 | Regras da Onda 2 |
| `tests/unit/ChangeBrokerModal.test.tsx` | 2 | Modal de troca de corretor responsável |
| `tests/unit/LeadCardMenu.test.tsx` | 2 | Menu de contexto (`⋮`) do card de Lead |
| `tests/unit/LeadDetailsSections.test.tsx` | 2 | Seções do Drawer de detalhes do Lead |
| `tests/unit/LeadDrawerHeader.test.tsx` | 2 | Cabeçalho do Drawer do Lead |
| `tests/unit/NewBookingModal.test.tsx` | 2 | Modal de nova reserva de temporada |
| `tests/unit/NewSaleModal.test.tsx` | 2 | Modal de nova venda e solicitação de fechamento |

---

## 3. Testes de Segurança (`tests/unit/securitySuite.test.ts`)

Criados e executados com Vitest (`13/13` aprovados em `954ms` isolado / `2775ms` na suíte completa):

1. **Autenticação JWT & Integridade de Sessão (3 testes)**
   - Valida assinatura e decodificação de token legítimo (`signSessionToken` / `verifySessionToken`).
   - Rejeita token vazio, malformado ou com assinatura adulterada.
   - Rejeita token forjado com chave secreta de atacante ou cabeçalho `alg: "none"`.
2. **Política de Senhas & Hash Bcrypt (2 testes)**
   - Recusa senhas com menos de 6 caracteres.
   - Garante geração de hash `bcrypt` (`$2...`), nunca texto plano, e valida `verifyPassword`.
3. **RBAC & Segregação Estrita por Modalidade (4 testes)**
   - Confirma que `canManageSaleValues` libera apenas `ADMINISTRADOR`, `ADMINISTRADOR_VENDA` e `FINANCEIRO_VENDA`.
   - Confirma que `canManageRentalValues` libera apenas `ADMINISTRADOR`, `ADMINISTRADOR_ALUGUEL` e `FINANCEIRO_ALUGUEL`.
   - Valida `canDeletePropertyForRole`: bloqueia exclusão cruzada (ex.: `ADMINISTRADOR_VENDA` não apaga `VERANEIO_TEMPORADA` nem `LOCACAO_ANUAL`; `ADMINISTRADOR_ALUGUEL` não apaga `VENDA` nem `REPASSE`; corretores e financeiros são bloqueados).
   - Confirma `getUserModality` para Venda, Aluguel e Ambos.
4. **Autenticação de Webhooks — Fail-Closed em Produção (3 testes)**
   - Em `NODE_ENV=production` sem segredo configurado, retorna `503` (bloqueio seguro).
   - Sem chave ou com chave errada, retorna `401` usando comparação `timingSafeEqual`.
   - Aceita chave válida via `x-api-key`, `Authorization: Bearer` e `?token=`.
5. **Cloudflare R2 & Sanitização de URL Pública (1 teste)**
   - Valida `getR2PublicBaseUrl()` removendo barras finais e garantindo prefixo `https://`.

---

## 4. Testes de Ponta a Ponta / E2E (`tests/e2e/full-system-e2e.spec.ts`)

Executados no Chromium via Playwright (`PLAYWRIGHT_TEST_BASE_URL=http://localhost:3010 npx playwright test tests/e2e/full-system-e2e.spec.ts`), totalizando **5/5 aprovados em 10,2s**:

1. **Portal Público & Redirecionamento de Sessão (`1.4s`)**
   - Carrega `/`, verifica a exibição da seção **Vitrine de Capítulos** (*"Encontre o imóvel certo para o próximo capítulo."*) e do card real `VILLA PLATZ BEACH RESIDENCE`.
   - Tenta acessar `/crm` sem cookie de sessão e valida redirecionamento para `/login`.
2. **Segurança RBAC no Middleware (`2.5s`)**
   - Autentica como `CORRETOR_VENDA` e tenta acessar `/crm/fluxo-de-caixa`, `/crm/equipes`, `/crm/integracoes` e `/crm/auditoria`.
   - Valida que todas as 4 rotas são bloqueadas e redirecionadas para `/crm/leads?denied=true`.
3. **Fluxo Completo do Administrador (`3.5s`)**
   - Acessa `/crm` (Dashboard), navega pelo menu lateral até **Empreendimentos → Configurações Site → Vitrine de Capítulos** (validando o botão `Carregar Imóveis Reais`) e acessa **Log e Auditoria** (`Log & Auditoria do Sistema`).
4. **Fluxo do Corretor de Vendas (`941ms`)**
   - Acessa `/crm/leads`, valida a exibição do lead no Kanban (`Mariana Albuquerque`) e confirma que os links restritos (`Fluxo de Caixa`, `Equipe`) não existem na sidebar.
5. **Fluxo do Corretor de Aluguel / Temporada (`766ms`)**
   - Acessa `/crm/temporada`, valida o módulo `Gestão de Aluguel & Temporada`, a reserva confirmada (`Camila Vasconcelos`) e o indicador de prevenção de overbooking (`100% Protegido`).

---

## 5. Comandos para Reprodução

```bash
# 1. Testes Unitários + Segurança (Vitest)
npm test

# 2. Somente Suíte de Segurança
npx vitest run tests/unit/securitySuite.test.ts

# 3. Testes de Ponta a Ponta (Playwright E2E com servidor Next.js na porta 3010)
npx next dev -p 3010
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3010 npx playwright test tests/e2e/full-system-e2e.spec.ts
```
