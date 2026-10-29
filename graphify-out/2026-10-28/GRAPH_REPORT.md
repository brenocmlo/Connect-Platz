# Graph Report - Connect-Platz  (2026-10-26)

## Corpus Check
- 405 files · ~250,045 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .jsonl 2, .css 1)

## Summary
- 2596 nodes · 6395 edges · 125 communities (114 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `aac7d6b2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app/page.tsx
- SectionTitle
- 🚀 Módulos e Funcionalidades
- vendas/page.tsx
- agenda/page.tsx
- generate_pdf_report.py
- meta/route.ts
- 5. Especificações Visuais e de Telas Extraídas do Habitus CRM (Vídeo Oficial e Web)
- CountUpNumber
- verifyWebhookKey
- empreendimentos/page.tsx
- crm/page.tsx
- primitives/index.ts
- location.ts
- LeadDetail
- package.json
- bcryptjs
- auditoria/page.tsx
- relatorios/page.tsx
- LeadAbordagemSection.tsx
- react
- dependencies
- compilerOptions
- leads/route.ts
- CreateSeasonBookingUseCase.ts
- brandkit/SKILL.md
- getJwtSecret
- 🔌 PARTE 2: Matriz de Testes de Cada Integração (Endpoints & Webhooks)
- next
- CORE DIRECTIVE: IMAGE-FIRST WEBSITE DESIGN TO CODE
- devDependencies
- CORE DIRECTIVE: PREMIUM MOBILE APP IMAGE DIRECTION
- High-Agency Frontend Skill
- manifest.json
- leadsApi.ts
- ICreditPolicy
- normalizeBrPhone
- vendas/route.ts
- scripts
- lucide-react
- PropertyMaterialsModal.tsx
- agenda/types.ts
- Appendix B - Canonical Sources (read these before reinventing)
- Design Audit
- Analysis & Synthesis Instructions
- 🧪 Plano de Testes Automatizados — Sincronização Bidirecional & Novas Melhorias
- IUserRepository
- sw.js
- Agent Skill: Principal UI/UX Architect & Motion Choreographer (Awwwards-Tier)
- SKILL: Industrial Brutalism & Tactical Telemetry UI
- organizacao/route.ts
- Design System: Taste Standard
- tailwindcss
- CORE DIRECTIVE: AWWWARDS-LEVEL IMAGE ART DIRECTION
- 2. THE COMBINATORIAL VARIATION ENGINE
- requireSession
- fluxo-de-caixa/page.tsx
- ILeadRepository
- 4. DESIGN ENGINEERING DIRECTIVES (Bias Correction)
- 10. REFERENCE VOCABULARY (Pattern Names the Agent Should Know)
- tasteskill: Anti-Slop Frontend Skill
- CORE DIRECTIVE: AWWWARDS-LEVEL DESIGN ENGINEERING
- 22. STYLE VARIATION ENGINE
- Protocol: Premium Utilitarian Minimalism UI Architect
- 11. COMPONENT EXECUTION GUIDELINES
- 18. EXTRA CREATIVITY & IMPLEMENTATION EDGE
- 9. AI TELLS (Forbidden Patterns)
- 12. THE COMBINATORIAL VARIATION ENGINE
- 8. ANTI-AI-SLOP RULES
- 11. REDESIGN PROTOCOL
- 3. DEFAULT ARCHITECTURE & CONVENTIONS
- 6. PERFORMANCE & ACCESSIBILITY GUARDRAILS
- Full-Output Enforcement
- 33. CATEGORY-SPECIFIC BIAS
- 13. COLOR & MATERIAL RULES
- 4. HERO MINIMALISM RULES
- properties/route.ts
- 29. ANTI-AI-SLOP RULES
- 5. IMAGE COUNT & PAGE SLICING
- useCrm
- DistributeLeadUseCase.ts
- 12. THE BLOCK LIBRARY (Contract - Implementations Land Here Iteratively)
- 5. CONTEXT-AWARE PROACTIVITY
- 8. DARK MODE PROTOCOL
- 21. MOBILE ANTI-AI-TELLS RULE
- dashboardMetrics.ts
- 7. DIAL DEFINITIONS (Technical Reference)
- 33. DEFAULT SECTION PACKS
- 14. HERO MINIMALISM RULES
- 37. EXAMPLE INTERPRETATIONS
- 2. PLATFORM MODE RULE
- 37. EXAMPLE INTERPRETATIONS
- 15. DEFAULT SITE PACKS
- 20. EXAMPLE INTERPRETATIONS
- imagegen-frontend-web/SKILL.md
- next.config.mjs
- SiteSettingsTab.tsx
- deploy.sh
- app/layout.tsx
- uploadStorage.ts
- NewSaleModal.tsx
- compliance.ts
- APPENDICES - Real Source-Backed Reference Material
- PrismaLeadRepository
- ranking/page.tsx
- IntegrationCard.tsx
- recordAudit
- saleSplitHelper.ts
- docker-entrypoint.sh
- PropertyLocationFields.tsx
- test-leads-bidirectional-sync.mjs
- useCrmLookups.ts
- @prisma/client
- ChangeBrokerModal.test.tsx
- PrismaUserRepository
- JwtTokenService.ts
- auditoria/route.ts
- seed.js
- 📌 REGRA DE OURO: FIDELIDADE VISUAL E ANIMAÇÕES (INSPIRAÇÃO HABITUS CRM)
- useLeadsFilter.ts
- PropertyDetailsModal.tsx
- useLeadsActions.ts
- @playwright/test

## God Nodes (most connected - your core abstractions)
1. `react` - 204 edges
2. `lucide-react` - 160 edges
3. `useCrm()` - 106 edges
4. `requireSession()` - 88 edges
5. `next` - 65 edges
6. `recordAudit()` - 63 edges
7. `@prisma/client` - 62 edges
8. `prisma` - 55 edges
9. `LeadDetail` - 53 edges
10. `CORE DIRECTIVE: IMAGE-FIRST WEBSITE DESIGN TO CODE` - 39 edges

## Surprising Connections (you probably didn't know these)
- `1. Padrões de Animação e Movimento (Motion System)` --references--> `AnimatedCrown()`  [INFERRED]
  AGENTS.md → components/crm/AnimatedCrown.tsx
- `1. Padrões de Animação e Movimento (Motion System)` --references--> `AnimatedCrown()`  [INFERRED]
  GEMINI.md → components/crm/AnimatedCrown.tsx
- `TC-FUNC-18: Pódio Animado e Metas` --references--> `AnimatedCrown()`  [INFERRED]
  PLANO_DE_TESTES.md → components/crm/AnimatedCrown.tsx
- `8. 🏆 Ranking & Gamificação` --references--> `AnimatedCrown()`  [INFERRED]
  README.md → components/crm/AnimatedCrown.tsx
- `7. Regra Permanente de Sanitização e Não-Duplicação de Sinais e Ícones` --references--> `TrendBadge()`  [INFERRED]
  AGENTS.md → components/crm/primitives/TrendBadge.tsx

## Import Cycles
- 3-file cycle: `components/crm/LeadDrawer.tsx -> components/crm/leads/KanbanBoard.tsx -> components/crm/leads/KanbanColumn.tsx -> components/crm/LeadDrawer.tsx`
- 3-file cycle: `components/crm/leads/KanbanBoard.tsx -> components/crm/leads/KanbanColumn.tsx -> components/crm/leads/LeadCard.tsx -> components/crm/leads/KanbanBoard.tsx`
- 4-file cycle: `components/crm/LeadDrawer.tsx -> components/crm/lead-drawer/LeadHistoryTimeline.tsx -> components/crm/lead-drawer/useLeadTimeline.ts -> components/crm/leads/leadsApi.ts -> components/crm/LeadDrawer.tsx`
- 4-file cycle: `components/crm/leads/KanbanBoard.tsx -> components/crm/leads/KanbanColumn.tsx -> components/crm/leads/LeadCard.tsx -> components/crm/leads/leadsApi.ts -> components/crm/leads/KanbanBoard.tsx`
- 4-file cycle: `components/crm/leads/KanbanBoard.tsx -> components/crm/leads/KanbanColumn.tsx -> components/crm/leads/LeadCard.tsx -> components/crm/leads/leadCalculations.ts -> components/crm/leads/KanbanBoard.tsx`
- 4-file cycle: `components/crm/LeadDrawer.tsx -> components/crm/leads/KanbanBoard.tsx -> components/crm/leads/KanbanColumn.tsx -> components/crm/leads/LeadCard.tsx -> components/crm/LeadDrawer.tsx`
- 5-file cycle: `components/crm/LeadDrawer.tsx -> components/crm/leads/KanbanBoard.tsx -> components/crm/leads/KanbanColumn.tsx -> components/crm/leads/LeadCard.tsx -> components/crm/leads/leadsApi.ts -> components/crm/LeadDrawer.tsx`
- 5-file cycle: `components/crm/LeadDrawer.tsx -> components/crm/leads/KanbanBoard.tsx -> components/crm/leads/KanbanColumn.tsx -> components/crm/leads/LeadCard.tsx -> components/crm/leads/leadCalculations.ts -> components/crm/LeadDrawer.tsx`
- 5-file cycle: `components/crm/LeadDrawer.tsx -> components/crm/leads/KanbanBoard.tsx -> components/crm/leads/KanbanColumn.tsx -> components/crm/leads/LeadCard.tsx -> components/crm/leads/LeadCardMenu.tsx -> components/crm/LeadDrawer.tsx`

## Communities (125 total, 11 thin omitted)

### Community 0 - "app/page.tsx"
Cohesion: 0.05
Nodes (84): LandingPage(), CATEGORIES, PortalCategories(), ModalPanel(), PortalContactModal(), PortalContactModalProps, digitsOnly(), MoneyField() (+76 more)

### Community 1 - "SectionTitle"
Cohesion: 0.11
Nodes (45): Access, ConfigTab, ConfiguracoesPage(), tabList, AccessibilitySection(), AdminGeneralTab(), Empresa, FormState (+37 more)

### Community 2 - "🚀 Módulos e Funcionalidades"
Cohesion: 0.06
Nodes (33): 10. 👥 Gestão de Equipes, Check-in & Auditoria, 11. 🌐 Portal Público / Vitrine de Imóveis, 12. 🔌 Integrações & Webhooks, 1. 📊 Dashboard & Inteligência Comercial (BI), 1. Deploy Automatizado com 1 Comando, 1. Row Level Security (RLS) no PostgreSQL, 2. Controle de Acesso Baseado em Perfis (RBAC), 2. 🗂 Gestão de Leads & Funil Kanban (+25 more)

### Community 3 - "vendas/page.tsx"
Cohesion: 0.11
Nodes (33): initialFilters, TABS, VendasComissoesPage(), CommissionReceiptModal(), CommissionReceiptModalProps, SaleCard(), SaleCardProps, SaleItem (+25 more)

### Community 4 - "agenda/page.tsx"
Cohesion: 0.12
Nodes (16): AgendaPage(), toItem(), AgendaDayView(), AgendaDayViewProps, AgendaMonthView(), AgendaMonthViewProps, WEEKDAY_NAMES, AgendaWeekView() (+8 more)

### Community 5 - "generate_pdf_report.py"
Cohesion: 0.12
Nodes (9): capture(), build_conclusion_page(), create_module_page(), generate_pdf(), build_api_audit_table(), build_compliance_table(), build_cover_elements(), get_pdf_styles() (+1 more)

### Community 6 - "meta/route.ts"
Cohesion: 0.26
Nodes (6): GET(), POST(), MetaLeadData, MetaWebhookLeadgenEntrySchema, MetaWebhookPayloadSchema, MetaWebhookService

### Community 7 - "5. Especificações Visuais e de Telas Extraídas do Habitus CRM (Vídeo Oficial e Web)"
Cohesion: 0.09
Nodes (21): 1. Padrões de Animação e Movimento (Motion System), 2. Padrões Visuais e Identidade de Interface (UI System), 3. Diretrizes de Escopo, 4. Diretrizes de Engenharia, Modularidade e Manutenibilidade de Código, 5.10 Integrações, 5.11 Motion e Micro-interações (capturadas), 5.12 Checklist de Conformidade para Novas Telas, 5.1 Tokens de Design (Habitus → Connect Platz) (+13 more)

### Community 8 - "CountUpNumber"
Cohesion: 0.09
Nodes (32): BookingItem, mockBookings, TemporadaVeraneioPage(), AuditStatCardsProps, cards, CountUpNumber(), CountUpNumberProps, prefersReducedMotion() (+24 more)

### Community 9 - "verifyWebhookKey"
Cohesion: 0.18
Nodes (16): POST(), GET(), POST(), POST(), POST(), POST(), LandingFields, POST() (+8 more)

### Community 10 - "empreendimentos/page.tsx"
Cohesion: 0.10
Nodes (21): EmpreendimentosPage(), EditPropertyImageModal(), EditPropertyImageModalProps, EmpreendimentosListProps, PropertyDetailsModalProps, ARCHITECTURAL_PRESETS, ArchitecturalPreset, PropertyImagePresets() (+13 more)

### Community 11 - "crm/page.tsx"
Cohesion: 0.08
Nodes (46): CrmDashboardPage(), exportDashboardXlsx(), FinancialStatCards(), FinancialStatCardsProps, orUndefined(), formatBRL(), friendlyDateTime(), initials() (+38 more)

### Community 12 - "primitives/index.ts"
Cohesion: 0.13
Nodes (22): DiscardLeadModal(), DiscardLeadModalProps, dropReasons, EditLeadModal(), EditLeadModalProps, LeadDocumentUploadSlots(), LeadFilterSheet(), LeadsModalsContainer() (+14 more)

### Community 13 - "location.ts"
Cohesion: 0.14
Nodes (27): dynamic, GET(), dynamic, GET(), optionalCoord, POST(), RouteSchema, AppointmentCard() (+19 more)

### Community 14 - "LeadDetail"
Cohesion: 0.15
Nodes (26): LeadDrawerActions(), LeadDrawerActionsProps, LeadDrawerHeaderProps, LeadDetail, LeadDrawer(), LeadDrawerProps, LeadSale, BolsaoSectionProps (+18 more)

### Community 15 - "package.json"
Cohesion: 0.08
Nodes (24): name, prisma, seed, private, version, autoprefixer, clsx, date-fns (+16 more)

### Community 16 - "bcryptjs"
Cohesion: 0.29
Nodes (3): bcryptjs, testSolidPrinciples(), testSecurity()

### Community 17 - "auditoria/page.tsx"
Cohesion: 0.12
Nodes (27): AuditoriaPage(), csvCell(), EMPTY_FILTERS, getAuditActionBadge(), getInitials(), AuditDataDiff(), AuditDataDiffProps, display() (+19 more)

### Community 18 - "relatorios/page.tsx"
Cohesion: 0.09
Nodes (46): RelatoriosBiPage(), DashboardSkeleton(), SegmentedToggle(), BiChannelDistributionCard(), pct(), BiChartRendererProps, BiChartTooltip(), moneyTick() (+38 more)

### Community 19 - "LeadAbordagemSection.tsx"
Cohesion: 0.11
Nodes (23): AbordagemItem, canaisConfig, CanalAbordagem, CONTACT_CHANNELS, DesfechoAbordagem, desfechosConfig, LeadAbordagemSection(), LeadAbordagemSectionProps (+15 more)

### Community 20 - "react"
Cohesion: 0.14
Nodes (17): LeadsPage(), ToastState, BolsaoSection(), KanbanBoard(), LeadsHeader(), LeadsHeaderProps, LeadsSearchBar(), LeadsSearchBarProps (+9 more)

### Community 21 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, bcryptjs, canvas-confetti, clsx, date-fns, framer-motion, jsonwebtoken, jspdf (+10 more)

### Community 22 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+9 more)

### Community 23 - "leads/route.ts"
Cohesion: 0.05
Nodes (86): dynamic, GET(), points, PUT(), ScoreRulesSchema, loadHotLeads(), TIMELINE_TITLES, DELETE() (+78 more)

### Community 24 - "CreateSeasonBookingUseCase.ts"
Cohesion: 0.22
Nodes (5): CreateSeasonBookingInput, CreateSeasonBookingUseCase, CreateBookingDto, IBookingRepository, PrismaBookingRepository

### Community 25 - "brandkit/SKILL.md"
Cohesion: 0.05
Nodes (43): 1. Logo Cover, 1. Monogram + Meaning, 2 × 3 REFERENCE-STYLE LAYOUT, 2. Logo Construction, 2. Product Action, 3. Digital Application, 3. Metaphor Fusion, 4. Brand Essence (+35 more)

### Community 26 - "getJwtSecret"
Cohesion: 0.31
Nodes (7): getJwtSecret(), KNOWN_INSECURE_SECRETS, ADMIN_ONLY_ROUTES, config, DecodedSession, middleware(), verifyJwtInEdge()

### Community 27 - "🔌 PARTE 2: Matriz de Testes de Cada Integração (Endpoints & Webhooks)"
Cohesion: 0.04
Nodes (48): 🎯 Identificação do Sistema & Escopo de Auditoria, 🛰️ INT-01: Meta Ads (Facebook & Instagram Lead Ads), 🔍 INT-02: Google Ads (Lead Form Extensions), 🏠 INT-03: Grupo OLX (Zap Imóveis & Viva Real), 🔑 INT-04: Portal Chaves na Mão, 🏡 INT-05: Portal Dream Casa, 🌐 INT-06: Landing Pages Oficiais & WordPress / Elementor, ⚡ INT-07: API & Webhooks Customizados (n8n, Make, Zapier) (+40 more)

### Community 28 - "next"
Cohesion: 0.15
Nodes (13): POST(), dynamic, dynamic, GET(), PATCH(), StatusSchema, BookingSchema, getSessionContext() (+5 more)

### Community 29 - "CORE DIRECTIVE: IMAGE-FIRST WEBSITE DESIGN TO CODE"
Cohesion: 0.06
Nodes (34): 10. IMAGE-FIRST CODEX WEBSITE WORKFLOW, 11. WHEN TO TRIGGER IMAGE GENERATION FIRST, 13. WEBSITE REFERENCE RULE, 15. RESPONSIVE FIRST-VIEW RULE, 16. ANTI-NESTED-BOX RULE, 17. REDUCE MICRO-UI CLUTTER RULE, 18. SECTION IMAGE GENERATION RULE, 19. WEBSITE IMAGE SYSTEM RULE (+26 more)

### Community 30 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, autoprefixer, jsdom, @playwright/test, postcss, prisma, tailwindcss, @testing-library/dom (+12 more)

### Community 31 - "CORE DIRECTIVE: PREMIUM MOBILE APP IMAGE DIRECTION"
Cohesion: 0.06
Nodes (34): 10. DEVICE MOCKUP FRAME RULE, 11. ONBOARDING FLOW RULE, 12. FIRST SCREEN CLEANLINESS RULE, 13. SAFE AREA AND SYSTEM REGION RULE, 14. NAVIGATION RULE, 15. CLEAN LAYOUT RULE, 16. CREATIVE IMAGE DIRECTION RULE, 17. BACKGROUND TEXTURE AND SURFACE RULE (+26 more)

### Community 32 - "High-Agency Frontend Skill"
Cohesion: 0.06
Nodes (30): 10. FINAL PRE-FLIGHT CHECK, 1. ACTIVE BASELINE CONFIGURATION, 2. DEFAULT ARCHITECTURE & CONVENTIONS, 3. DESIGN ENGINEERING DIRECTIVES (Bias Correction), 4. CREATIVE PROACTIVITY (Anti-Slop Implementation), 5. PERFORMANCE GUARDRAILS, 6. TECHNICAL REFERENCE (Dial Definitions), 7. AI TELLS (Forbidden Patterns) (+22 more)

### Community 33 - "manifest.json"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 34 - "leadsApi.ts"
Cohesion: 0.20
Nodes (14): LeadAttachmentsSection(), LeadAttachmentsSectionProps, formatBytes(), useLeadDocuments(), DOC_SLOTS, DocumentSlot, fetchLeadDocuments(), fetchLeads() (+6 more)

### Community 35 - "ICreditPolicy"
Cohesion: 0.15
Nodes (11): QualifyCreditInput, QualifyCreditUseCase, ServiceContainer, CreditQualificationData, CreditValidationResult, ICreditPolicy, AutonomoCreditPolicy, CltCreditPolicy (+3 more)

### Community 36 - "normalizeBrPhone"
Cohesion: 0.12
Nodes (28): HotLeadsRankedList(), HotLeadsRankedListProps, POTENTIAL_LABEL, HotLeadItem, LeadDrawerHeader(), registerFirstContact(), LeadsTable(), TemplateOption (+20 more)

### Community 37 - "vendas/route.ts"
Cohesion: 0.09
Nodes (36): DELETE(), dynamic, findEntry(), PATCH(), PatchSchema, CreateSchema, dateOnly, dynamic (+28 more)

### Community 38 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, dev, lint, prisma:generate, prisma:migrate, prisma:push, prisma:seed (+5 more)

### Community 39 - "lucide-react"
Cohesion: 0.14
Nodes (27): EquipesPage(), IntegracoesPage(), AccessDeniedCard(), AccessDeniedCardProps, generateTempPassword(), InviteCollaboratorData, InviteCollaboratorModal(), InviteCollaboratorModalProps (+19 more)

### Community 40 - "PropertyMaterialsModal.tsx"
Cohesion: 0.27
Nodes (12): AddMaterialForm(), AddMaterialFormProps, absoluteUrl(), formatDate(), PropertyMaterialsModal(), PropertyMaterialsModalProps, formatBytes(), MaterialCategoria (+4 more)

### Community 41 - "agenda/types.ts"
Cohesion: 0.18
Nodes (13): AgendaHeader(), AgendaHeaderProps, AppointmentTypeSelector(), AppointmentTypeSelectorProps, NewAppointmentModal(), APPOINTMENT_ENUM_VALUES, APPOINTMENT_FORM_TYPES, APPOINTMENT_TYPE_CONFIG (+5 more)

### Community 42 - "Appendix B - Canonical Sources (read these before reinventing)"
Cohesion: 0.13
Nodes (15): Appendix B - Canonical Sources (read these before reinventing), Apple Liquid Glass (Apple platforms only), Atlassian, Bootstrap, Carbon, Fluent UI, GOV.UK, Material Web (+7 more)

### Community 43 - "Design Audit"
Cohesion: 0.10
Nodes (19): Code Quality, Color and Surfaces, Component Patterns, Content, Design Audit, Fix Priority, How This Works, Iconography (+11 more)

### Community 44 - "Analysis & Synthesis Instructions"
Cohesion: 0.11
Nodes (18): 1. Define the Atmosphere, 2. Map the Color Palette, 3. Establish Typography Rules, 4. Define the Hero Section, 5. Describe Component Stylings, 6. Define Layout Principles, 7. Define Responsive Rules, 8. Encode Motion Philosophy (+10 more)

### Community 45 - "🧪 Plano de Testes Automatizados — Sincronização Bidirecional & Novas Melhorias"
Cohesion: 0.11
Nodes (18): 🏗️ 1. Matriz de Cobertura e Pirâmide de Testes, 📡 2. Camada de Testes de API & Integração de Backend, 🧩 3. Camada de Testes Unitários de Componentes & Hooks, 🎭 4. Camada de Testes de Ponta a Ponta (E2E — Playwright), 🚀 5. Como Executar as Baterias de Testes, 📜 6. Script Executável de Teste de Integração (API & Banco de Dados), 🔑 Credenciais Padrão Utilizadas no Ambiente de Testes (Seed):, Especificação E2E-01: Troca de Corretor pelo Administrador (+10 more)

### Community 46 - "IUserRepository"
Cohesion: 0.10
Nodes (9): AuthenticateInput, AuthenticateOutput, AuthenticateUserUseCase, RegisterUserInput, RegisterUserUseCase, IPasswordHasher, CreateUserData, IUserRepository (+1 more)

### Community 50 - "Agent Skill: Principal UI/UX Architect & Motion Choreographer (Awwwards-Tier)"
Cohesion: 0.11
Nodes (17): 1. Meta Information & Core Directive, 2. THE "ABSOLUTE ZERO" DIRECTIVE (STRICT ANTI-PATTERNS), 3. THE CREATIVE VARIANCE ENGINE, 4. HAPTIC MICRO-AESTHETICS (COMPONENT MASTERY), 5. MOTION CHOREOGRAPHY (FLUID DYNAMICS), 6. PERFORMANCE GUARDRAILS, 7. EXECUTION PROTOCOL, 8. PRE-OUTPUT CHECKLIST (+9 more)

### Community 51 - "SKILL: Industrial Brutalism & Tactical Telemetry UI"
Cohesion: 0.12
Nodes (16): 1. Skill Meta, 2.1 Swiss Industrial Print, 2.2 Tactical Telemetry & CRT Terminal, 2. Visual Archetypes, 3.1 Macro-Typography (Structural Headers), 3.2 Micro-Typography (Data & Telemetry), 3.3 Textural Contrast (Artistic Disruption), 3. Typographic Architecture (+8 more)

### Community 52 - "organizacao/route.ts"
Cohesion: 0.19
Nodes (17): cleanEmpresa(), dynamic, EmpresaCadastro, imageUrl, OrgSchema, orgSelect, PATCH(), validateGoal() (+9 more)

### Community 53 - "Design System: Taste Standard"
Cohesion: 0.13
Nodes (14): 1. Visual Theme & Atmosphere, 2. Color Palette & Roles, 3. Typography Rules, 4. Component Stylings, 5. Hero Section, 6. Layout Principles, 7. Responsive Rules, 8. Motion & Interaction (Code-Phase Intent) (+6 more)

### Community 55 - "CORE DIRECTIVE: AWWWARDS-LEVEL IMAGE ART DIRECTION"
Cohesion: 0.14
Nodes (14): 10. SECTION RHYTHM RULE, 12. DENSITY & SPACING DISCIPLINE, 14. IMAGE / MEDIA DIRECTION, 16. MULTI-IMAGE CONSISTENCY RULE, 17. CLARITY CHECK, 19. RESPONSE BEHAVIOR, 1. ACTIVE BASELINE CONFIGURATION, 21. FINAL GOAL (+6 more)

### Community 56 - "2. THE COMBINATORIAL VARIATION ENGINE"
Cohesion: 0.14
Nodes (14): 2. THE COMBINATORIAL VARIATION ENGINE, Background Character, Background Mode (per-section), Composition Anchor (per-section), CTA Variation, Hero Architecture, Hero Scale (per-page), Motion-Implied Language (+6 more)

### Community 57 - "requireSession"
Cohesion: 0.13
Nodes (28): DELETE(), dynamic, PATCH(), SyncAppointmentCreationParams, syncAppointmentStatusChangeToLead(), SyncAppointmentStatusParams, syncAppointmentToLead(), createSchema (+20 more)

### Community 58 - "fluxo-de-caixa/page.tsx"
Cohesion: 0.08
Nodes (48): brl(), FluxoCaixaDREPage(), TabId, TABS, cashFlowFromApi(), computeCashFlowSummary(), computeProjection(), HORIZONS (+40 more)

### Community 59 - "ILeadRepository"
Cohesion: 0.17
Nodes (4): IngestLeadDto, IngestLeadResult, IngestLeadUseCase, ILeadRepository

### Community 60 - "4. DESIGN ENGINEERING DIRECTIVES (Bias Correction)"
Cohesion: 0.17
Nodes (12): 4.10 Quotes & Testimonials, 4.11 Page Theme Lock (Light / Dark Mode Consistency), 4.1 Typography, 4.2 Color Calibration, 4.3 Layout Diversification, 4.4 Materiality, Shadows, Cards, 4.5 Interactive UI States, 4.6 Data & Form Patterns (+4 more)

### Community 61 - "10. REFERENCE VOCABULARY (Pattern Names the Agent Should Know)"
Cohesion: 0.20
Nodes (10): 10. REFERENCE VOCABULARY (Pattern Names the Agent Should Know), Animation Library Choice, Cards & Containers, Galleries & Media, Hero Paradigms, Layout & Grids, Micro-Interactions & Effects, Navigation & Menus (+2 more)

### Community 62 - "tasteskill: Anti-Slop Frontend Skill"
Cohesion: 0.13
Nodes (15): 0.A Read these signals first, 0.B Output a one-line "Design Read" before generating, 0. BRIEF INFERENCE (Read the Room Before Anything Else), 0.C If the brief is ambiguous, ask one question, do not guess, 0.D Anti-Default Discipline, 13. OUT OF SCOPE, 14. FINAL PRE-FLIGHT CHECK, 1.A Dial Inference (design read → dial values) (+7 more)

### Community 63 - "CORE DIRECTIVE: AWWWARDS-LEVEL DESIGN ENGINEERING"
Cohesion: 0.20
Nodes (9): 1. PYTHON-DRIVEN TRUE RANDOMIZATION (BREAKING THE LOOP), 2. AIDA STRUCTURE & SPACING, 3. HERO ARCHITECTURE & THE 2-LINE IRON RULE, 4. THE GAPLESS BENTO GRID, 5. ADVANCED GSAP MOTION & HOVER PHYSICS, 6. COMPONENT ARSENAL & CREATIVITY, 7. CONTENT, ASSETS & STRICT BANS, 8. MANDATORY PRE-FLIGHT <design_plan> (+1 more)

### Community 64 - "22. STYLE VARIATION ENGINE"
Cohesion: 0.20
Nodes (10): 22. STYLE VARIATION ENGINE, Decorative Asset Set, Image Art Direction Bias, Motion-Implied Language, Palette Logic, Signature Component Set, Structure Bias, Texture / Surface Treatment (+2 more)

### Community 65 - "Protocol: Premium Utilitarian Minimalism UI Architect"
Cohesion: 0.20
Nodes (9): 1. Protocol Overview, 2. Absolute Negative Constraints (Banned Elements), 3. Typographic Architecture, 4. Color Palette (Warm Monochrome + Spot Pastels), 5. Component Specifications, 6. Iconography & Imagery Directives, 7. Subtle Motion & Micro-Animations, 8. Execution Protocol (+1 more)

### Community 66 - "11. COMPONENT EXECUTION GUIDELINES"
Cohesion: 0.22
Nodes (9): 11. COMPONENT EXECUTION GUIDELINES, 3D Cascading Card Deck, Diagonal Staggered Square Masonry, Hover-Accordion Slice Layout, Off-Grid Editorial Layout, Pristine Gapless Bento Grid, Product UI Panel Stack, Turning Polaroid Arc (+1 more)

### Community 67 - "18. EXTRA CREATIVITY & IMPLEMENTATION EDGE"
Cohesion: 0.22
Nodes (9): 18. EXTRA CREATIVITY & IMPLEMENTATION EDGE, Composition variety check, Conversion focus, Cross-section contrast, CTA specificity, Cultural / tonal alignment, Data-viz restraint, Image variety inside one comp (+1 more)

### Community 68 - "9. AI TELLS (Forbidden Patterns)"
Cohesion: 0.25
Nodes (8): 9.A Visual & CSS, 9. AI TELLS (Forbidden Patterns), 9.B Typography, 9.C Layout & Spacing, 9.D Content & Data ("Jane Doe" Effect), 9.E External Resources & Components, 9.F Production-Test Tells (banned outright), 9.G EM-DASH BAN (the single most-violated Tell)

### Community 69 - "12. THE COMBINATORIAL VARIATION ENGINE"
Cohesion: 0.25
Nodes (8): 12. THE COMBINATORIAL VARIATION ENGINE, Background Character, Hero Architecture, Motion-Implied Language, Section System, Signature Component Set, Theme Paradigm, Typography Character

### Community 70 - "8. ANTI-AI-SLOP RULES"
Cohesion: 0.25
Nodes (8): 8. ANTI-AI-SLOP RULES, Carousel / marquee slop (layout), Content slop, Data / KPI slop, Density slop, Layout slop, Typography slop, Visual slop

### Community 71 - "11. REDESIGN PROTOCOL"
Cohesion: 0.29
Nodes (7): 11.A Detect the Mode (first action), 11.B Audit Before Touching, 11.C Preservation Rules, 11.D Modernisation Levers (priority order), 11.E Decision Tree: Targeted Evolution vs Full Redesign, 11.F What Never Changes Silently, 11. REDESIGN PROTOCOL

### Community 72 - "3. DEFAULT ARCHITECTURE & CONVENTIONS"
Cohesion: 0.29
Nodes (7): 3.A Stack, 3.B State, 3.C Icons, 3.D Emoji Policy, 3. DEFAULT ARCHITECTURE & CONVENTIONS, 3.E Responsiveness & Layout Mechanics, 3.F Dependency Verification (mandatory)

### Community 73 - "6. PERFORMANCE & ACCESSIBILITY GUARDRAILS"
Cohesion: 0.29
Nodes (7): 6.A Hardware Acceleration, 6.B Reduced Motion (mandatory), 6.C Dark Mode (mandatory for any consumer-facing page), 6.D Core Web Vitals Targets, 6.E DOM Cost, 6.F Z-Index Restraint, 6. PERFORMANCE & ACCESSIBILITY GUARDRAILS

### Community 74 - "Full-Output Enforcement"
Cohesion: 0.29
Nodes (6): Banned Output Patterns, Baseline, Execution Process, Full-Output Enforcement, Handling Long Outputs, Quick Check

### Community 75 - "33. CATEGORY-SPECIFIC BIAS"
Cohesion: 0.29
Nodes (7): 33. CATEGORY-SPECIFIC BIAS, Commerce, Fintech, Health / Fitness, Productivity, Social, Wellness / Lifestyle

### Community 76 - "13. COLOR & MATERIAL RULES"
Cohesion: 0.29
Nodes (7): 13. COLOR & MATERIAL RULES, Background Confidence Rule, Background-image harmony, Gradient Discipline, Materiality, Palette Discipline, Strong guidance

### Community 77 - "4. HERO MINIMALISM RULES"
Cohesion: 0.29
Nodes (7): 4. HERO MINIMALISM RULES, Absolute Hero Rules, Graphic Restraint, Headline Rule, Hero Composition Bias, Pre-output check, Typography Execution

### Community 78 - "properties/route.ts"
Cohesion: 0.09
Nodes (33): DELETE(), dynamic, Params, PATCH(), buildDirectory(), DirectoryCity, DirectorySource, tipoPlural() (+25 more)

### Community 79 - "29. ANTI-AI-SLOP RULES"
Cohesion: 0.33
Nodes (6): 29. ANTI-AI-SLOP RULES, Content slop, Density slop, Layout slop, Typography slop, Visual slop

### Community 80 - "5. IMAGE COUNT & PAGE SLICING"
Cohesion: 0.33
Nodes (6): 5. IMAGE COUNT & PAGE SLICING, Continuity Rule, Counting rule, Format, Section size variety, THIS IS THE PRIMARY OUTPUT RULE

### Community 81 - "useCrm"
Cohesion: 0.12
Nodes (23): CrmLayout(), CrmShell(), FontOption, fontOptions, CrmContext, CrmContextType, CrmNotification, CrmProvider() (+15 more)

### Community 82 - "DistributeLeadUseCase.ts"
Cohesion: 0.18
Nodes (5): DistributeLeadUseCase, DistributionResult, ProcessSlaTransbordoUseCase, IDistributionStrategy, RoundRobinDistributionStrategy

### Community 83 - "12. THE BLOCK LIBRARY (Contract - Implementations Land Here Iteratively)"
Cohesion: 0.40
Nodes (5): 12.A File Location, 12.B Required Frontmatter, 12.C Required Body Sections, 12.D Block-Library Discipline, 12. THE BLOCK LIBRARY (Contract - Implementations Land Here Iteratively)

### Community 84 - "5. CONTEXT-AWARE PROACTIVITY"
Cohesion: 0.40
Nodes (5): 5.A Sticky-Stack - Canonical Skeleton, 5.B Horizontal-Pan - Canonical Skeleton, 5.C Scroll-Reveal Stagger - Canonical Skeleton (lighter alternative), 5. CONTEXT-AWARE PROACTIVITY, 5.D Forbidden Animation Patterns

### Community 85 - "8. DARK MODE PROTOCOL"
Cohesion: 0.40
Nodes (5): 8.A Token Strategy (pick one, stick to it), 8.B Do Not Prescribe Specific Colors Here, 8.C Default Mode, 8.D Test in Both Modes Before Finishing, 8. DARK MODE PROTOCOL

### Community 86 - "21. MOBILE ANTI-AI-TELLS RULE"
Cohesion: 0.40
Nodes (5): 21. MOBILE ANTI-AI-TELLS RULE, Copy AI tells, Layout AI tells, UI clutter tells, Visual AI tells

### Community 87 - "dashboardMetrics.ts"
Cohesion: 0.05
Nodes (99): Bucket, bucketIndex(), dateOnlyToLocal(), earliestStart(), lastDaysBuckets(), lastMonthsBuckets(), lastWeeksBuckets(), MONTHS (+91 more)

### Community 88 - "7. DIAL DEFINITIONS (Technical Reference)"
Cohesion: 0.50
Nodes (4): 7. DIAL DEFINITIONS (Technical Reference), DESIGN_VARIANCE (Level 1-10), MOTION_INTENSITY (Level 1-10), VISUAL_DENSITY (Level 1-10)

### Community 89 - "33. DEFAULT SECTION PACKS"
Cohesion: 0.50
Nodes (4): 12-section pack, 33. DEFAULT SECTION PACKS, 4-section pack, 8-section pack

### Community 90 - "14. HERO MINIMALISM RULES"
Cohesion: 0.50
Nodes (4): 14. HERO MINIMALISM RULES, Absolute Hero Rules, Headline Rule, Hero Cleanliness Rule

### Community 91 - "37. EXAMPLE INTERPRETATIONS"
Cohesion: 0.50
Nodes (4): 37. EXAMPLE INTERPRETATIONS, Example 1, Example 2, Example 3

### Community 92 - "2. PLATFORM MODE RULE"
Cohesion: 0.50
Nodes (4): 2. PLATFORM MODE RULE, Android-native premium, Cross-platform premium neutral, iOS-native premium

### Community 93 - "37. EXAMPLE INTERPRETATIONS"
Cohesion: 0.50
Nodes (4): 37. EXAMPLE INTERPRETATIONS, Example 1, Example 2, Example 3

### Community 94 - "15. DEFAULT SITE PACKS"
Cohesion: 0.50
Nodes (4): 12-section pack, 15. DEFAULT SITE PACKS, 4-section pack, 8-section pack

### Community 95 - "20. EXAMPLE INTERPRETATIONS"
Cohesion: 0.50
Nodes (4): 20. EXAMPLE INTERPRETATIONS, Example 1, Example 2, Example 3

### Community 98 - "SiteSettingsTab.tsx"
Cohesion: 0.17
Nodes (12): LiveHeroPreviewCard(), LiveHeroPreviewCardProps, SiteAppearanceSection(), SiteAppearanceSectionProps, SiteContactBioSection(), SiteContactBioSectionProps, HERO_BG_PRESETS, SiteHeroEditorSection() (+4 more)

### Community 101 - "uploadStorage.ts"
Cohesion: 0.11
Nodes (28): DELETE(), dynamic, Params, dynamic, findProperty(), GET(), MATERIAL_CATEGORIAS, MaterialSchema (+20 more)

### Community 102 - "NewSaleModal.tsx"
Cohesion: 0.15
Nodes (18): initialDeal(), initialParticipants(), NewSaleModal(), NewSaleModalProps, ROLES, SaleAttachment, SaleAttachmentsTab(), SaleAttachmentsTabProps (+10 more)

### Community 103 - "compliance.ts"
Cohesion: 0.36
Nodes (6): dynamic, GET(), cnpjCache, CnpjData, fetchCnpjData(), validateCnpj()

### Community 104 - "APPENDICES - Real Source-Backed Reference Material"
Cohesion: 0.29
Nodes (6): APPENDICES - Real Source-Backed Reference Material, Appendix A - Install Commands per Design System, Appendix C - Apple Liquid Glass: Honest Web Approximation, Safer web approximation skeleton, What is NOT official, What is official

### Community 105 - "PrismaLeadRepository"
Cohesion: 0.20
Nodes (3): CreateLeadDto, CreateTimelineDto, PrismaLeadRepository

### Community 106 - "ranking/page.tsx"
Cohesion: 0.12
Nodes (31): RankingGamificacaoPage(), AnimatedCrown(), AnimatedCrownProps, PeriodFilter, formatCompactBRL(), AdminGoalModalProps, BrokerOfTheMonthCard(), BrokerOfTheMonthCardProps (+23 more)

### Community 107 - "IntegrationCard.tsx"
Cohesion: 0.15
Nodes (19): ChannelAuth, ChannelDef, ChannelId, ChannelStatus, CopyField(), CopyFieldProps, integrationCatalog, deriveStatus() (+11 more)

### Community 108 - "recordAudit"
Cohesion: 0.09
Nodes (27): dynamic, GET(), PATCH(), ProfileSchema, profileSelect, ACTIONS, dynamic, GET() (+19 more)

### Community 109 - "saleSplitHelper.ts"
Cohesion: 0.19
Nodes (14): brl(), pct(), SaleCalculationsTab(), SaleCalculationsTabProps, BENEFICIARY_LABEL, CalculatedParticipant, calculateSaleValues(), ParticipantInput (+6 more)

### Community 111 - "PropertyLocationFields.tsx"
Cohesion: 0.15
Nodes (25): ImageUploadZone(), ImageUploadZoneProps, Modalidade, NewEmpreendimentoModal(), NewEmpreendimentoModalProps, DIFERENCIAIS, NewImovelAvulsoModal(), NewImovelAvulsoModalProps (+17 more)

### Community 112 - "test-leads-bidirectional-sync.mjs"
Cohesion: 0.52
Nodes (5): api(), getLead(), login(), main(), runTest()

### Community 113 - "useCrmLookups.ts"
Cohesion: 0.15
Nodes (15): ComboOption, SearchCombobox(), SearchComboboxProps, LookupLead, LookupProperty, Options, NumericInput(), NumericInputProps (+7 more)

### Community 114 - "@prisma/client"
Cohesion: 0.07
Nodes (32): LoginSchema, POST(), dynamic, GET(), POST(), ChangePasswordSchema, dynamic, POST() (+24 more)

### Community 115 - "ChangeBrokerModal.test.tsx"
Cohesion: 0.17
Nodes (9): LookupMember, ChangeBrokerModal(), ChangeBrokerModalProps, @testing-library/react, vitest, mockLead, mockMembers, mockLead (+1 more)

### Community 117 - "JwtTokenService.ts"
Cohesion: 0.36
Nodes (3): ITokenService, UserTokenPayload, JwtTokenService

### Community 118 - "auditoria/route.ts"
Cohesion: 0.25
Nodes (10): AuditDetalhes, CreateAuditLogSchema, dynamic, formatDateTime(), GET(), jsonPath(), parseDate(), POST() (+2 more)

### Community 119 - "seed.js"
Cohesion: 0.83
Nodes (3): businessDay(), hashPassword(), main()

### Community 120 - "📌 REGRA DE OURO: FIDELIDADE VISUAL E ANIMAÇÕES (INSPIRAÇÃO HABITUS CRM)"
Cohesion: 0.22
Nodes (8): 1. Padrões de Animação e Movimento (Motion System), 2. Padrões Visuais e Identidade de Interface (UI System), 3. Diretrizes de Escopo, 4. Diretrizes de Engenharia, Modularidade e Manutenibilidade de Código, 5. Diretrizes de Testes e Validação, 6. Regra Permanente de Sanitização e Não-Duplicação de Sinais e Ícones, Diretrizes e Regras Permanentes do Projeto — Connect Platz CRM, 📌 REGRA DE OURO: FIDELIDADE VISUAL E ANIMAÇÕES (INSPIRAÇÃO HABITUS CRM)

### Community 121 - "useLeadsFilter.ts"
Cohesion: 0.67
Nodes (5): classifyStages(), leadSlaStatus(), matchesPeriod(), normalize(), useLeadsFilter()

### Community 124 - "PropertyDetailsModal.tsx"
Cohesion: 0.40
Nodes (11): PropertyDetailsModal(), SPEC_ICONS, brl(), buildFichaText(), copyText(), formatPropertyAddress(), formatPropertyPrice(), propertyNavigation() (+3 more)

### Community 129 - "useLeadsActions.ts"
Cohesion: 0.20
Nodes (14): ImportLeadsModal(), ImportLeadsModalProps, createLead(), deleteLead(), normalizeLead(), patchLead(), errorMessage(), NotifyFn (+6 more)

## Knowledge Gaps
- **984 isolated node(s):** `dynamic`, `dynamic`, `createSchema`, `patchSchema`, `dynamic` (+979 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1093 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `app/page.tsx`, `SectionTitle`, `useLeadsActions.ts`, `vendas/page.tsx`, `agenda/page.tsx`, `CountUpNumber`, `empreendimentos/page.tsx`, `crm/page.tsx`, `primitives/index.ts`, `location.ts`, `LeadDetail`, `package.json`, `auditoria/page.tsx`, `relatorios/page.tsx`, `LeadAbordagemSection.tsx`, `leads/route.ts`, `leadsApi.ts`, `normalizeBrPhone`, `lucide-react`, `PropertyMaterialsModal.tsx`, `agenda/types.ts`, `fluxo-de-caixa/page.tsx`, `useCrm`, `SiteSettingsTab.tsx`, `NewSaleModal.tsx`, `ranking/page.tsx`, `IntegrationCard.tsx`, `saleSplitHelper.ts`, `PropertyLocationFields.tsx`, `useCrmLookups.ts`, `ChangeBrokerModal.test.tsx`, `useLeadsFilter.ts`, `PropertyDetailsModal.tsx`?**
  _High betweenness centrality (0.183) - this node is a cross-community bridge._
- **What connects `dynamic`, `dynamic`, `createSchema` to the rest of the system?**
  _984 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05421184320266889 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `app/page.tsx`, `SectionTitle`, `useLeadsActions.ts`, `vendas/page.tsx`, `agenda/page.tsx`, `CountUpNumber`, `empreendimentos/page.tsx`, `crm/page.tsx`, `primitives/index.ts`, `location.ts`, `LeadDetail`, `package.json`, `auditoria/page.tsx`, `relatorios/page.tsx`, `LeadAbordagemSection.tsx`, `react`, `leads/route.ts`, `leadsApi.ts`, `normalizeBrPhone`, `PropertyMaterialsModal.tsx`, `agenda/types.ts`, `fluxo-de-caixa/page.tsx`, `useCrm`, `SiteSettingsTab.tsx`, `NewSaleModal.tsx`, `ranking/page.tsx`, `IntegrationCard.tsx`, `saleSplitHelper.ts`, `PropertyLocationFields.tsx`, `useCrmLookups.ts`, `ChangeBrokerModal.test.tsx`, `PropertyDetailsModal.tsx`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Should `SectionTitle` be split into smaller, more focused modules?**
  _Cohesion score 0.10844155844155844 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `meta/route.ts`, `verifyWebhookKey`, `location.ts`, `package.json`, `LeadAbordagemSection.tsx`, `leads/route.ts`, `getJwtSecret`, `vendas/route.ts`, `lucide-react`, `agenda/types.ts`, `organizacao/route.ts`, `requireSession`, `properties/route.ts`, `useCrm`, `dashboardMetrics.ts`, `app/layout.tsx`, `uploadStorage.ts`, `compliance.ts`, `recordAudit`, `@prisma/client`, `auditoria/route.ts`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Should `🚀 Módulos e Funcionalidades` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._