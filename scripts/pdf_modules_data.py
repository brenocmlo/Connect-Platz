MODULES_DATA = [
    {
        "num": "01",
        "title": "Dashboard BI Executivo (Desktop & Mobile)",
        "images": ["01_dashboard_desktop.png", "02_dashboard_mobile.png"],
        "is_dual": True,
        "category": "Painel de Controle & BI",
        "description": (
            "Painel central consolidado com visão holística do desempenho comercial da imobiliária. "
            "Implementado com fidelidade visual ao padrão Habitus CRM, integrando Hero VGV de alto impacto, "
            "StatCards dinâmicos com interpolação numérica (Count-Up) e gráficos de vendas mensais com Recharts."
        ),
        "highlights": [
            "Hero VGV com card azul sólido (#1266C7), sparkline translúcida e badge de tendência percentual.",
            "5 StatCards principais (Total Vendas, Comissão Recebida, Ticket Médio, Comissões Pagas e Pendentes).",
            "Métricas Operacionais (Análise de Docs, Visitas Agendadas/Realizadas, Corretores Ativos).",
            "Gráficos Recharts com tooltips customizados no padrão card e paleta sofisticada.",
            "Feed de Atividades Recentes e Painel de Compromissos do Dia com marcação temporal.",
            "Responsividade mobile 100% fluida com scroll adaptativo e empilhamento harmônico."
        ],
        "verdict": "APROVADO — Performance fluida, sem oscilação visual e interpolação numérica precisa."
    },
    {
        "num": "02",
        "title": "Funil de Vendas Kanban & Gestão de Leads",
        "images": ["03_leads_kanban_desktop.png", "04_leads_kanban_mobile.png"],
        "is_dual": True,
        "category": "Gestão Comercial & Pipeline",
        "description": (
            "Pipeline de oportunidades em colunas Kanban fluidas. Inclui marcadores cromáticos por etapa, "
            "badges de classificação térmica com score visual (Quente, Morno, Frio com score de 0 a 100), alertas de SLA "
            "com pulso de atenção e gaveta completa de detalhes do lead com registro de abordagem multicanal."
        ),
        "highlights": [
            "Drag & Drop suave com elevação de card, sombra projetada e feedback toast discreto.",
            "Mobile com seletor direto de avanço de etapa, eliminando atrito de arraste em telas touch.",
            "Card completo com avatar de corretor, oportunidade estimada, contatos rápidos e tags.",
            "Gaveta Lateral com Abordagem Multicanal (WhatsApp, Ligação, Visita, Email, Anotação).",
            "Gestor de Anexos Completo com upload multi-arquivos, preview, download e slots de documentos.",
            "Filtro Dinâmico de Período (Hoje, 7D, Mês Atual, 30D, Ano, Todos) sincronizado no cabeçalho.",
            "Links diretos de WhatsApp via 'wa.me' sem embutir clientes de mensagens não oficiais."
        ],
        "verdict": "APROVADO — Drag & Drop, avanço mobile, anexos interativos e filtros temporais validados."
    },
    {
        "num": "03",
        "title": "Agenda Corporativa & Gestão de Visitas",
        "images": ["05_agenda_desktop.png"],
        "is_dual": False,
        "category": "Operacional & Relacionamento",
        "description": (
            "Centralização da rotina de visitas, reuniões, entregas de documentação e prazos contratuais. "
            "Oferece visualizações em Dia, Semana e Mês com marcação cromática por categoria de evento."
        ),
        "highlights": [
            "Vistas flexíveis (Dia / Semana / Mês) com navegação rápida de datas.",
            "Cards de eventos com borda esquerda de 3px indicando o tipo (Visita, Doc, Retorno, Proposta).",
            "Integração bidirecional com a ficha do Lead e dados do Empreendimento.",
            "Avisos automáticos de status e confirmação de presença do cliente."
        ],
        "verdict": "APROVADO — Marcação temporal precisa e sincronização imediata com os leads."
    },
    {
        "num": "04",
        "title": "Vendas & Comissões (Splits Determinísticos)",
        "images": ["06_vendas_desktop.png"],
        "is_dual": False,
        "category": "Financeiro & Comissionamento",
        "description": (
            "Módulo de liquidação e rateio de vendas imobiliárias. Sistema 100% determinístico com suporte "
            "a splits complexos entre múltiplos corretores, gerentes, captadores e sócios da imobiliária."
        ),
        "highlights": [
            "Cálculos determinísticos sem margem de erro ou dependência de regras probabilísticas.",
            "Novo Fechamento: seleção de Empreendimentos cadastrados com auto-preenchimento da Construtora e VGV.",
            "Aba de Anexos de Venda para upload de minutas contratuais, escrituras e comprovantes de rateio.",
            "Filtro Interativo de Período (Hoje, 7D, Mês, 30D, Ano, Todos) com atualização reativa de StatCards.",
            "Divisão transparente de comissão: Corretor 1, Corretor 2, Gerência, Captação e Imobiliária.",
            "Tabela com busca, paginação e filtros em Sheet lateral."
        ],
        "verdict": "APROVADO — Auto-preenchimento de construtora, anexos contratuais e splits 100% validados."
    },
    {
        "num": "05",
        "title": "Ranking, Gamificação & Metas Comerciais",
        "images": ["07_ranking_desktop.png"],
        "is_dual": False,
        "category": "Gamificação & Equipe",
        "description": (
            "Ambiente de incentivo comercial com pódio animado dos líderes de vendas, coroa dourada do "
            "Corretor do Mês com anel luminoso (#D9BB4C), metas de equipe cadastradas diretamente pelo Administrador "
            "e barras de progresso visual com comemoração festiva."
        ),
        "highlights": [
            "Gestão Direta pelo Administrador: botão 'Ajustar Meta (ADM)' para cadastro e edição em tempo real.",
            "Destaque do 1º colocado com 'AnimatedCrown', aura dourada e indicadores de performance.",
            "Métricas de destaque: Mais Leads, Mais Visitas, Mais Documentações e Maior Taxa de Conversão.",
            "Painel de Metas com barra de progresso espessa, prêmio configurável e persistência local ativa.",
            "Filtros de visualização por período (Anual, Mensal, Semanal) e cargo."
        ],
        "verdict": "APROVADO — Gestão de metas pelo ADM funcional e animações de gamificação validadas."
    },
    {
        "num": "06",
        "title": "Catálogo de Empreendimentos & Vitrine",
        "images": ["08_empreendimentos_desktop.png"],
        "is_dual": False,
        "category": "Portfólio de Imóveis",
        "description": (
            "Catálogo multimídia de lançamentos, imóveis prontos e em obras. Inclui fichas técnicas completas, "
            "galeria de fotos, espelho de unidades e botão de compartilhamento rápido com clientes via WhatsApp."
        ),
        "highlights": [
            "Cards de alta densidade visual com badges sobrepostos (Lançamento, Pronto, Em Obras).",
            "Preços formatados em negrito com destaque em azul primário (#1266C7).",
            "Filtros por tipo, construtora, faixa de preço, quartos e localização.",
            "Modal de compartilhamento que gera link e abre diretamente conversa via wa.me."
        ],
        "verdict": "APROVADO — Renderização de cards rica e responsiva, compartilhamento fluido."
    },
    {
        "num": "07",
        "title": "Equipes & Roleta Comercial (Round-Robin)",
        "images": ["09_equipes_roleta_desktop.png"],
        "is_dual": False,
        "category": "Gestão de Força de Vendas",
        "description": (
            "Distribuição automatizada e justa de novos leads recebidos. Fila Round-Robin com verificação de status "
            "ao vivo dos corretores (Online, Ocupado, Pausa) e registro de auditoria transparente de distribuição."
        ),
        "highlights": [
            "Algoritmo determinístico de rodízio que garante paridade absoluta na entrega de oportunidades.",
            "Simulador de distribuição ao vivo com fila visual de corretores aptos.",
            "Acesso 100% restrito a Administradores e Gerentes (bloqueado para Corretores via RBAC).",
            "Histórico completo com registro de data/hora de atribuição de cada lead."
        ],
        "verdict": "APROVADO — Distribuição equilibrada e isolamento restrito de permissões RBAC."
    },
    {
        "num": "08",
        "title": "Fluxo de Caixa, DRE & Projeção 90 Dias",
        "images": ["10_fluxo_caixa_desktop.png"],
        "is_dual": False,
        "category": "Controladoria & Finanças",
        "description": (
            "Gestão contábil e orçamentária da imobiliária com extrato de contas operacionais em tempo real. "
            "Inclui conciliação antecipada com opção de confirmar entradas e saídas de dinheiro antes da data "
            "prevista de vencimento, gráfico Recharts multi-gradiente com projeção de 90 dias e DRE gerencial."
        ),
        "highlights": [
            "Liquidação Antecipada: botões 'Confirmar Entrada' e 'Confirmar Saída' para quitações antes do vencimento.",
            "Modal com data efetiva, meio de liquidação (PIX, TED, etc.) e recalculo imediato do saldo em caixa.",
            "Projeção futura de liquidez considerando recebimentos de parcelas e comissões programadas.",
            "Gráfico de áreas translúcidas com gradientes individuais para entradas, saídas e saldo.",
            "Quadro DRE analítico com receitas operacionais brutas, deduções, custos e lucro líquido.",
            "Acesso estritamente bloqueado para Corretores; visível apenas para Diretoria e Gestão."
        ],
        "verdict": "APROVADO — Confirmação de valores antecipados validada e conciliação em tempo real."
    },
    {
        "num": "09",
        "title": "Relatórios BI & Inteligência de Negócio",
        "images": ["11_relatorios_bi_desktop.png"],
        "is_dual": False,
        "category": "Análise Estratégica",
        "description": (
            "Métricas aprofundadas de conversão de funil, tempo médio de primeiro atendimento (SLA), "
            "origem de leads (Meta Ads, Google, Portais, Orgânico) e exportação em planilhas para auditoria."
        ),
        "highlights": [
            "Gráficos de barras horizontais detalhando a retenção e drop-off entre etapas de vendas.",
            "Análise de performance por canal de captação e eficiência de retorno sobre investimento.",
            "Exportação em conformidade com normas LGPD e anonimização de dados sensíveis.",
            "Filtros temporais por período customizado."
        ],
        "verdict": "APROVADO — Consolidação analítica ágil e exportação limpa de dados."
    },
    {
        "num": "10",
        "title": "Temporada & Gestão de Veraneio",
        "images": ["12_temporada_desktop.png"],
        "is_dual": False,
        "category": "Locação de Curto Prazo",
        "description": (
            "Controle de locação por temporada em imóveis litorâneos e de lazer. Calendário de reservas, "
            "bloqueios de datas, checklist de vistoria e controle de diárias e taxas de limpeza."
        ),
        "highlights": [
            "Calendário interativo de ocupação com identificação de períodos bloqueados e locados.",
            "Controle de caução, diárias médias e recibos de check-in / check-out.",
            "Cálculo automático de comissionamento de locação de temporada."
        ],
        "verdict": "APROVADO — Interface de calendário intuitiva e gestão de diárias funcional."
    },
    {
        "num": "11",
        "title": "Configurações, Segurança & Parametrização de SLAs",
        "images": ["13_configuracoes_desktop.png"],
        "is_dual": False,
        "category": "Administração & Políticas",
        "description": (
            "Centro de configurações do CRM estruturado com isolamento estrito por RBAC. Corretores têm "
            "acesso exclusivo à aba 'Minha Conta'. As abas 'Dados da Imobiliária' e 'Parametrização de SLAs' "
            "são restritas a administradores. O menu lateral não exibe item 'Administração' redundante."
        ),
        "highlights": [
            "Barreira de segurança RBAC verificada no front-end e nas rotas de API do backend.",
            "Interface de Configurações limpa: botões de olho, exportação e filtro de datas removidos do topo.",
            "Configuração de SLAs em minutos com alertas visuais e pulso na tela de Leads.",
            "Configurações gerais da empresa (CNPJ, CRECI PJ, endereço, cores do site vitrine).",
            "Eliminação definitiva do link 'Administração' no menu lateral global."
        ],
        "verdict": "APROVADO — Cabeçalho limpo, isolamento por papéis (RBAC) 100% blindado e navegação higienizada."
    },
    {
        "num": "12",
        "title": "Canais, Webhooks & Integrações",
        "images": ["14_integracoes_desktop.png"],
        "is_dual": False,
        "category": "Conectividade & Ingestão",
        "description": (
            "Hub de conexões para ingestão contínua de oportunidades comerciais provenientes de campanhas "
            "no Meta Ads (Facebook/Instagram), Google Ads, portais imobiliários (ZAP, VivaReal) e Webhooks REST."
        ),
        "highlights": [
            "Cards de status de integração (Ativo, Pendente, Erro) com tokens e chaves mascaradas.",
            "Ingestão automatizada de leads que entram diretamente na Roleta Comercial de distribuição.",
            "Webhooks padronizados com validação de payload JSON e assinatura de integridade.",
            "Painel exclusivo para Gestão e TI (bloqueado para Corretores)."
        ],
        "verdict": "APROVADO — Conectores operacionais com rotas de API resilientes e seguras."
    }
]
