#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dựng file .docx chuẩn (OOXML) từ Markdown của báo cáo, HỖ TRỢ NHÚNG ẢNH PNG.
Chỉ dùng thư viện chuẩn: re, os, struct, zipfile. Không cần mạng / pandoc / python-docx."""
import re, zipfile, os, struct

SRC = os.path.join(os.path.dirname(__file__), "BAO_CAO_CHUONG3.md")
OUT = os.path.join(os.path.dirname(__file__), "BAO_CAO_CHUONG3.docx")
BASE = os.path.dirname(SRC)

# ---------- XML helpers ----------
def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

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
    for i, seg in enumerate(text.split("<br>")):
        if i > 0:
            xml += "<w:r>%s<w:br/></w:r>" % rpr
        if seg:
            xml += '<w:r>%s<w:t xml:space="preserve">%s</w:t></w:r>' % (rpr, esc(seg))
    return xml

def inline_xml(text):
    return "".join(run_xml(k, t) for k, t in parse_inline(text))

def para(inner, style=None, extra=""):
    ppr = ('<w:pStyle w:val="%s"/>' % style) if style else ""
    ppr += extra
    if ppr:
        ppr = "<w:pPr>%s</w:pPr>" % ppr
    return "<w:p>%s%s</w:p>" % (ppr, inner)

SP_AFTER = '<w:spacing w:after="120" w:line="276" w:lineRule="auto"/>'

# ---------- image handling ----------
EMU_IN = 914400
EMU_PX = 9525            # 96 dpi
MAX_W_IN = 6.4
MAX_H_IN = 8.2
IMAGES = []              # list of (filename, bytes)
NEXT_RID = [3]           # rId1=styles, rId2=footer
PIC_ID = [10]            # docPr/cNvPr id

def png_size(data):
    # PNG: 8-byte sig, 4 len, 4 'IHDR', then width(4), height(4) big-endian
    w, h = struct.unpack(">II", data[16:24])
    return w, h

def image_para(rel_path, alt=""):
    path = os.path.normpath(os.path.join(BASE, rel_path))
    if not os.path.exists(path):
        return para(inline_xml("_[thiếu ảnh: %s]_" % rel_path),
                    extra=SP_AFTER)
    with open(path, "rb") as f:
        data = f.read()
    w, h = png_size(data)
    rid = NEXT_RID[0]; NEXT_RID[0] += 1
    fname = "image%d.png" % rid
    IMAGES.append((fname, data))
    pid = PIC_ID[0]; PIC_ID[0] += 1
    scale = min(MAX_W_IN * EMU_IN / (w * EMU_PX), MAX_H_IN * EMU_IN / (h * EMU_PX), 1.0)
    cx = int(w * EMU_PX * scale)
    cy = int(h * EMU_PX * scale)
    drawing = (
        '<w:r><w:drawing>'
        '<wp:inline distT="0" distB="0" distL="0" distR="0">'
        '<wp:extent cx="%d" cy="%d"/><wp:effectExtent l="0" t="0" r="0" b="0"/>'
        '<wp:docPr id="%d" name="Picture %d" descr="%s"/>'
        '<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>'
        '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
        '<pic:pic><pic:nvPicPr><pic:cNvPr id="%d" name="%s"/><pic:cNvPicPr/></pic:nvPicPr>'
        '<pic:blipFill><a:blip r:embed="rId%d"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
        '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="%d" cy="%d"/></a:xfrm>'
        '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>'
        '</pic:pic></a:graphicData></a:graphic>'
        '</wp:inline></w:drawing></w:r>'
        % (cx, cy, pid, pid, esc(alt), pid, fname, rid, cx, cy))
    return para(drawing, extra='<w:spacing w:before="120" w:after="60"/><w:jc w:val="center"/>')

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
    if header:
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
    header, aligns, body = rows[0], [align_of(c) for c in rows[1]], rows[2:]
    xml = ('<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/>%s'
           '<w:tblLayout w:type="autofit"/>'
           '<w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/>'
           '<w:left w:w="90" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tblCellMar>'
           '</w:tblPr>' % BORDERS)
    xml += '<w:tr><w:trPr><w:tblHeader/></w:trPr>%s</w:tr>' % "".join(
        cell_xml(c, header=True, align=aligns[i] if i < len(aligns) else "left")
        for i, c in enumerate(header))
    for r in body:
        xml += "<w:tr>%s</w:tr>" % "".join(
            cell_xml(c, header=False, align=aligns[i] if i < len(aligns) else "left")
            for i, c in enumerate(r))
    xml += "</w:tbl>"
    xml += para("", extra='<w:spacing w:after="120"/>')
    return xml

# ---------- code block ----------
def code_xml(lines):
    out = ""
    for ln in lines:
        inner = ('<w:r><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>'
                 '<w:color w:val="1F1F1F"/><w:sz w:val="18"/>'
                 '<w:t xml:space="preserve">%s</w:t></w:r>' % (esc(ln) if ln else ""))
        out += para(inner, extra=('<w:shd w:val="clear" w:color="auto" w:fill="F5F5F5"/>'
                                  '<w:spacing w:after="0" w:line="240" w:lineRule="auto"/>'
                                  '<w:ind w:left="120"/>'))
    out += para("", extra='<w:spacing w:after="120"/>')
    return out

def quote_xml(text):
    extra = ('<w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="9DC3E6"/></w:pBdr>'
             '<w:spacing w:before="80" w:after="120" w:line="276" w:lineRule="auto"/><w:ind w:left="220"/>')
    return para(inline_xml(text), extra=extra)

# ---------- parse markdown ----------
def build_body(md):
    lines = md.split("\n")
    body, i, n = [], 0, len(lines)
    IMG_RE = re.compile(r"^!\[(.*?)\]\((.+?)\)\s*$")
    while i < n:
        line = lines[i].rstrip("\n")
        s = line.strip()

        m = IMG_RE.match(s)
        if m:
            body.append(image_para(m.group(2), m.group(1)))
            i += 1
            continue

        if s.startswith("```"):
            lang = s[3:].strip()
            i += 1
            code = []
            while i < n and not lines[i].strip().startswith("```"):
                code.append(lines[i]); i += 1
            i += 1
            body.append(code_xml(code))
            continue

        if s.startswith("|") and i + 1 < n and re.match(r"^\s*\|?[\s:|-]+\|?\s*$", lines[i + 1]) and "-" in lines[i + 1]:
            rows = [split_row(line)]
            i += 2
            while i < n and lines[i].strip().startswith("|"):
                rows.append(split_row(lines[i])); i += 1
            body.append(table_xml(rows))
            continue

        m = re.match(r"^(#{1,6})\s+(.*)$", s)
        if m:
            style = {1: "Heading1", 2: "Heading2", 3: "Heading3"}.get(len(m.group(1)), "Heading4")
            body.append(para(inline_xml(m.group(2)), style=style))
            i += 1
            continue

        if re.match(r"^-{3,}$", s):
            body.append(para("", extra='<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="BFBFBF"/></w:pBdr><w:spacing w:after="120"/>'))
            i += 1
            continue

        if s.startswith(">"):
            body.append(quote_xml(s[1:].strip())); i += 1; continue

        m = re.match(r"^[-*]\s+(.*)$", s)
        if m:
            inner = '<w:r><w:t xml:space="preserve">•  </w:t></w:r>' + inline_xml(m.group(1))
            body.append(para(inner, extra=SP_AFTER + '<w:ind w:left="420" w:hanging="240"/>')); i += 1; continue

        m = re.match(r"^(\d+)\.\s+(.*)$", s)
        if m:
            inner = '<w:r><w:t xml:space="preserve">%s.  </w:t></w:r>' % m.group(1) + inline_xml(m.group(2))
            body.append(para(inner, extra=SP_AFTER + '<w:ind w:left="460" w:hanging="300"/>')); i += 1; continue

        if s == "":
            i += 1; continue

        body.append(para(inline_xml(s), extra=SP_AFTER)); i += 1
    return "".join(body)

# ---------- package parts ----------
def content_types():
    return ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Default Extension="png" ContentType="image/png"/>'
            '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
            '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
            '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>'
            '</Types>')

RELS = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
        '</Relationships>')

def doc_rels():
    rels = ('<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>')
    for idx, (fname, _) in enumerate(IMAGES):
        rid = 3 + idx
        rels += ('<Relationship Id="rId%d" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/%s"/>'
                 % (rid, fname))
    return ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + rels + '</Relationships>')

FOOTER = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
          '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
          '<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="0"/></w:pPr>'
          '<w:r><w:rPr><w:color w:val="808080"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Trang </w:t></w:r>'
          '<w:r><w:rPr><w:color w:val="808080"/><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r>'
          '<w:r><w:rPr><w:color w:val="808080"/><w:sz w:val="18"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>'
          '<w:r><w:rPr><w:color w:val="808080"/><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r>'
          '<w:r><w:rPr><w:color w:val="808080"/><w:sz w:val="18"/></w:rPr><w:t>1</w:t></w:r>'
          '<w:r><w:rPr><w:color w:val="808080"/><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>'
          '</w:p></w:ftr>')

def styles_xml():
    base = ('<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/>'
            '<w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/>'
            '<w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:style>')
    def heading(sid, name, sz, color, before, after):
        return ('<w:style w:type="paragraph" w:styleId="%s"><w:name w:val="%s"/>'
                '<w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>'
                '<w:pPr><w:keepNext/><w:spacing w:before="%d" w:after="%d" w:line="276" w:lineRule="auto"/><w:outlineLvl w:val="%d"/></w:pPr>'
                '<w:rPr><w:b/><w:bCs/><w:color w:val="%s"/><w:sz w:val="%d"/><w:szCs w:val="%d"/></w:rPr></w:style>'
                % (sid, name, before, after, int(sid[-1]) - 1, color, sz, sz))
    return ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            '<w:docDefaults><w:rPrDefault><w:rPr>'
            '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/>'
            '<w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:rPrDefault>'
            '<w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault>'
            '</w:docDefaults>' + base
            + heading("Heading1", "heading 1", 36, "1F4E79", 240, 120)
            + heading("Heading2", "heading 2", 30, "2E74B5", 220, 100)
            + heading("Heading3", "heading 3", 26, "2E74B5", 180, 80)
            + heading("Heading4", "heading 4", 24, "404040", 160, 60)
            + '</w:styles>')

SECTPR = ('<w:sectPr><w:footerReference w:type="default" r:id="rId2"/>'
          '<w:pgSz w:w="11906" w:h="16838"/>'
          '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" '
          'w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>')

def main():
    with open(SRC, encoding="utf-8") as f:
        md = f.read()
    body = build_body(md)
    document = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                '<w:document '
                'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
                'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
                'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" '
                'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
                'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
                '<w:body>' + body + SECTPR + '</w:body></w:document>')
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types())
        z.writestr("_rels/.rels", RELS)
        z.writestr("word/_rels/document.xml.rels", doc_rels())
        z.writestr("word/document.xml", document)
        z.writestr("word/styles.xml", styles_xml())
        z.writestr("word/footer1.xml", FOOTER)
        for fname, data in IMAGES:
            z.writestr("word/media/" + fname, data)
    print("WROTE", OUT, os.path.getsize(OUT), "bytes | images:", len(IMAGES), "| tables:", body.count("<w:tbl>"))

if __name__ == "__main__":
    main()
