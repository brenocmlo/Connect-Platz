# 📋 Prompt Mestre: Plano de Testes Completo — Connect Platz CRM & ERP

> **Instruções de Uso:** Este documento é um **prompt de execução e auditoria de testes ponta a ponta**. Ele pode ser fornecido diretamente a um agente autônomo, engenheiro de QA ou executado sequencialmente para validar 100% das funções, fluxos de usuário, restrições RBAC, endpoints de API e integrações com terceiros do Connect Platz.

---

## 🎯 Identificação do Sistema & Escopo de Auditoria

- **Sistema:** Connect Platz CRM & ERP Imobiliário
- **Arquitetura:** Next.js 14 (App Router), PostgreSQL com Prisma ORM, Tailwind CSS, Framer Motion, PWA.
- **Identidade Visual:** Inspirado rigorosamente no Habitus CRM (tokens de cor `connect-blue` `#1266C7`, `platz-gold` `#D9BB4C`, DM Sans, micro-interações, Count-Up, cards e modais modulares < 400 linhas).
- **Regras Permanentes Invioláveis:**
  1. ❌ **Sem WhatsApp integrado:** Apenas botões e links diretos `https://wa.me/55...` com telefone sanitizado.
  2. ❌ **Sem Inteligência Artificial externa:** Lógicas, SLA, roleta e scores 100% determinísticos.
  3. ❌ **Sem Tour Virtual:** Totalmente descontinuado e purgado do sistema.
  4. 🔒 **RBAC Rígido:** Corretor não acessa Finanças, Equipes, Integrações, Auditoria ou dados corporativos de Configurações.
  5. 🚫 **Sem duplicidade de sinais:** Proibido `++`, `--`, `%%`, ou ícone visual acompanhado de seta Unicode (`↗`, `↘`).

---

## 🛠️ Pré-Requisitos e Ambiente de Execução

Antes de iniciar os testes, verifique se a infraestrutura local está pronta:

```bash
# 1. Verificar container PostgreSQL ativo (porta 5434 mapeada para 5432 interna)
docker ps --filter "name=connect_platz_db"

# 2. Validar variáveis de ambiente (.env)
grep -E "DATABASE_URL|JWT_SECRET|META_VERIFY_TOKEN|META_APP_SECRET|GOOGLE_ADS_WEBHOOK_KEY|CONNECT_PLATZ_API_KEY|PORTAL_WEBHOOK_KEY|LANDING_PAGE_WEBHOOK_KEY|CRON_SECRET" .env | cut -d= -f1

# 2.1 Carregar as chaves no shell para os testes de integração
set -a; source .env; set +a

# 3. Validar compilação limpa
npm run build

# 4. Servidor ativo em porta local
curl -s http://localhost:3002/api/health || curl -s http://localhost:3000/api/health
```

---

## 📦 PARTE 1: Matriz de Testes de Funções do Sistema (Módulos 1 a 11)

### 🔑 MÓDULO 1: Autenticação, Sessão & Barreira RBAC (Edge Middleware)

#### TC-FUNC-01: Login de Administrador e Emissão de Sessão JWT
- **Objetivo:** Garantir que o login gere cookie HTTP-only `connect_platz_token` com payload válido de `ADMINISTRADOR`.
- **Passos:**
  1. Executar requisição POST para `/api/auth/login` com credenciais de administrador:
  ```bash
  curl -i -X POST http://localhost:3002/api/auth/login \
    -H "Content-Type: application/json" \
    -c cookies_adm.txt \
    -d '{"email":"robson@connectplatz.com.br","password":"ConnectPlatz2026@"}'
  ```
- **Critério de Sucesso:** HTTP 200, cookie `connect_platz_token` (HttpOnly) presente nos headers `Set-Cookie`, **sem token no corpo JSON**, redirecionamento permitido para `/crm`. Requisições às APIs sem cookie retornam 401.

#### TC-FUNC-02: Login de Corretor & Consulta de Sessão
- **Objetivo:** Validar sessão com role `CORRETOR`.
- **Passos:**
  1. Fazer login com usuário corretor.
  2. Consultar o endpoint de validação de sessão:
  ```bash
  curl -i -X GET http://localhost:3002/api/auth/me \
    -H "Cookie: connect_platz_token=<TOKEN_DO_CORRETOR>"
  ```
- **Critério de Sucesso:** HTTP 200 com payload contendo `role: "CORRETOR"` e status de check-in do dia.

#### TC-FUNC-03: Barreira Rígida de RBAC (Rotas Proibidas para Corretor)
- **Objetivo:** Garantir que o Middleware Edge intercepte e bloqueie corretores de acessar áreas administrativas.
- **Passos:**
  1. Com o cookie de `CORRETOR`, tentar acessar via GET:
     - `http://localhost:3002/crm/fluxo-de-caixa`
     - `http://localhost:3002/crm/equipes`
     - `http://localhost:3002/crm/integracoes`
     - `http://localhost:3002/crm/auditoria`
- **Critério de Sucesso:** HTTP 307 (Temporary Redirect) para `/crm/leads?denied=true`. Nenhuma informação financeira ou de equipe deve vazar no HTML.

#### TC-FUNC-04: Check-in de Presença Diária do Corretor (Roleta)
- **Objetivo:** Permitir ao corretor marcar presença diária para entrar na fila da roleta.
- **Passos:**
  ```bash
  curl -i -X POST http://localhost:3002/api/auth/checkin \
    -H "Cookie: connect_platz_token=<TOKEN_DO_CORRETOR>" \
    -H "Content-Type: application/json" \
    -d '{"status":"DISPONIVEL"}'
  ```
- **Critério de Sucesso:** HTTP 200 com registro de check-in no banco e confirmação de inclusão na roleta do dia.

---

### 👥 MÓDULO 2: Leads & Funil Kanban

#### TC-FUNC-05: Criação Manual de Lead
- **Objetivo:** Cadastrar novo lead manualmente através do modal `+ Novo Lead`.
- **Passos:**
  ```bash
  curl -i -X POST http://localhost:3002/api/leads \
    -H "Cookie: connect_platz_token=<TOKEN_ADM>" \
    -H "Content-Type: application/json" \
    -d '{
      "nome": "Carlos Eduardo Cavalcante",
      "telefone": "85991234567",
      "email": "carlos.cavalcante@teste.com",
      "renda": 18500,
      "origem": "ORGANICO",
      "etapaId": "etapa-novo-lead-id",
      "corretorId": "corretor-id",
      "observacoes": "Interesse em apto de 3 quartos na Aldeota"
    }'
  ```
- **Critério de Sucesso:** HTTP 201 com Lead ID gerado, score calculado automaticamente e registro na primeira coluna do Kanban.

#### TC-FUNC-06: Distribuição Determinística por Roleta (Round-Robin)
- **Objetivo:** Verificar distribuição sequencial entre corretores com check-in ativo no dia.
- **Passos:**
  1. Ter 2 corretores com check-in efetuado (Corretor A e Corretor B).
  2. Enviar 3 leads sucessivos sem corretor atribuído.
- **Critério de Sucesso:** Lead 1 atribuído ao Corretor A; Lead 2 ao Corretor B; Lead 3 ao Corretor A (ciclo determinístico respeitado).

#### TC-FUNC-07: Drag & Drop do Kanban e Persistência de Etapas
- **Passos (UI):**
  1. Acessar `/crm/leads`.
  2. Arrastar o card do lead da coluna "Novo Lead" para "Visita Agendada".
- **Critérios de Sucesso:**
  - Card arrastado apresenta elevação e sombra suave (`shadow-xl`, `rotate-1`).
  - Coluna de destino abre espaço visual.
  - Ao soltar: Disparo da requisição `PATCH /api/leads/[id]` atualizando o `etapaId`.
  - Exibição de toast discreto no canto inferior direito: *"Lead atualizado com sucesso!"*.
  - Ao recarregar a página (F5), o card permanece na nova coluna.

#### TC-FUNC-08: Badges de Classificação e Score Determinístico
- **Critérios de Sucesso:**
  - Lead com renda alta + resposta em < 5 min: Badge 🔥 `Lead Quente` (laranja/vermelho translúcido, score > 75).
  - Lead em andamento com follow-up regular: Badge ☕ `Lead Morno` (âmbar translúcido, score entre 40 e 74).
  - Lead sem retorno ou com dados básicos: Badge 🧊 `Lead Frio` (azul translúcido, score < 40).

#### TC-FUNC-09: Pulso Visual de Alerta SLA
- **Critério de Sucesso:** Leads sem primeiro contato há mais de 15 minutos devem apresentar a badge de SLA com animação de pulso contínuo (`animate-pulse` suave) para chamar atenção imediata.

#### TC-FUNC-10: Ação Rápida WhatsApp
- **Critério de Sucesso:** Clicar no botão do WhatsApp no card do lead abre diretamente nova aba com `https://wa.me/5585991234567?text=...`, sem caracteres inválidos (hífens ou parênteses) no número.

---

### 🏢 MÓDULO 3: Empreendimentos & Ficha Comercial

#### TC-FUNC-11: Cadastro Comercial Simplificado
- **Passos (UI):**
  1. Em `/crm/empreendimentos`, clicar em `+ Novo Empreendimento`.
  2. Preencher Nome, Construtora, Estágio (*Lançamento*), Preço Inicial (*R$ 450.000,00*), Tipologias (*Área: 75m²*, *Quartos: 3*, *Suítes: 2*, *Vagas: 2*), Endereço (*CEP 60160-230*).
  3. Clicar em "Salvar Empreendimento".
- **Critério de Sucesso:** Imóvel salvo sem exigir matriz de blocos/unidades manuais; card adicionado ao catálogo com thumbnail e status.

#### TC-FUNC-12: Abertura da Ficha Comercial Completa (PropertyDetailsModal)
- **Passos (UI):**
  1. No card do imóvel, clicar em `👁 Ver Detalhes`.
- **Critérios de Sucesso:**
  - Modal/Drawer abre diretamente na tela sem redirecionar ou abrir nova aba.
  - Exibe preço em destaque, estágio da obra em pílula colorida, especificação de quartos/vagas/área.
  - Exibe botões: *Materiais & Tabela em PDF*, *Falar no WhatsApp*, *Copiar Ficha* e *Waze / Google Maps*.
  - Total ausência de qualquer menção a "Tour Virtual".

#### TC-FUNC-13: Upload Real de Arquivos e Materiais (`/api/upload`)
- **Passos:**
  1. No modal de Materiais do imóvel, clicar em `+ Novo Anexo`.
  2. Selecionar um arquivo PDF ou planilha XLSX de até 25 MB.
  3. Selecionar a categoria: `TABELA`, `BOOK`, `MEMORIAL` ou `PLANTAS`.
  4. Clicar em "Fazer Upload".
- **Critério de Sucesso:** Arquivo gravado fisicamente em `public/uploads/materials/`, listado no modal com tamanho formatado (ex: `2.4 MB`), botão de download funcional e opção de exclusão.

#### TC-FUNC-14: Traçado de Rota GPS (Maptech)
- **Passos:**
  1. Na Ficha Comercial, clicar nos botões de localização:
     - **Waze:** Deve abrir `https://waze.com/ul?ll=<LAT>,<LNG>&navigate=yes`.
     - **Google Maps:** Deve abrir `https://maps.google.com/?q=<ENDERECO_OU_COORDENADAS>`.
- **Critério de Sucesso:** Links abrem com rota pronta para o endereço cadastrado.

---

### 📅 MÓDULO 4: Agenda & Compromissos

#### TC-FUNC-15: Criação e Visualização de Compromissos
- **Passos:**
  1. Em `/crm/agenda`, clicar em `+ Novo Compromisso`.
  2. Selecionar tipo: `Visita`, `Documentação`, `Retorno/Follow-up` ou `Lembrete`.
  3. Vincular a um cliente/lead existente e definir data/hora.
- **Critérios de Sucesso:**
  - Evento cadastrado via `POST /api/agenda`.
  - Visualização nos modos **Dia**, **Semana** e **Mês**.
  - No modo **Dia**: card exibe borda esquerda de 3px na cor correspondente ao tipo (Visita = azul, Documentação = índigo, Retorno = âmbar).

---

### 💰 MÓDULO 5: Vendas, Comissões & Regras Determinísticas

#### TC-FUNC-16: Registro de Venda e Split de Comissão
- **Passos:**
  1. Acessar `/crm/vendas` e clicar em `+ Nova Venda`.
  2. Selecionar Cliente, Empreendimento, VGV total (ex: `R$ 500.000,00`), % de Comissão Bruta (ex: `5%` = `R$ 25.000,00`).
  3. Informar Corretor 1 (ex: `50%` da comissão) e Corretor 2 (ex: `50%`).
  4. Avançar para aba "Resumo e Cálculos".
- **Critérios de Sucesso:**
  - Valores calculados de forma determinística e exibidos instantaneamente.
  - Dedução correta de imposto retido e taxa da imobiliária.
  - Nenhum sinal duplicado nos cards de resumo (`+`, `-`, `%`).

---

### 📊 MÓDULO 6: Fluxo de Caixa & DRE

#### TC-FUNC-17: Lançamentos de Entradas e Saídas
- **Passos:**
  1. Logado como Administrador, acessar `/crm/fluxo-de-caixa`.
  2. Adicionar lançamento de Entrada (recebimento de comissão) e de Saída (despesa operacional).
- **Critérios de Sucesso:**
  - Saldo consolidado e gráfico de fluxo de caixa atualizados em tempo real.
  - Tentativa de acesso com perfil de corretor resulta em bloqueio imediato.

---

### 🏆 MÓDULO 7: Ranking & Gamificação

#### TC-FUNC-18: Pódio Animado e Metas
- **Passos:**
  1. Acessar `/crm/ranking`.
- **Critérios de Sucesso:**
  - Pódio do 1º, 2º e 3º lugar renderiza coroas (`AnimatedCrown`) e brilhos nos avatares.
  - Card "Corretor do Mês" destaca o líder com anel dourado e mini-cards de métricas (VGV, Vendas, Visitas).
  - Barra de progresso do incentivo exibe progresso determinístico (ex: "1 / 3 vendas").

---

### 📈 MÓDULO 8: Relatórios BI & Gráficos

#### TC-FUNC-19: Interpolação Numérica (Count-Up) e Recharts
- **Passos:**
  1. Acessar `/crm` (Dashboard) ou `/crm/relatorios`.
  2. Alternar o filtro de período entre "Hoje", "Mês Atual" e "Ano".
- **Critérios de Sucesso:**
  - Todos os StatCards realizam animação de interpolação numérica (**Count-Up**) do valor anterior até o novo valor.
  - Gráficos Recharts (linhas de VGV e barras horizontais de funil) realizam transição suave sem quebrar a tela.

---

### ⚙️ MÓDULO 9: Configurações & Auditoria

#### TC-FUNC-20: Minha Conta (Corretor) vs Configurações Corporativas (Gestor)
- **Critério de Sucesso:**
  - Perfil **CORRETOR** visualiza estritamente os dados do seu próprio perfil e CRECI.
  - Abas de dados corporativos da imobiliária, parametrização de SLAs e integrações são 100% ocultas para corretores.

#### TC-FUNC-21: Registro de Logs de Auditoria
- **Passos:**
  1. Excluir ou alterar um lead ou venda importante.
  2. Acessar `/crm/auditoria` como administrador.
- **Critério de Sucesso:** Evento registrado com IP do cliente, ID do usuário, data/hora exata e descrição clara da alteração realizada.

---

## 🔌 PARTE 2: Matriz de Testes de Cada Integração (Endpoints & Webhooks)

> **Autenticação dos webhooks:** todas as rotas de entrada exigem a chave da variável de ambiente correspondente, enviada em `x-api-key`, `Authorization: Bearer <chave>` ou `?token=<chave>`. Sem chave ⇒ HTTP 401.

### 🛰️ INT-01: Meta Ads (Facebook & Instagram Lead Ads)

- **Rotas:** `/api/webhooks/meta-ads` e `/api/webhooks/meta`
- **Cenário 1 — Handshake de Verificação (GET):**
  ```bash
  curl -i -X GET "http://localhost:3002/api/webhooks/meta-ads?hub.mode=subscribe&hub.verify_token=$META_VERIFY_TOKEN&hub.challenge=CHALLENGE_CODE_123"
  ```
  - **Esperado:** HTTP 200 com corpo `CHALLENGE_CODE_123`.
- **Cenário 2 — Token Inválido (GET):**
  ```bash
  curl -i -X GET "http://localhost:3002/api/webhooks/meta-ads?hub.mode=subscribe&hub.verify_token=token_falso&hub.challenge=123"
  ```
  - **Esperado:** HTTP 403 Forbidden.
- **Cenário 3 — Recepção de Lead (POST) assinado:** corpo assinado com `X-Hub-Signature-256: sha256=<HMAC do corpo com META_APP_SECRET>`.
  - **Esperado:** HTTP 200 e ingestão na roleta. Com `META_PAGE_ACCESS_TOKEN` configurado, nome/telefone/e-mail vêm da Graph API; sem ele, o lead entra como "contato pendente" com nota na timeline.
- **Cenário 4 — POST sem assinatura:** **Esperado:** HTTP 401.

---

### 🔍 INT-02: Google Ads (Lead Form Extensions)

- **Rota:** `/api/webhooks/google-ads`
- **Cenário 1 — Status do Listener (GET):**
  ```bash
  curl -i -X GET http://localhost:3002/api/webhooks/google-ads
  ```
  - **Esperado:** HTTP 200 com `status: "online"`.
- **Cenário 2 — Ingestão de Lead com Payload Oficial do Google Ads (POST):**
  ```bash
  curl -i -X POST http://localhost:3002/api/webhooks/google-ads \
    -H "Content-Type: application/json" \
    -d '{
      "google_key": "'"$GOOGLE_ADS_WEBHOOK_KEY"'",
      "campaign_id": "19828349",
      "form_id": "772183",
      "user_column_data": [
        {"column_id": "FULL_NAME", "string_value": "Mariana Barreto Ribeiro"},
        {"column_id": "PHONE_NUMBER", "string_value": "85998765432"},
        {"column_id": "EMAIL", "string_value": "mariana.ribeiro@gmail.com"}
      ]
    }'
  ```
  - **Esperado:** HTTP 200/201 com confirmação de lead cadastrado e atribuído ao corretor da vez.

---

### 🏠 INT-03: Grupo OLX (Zap Imóveis & Viva Real)

- **Rota:** `/api/webhooks/grupo-olx`
- **Cenário — Ingestão de Contato de Portal (POST):**
  ```bash
  curl -i -X POST http://localhost:3002/api/webhooks/grupo-olx \
    -H "x-api-key: $PORTAL_WEBHOOK_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "portal": "Zap Imóveis",
      "client": {
        "name": "Roberto Farias Filho",
        "phone": "85981239876",
        "email": "roberto.farias@uol.com.br"
      },
      "codigoImovel": "EMP-MEIRELES-01",
      "mensagem": "Gostaria de agendar visita na unidade de 3 suítes"
    }'
  ```
- **Esperado:** HTTP 200 com `{ success: true, leadId: "..." }`.

---

### 🔑 INT-04: Portal Chaves na Mão

- **Rota:** `/api/webhooks/chaves-na-mao`
- **Cenário — Proposta de Lançamento (POST):**
  ```bash
  curl -i -X POST http://localhost:3002/api/webhooks/chaves-na-mao \
    -H "x-api-key: $PORTAL_WEBHOOK_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "nome": "Juliana Vasconcelos",
      "telefone": "85994443322",
      "email": "juliana.vasconcelos@teste.com",
      "codigoImovel": "LANCAMENTO-BEIRA-MAR"
    }'
  ```
- **Esperado:** HTTP 200 com lead integrado com origem `PORTAL_IMOBILIARIO`.

---

### 🏡 INT-05: Portal Dream Casa

- **Rota:** `/api/webhooks/dream-casa`
- **Cenário — Solicitação de Contato (POST):**
  ```bash
  curl -i -X POST http://localhost:3002/api/webhooks/dream-casa \
    -H "x-api-key: $PORTAL_WEBHOOK_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "nome": "Fernando Nogueira",
      "telefone": "85987650011",
      "email": "fernando.nogueira@hotmail.com"
    }'
  ```
- **Esperado:** HTTP 200 com lead gerado no funil padrão.

---

### 🌐 INT-06: Landing Pages Oficiais & WordPress / Elementor

- **Rota:** `/api/webhooks/landing-page`
- **Cenário 1 — Envio JSON (POST):**
  ```bash
  curl -i -X POST "http://localhost:3002/api/webhooks/landing-page?token=$LANDING_PAGE_WEBHOOK_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "nome": "Patrícia Dantas",
      "telefone": "85996667788",
      "email": "patricia.dantas@yahoo.com",
      "campanha": "Lançamento Porto Platz",
      "empreendimento": "Porto Platz Residence"
    }'
  ```
  - **Esperado:** HTTP 200 com lead vinculado à campanha especificada.
- **Cenário 2 — Envio Multipart FormData (Padrão Elementor Forms):**
  ```bash
  curl -i -X POST "http://localhost:3002/api/webhooks/landing-page?token=$LANDING_PAGE_WEBHOOK_KEY" \
    -F "form_fields[nome]=Lucas Bezerra" \
    -F "form_fields[telefone]=85993332211" \
    -F "form_fields[email]=lucas.bezerra@gmail.com" \
    -F "form_name=Formulário de Contato Rodapé"
  ```
  - **Esperado:** HTTP 200 processando FormData com sucesso.

---

### ⚡ INT-07: API & Webhooks Customizados (n8n, Make, Zapier)

- **Rota:** `/api/webhooks/custom`
- **Cenário — Envio com Chave de API:**
  ```bash
  curl -i -X POST http://localhost:3002/api/webhooks/custom \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $CONNECT_PLATZ_API_KEY" \
    -d '{
      "nome": "Amanda Silveira",
      "telefone": "85991114455",
      "email": "amanda.silveira@outlook.com",
      "origem": "n8n_automation"
    }'
  ```
- **Esperado:** HTTP 200 com lead processado.

---

### 📍 INT-08: Geolocalização de Endereço (ViaCEP & BrasilAPI)

- **Rota:** `/api/location/cep/[cep]`
- **Cenário 1 — Consulta de CEP Válido:**
  ```bash
  curl -i -X GET http://localhost:3002/api/location/cep/60160230
  ```
  - **Esperado:** HTTP 200 retornando logradouro (Avenida Dom Luís), bairro (Meireles), cidade (Fortaleza), estado (CE) e coordenadas lat/lng com cache header `s-maxage=86400`.
- **Cenário 2 — Formato de CEP Inválido:**
  ```bash
  curl -i -X GET http://localhost:3002/api/location/cep/123
  ```
  - **Esperado:** HTTP 400 com mensagem informando exigência de 8 dígitos numéricos.
- **Cenário 3 — CEP Inexistente:**
  ```bash
  curl -i -X GET http://localhost:3002/api/location/cep/99999999
  ```
  - **Esperado:** HTTP 404 informando CEP não localizado nas bases.

---

### 🧭 INT-09: Maptech & Cálculo de Rotas (Waze & Google Maps)

- **Rota:** `/api/location/property`
- **Cenário — Obtenção de Links Diretos de Navegação:**
  ```bash
  curl -i -X POST http://localhost:3002/api/location/property \
    -H "Content-Type: application/json" \
    -d '{
      "endereco": "Av. Beira Mar, 2000 - Meireles, Fortaleza - CE",
      "latitude": -3.7258,
      "longitude": -38.4982
    }'
  ```
- **Esperado:** HTTP 200 retornando deep link validado para o Waze e para o Google Maps.

---

### 🏛️ INT-10: Compliance & Validação de CNPJ (Receita Federal)

- **Rota:** `/api/compliance/cnpj/[cnpj]`
- **Cenário 1 — CNPJ Válido (Consulta Cadastral):**
  ```bash
  curl -i -X GET http://localhost:3002/api/compliance/cnpj/33000167000101
  ```
  - **Esperado:** HTTP 200 retornando Razão Social, Nome Fantasia, Situação Cadastral (ex: `ATIVA`), CNAE principal e endereço oficial.
- **Cenário 2 — CNPJ com Dígito Verificador Inválido (Módulo 11):**
  ```bash
  curl -i -X GET http://localhost:3002/api/compliance/cnpj/11111111111111
  ```
  - **Esperado:** HTTP 400 informando falha de validação matemática do Módulo 11 antes mesmo de onerar chamadas externas.

---

### ⏱️ INT-11: Cron de SLA & Transbordo Automático

- **Rota:** `/api/cron/sla`
- **Cenário 1 — Execução do Worker com Secret Token:**
  ```bash
  curl -i -X GET http://localhost:3002/api/cron/sla \
    -H "Authorization: Bearer $CRON_SECRET"
  ```
  - **Esperado:** HTTP 200 reportando quantidade de transbordos de SLA processados e leads da fila noturna liberados.
- **Cenário 2 — Tentativa Não Autorizada em Produção:**
  ```bash
  curl -i -X GET http://localhost:3002/api/cron/sla
  ```
  - **Esperado:** HTTP 401 Unauthorized sem o token (em qualquer ambiente em que `CRON_SECRET` esteja configurado).

---

## 🎨 PARTE 3: Matriz de Validação Visual & Conformidade UI

| Item Auditado | Requisito Mandatório | Como Verificar |
|---|---|---|
| **Sem Sinais Repetidos** | Proibido `++`, `--`, `%%` | Inspecionar elementos com `<TrendBadge />` e StatCards da Dashboard |
| **Sem Setas Duplicadas** | Não exibir ícone visual e seta Unicode simultaneamente | Inspecionar badges com `TrendingUp` / `TrendingDown` |
| **Limite de Linhas** | Nenhum componente > 400 linhas | Rodar script de auditoria de linhas nos diretórios `app/` e `components/` |
| **Responsividade Mobile** | Menu em gaveta fluida e Kanban rolável | Reduzir viewport para 375px (iPhone) e validar drawer |
| **Suporte PWA** | `manifest.json` ativo e meta tags mobile | Validar no DevTools > Application > Manifest |
| **Tema Dark & Light** | Alternância sem quebra de contraste | Clicar no botão ☀/☾ na topbar e verificar legibilidade |

---

## 📝 Template de Registro de Execução de Testes

Ao rodar este plano, preencha a tabela de execução abaixo:

| ID do Teste | Módulo / Integração | Status | Tempo de Resposta | Observações / Evidências |
|---|---|---|---|---|
| `TC-FUNC-01` | Auth / Admin Login | 🟢 PASS | 120ms | Cookie emitido corretamente |
| `TC-FUNC-03` | RBAC Corretor Edge | 🟢 PASS | 15ms | Redirecionamento 307 acionado |
| `TC-FUNC-07` | Kanban Drag & Drop | 🟢 PASS | — | Toast exibido e etapa persistida |
| `TC-FUNC-12` | Ficha Comercial Modal | 🟢 PASS | — | Abriu in-page sem nova aba |
| `TC-FUNC-13` | Upload de Materiais | 🟢 PASS | 210ms | Salvo em /uploads/materials |
| `INT-01` | Meta Ads Webhook | 🟢 PASS | 45ms | Handshake e ingestão validados |
| `INT-02` | Google Ads Webhook | 🟢 PASS | 55ms | Extensão de lead processada |
| `INT-08` | Consulta de CEP | 🟢 PASS | 180ms | Retornou logradouro e lat/lng |
| `INT-10` | Consulta de CNPJ | 🟢 PASS | 290ms | Módulo 11 validado com sucesso |
