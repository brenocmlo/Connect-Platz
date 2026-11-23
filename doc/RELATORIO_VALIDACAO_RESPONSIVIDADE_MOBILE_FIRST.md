# Relatório de Validação de Responsividade Mobile-First — Connect Platz

**Data da Validação:** 23/11/2026  
**Escopo:** Landing Page / Portal Público (`/`, `/imoveis/[slug]`, `/login`), Shell Global do CRM e todos os 15 módulos (`/crm/**`).  
**Critério Principal:** Ausência de overflow horizontal (`document.documentElement.scrollWidth <= window.innerWidth` e `document.body.scrollWidth <= window.innerWidth`), integridade visual, ergonômica e contenção dentro da viewport em múltiplos breakpoints.

---

## 1. Matriz de Viewports Validados (Chromium / Playwright)

| Perfil | Resolução | Finalidade |
|---|---|---|
| `mobile-se` | `320×568` | Viewport estreita extrema (garantia de zero quebra sem scroll lateral) |
| `mobile-iphone` | `375×812` | Smartphone padrão iOS/Android em modo retrato |
| `tablet` | `768×1024` | Breakpoint de transição `md:` (ocultação da barra inferior mobile e exibição da barra lateral) |
| `desktop` | `1280×800` | Viewport desktop padrão |

---

## 2. Cobertura da Validação Automatizada (`tests/e2e/mobile-first-responsiveness.spec.ts`)

Execução com servidor de produção Next.js (`npx next start -p 3010`), cookie JWT assinado (`connect_platz_token`, perfil `ADMINISTRADOR`) e mocks determinísticos de `/api/**` em `tests/e2e/mobileMocks.ts` (sem dependência do PostgreSQL local).

### 2.1 Landing Page e Rotas Públicas
- **`/` (`mobile-se`, `mobile-iphone`, `tablet`, `desktop`)**:
  - Verificação de zero overflow horizontal em página inteira, no modo grade de listagens (`Ver em Grade`), no rodapé (`footer`) e na abertura do modal de contato.
  - Abas do Hero (`Comprar`, `Alugar`, `Temporada`, `Repasses` no `tablist` `Modalidade`) visíveis e com `boundingBox` estritamente contida na largura da viewport em todas as resoluções (inclusive `320×568`).
  - Menu mobile (`PortalMobileMenu` via botão `Abrir menu` / `Fechar menu`) validado sem overflow horizontal em `< 768px`.
- **`/login` e `/imoveis/villa-platz-residence` (`320×568` e `375×812`)**:
  - Zero overflow horizontal; botão de autenticação (`Entrar...`) visível e integralmente dentro dos limites da viewport.

### 2.2 Shell Global do CRM (`320×568` vs `768×1024`)
- **`Sidebar` (`aside`)**: Recolhida fora da viewport em `320×568` inicialmente, desliza para dentro ao acionar o botão `Menu` da barra inferior móvel e fecha ao clicar fora (backdrop).
- **`MobileBottomBar` (`nav.md:hidden`)**: Visível em `< 768px` e oculta automaticamente em `768×1024`.
- **Popovers do Cabeçalho**: `PeriodSelector` e popover do sino de notificações abrem em `320×568` sem estourar a largura da tela.

### 2.3 Todos os 15 Módulos do CRM e Fluxos Interativos
Rotas validadas com zero overflow horizontal nos 4 viewports (`320×568`, `375×812`, `768×1024`, `1280×800`):
- `/crm` · `/crm/leads` · `/crm/agenda` · `/crm/whatsapp` · `/crm/vendas` · `/crm/temporada` · `/crm/fluxo-de-caixa` · `/crm/empreendimentos` · `/crm/ranking` · `/crm/ranking/tv` · `/crm/relatorios` · `/crm/equipes` · `/crm/integracoes` · `/crm/auditoria` · `/crm/configuracoes`

Fluxos interativos validados em `320×568` / `375×812`:
- **`/crm/leads`**: Visão Kanban, alternância para `Lista`, abertura do `LeadDrawer` ao selecionar lead e modal `NewLeadModal`.
- **`/crm/agenda`**: Alternância entre modos `Dia`, `Semana`, `Mês` e `Todos`.
- **`/crm/fluxo-de-caixa`**: Abas `DRE` (`DreTable`) e `Projeção` (`CashFlowProjection`).
- **`/crm/empreendimentos`**: Aba `Configurações do Site` (`SiteSettingsTab`).
- **`/crm/configuracoes`**: Abas `Minha Conta`, `Notificações PWA`, `Dados da Imobiliária`, `Regras de SLA` e `Régua de Score`.
- **`/crm/vendas`**: Abertura do modal `NewSaleModal` em `375×812`.

---

## 3. Melhorias Mobile-First Implementadas (24 Arquivos de UI + 2 Arquivos E2E)

### 3.1 Landing Page e Portal Público
- **`components/portal/PortalHero.tsx`** (`224` linhas): `role="tablist"` adaptado para `grid grid-cols-2` em telas pequenas (`sm:inline-flex` em telas maiores), espaçamento/tipografia compactos (`px-2.5 text-xs`) e arredondamento responsivo do formulário.
- **`components/portal/PortalWhyUs.tsx`** (`178` linhas): Grid dos `StatPin` ajustado para `gap-x-3 gap-y-6 pb-8` (`sm:gap-x-10 sm:pb-10`) e deslocamento escalonado reduzido (`translate-y-6 sm:translate-y-10`) evitando sobreposição vertical no mobile.
- **`components/portal/PortalAllBairrosModal.tsx`** (`229` linhas): Padding responsivo de cabeçalho e quebra flexível (`flex-wrap`) no rodapé.

### 3.2 Shell Global do CRM
- **`components/crm/PageHeader.tsx`** (`212` linhas): Quebra automática (`flex-wrap max-w-full`) no seletor de datas personalizado e posicionamento do menu `PeriodSelector` alinhado à esquerda (`left-0 max-w-[calc(100vw-2rem)]`) para não cortar na borda esquerda mobile.
- **`components/crm/Topbar.tsx`** (`133` linhas): Contenção (`min-w-0 flex-1`, `truncate` em mensagens de ação) e largura fluida do popover de notificações (`w-[min(20rem,calc(100vw-1.5rem))] sm:w-80`).
- **`components/crm/PwaInstallPrompt.tsx`** (`144` linhas): Banner elevado no mobile (`bottom-20 md:bottom-4`) para não cobrir a `MobileBottomBar`.
- **`components/crm/LeadDrawer.tsx`** (`141` linhas) e **`components/crm/lead-drawer/LeadDrawerActions.tsx`** (`121` linhas): Abas com scroll horizontal (`overflow-x-auto no-scrollbar`, `whitespace-nowrap shrink-0`) e `safe-area-inset-bottom` no rodapé de ações.

### 3.3 Módulos e Modais do CRM
- **`app/crm/page.tsx`** (`164` linhas) & **`app/crm/fluxo-de-caixa/page.tsx`** (`326` linhas) & **`app/crm/empreendimentos/page.tsx`** (`305` linhas) & **`app/crm/equipes/page.tsx`** (`244` linhas) & **`app/crm/integracoes/page.tsx`** (`80` linhas): Barras de filtro e abas de navegação com `w-full max-w-full overflow-x-auto no-scrollbar` e botões com `whitespace-nowrap shrink-0`.
- **`components/crm/financeiro/DreTable.tsx`** (`191` linhas) & **`components/crm/financeiro/CashFlowProjection.tsx`** (`140` linhas): Padding compacto (`p-4 sm:p-6`), truncamento inteligente de rótulos contábeis, colunas numéricas compactas no mobile e legenda com `flex-wrap`.
- **`components/crm/properties/PropertyListSection.tsx`** (`303` linhas), **`SiteSettingsTab.tsx`** (`280` linhas) e **`SiteVitrineManagerSection.tsx`** (`177` linhas): Controles de cabeçalho e busca com `flex-wrap` e largura fluida no mobile.
- **`components/crm/agenda/AgendaTodosView.tsx`** (`275` linhas): Range de datas com `flex-wrap w-full md:w-auto`.
- **`components/crm/configuracoes/SlaEngineTab.tsx`** (`215` linhas): Controles de SLA fluidos com `flex-1 min-w-0 max-w-full truncate`.
- **`components/crm/leads/EditLeadModal.tsx`** (`327` linhas): Grids do formulário convertidos de `grid-cols-2` fixo para `grid-cols-1 sm:grid-cols-2` e cabeçalho do corretor com `flex-wrap`.
- **`components/crm/vendas/SaleParticipantsSection.tsx`** (`178` linhas), **`SaleDetailModal.tsx`** (`320` linhas) e **`CommissionReceiptModal.tsx`** (`259` linhas): Empilhamento em 1 coluna no mobile (`grid-cols-1 sm:grid-cols-*`), cabeçalhos com `flex-wrap` e linhas de assinatura fluidas (`w-full max-w-[12rem]`).

### 3.4 Arquivos da Suíte de Validação Criados
- **`tests/e2e/mobileMocks.ts`** (`322` linhas)
- **`tests/e2e/mobile-first-responsiveness.spec.ts`** (`280` linhas)

---

## 4. Resultados Finais das Verificações Executadas

| Verificação | Comando | Resultado | Escopo / Observações |
|---|---|---|---|
| **Build de Produção** | `npm run build` | **Aprovado (código 0)** | Compilação, ESLint, TypeScript e geração de 41/41 páginas estáticas sem erros |
| **Testes E2E Mobile-First (Playwright)** | `PLAYWRIGHT_TEST_BASE_URL=http://localhost:3010 npx playwright test tests/e2e/mobile-first-responsiveness.spec.ts --timeout=90000` | **11/11 aprovados (0 falhas, 1.1m)** | Executado contra build de produção na porta `3010` com mocks determinísticos de `/api/**` e sessão JWT |
| **Conformidade & Limite de 400 Linhas** | `npx vitest run tests/unit/complianceSuite.test.ts` | **9/9 aprovados (11.03s)** | Validado após todas as edições; garante que todos os arquivos TS/TSX de produção e teste têm `<= 400` linhas (máximo entre alterados/criados: `327` linhas) |
