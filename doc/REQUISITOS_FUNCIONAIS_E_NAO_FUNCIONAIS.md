# Especificação de Requisitos do Sistema: Robson Carvalho CRM CONNECT PLATZ
**Versão:** 1.0  
**Data:** Setembro/2026  
**Cliente:** Connect Platz Imobiliária  
**Status:** Documento Oficial de Engenharia de Software  

---

## 1. Visão Geral do Produto
O **Robson Carvalho CRM CONNECT PLATZ** é uma plataforma integrada de **CRM & ERP Imobiliário** desenvolvida sob medida para a **Connect Platz Imobiliária**. A solução atende a uma operação híbrida com duas verticais de negócio: **Vendas de Imóveis** e **Aluguel de Temporada (Veraneio)**.

O sistema integra a captura em tempo real de leads (Meta Ads), distribuição justa por roleta inteligente com checagem de presença (check-in), esteira de qualificação para crédito imobiliário, controle estrito de SLAs de atendimento com transbordo automático, bloqueio de calendário de reservas, gestão financeira integrada (ERP/Fluxo de Caixa) e governança de contatos alinhada à LGPD.

---

## 2. Requisitos Funcionais (RF)

### Módulo 1: Recepção e Captação de Leads (Meta Ads & Webhooks)
- **RF-01 (Webhook Meta Ads):** O sistema deve fornecer um endpoint receptor de Webhook HTTP em tempo real compatível com a API de Leads do Facebook/Instagram (Meta Graph API).
- **RF-02 (Validação de Payload):** O endpoint de captura deve validar a assinatura criptográfica e a integridade dos dados recebidos através de schemas estruturados (Zod).
- **RF-03 (Rastreamento de Origem):** O sistema deve extrair e armazenar os identificadores da campanha, criativo (`ad_id`, `form_id`, `campaign_name`, `ad_name`) e parâmetros UTM (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`).
- **RF-04 (Cadastro Manual pelo Corretor):** O corretor deve poder cadastrar leads próprios captados organicamente ou em plantões, associando automaticamente o lead à sua carteira com a flag `source: MANUAL_CORRETOR`.
- **RF-05 (Captura por Formulários Externos):** O sistema deve permitir a geração de links públicos de captura para campanhas específicas e páginas de catálogo de imóveis.
- **RF-06 (Deduplicação de Contatos):** Ao receber um lead com mesmo telefone ou e-mail já ativo no funil, o sistema deve registrar um evento na linha do tempo do lead existente em vez de gerar um registro duplicado.

### Módulo 2: Motor de Roleta, Presença & Distribuição Inteligente
- **RF-07 (Check-in Diário Obrigatório):** O corretor só entrará na fila de distribuição da roleta se tiver efetuado o Check-in diário no seu painel.
- **RF-08 (Gestão de Status do Corretor):** O corretor pode alternar seu estado operacional entre:
  - `Disponível`: apto a receber novos leads da roleta;
  - `Em Visita`: temporariamente pausado na roleta por estar em atendimento externo presencial (mantendo o check-in ativo);
  - `Pausa`: temporariamente fora da escala.
- **RF-09 (Algoritmo Round-Robin Ponderado):** A distribuição deve atribuir o novo lead ao corretor disponível com o menor timestamp de último lead recebido (o que estiver há mais tempo sem receber).
- **RF-10 (Janela Operacional Diária):** O motor de distribuição deve operar no horário comercial configurado (padrão: 09:00 às 22:00).
- **RF-11 (Fila de Espera Noturna):** Leads recebidos fora do horário operacional (22:01 às 08:59) devem ser retidos em fila de espera noturna e distribuídos pontualmente às 09:00 do dia útil seguinte, respeitando a ordem de chegada (FIFO).
- **RF-12 (Reatribuição Manual):** Administradores devem ter permissão para transferir leads entre corretores a qualquer momento.

### Módulo 3: Painel do Corretor, Funil Kanban & Prontuário do Lead
- **RF-13 (Quadro Kanban Dinâmico):** Exibição dos leads em colunas correspondentes às etapas do funil de vendas (ex.: *Novo Lead*, *Primeiro Contato*, *Visita Agendada*, *Proposta*, *Em Negociação*, *Análise de Crédito*, *Fechado*, *Encerrado*), com capacidade de arrastar e soltar (drag-and-drop).
- **RF-14 (Ficha Completa do Lead):** Prontuário contendo dados pessoais, histórico de contatos, dados de crédito, imóveis de interesse e anexos.
- **RF-15 (Anexo de Conversas e Mensagens):** O corretor deve conseguir anexar prints ou textos transcritos de conversas realizadas no WhatsApp ou Instagram no prontuário do cliente.
- **RF-16 (Central de Documentos):** Suporte a upload e visualização categorizada de documentos (RG, CNH, CPF, Comprovante de Residência) com limite de até 30MB.
- **RF-17 (Esteira de Análise de Crédito Bancário):**
  - Para clientes **CLT (Carteira Assinada)**: exigência de anexo dos 3 últimos contracheques/holerites;
  - Para clientes **Autônomos**: exigência de anexo de extratos bancários recentes ou IRPF, acompanhado de campo obrigatório para preenchimento de **Valor Específico de Renda Mensal (R$)**;
  - Campos de qualificação: Faixa de Renda (opções predefinidas), Estado Civil (tags: Solteiro, Casado, etc.), Profissão e Bairros/Regiões de Interesse.
- **RF-18 (Deep Link para WhatsApp):** A interface deve disponibilizar botão de ação que abre diretamente a conversa externa com o lead via WhatsApp Web / App (`https://wa.me/55...`), sem embutir cliente não oficial de mensageria no servidor.
- **RF-19 (Classificação de Temperatura Determinística):** Cálculo automático do score do lead (*Frio*, *Morno*, *Quente*) baseado em critérios objetivos (completude de dados, documentos anexados e proximidade de fechamento), sem dependência de IA externa.

### Módulo 4: Gestão de SLAs, Transbordo e Caducidade
- **RF-20 (SLA de Primeiro Atendimento):** O sistema deve cronometrar o tempo desde a atribuição do lead até o registro da primeira interação pelo corretor.
- **RF-21 (Transbordo Automático por Inatividade):** Caso o corretor não realize o primeiro contato no tempo limite estipulado (ex.: 20 minutos), o lead deve ser desatribuído automaticamente e repassado ao próximo corretor da roleta.
- **RF-22 (Alertas Visuais de SLA):** Os cards no Kanban devem exibir badges cromáticos:
  - 🟢 **Verde**: dentro do prazo;
  - 🟡 **Âmbar**: próximo ao vencimento (< 20% do prazo);
  - 🔴 **Vermelho**: SLA estourado com exibição do atraso decorrido.
- **RF-23 (Regra de Caducidade / Leads Encerrados):** Leads inativos sem resposta ou sem avanço de etapa entre 1 e 2 semanas (configurável) devem ser transferidos automaticamente para a coluna de *Encerrados*.
- **RF-24 (Bolsão de Leads):** Leads sem atendimento ou devolvidos voluntariamente ficam disponíveis no Bolsão Compartilhado para resgate por corretores autorizados.

### Módulo 5: Dupla Modalidade Comercial (Vendas & Aluguel de Veraneio)
- **RF-25 (Catálogo por Segmentos e Faixas de Valor):** Cadastro de imóveis categorizados por modalidade (Venda ou Temporada/Veraneio) e faixas de preço (Econômico, Médio, Alto Padrão, Luxo/Frente Mar).
- **RF-26 (Calendário e Bloqueio de Disponibilidade para Temporada):** Ao registrar uma locação de veraneio, o sistema deve bloquear automaticamente as datas de Check-in e Check-out na agenda do imóvel, impedindo conflitos de reserva (overbooking).
- **RF-27 (Registro Obrigatório de Meio de Pagamento):** O fechamento de contratos de aluguel ou venda exige a especificação do meio de pagamento utilizado (`PIX`, `Cartão de Crédito`, `Cartão de Débito`, `Boleto Bancário`, `TED`).
- **RF-28 (Espelho de Vendas Interativo):** Visualização matricial de unidades de empreendimentos por bloco/torre e andar, com cores indicativas (Disponível, Reservada, Vendida, Bloqueada).

### Módulo 6: Módulo ERP, Fluxo de Caixa e Split de Comissões
- **RF-29 (Conciliação Automática CRM-ERP):** Vendas fechadas e locações liquidadas devem gerar automaticamente os lançamentos de contas a receber no módulo financeiro.
- **RF-30 (Métricas de VGV e Avaliação):** O sistema deve registrar tanto o VGV comercial da transação quanto o Valor de Avaliação bancária para fins de apuração de receita e relatórios.
- **RF-31 (Split de Comissões):** Cálculo automático de fatias de comissão por venda (Imobiliária, Diretor, Gerente, Corretor Titular, Co-corretor, Captação e Parceiros Externos).
- **RF-32 (Fluxo de Contas a Pagar e Receber):** Gestão de despesas fixas, variáveis (tráfego pago/anúncios, marketing, sede) e receitas operacionais com calendário de vencimentos e baixa de pagamentos.
- **RF-33 (DRE Gerencial em Tempo Real):** Apuração de Receita Bruta, Deduções, Margem de Contribuição, Despesas Operacionais e Resultado Líquido.
- **RF-34 (Geração de Recibos em PDF):** Geração com 1 clique de comprovantes e recibos de pagamento de comissão com formatação profissional.

### Módulo 7: Governança, Privacidade (LGPD) & Painel do Administrador
- **RF-35 (Máscara de Contato para Leads Ativos):** Em leads ativos na carteira, os dados telefônicos e de e-mail devem ser visualizados apenas pelo corretor titular e administradores, protegendo o ativo comercial.
- **RF-36 (Exportação de Leads Encerrados para Remarketing):** Administradores devem ter acesso a uma visão consolidada e exportável (Excel/CSV) dos contatos encerrados para nutrição e novas campanhas.
- **RF-37 (Controle de Acesso Baseado em Perfis - RBAC):** 
  - `ADMINISTRADOR`: visão global 360°, gestão da equipe, auditoria, ERP completo e relatórios;
  - `CORRETOR`: visão estritamente restrita aos seus próprios leads, sua agenda e suas comissões.
- **RF-38 (Log de Auditoria):** Registro das principais movimentações de leads, reatribuições manuais e alterações financeiras.

### Módulo 8: Gamificação & Ranking Comercial
- **RF-39 (Pódio Visual em Tempo Real):** Painel interativo com pódio de 1º, 2º e 3º lugares com coroas e medalhas temáticas.
- **RF-40 (Critérios Multidimensionais de Ranking):** Capacidade de ordenar o ranking por:
  - VGV Vendido (R$);
  - Quantidade de Aluguéis de Veraneio fechados;
  - Índice de Atendimentos no Prazo de SLA;
  - Quantidade de Visitas Realizadas.
- **RF-41 (Gestão de Metas Comerciais):** Painel com barra de progresso visual de metas individuais e coletivas mensais.

### Módulo 9: Agenda de Compromissos e Visitas
- **RF-42 (Calendário Integrado):** Visualização de agenda por Dia, Semana e Mês.
- **RF-43 (Tipificação de Eventos com Cores):** Categorização de compromissos (Visita ao Imóvel, Retorno/Follow-up, Reunião, Assinatura de Contrato, Plantão).
- **RF-44 (Vínculo com Lead e Imóvel):** Associação direta de compromissos com o prontuário do cliente e o imóvel a ser visitado.

---

## 3. Requisitos Não Funcionais (RNF)

### RNF-01: Desempenho e Latência
- **RNF-01.1 (SLA de Entrada de Lead):** O tempo decorrido entre a emissão do Webhook do Meta Ads e a disponibilização do lead com notificação no painel do corretor deve ser inferior a **3 segundos** sob condições normais de rede.
- **RNF-01.2 (Tempo de Resposta de Interface):** As rotas do painel web e requisições da API devem responder em menos de **500ms** no percentil p95.
- **RNF-01.3 (Suporte a Carga de Leads):** A listagem de leads deve suportar paginação e carregamento fluido de até **5.000 registros**.

### RNF-02: Segurança, Privacidade e LGPD
- **RNF-02.1 (Armazenamento de Senhas com Bcrypt):** Todas as credenciais de acesso (senhas) devem ser obrigatoriamente protegidas com hash criptográfico utilizando **bcrypt** (salt rounds mínimo de 10 ou 12). Nenhuma senha em texto puro ou algoritmo fraco (MD5, SHA1) é permitida.
- **RNF-02.2 (Row Level Security - RLS):** O sistema deve implementar e respeitar estritamente políticas de **Row Level Security (RLS)** na camada de banco de dados e aplicação. O acesso a registros (leads, comissões, agendamentos, clientes) deve ser filtrado a nível de linha conforme o tenant/organização e o perfil (`user_id` / `corretor_id`), impedindo vazamento de dados entre corretores ou empresas.
- **RNF-02.3 (Autenticação e Sessão):** Autenticação robusta utilizando tokens JWT ou sessões criptografadas com expiração configurada e proteção contra CSRF.
- **RNF-02.4 (Criptografia em Trânsito e Repouso):** Todas as comunicações devem ocorrer obrigatoriamente sob protocolo HTTPS (TLS 1.3). Dados cadastrais sensíveis (CPF, RG, dados bancários) devem ser armazenados de maneira protegida.
- **RNF-02.5 (Isolamento de Dados por Corretor):** A camada de dados e APIs deve validar em nível de servidor que um corretor não possa requisitar ou alterar dados de leads pertencentes a outro colega (prevenção de IDOR).
- **RNF-02.6 (Conformidade com a LGPD):** Mecanismos para consentimento de captação, mascaramento de telefones em visualizações compartilhadas e anonimização/exclusão de dados mediante requisição formal.

### RNF-03: Disponibilidade, Tolerância a Falhas e Resiliência
- **RNF-03.1 (Idempotência no Webhook):** O endpoint de recepção de leads do Meta Ads deve garantir idempotência através do `leadgen_id`, evitando duplicação em caso de reenvio pela Meta.
- **RNF-03.2 (Fila de Processamento Assíncrono):** A ingestão de leads deve ser desacoplada da rotina de notificação e roleta através de processamento em fila assíncrona, garantindo que o Webhook responda status 200 HTTP em menos de 200ms à Meta.
- **RNF-03.3 (Disponibilidade):** A arquitetura deve prever disponibilidade mínima de 99,5% do tempo de operação em dias comerciais.

### RNF-04: Usabilidade, Acessibilidade e Design System
- **RNF-04.1 (Identidade Visual Oficial):** A interface deve aplicar estritamente a paleta oficial Connect Platz:
  - *Connect Blue:* `#1266C7` (ações primárias, botões de check-in, destaques);
  - *Platz Gold:* `#D9BB4C` (valores de VGV, destaques de fechamento, pódio);
  - *Midnight Black:* `#080C14` / `#111827` (fundo Dark Mode corporativo);
  - *Champagne Gold:* `#F8DA56` (badges de alta renda e 1º lugar do ranking).
- **RNF-04.2 (Design Responsivo Mobile-First):** Painel do corretor totalmente otimizado para navegadores mobile (smartphones) para uso em trânsito e plantões.
- **RNF-04.3 (Feedback Visual Imediato):** Transições de arrasto no Kanban, alertas cromáticos de SLA e ações com toasts/snackbars com tempo de resposta imperceptível.
- **RNF-04.4 (Fidelidade Visual e Animações Inspiradas no Habitus CRM):** A interface, layout, micro-interações e animações devem seguir rigorosamente o padrão visual do Habitus CRM (efeitos `fadeInUp`, animações count-up em métricas e VGV, drag-and-drop suave no Kanban, pódios animados com coroas no Ranking, pulsos de alerta em SLAs críticos e componentes Radix/Shadcn com cantos arredondados e acabamento de alto padrão).

### RNF-05: Arquitetura Tecnológica e Manutenibilidade
- **RNF-05.1 (Stack de Desenvolvimento):** Frontend moderno em Next.js / React com Tailwind CSS e Shadcn UI / Radix UI; Backend em Node.js com TypeScript e arquitetura modular de serviços.
- **RNF-05.2 (Camada de Dados):** Banco de dados gerenciado com Prisma ORM, garantindo tipagem estrita de ponta a ponta e migrações versionadas.
- **RNF-05.3 (Modularidade):** Serviços desacoplados (Módulo de Roleta, Módulo de Webhooks, Módulo Financeiro, Módulo de Vendas/Veraneio) facilitando testes unitários e manutenções futuras.

### RNF-06: Integrações e Compatibilidade Externa
- **RNF-06.1 (Meta Ads):** Compatibilidade com a versão mais recente da API Graph do Facebook para captura de leads.
- **RNF-06.2 (Geolocalização / Endereços):** Preenchimento automático de endereços e CEPs via API pública (ViaCEP / BrasilAPI).
- **RNF-06.3 (Exportação):** Geração de planilhas nos formatos `.xlsx` e `.csv`, e relatórios em PDF para impressão sem dependência de softwares proprietários.

---

## 4. Matriz de Priorização (MoSCoW)

| Categoria | Funcionalidades / Requisitos |
| :--- | :--- |
| **Must Have (Essencial)** | - Webhook Meta Ads em tempo real com rastreamento UTM e validação Zod (RF-01 a RF-03)<br>- Motor de Roleta Round-Robin com Check-in diário e horário comercial (RF-07 a RF-11)<br>- SLA de primeiro atendimento com transbordo automático (RF-20 a RF-22)<br>- Painel do Corretor com Kanban e ficha do lead (RF-13, RF-14)<br>- Esteira de Análise de Crédito com regras CLT vs Autônomo e anexos (RF-16, RF-17)<br>- Dupla modalidade: Vendas e Aluguel de Veraneio com bloqueio de datas (RF-25 a RF-27)<br>- Governança de contatos com máscara telefônica e visualização do Administrador (RF-35 a RF-37)<br>- Latência de entrega do lead < 3s (RNF-01.1) |
| **Should Have (Importante)** | - Módulo ERP com conciliação automática de receitas e DRE gerencial (RF-29 a RF-33)<br>- Painel de Ranking & Pódio visual com filtros multidimensionais (RF-39 a RF-41)<br>- Agenda de visitas vinculada a lead e imóvel (RF-42 a RF-44)<br>- Regra de Caducidade automática para leads inativos (RF-23)<br>- Cadastro manual de leads pelo próprio corretor (RF-04) |
| **Could Have (Desejável)** | - Espelho de vendas público para incorporadoras (RF-28)<br>- Exportação em massa de contatos encerrados em formato XLSX/CSV (RF-36)<br>- Catálogo digital público com layouts pré-formatados (RF-05)<br>- Gravação de notas de voz no prontuário |
| **Won't Have (Fora de Escopo)** | - Cliente web integrado de WhatsApp conectado via Webhook no backend (utilizar Deep Link `wa.me/`)<br>- Agentes autônomos de Inteligência Artificial / LLMs para atendimento automático de clientes |

---

## 5. Próximos Passos
Com a validação desta matriz de requisitos:
1. **Modelagem de Dados e Schemas:** Criação do `schema.prisma` com todas as entidades e enumerações necessárias.
2. **Setup do Projeto:** Inicialização do repositório com Next.js, TypeScript, Tailwind CSS e componentes base.
3. **Desenvolvimento da Etapa 1 & 2:** Endpoint de Webhook da Meta Ads, validação de payload Zod e arquitetura do servidor.
