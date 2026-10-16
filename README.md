# 🏢 Connect Platz CRM & ERP

<div align="center">

![Connect Platz CRM](https://img.shields.io/badge/Connect%20Platz-CRM%20%26%20ERP-1266C7?style=for-the-badge&logo=compass&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js%2014-App%20Router-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma%20ORM-5.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

**Plataforma Integrada de CRM Imobiliário, Gestão Comercial e ERP Financeiro para Vendas de Imóveis e Aluguel de Temporada.**

[Visão Geral](#-visão-geral-do-projeto) •
[Arquitetura](#-arquitetura-do-sistema) •
[Módulos & Funcionalidades](#-módulos-e-funcionalidades) •
[Stack Tecnológica](#-stack-tecnológica-e-bibliotecas) •
[Governança & Segurança](#-governança-segurança-e-lgpd) •
[Instalação & Execução](#-instalação-e-execução-local) •
[Deploy em Produção](#-deploy-em-produção-vps--docker) •
[Estrutura de Pastas](#-estrutura-do-projeto)

---

</div>

## 📌 Visão Geral do Projeto

O **Connect Platz CRM & ERP** (Robson Carvalho CRM CONNECT PLATZ) é uma solução corporativa completa, desenvolvida sob medida para a **Connect Platz Imobiliária** (CNPJ: `53.758.699/0001-10` | CRECI: `023456-J`).

O sistema atende a uma operação híbrida com duas verticais de alta performance:
1. **Vendas de Empreendimentos e Imóveis Avulsos**: Gestão ponta a ponta desde a captação de leads via Meta Ads/Google Ads/Portais, distribuição por roleta inteligente com presença, funil Kanban com SLA rigoroso, esteira de qualificação de crédito bancário (CLT e Autônomos), espelho de vendas interativo até o fechamento de contrato e split de comissões.
2. **Aluguel de Temporada (Veraneio)**: Gestão de reservas com bloqueio automático de calendário anti-overbooking, cálculo de diárias, taxas de limpeza, registro de meios de pagamento e conciliação com o fluxo de caixa.

### 🎨 Design System e Fidelidade Visual (Inspiração Habitus CRM)
Toda a interface do Connect Platz CRM foi desenhada com base nos padrões estéticos, de movimento e de usabilidade do **Habitus CRM**, adaptando a paleta para a identidade visual oficial da Connect Platz:
- **Cor Primária**: `connect-blue` (`#1266C7`) e `connect-deep-blue` (`#0D478F`)
- **Cor de Destaque / Gamificação**: `platz-gold` (`#D9BB4C`) e `platz-gold-light` (`#F8DA56`)
- **Fundos & Cartões**: Dark Mode profundo (`#080C14` / `#111827`) e Light Mode limpo (`#F8FAFC` / `#FFFFFF`)
- **Motion System**: Contadores numéricos dinâmicos (*Count-Up*), animações de entrada suaves (*fadeInUp*), Kanban fluído com elevação ao arrastar (*Drag & Drop*), pódio com coroas animadas (*AnimatedCrown*) e badges cromáticos de SLA com pulsos de atenção.
- **Tipografia**: `DM Sans` com tracking suave e legibilidade de alta densidade.
- **PWA Nativo**: Suporte completo a Progressive Web App para instalação direta no smartphone ou desktop.

---

## 🏗 Arquitetura do Sistema

O projeto foi construído seguindo rigorosamente os padrões de **Clean Architecture**, **Domain-Driven Design (DDD)** e os **Princípios SOLID**, assegurando baixo acoplamento, alta coesão e facilidade de testes e manutenção.

```mermaid
flowchart TD
    subgraph UI_Presentation ["1. Camada de Apresentação (Next.js 14 App Router)"]
        Landing["Portal Público / Vitrine\n(app/page.tsx)"]
        CRM["Painel CRM / ERP\n(app/crm/*)"]
        AuthUI["Login & Sessão\n(app/login)"]
        API["Route Handlers REST\n(app/api/*)"]
        Middleware["Edge Middleware\n(middleware.ts - JWT & RBAC)"]
    end

    subgraph CompositionRoot ["2. Composition Root & Injeção de Dependências"]
        Container["ServiceContainer\n(lib/container.ts)"]
    end

    subgraph ApplicationLayer ["3. Camada de Aplicação (Use Cases - SRP)"]
        UC1["IngestLeadUseCase"]
        UC2["DistributeLeadUseCase"]
        UC3["ProcessSlaTransbordoUseCase"]
        UC4["QualifyCreditUseCase"]
        UC5["CreateSeasonBookingUseCase"]
        UC6["AuthenticateUserUseCase"]
        UC7["RegisterUserUseCase"]
    end

    subgraph DomainLayer ["4. Camada de Domínio (Regras de Negócio Puras)"]
        Strategy["RoundRobinDistributionStrategy\n(Roleta de Presença)"]
        Policies["CreditPolicies\n(CLT & Autônomo Registry)"]
        Interfaces["Core Interfaces\n(ILeadRepository, IUserRepository, etc.)"]
    end

    subgraph InfraLayer ["5. Camada de Infraestrutura"]
        PrismaRepo["Prisma Repositories\n(Lead, User, Booking)"]
        Security["BcryptPasswordHasher\nJwtTokenService"]
        Services["AuditLogger, ReceiptPdf, SlaService,\nWebhookIngestor, DreService"]
        RLS["PostgreSQL RLS\n(lib/db/rls.ts - withRLS)"]
        DB[(PostgreSQL 16\nMulti-tenant)]
    end

    UI_Presentation --> Middleware
    API --> Container
    Container --> ApplicationLayer
    ApplicationLayer --> DomainLayer
    ApplicationLayer --> Interfaces
    InfraLayer -. implementa .-> Interfaces
    Container --> InfraLayer
    InfraLayer --> RLS --> DB
```

### Princípios SOLID Aplicados
- **Single Responsibility Principle (SRP)**: Cada caso de uso em `lib/application/usecases/` tem uma única responsabilidade de negócio isolada.
- **Open/Closed Principle (OCP)**: O algoritmo de distribuição (`IDistributionStrategy`) e as políticas de qualificação de crédito (`ICreditPolicy`, `CreditPolicyRegistry`) são abertos para extensão (ex: adicionar nova política de financiamento) sem alterar o código existente.
- **Liskov Substitution Principle (LSP)**: Qualquer implementação de repositório ou serviço pode substituir sua abstração sem quebrar contratos da aplicação.
- **Interface Segregation Principle (ISP)**: Interfaces granulares em `lib/core/interfaces/` evitam que módulos dependam de métodos que não utilizam.
- **Dependency Inversion Principle (DIP)**: A camada de aplicação e domínio depende exclusivamente de abstrações. As implementações de infraestrutura (Prisma, Bcrypt, JWT) são injetadas centralizadamente pelo `ServiceContainer` (`lib/container.ts`).

---

## 🚀 Módulos e Funcionalidades

### 1. 📊 Dashboard & Inteligência Comercial (BI)
- **Hero VGV Total**: Card em destaque com total de VGV vendido no período, sparkline visual e comparativo de crescimento percentual.
- **Resumo Financeiro**: StatCards com contagem animada (*Count-Up*) para Total de Vendas, Comissões Recebidas, Ticket Médio, Comissões Pagas e Pendentes.
- **Gráficos Interativos (Recharts)**:
  - Evolução de Vendas Mensais (Anual / Mensal / Semanal).
  - Funil de Conversão Comercial com taxa percentual por etapa.
- **Painel Operacional**:
  - Destaque ranqueado de **Leads Quentes** (com score numérico e botão direto para WhatsApp).
  - Linha do tempo vertical de **Compromissos e Visitas** do dia.
  - Ranking de Performance da Equipe e Feed de Atividades Recentes em tempo real.

### 2. 🗂 Gestão de Leads & Funil Kanban
- **Visualização Flexível**: Alternância instantânea entre modo **Kanban** (colunas com arrastar e soltar) e modo **Tabela/Lista**.
- **Motor de Roleta Inteligente (Round-Robin)**:
  - Distribuição automática de novos leads baseada no menor tempo desde o último lead recebido.
  - **Check-in Diário de Presença**: Apenas corretores que realizaram check-in e estão no status `DISPONIVEL` entram na roleta.
  - **Fila Noturna**: Leads captados fora do horário comercial (padrão: 22h às 09h) aguardam em fila retida e são distribuídos pontualmente às 09:00 na ordem de chegada.
- **Gestão de SLAs e Transbordo Automático**:
  - Cronômetro regressivo com badges visuais (🟢 No Prazo, 🟡 Alerta, 🔴 Vencido).
  - Transbordo automático por inatividade do corretor para o próximo da fila ou descarte no Bolsão.
- **Bolsão de Leads Compartilhado**: Área comum para resgate de leads sem atendimento por qualquer corretor autorizado.
- **Ficha Completa do Lead (Drawer Lateral)**:
  - Prontuário com dados cadastrais, canal de captação e rastreamento de campanha/anúncio/UTMs.
  - Histórico de interações, notas internas e linha do tempo de eventos.
  - **Classificação de Temperatura Determinística**: Badges 🔥 `Quente`, ☕ `Morno` e 🧊 `Frio` calculados por regras algorítmicas objetivas.
  - Ação rápida com link direto para conversa no WhatsApp (`https://wa.me/55...`).

### 3. 🏦 Central de Documentos & Qualificação de Crédito Bancário
- Upload seguro de documentos (RG, CNH, CPF, Comprovante de Residência, Certidões).
- **Esteira de Análise de Crédito**:
  - **Clientes CLT**: Exigência documental dos 3 últimos contracheques/holerites.
  - **Clientes Autônomos**: Exigência de extratos bancários recentes/IRPF e preenchimento mandatório de **Valor Específico de Renda Mensal (R$)**.

### 4. 🏢 Empreendimentos, Catálogo & Espelho de Vendas
- Cadastro de empreendimentos e imóveis avulsos com galeria de fotos (até 25 fotos), memorial descritivo, comodidades e localização.
- **Espelho de Vendas Interativo**: Visualização matricial de unidades por bloco/torre e andar com status coloridos (`Disponível`, `Reservada`, `Vendida`, `Bloqueada`).
- Geração de links públicos compartilháveis do catálogo e envio pré-formatado via WhatsApp.

### 5. 🏖 Aluguel de Temporada & Veraneio
- Módulo dedicado a locações de veraneio.
- **Bloqueio de Calendário Anti-Overbooking**: Bloqueio automático das datas de check-in e check-out ao confirmar a reserva.
- Cálculo automático de diárias, noites de permanência e taxa de limpeza.
- Registro obrigatório de meio de pagamento (`PIX`, `Cartão`, `Boleto`, `TED`).

### 6. 💰 Vendas, Fechamento de Contratos & Split de Comissões
- Cadastro de vendas com registro de **VGV Comercial** e **Valor de Avaliação Bancária**.
- **Split Multidirecional de Comissões**: Divisão automática de percentuais e parcelas para Imobiliária, Diretor, Gerente, Corretor Titular, Co-corretor, Captador e Parceiros Externos.
- **Geração de Recibos em PDF**: Emissão com 1 clique de recibos formais de pagamento de comissão via `jspdf` e `jspdf-autotable`.

### 7. 📈 ERP Financeiro, Fluxo de Caixa & DRE
- Gestão de contas a pagar e contas a receber integradas com as vendas e aluguéis.
- Categorização de despesas operacionais, administrativas e investimento em tráfego pago (Meta Ads / Google Ads).
- **DRE Gerencial em Tempo Real**: Apuração de Receita Bruta, Deduções, Margem de Contribuição e Resultado Líquido.

### 8. 🏆 Ranking & Gamificação
- **Pódio Visual Animado**: Destaque para 1º, 2º e 3º lugares com troféus e coroas flutuantes animadas (`AnimatedCrown`).
- **Métricas Multidimensionais**: Ordenação por VGV Total Vendido, Quantidade de Vendas, Aluguéis Fechados, SLA e Visitas Realizadas.
- **Gestão de Metas Comerciais**: Acompanhamento de metas individuais e coletivas com celebração visual (`canvas-confetti`).

### 9. 📅 Agenda de Visitas e Compromissos
- Visualização em modos **Mês**, **Semana** e **Dia**.
- Tipificação por cores: Visita ao Imóvel, Documentação, Retorno / Follow-up, Apresentação de Proposta e Lembretes.
- Vínculo direto de cada compromisso ao Lead e ao Imóvel respectivo.

### 10. 👥 Gestão de Equipes, Check-in & Auditoria
- Gestão de colaboradores com controle de status (`Disponível`, `Em Visita`, `Pausa`, `Offline`).
- Histórico diário de check-in de presença com IP e data/hora.
- **Log de Auditoria Completo**: Rastreabilidade de logins, reatribuições manuais, exclusões, alterações de leads e baixas financeiras.

### 11. 🌐 Portal Público / Vitrine de Imóveis
- Landing page pública institucional de alta conversão (`app/page.tsx`).
- Busca avançada por modalidade (Venda ou Temporada), faixa de preço, tipo de imóvel, quartos e cidade/bairro.
- **Simulador de Financiamento Imobiliário**: Cálculo estimativo de entrada, parcelas e renda mínima recomendada.
- Captação direta de leads conectada automaticamente à roleta de distribuição do CRM.

### 12. 🔌 Integrações & Webhooks
- **Meta Ads**: Receptor oficial de Webhooks do Facebook/Instagram Lead Ads com verificação criptográfica de assinatura (`x-hub-signature-256`), deduplicação de contatos e mapeamento de formulários.
- **Google Ads & Portais Imobiliários**: Endpoints dedicados para ingestão de leads via Grupo OLX (ZAP / VivaReal), Chaves na Mão, DreamCasa e Webhook Genérico JSON.

---

## 🛠 Stack Tecnológica e Bibliotecas

| Categoria | Tecnologia / Biblioteca | Versão | Propósito no Projeto |
| :--- | :--- | :--- | :--- |
| **Framework Full-Stack** | [Next.js](https://nextjs.org/) | `14.2.13` | Framework React com App Router, Server Components e Edge API Routes |
| **Linguagem** | [TypeScript](https://www.typescriptlang.org/) | `5.6.2` | Tipagem estática rigorosa em todo o frontend, backend e domínio |
| **UI Library** | [React](https://react.dev/) | `18.3.1` | Biblioteca de interfaces reativas baseadas em componentes |
| **Estilização** | [Tailwind CSS](https://tailwindcss.com/) | `3.4.11` | Estilização utility-first, design tokens HSL e suporte a Dark/Light Mode |
| **Animações** | [Framer Motion](https://www.framer.com/motion/) | `13.4.6` | Animações fluidas de entrada, transições de gavetas e micro-interações |
| **Banco de Dados** | [PostgreSQL](https://www.postgresql.org/) | `16-alpine` | Banco relacional robusto com suporte a Row Level Security (RLS) |
| **ORM** | [Prisma](https://www.prisma.io/) | `5.19.1` | Modelagem de dados type-safe, migrações automatizadas e Client ORM |
| **Autenticação & JWT** | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | `9.0.2` | Emissão de tokens de sessão no servidor Node |
| **Edge Crypto** | Web Crypto API | Nativa | Validação de tokens JWT no Edge Runtime do Next.js Middleware sem latência |
| **Criptografia de Senha** | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | `2.4.3` | Hashing seguro de senhas com fator de custo `salt rounds >= 12` |
| **Validação de Schemas** | [Zod](https://zod.dev/) | `3.23.8` | Validação de payloads de API, webhooks e formulários com inferência de tipos |
| **Gráficos e BI** | [Recharts](https://recharts.org/) | `3.10.1` | Gráficos de linhas de vendas, funil de barras e indicadores analíticos |
| **Ícones** | [Lucide React](https://lucide.dev/) | `0.441.0` | Conjunto consistente de ícones vetoriais modernos |
| **Geração de PDF** | [jsPDF](https://github.com/parallax/jsPDF) | `4.2.1` | Geração client-side e server-side de recibos de comissão e relatórios |
| **Tabelas em PDF** | [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) | `5.0.8` | Formatação de tabelas estruturadas em PDFs de recibos e DRE |
| **Planilhas** | [xlsx](https://sheetjs.com/) | `0.18.5` | Exportação de dados de leads e relatórios para Excel / CSV |
| **Efeitos Visuais** | [canvas-confetti](https://github.com/catdad/canvas-confetti) | `1.9.4` | Disparo comemorativo de confetes em metas e fechamento de vendas |
| **Manipulação de Datas** | [date-fns](https://date-fns.org/) | `3.6.0` | Formatação de datas, prazos de SLA e cálculos de diárias de temporada |
| **Utilitários CSS** | `clsx` & `tailwind-merge` | `2.1.1` / `2.5.2` | Composição e mesclagem condicional de classes Tailwind sem conflitos |
| **Execução TypeScript** | [tsx](https://github.com/privatenumber/tsx) | `4.23.15` | Execução rápida de seeds e scripts TypeScript sem compilação prévia |
| **Containerização** | [Docker](https://www.docker.com/) & Docker Compose | `3.8` | Empacotamento em containers e orquestração de App + PostgreSQL |
| **Web Server / Proxy** | [Nginx](https://nginx.org/) | Alpine | Proxy reverso, terminação SSL (Let's Encrypt), compressão e rate limiting |

---

## 🔒 Governança, Segurança e LGPD

### 1. Row Level Security (RLS) no PostgreSQL
O sistema implementa **Row Level Security (RLS)** nativo no PostgreSQL via transações controladas (`lib/db/rls.ts`):
- Variáveis de sessão `app.current_organization_id`, `app.current_user_id` e `app.current_user_role` são definidas no banco a cada requisição.
- Defesa em profundidade: Mesmo em consultas diretas, o banco garante que dados de uma organização não vazem para outra.

### 2. Controle de Acesso Baseado em Perfis (RBAC)
O sistema possui 4 níveis hierárquicos de acesso:
- `ADMINISTRADOR`: Acesso global 360°, gestão corporativa da imobiliária, equipes, integrações, auditoria e ERP financeiro completo.
- `DIRETOR`: Acesso a dashboards consolidados, relatórios gerenciais e acompanhamento de VGV.
- `GERENTE`: Supervisão de corretores da sua equipe, reatribuição de leads e metas comerciais.
- `CORRETOR`: **Acesso estritamente restrito aos seus próprios leads, à sua agenda e às suas comissões**.
  - O item "Administração" não é exibido no menu lateral.
  - Acesso bloqueado pelo `middleware.ts` e pelas APIs para Fluxo de Caixa, DRE, Equipes, Integrações e Auditoria.

### 3. Privacidade de Dados & LGPD (Máscara de Contato)
- Para leads ativos na carteira, o número de telefone e o e-mail são **mascarados automaticamente** (ex: `(85) 9****-1234` e `jo***@gmail.com`) para corretores que não sejam o titular responsável.
- Apenas o corretor titular e os administradores visualizam o contato completo.

### 4. Sem WhatsApp Embutido (Deep Links Oficiais)
- O CRM não utiliza bots ou clientes não oficiais de WhatsApp que possam violar termos de serviço ou gerar bloqueios de números.
- Todas as ações disparam deep links oficiais seguros para o WhatsApp Web ou aplicativo nativo: `https://wa.me/55<telefone>?text=<mensagem>`.

### 5. Sem Inteligência Artificial Externa
- Todas as decisões de roleta, scores de temperatura (🔥/☕/🧊), prazos de SLA e transbordos são **100% determinísticas e auditáveis**, sem dependência de serviços externos de IA sujeitos a alucinações ou indisponibilidade.

---

## 💻 Instalação e Execução Local

### Pré-requisitos
- **Node.js** `>= 18.18.0` (recomendado: Node 20 LTS)
- **npm** `>= 9.x`
- **Docker** e **Docker Compose** (ou uma instância local do PostgreSQL 16)

### Passo a Passo

1. **Clonar o Repositório**:
   ```bash
   git clone https://github.com/seu-usuario/connect-platz-crm.git
   cd connect-platz-crm
   ```

2. **Instalar Dependências**:
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente**:
   Copie o arquivo de exemplo e ajuste os parâmetros conforme necessário:
   ```bash
   cp .env.example .env
   ```

   Exemplo de configuração para ambiente local:
   ```env
   # Banco de Dados PostgreSQL
   DATABASE_URL="postgresql://postgres:password@localhost:5432/connect_platz_crm?schema=public"
   DIRECT_URL="postgresql://postgres:password@localhost:5432/connect_platz_crm?schema=public"

   # Autenticação JWT e Segurança
   JWT_SECRET="connect_platz_jwt_super_secret_key_change_in_production_2026"
   BCRYPT_SALT_ROUNDS="12"

   # Meta Ads Webhook
   META_VERIFY_TOKEN="connect_platz_meta_webhook_token"
   META_APP_SECRET="meta_app_secret_signature_validation"

   # Aplicação
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

4. **Iniciar o Banco de Dados com Docker** (opcional caso já tenha PostgreSQL rodando):
   ```bash
   docker compose up -d postgres
   ```

5. **Executar as Migrações e Sincronizar o Prisma**:
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

6. **Popular Dados Iniciais (Seed)**:
   Gera a organização padrão, usuário administrador e corretores de exemplo:
   ```bash
   npm run prisma:seed
   ```

   > **Credenciais de Acesso Inicial (Seed):**  
   > - **E-mail:** `robson@connectplatz.com.br`  
   > - **Senha:** `ConnectPlatz2026@`  
   > - **Perfil:** Administrador

7. **Iniciar o Servidor de Desenvolvimento**:
   ```bash
   npm run dev
   ```

   Acesse no navegador:
   - **Portal Público / Vitrine:** [http://localhost:3000](http://localhost:3000)
   - **Login no CRM:** [http://localhost:3000/login](http://localhost:3000/login)
   - **Painel CRM:** [http://localhost:3000/crm](http://localhost:3000/crm)

---

## 🚢 Deploy em Produção (VPS & Docker)

O projeto inclui suporte completo para deploy automatizado em servidores Linux (Ubuntu 20.04/22.04/24.04 ou Debian 11/12) com Docker Compose e Nginx.

### 1. Deploy Automatizado com 1 Comando
No servidor VPS recém-configurado, basta executar o script `deploy.sh`:

```bash
chmod +x deploy.sh
./deploy.sh
```

O script realiza automaticamente:
1. Instalação do Docker e Docker Compose (se não existirem);
2. Criação do arquivo `.env` seguro com chave criptográfica randômica para `JWT_SECRET`;
3. Build da imagem Docker da aplicação em modo `standalone`;
4. Inicialização do PostgreSQL 16 Alpine com healthcheck ativo;
5. Execução do `prisma db push` e `prisma db seed`;
6. Disponibilização da aplicação na porta `3000`.

### 2. Orquestração com Docker Compose

Para subir manualmente os containers em produção:
```bash
docker compose up -d --build
```

Para verificar os logs da aplicação:
```bash
docker compose logs -f app
```

### 3. Configuração de Nginx e Certificado SSL (HTTPS)
O repositório já inclui um arquivo de configuração profissional otimizado para Nginx em `nginx/connect-platz.conf`:
- Suporte a HTTP/2;
- Cabeçalhos de segurança (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`);
- Compressão Gzip;
- Rate limiting para proteção contra ataques de força bruta;
- Cache estático otimizado para assets do Next.js (`/_next/static/`);
- Renovação automática de certificados com Certbot / Let's Encrypt.

---

## 📁 Estrutura do Projeto

```plaintext
Connect-Platz/
├── app/                              # Next.js 14 App Router
│   ├── api/                          # Route Handlers REST
│   │   ├── agenda/                   # CRUD de compromissos e visitas
│   │   ├── auditoria/                # Consulta de logs de auditoria
│   │   ├── auth/                     # login, logout, me, checkin, status
│   │   ├── bookings/                 # Reservas de temporada
│   │   ├── cron/sla/                 # Job de SLA, roleta e transbordo
│   │   ├── dashboard/                # Métricas consolidadas de BI
│   │   ├── equipes/                  # Gestão de corretores e status
│   │   ├── financeiro/               # Fluxo de caixa, despesas e DRE
│   │   ├── leads/                    # CRUD de leads, prontuário e upload
│   │   ├── properties/               # Imóveis, unidades e espelho
│   │   ├── ranking/                  # Ranking, metas e gamificação
│   │   ├── vendas/                   # Vendas, comissões e recibos PDF
│   │   └── webhooks/                 # Meta Ads, Google Ads, OLX, Portais
│   ├── crm/                          # Telas do Painel Administrativo / Corretor
│   │   ├── agenda/                   # Calendário de visitas e tarefas
│   │   ├── auditoria/                # Visualizador de logs de auditoria
│   │   ├── configuracoes/            # Parâmetros gerais e SLAs
│   │   ├── empreendimentos/          # Catálogo e cadastro de imóveis
│   │   ├── equipes/                  # Gestão de corretores e presença
│   │   ├── fluxo-de-caixa/           # Módulo ERP financeiro
│   │   ├── integracoes/              # Configurações de webhooks
│   │   ├── leads/                    # Quadro Funil Kanban e Lista
│   │   ├── ranking/                  # Pódio de gamificação e metas
│   │   ├── relatorios/               # Relatórios executivos de BI
│   │   ├── temporada/                # Gestão de aluguéis de veraneio
│   │   ├── vendas/                   # Fechamento de vendas e comissões
│   │   ├── layout.tsx                # Shell do CRM (Sidebar, Topbar, PWA)
│   │   └── page.tsx                  # Dashboard principal de BI
│   ├── espelho/[slug]/               # Espelho de vendas interativo de empreendimentos
│   ├── login/                        # Tela de autenticação com design Habitus
│   ├── globals.css                   # Variáveis de tema CSS e animações
│   ├── layout.tsx                    # Layout raiz com fontes e viewport PWA
│   └── page.tsx                      # Portal público / Vitrine imobiliária
├── components/                       # Componentes React Modulares (max 350-400 linhas)
│   ├── crm/                          # Componentes do CRM
│   │   ├── agenda/                   # Modais e visualizadores de calendário
│   │   ├── dashboard/                # StatCards, gráficos Recharts, widgets
│   │   ├── lead-drawer/              # Prontuário lateral, histórico e documentos
│   │   ├── leads/                    # Colunas Kanban, LeadCard, filtros
│   │   ├── properties/               # Modais de imóvel e espelho de vendas
│   │   ├── ranking/                  # Pódio animado, coroa, cards de destaque
│   │   ├── vendas/                   # Modais de nova venda e split
│   │   ├── AnimatedCrown.tsx         # Coroa animada do 1º colocado no ranking
│   │   ├── CountUpNumber.tsx         # Interpolação numérica animada de valores
│   │   ├── LeadDrawer.tsx            # Gaveta lateral de detalhes do lead
│   │   ├── Sidebar.tsx               # Menu lateral retrátil
│   │   ├── SlaBadge.tsx              # Badges de SLA com pulsos de atenção
│   │   └── Topbar.tsx                # Barra superior com notificações e tema
│   └── portal/                       # Componentes do Portal Público / Vitrine
│       ├── PortalCreditSimulator.tsx # Simulador de crédito imobiliário
│       ├── PortalHero.tsx            # Hero banner com busca dinâmica
│       └── PortalListings.tsx        # Grid de cards de imóveis
├── lib/                              # Núcleo de Domínio, Aplicação e Infraestrutura
│   ├── application/usecases/         # Casos de uso de negócio (SRP)
│   ├── auth/                         # Utilitários de JWT, Bcrypt e sessão
│   ├── container.ts                  # Composition Root (Dependency Injection)
│   ├── core/interfaces/              # Contratos e abstrações (DIP/ISP)
│   ├── db/                           # Prisma Client e RLS (PostgreSQL)
│   ├── domain/                       # Regras de negócio puras (Roleta, Crédito)
│   ├── infrastructure/               # Repositórios concretos e adaptadores
│   └── services/                     # Serviços auxiliares (PDF, SLA, Webhooks)
├── prisma/
│   ├── schema.prisma                 # Modelagem relacional completa do PostgreSQL
│   └── seed.ts                       # Script de carga inicial de dados
├── public/                           # Manifest PWA, service worker, ícones e logos
├── nginx/                            # Arquivo de configuração de proxy reverso Nginx
├── scripts/                          # Scripts de testes automatizados e homologação
├── deploy.sh                         # Script de automação de deploy na VPS
├── docker-compose.yml                # Orquestração do App + PostgreSQL
├── Dockerfile                        # Multi-stage build otimizado para Next.js
├── middleware.ts                     # Proteção de rotas, validação de sessão e RBAC
├── package.json                      # Dependências e scripts do projeto
├── tailwind.config.ts                # Configuração do Tailwind CSS e tokens visuais
└── tsconfig.json                     # Configuração do compilador TypeScript
```

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor local de desenvolvimento na porta `3000` |
| `npm run build` | Compila a aplicação para produção (modo standalone) |
| `npm run start` | Inicia a aplicação compilada em modo de produção |
| `npm run lint` | Executa o linter do Next.js para análise estática de código |
| `npm run prisma:generate` | Gera o Prisma Client com base no arquivo `schema.prisma` |
| `npm run prisma:push` | Sincroniza o schema diretamente com o banco de dados sem migrações |
| `npm run prisma:migrate` | Aplica migrações pendentes em ambiente de produção |
| `npm run prisma:seed` | Executa o script `prisma/seed.ts` para popular a base de dados |

---

## 📄 Licença e Direitos

Este software é um produto proprietário desenvolvido sob medida para a **Connect Platz Imobiliária**. Todos os direitos são reservados. Reprodução ou distribuição não autorizada é estritamente proibida.

<div align="center">
  <sub>Connect Platz Imobiliária © 2026. Todos os direitos reservados.</sub>
</div>
