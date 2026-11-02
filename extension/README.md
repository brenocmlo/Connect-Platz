# 🚀 Extensão Connect Platz CRM para WhatsApp Web

Extensão oficial para Google Chrome, Microsoft Edge, Brave e navegadores Chromium que acopla o painel operacional do **Connect Platz CRM** diretamente na interface do **WhatsApp Web** (`web.whatsapp.com`).

---

## ✨ Funcionalidades Principais

1. **Detecção Automática do Lead:** Ao clicar em qualquer conversa no WhatsApp Web, a extensão lê o número de telefone e busca instantaneamente os dados do lead no CRM via API segura.
2. **Cadastro Rápido em 1 Clique:** Caso o número ainda não seja um lead cadastrado, o corretor ou administrador pode cadastrá-lo diretamente pelo WhatsApp Web.
3. **Gestão do Funil Kanban:** Troca imediata de etapa no funil do CRM com dropdown em tempo real.
4. **Templates Oficiais de Mensagens:** Disparo com substituição inteligente de variáveis (`{primeiroNome}`, `{corretor}`, `{empreendimento}`, link do catálogo).
5. **Automação de SLA Determinística:** A primeira mensagem ou anotação enviada encerra automaticamente o relógio de SLA de primeiro contato na base do CRM.
6. **Isolamento Total com Shadow DOM:** O design system do CRM (paleta `#1266C7`, `#D9BB4C`, DM Sans) não interfere nem sofre interferência do CSS do WhatsApp Web.

---

## 👥 Comportamento Específico por Perfil de Acesso (RBAC)

A extensão adapta sua interface e ações conforme o perfil logado no Connect Platz:

* 🛡️ **`ADMINISTRADOR`:**
  - Visualiza leads de todas as modalidades (Vendas e Temporada).
  - Permite reatribuir o corretor responsável diretamente pelo select no WhatsApp.
  - Permite cadastrar leads selecionando modalidade e corretor responsável.
* 💼 **`CORRETOR_VENDA`:**
  - Acessa apenas seus próprios leads de vendas.
  - Acesso aos templates de vendas, visitas e simulação bancária.
  - Botão de ação rápida: `📝 Solicitar Fechamento ao Financeiro` (encaminha para formalização contábil).
* 🏖️ **`CORRETOR_ALUGUEL`:**
  - Acessa leads de locação e temporada.
  - Acesso aos templates de temporada e regras de check-in.
  - Botão de ação rápida: `🏖️ Registrar Reserva de Temporada` (bloqueia o calendário diretamente, sem comissão).
* 💰 **`FINANCEIRO_VENDA`:**
  - Visualiza dados comerciais de vendas (VGV, status do crédito e pendências).
  - Botão de ação rápida: `✓ Aprovar Crédito Bancário`.
* 📋 **`FINANCEIRO_ALUGUEL`:**
  - Visualiza detalhes da reserva de temporada (check-in, check-out, diárias, caução).
  - Botão de ação rápida: `✓ Confirmar Sinal / Caução` e emissão de voucher.

---

## 📦 Como Instalar a Extensão no Navegador (Modo Desenvolvedor)

1. Abra o navegador (Google Chrome ou Microsoft Edge).
2. Acesse a página de extensões digitando na barra de endereços:
   - No Chrome: `chrome://extensions`
   - No Edge: `edge://extensions`
3. Ative o botão **"Modo do desenvolvedor"** (Developer mode) no canto superior direito.
4. Clique no botão **"Carregar sem compactação"** (Load unpacked).
5. Selecione a pasta `extension/` deste projeto (`Connect-Platz/extension`).
6. Pronto! O ícone do **Connect Platz CRM** aparecerá na barra de ferramentas do navegador.

---

## 🔑 Como Utilizar no Dia a Dia

1. Abra o [WhatsApp Web](https://web.whatsapp.com).
2. A barra lateral do **Connect Platz** aparecerá no lado direito da tela.
3. Se for o primeiro acesso:
   - Digite a URL do seu CRM (ex: `http://localhost:3000` em desenvolvimento ou `https://seu-dominio.com.br` em produção).
   - Informe seu e-mail e senha do Connect Platz.
4. Clique em qualquer conversa no WhatsApp Web:
   - Se o lead já existir: veja os dados, etapa, score e templates.
   - Se o contato for novo: cadastre-o com 1 clique.
5. Para ocultar temporariamente a barra lateral e ter tela cheia no WhatsApp, clique no botão lateral `›`.
