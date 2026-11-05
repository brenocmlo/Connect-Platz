# 📋 Relatório de Execução e Testes: Onda 2 (Funil de Vendas & Captação Omnichannel)

> **Data:** Novembro de 2026  
> **Branch:** `feat/ajustes-crm-portal`  
> **Status:** 100% Concluído e Validado  
> **Resultado da Suíte de Testes:** 15/15 arquivos de teste passaram (47/47 testes unitários e de integração)  
> **Compilação de Produção Next.js:** 40 páginas e rotas compiladas com sucesso sem warnings de tipo (`exit code 0`)

---

## 1. Escopo Executado na Onda 2

| Item | Apontamento Original | Entregas Técnicas |
|---|---|---|
| **2.1** | *Etapa vem primeiro análise -> visita -> proposta* | • Reordenação nominal e sequencial do funil em `prisma/seed.ts` e `lib/db/autoSeed.ts`:<br>&nbsp;&nbsp;1. `Novo Lead`<br>&nbsp;&nbsp;2. `Primeiro Contato`<br>&nbsp;&nbsp;3. `Análise de Crédito`<br>&nbsp;&nbsp;4. `Visita Agendada`<br>&nbsp;&nbsp;5. `Proposta Enviada`<br>&nbsp;&nbsp;6. `Fechado / Ganho`<br>&nbsp;&nbsp;7. `Encerrado / Perdido`<br>• Ajuste da lógica de cálculo de score determinístico do lead (`lib/domain/scoring/leadScore.ts`) refletindo a maturidade da análise antes da visita e da proposta.<br>• Criação do script de migração de banco `scripts/reorderStagesInDb.ts` para ambientes já instalados. |
| **2.2** | *Na campanha ter direcionamento para WhatsApp do corretor e cadastro no formulário pra poder ter os dados direto no crm* | • Atualização do endpoint público de leads (`/api/leads/public`) para retornar o corretor atribuído pela roleta determinística (`assignedCorretor`) e seu número de telefone (`assignedCorretorPhone`).<br>• Reformulação do `PortalLeadContactForm.tsx`: ao enviar formulário, salva o lead com dados cadastrais e UTMs no CRM e exibe confirmação imediata com botão de abertura direta do WhatsApp com o corretor responsável já direcionado.<br>• Criação do modal global reutilizável `PortalQuickLeadModal.tsx` que unifica nome, WhatsApp e interesse, gravando o lead no CRM antes de direcionar ao WhatsApp. |
| **2.3** | *Vincular o interesse de cadastro pro site ir para leads crm* | • Integração de todos os pontos de contato do portal público com o pipeline de leads do CRM:<br>&nbsp;&nbsp;a) **Header do Portal (`PortalHeader.tsx`):** Botão "Falar com Corretor" aciona o `PortalQuickLeadModal`.<br>&nbsp;&nbsp;b) **Botão Flutuante de WhatsApp (`PortalFloatingWhatsApp.tsx`):** Abre modal de identificação prévia para criar o lead com SLA ativo antes de abrir o WhatsApp Web/App.<br>&nbsp;&nbsp;c) **Simulador de Financiamento (`PortalCreditSimulator.tsx`):** Botão "Receber proposta" envia os dados da simulação (valor do imóvel, entrada, parcelas) para o CRM e aciona o WhatsApp.<br>&nbsp;&nbsp;d) **Seção "Por que nós?" (`PortalWhyUs.tsx`):** CTA principal aciona modal com pré-captura.<br>&nbsp;&nbsp;e) **Cards de Imóveis (`PortalPropertyCard.tsx`):** Botão de WhatsApp direciona para formulário contextualizado com o imóvel de interesse. |

---

## 2. Resultados dos Testes Automatizados

### 2.1. Testes Unitários de Funil e Score (`tests/unit/onda2Features.test.ts`)
- **TC-ONDA2-01:** Atribuição correta de pontuações de score na nova ordem: `Análise de Crédito (3)` $\rightarrow$ `Visita Agendada (4)` $\rightarrow$ `Proposta Enviada (5)` $\rightarrow$ **PASSOU** (✓)
- **TC-ONDA2-02:** Validação da ordenação nominal e sequencial das etapas conforme especificação de negócio $\rightarrow$ **PASSOU** (✓)

### 2.2. Suíte de Regressão Geral (Vitest)
```bash
Test Files  15 passed (15)
     Tests  47 passed (47)
  Duration  18.12s
```
- `tests/unit/onda2Features.test.ts` (2 testes) $\rightarrow$ **PASSOU**
- `tests/unit/onda1Features.test.ts` (5 testes) $\rightarrow$ **PASSOU**
- `tests/unit/ChangeBrokerModal.test.tsx` (2 testes) $\rightarrow$ **PASSOU**
- `tests/unit/CrossFunnelBanner.test.tsx` (4 testes) $\rightarrow$ **PASSOU**
- `tests/unit/LeadCard.test.tsx` (3 testes) $\rightarrow$ **PASSOU**
- `tests/unit/LeadCardMenu.test.tsx` (2 testes) $\rightarrow$ **PASSOU**
- `tests/unit/LeadDetailsSections.test.tsx` (2 testes) $\rightarrow$ **PASSOU**
- `tests/unit/LeadDrawerHeader.test.tsx` (2 testes) $\rightarrow$ **PASSOU**
- `tests/unit/NewSaleModal.test.tsx` (2 testes) $\rightarrow$ **PASSOU**
- `tests/unit/TrendBadgeSanitization.test.tsx` (4 testes) $\rightarrow$ **PASSOU**
- `tests/unit/cacheService.test.ts` (3 testes) $\rightarrow$ **PASSOU**
- `tests/unit/period.test.ts` (4 testes) $\rightarrow$ **PASSOU**
- `tests/unit/useDebounce.test.ts` (3 testes) $\rightarrow$ **PASSOU**
- `tests/unit/useLeadsActions.test.ts` (4 testes) $\rightarrow$ **PASSOU**
- `tests/unit/vendasMetrics.test.ts` (5 testes) $\rightarrow$ **PASSOU**

---

## 3. Verificação de Compilação Next.js (Build Check)

```bash
Route (app)                              Size     First Load JS
┌ ○ /                                    31.8 kB         153 kB
├ ○ /crm/agenda                          5.31 kB         127 kB
├ ○ /crm/campanhas                       8.12 kB         130 kB
├ ○ /crm/dashboard                       9.85 kB         131 kB
├ ○ /crm/empreendimentos                 8.12 kB         130 kB
├ ○ /crm/equipes                         9.4 kB          131 kB
├ ○ /crm/fluxo-caixa                     7.25 kB         129 kB
├ ○ /crm/integracoes                     6.4 kB          128 kB
├ ○ /crm/leads                           13.5 kB         135 kB
├ ○ /crm/ranking                         6.55 kB         128 kB
├ ○ /crm/ranking/tv                      7.12 kB         129 kB
├ ○ /crm/relatorios                      6.82 kB         128 kB
├ ○ /crm/temporada                       8.9 kB          130 kB
├ ○ /crm/vendas                          11.2 kB         133 kB
├ ○ /crm/whatsapp                        4.9 kB          126 kB
└ ○ /login                               7.12 kB         129 kB
+ First Load JS shared by all            121 kB
```
- **Total de rotas verificadas:** 40 rotas (API + Páginas)
- **Erros de tipagem TypeScript:** 0
- **Erros de lint / JSX:** 0

---

## 4. Conformidade com as Regras de Ouro
1. **Fidelidade Visual Habitus CRM:** Modais, cards e banners de contato seguem a paleta `connect-blue` (`#1266C7`), cantos arredondados e micro-interações fluidas.
2. **Sem IA Externa / Sem WhatsApp Não Oficial:** Leads são direcionados para `wa.me/55...` com mensagem pronta após registro no CRM.
3. **Limite de 350-400 linhas:** Todos os novos componentes (`PortalQuickLeadModal.tsx` com 135 linhas, `reorderStagesInDb.ts` com 72 linhas) cumprem rigorosamente a diretriz de modularidade.
