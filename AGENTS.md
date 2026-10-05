# Diretrizes e Regras Permanentes do Projeto — Connect Platz CRM

## 📌 REGRA DE OURO: FIDELIDADE VISUAL E ANIMAÇÕES (INSPIRAÇÃO HABITUS CRM)

> **MANDATÓRIO / NÃO NEGOCIÁVEL:**  
> Todas as telas, componentes, micro-interações, fluxos visuais e animações deste CRM **devem ser estritamente inspirados e visualmente muito parecidos com o Habitus CRM**.  
> Qualquer nova tela, refatoração de UI ou componente criado deve seguir com rigor os padrões estéticos, de movimento e de usabilidade definidos nesta regra.

---

### 1. Padrões de Animação e Movimento (Motion System)

1. **Entrada de Elementos e Transições de Página:**
   - Efeito de subida suave (`fadeInUp`) em cards, seções e tabelas utilizando `framer-motion` ou classes de transição Tailwind (`duration-300`, `ease-out`).
   - Evitar transições bruscas de tela; modais e sheets devem utilizar animação de deslizamento suave (slide-in / slide-out) do Radix UI / Shadcn UI.
   - Accordions e menus expansíveis com animações fluidas (`data-[state=open]:animate-accordion-down`, `data-[state=closed]:animate-accordion-up`).

2. **Números e Métricas Vivas (Count-Up):**
   - Todos os StatCards da Dashboard, VGV Total, comissões, saldo de fluxo de caixa e contadores de leads devem utilizar animação de crescimento gradual (**Count-Up** / interpolação numérica) ao carregar a página ou alterar filtros de período.

3. **Kanban e Drag & Drop Fluído:**
   - O movimento de arrastar cards de leads entre etapas do funil deve ser suave e responsivo, com sombra projetada (`shadow-xl`), leve rotação/elevação (`rotate-1` ou `scale-[1.02]`) enquanto estiver sendo arrastado e transição suave ao soltar no slot de destino.
   - Suporte nativo a eventos de toque (touch) em mobile sem atraso perceptível.

4. **Gamificação e Pódio Animado:**
   - Na tela de **Ranking**, o pódio do 1º, 2º e 3º lugar deve conter coroas e troféus animados (`AnimatedCrown`), brilhos sutis e badges destacados.
   - Notificações de batimento de meta com disparos comemorativos visuais e feedback visual marcante.

5. **Pulsos e Timers Regressivos de SLA:**
   - Badges de SLA próximo de vencer ou vencidos devem apresentar animação sutil de pulso de atenção (`animate-pulse` suave) para direcionar o foco do corretor e gestor para os casos críticos.

6. **Micro-interações em Botões e Cards:**
   - Botões principais com leve expansão no hover (`scale-[1.02]` ou `hover:scale-105`), sombras luminosas (`shadow-lg shadow-primary/20 hover:shadow-primary/30`).
   - Cards com borda que se ilumina suavemente no hover (`hover:border-primary/40 transition-colors`).

---

### 2. Padrões Visuais e Identidade de Interface (UI System)

1. **Design Moderno SaaS (Shadcn UI + Radix UI + Tailwind CSS):**
   - Utilização obrigatória de componentes primitivos acessíveis do Radix UI estilizados com Tailwind CSS.
   - Ícones padronizados: **Lucide Icons** em tamanhos consistentes (16px para itens de tabela/botões pequenos, 20px para menus e cards).

2. **Raios de Borda Arredondados e Elegantes:**
   - Elementos de formulário e botões: `rounded-lg` (`0.5rem`).
   - Cards, tabelas e contêineres: `rounded-xl` (`0.75rem`) a `rounded-2xl` (`1rem`).
   - Badges, pills de status e tags de leads: `rounded-full` (`9999px`).

3. **Tipografia:**
   - Fonte primária: `DM Sans` ou Sans-Serif moderna equivalente de excelente legibilidade em telas de alta densidade.
   - Rótulos em caixa alta com tracking suave (`text-xs font-semibold tracking-wider text-muted-foreground`).

4. **Suporte Consistente a Dark Mode e Light Mode:**
   - **Dark Mode:** Fundos profundos e elegantes (`#080C14` / `#0A0A0A`), cartões em cinza escuro acetinado (`#121212` / `#161B26`), bordas sutis (`#242C3D` / `#27272A`).
   - **Light Mode:** Fundos limpos (`#F8FAFC` / `#FFFFFF`), cartões brancos com sombras limpas e bordas suaves (`#E2E8F0`).

5. **Gráficos e BI no Estilo Habitus:**
   - Gráficos construídos com **Recharts**, com eixos discretos, tooltips customizados estilizados no padrão card, e paleta cromática sofisticada (tons de roxo elétrico, azul marinho, dourado e esmeralda).
   - Rosca de regiões mais vendidas particionada em gradientes suaves.
   - Gráfico de linha de evolução de captação de leads com área preenchida em gradiente translúcido (`LinearGradient` de opacidade 0.3 a 0).

6. **Badges de Classificação e Score:**
   - Badges com emojis e estilo idêntico ao Habitus:
     - 🧊 `Lead Frio` (azul translúcido / borda azul suave)
     - ☕ `Lead Morno` (âmbar translúcido / borda âmbar suave)
     - 🔥 `Lead Quente` (laranja/vermelho translúcido com destaque de prioridade)

---

### 3. Diretrizes de Escopo

- ❌ **Sem WhatsApp Integrado:** Manter botões e links diretos para WhatsApp Web / App (`https://wa.me/55...`), sem embutir cliente não oficial de mensagens.
- ❌ **Sem Inteligência Artificial Externa:** Regras de negócio, cálculos de SLA, roleta e scores devem ser 100% determinísticos.
- ❌ **Sem Treinamentos e Assinatura:** Não devem existir itens de menu, abas ou telas para "Treinamentos" e "Assinatura" no CRM.
- 🔒 **Restrição Rígida de Acesso do Corretor (RBAC) & Menu Lateral:**
  - **Menu Lateral sem "Administração":** O item "Administração" NÃO deve constar no menu lateral (pois seus ajustes estão centralizados no painel de Configurações para gestores).
  - **Corretor sem Acesso à Gestão/Administração:** Corretores têm acesso estritamente à sua conta/perfil profissional em Configurações ("Minha Conta"). As abas de dados corporativos da imobiliária e parametrização de SLAs, bem como os módulos de Fluxo de Caixa, DRE, Equipes e Integrações, são 100% bloqueados para o cargo `CORRETOR`.
- 📱 **Responsividade Mobile Obrigatória & PWA (Progressive Web App):**
  - O sistema DEVE ser 100% responsivo para smartphones e tablets, com grid fluido, Drawer lateral/inferior e navegação adaptada para toque.
  - O sistema implementará suporte a **PWA** (`manifest.json`, standalone display, meta tags para iOS/Android e Service Worker) permitindo instalação direta na tela inicial como app nativo.

---

### 4. Diretrizes de Engenharia, Modularidade e Manutenibilidade de Código

> **MANDATÓRIO / NÃO NEGOCIÁVEL:**  
> 1. **Reutilização e Componentização Obrigatória:** Todo código deve ser altamente modular, desacoplado e componentizado. Telas e views não devem concentrar lógicas monolíticas; componentes de UI, modais, drawers, formulários e cards devem ser divididos em componentes reutilizáveis.
> 2. **Limite Máximo de Linhas por Arquivo (350 a 400 linhas):** Nenhum arquivo, script, página ou componente deve ultrapassar o limite estrito de **350 a 400 linhas de código**.  
>    - Qualquer arquivo extenso deve ser refatorado e decomposto em sub-componentes especializados (ex.: em `components/crm/...`), hooks customizados e serviços utilitários para garantir facilidade de manutenção e leitura.


---

### 5. Especificações Visuais e de Telas Extraídas do Habitus CRM (Vídeo Oficial e Web)

> **Fonte:** vídeo oficial `https://youtu.be/eYJVevoOBtU` (210 s, 244 quadros-chave extraídos com o CRV — Claude Real Video) + CSS de produção de `https://habituscrm.com.br` (`/assets/index-*.css`), coletados em 30/09/2026.
> **Regra de cor:** o Habitus usa roxo elétrico como cor primária. **No Connect Platz mantemos o NOSSO esquema de cores** — onde o Habitus usa roxo, usamos `connect-blue` (`#1266C7`); onde usa dourado/âmbar de destaque (coroa, 1º lugar, metas), usamos `platz-gold` (`#D9BB4C` / `#F8DA56`). Copiamos **estrutura, hierarquia, espaçamento, motion e comportamento**, nunca a paleta roxa.
> As seções 1–4 continuam valendo integralmente: sem cliente de WhatsApp embutido (só links `wa.me`), sem IA externa, máximo de 350–400 linhas por arquivo.

#### 5.1 Tokens de Design (Habitus → Connect Platz)

| Token (shadcn HSL) | Habitus Light | Habitus Dark | **Connect Platz (usar)** |
|---|---|---|---|
| `--primary` / `--ring` / `--sidebar-primary` | `268 100% 41%` (≈ `#6300D1`) | igual | `#1266C7` (connect-blue) |
| `--primary-dark` | `268 100% 30%` | igual | `#0D478F` (connect-deep-blue) |
| `--primary-light` / `--primary-lighter` | `268 90% 50%` / `268 80% 60%` | igual | `#1266C7` a 85% / 70% de luminosidade (tints de connect-blue) |
| `--secondary` / `--accent` | `270 75% 60%` / `280 70% 65%` | igual | `platz-gold` `#D9BB4C` / `#F8DA56` (apenas destaques) |
| `--background` | `0 0% 100%` | `0 0% 3.9%` (`#0A0A0A`) | Light `#F8FAFC`/`#FFFFFF` · Dark `#080C14` |
| `--card` | `0 0% 100%` | `0 0% 3.9%` | Light `#FFFFFF` · Dark `#111827`/`#121212` |
| `--muted` / `--muted-foreground` | `210 40% 96%` / `215 16% 47%` | `0 0% 12%` / `0 0% 80%` | Light `#F1F5F9`/`#64748B` · Dark `#1F2937`/`#94A3B8` |
| `--border` / `--input` | `214 32% 91%` (`#E2E8F0`) | `240 3.7% 15.9%` (`#27272A`) | Light `#E2E8F0` · Dark `#1F2937`/`#242C3D` |
| `--success` | `142 71% 45%` | igual | `#22C55E` (emerald) |
| `--destructive` | `0 84% 60%` | `0 63% 31%` | idem Habitus |
| `--sidebar-accent` (item hover) | `276 20% 96%` | `0 0% 16%` | tint de connect-blue `bg-connect-blue/10` |
| `--radius` | `0.5rem` | — | `0.75rem` (mantemos o nosso; botões/inputs `rounded-lg`) |
| Fonte | **DM Sans** (`DM Sans, system-ui, sans-serif`) | — | **DM Sans** |
| Easing | `cubic-bezier(.4,0,.2,1)` (padrão) e `cubic-bezier(0,0,.2,1)` (entrada) | — | idem |

#### 5.2 Shell da Aplicação (Layout Global)

- **Sidebar esquerda** com dois estados: **expandida** (~150 px: logo + rótulos, item ativo = pílula sólida primária com texto branco, badge `Novidade` em pílula ao lado de "Agenda") e **recolhida** (~54 px: só ícones Lucide 20 px, item ativo = quadrado `rounded-lg` sólido primário). Botão `‹ / ›` de recolher na borda direita da sidebar, no topo.
- Ordem dos itens: Dashboard · Leads · Agenda · WhatsApp (link externo) · Vendas e Comissões · Fluxo de Caixa · Empreendimentos · Ranking · Relatórios BI · Equipe · Integrações · Configurações. (12 itens oficiais).
- Rodapé da sidebar: avatar circular do usuário (nome + cargo, ex.: "CEO") e botão de logout.
- **Topbar** mínima, sem título: à direita, toggle de tema (☀/☾) e sino de notificações com badge vermelho `99+` (`rounded-full`, texto 9–10 px).
- **Cabeçalho de página:** título `text-2xl font-bold` à esquerda; ações à direita: botão-ícone olho (ocultar valores monetários), seletor de período `📅 Todos / Mês atual` (botão outline), ícone exportar, e CTA primário sólido `+ Novo …`.
- **Títulos de seção** com barra vertical primária de 3 px à esquerda (`border-l-[3px] border-primary pl-2 font-semibold`), ex.: "▌Resumo Financeiro", "▌Operacional", "▌Performance de Leads".
- **FAB** circular primário fixo no canto inferior direito (~40 px, ícone de ajuda/chat) em todas as telas.
- **Tabs internas** (ex.: Funil Kanban | Campanhas | Bolsão | Estatísticas) no estilo shadcn `TabsList` cinza claro `bg-muted rounded-lg`, aba ativa em card branco com sombra sutil.

#### 5.3 Dashboard (BI)

1. **Hero VGV Total** (≈ 50% da largura): card sólido na cor primária, `rounded-xl`, ícone `$` em círculo translúcido branco/20, rótulo `VGV TOTAL` uppercase, valor grande abreviado (`R$ 35M 396k`), subtítulo "Soma das vendas do período", badge `↗ +100%` (pílula branca/20) no canto superior direito e **sparkline de linha clara desenhada sobre o próprio fundo** (área sem preenchimento).
2. **Card Fluxo de Caixa** ao lado: valor principal + duas linhas menores `↗ R$ entradas` (verde) e `↘ R$ saídas` (vermelho).
3. **Linha de 5 StatCards**: Total de Vendas · Comissão Recebida · Ticket Médio VGV · Comissões Pagas · Comissões Pendentes. Anatomia: ícone em círculo tint primário (32 px, `bg-primary/10 text-primary`), badge de tendência pílula verde `↗ +100%` no canto superior direito (vermelha quando negativa), rótulo uppercase `text-[11px] tracking-wider text-muted-foreground`, valor `text-xl font-bold`, legenda cinza. O primeiro card pode ter mini-sparkline.
4. **Operacional** (3 cards): Análise de Docs · Visitas (com sub-métricas "Agendadas | Realizadas") · Corretores Ativos. **Performance de Leads** (2 cards): Leads Captados ("Leads do dia: **8**") · Taxa de Conversão.
5. **Vendas Mensais**: gráfico de linha (Recharts) com pontos, eixo de meses `jan…dez`, toggle segmentado `Anual | Mensal | Semanal` (ativo = pílula primária sólida).
6. **Funil de Vendas**: barras horizontais por etapa com gradiente primário, rótulo da etapa à esquerda, pílula com % de conversão à direita e marcador colorido por etapa; navegação `‹ Funil 1 ›` + ícone ⓘ.
7. **Leads Quentes**: lista ranqueada (`1º…6º` em círculo cinza), nome + pílula de status (`NOVO`, `ATENDIMENTO`), meta "Corretor · há 6 meses", badge 🔥 `97/100` + legenda "Potencial Alto", botão WhatsApp (ícone verde em círculo — link `wa.me`) e seta `→`; paginação "Página 1 de 2 (12 leads)"; botão "Ver todos".
8. **Compromissos**: timeline vertical com bolinhas coloridas, pílula de tipo (`Lembrete` cinza, `Visita` azul), data/hora, badge `Finalizado` verde, título, cliente e responsável com avatar; toggle `Dia | Semanal | 15 Dias`.
9. **Performance da Equipe**: ranking com avatar, nome, contagem e VGV à direita; toggles `Anual | Mensal | Semanal` + `Corretores | Gerentes | Equipes`. **Atividades Recentes**: feed "Compromisso realizado", "Lead editado", "Lead removido do bolsão" com carimbo relativo à direita ("há 10 minutos").

#### 5.4 Leads — Funil Kanban

- **Header:** toggle de visualização `Kanban | Lista` (ativo = pílula tint primário), filtro de período, importar/exportar e CTA `+ Novo Lead`. Abaixo: seletor `Funil 1 ▾` e `Membros`.
- **Faixa de 6 StatCards compactos:** Total de Leads · Leads Ativos · Vendas · Taxa de Conversão · Novos Leads · No Bolsão.
- **Busca** full-width ("Busque por nome, e-mail ou telefone…") + botão `Filtros` (abre Sheet lateral direito).
- **Colunas:** cabeçalho = bolinha colorida da etapa (cor configurável por etapa — azul-marinho, preto, magenta, lilás, amarelo, azul…), nome da etapa, contador em pílula cinza à direita. Primeira coluna com paginação interna `‹ 1–25 de 979 ›`. Cada coluna tem scroll vertical próprio; o board tem scroll horizontal.
- **Anatomia do card** (fundo branco, `rounded-xl`, borda sutil, padding ~12 px):
  1. Avatar circular com iniciais (fundo primário sólido, texto branco) + **nome em negrito truncado com reticências** + tempo relativo ("há 12 minutos") + menu `⋮`.
  2. Linhas de meta com ícones Lucide 12–14 px cinza: ✉ e-mail · ☎ telefone · ▮ Renda R$ … · "Oportunidade: **A partir de R$ 250.000,00**" (valor em negrito escuro) · 📣 Campanha · 🏢 Empreendimento + cidade · 📅 "Captado em: dd/mm/aaaa".
  3. **Ações rápidas** alinhadas à direita da linha do telefone: ícone telefone (primário) e ícone WhatsApp (verde, link `wa.me/55…`).
  4. **Tags (pílulas `rounded-md` sólidas, texto branco 11 px):** nome do corretor responsável (primário), `Cliente Quente` (laranja), `Follow-up/Sem Resposta` (magenta), `Potencial` (azul), `Urgente` (vermelho), `Cliente reagendou`; e **origem** em pílula neutra/texto (`WhatsApp`, `Orgânico`, `Landing Page`, `Meta Ads`, `Catálogo`, `Formulário Externo`, `Outros`).
  5. **Badge de score** pílula translúcida: 🔥 `80/100` (vermelho/laranja — quente), ☕ `60/100` (âmbar — morno), 🧊 `39/100` (azul — frio). No Connect Platz usar os emojis da seção 2.6.
  6. Rodapé opcional: 🔔 "Compromissos (1)".
- **Menu de contexto do card (`⋮`)**: Ver Detalhes · Editar · Etiquetas ▸ · Mudar corretor · Avançar Etapa · Adicionar lembrete · Agendar visita · Mudar funil · Mover para Bolsão · **Excluir** (vermelho). Item em hover = fundo primário sólido + texto branco.
- **Submenu Etiquetas**: lista com bolinha colorida, ✓ nas aplicadas, ícones ✏️ editar e 🗑 excluir por linha, e campo "Adicionar nova etiqueta".
- **Drag & Drop:** card arrastado ganha borda primária + sombra elevada, o slot de origem fica como "fantasma" translúcido; ao soltar, toast discreto no canto inferior direito "**Lead atualizado com sucesso!**".

#### 5.5 Detalhes do Lead (Drawer) e Editar Lead (Modal)

- **Drawer lateral direito** (~400 px, overlay escurecido `bg-black/60`, slide-in da direita), rolável, seções com cabeçalho ícone + título semibold:
  Oportunidades (empreendimento + "A partir de R$ …") · Empreendimento de Interesse · Renda declarada · **Score do Lead** (badge) · Campanha (Campanha / Anúncio) · Observações (texto itálico cinza quando vazio) · **Compromissos agendados** (cards com pílula de tipo `Lembrete`/`Documentação`/`Retorno / Follow-up`, 🕒 data/hora; follow-up com fundo âmbar claro) · **Anexos** (empty state com ícone de documento) · **Datas Importantes** (Captação / Última atualização alinhadas à direita) · **Histórico**.
- **Timeline "Histórico"**: itens com avatar do sistema/usuário, título semibold ("Status do lead alterado", "Lead criado"), descrição ("Status do lead 'Ana Paula' alterado de 'novo' para 'atendimento'"), "Por: Fulano" e timestamp à direita (`dd/mm/aaaa às hh:mm`). Ordem: mais recente no topo.
- **Modal "Editar Lead"** (Dialog central ~450 px, `rounded-xl`, scroll interno, ✕ circular): seletor de funil no topo-direito; bloco com avatar do **Corretor/Gerente Responsável** + select `Status/Etapa *`; Tabs `Informações do Lead | Documentos`; grid de 2 colunas — Tipo de pessoa, CPF, Nome*, Telefone, Email, RG, Data de Nascimento, Estado Civil, Nome da Mãe/Pai, Profissão; depois Endereço, Origem, Empreendimento de interesse (chips), Renda declarada/informal, Data de fechamento prevista, Captação (Campanha/Formulário/Anúncio), Observações, Compromissos agendados (`+ Adicionar`). Aba **Documentos**: grid de slots de upload (RG, CPF, Comprovante de Renda, Certidão de Estado Civil, FGTS, IRPF…) com ícone ⬆ e limite "Máximo 10 MB". Rodapé fixo: `Cancelar` (ghost) + `Salvar Alterações` (primário).
- **Modal "Novo compromisso"**: Tipo (select com bolinha colorida: Visita, Lembrete, Documentação, Retorno/Follow-up, Proposta/Apresentação) · Título auto-preenchido ("Visita — Cliente — Empreendimento") · Descrição · Cliente/Lead (combobox com busca) · Data (date picker) · Início/Fim · Empreendimento · Endereço/Local · Link · E-mail + checkbox "Notificar cliente por e-mail". Rodapé `Cancelar` / `Criar`.

#### 5.6 Empreendimentos (Catálogo de Imóveis)

- Header: filtro período, botão tint `🌐 Ver meu Site` e CTA `+ Novo Empreendimento`. Tabs `Lista de Empreendimentos | Configurações Site`.
- 4 StatCards: Total de Empreendimentos · Empreendimentos Ativos · Construtoras Cadastradas · VGV Total.
- **Grid 3 colunas de cards de produto:** imagem de capa ~16:9 (`rounded-t-xl`; placeholder = gradiente tint primário com ícone de prédio), botão `⋮` quadrado primário no canto superior esquerdo da imagem, **pílulas de status sobre a imagem no canto superior direito** (`Ativo` primário, `Novos`, `Pronto para Morar` azul, `Lançamento` verde, `Em Obras` âmbar, `Vendido` laranja, `Usados`). Corpo: nome em negrito, construtora, Ref, tipo (🏢 Apartamento / Casa em Condomínio), 📍 bairro/cidade, 💲 "A partir de **R$ 250.000,00**" (valor em cor primária), Renda ideal, ícones de quartos/banheiros/vagas. Rodapé: `👁 Ver Detalhes` + ícone compartilhar.
- **Modal "Compartilhar Empreendimento"**: Link Público do Catálogo (input mono + botão copiar) · "Ou envie via WhatsApp" (input telefone com foco em anel primário) · callout azul "Importante…" · `Cancelar` / `Enviar`. No Connect Platz o "Enviar" **abre `https://wa.me/55<número>?text=<link>`** — sem envio integrado.
- **Página pública do imóvel/catálogo** (tema escuro): header com logo da imobiliária + botão WhatsApp verde; galeria à esquerda, título, pílulas de status, preço grande na cor primária, ficha (tipo, vagas), mapa embutido, "Sobre o Empreendimento", CTAs `Quero receber contato` (primário) e `Falar no WhatsApp` (verde), compartilhar (Facebook, X, LinkedIn, WhatsApp, Copiar link). **Site vitrine**: hero com foto + "Encontre o imóvel dos seus sonhos!", barra de busca (Estado, Cidade, Bairro, Tipo, Classificação, Quartos, Banheiros, Vagas) e grid de cards escuros com `Contato` / `Detalhes →`.
- **Configurações Site**: sub-tabs Geral · Aparência (presets de tema em cards + color pickers de cor primária/secundária/hero) · Quem Sou Eu · CTA · Contato · Pixel Facebook · Legal; switches shadcn (`Site Público Ativo`) e botão `Salvar Alterações` à direita.

#### 5.7 Agenda

- Header "Agenda" + data por extenso; toggle `Dia | Semana | Mês` (pílula primária); filtro "Todos os tipos ▾"; navegação `‹ Hoje ›`; CTA `+ Novo`.
- **Mês**: grade de calendário com eventos como barras coloridas compactas. **Semana**: colunas por dia com cards empilhados. **Dia**: lista de cards full-width com **borda esquerda de 3 px na cor do tipo** e fundo tint da mesma cor (Visita = azul, Documentação = índigo, Retorno/Follow-up = âmbar, Proposta/Apresentação = rosa/vermelho, Lembrete = cinza), pílula do tipo + faixa horária, título semibold, cliente, responsável com avatar e status.

#### 5.8 Vendas e Comissões

- 5 StatCards (VGV Total, Total de Vendas, Comissão Recebida, Comissões Pagas, Comissões Pendentes) + tabs `Vendas Mensais | Comissões | Agenda de Vencimentos | Pendências Colaboradores | Estatísticas`.
- **Tabela**: contador "82 vendas", seletor "50 por página", paginação `‹ 1/2 ›`; colunas Data (+ "Cód. 86" abaixo) · Cliente · Empreendimento (+ construtora) · VGV (**verde**) · Imposto ("R$ 528,00 (6%)") · Próx. Pagamento · Corretor (avatar + nome; rótulos "CORRETOR 1/2" quando dividido) · Gerente · Gestor · Captador · Comissão Corretor (cor primária) · Ações `⋯` (Ver detalhes, Ver recibo, Editar pagamento). Linhas em hover com fundo tint primário.
- **Modal "Nova Venda"** com tabs `Dados e Financeiro | Resumo e Cálculos | Anexos`: dados da venda e base de cálculo, combobox de cliente/empreendimento, bloco por participante (Corretor 1, `+ Adicionar Segundo Corretor`, Gerente, Sócio/Gestor, Captador) com tipo de comissão (%), desconto e bônus. **Resumo e Cálculos** mostra valores calculados em cards tint ("Comissão Corretor Final R$ 5.560,00", "Receita da Imobiliária") — cálculo 100% determinístico.
- **Filtros** em **Sheet lateral direito**: selects Corretores, Gerentes, Captadores, Gestores, Equipe, Construtoras, VGV mín/máx, Código da venda, Status, Ordenar por; rodapé `Fechar` / `Ver resultados`.

#### 5.9 Ranking e Gamificação

- Bloco **Metas e Incentivos**: card com imagem do prêmio, badge `Meta Habitus` → no nosso caso `Meta Connect Platz`, descrição da meta, card tint "OBJETIVO: 2 Vendas", período de validade, e card **"Seu Progresso"** com barra de progresso grossa e "0 / 2 vendas".
- **Card "Corretor do Mês"** (fundo com gradiente tint suave): coroa dourada animada acima do avatar, avatar circular com **anel dourado brilhante**, pílula `1º Lugar` dourada, nome grande, subtítulo, mini-cards tint (VGV, Vendas, Visitas, Documentações, Captações, Compromissos). Select `Corretor ▾` no canto.
- Grid 3×2 de destaques: Mais Leads · Mais Visitas · Mais Documentações · Mais Captações · Melhor Taxa · Mais Compromissos (ícone tint + rótulo uppercase + nome grande + métrica).
- Tabs `Ranking Corretores | Ranking Gerentes | Ranking Equipes`; lista: **1º lugar com borda superior dourada, fundo creme e coroa**; 2º/3º com medalhas prata/bronze; demais com "4º"; cada linha: avatar, nome, "R$ … · VGV" (cor primária), documentos, vendas, captações, visitas, compromissos.

#### 5.10 Integrações

- Grid 2 colunas de cards-acordeão: logo + nome + pílula de status (`Conectado` verde, `Disponível`, `Plugin Oficial`, `Avançado`) + descrição + chevron. Expandido: info da conexão, sub-tabs (Integração / Leads em tempo real / Instruções), callout âmbar de ação pendente, radios de regras, switch "Recebendo leads automaticamente", botão primário full-width, e ações `Sincronizar agora` / `Reconectar` / `Desconectar integração` (vermelho).
- Itens vistos: Meta Ads, Google Ads, Grupo OLX (OLX/Zap/Viva Real), Dream Casa, Chaves na Mão, Landing Page (WordPress), API & Webhooks. ⚠️ O Habitus mostra integração de WhatsApp via QR Code — **NÃO replicar** (regra 3: apenas links `wa.me`).

#### 5.11 Motion e Micro-interações (capturadas)

| Elemento | Comportamento observado | Implementação de referência |
|---|---|---|
| Entrada de seções/cards | sobe e aparece | `@keyframes fadeInUp { 0% {opacity:0; transform:translateY(20px)} to {opacity:1; transform:none} }` · `.7s ease-out forwards` |
| Fade simples | overlays e conteúdo de tabs | `fadeIn .7s ease-out` |
| Transição de página/tela no vídeo | wipe com blur de movimento | usar `fadeInUp` curto (300 ms) — não replicar o wipe |
| Coroa do 1º lugar | flutua e balança | `crown-float`: `translateY(0) rotate(-3deg)` ↔ `translateY(-6px) rotate(3deg)`, `2.4s ease-in-out infinite` |
| Halo da coroa | brilho pulsante | `crown-glow`: opacity `.45→.9`, `scale(1→1.15)`, `2.4s infinite` |
| Brilhos da coroa | faíscas | `crown-sparkle`: opacity `0→1→0`, `scale(.4→1→.6)`, `1.8s infinite` |
| Modais (Dialog) | fade + zoom-in leve com overlay `bg-black/60` | `data-[state=open]:animate-in fade-in-0 zoom-in-95` |
| Drawer / Sheet de filtros | slide da direita | `slide-in-from-right` / `slide-out-to-right` (Radix) |
| Menus de contexto | aparecem ancorados, item ativo preenchido | `animate-in fade-in-0 zoom-in-95`, hover `bg-primary text-primary-foreground` |
| Drag de card | borda primária + sombra + ghost na origem | ver seção 1.3 |
| Feedback de ação | toast inferior direito "Lead atualizado com sucesso!" | Sonner/Toast shadcn |
| Inputs em foco | anel primário 2 px | `focus-visible:ring-2 ring-primary` |
| Ocultar valores | ícone 👁 mascara todos os valores monetários (`••••`) | estado global em contexto |
| Alternância de tema | troca instantânea light ↔ dark preservando layout; hero VGV mantém a cor primária sólida nos dois temas | `darkMode: "class"` |
| Carregamento | spinner circular centralizado + skeletons nos StatCards | `animate-spin` / `animate-pulse` |
| Easing padrão | — | `cubic-bezier(.4,0,.2,1)`; entradas `cubic-bezier(0,0,.2,1)` |

#### 5.12 Checklist de Conformidade para Novas Telas

- [ ] Cabeçalho de página no padrão 5.2 (título + ações à direita + CTA `+ Novo …`).
- [ ] StatCards com ícone tint, badge de tendência, rótulo uppercase e Count-Up.
- [ ] Títulos de seção com barra vertical de 3 px na cor primária (connect-blue).
- [ ] Filtros em Sheet lateral direito; formulários longos em Dialog com tabs e rodapé fixo.
- [ ] Pílulas/badges `rounded-full` (ou `rounded-md` para tags de lead) com cores semânticas.
- [ ] Ações de WhatsApp **somente** via `https://wa.me/55…`.
- [ ] Light e Dark testados; cores primárias = connect-blue / platz-gold (nunca roxo).
- [ ] Arquivo ≤ 350–400 linhas; extrair subcomponentes em `components/crm/<tela>/`.

---

### 6. Diretrizes de Testes e Validação

> **REGRA PERMANENTE DE TESTES:**  
> - ⚠️ **Os testes (testes automatizados, capturas em navegador/screenshots, scripts de teste) são feitos APENAS no final do roadmap ou quando expressamente solicitados pelo usuário.**  
> - Durante o avanço das fases do roadmap, focar diretamente na implementação, arquitetura, compilação (`npm run build`) e limite de linhas, sem executar rotinas pesadas de testes ou captura de screenshots intermediárias a menos que solicitado.

