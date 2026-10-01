#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dựng file .docx chuẩn (OOXML) từ Markdown của báo cáo Chương 3.
Chỉ dùng thư viện chuẩn: re, zipfile. Không cần mạng / pandoc / python-docx."""
import re, zipfile, os, sys

SRC = os.path.join(os.path.dirname(__file__), "BAO_CAO_CHUONG3.md")
OUT = os.path.join(os.path.dirname(__file__), "BAO_CAO_CHUONG3.docx")

# ---------- XML helpers ----------
def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
def esc_attr(s):
    return esc(s).replace('"', "&quot;")

# ---------- inline (bold / italic / code / <br>) ----------
INLINE_RE = re.compile(r"(\*\*.+?\*\*|`[^`]+`|\*[^*\n]+?\*)")
def parse_inline(text):
    out = []
    for part in INLINE_RE.split(text):
        if not part:
            continue
        if part.startswith("**") and part.endswith("**") and len(part) > 4:
            out.append(("b", part[2:-2]))
        elif part.startswith("`") and part.endswith("`") and len(part) > 2:
            out.append(("code", part[1:-1]))
        elif part.startswith("*") and part.endswith("*") and len(part) > 2:
            out.append(("i", part[1:-1]))
        else:
            out.append(("n", part))
    return out

def run_xml(kind, text):
    if kind == "b":
        rpr = "<w:b/><w:bCs/>"
    elif kind == "i":
        rpr = "<w:i/><w:iCs/>"
    elif kind == "code":
        rpr = ('<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>'
               '<w:shd w:val="clear" w:color="auto" w:fill="F0F0F0"/>')
    else:
        rpr = ""
    xml = ""
    segs = text.split("<br>")
    for i, seg in enumerate(segs):
        if i > 0:
            xml += "<w:r>%s<w:br/></w:r>" % rpr
        if seg:
            xml += '<w:r>%s<w:t xml:space="preserve">%s</w:t></w:r>' % (rpr, esc(seg))
    return xml

def inline_xml(text):
    return "".join(run_xml(k, t) for k, t in parse_inline(text))

def para(inner, style=None, extra=""):
    ppr = ""
    if style:
        ppr += '<w:pStyle w:val="%s"/>' % style
    ppr += extra
    if ppr:
        ppr = "<w:pPr>%s</w:pPr>" % ppr
    return "<w:p>%s%s</w:p>" % (ppr, inner)

SP_AFTER = '<w:spacing w:after="120" w:line="276" w:lineRule="auto"/>'

# ---------- table ----------
def split_row(line):
    line = line.strip()
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|"):
        line = line[:-1]
    return [c.strip() for c in line.split("|")]

BORDERS = ('<w:tblBorders>'
           '<w:top w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>'
           '<w:left w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>'
           '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>'
           '<w:right w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>'
           '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>'
           '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>'
           '</w:tblBorders>')

def cell_xml(text, header=False, align="left"):
    jc = '<w:jc w:val="%s"/>' % align
    shd = '<w:shd w:val="clear" w:color="auto" w:fill="DCE6F1"/>' if header else ""
    # header cell -> force bold
    if header:
        # strip markdown bold markers so we don't double them; render plain bold
        t = text.replace("**", "")
        inner = '<w:r><w:b/><w:bCs/><w:t xml:space="preserve">%s</w:t></w:r>' % esc(t)
    else:
        inner = inline_xml(text)
    ppr = ('<w:pPr>%s<w:spacing w:before="40" w:after="40" w:line="252" w:lineRule="auto"/>%s</w:pPr>'
           % (shd, jc))
    return '<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/>%s<w:vAlign w:val="center"/></w:tcPr>%s</w:tc>' % (
        shd, para(inner, extra=ppr))

def align_of(sep):
    sep = sep.strip()
    if sep.startswith(":") and sep.endswith(":"):
        return "center"
    if sep.endswith(":"):
        return "right"
    return "left"

def table_xml(rows):
    header = rows[0]
    aligns = [align_of(c) for c in rows[1]]
    body = rows[2:]
    xml = ('<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/>%s'
           '<w:tblLayout w:type="autofit"/>'
           '<w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/>'
           '<w:left w:w="90" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tblCellMar>'
           '</w:tblPr>' % BORDERS)
    # header row (repeat on each page)
    tr = '<w:tr><w:trPr><w:tblHeader/></w:trPr>%s</w:tr>' % "".join(
        cell_xml(c, header=True, align=aligns[i] if i < len(aligns) else "left")
        for i, c in enumerate(header))
    xml += tr
    for r in body:
        cells = "".join(
            cell_xml(c, header=False, align=aligns[i] if i < len(aligns) else "left")
            for i, c in enumerate(r))
        xml += "<w:tr>%s</w:tr>" % cells
    xml += "</w:tbl>"
    # small spacer after table
    xml += para("", extra='<w:spacing w:after="120"/>')
    return xml

# ---------- code block ----------
def code_xml(lines):
    out = ""
    for ln in lines:
        inner = ('<w:r><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>'
                 '<w:color w:val="1F1F1F"/><w:sz w:val="17"/>'
                 '<w:t xml:space="preserve">%s</w:t></w:r>' % (esc(ln) if ln else ""))
        out += para(inner, extra=('<w:shd w:val="clear" w:color="auto" w:fill="F5F5F5"/>'
                                  '<w:spacing w:after="0" w:line="240" w:lineRule="auto"/>'
                                  '<w:ind w:left="120"/>'))
    out += para("", extra='<w:spacing w:after="120"/>')
    return out

# ---------- blockquote ----------
def quote_xml(text):
    inner = inline_xml(text)
    extra = ('<w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="9DC3E6"/></w:pBdr>'
             '<w:spacing w:before="80" w:after="120" w:line="276" w:lineRule="auto"/><w:ind w:left="220"/>')
    # italic-ish gray for note
    body = '<w:r><w:i/><w:iCs/><w:color w:val="404040"/>%s</w:r>' % ""
    return para(inner, extra=extra)

# ---------- parse markdown ----------
def build_body(md):
    lines = md.split("\n")
    body = []
    i = 0
    n = len(lines)
    while i < n:
        raw = lines[i]
        line = raw.rstrip("\n")
        stripped = line.strip()

        # fenced code block
        if stripped.startswith("```"):
            lang = stripped[3:].strip()
            i += 1
            code = []
            while i < n and not lines[i].strip().startswith("```"):
                code.append(lines[i])
                i += 1
            i += 1  # skip closing fence
            if lang == "mermaid":
                body.append(para('<w:r><w:i/><w:color w:val="7F7F7F"/><w:t xml:space="preserve">▸ Sơ đồ Mermaid (mã nguồn — dán vào mermaid.live để xem hình):</w:t></w:r>',
                                 extra='<w:spacing w:before="80" w:after="40"/>'))
            body.append(code_xml(code))
            continue

        # table
        if stripped.startswith("|") and i + 1 < n and re.match(r"^\s*\|?[\s:|-]+\|?\s*$", lines[i + 1]) and "-" in lines[i + 1]:
            rows = [split_row(line)]
            i += 2  # skip header + separator
            while i < n and lines[i].strip().startswith("|"):
                rows.append(split_row(lines[i]))
                i += 1
            body.append(table_xml(rows))
            continue

        # heading
        m = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if m:
            level = len(m.group(1))
            text = m.group(2)
            style = {1: "Heading1", 2: "Heading2", 3: "Heading3"}.get(level, "Heading4")
            body.append(para(inline_xml(text), style=style))
            i += 1
            continue

        # horizontal rule
        if re.match(r"^-{3,}$", stripped):
            body.append(para("", extra='<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="BFBFBF"/></w:pBdr><w:spacing w:after="120"/>'))
            i += 1
            continue

        # blockquote
        if stripped.startswith(">"):
            qtext = stripped[1:].strip()
            body.append(quote_xml(qtext))
            i += 1
            continue

        # bullet list
        m = re.match(r"^[-*]\s+(.*)$", stripped)
        if m:
            txt = m.group(1)
            inner = '<w:r><w:t xml:space="preserve">•  </w:t></w:r>' + inline_xml(txt)
            body.append(para(inner, extra=SP_AFTER + '<w:ind w:left="420" w:hanging="240"/>'))
            i += 1
            continue

        # ordered list
        m = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if m:
            num, txt = m.group(1), m.group(2)
            inner = '<w:r><w:t xml:space="preserve">%s.  </w:t></w:r>' % num + inline_xml(txt)
            body.append(para(inner, extra=SP_AFTER + '<w:ind w:left="460" w:hanging="300"/>'))
            i += 1
            continue

        # blank
        if stripped == "":
            i += 1
            continue

        # normal paragraph
        body.append(para(inline_xml(stripped), extra=SP_AFTER))
        i += 1
    return "".join(body)

# ---------- package parts ----------
CONTENT_TYPES = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>'''

RELS = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>'''

DOC_RELS = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>'''

FOOTER = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="0"/></w:pPr>
<w:r><w:rPr><w:color w:val="808080"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Trang </w:t></w:r>
<w:r><w:rPr><w:color w:val="808080"/><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r>
<w:r><w:rPr><w:color w:val="808080"/><w:sz w:val="18"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>
<w:r><w:rPr><w:color w:val="808080"/><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r>
<w:r><w:rPr><w:color w:val="808080"/><w:sz w:val="18"/></w:rPr><w:t>1</w:t></w:r>
<w:r><w:rPr><w:color w:val="808080"/><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>
</w:p></w:ftr>'''

def styles_xml():
    base = ('<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/>'
            '<w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/>'
            '<w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:style>')
    def heading(sid, name, sz, color, before, after, bold=True):
        b = "<w:b/><w:bCs/>" if bold else ""
        return ('<w:style w:type="paragraph" w:styleId="%s"><w:name w:val="%s"/>'
                '<w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>'
                '<w:pPr><w:keepNext/><w:spacing w:before="%d" w:after="%d" w:line="276" w:lineRule="auto"/><w:outlineLvl w:val="%d"/></w:pPr>'
                '<w:rPr>%s<w:color w:val="%s"/><w:sz w:val="%d"/><w:szCs w:val="%d"/></w:rPr></w:style>'
                % (sid, name, before, after, int(sid[-1]) - 1, b, color, sz, sz))
    h1 = heading("Heading1", "heading 1", 36, "1F4E79", 240, 120)
    h2 = heading("Heading2", "heading 2", 30, "2E74B5", 220, 100)
    h3 = heading("Heading3", "heading 3", 26, "2E74B5", 180, 80)
    h4 = heading("Heading4", "heading 4", 24, "404040", 160, 60)
    return ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            '<w:docDefaults><w:rPrDefault><w:rPr>'
            '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/>'
            '<w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:rPrDefault>'
            '<w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault>'
            '</w:docDefaults>' + base + h1 + h2 + h3 + h4 + '</w:styles>')

SECTPR = ('<w:sectPr><w:footerReference w:type="default" r:id="rId2" '
          'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>'
          '<w:pgSz w:w="11906" w:h="16838"/>'
          '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" '
          'w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>')

def main():
    with open(SRC, encoding="utf-8") as f:
        md = f.read()
    body = build_body(md)
    document = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
                'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
                '<w:body>' + body + SECTPR + '</w:body></w:document>')
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", CONTENT_TYPES)
        z.writestr("_rels/.rels", RELS)
        z.writestr("word/_rels/document.xml.rels", DOC_RELS)
        z.writestr("word/document.xml", document)
        z.writestr("word/styles.xml", styles_xml())
        z.writestr("word/footer1.xml", FOOTER)
    print("WROTE", OUT, os.path.getsize(OUT), "bytes")

if __name__ == "__main__":
    main()
