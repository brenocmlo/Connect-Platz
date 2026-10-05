import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

PRIMARY = HexColor("#1266C7")
PRIMARY_DARK = HexColor("#0D478F")
PLATZ_GOLD = HexColor("#D9BB4C")
DARK_BG = HexColor("#0A0F1D")
TEXT_DARK = HexColor("#0F172A")
TEXT_MUTED = HexColor("#64748B")
BORDER_COLOR = HexColor("#E2E8F0")
SUCCESS_COLOR = HexColor("#10B981")
BG_CARD = HexColor("#F8FAFC")
WHITE = HexColor("#FFFFFF")

class NumberedCanvas(canvas.Canvas):
    """Canvas de dois passos para calcular o total de páginas dinamicamente e desenhar cabeçalho/rodapé executivo."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Capa não possui cabeçalho e rodapé padrão
        
        self.saveState()
        # Cabeçalho
        self.setStrokeColor(BORDER_COLOR)
        self.setLineWidth(0.75)
        self.line(40, A4[1] - 42, A4[0] - 40, A4[1] - 42)
        
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(PRIMARY)
        self.drawString(40, A4[1] - 36, "CONNECT PLATZ CRM")
        
        self.setFont("Helvetica", 8)
        self.setFillColor(TEXT_MUTED)
        self.drawString(145, A4[1] - 36, "•  Relatório Executivo de Homologação Final & Arquitetura")
        
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(PLATZ_GOLD)
        self.drawRightString(A4[0] - 40, A4[1] - 36, "VERSÃO 1.0.0 — PRODUÇÃO")

        # Rodapé
        self.setStrokeColor(BORDER_COLOR)
        self.setLineWidth(0.75)
        self.line(40, 42, A4[0] - 40, 42)

        self.setFont("Helvetica", 8)
        self.setFillColor(TEXT_MUTED)
        self.drawString(40, 30, "Documento Confidencial • Connect Platz Soluções Imobiliárias Ltda. • Outubro / 2026")
        
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(A4[0] - 40, 30, page_str)
        self.restoreState()


def get_pdf_styles():
    styles = getSampleStyleSheet()
    
    styles.add(ParagraphStyle(
        name="DocTitle",
        fontName="Helvetica-Bold",
        fontSize=28,
        leading=34,
        textColor=PRIMARY,
        alignment=0
    ))
    
    styles.add(ParagraphStyle(
        name="DocSubtitle",
        fontName="Helvetica",
        fontSize=13,
        leading=18,
        textColor=TEXT_MUTED,
        alignment=0
    ))
    
    styles.add(ParagraphStyle(
        name="SectionHeading",
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=20,
        textColor=PRIMARY_DARK,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name="SubSectionHeading",
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=16,
        textColor=TEXT_DARK,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name="BodyTextCustom",
        fontName="Helvetica",
        fontSize=9,
        leading=13.5,
        textColor=TEXT_DARK,
        spaceAfter=5
    ))

    styles.add(ParagraphStyle(
        name="BodyTextMuted",
        fontName="Helvetica",
        fontSize=8.5,
        leading=12.5,
        textColor=TEXT_MUTED,
        spaceAfter=4
    ))

    styles.add(ParagraphStyle(
        name="BadgeText",
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=WHITE,
        alignment=1
    ))

    styles.add(ParagraphStyle(
        name="TableHeader",
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=WHITE,
        alignment=1
    ))

    styles.add(ParagraphStyle(
        name="TableCell",
        fontName="Helvetica",
        fontSize=7.5,
        leading=10,
        textColor=TEXT_DARK
    ))

    styles.add(ParagraphStyle(
        name="TableCellCenter",
        fontName="Helvetica",
        fontSize=7.5,
        leading=10,
        textColor=TEXT_DARK,
        alignment=1
    ))

    styles.add(ParagraphStyle(
        name="TableCellBold",
        fontName="Helvetica-Bold",
        fontSize=7.5,
        leading=10,
        textColor=TEXT_DARK
    ))

    return styles
