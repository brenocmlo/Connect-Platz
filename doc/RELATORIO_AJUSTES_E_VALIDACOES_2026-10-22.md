# Relatório de Ajustes e Validações — Connect Platz CRM

**Data:** 22/10/2026 · **Origem:** inconformidades de `doc/RELATORIO_EXECUCAO_PLANO_DE_TESTES_2026-10-22.md` · **Branch:** `main` (alterações **não commitadas**)
**Escopo:** 203 arquivos alterados, 71 novos, 14 removidos.

---

## 1. Resumo

| Indicador | Resultado |
|---|---|
| Bloqueadores P0 corrigidos | **10 de 10** |
| Reteste de API do plano | **82 de 82 verificações conforme o esperado** |
| `npx tsc --noEmit` | 0 erros |
| `npm run build` (cópia isolada) | exit 0, sem avisos |
| Arquivos acima de 400 linhas | 0 |
| Testes visuais em navegador | **não executados** (não há navegador automatizado neste ambiente) |

---

## 2. Base compartilhada (segurança e infraestrutura)

| Ajuste | Arquivos |
|---|---|
| **Sessão padronizada.** O cookie HttpOnly é lido primeiro; o Bearer só serve para integrações. Sem sessão, a API responde 401. Não existe mais fallback para ADMINISTRADOR nem o token "demo". Helpers `requireSession`, `isManager`, `isDirector` e `getClientIp`. | `lib/auth/session.ts` (novo), `lib/auth/jwt.ts`, `lib/infrastructure/security/JwtTokenService.ts` |
| **Segredo JWT obrigatório.** O sistema recusa segredo ausente, com menos de 32 caracteres ou igual ao valor padrão antigo. Vale no Node e no Edge (middleware). | `lib/auth/secret.ts` (novo), `middleware.ts` |
| **Login.** O token sai do corpo da resposta e do localStorage. O "modo demonstração", que aceitava qualquer senha com o banco fora do ar, foi removido. O login fica registrado na auditoria. | `app/api/auth/login/route.ts`, `app/login/page.tsx`, `lib/auth/seedAdmin.ts` (removido) |
| **Rotas de autenticação** (`/me`, `/checkin`, `/status`). Usam a sessão padronizada e não retornam mais sucesso falso quando o banco está fora do ar. | `app/api/auth/*` |
| **Contexto do front.** Parou de enviar o `Bearer cookie-session`. Notificações reais via `/api/notificacoes` (leads novos, SLA estourado, compromissos do dia). Botão "Simular Lead" removido. | `components/crm/CrmContext.tsx`, `components/crm/Topbar.tsx`, `components/crm/useCrmNotifications.ts` (novo), `app/api/notificacoes/route.ts` (novo) |
| **Auditoria no servidor.** `recordAudit` grava em `audit_logs` com IP, usuário ou integração, módulo e dados antes/depois. | `lib/services/audit-server.ts` (novo) |
| **Telefone e WhatsApp.** `normalizeBrPhone` remove a máscara e o DDI 55; `buildWhatsAppUrl` gera link `wa.me/55…?text=`. | `lib/utils/phone.ts` (novo) |
| **Dia útil de Fortaleza.** Check-in e roleta usam a data local de Fortaleza, independente do fuso do servidor. | `lib/utils/businessDay.ts` (novo), `lib/services/roleta.ts`, `lib/auth/service.ts`, `lib/infrastructure/repositories/PrismaUserRepository.ts`, `prisma/seed.ts` |
| **Score determinístico.** Calculado a partir de telefone, e-mail, interesse, renda, tempo até o primeiro contato, documentos, visita e proposta. Calibrável; limiares 75 (Quente) e 40 (Morno). | `lib/domain/scoring/leadScore.ts`, `lib/services/lead-score.ts` (novos) |
| **Configurações da organização** (regras de score, metas, contatos) gravadas em `Organization.settings`. | `lib/domain/settings/orgSettings.ts` (novo) |
| **Variáveis de ambiente.** `JWT_SECRET` e `META_VERIFY_TOKEN` trocados por valores aleatórios. Criados `CRON_SECRET`, `GOOGLE_ADS_WEBHOOK_KEY`, `CONNECT_PLATZ_API_KEY`, `PORTAL_WEBHOOK_KEY` e `LANDING_PAGE_WEBHOOK_KEY`. O `docker-compose` passa a exigir os segredos. Backup do `.env` anterior no scratchpad da sessão. | `.env`, `.env.example`, `.env.production.example`, `docker-compose.yml` |

### Schema (aditivo, via `prisma db push`; nenhum dado removido)
- `Lead`: `tags`, `observacoes`, `score`
- `Organization`: `settings` (JSON)
- `User`: `bio`
- `Property`: `construtora`, `cep`, `latitude`, `longitude`
- `CashFlow`: `centroCusto`, `observacaoLiquidacao`
- Enum `AppointmentType`: `+ LEMBRETE`, `+ DOCUMENTACAO`
- Enum `LeadSource`: `+ API_EXTERNA`
- Novo model `PropertyMaterial` (tabela `property_materials`)

---

## 3. Ajustes por módulo

### 3.1 Leads e Kanban (TC-FUNC-05 a 10)
- **APIs:**
  - `/api/leads` e `/api/leads/[id]` exigem sessão e aplicam RLS: o corretor só vê e altera os leads dele, e o gestor vê a organização inteira.
  - O POST aceita os aliases do plano: `renda`, `origem`, `etapaId`, `corretorId`, `observacoes`, `tags`, `empreendimentoInteresse`.
  - O PATCH trata etapa (validada no mesmo funil), ASSUMIR_BOLSAO, MOVER_BOLSAO, REGISTRAR_CONTATO, etiquetas, transferência e edição completa.
  - Novo DELETE: devolve 409 se o lead tiver vendas.
  - Novas sub-rotas `[id]/timeline` e `[id]/documents`.
  - Toda alteração recalcula o score e registra na timeline e na auditoria.
- **Front:**
  - Só dados reais (`sampleLeads.ts` removido).
  - Arrastar, avançar, criar, excluir, bolsão, etiquetas e edição persistem via API, com reversão quando a chamada falha.
  - O toast "Lead atualizado com sucesso!" só aparece depois que a API confirma.
- **Histórico de abordagens:** sai do localStorage e passa a usar a timeline real.
- **Badges:**
  - `ScoreBadge` com 🧊/☕/🔥 e limiares 75/40.
  - `SlaBadge` pulsa após 15 minutos sem contato, aparece no card do Kanban e funciona em light e dark.
- **WhatsApp:** links com `buildWhatsAppUrl` e mensagem; o clique registra o primeiro contato.
- **Removidos** (sem uso e com cores fixas de tema escuro): `LeadFinancingConveyor`, `LeadTimelineTab`, `LeadInfoTab`, `LeadDocsTab`, `LeadTrackingTab`.

### 3.2 Empreendimentos, Upload e Localização (TC-FUNC-11 a 14, INT-08/09)
- **Upload:**
  - Exige sessão e só aceita pastas de uma lista fixa (`startsWith` evita path traversal).
  - O tipo é detectado pelos magic bytes e a extensão vem do MIME validado.
  - SVG, HTML, XML e JS são recusados; acima de 25 MB retorna 413.
- **Imóveis:**
  - GET público, limitado à vitrine. POST, PATCH e DELETE só para gestor da organização da sessão.
  - Grava construtora, CEP e lat/lng, geocodificando quando faltar.
  - Respeita o valor 0 informado (antes virava valor padrão).
  - Imóvel com vendas é desativado em vez de apagado.
- **Materiais:** novo model e API (`/api/properties/[id]/materials`). Saíram os materiais fictícios e o localStorage; o DELETE também apaga o arquivo físico.
- **Ficha comercial:**
  - Link específico por imóvel (`/?imovel=<slug>`).
  - Waze com `ll=lat,lng&navigate=yes`; Google Maps com `maps/dir/?api=1&destination=`.
- **Localização:**
  - ViaCEP primeiro: CEP inexistente retorna 404.
  - Coordenadas pelo Nominatim, com cache.
  - Novo `POST /api/location/property`.
  - Sem endereço padrão "Meireles" e sem pontos de interesse inventados.
- **Configurações do site:** a escrita exige gestor e validação estrita das chaves.
- **Portal:** o número de WhatsApp vem das configurações do site (antes era o número fictício `5585999990001`); sem número configurado, o botão some.
- **Tema:** os modais usam `PropertyModalShell`, com tokens de light e dark.

### 3.3 Agenda (TC-FUNC-15)
- **Tipos:** Visita, Lembrete, Documentação, Retorno/Follow-up e Proposta são mapeados para o enum. Antes, os 4 tipos além de Visita davam 500.
- **API:** GET, POST, PATCH e DELETE com checagem de organização e de dono, e auditoria.
- **Modal:** busca de lead e de empreendimento com dados reais; título preenchido automaticamente.
- **Tela:** "Hoje" é a data real (antes estava fixo em 01/10/2026), sem amostras.
- **Visual:** a borda esquerda de 3 px na cor do tipo agora também aparece no dark mode.

### 3.4 Vendas e Comissões (TC-FUNC-16)
- **Cálculo** determinístico em `saleSplitHelper.ts`:
  - Gerente, Gestor e Captador começam em 0%.
  - O sistema bloqueia a venda quando os participantes somam mais que a comissão líquida.
  - O resumo mostra todos os participantes e a parte da imobiliária.
- **API:**
  - Grava o `beneficiarioTipo` correto, o corretor escolhido e status "ativa".
  - Gera os lançamentos no Fluxo de Caixa e registra auditoria.
  - Não retorna mais sucesso falso.
  - O corretor só vê as vendas em que participa.
- **Baixa de comissão:** `PATCH /api/vendas/splits/[id]`, restrito à diretoria.
- **Tela:** sem `initialSales`; tendências calculadas.

### 3.5 Fluxo de Caixa e DRE (TC-FUNC-17)
- **API:**
  - POST (criar), PATCH (confirmar/estornar) e DELETE, todos restritos à diretoria e auditados.
  - Grava centro de custo e observação da liquidação.
- **Tela:**
  - Só dados reais.
  - Projeção a partir dos lançamentos reais.
  - Regra de hooks corrigida.
  - Tendência real contra o mês anterior; a de despesas usa cores invertidas (`TrendBadge invertColors`).

### 3.6 Dashboard, Relatórios BI e Ranking (TC-FUNC-18/19)
- **Período:** o `PageHeader` agora mostra o seletor (Hoje, 7 dias, Mês, 30 dias, Ano, Todos), ligado ao estado global.
- **Count-Up:** anima a partir do valor anterior, cancela a animação pendente e respeita reduced-motion.
- **Dashboard:**
  - A API aceita `?period=` e não tem mais números fixos.
  - Tendências comparadas com o período anterior.
  - Corretor vê só os próprios dados; o caixa da empresa aparece só para a diretoria.
  - Gráficos, funil, leads quentes, compromissos, equipe e atividades vêm do banco.
- **Relatórios BI:** nova `GET /api/relatorios` com agregações reais (`biData.ts` removido). PDF e XLSX passam a ser gerados a partir dos dados reais.
- **Ranking:**
  - A tela lê `podium` e `fullRanking`, com ordenação determinística.
  - Pódio 1º/2º/3º com `AnimatedCrown` e medalhas.
  - "Corretor do Mês" é o líder real.
- **Metas:** `/api/metas` grava em `Organization.settings.goals`; o progresso é calculado a partir dos dados reais.

### 3.7 Configurações, Auditoria, Equipes e Integrações (TC-FUNC-20/21)
- **Configurações:** APIs `/api/configuracoes/{perfil,organizacao,sla,score,senha}`.
  - As abas carregam e salvam de verdade.
  - Saíram o telefone, a bio e o CRECI fictícios.
  - Salvar regras de score recalcula o score dos leads abertos.
  - Corretor vê só "Minha Conta"; gerente também vê SLA e Score; dados da imobiliária ficam com a diretoria.
- **Auditoria:**
  - Lê `audit_logs`, com paginação e filtros.
  - Saíram os logs mock, o IP falso e o localStorage.
  - `logAuditEvent` no cliente só faz POST para a API.
- **Equipes:** exige gestor, sem mocks, com auditoria.
- **Integrações:**
  - Instruções com a chave de cada canal e URL com `?token=`.
  - Status "Conectado" só quando há lead recebido pelo canal.
  - `/api/integracoes/chaves` é exclusivo da diretoria.
- **Menu lateral:** Fluxo de Caixa só para a diretoria; Equipe, Integrações e Auditoria para gestores.

### 3.8 Integrações e webhooks (INT-01 a 07, INT-11)
- **Chave obrigatória** em todas as rotas de entrada: `x-api-key`, `Authorization: Bearer` ou `?token=`. Em produção, se a variável não estiver configurada, a rota responde 503.
- **Lead sem telefone e sem e-mail** → 400. Antes recebia o placeholder `85988880000` e era fundido com outro lead.
- **Mensagem do cliente** (OLX, portais, landing, API) passa a ser gravada na timeline.
- **Origem da API customizada** gravada como `API_EXTERNA`.
- **Meta:**
  - HMAC obrigatório sempre que `META_APP_SECRET` existe.
  - Dados do lead buscados na Graph API (`META_PAGE_ACCESS_TOKEN`); sem o token, o lead entra como "contato pendente", com nota na timeline.
  - O handshake não aceita mais o token antigo.
- **Cron:** segredo obrigatório; a fila noturna é liberada no expediente da organização, no fuso de Fortaleza.
- **Deduplicação:** usa só os critérios disponíveis (telefone e/ou e-mail).
- **Score inicial** calculado na ingestão.

---

## 4. Validações executadas

### 4.1 Estáticas
| Verificação | Comando | Resultado |
|---|---|---|
| Tipos | `npx tsc --noEmit -p .` | 0 erros |
| Build de produção | `npm run build` (cópia isolada, para não derrubar o `next dev`) | exit 0, sem avisos |
| Limite de linhas | `wc -l` em `app/`, `components/`, `lib/` | 0 arquivos acima de 400 linhas |
| Resíduos de mock e segredos | `grep` por `user-robson-1`, `org-platz-1`, `35396000`, `85999990000`, `85988880000`, `5585999990001`, `Bearer ${token}`, segredo JWT antigo | nenhuma ocorrência funcional |
| Schema | `prisma db push` + `prisma generate` | em sincronia |

### 4.2 Reteste de API (servidor `next dev` reiniciado, porta 3002)

| ID | Esperado | Obtido |
|---|---|---|
| TC01 login admin | 200, sem token no corpo | 200, token ausente, cookie presente |
| TC01 login inválido | 401 | 401 |
| TC02 `/me` corretor | 200 CORRETOR | 200 CORRETOR |
| TC03 `/crm/{fluxo-de-caixa, equipes, integracoes, auditoria}` (corretor) | 307 → `/crm/leads?denied=true` | 307 nos 4 |
| Sem login: leads, financeiro, ranking, dashboard, vendas, agenda, auditoria, notificações, relatórios, metas | 401 | 401 nos 10 |
| P0-1 cookie + `Bearer cookie-session` | 200 com dados reais | 200, leads reais |
| TC04 check-in (como o navegador envia) | 200 | 200 |
| P0-3 JWT forjado com o segredo antigo (página / API) | 307 `/login` / 401 | 307 `/login` / 401 |
| TC05 criar lead | 201 + score | 201, score 30 (FRIO), renda gravada |
| TC07 PATCH de etapa | 200 | 200, score recalculado para 45 |
| P0-6 corretor altera lead de outro | 403/404 | 403 |
| TC21 DELETE de lead | 200 | 200 |
| TC06 roleta com 3 leads | A, B, A | Lucas, Mariana, Lucas |
| INT01 handshake / token antigo | 200 / 403 | 200 / 403 |
| INT01 POST sem assinatura / assinado | 401 / 200 | 401 / 200 |
| INT02 Google com chave / sem chave | 200 / 401 | 200 / 401 |
| INT03 OLX com chave / sem chave | 200 / 401 | 200 / 401 |
| INT04 Chaves na Mão · INT05 Dream Casa | 200 | 200 · 200 |
| Lead sem telefone e sem e-mail | 400 | 400 |
| INT06 landing JSON / FormData | 200 | 200 / 200 |
| INT07 custom sem chave / com chave | 401 / 200 | 401 / 200 |
| INT08 CEP válido / inválido / inexistente | 200 / 400 / 404 | 200 (Avenida Dom Luís, ViaCEP) / 400 / 404 |
| INT09 `POST /api/location/property` | 200 com Waze `ll=` | 200, `waze.com/ul?ll=-3.7258,-38.4982&navigate=yes` |
| INT10 CNPJ válido / inválido | 200 / 400 | 200 / 400 |
| INT11 cron com segredo / sem segredo | 200 / 401 | 200 / 401 |
| P0-4 upload sem login / path traversal / HTML disfarçado | 401 / 400 / 400-415 | 401 / 400 / 415 |
| TC13 upload de PDF | 201 | 201 |
| P0-5 criar imóvel sem login / site-settings sem login / imóvel por corretor | 401 / 401 / 403 | 401 / 401 / 403 |
| TC11 criar imóvel | 201 com construtora, CEP e lat | 201: construtora, CEP 60160230, lat -3.7326, suítes 0 respeitado |
| TC13 material POST / GET (corretor) / DELETE | 201 / 200 / 200 e arquivo apagado | 201 / 200 / 200, arquivo removido |
| TC17 lançamento POST / confirmar / excluir / corretor | 201 / 200 / 200 / 403 | 201 / 200 (centro de custo e observação gravados) / 200 / 403 |
| TC15 agenda: VISITA, LEMBRETE, DOCUMENTACAO, RETORNO, PROPOSTA | 201 | 201 nos 5 |
| TC19 dashboard | 200, sem números fixos | 200, `35396000` ausente |
| P0-6 dashboard do corretor | sem caixa da empresa | `cashFlow: null` |
| TC19 relatórios · TC18 ranking · TC18 metas | 200 | 200 · 200 (com `podium`) · 200 |
| TC20 perfil / organização / SLA (corretor) · score (admin) | 200 / 403 / 403 · 200 | 200 / 403 / 403 · 200 |
| TC21 auditoria | 200 com logs reais, sem IP falso | 200, 25 registros, IP `177.18.240.12` ausente |

### 4.3 Venda com split (TC-FUNC-16), conferida no banco
- **Entrada:** VGV R$ 500.000, comissão de 5%, imposto de 6%, Corretor 1 com 50% e Corretor 2 com 50%.
- **Gravado:**
  - Venda `CP-2026-001`, status `ativa`, comissão total R$ 25.000.
  - Splits: `CORRETOR_TITULAR` R$ 11.750 e `CO_CORRETOR` R$ 11.750 (base líquida R$ 23.500).
  - Fluxo de Caixa: RECEITA de R$ 25.000 e 2 despesas "Split Comissão" de R$ 11.750.
- **Divisão de 60% + 50%:** recusada com 400 ("A soma dos participantes excede a comissão líquida em R$ 2.350,00").

---

## 5. Pendências e limitações
- **Ranking:** não existe aba "Ranking Equipes"; seria preciso criar um model de Equipe no schema.
- **Metas:** não têm o campo "Público Alvo".
- **Meta Ads:** precisa de `META_APP_SECRET` real e de `META_PAGE_ACCESS_TOKEN` para trazer nome e telefone do lead.
- **Testes visuais:** responsividade em 375 px, animações e drag & drop no navegador não foram executados.
- **Visibilidade do ranking:** usuários autenticados veem o ranking da organização com o VGV dos colegas, por decisão de gamificação. Se isso não for desejado, o ajuste fica em `app/api/ranking/route.ts`.
- **Commit:** as alterações ainda não foram commitadas.

## 6. Limpeza autorizada (executada após este relatório)
- **Arquivo removido:** `components/crm/properties/sampleProperties.ts` (imóveis fictícios, sem uso). O `tsc` continua com 0 erros depois da remoção.
- **Banco de desenvolvimento,** em uma única transação: 26 leads de teste e 45 registros de timeline; a venda `CP-2026-001` com 2 splits e 3 lançamentos de caixa; o imóvel "QA Residencial Teste".
  - **Estado final:** 0 leads, 0 vendas, 0 lançamentos, 8 imóveis (os do seed foram preservados).
- **Arquivo de teste removido:** `public/uploads/materials/1792680546046_qa_tabela.pdf`. Os PDFs dos retestes já tinham sido apagados pelo DELETE de materiais.
- **Mantidos de propósito:**
  - Os registros de `audit_logs`, que são a trilha de auditoria das validações.
  - Os check-ins de hoje do Lucas e da Mariana.
