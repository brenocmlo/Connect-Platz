import os
import subprocess
import time

CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUTPUT_DIR = "/Users/a1234/Connect-Platz/homologacao/screenshots"

os.makedirs(OUTPUT_DIR, exist_ok=True)

SCREENS = [
    {
        "name": "01_dashboard_desktop.png",
        "url": "http://localhost:3000/crm",
        "size": "1440,900",
        "desc": "Dashboard BI Executivo - Hero VGV, StatCards & Operacional (Desktop)",
    },
    {
        "name": "02_dashboard_mobile.png",
        "url": "http://localhost:3000/crm",
        "size": "440,956",
        "desc": "Dashboard BI Executivo - Responsividade Mobile",
    },
    {
        "name": "03_leads_kanban_desktop.png",
        "url": "http://localhost:3000/crm/leads",
        "size": "1440,900",
        "desc": "Funil de Vendas Kanban - Etapas, SLAs, Scores & Tags (Desktop)",
    },
    {
        "name": "04_leads_kanban_mobile.png",
        "url": "http://localhost:3000/crm/leads",
        "size": "440,956",
        "desc": "Funil Kanban Mobile - Avanço Rápido de Etapas & Dropdown Direto",
    },
    {
        "name": "05_agenda_desktop.png",
        "url": "http://localhost:3000/crm/agenda",
        "size": "1440,900",
        "desc": "Agenda Corporativa - Visitas, Documentação, Retornos & Prazos",
    },
    {
        "name": "06_vendas_desktop.png",
        "url": "http://localhost:3000/crm/vendas",
        "size": "1440,900",
        "desc": "Vendas & Comissões - Splits Determinísticos & Gestão Financeira",
    },
    {
        "name": "07_ranking_desktop.png",
        "url": "http://localhost:3000/crm/ranking",
        "size": "1440,900",
        "desc": "Ranking & Gamificação - Corretor do Mês, Pódio Animado & Metas",
    },
    {
        "name": "08_empreendimentos_desktop.png",
        "url": "http://localhost:3000/crm/empreendimentos",
        "size": "1440,900",
        "desc": "Catálogo de Empreendimentos - Vitrine de Imóveis & Espelho de Vendas",
    },
    {
        "name": "09_equipes_roleta_desktop.png",
        "url": "http://localhost:3000/crm/equipes",
        "size": "1440,900",
        "desc": "Equipes & Roleta Comercial - Fila Round-Robin & Status ao Vivo",
    },
    {
        "name": "10_fluxo_caixa_desktop.png",
        "url": "http://localhost:3000/crm/fluxo-de-caixa",
        "size": "1440,900",
        "desc": "Fluxo de Caixa & DRE - Gráficos Multi-Gradiente & Projeção 90 Dias",
    },
    {
        "name": "11_relatorios_bi_desktop.png",
        "url": "http://localhost:3000/crm/relatorios",
        "size": "1440,900",
        "desc": "Relatórios BI - Eficiência de Funil, ROI de Mídia & Exportações XLSX",
    },
    {
        "name": "12_temporada_desktop.png",
        "url": "http://localhost:3000/crm/temporada",
        "size": "1440,900",
        "desc": "Temporada & Veraneio - Reservas, Bloqueio de Calendário & Diárias",
    },
    {
        "name": "13_configuracoes_desktop.png",
        "url": "http://localhost:3000/crm/configuracoes",
        "size": "1440,900",
        "desc": "Configurações - Minha Conta, Dados da Imobiliária & Parametrização de SLAs",
    },
    {
        "name": "14_integracoes_desktop.png",
        "url": "http://localhost:3000/crm/integracoes",
        "size": "1440,900",
        "desc": "Canais & Integrações - Meta Ads, Google Ads, Portais Imobiliários & Webhooks",
    },
]

def capture():
    print(f"Iniciando captura de {len(SCREENS)} telas de homologação...")
    for idx, screen in enumerate(SCREENS, 1):
        out_path = os.path.join(OUTPUT_DIR, screen["name"])
        cmd = [
            CHROME_PATH,
            "--headless",
            "--disable-gpu",
            "--no-sandbox",
            "--hide-scrollbars",
            f"--window-size={screen['size']}",
            "--virtual-time-budget=3500",
            f"--screenshot={out_path}",
            screen["url"],
        ]
        print(f"[{idx}/{len(SCREENS)}] Capturando: {screen['desc']}...")
        try:
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=20)
            if os.path.exists(out_path):
                size_kb = os.path.getsize(out_path) / 1024
                print(f"    ✓ OK ({size_kb:.1f} KB): {screen['name']}")
            else:
                print(f"    ⚠️ Falha ao salvar: {screen['name']}")
        except Exception as e:
            print(f"    ❌ Erro ao capturar {screen['name']}: {e}")

    print("\nCaptura concluída com sucesso!")

if __name__ == "__main__":
    capture()
