import io
from datetime import date
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ORANGE = colors.HexColor("#FA5D19")
INK = colors.HexColor("#111111")
GREY = colors.HexColor("#666666")

_base = getSampleStyleSheet()["Normal"]
BODY = ParagraphStyle("body", parent=_base, fontName="Helvetica", fontSize=10, leading=14, textColor=INK)
SMALL = ParagraphStyle("small", parent=BODY, fontSize=8.5, leading=11, textColor=GREY)
LABEL = ParagraphStyle("label", parent=BODY, fontName="Helvetica-Bold", fontSize=8.5, textColor=GREY)
H1 = ParagraphStyle("h1", parent=BODY, fontName="Helvetica-Bold", fontSize=22, leading=26)
BRAND = ParagraphStyle("brand", parent=BODY, fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=ORANGE)

FOOTER = "Savitha Engineering  |  +91 8044464594  |  info@savithaeng.com"


def _p(text, style=BODY):
    # Customer-entered text must never be interpreted as markup.
    return Paragraph(escape(str(text or "")).replace("\n", "<br/>"), style)


def _footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GREY)
    canvas.drawString(20 * mm, 12 * mm, FOOTER)
    canvas.drawRightString(A4[0] - 20 * mm, 12 * mm, f"Page {doc.page}")
    canvas.restoreState()


def build_quote_pdf(quote: dict, terms: dict, products: list[dict]) -> bytes:
    """quote: id, full_name, company; terms: base_price, lead_time, payment_terms, notes;
    products: [{"sku", "name"}] for the requested items."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                            topMargin=18 * mm, bottomMargin=22 * mm,
                            title=f"Quotation {quote['id']}", author="Savitha Engineering")
    width = A4[0] - 40 * mm - 12  # fit inside the frame's default 6pt side padding
    story = [Paragraph("SAVITHA ENGINEERING", BRAND), Spacer(1, 4 * mm), Paragraph("QUOTATION", H1), Spacer(1, 6 * mm)]

    meta = Table([[_p("QUOTE NO.", LABEL), _p("DATE", LABEL)],
                  [_p(f"SE-Q-{quote['id']}"), _p(date.today().strftime("%d %b %Y"))]], colWidths=[width / 2] * 2)
    to = Table([[_p("PREPARED FOR", LABEL)], [_p(quote.get("full_name"))], [_p(quote.get("company"))]], colWidths=[width])
    for t in (meta, to):
        t.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0), ("TOPPADDING", (0, 0), (-1, -1), 1),
                               ("BOTTOMPADDING", (0, 0), (-1, -1), 1)]))
    story += [meta, Spacer(1, 5 * mm), to, Spacer(1, 7 * mm)]

    if products:
        rows = [[_p("ITEM", LABEL), _p("PRODUCT", LABEL), _p("REF.", LABEL)]]
        rows += [[_p(i), _p(p.get("name") or p["sku"]), _p(p["sku"], SMALL)] for i, p in enumerate(products, 1)]
        story += [Paragraph("REQUESTED PRODUCTS", LABEL), Spacer(1, 2 * mm)]
        pt = Table(rows, colWidths=[16 * mm, width - 56 * mm, 40 * mm], repeatRows=1)
        pt.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, 0), 1, INK), ("LINEBELOW", (0, 1), (-1, -1), 0.25, colors.lightgrey),
                                ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 2)]))
        story += [pt, Spacer(1, 7 * mm)]

    story += [Paragraph("COMMERCIAL TERMS", LABEL), Spacer(1, 2 * mm)]
    tt = Table([[_p("Price", LABEL), _p(terms["base_price"])],
                [_p("Lead time", LABEL), _p(terms["lead_time"])],
                [_p("Payment terms", LABEL), _p(terms["payment_terms"])]], colWidths=[35 * mm, width - 35 * mm])
    tt.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.25, colors.lightgrey), ("VALIGN", (0, 0), (-1, -1), "TOP"),
                            ("LEFTPADDING", (0, 0), (-1, -1), 2), ("TOPPADDING", (0, 0), (-1, -1), 4),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
    story += [tt]

    if (terms.get("notes") or "").strip():
        story += [Spacer(1, 7 * mm), Paragraph("NOTES AND EXCLUSIONS", LABEL), Spacer(1, 2 * mm), _p(terms["notes"])]

    doc.build(story, onFirstPage=_footer, onLaterPages=_footer)
    return buf.getvalue()
