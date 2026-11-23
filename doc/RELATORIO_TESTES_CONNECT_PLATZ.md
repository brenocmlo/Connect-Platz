# Relatório Consolidado de Testes — Connect Platz CRM

**Última Atualização:** 18/11/2026  
**Branch:** `test/validacao-completa-sistema`  
**Ambiente:** macOS • Node.js `v24.14.1` • Next.js `v14.2.35` • Vitest `v2.1.9` • Playwright `v1.64.1` (Chromium Headless)

> Consulte também o relatório detalhado completo desta rodada em [RELATORIO_VALIDACAO_COMPLETA_SISTEMA.md](file:///Users/a1234/Connect-Platz/doc/RELATORIO_VALIDACAO_COMPLETA_SISTEMA.md).

---

## 1. Resumo Executivo

| Categoria | Ferramenta / Escopo | Arquivos / Scripts | Casos | Resultado |
|---|---|---:|---:|---|
| **Testes Unitários & Componentes** | `vitest run` (`tests/unit/*.test.{ts,tsx}`) | 26 | 119 | **119/119 Aprovados** |
| **Testes de Regras de Negócio** | `vitest run` (`tests/unit/businessRulesSuite.test.ts`) | 1 | 11 | **11/11 Aprovados** |
| **Testes de Segurança** | `vitest run` (`tests/unit/securitySuite.test.ts`) | 1 | 18 | **18/18 Aprovados** |
| **Testes de Conformidade** | `vitest run` (`tests/unit/complianceSuite.test.ts`) + scripts | 1 + 2 scripts | 9 + 2 | **11/11 Aprovados** |
| **Testes de Ponta a Ponta (E2E)** | `playwright test` (`tests/e2e/full-system-e2e.spec.ts`) | 1 | 6 | **6/6 Aprovados** |
| **Build de Produção (`next build`)** | `npm run build` | Completo | 39 páginas estáticas | **Aprovado (Exit 0)** |
| **Total Vitest (`npm test`)** | — | **29 arquivos** | **157 casos** | **157/157 Aprovados (92,23s)** |

> **Observação de Escopo (E2E):** O PostgreSQL local (`porta 5432`) não estava ativo e o Docker estava indisponível; portanto, a suíte E2E (`tests/e2e/full-system-e2e.spec.ts`) foi executada contra o servidor real do Next.js (`npx next dev -p 3010`) utilizando tokens JWT assinados com `JWT_SECRET` do `.env`, interceptação determinística de `/api/**` no navegador Chromium e `--timeout=90000` (após timeouts de cold-compile em 2 rotas na tentativa inicial de 30s). Suítes E2E acopladas ao banco ativo não foram executadas.

---

## 2. Testes Unitários e de Componentes (26 arquivos • 119/119)

| Arquivo | Testes | O que valida |
|---|---:|---|
| `tests/unit/rbacAndRoletaModality.test.ts` | 11 | Segregação dos 7 perfis e distribuição de Roleta por modalidade (Venda x Aluguel) |
| `tests/unit/locacaoRepasseFeatures.test.ts` | 10 | Regras de locação anual, temporada, repasse e prevenção de conflitos |
| `tests/unit/onda4Features.test.ts` | 9 | Aluguel anual, overbooking, comprovante no fluxo de caixa e agenda |
| `tests/unit/onda5Features.test.ts` | 9 | Período personalizado BI/DRE, inferência de tipo `Chacara` e regras de crédito |
| `tests/unit/propertyDeleteRoute.test.ts` | 7 | Permissão de exclusão/edição de imóveis para Admin Geral, Venda e Aluguel |
| `tests/unit/propertyModalityScope.test.ts` | 7 | Escopo de modalidades visíveis e editáveis por perfil |
| `tests/unit/vitrineShowcase.test.tsx` | 5 | Vitrine de Capítulos e vínculo com imóveis reais |
| `tests/unit/bairrosDinamicos.test.ts` | 5 | Diretório dinâmico de bairros/cidades e resolvedor de POIs |
| `tests/unit/vendasMetrics.test.ts` | 5 | Janelas de período e totalizadores de VGV e comissões |
| `tests/unit/onda1Features.test.ts` | 5 | Segregação de perfis admin e RLS de leads |
| `tests/unit/TrendBadgeSanitization.test.tsx` | 4 | Sanitização de sinais/setas (`+`, `-`, `%`) sem duplicação visual |
| `tests/unit/CrossFunnelBanner.test.tsx` | 4 | Banner de transição entre funis (Venda / Locação) |
| `tests/unit/imageOptimizer.test.ts` | 4 | Otimização de imagens (`sharp`) e conversão para WebP |
| `tests/unit/period.test.ts` | 4 | Filtros temporais (`7d`, `30d`) sem sobreposição em colunas `@db.Date` |
| `tests/unit/useLeadsActions.test.ts` | 4 | Gatilhos de etapa e ações rápidas do Kanban de Leads |
| `tests/unit/LeadCard.test.tsx` | 3 | Renderização de card de Lead e alerta de pendência financeira |
| `tests/unit/onda3Features.test.ts` | 3 | Repasse financeiro com conservação de VGV, filtro por ano e comprovante |
| `tests/unit/cacheService.test.ts` | 3 | Cache em memória com TTL e invalidação por padrão |
| `tests/unit/useDebounce.test.ts` | 3 | Debounce determinístico de campos de busca |
| `tests/unit/onda2Features.test.ts` | 2 | Progressão de score por etapa e ordem nominal do funil |
| `tests/unit/ChangeBrokerModal.test.tsx` | 2 | Modal de troca de corretor responsável |
| `tests/unit/LeadCardMenu.test.tsx` | 2 | Menu de contexto (`⋮`) do card de Lead por perfil |
| `tests/unit/LeadDetailsSections.test.tsx` | 2 | Seções de compromissos do Drawer de detalhes do Lead |
| `tests/unit/LeadDrawerHeader.test.tsx` | 2 | Cabeçalho do Drawer do Lead e troca de corretor |
| `tests/unit/NewBookingModal.test.tsx` | 2 | Modal de nova reserva de temporada e bloqueio HTTP 409 |
| `tests/unit/NewSaleModal.test.tsx` | 2 | Modal de nova venda e pré-preenchimento de lead ganho |

---

## 3. Regras de Negócio, Segurança, Conformidade e E2E

- **Regras de Negócio (`tests/unit/businessRulesSuite.test.ts` — 11/11):** score determinístico (0–100), políticas CLT/Autônomo/OCP, ingestão com deduplicação/fila noturna/modalidade, precificação e ficha de imóveis, captura UTM (`propertyId`/`_fbp`/`_fbc`) e validação de payload.
- **Segurança (`tests/unit/securitySuite.test.ts` — 18/18):** JWT HS256, política Bcrypt, RBAC estrito dos 7 perfis, fail-closed de webhooks, R2 URL, assinatura HMAC SHA-256 Meta Ads e proteção Zero-Trust no `middleware.ts`.
- **Conformidade (`tests/unit/complianceSuite.test.ts` — 9/9 + 2 scripts Node):** GovTech CPF/CNPJ Módulo 11, LGPD RLS & mascaramento PII, limite máximo de 400 linhas em todos os arquivos `.ts`/`.tsx` (`0` violações), ausência de itens proibidos na Sidebar, 7 roles no `prisma/schema.prisma`, PWA + R2 S3 SDK, `test-solid-architecture.mjs` e `test-validation.mjs`.
- **Ponta a Ponta (`tests/e2e/full-system-e2e.spec.ts` — 6/6):** Portal Público + redirecionamento `/crm` -> `/login`, RBAC Corretores, fluxo completo Admin, Kanban Corretor Venda, Temporada Corretor Aluguel e segregação cruzada `ADMINISTRADOR_ALUGUEL` / `FINANCEIRO_VENDA`.

---

## 4. Comandos para Reprodução

```bash
npm test
node scripts/test-solid-architecture.mjs && node scripts/test-validation.mjs
npx next dev -p 3010
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3010 npx playwright test tests/e2e/full-system-e2e.spec.ts --timeout=90000
npm run build
```
