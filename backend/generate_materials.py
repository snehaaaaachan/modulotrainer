"""
Generates one reading PDF per module into backend/materials/<slug>-<index>.pdf

Usage:
    pip install reportlab
    python3 generate_materials.py
"""
import json
import os
from xml.sax.saxutils import escape

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem, HRFlowable, Preformatted
)

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(HERE, "materials-data.json")
OUT_DIR = os.path.join(HERE, "materials")

INK = HexColor("#16241F")
MUTED = HexColor("#6E7D75")
FOREST = HexColor("#2F6F4E")
CODE_BG = HexColor("#F1F3EE")

styles = getSampleStyleSheet()
domain_style = ParagraphStyle("domain", parent=styles["Normal"], textColor=FOREST, fontSize=10, spaceAfter=4, fontName="Helvetica-Bold")
title_style = ParagraphStyle("title", parent=styles["Title"], textColor=INK, fontSize=21, leading=25, spaceAfter=4)
meta_style = ParagraphStyle("meta", parent=styles["Normal"], textColor=MUTED, fontSize=10, spaceAfter=16)
h2_style = ParagraphStyle("h2", parent=styles["Heading2"], textColor=INK, fontSize=13, spaceBefore=14, spaceAfter=7)
body_style = ParagraphStyle("body", parent=styles["Normal"], textColor=INK, fontSize=10.3, leading=15)
bullet_style = ParagraphStyle("bullet", parent=styles["Normal"], textColor=INK, fontSize=10.3, leading=14.5)
check_style = ParagraphStyle("check", parent=styles["Normal"], textColor=INK, fontSize=10.3, leading=15, fontName="Helvetica-Oblique")
code_style = ParagraphStyle("code", parent=styles["Code"], fontSize=8.7, leading=12, textColor=INK, backColor=CODE_BG, borderPadding=8)
link_style = ParagraphStyle("link", parent=styles["Normal"], textColor=INK, fontSize=10.3, leading=15)


def para(text):
    """Escape plain text but allow a few hand-written emphasis markers to pass as reportlab XML tags."""
    escaped = escape(text)
    escaped = escaped.replace("*", "")  # drop simple markdown emphasis markers, keep prose clean
    return escaped


def build_pdf(course, module, index, path):
    doc = SimpleDocTemplate(
        path, pagesize=LETTER,
        topMargin=0.85 * inch, bottomMargin=0.85 * inch,
        leftMargin=0.9 * inch, rightMargin=0.9 * inch,
        title=f"{course['title']} — {module['title']}",
    )
    story = []

    story.append(Paragraph(para(f"{course['domain'].upper()} · MODULE {index + 1}"), domain_style))
    story.append(Paragraph(para(module["title"]), title_style))
    story.append(Paragraph(
        f"Part of <b>{para(course['title'])}</b> &nbsp;\u00b7&nbsp; Estimated time: {para(module['time'])}",
        meta_style,
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=HexColor("#D3DBD1"), spaceAfter=14))

    intro = module.get("intro") or module.get("body")
    story.append(Paragraph("Introduction", h2_style))
    story.append(Paragraph(para(intro), body_style))

    core = module.get("core")
    if core:
        story.append(Paragraph("Core ideas", h2_style))
        items = [ListItem(Paragraph(para(t), bullet_style), leftIndent=12) for t in core]
        story.append(ListFlowable(items, bulletType="bullet", start="circle"))

    example = module.get("example")
    if example:
        story.append(Paragraph("Example", h2_style))
        story.append(Preformatted(example, code_style))

    exercise = module.get("exercise") or module.get("check")
    if exercise:
        story.append(Paragraph("Try it yourself", h2_style))
        story.append(Paragraph(para(exercise), check_style))

    links = module.get("links")
    if links:
        story.append(Paragraph("Further reading", h2_style))
        for link in links:
            story.append(Paragraph(
                f'&#8226; <link href="{escape(link["url"])}" color="#2F6F4E">{para(link["title"])}</link>',
                link_style,
            ))
            story.append(Paragraph(f'<font size="8" color="#6E7D75">{escape(link["url"])}</font>', meta_style))

    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=0.75, color=HexColor("#D3DBD1"), spaceAfter=8))
    story.append(Paragraph("ModuloTrainer reading material — return to the app to mark this module complete.", meta_style))

    doc.build(story)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(DATA_FILE) as f:
        courses = json.load(f)

    count = 0
    for course in courses:
        for index, module in enumerate(course["modules"]):
            filename = f"{course['slug']}-{index}.pdf"
            path = os.path.join(OUT_DIR, filename)
            build_pdf(course, module, index, path)
            count += 1
            print("Generated", filename)

    print(f"\nDone — {count} PDFs written to {OUT_DIR}")


if __name__ == "__main__":
    main()
