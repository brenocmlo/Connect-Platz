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

---

### 4. Diretrizes de Engenharia, Modularidade e Manutenibilidade de Código

> **MANDATÓRIO / NÃO NEGOCIÁVEL:**  
> 1. **Reutilização e Componentização Obrigatória:** Todo código deve ser altamente modular, desacoplado e componentizado. Telas e views não devem concentrar lógicas monolíticas; componentes de UI, modais, drawers, formulários e cards devem ser divididos em componentes reutilizáveis.
> 2. **Limite Máximo de Linhas por Arquivo (350 a 400 linhas):** Nenhum arquivo, script, página ou componente deve ultrapassar o limite estrito de **350 a 400 linhas de código**.  
>    - Qualquer arquivo extenso deve ser refatorado e decomposto em sub-componentes especializados (ex.: em `components/crm/...`), hooks customizados e serviços utilitários para garantir facilidade de manutenção e leitura.

