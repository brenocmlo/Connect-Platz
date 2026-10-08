# Graph Report - Connect-Platz  (2026-10-07)

## Corpus Check
- 251 files · ~168,830 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .jsonl 2, (none) 1, .css 1)

## Summary
- 1530 nodes · 2977 edges · 92 communities (87 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ef134399`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- portalUtils.ts
- useCrm
- lucide-react
- vendas/page.tsx
- agenda/page.tsx
- generate_pdf_report.py
- prisma.ts
- ranking/page.tsx
- IUserRepository
- next
- NewSaleModal.tsx
- LeadDetailsSections.tsx
- react
- index.ts
- LeadCard.tsx
- package.json
- verifySessionToken
- PageHeader
- container.ts
- crm/layout.tsx
- LeadsPage
- dependencies
- compilerOptions
- leads/route.ts
- @prisma/client
- brandkit/SKILL.md
- jwt.ts
- ILeadRepository
- IntegrationsSection.tsx
- CORE DIRECTIVE: IMAGE-FIRST WEBSITE DESIGN TO CODE
- devDependencies
- CORE DIRECTIVE: PREMIUM MOBILE APP IMAGE DIRECTION
- High-Agency Frontend Skill
- manifest.json
- auditoria/page.tsx
- recharts
- LeadDetail
- SaleDetailModal.tsx
- scripts
- CrmContext.tsx
- app/layout.tsx
- properties/route.ts
- Appendix B - Canonical Sources (read these before reinventing)
- Design Audit
- Analysis & Synthesis Instructions
- fluxo-de-caixa/page.tsx
- sw.js
- Agent Skill: Principal UI/UX Architect & Motion Choreographer (Awwwards-Tier)
- SKILL: Industrial Brutalism & Tactical Telemetry UI
- Design System: Taste Standard
- CORE DIRECTIVE: AWWWARDS-LEVEL IMAGE ART DIRECTION
- 2. THE COMBINATORIAL VARIATION ENGINE
- LeadDrawer.tsx
- equipes/page.tsx
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
- 29. ANTI-AI-SLOP RULES
- 5. IMAGE COUNT & PAGE SLICING
- 0. BRIEF INFERENCE (Read the Room Before Anything Else)
- 12. THE BLOCK LIBRARY (Contract - Implementations Land Here Iteratively)
- 5. CONTEXT-AWARE PROACTIVITY
- 8. DARK MODE PROTOCOL
- 21. MOBILE ANTI-AI-TELLS RULE
- LeadsTable.tsx
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

## God Nodes (most connected - your core abstractions)
1. `react` - 148 edges
2. `lucide-react` - 115 edges
3. `useCrm()` - 65 edges
4. `CORE DIRECTIVE: IMAGE-FIRST WEBSITE DESIGN TO CODE` - 39 edges
5. `CORE DIRECTIVE: PREMIUM MOBILE APP IMAGE DIRECTION` - 39 edges
6. `@prisma/client` - 38 edges
7. `LeadDetail` - 34 edges
8. `next` - 27 edges
9. `SectionTitle()` - 23 edges
10. `CountUpNumber()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `1. Padrões de Animação e Movimento (Motion System)` --references--> `AnimatedCrown()`  [INFERRED]
  AGENTS.md → components/crm/AnimatedCrown.tsx
- `1. Padrões de Animação e Movimento (Motion System)` --references--> `AnimatedCrown()`  [INFERRED]
  GEMINI.md → components/crm/AnimatedCrown.tsx
- `POST()` --calls--> `verifySessionToken()`  [EXTRACTED]
  app/api/auth/checkin/route.ts → lib/auth/jwt.ts
- `PATCH()` --calls--> `verifySessionToken()`  [EXTRACTED]
  app/api/auth/status/route.ts → lib/auth/jwt.ts
- `getSessionContext()` --calls--> `verifySessionToken()`  [EXTRACTED]
  app/api/bookings/route.ts → lib/auth/jwt.ts

## Import Cycles
- 3-file cycle: `components/crm/LeadDrawer.tsx -> components/crm/leads/KanbanBoard.tsx -> components/crm/leads/KanbanColumn.tsx -> components/crm/LeadDrawer.tsx`
- 3-file cycle: `components/crm/leads/KanbanBoard.tsx -> components/crm/leads/KanbanColumn.tsx -> components/crm/leads/LeadCard.tsx -> components/crm/leads/KanbanBoard.tsx`
- 4-file cycle: `components/crm/leads/KanbanBoard.tsx -> components/crm/leads/KanbanColumn.tsx -> components/crm/leads/LeadCard.tsx -> components/crm/leads/leadCalculations.ts -> components/crm/leads/KanbanBoard.tsx`
- 4-file cycle: `components/crm/LeadDrawer.tsx -> components/crm/leads/KanbanBoard.tsx -> components/crm/leads/KanbanColumn.tsx -> components/crm/leads/LeadCard.tsx -> components/crm/LeadDrawer.tsx`
- 5-file cycle: `components/crm/LeadDrawer.tsx -> components/crm/leads/KanbanBoard.tsx -> components/crm/leads/KanbanColumn.tsx -> components/crm/leads/LeadCard.tsx -> components/crm/leads/leadCalculations.ts -> components/crm/LeadDrawer.tsx`
- 5-file cycle: `components/crm/LeadDrawer.tsx -> components/crm/leads/KanbanBoard.tsx -> components/crm/leads/KanbanColumn.tsx -> components/crm/leads/LeadCard.tsx -> components/crm/leads/LeadCardMenu.tsx -> components/crm/LeadDrawer.tsx`

## Communities (92 total, 5 thin omitted)

### Community 0 - "portalUtils.ts"
Cohesion: 0.06
Nodes (75): LandingPage(), CATEGORIES, PortalCategories(), Field(), ModalPanel(), PortalContactModal(), PortalContactModalProps, digitsOnly() (+67 more)

### Community 1 - "useCrm"
Cohesion: 0.28
Nodes (13): ConfigTab, ConfiguracoesPage(), tabList, AccessibilitySection(), fontOptions, AdminGeneralTab(), ChangePasswordSection(), ProfileTab() (+5 more)

### Community 2 - "lucide-react"
Cohesion: 0.05
Nodes (37): EmpreendimentosPage(), mockPublicUnits, Unit, topPropertiesData, TimelineEntry, EmptyState(), EmptyStateProps, EmpreendimentosListProps (+29 more)

### Community 3 - "vendas/page.tsx"
Cohesion: 0.18
Nodes (15): initialFilters, initialSales, VendasComissoesPage(), NewSaleModalProps, SaleDetailModal(), SaleDetailModalProps, SplitCalculationParams, SaleItem (+7 more)

### Community 4 - "agenda/page.tsx"
Cohesion: 0.13
Nodes (23): AgendaPage(), initialAppointments, AgendaDayView(), AgendaDayViewProps, AgendaHeader(), AgendaHeaderProps, AgendaMonthView(), AgendaMonthViewProps (+15 more)

### Community 5 - "generate_pdf_report.py"
Cohesion: 0.12
Nodes (9): capture(), build_conclusion_page(), create_module_page(), generate_pdf(), build_api_audit_table(), build_compliance_table(), build_cover_elements(), get_pdf_styles() (+1 more)

### Community 6 - "prisma.ts"
Cohesion: 0.09
Nodes (13): dynamic, GET(), POST(), globalForPrisma, prisma, IngestLeadInput, IngestLeadSchema, MetaWebhookLeadgenEntrySchema (+5 more)

### Community 7 - "ranking/page.tsx"
Cohesion: 0.05
Nodes (47): 1. Padrões de Animação e Movimento (Motion System), 2. Padrões Visuais e Identidade de Interface (UI System), 3. Diretrizes de Escopo, 4. Diretrizes de Engenharia, Modularidade e Manutenibilidade de Código, 5.10 Integrações, 5.11 Motion e Micro-interações (capturadas), 5.12 Checklist de Conformidade para Novas Telas, 5.1 Tokens de Design (Habitus → Connect Platz) (+39 more)

### Community 8 - "IUserRepository"
Cohesion: 0.05
Nodes (17): AuthenticateInput, AuthenticateOutput, AuthenticateUserUseCase, RegisterUserInput, RegisterUserUseCase, IPasswordHasher, ITokenService, UserTokenPayload (+9 more)

### Community 9 - "next"
Cohesion: 0.12
Nodes (10): POST(), GET(), POST(), POST(), POST(), POST(), POST(), StandardWebhookPayload (+2 more)

### Community 10 - "NewSaleModal.tsx"
Cohesion: 0.21
Nodes (11): initialSampleProperties, NewSaleModal(), SaleAttachment, SaleAttachmentsTab(), SaleAttachmentsTabProps, SaleCalculationsTab(), SaleCalculationsTabProps, SaleParticipantsSection() (+3 more)

### Community 11 - "LeadDetailsSections.tsx"
Cohesion: 0.13
Nodes (15): AbordagemItem, canaisConfig, CanalAbordagem, DesfechoAbordagem, desfechosConfig, LeadAbordagemSection(), LeadAbordagemSectionProps, LeadAttachmentFile (+7 more)

### Community 12 - "react"
Cohesion: 0.10
Nodes (21): EditLeadModal(), defaultStages, DocumentSlot, initialDocs, LeadDocumentUploadSlots(), LeadFilterSheet(), LeadFilterSheetProps, LeadsHeader() (+13 more)

### Community 13 - "index.ts"
Cohesion: 0.06
Nodes (51): CrmDashboardPage(), CountUpNumber(), CountUpNumberProps, CashFlowSummaryCard(), CashFlowSummaryCardProps, ExecutiveKpiCards(), FinancialStatCards(), FinancialStatCardsProps (+43 more)

### Community 14 - "LeadCard.tsx"
Cohesion: 0.23
Nodes (12): LeadDrawerActions(), LeadDrawerActionsProps, LeadDrawerProps, FunnelColumn, KanbanColumnProps, findLeadStageIndex(), getNextStage(), LeadCard() (+4 more)

### Community 15 - "package.json"
Cohesion: 0.09
Nodes (20): name, private, version, autoprefixer, clsx, date-fns, postcss, prisma (+12 more)

### Community 16 - "verifySessionToken"
Cohesion: 0.19
Nodes (11): POST(), PATCH(), StatusSchema, dynamic, fallbackEntries, GET(), getSessionContext(), dynamic (+3 more)

### Community 17 - "PageHeader"
Cohesion: 0.21
Nodes (10): campaignRoiData, closedLeadsForRemarketing, funnelEfficiencyData, RelatoriosBiPage(), BookingItem, mockBookings, TemporadaVeraneioPage(), PageHeader() (+2 more)

### Community 18 - "container.ts"
Cohesion: 0.14
Nodes (11): LoginSchema, BookingSchema, getSessionContext(), POST(), dynamic, PublicLeadSchema, QualifyCreditInput, QualifyCreditUseCase (+3 more)

### Community 19 - "crm/layout.tsx"
Cohesion: 0.21
Nodes (11): CrmLayout(), CrmShell(), CrmProvider(), FloatingSupport(), PwaInstallPrompt(), NavItem, navItems, Sidebar() (+3 more)

### Community 20 - "LeadsPage"
Cohesion: 0.24
Nodes (9): LeadsPage(), PeriodFilter, KanbanBoard(), KanbanBoardProps, KanbanColumn(), useLeadsFilter(), UseLeadsFilterProps, ToastFeedback() (+1 more)

### Community 21 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, bcryptjs, canvas-confetti, clsx, date-fns, framer-motion, jsonwebtoken, jspdf (+10 more)

### Community 22 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+9 more)

### Community 23 - "leads/route.ts"
Cohesion: 0.23
Nodes (12): GET(), getSessionContext(), PATCH(), UpdateLeadSchema, dynamic, GET(), getSessionContext(), ManualLeadSchema (+4 more)

### Community 24 - "@prisma/client"
Cohesion: 0.22
Nodes (6): CreateSeasonBookingInput, CreateSeasonBookingUseCase, CreateBookingDto, IBookingRepository, PrismaBookingRepository, @prisma/client

### Community 25 - "brandkit/SKILL.md"
Cohesion: 0.05
Nodes (43): 1. Logo Cover, 1. Monogram + Meaning, 2 × 3 REFERENCE-STYLE LAYOUT, 2. Logo Construction, 2. Product Action, 3. Digital Application, 3. Metaphor Fusion, 4. Brand Essence (+35 more)

### Community 26 - "jwt.ts"
Cohesion: 0.24
Nodes (8): SessionPayload, signSessionToken(), hashPassword(), verifyPassword(), AuthService, LoginResult, main(), prisma

### Community 27 - "ILeadRepository"
Cohesion: 0.05
Nodes (18): DistributeLeadUseCase, DistributionResult, IngestLeadDto, IngestLeadResult, IngestLeadUseCase, ProcessSlaTransbordoUseCase, CreditQualificationData, CreditValidationResult (+10 more)

### Community 28 - "IntegrationsSection.tsx"
Cohesion: 0.33
Nodes (7): initialIntegrations, IntegrationCard(), IntegrationCardProps, IntegrationInstructionsTab(), IntegrationInstructionsTabProps, IntegrationItem, IntegrationStatus

### Community 29 - "CORE DIRECTIVE: IMAGE-FIRST WEBSITE DESIGN TO CODE"
Cohesion: 0.06
Nodes (34): 10. IMAGE-FIRST CODEX WEBSITE WORKFLOW, 11. WHEN TO TRIGGER IMAGE GENERATION FIRST, 13. WEBSITE REFERENCE RULE, 15. RESPONSIVE FIRST-VIEW RULE, 16. ANTI-NESTED-BOX RULE, 17. REDUCE MICRO-UI CLUTTER RULE, 18. SECTION IMAGE GENERATION RULE, 19. WEBSITE IMAGE SYSTEM RULE (+26 more)

### Community 30 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, autoprefixer, postcss, prisma, tailwindcss, @types/bcryptjs, @types/canvas-confetti, @types/jsonwebtoken (+4 more)

### Community 31 - "CORE DIRECTIVE: PREMIUM MOBILE APP IMAGE DIRECTION"
Cohesion: 0.06
Nodes (34): 10. DEVICE MOCKUP FRAME RULE, 11. ONBOARDING FLOW RULE, 12. FIRST SCREEN CLEANLINESS RULE, 13. SAFE AREA AND SYSTEM REGION RULE, 14. NAVIGATION RULE, 15. CLEAN LAYOUT RULE, 16. CREATIVE IMAGE DIRECTION RULE, 17. BACKGROUND TEXTURE AND SURFACE RULE (+26 more)

### Community 32 - "High-Agency Frontend Skill"
Cohesion: 0.06
Nodes (30): 10. FINAL PRE-FLIGHT CHECK, 1. ACTIVE BASELINE CONFIGURATION, 2. DEFAULT ARCHITECTURE & CONVENTIONS, 3. DESIGN ENGINEERING DIRECTIVES (Bias Correction), 4. CREATIVE PROACTIVITY (Anti-Slop Implementation), 5. PERFORMANCE GUARDRAILS, 6. TECHNICAL REFERENCE (Dial Definitions), 7. AI TELLS (Forbidden Patterns) (+22 more)

### Community 33 - "manifest.json"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 34 - "auditoria/page.tsx"
Cohesion: 0.19
Nodes (16): AuditoriaPage(), AuditDetailModal(), AuditDetailModalProps, AuditFilters(), AuditFiltersProps, AuditStatCards(), AuditStatCardsProps, AuditTable() (+8 more)

### Community 35 - "recharts"
Cohesion: 0.29
Nodes (3): leadEvolutionData, regionDistributionData, recharts

### Community 36 - "LeadDetail"
Cohesion: 0.21
Nodes (7): LeadInfoTabProps, LeadTrackingTabProps, LeadDetail, BolsaoSection(), BolsaoSectionProps, EditLeadModalProps, LeadCardMenuProps

### Community 37 - "SaleDetailModal.tsx"
Cohesion: 0.27
Nodes (8): SaleCard(), SaleCardProps, SaleItem, SplitItem, CommissionReceiptData, generateCommissionReceiptPdf(), jspdf, jspdf-autotable

### Community 38 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, prisma:generate, prisma:migrate, start

### Community 39 - "CrmContext.tsx"
Cohesion: 0.25
Nodes (7): FontOption, CrmContext, CrmContextType, CrmNotification, FontSizePreference, ThemeMode, UserSession

### Community 40 - "app/layout.tsx"
Cohesion: 0.33
Nodes (3): dmSans, metadata, viewport

### Community 41 - "properties/route.ts"
Cohesion: 0.50
Nodes (3): dynamic, generateSlug(), POST()

### Community 42 - "Appendix B - Canonical Sources (read these before reinventing)"
Cohesion: 0.09
Nodes (21): APPENDICES - Real Source-Backed Reference Material, Appendix A - Install Commands per Design System, Appendix B - Canonical Sources (read these before reinventing), Appendix C - Apple Liquid Glass: Honest Web Approximation, Apple Liquid Glass (Apple platforms only), Atlassian, Bootstrap, Carbon (+13 more)

### Community 43 - "Design Audit"
Cohesion: 0.10
Nodes (19): Code Quality, Color and Surfaces, Component Patterns, Content, Design Audit, Fix Priority, How This Works, Iconography (+11 more)

### Community 44 - "Analysis & Synthesis Instructions"
Cohesion: 0.11
Nodes (18): 1. Define the Atmosphere, 2. Map the Color Palette, 3. Establish Typography Rules, 4. Define the Hero Section, 5. Describe Component Stylings, 6. Define Layout Principles, 7. Define Responsive Rules, 8. Encode Motion Philosophy (+10 more)

### Community 45 - "fluxo-de-caixa/page.tsx"
Cohesion: 0.20
Nodes (13): FluxoCaixaDREPage(), initialCashFlows, CashFlowProjection(), projectionData, CashFlowItem, CashFlowTable(), CashFlowTableProps, ConfirmCashMovementModal() (+5 more)

### Community 50 - "Agent Skill: Principal UI/UX Architect & Motion Choreographer (Awwwards-Tier)"
Cohesion: 0.11
Nodes (17): 1. Meta Information & Core Directive, 2. THE "ABSOLUTE ZERO" DIRECTIVE (STRICT ANTI-PATTERNS), 3. THE CREATIVE VARIANCE ENGINE, 4. HAPTIC MICRO-AESTHETICS (COMPONENT MASTERY), 5. MOTION CHOREOGRAPHY (FLUID DYNAMICS), 6. PERFORMANCE GUARDRAILS, 7. EXECUTION PROTOCOL, 8. PRE-OUTPUT CHECKLIST (+9 more)

### Community 51 - "SKILL: Industrial Brutalism & Tactical Telemetry UI"
Cohesion: 0.12
Nodes (16): 1. Skill Meta, 2.1 Swiss Industrial Print, 2.2 Tactical Telemetry & CRT Terminal, 2. Visual Archetypes, 3.1 Macro-Typography (Structural Headers), 3.2 Micro-Typography (Data & Telemetry), 3.3 Textural Contrast (Artistic Disruption), 3. Typographic Architecture (+8 more)

### Community 53 - "Design System: Taste Standard"
Cohesion: 0.13
Nodes (14): 1. Visual Theme & Atmosphere, 2. Color Palette & Roles, 3. Typography Rules, 4. Component Stylings, 5. Hero Section, 6. Layout Principles, 7. Responsive Rules, 8. Motion & Interaction (Code-Phase Intent) (+6 more)

### Community 55 - "CORE DIRECTIVE: AWWWARDS-LEVEL IMAGE ART DIRECTION"
Cohesion: 0.14
Nodes (14): 10. SECTION RHYTHM RULE, 12. DENSITY & SPACING DISCIPLINE, 14. IMAGE / MEDIA DIRECTION, 16. MULTI-IMAGE CONSISTENCY RULE, 17. CLARITY CHECK, 19. RESPONSE BEHAVIOR, 1. ACTIVE BASELINE CONFIGURATION, 21. FINAL GOAL (+6 more)

### Community 56 - "2. THE COMBINATORIAL VARIATION ENGINE"
Cohesion: 0.14
Nodes (14): 2. THE COMBINATORIAL VARIATION ENGINE, Background Character, Background Mode (per-section), Composition Anchor (per-section), CTA Variation, Hero Architecture, Hero Scale (per-page), Motion-Implied Language (+6 more)

### Community 57 - "LeadDrawer.tsx"
Cohesion: 0.31
Nodes (7): LeadDrawerHeader(), LeadDrawerHeaderProps, defaultEvents(), HistoryEvent, LeadHistoryTimeline(), LeadHistoryTimelineProps, LeadDrawer()

### Community 58 - "equipes/page.tsx"
Cohesion: 0.18
Nodes (14): EquipesPage(), mockTeam, TeamMember, IntegracoesPage(), AccessDeniedCard(), AccessDeniedCardProps, InviteCollaboratorData, InviteCollaboratorModal() (+6 more)

### Community 60 - "4. DESIGN ENGINEERING DIRECTIVES (Bias Correction)"
Cohesion: 0.17
Nodes (12): 4.10 Quotes & Testimonials, 4.11 Page Theme Lock (Light / Dark Mode Consistency), 4.1 Typography, 4.2 Color Calibration, 4.3 Layout Diversification, 4.4 Materiality, Shadows, Cards, 4.5 Interactive UI States, 4.6 Data & Form Patterns (+4 more)

### Community 61 - "10. REFERENCE VOCABULARY (Pattern Names the Agent Should Know)"
Cohesion: 0.20
Nodes (10): 10. REFERENCE VOCABULARY (Pattern Names the Agent Should Know), Animation Library Choice, Cards & Containers, Galleries & Media, Hero Paradigms, Layout & Grids, Micro-Interactions & Effects, Navigation & Menus (+2 more)

### Community 62 - "tasteskill: Anti-Slop Frontend Skill"
Cohesion: 0.20
Nodes (10): 13. OUT OF SCOPE, 14. FINAL PRE-FLIGHT CHECK, 1.A Dial Inference (design read → dial values), 1.B Use-Case Presets, 1.C How the Dials Drive Output, 1. THE THREE DIALS (Core Configuration), 2.A When to reach for a real design system (use official packages), 2.B When the brief is an aesthetic, not a system (+2 more)

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

### Community 79 - "29. ANTI-AI-SLOP RULES"
Cohesion: 0.33
Nodes (6): 29. ANTI-AI-SLOP RULES, Content slop, Density slop, Layout slop, Typography slop, Visual slop

### Community 80 - "5. IMAGE COUNT & PAGE SLICING"
Cohesion: 0.33
Nodes (6): 5. IMAGE COUNT & PAGE SLICING, Continuity Rule, Counting rule, Format, Section size variety, THIS IS THE PRIMARY OUTPUT RULE

### Community 82 - "0. BRIEF INFERENCE (Read the Room Before Anything Else)"
Cohesion: 0.40
Nodes (5): 0.A Read these signals first, 0.B Output a one-line "Design Read" before generating, 0. BRIEF INFERENCE (Read the Room Before Anything Else), 0.C If the brief is ambiguous, ask one question, do not guess, 0.D Anti-Default Discipline

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

### Community 87 - "LeadsTable.tsx"
Cohesion: 0.31
Nodes (7): HotLeadsPanel(), LeadQuente, mockHotLeads, LeadsTable(), ScoreBadge(), SlaBadge(), SlaBadgeProps

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

## Knowledge Gaps
- **703 isolated node(s):** `dynamic`, `LoginSchema`, `StatusSchema`, `BookingSchema`, `dynamic` (+698 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 800 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `portalUtils.ts`, `useCrm`, `lucide-react`, `vendas/page.tsx`, `agenda/page.tsx`, `ranking/page.tsx`, `NewSaleModal.tsx`, `LeadDetailsSections.tsx`, `index.ts`, `LeadCard.tsx`, `package.json`, `PageHeader`, `crm/layout.tsx`, `LeadsPage`, `IntegrationsSection.tsx`, `auditoria/page.tsx`, `recharts`, `LeadDetail`, `SaleDetailModal.tsx`, `CrmContext.tsx`, `fluxo-de-caixa/page.tsx`, `LeadDrawer.tsx`, `equipes/page.tsx`, `LeadsTable.tsx`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **What connects `dynamic`, `LoginSchema`, `StatusSchema` to the rest of the system?**
  _703 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `portalUtils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06425438596491229 - nodes in this community are weakly interconnected._
- **Why does `@prisma/client` connect `@prisma/client` to `prisma.ts`, `IUserRepository`, `properties/route.ts`, `next`, `package.json`, `verifySessionToken`, `container.ts`, `leads/route.ts`, `jwt.ts`, `ILeadRepository`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.052884615384615384 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `portalUtils.ts`, `useCrm`, `vendas/page.tsx`, `agenda/page.tsx`, `ranking/page.tsx`, `NewSaleModal.tsx`, `LeadDetailsSections.tsx`, `react`, `index.ts`, `LeadCard.tsx`, `package.json`, `PageHeader`, `crm/layout.tsx`, `LeadsPage`, `IntegrationsSection.tsx`, `auditoria/page.tsx`, `LeadDetail`, `SaleDetailModal.tsx`, `fluxo-de-caixa/page.tsx`, `LeadDrawer.tsx`, `equipes/page.tsx`, `LeadsTable.tsx`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Should `agenda/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13368983957219252 - nodes in this community are weakly interconnected._