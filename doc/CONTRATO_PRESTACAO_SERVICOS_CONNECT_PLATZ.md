# CONTRATO DE PRESTAÇÃO DE SERVIÇOS | CONNECT PLATZ IMOBILIÁRIA

## INSTRUMENTO PARTICULAR DE PRESTAÇÃO DE SERVIÇOS DE DESENVOLVIMENTO DE SOFTWARE

Por este instrumento particular de contrato, as partes qualificadas a seguir têm, entre si, justo e acordado o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas e condições descritas adiante:

### CONTRATADA:
**BRENO CAMELO MESQUITA TABOSA**, inscrito no CNPJ sob o nº **63.376.298/0001-35** e no CPF sob o nº **620.834.783-12**, com domicílio e sede em Fortaleza/CE, doravante denominado simplesmente **CONTRATADA**.

### CONTRATANTE:
**CONNECT PLATZ IMOBILIÁRIA**, pessoa jurídica inscrita no CNPJ sob o nº **53.758.699/0001-10**, com sede administrativa em [Endereço Completo da Sede / Município / UF], representada por seu sócio/administrador **Robson Carvalho de Sousa**, inscrito no CPF sob o nº **089.613.643-40**, doravante denominada simplesmente **CONTRATANTE**.

---

### CLÁUSULA PRIMEIRA - DO OBJETO

1.1. O objeto do presente contrato é a prestação de serviços de desenvolvimento de software sob medida para a plataforma proprietária da CONTRATANTE, denominada **"Robson Carvalho CRM CONNECT PLATZ"**, composta pelos seguintes módulos e funcionalidades:

a) **Módulo de Captação e Recepção Meta Ads:** Endpoint receptor de Webhook em tempo real integrado às APIs de anúncios do Facebook/Instagram, com validação estruturada de dados, decodificação de criativos (`ad_id`), campanhas e rastreamento completo de parâmetros UTM;  
b) **Motor Inteligente de Roleta de Distribuição:** Algoritmo matemático *Round-Robin* equitativo baseado no menor timestamp de atribuição, com filtro de janela operacional de horário comercial (09:00 às 22:00) e retenção automática na Fila de Espera Noturna com despacho às 09:00 em ordem de chegada (FIFO);  
c) **Painel Web do Corretor:** Interface responsiva moderna com autenticação segura JWT, botão obrigatório de **Check-in Diário** de presença, alternador de status operacional (*"Disponível"*, *"Em Visita"*, *"Pausa"*), Quadro Kanban com drag-and-drop por etapas de funil e opção de cadastro manual de leads próprios (`source: MANUAL_CORRETOR`);  
d) **Prontuário Completo do Lead e Esteira de Análise de Crédito:** Ficha cadastral com módulo de anexo de conversas de redes sociais (WhatsApp/Instagram), central de documentos digitalizados e formulário de qualificação bancária com regras específicas para **CLT** (anexo obrigatório de contracheque) e **Autônomo** (anexo de extratos bancários/IRPF e preenchimento de valor específico de renda em R$), tags de estado civil, profissão e localização desejada;  
e) **Gestão de Prazos, Caducidade e SLAs:** Temporizador de SLA para primeiro atendimento com mecanismo de **transbordo automático** para o próximo corretor em caso de inatividade no prazo estipulado, e regra de caducidade automática para arquivamento de leads inativos após 1 a 2 semanas sem retorno do cliente;  
f) **Dupla Modalidade Comercial (Vendas e Aluguel de Veraneio):** Catálogo de imóveis categorizado por faixas de valor, módulo de reservas por temporada com **bloqueio automático de disponibilidade** no calendário (Check-in até Check-out) e registro obrigatório do meio de pagamento utilizado (PIX, Cartão de Crédito, Débito, Boleto ou TED);  
g) **Painel do Administrador e Governança:** Dashboard gerencial com visão panorâmica de vendas, distribuição híbrida (roleta automática e reatribuição manual), governança de privacidade com máscara de contatos em leads ativos e relatório/planilha de contatos na aba de encerrados para campanhas de remarketing;  
h) **Gamificação e Ranking Comercial:** Painel de pódio em tempo real premiando os corretores mais produtivos por VGV vendido, locações de veraneio fechadas, atendimentos no SLA e visitas realizadas;  
i) **Módulo ERP (Fluxo de Caixa Integrado):** Sistema financeiro de entradas e saídas com conciliação automática vinculando fechamentos de Vendas (cruzando métricas de VGV e Valor de Avaliação) e Aluguéis de Veraneio para geração de relatórios de receitas e cálculo de ROI de marketing.

1.2. O sistema será desenvolvido de forma modular e escalável, utilizando tecnologias modernas (Next.js, Node.js, TypeScript e banco de dados MongoDB gerenciado através do Prisma ORM), permitindo a inclusão de novas funcionalidades e a expansão futura da plataforma sem a necessidade de reconstrução integral do software.

---

### CLÁUSULA SEGUNDA - DO CRONOGRAMA E PRAZOS

2.1. O prazo total estipulado para a engenharia, desenvolvimento, homologação e entrega operacional do sistema é de **2 (dois) a 3 (três) meses**, totalizando um ciclo estimado de **10 (dez) semanas de engenharia de software**, distribuído conforme o cronograma operacional abaixo:

- **Etapa 1 (Semanas 1-2):** Modelagem completa do banco de dados no Prisma ORM (MongoDB), estruturação da arquitetura do servidor Node.js/Express com TypeScript e implementação do Webhook do Meta Ads com validação Zod e rastreamento de anúncios/UTMs.
- **Etapa 2 (Semanas 3-4):** Desenvolvimento do Motor de Roleta Round-Robin, filtro de horário comercial (09h às 22h), Fila de Espera Noturna, SLA de primeiro atendimento com transbordo automático por inatividade e status do corretor "Em Visita".
- **Etapa 3 (Semanas 5-6):** Desenvolvimento do Painel Web do Corretor, botão de Check-in Diário, visualização Kanban dinâmica, ficha do lead com anexo de conversas/documentos, regras de cadastro manual e esteira de análise de crédito bancário (CLT vs. Autônomo).
- **Etapa 4 (Semanas 7-8):** Implementação da dupla modalidade: Catálogo de Imóveis por faixas de valor, módulo de Aluguel de Veraneio (temporada) com bloqueio automático de calendário de disponibilidade, inserção de meios de pagamento e Painel de Ranking/Gamificação.
- **Etapa 5 (Semanas 9-10):** Construção do Painel do Administrador com auditoria e filtros avançados, Módulo ERP de Fluxo de Caixa integrado (VGV/Avaliação e Locações), testes de carga, homologação com a equipe e deploy oficial em produção.

2.2. Eventuais atrasos motivados pelo fornecimento tardio de materiais, credenciais de acesso, definições de discovery ou aprovações pela CONTRATANTE estenderão os prazos na mesma proporção.

---

### CLÁUSULA TERCEIRA - DO INVESTIMENTO E FORMA DE PAGAMENTO

3.1. Pelo desenvolvimento integral do escopo do software contratado, a CONTRATANTE pagará à CONTRATADA o valor fixo e fechado de **R$ 7.250,00 (sete mil duzentos e cinquenta reais)**, a ser liquidado em parcela única e integral ao final do projeto:

- **Parcela Única / Pagamento Integral:** **R$ 7.250,00 (sete mil duzentos e cinquenta reais)**, correspondentes a 100% (cem por cento) do valor total contratado, devidos integralmente no momento da conclusão, entrega operacional, homologação final e deploy do sistema em produção.

3.2. O pagamento será efetuado por meio de transferência bancária ou Pix, a saber: **Pix: 85988335991**.

---

### CLÁUSULA QUARTA - DA INFRAESTRUTURA, BRINDES E SUPORTE

4.1. **INFRAESTRUTURA E HOSPEDAGEM:** A CONTRATADA orientará e configurará a infraestrutura de servidores em nuvem (VPS) e o domínio de internet da CONTRATANTE. Fica ajustado que os custos de assinatura da hospedagem VPS (mensal) e do Domínio de internet (anual) serão custeados pela CONTRATADA a título de brinde gratuito durante o período dos primeiros **12 (doze) meses** de operação do sistema. Após este prazo de brinde de 1 (um) ano, os custos de infraestrutura passarão a ser pagos diretamente aos provedores pela CONTRATANTE.

4.2. **GARANTIA E SUPORTE CONTRA BUGS:** Fica garantido o período de **90 (noventa) dias** de suporte gratuito e garantia técnica contra falhas e bugs após a data de deploy em produção do sistema. Erros de código ou desvios de regras identificados neste prazo serão corrigidos sem custos adicionais. O suporte não cobre a implementação de novas funcionalidades não listadas no objeto deste contrato.

4.3. **TITULARIDADE DOS SERVIÇOS:** Todos os serviços utilizados no projeto (domínio, VPS, hospedagem, banco de dados, contas de terceiros etc.) serão cadastrados em nome da CONTRATANTE ou terão sua titularidade integralmente transferida a ela ao final do projeto.

---

### CLÁUSULA QUINTA - DA PROPRIEDADE INTELECTUAL, ENTREGA E CONFIDENCIALIDADE

5.1. A propriedade intelectual dos códigos-fonte e da plataforma de software desenvolvida será transferida integralmente à CONTRATANTE após a quitação total e integral do valor do contrato (R$ 7.250,00).

5.2. A entrega final compreenderá todo o código-fonte, banco de dados, documentação técnica básica e credenciais necessárias para operação, manutenção e continuidade do sistema.

5.3. Antes da entrega definitiva, a CONTRATADA disponibilizará à CONTRATANTE um backup completo do sistema e do banco de dados.

5.4. Todos os dados de clientes, leads, imóveis e transações financeiras cadastrados no sistema pertencem exclusivamente à CONTRATANTE, garantindo-lhe livre acesso, exportação e utilização irrestrita dessas informações.

5.5. Ambas as partes comprometem-se a manter absoluto sigilo sobre quaisquer dados operacionais, financeiros, dados pessoais de clientes cadastrados, métodos ou estratégias de negócios revelados durante o cumprimento deste contrato, em estrita observância à Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD), sob pena de responsabilização civil e penal.

---

### CLÁUSULA SEXTA - DA RESCISÃO E MULTAS

6.1. Em caso de descumprimento de qualquer uma das cláusulas descritas neste instrumento pelo CONTRATANTE ou pela CONTRATADA, o contrato poderá ser rescindido unilateralmente, aplicando-se multa de **10% (dez por cento)** do valor total do contrato para a parte infratora.

6.2. Em caso de rescisão imotivada (sem justa causa ou sem motivo comprovado), será também aplicada multa de **10% (dez por cento)** sobre o valor total do contrato, que é de R$ 7.250,00 (sete mil duzentos e cinquenta reais), totalizando multa compensatória de **R$ 725,00 (setecentos e vinte e cinco reais)**.

---

### CLÁUSULA SÉTIMA - DO FORO

7.1. Para dirimir quaisquer questões decorrentes do presente contrato, as partes elegem o foro da Comarca de Fortaleza/CE (ou comarca de sede da CONTRATANTE), com expressa renúncia a qualquer outro, por mais privilegiado que seja ou venha a ser.

---

### CLÁUSULA OITAVA - DA ASSINATURA ELETRÔNICA GOV.BR

8.1. As partes reconhecem que este contrato é celebrado e assinado eletronicamente por meio da plataforma de assinatura digital **Gov.br**, em estrita conformidade com o Decreto Federal nº 10.543/2020 e a Medida Provisória nº 2.200-2/2001.

8.2. As assinaturas realizadas pela plataforma Gov.br possuem plena validade jurídica e eficácia executiva, equivalendo a assinaturas físicas com firma reconhecida em cartório, sendo dispensado o registro ou chancela física complementar.

---

## DECLARAÇÃO DE ACEITE E ASSINATURA ELETRÔNICA

As partes declaram estar em pleno acordo com todas as cláusulas e condições estipuladas neste instrumento particular de contrato.

<br><br>

____________________________________________________  
**CONNECT PLATZ IMOBILIÁRIA (CONTRATANTE)**  
Representante: Robson Carvalho de Sousa  
CPF: 089.613.643-40  
CNPJ: 53.758.699/0001-10  

<br><br>

____________________________________________________  
**BRENO CAMELO MESQUITA TABOSA (CONTRATADA)**  
Titular: Breno Camelo Mesquita Tabosa  
CPF: 620.834.783-12  
CNPJ: 63.376.298/0001-35  

<br><br>

### TESTEMUNHAS:

____________________________________________________  
Nome:  
CPF:  

<br><br>

____________________________________________________  
Nome:  
CPF:  
