# Relatório de Execução — Plano de Testes Connect Platz CRM

**Data:** 22/10/2026 · **Ambiente:** local (`next dev` 14.2.35 na porta 3002, PostgreSQL 16 em Docker na porta 5434) · **Branch:** `main`, com alterações não commitadas em Empreendimentos
**Método:** chamadas HTTP reais (`curl`) ao servidor de desenvolvimento, consultas diretas ao banco e leitura do código-fonte.
**Limite da execução:** não há navegador automatizado neste ambiente. Por isso, os testes visuais (arrastar card, animações, viewport de 375px, alternância de tema) não foram feitos na tela. Esses itens foram avaliados pelo código e estão marcados como "por código".

---

## 1. Resumo executivo

| Parte | 🟢 PASS | 🟡 PARCIAL | 🔴 FAIL | Total |
|---|---|---|---|---|
| Parte 1: Funções (TC-FUNC-01 a 21) | 5 | 7 | 9 | 21 |
| Parte 2: Integrações (INT-01 a 11) | 7 | 3 | 1 | 11 |
| Parte 3: Conformidade visual | 4 | 2 | 0 | 6 |
| **Total** | **16** | **12** | **10** | **38** |

**Veredito: não homologável no estado atual.** O backend de integrações (webhooks, roleta, CEP, CNPJ) funciona bem. Já a interface do CRM, na prática:
- não grava a maior parte das ações do usuário;
- mostra dados de exemplo como se fossem reais;
- tem falhas de segurança graves, várias delas comprovadas nesta execução.

### Bloqueadores P0 (corrigir antes de qualquer homologação)

| # | Problema | Evidência |
|---|---|---|
| P0-1 | **O front envia `Authorization: Bearer cookie-session` e a API usa esse cabeçalho no lugar do cookie.** Efeitos: o Kanban recebe **7 leads de exemplo** (Ana Paula Silva…) em vez dos reais; arrastar (`PATCH`), criar lead (`POST`), check-in e troca de status retornam **401** ou erro. | `components/crm/CrmContext.tsx:158` (`setToken("cookie-session")`); `app/api/leads/[id]/route.ts:10`, `app/api/leads/route.ts:27`, `app/api/auth/checkin/route.ts:9`, `app/api/auth/status/route.ts:20`. Teste: cookie de admin + esse cabeçalho → `PATCH` 401, `checkin` 401 |
| P0-2 | **Token ausente ou inválido vira ADMINISTRADOR.** `getSessionContext` devolve `role: "ADMINISTRADOR"` e as rotas respondem 200 com dados de exemplo, sem login nenhum. | `app/api/leads/route.ts:29-35`, `app/api/financeiro/route.ts:14-20`, `app/api/ranking/route.ts:13-19`. `curl /api/financeiro` sem cookie → 200 |
| P0-3 | **`JWT_SECRET` do `.env` é o valor padrão escrito no código.** Com ele, forjei um token de ADMINISTRADOR que abriu `/crm/fluxo-de-caixa` (200) e `/api/auditoria` (200). | `middleware.ts:4-6`, `docker-compose.yml:39` |
| P0-4 | **`/api/upload` não exige login e grava qualquer arquivo.** Três problemas comprovados: (a) **path traversal**: `folder=../../.qa-traversal-proof` gravou fora de `public/` (arquivo removido depois); (b) `.html` enviado como `image/png` é servido como `text/html` no mesmo domínio (XSS armazenado); (c) SVG com `<script>` é aceito. Também não há limite de 25 MB no servidor. | `app/api/upload/route.ts:16-75` |
| P0-5 | **Empreendimentos e site público podem ser alterados sem login.** `POST /api/properties` criou imóvel sem cookie (201). `PATCH`/`DELETE /api/properties/[id]` e `POST /api/site-settings` também não verificam sessão. O `DELETE` responde sucesso até quando falha. | `app/api/properties/route.ts:198`, `app/api/properties/[id]/route.ts:81-97`, `app/api/site-settings/route.ts:77` |
| P0-6 | **Falhas de controle de acesso entre usuários (IDOR/RBAC):** (a) a corretora Mariana alterou a etapa de um lead do Lucas (200), embora o GET do mesmo lead retorne 403; (b) `PATCH /api/agenda` altera qualquer compromisso só pelo id; (c) `GET /api/vendas` não filtra por corretor; (d) `/api/dashboard` entrega VGV, comissões e caixa da empresa ao corretor. | `app/api/leads/[id]/route.ts:84-160`, `app/api/agenda/route.ts:99-105`, `app/api/vendas/route.ts:67-68`, `app/api/dashboard/route.ts` |
| P0-7 | **Ações da interface que não são gravadas no banco:** novo lançamento no Fluxo de Caixa (a API não tem `POST`: 405); Agenda (só "Visita" grava, os outros tipos dão 500 por falta no enum); Nova Venda (400 no split da imobiliária, ignorado pela UI); baixa de comissão; Configurações (só exibe toast); materiais do imóvel (localStorage); excluir lead, mover para bolsão, etiquetas e assumir lead do bolsão (estado local). Em todos os casos aparece um toast de sucesso. | detalhes nas seções 3 e 4 |
| P0-8 | **Dados fictícios exibidos como reais** sempre que o banco está vazio: Dashboard (VGV R$ 35.396.000, 82 vendas), Fluxo de Caixa, Ranking (a página nunca lê a API), Relatórios BI (100% constantes), Agenda, Vendas, Auditoria (logs de exemplo com IP falso `177.18.240.12`). | `app/api/dashboard/route.ts:38-64`, `app/crm/ranking/page.tsx:161`, `components/crm/relatorios/biData.ts` |
| P0-9 | **Webhook da Meta:** a assinatura HMAC é **dispensada quando o cabeçalho não vem** (aceitou POST sem assinatura), e o lead é criado com nome e telefone inventados (`Lead Meta #0111`, `85988880111`), porque não consulta a Graph API. | `lib/services/meta-webhook.ts:55-58`, `app/api/webhooks/meta/route.ts:81-83` |
| P0-10 | **A trilha de auditoria está vazia.** A tabela `audit_logs` tem 0 registros, mesmo após 15 entradas de webhook e alterações de lead. `logAuditEvent` não faz nada no servidor, e edições e exclusões de lead ou venda não chamam a auditoria. | `lib/services/auditLogger.ts:295` |

---

## 2. Pré-requisitos

| Item | Resultado |
|---|---|
| Container `connect_platz_db` | 🟢 Ativo e saudável (`127.0.0.1:5434->5432`) |
| Variáveis `.env` | 🟡 `DATABASE_URL`, `JWT_SECRET` e `META_VERIFY_TOKEN` estão presentes, mas **`JWT_SECRET` e `META_VERIFY_TOKEN` são idênticos aos padrões do código**. Ausentes: `GOOGLE_ADS_WEBHOOK_KEY`, `CRON_SECRET`, `CONNECT_PLATZ_API_KEY` (em produção valeriam os padrões públicos) |
| `npm run build` | 🟢 Exit 0 em 1min35s, 51 rotas. Rodado numa cópia isolada para não derrubar o `next dev` |
| `/api/health` | 🟢 200 `healthy`, banco conectado (2 ms) |
| Credenciais do plano | 🔴 `admin@connectplatz.com.br / senha_administrador` não existe (401). Usado o seed `robson@connectplatz.com.br / ConnectPlatz2026@`. **Atualizar o plano** |

---

## 3. Parte 1: Funções do sistema

### Módulo 1: Autenticação e RBAC

| ID | Status | Tempo | Resultado / inconformidades |
|---|---|---|---|
| TC-FUNC-01 | 🟢 PASS | 321 ms | 200, cookie `connect_platz_token` com HttpOnly e SameSite=Lax; senha errada → 401. **Ressalvas:** (1) o JWT também volta no corpo JSON, o que anula a proteção HttpOnly; (2) se o banco cair, o login aceita **qualquer e-mail e senha** e emite token de ADMINISTRADOR ("modo demonstração"), em `app/api/auth/login/route.ts:69-104` |
| TC-FUNC-02 | 🟢 PASS | 1.16 s | `/api/auth/me` → `role: "CORRETOR"` e `hasCheckedInToday` |
| TC-FUNC-03 | 🟢 PASS | 15–25 ms | As 4 rotas → 307 para `/crm/leads?denied=true`. As APIs financeiro, equipes e auditoria → 403 para corretor via cookie. **Mas:** `/crm/vendas` e `/crm/relatorios` ficam abertas ao corretor, e a API do dashboard vaza dados financeiros (P0-6) |
| TC-FUNC-04 | 🟡 PARCIAL | 856 ms | Via `curl`: 200 e check-in gravado (upsert idempotente). **Pela interface falha (401)**: o botão envia `Bearer cookie-session` (P0-1) |

### Módulo 2: Leads e Kanban

| ID | Status | Resultado / inconformidades |
|---|---|---|
| TC-FUNC-05 | 🟡 PARCIAL | 201 e lead na etapa "Novo Lead". **Inconformidades:**<br>• Não existe score: o modelo `Lead` não tem campo `score` e a `temperatura` é sempre `MORNO`.<br>• Os campos `renda`, `origem`, `etapaId`, `corretorId` e `observacoes` do payload do plano são ignorados (a API espera `rendaDeclarada`).<br>• Pela interface, o POST falha (P0-1), e o lead fica com id local `lead-<timestamp>` que nunca é sincronizado. |
| TC-FUNC-06 | 🟢 PASS | Com Lucas e Mariana em check-in: Lead 1 → Lucas, Lead 2 → Mariana, Lead 3 → Lucas. Transação `Serializable`. **Observação:** o expediente usa o fuso de Fortaleza, mas o cron libera a fila noturna por `getHours()` do servidor (`app/api/cron/sla/route.ts:31`); num container em UTC, isso roda com 3 h de diferença. |
| TC-FUNC-07 | 🔴 FAIL | A API funciona (`PATCH` → 200, persistido). **Pela interface:**<br>• O Kanban carrega leads de exemplo.<br>• O `PATCH` volta 401 e o erro é engolido (`useLeadsActions.ts:52-65`).<br>• O toast "Lead atualizado com sucesso!" aparece **antes** e **independente** da resposta (`KanbanBoard.tsx:61`).<br>• Depois do F5, o card volta ao lugar.<br>O efeito visual de arrasto existe (`border-connect-blue shadow-2xl scale-[1.02] rotate-1`) e há card fantasma na origem. |
| TC-FUNC-08 | 🔴 FAIL | Não há cálculo determinístico de score (renda, tempo de resposta). O valor é fixo por temperatura: 85, 60 ou 38 (`LeadCard.tsx:88`, `app/crm/leads/page.tsx:62`). Ainda:<br>• As regras da aba "Calibração de Score" vão para o localStorage e **não são usadas** em nenhum cálculo.<br>• O corte para "Quente" é 70 (`ScoreBadge.tsx:25`); o plano diz > 75.<br>• Emojis e cores conferem: 🧊 ☕ 🔥. |
| TC-FUNC-09 | 🟡 PARCIAL | `SlaBadge` tem `animate-pulse` em atraso e em menos de 15 min. **Porém:**<br>• Não aparece no card do Kanban, só na tabela, no drawer e nos leads quentes.<br>• O cálculo usa `slaDueAt`, não "sem primeiro contato há mais de 15 min".<br>• As cores são fixas de dark mode (`bg-emerald-950`, `bg-red-950`). |
| TC-FUNC-10 | 🟡 PARCIAL | O card higieniza o número (`replace(/\D/g,"")`) e gera `https://wa.me/55<num>`, mas:<br>• Não tem `?text=`.<br>• Telefone salvo em E.164 (`+5585…` → `5585977776666`, testado via Google Ads) gera `wa.me/555585…`, um link quebrado.<br>• `HotLeadsPanel.tsx:90` usa o telefone sem higienizar.<br>• Os leads quentes do dashboard (`HotLeadsRankedList.tsx`) são uma lista fixa. |

### Módulo 3: Empreendimentos

| ID | Status | Resultado / inconformidades |
|---|---|---|
| TC-FUNC-11 | 🟡 PARCIAL | Salvo sem matriz de unidades (201, 0 unidades) e com as características gravadas. **Perdas:**<br>• `construtora` é enviada mas a API descarta; não há coluna no schema.<br>• O CEP só preenche o formulário e não é gravado; também não há lat/lng.<br>• Valor 0 em suítes ou vagas vira 2 (`Number(x) || 2`).<br>• A API não exige login (P0-5).<br>• O modal é fixo em tema escuro (`bg-[#0A0E17]`) e não usa Radix Dialog. |
| TC-FUNC-12 | 🟢 PASS | Abre in-page (`onOpenDetails`), com preço, pílula de estágio, quartos/vagas/área e os 4 botões. "Tour Virtual" não aparece em nenhum ponto do código. **Ressalvas:** "Copiar Ficha" copia um link genérico (`/#imoveis`), não o do imóvel; o modal é fixo em tema escuro. |
| TC-FUNC-13 | 🔴 FAIL | O arquivo é gravado em `public/uploads/materials/` (201, `formattedSize` ok). **Porém:**<br>• A lista de materiais fica só no localStorage do navegador e não é compartilhada.<br>• A lista vem com 4 materiais fictícios em `materiais.connectplatz.com.br`, domínio que não resolve.<br>• Excluir não apaga o arquivo do disco.<br>• Não há limite de 25 MB no servidor.<br>• A rota tem as falhas de segurança do P0-4. |
| TC-FUNC-14 | 🟡 PARCIAL | O Waze abre `waze.com/ul?q=<endereço>&navigate=yes` (não `ll=`, porque o imóvel não guarda coordenadas). O Google Maps usa `/maps/dir/?api=1&destination=` (aceitável). As coordenadas da BrasilAPI são o **centróide do município** (os dois CEPs testados deram `-3.71722,-38.54306`): rotas por coordenada levariam ao centro de Fortaleza. |

### Módulos 4 a 9 (auditoria por código + `curl`)

| ID | Status | Resultado / inconformidades |
|---|---|---|
| TC-FUNC-15 Agenda | 🔴 FAIL | **Só "Visita" grava.** O enum `AppointmentType` (`prisma/schema.prisma:120-129`) não tem LEMBRETE, DOCUMENTACAO, RETORNO nem PROPOSTA, que são as opções do modal (`NewAppointmentModal.tsx:16-20`); o resultado é 500. Além disso:<br>• A UI não verifica `res.ok` (`app/crm/agenda/page.tsx:120-129`).<br>• "Cliente" é texto livre e o envio leva `lead: {id:"temp"}`, então `leadId` fica nulo.<br>• "Hoje" está fixo em `new Date(2026, 9, 1)`.<br>• As três visões (dia, semana, mês) existem e as cores da borda de 3px estão certas, mas no **dark mode a cor se perde**: `dark:border-[#1C2537]` tem especificidade maior (`AgendaDayView.tsx:69`, `AppointmentCard.tsx:27`). |
| TC-FUNC-16 Vendas | 🔴 FAIL | O cálculo é determinístico (`saleSplitHelper.ts`). Com VGV 500k, 5% e 50/50: bruta 25.000, imposto de 6% 1.500, base 23.500, C1 = C2 = 11.750. Mas Gerente, Gestor e Captador entram com 10% cada por padrão (2.350 cada): total de **30.550 > 25.000**. A imobiliária fica com **R$ 0** e não há aviso de super-alocação. Consequências:<br>• Com `valor: 0`, a API rejeita (`z.number().positive()`, `app/api/vendas/route.ts:41`) com **400**, e a UI ignora (`page.tsx:227-233`).<br>• Em erro de banco, a API responde 201 com id falso.<br>• Todos os splits são gravados como `IMOBILIARIA`, e `corretorId` recebe o usuário logado, não o corretor escolhido.<br>• Não há parâmetro de "taxa da imobiliária".<br>• Os sinais estão corretos (sem `++`, `%%`), mas as tendências são fixas no código. |
| TC-FUNC-17 Fluxo/DRE | 🔴 FAIL | `POST /api/financeiro` → **405**: lançar, confirmar e estornar ficam só no estado React. O gráfico `CashFlowProjection` é estático e não recebe dados. KPIs com valores de reserva inventados (`saldoAtual \|\| 163950`). O bloqueio do corretor funciona (página e API 403). Há `TrendBadge value="+4.2%" isPositive={false}`, que exibe "-4.2%" (`page.tsx:189`). Há um `return` antes de `useState` (`page.tsx:39-46`), que viola as regras de hooks. |
| TC-FUNC-18 Ranking | 🔴 FAIL | A página lê `data.ranking`, mas a API devolve `podium`/`fullRanking`, então **sempre mostra mocks** (`app/crm/ranking/page.tsx:161`). Além disso:<br>• A API não ordena o pódio.<br>• Ela filtra vendas `status:"ativa"`, enquanto o POST de vendas grava `"APROVADA"`.<br>• `AnimatedCrown` só aparece no card "Corretor do Mês", para o corretor escolhido no select (não necessariamente o líder). Não há pódio 1º/2º/3º animado.<br>• O progresso da meta é digitado pelo admin e salvo no localStorage. |
| TC-FUNC-19 Count-Up/BI | 🔴 FAIL | **Não existe filtro de período**: `PageHeader` recebe `showPeriodSelector` mas nunca o renderiza. Outros problemas:<br>• `CountUpNumber` sempre parte de 0 (`const startValue = 0`, linha 26) e não cancela o `requestAnimationFrame`.<br>• Os gráficos (`MonthlySalesChart`, `SalesFunnelBarChart`) são arrays fixos.<br>• `/crm/relatorios` não faz nenhuma chamada de API.<br>• O badge `↗ +18.4%` é fixo (`OperationalAndLeadCards.tsx:91`). |
| TC-FUNC-20 Configurações | 🟡 PARCIAL | A ocultação das abas corporativas para corretor está correta (`configuracoes/page.tsx:21-37`). Porém:<br>• **Nada é salvo**: Perfil, Geral e SLA só exibem toast.<br>• O perfil mostra telefone, bio e CRECI de reserva fixos.<br>• GERENTE vê o mesmo que o corretor. |
| TC-FUNC-21 Auditoria | 🔴 FAIL | Alterei um lead via `PATCH` e mesmo assim `audit_logs` tem 0 registros. Problemas:<br>• Leads e vendas não chamam a auditoria.<br>• `logAuditEvent` não faz nada no servidor, por isso os webhooks não registram.<br>• A tela mostra logs mock com IP falso.<br>• A API de leads não tem `DELETE`: "Excluir" só remove da tela. |

---

## 4. Parte 2: Integrações

| ID | Status | Tempo | Resultado / inconformidades |
|---|---|---|---|
| INT-01 Meta Ads | 🟡 PARCIAL | 5–197 ms | Handshake válido → 200 `CHALLENGE_CODE_123`; token falso → 403; POST → 200 em 34 ms e lead na roleta. **Mas:** assinatura dispensada sem cabeçalho, e lead com nome e telefone fictícios (P0-9). `/meta` e `/meta-ads` são aliases corretos. |
| INT-02 Google Ads | 🟢 PASS | 25–231 ms | GET `online`; POST oficial → 200 e atribuído ao corretor da vez. **Ressalvas:** `google_key` é opcional (sem a chave → aceito); telefone ausente vira `85999990000`; número E.164 gera link do WhatsApp quebrado (TC-10). |
| INT-03 Grupo OLX | 🟢 PASS | 91 ms | `{success:true, leadId}`, origem `PORTAL_IMOBILIARIO`, ref. do imóvel salva. **Ressalva:** o campo `mensagem` é descartado e não chega ao lead nem à timeline. |
| INT-04 Chaves na Mão | 🟢 PASS | 87 ms | 200, `PORTAL_IMOBILIARIO`. |
| INT-05 Dream Casa | 🟢 PASS | 91 ms | 200 e funil padrão. A deduplicação funciona: o reenvio devolve o mesmo id com "Lead já existente". |
| INT-06 Landing Page | 🟢 PASS | 38–100 ms | JSON → campanha "Lançamento Porto Platz" vinculada; multipart do Elementor → 200. |
| INT-07 Custom API | 🟢 PASS | 91 ms | 200. **Ressalvas:** o token só é validado em produção **e só quando é enviado**: sem cabeçalho, sempre aceita. O padrão no código é `connect_platz_custom_api_token`, diferente do plano. A origem é gravada como `MANUAL_CORRETOR`. |
| INT-08 CEP | 🟡 PARCIAL | 13 ms – 2.9 s | Válido → 200 com `s-maxage=86400`. O logradouro retornado foi "Avenida Dom Luís", **que é o dado correto do CEP 60160-230** (corrigir a expectativa do plano). As coordenadas são do município. Formato inválido → 400 ✓. **`99999999` → 200** (a BrasilAPI/open-cep devolve "Sarandi-PR"; o ViaCEP diz `erro`), quando o esperado era 404. |
| INT-09 Rotas | 🔴 FAIL | 68 ms | `POST /api/location/property` → **405**: só existe GET (por `cep`/`bairro`/`slug`, com padrão Meireles e pontos de interesse fixos). |
| INT-10 CNPJ | 🟢 PASS | 8–822 ms | Petrobras → razão social, situação ATIVA, CNAE e endereço; `11111111111111` → 400 pelo Módulo 11, sem chamada externa. |
| INT-11 Cron SLA | 🟡 PARCIAL | 13–126 ms | Com token → 200 e relatório. Sem token → 200 em dev (o bloqueio só existe em produção, conforme o código). **Mas** `CRON_SECRET` não está no `.env`, então em produção vale o segredo público `connect_platz_cron_secret_2026`. Também há o problema de fuso (TC-06). |

**Risco transversal dos webhooks:** OLX, Chaves na Mão, Dream Casa e Landing Page **não têm autenticação**. Leads sem telefone recebem o placeholder `85988880000`, e com isso **o segundo lead sem telefone é descartado como duplicado do primeiro** (testado: "QA SemFone B" foi fundido com "QA SemFone A"), o que é perda silenciosa de lead.

---

## 5. Parte 3: Conformidade visual

| Item | Status | Resultado |
|---|---|---|
| Sem sinais repetidos | 🟢 PASS | `TrendBadge` remove `+`/`-`/setas no início e sufixo duplicado. Nenhum `++`, `--` ou `%%` literal encontrado. (Ver o caso "+4.2%" que vira "-4.2%" no TC-17.) |
| Sem setas duplicadas | 🟢 PASS | `TrendBadge` mostra ícone **ou** seta, nunca os dois. As setas soltas (`DreCostCenterBreakdown.tsx:58-59`, `OperationalAndLeadCards.tsx:91`) aparecem sem ícone Lucide. |
| Limite de linhas | 🟢 PASS | 0 arquivos acima de 400 linhas. Na faixa de alerta (351–400): `app/crm/leads/page.tsx` (378), `ScoreCalibrationTab.tsx` (372), `LeadAbordagemSection.tsx` (360), `NewEmpreendimentoModal.tsx` (358), `CrmContext.tsx` (356), `NewSaleModal.tsx` (355), `app/crm/vendas/page.tsx` (353), `NewLeadModal.tsx` (352). |
| Responsividade mobile | 🟡 PARCIAL (por código) | Há drawer com overlay `md:hidden`, `MobileBottomBar` e Kanban com `overflow-x-auto snap-x`. **A validação visual em 375px não foi feita.** |
| PWA | 🟢 PASS | `manifest.json` (standalone, `start_url /crm`, theme `#1266C7`, ícones 192/512 válidos), `sw.js` 200 e meta tags iOS/Android presentes. Detalhe menor: `purpose: "any maskable"` combinado é desaconselhado. |
| Tema dark/light | 🟡 PARCIAL | `darkMode: ["class"]` funciona, mas há componentes **fixos em tema escuro**, sem nenhuma variante `dark:`: `NewImovelAvulsoModal`, `NewEmpreendimentoModal`, `PropertyDetailsModal`, `LeadFinancingConveyor`, `SaleCard`, `EmpreendimentosList`, `LeadTimelineTab`, além do `SlaBadge`. No light mode eles aparecem como blocos escuros. A cor do tipo na Agenda se perde no dark mode (TC-15). |

---

## 6. Recomendações (ordem sugerida)

1. **P0-1:** no `CrmContext`, não enviar `Bearer cookie-session`. Melhor ainda, remover o cabeçalho `Authorization` do front e fazer todas as APIs lerem o **cookie primeiro**. Esta correção sozinha destrava o módulo de Leads, o check-in e o status.
2. **P0-2/P0-3:** eliminar o fallback para ADMINISTRADOR e os dados de exemplo nas APIs (responder 401). Gerar um `JWT_SECRET` forte e **falhar na inicialização** se ele não existir ou for o padrão. Fazer o mesmo para `CRON_SECRET`, `META_APP_SECRET`, `CONNECT_PLATZ_API_KEY` e `GOOGLE_ADS_WEBHOOK_KEY`. Remover o "modo demonstração" do login.
3. **P0-4/P0-5:** exigir sessão em `/api/upload`, `/api/properties*` e `/api/site-settings`. No upload: lista fixa de pastas, extensão derivada do MIME validado, bloquear SVG/HTML e limite de 25 MB no servidor.
4. **P0-6:** checar `organizationId` e dono do registro em `PATCH` de leads e de agenda; filtrar vendas e dashboard por corretor.
5. **P0-7/P0-10:** criar a persistência que falta (POST financeiro, enum da agenda, split da venda com validação da soma ≤ 100%, configurações, materiais, `DELETE` de lead, bolsão, etiquetas). Fazer a UI tratar `res.ok` e só exibir o toast depois do sucesso. Gravar a auditoria no servidor.
6. **P0-8/P0-9:** remover os mocks das telas (usar estado vazio com skeleton ou empty state). Na Meta: exigir assinatura sempre e buscar o lead na Graph API.
7. Implementar o score determinístico, o filtro de período, o Count-Up a partir do valor anterior, as coordenadas reais do imóvel, o `POST /api/location/property` e as correções de fuso e de tema.
8. Atualizar o próprio plano: credenciais, logradouro esperado do CEP e se o INT-09 deve ser POST ou GET.

---

## 7. Dados criados durante os testes (banco de desenvolvimento)

Os registros abaixo foram criados por esta execução e permanecem no banco. O banco não tinha leads antes dos testes.
- **Leads (15):** "Carlos Eduardo Cavalcante [QA]", "QA Roleta 1/2/3", "Lead Meta #0111", "Mariana Barreto Ribeiro", "QA Google SemChave", "QA Google E164", "Roberto Farias Filho", "Juliana Vasconcelos", "Fernando Nogueira", "Patrícia Dantas", "Lucas Bezerra", "Amanda Silveira", "QA SemFone A" (com timelines). Um lead da roleta foi movido para "Visita Agendada" pelo teste de IDOR.
- **Imóvel:** "QA Residencial Teste" (`exibirNaLandingPage=false`).
- **Check-ins de hoje:** Lucas Santos e Mariana Oliveira; `lastLeadAssignedAt` atualizado.
- **Arquivo:** `public/uploads/materials/1792680546046_qa_tabela.pdf`. Os arquivos de prova de XSS e de path traversal **já foram removidos**.

---

## 8. Correções aplicadas e reteste (22/10/2026, tarde)

**Verificação:**
- `npx tsc --noEmit`: 0 erros.
- `npm run build`: exit 0, executado numa cópia isolada.
- Nenhum arquivo acima de 400 linhas.
- `next dev` reiniciado com `.next` limpo.
- Reteste de API (script `rerun.sh`): **82 de 82 verificações conforme o esperado.**

| Bloqueador | Situação após correção | Evidência do reteste |
|---|---|---|
| P0-1 Bearer "cookie-session" | O front não envia mais o cabeçalho; as APIs leem o cookie primeiro (`lib/auth/session.ts`) | cookie + Bearer falso → 200 com leads reais; check-in → 200 |
| P0-2 Fallback para ADMINISTRADOR | Removido em todas as rotas; sem sessão → 401 | 10 APIs sem login → 401 |
| P0-3 JWT padrão | Segredo novo e aleatório no `.env`; `lib/auth/secret.ts` recusa segredo ausente ou padrão; `docker-compose` exige a variável | Token forjado → 307 `/login` (página) e 401 (API) |
| P0-4 Upload | Exige sessão, aceita só pastas da lista fixa, valida o tipo pelos magic bytes, recusa SVG/HTML, limite de 25 MB | Sem login 401; traversal 400; HTML disfarçado 415 |
| P0-5 Imóveis/site sem login | Escrita só para gestores | 401 sem login; 403 para corretor |
| P0-6 IDOR/RBAC | Checagem de dono em leads e agenda; vendas e dashboard filtrados por perfil | Corretor alterando lead de outro → 403; dashboard do corretor com `cashFlow: null` |
| P0-7 Persistência | Fluxo de Caixa (POST/PATCH/DELETE), Agenda (5 tipos), Vendas e splits, Configurações, Materiais, Leads (excluir, bolsão, etiquetas, timeline) | Agenda 5/5 → 201; venda 500k/5%/50-50 → C1 = C2 = R$ 11.750, gravada; excesso de split → 400 |
| P0-8 Dados fictícios | Mocks removidos de Dashboard, Ranking, BI, Agenda, Vendas, Fluxo, Auditoria, notificações e portal; botão "Simular Lead" removido | Dashboard sem `35396000`; auditoria sem IP `177.18.240.12` |
| P0-9 Meta | HMAC obrigatório; dados do lead via Graph API (`META_PAGE_ACCESS_TOKEN`); sem token, o lead entra como "contato pendente" | POST sem assinatura → 401; assinado → 200 |
| P0-10 Auditoria | `recordAudit` no servidor grava em `audit_logs` (com IP e usuário) | 25 registros reais após o reteste |

**Demais itens corrigidos:**
- Score determinístico calibrável (75/40).
- `SlaBadge` no card do Kanban.
- WhatsApp via `buildWhatsAppUrl`, com `?text=` e sem DDI duplicado.
- CEP pelo ViaCEP primeiro: o `99999999` agora dá 404.
- Coordenadas pelo Nominatim, com Waze em `ll=`.
- `POST /api/location/property` criado.
- Webhooks exigem chave e gravam a mensagem do cliente.
- Lead sem telefone/e-mail → 400 (não é mais fundido com outro lead).
- Cron com segredo obrigatório e fuso de Fortaleza; check-in pelo dia de Fortaleza.
- Filtro de período e Count-Up a partir do valor anterior.
- Pódio com `AnimatedCrown` e metas persistidas com progresso real.
- Componentes que só funcionavam no tema escuro convertidos para light/dark.
- O menu lateral respeita o perfil (gerente vê Equipe, Integrações e Auditoria; Fluxo de Caixa só para a diretoria).

**Schema (aditivo, via `prisma db push`):**
- `Lead`: `tags`, `observacoes`, `score`.
- `Organization.settings`, `User.bio`.
- `Property`: `construtora`, `cep`, `latitude`, `longitude`.
- `CashFlow`: `centroCusto`, `observacaoLiquidacao`.
- Enum `AppointmentType` ganhou `LEMBRETE` e `DOCUMENTACAO`; enum `LeadSource` ganhou `API_EXTERNA`.
- Novo model `PropertyMaterial`.

**Limitações conhecidas:**
- **Ranking:** não existe aba "Ranking Equipes", porque não há model de Equipe no schema.
- **Metas:** não têm o campo "Público Alvo".
- **Meta:** precisa de `META_PAGE_ACCESS_TOKEN` e de um `META_APP_SECRET` real para captar os dados do lead.
- **Arquivo pendente:** `components/crm/properties/sampleProperties.ts` não é mais usado, mas a remoção depende de autorização.
- **Testes visuais em navegador:** não foram executados.
