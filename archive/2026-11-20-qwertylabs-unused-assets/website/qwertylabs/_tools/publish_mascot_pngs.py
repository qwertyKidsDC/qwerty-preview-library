"""Create pixel-preserving transparent mascot PNGs from approved checked-in art.

One-off publishing script; never edits originals or site layout.
"""
from __future__ import annotations
import base64
import io
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path("website/qwertylabs/img")
DEST = ROOT / "mascot-ready"
DEST.mkdir(parents=True, exist_ok=True)


def embedded_svg_image(filename: str) -> Image.Image:
    root = ET.parse(ROOT / filename).getroot()
    node = next(iter(root))
    src = node.attrib.get("href") or node.attrib.get("{http://www.w3.org/1999/xlink}href")
    match = re.match(r"data:image/[^;]+;base64,(.*)", src or "")
    if not match:
        raise RuntimeError(f"Missing embedded image in {filename}")
    return Image.open(io.BytesIO(base64.b64decode(match.group(1)))).convert("RGBA")


def rocket_with_transparency() -> Image.Image:
    image = Image.open(ROOT / "mascot-rocket-trio.webp").convert("RGBA")
    root = ET.parse(ROOT / "MS01-R01-C04-clean.svg").getroot()
    path = next(x.attrib["d"] for x in root.iter() if x.tag.endswith("path"))
    # Mask is the hand-audited outline of original MS01 row 1 column 4,
    # preserving its interior holes instead of treating the background as part of the mascot.
    mask = Image.new("L", image.size, 0)
    draw = ImageDraw.Draw(mask)
    groups = re.findall(r"M([^Z]+)Z", path)
    for i, g in enumerate(groups):
        pts = [tuple(map(int, z.split(","))) for z in g.strip().split()]
        draw.polygon(pts, fill=255 if i == 0 else 0)
    mask = mask.filter(ImageFilter.GaussianBlur(0.27))
    image.putalpha(mask)
    return image.resize((image.width * 4, image.height * 4), Image.Resampling.LANCZOS)


def tight_png(image: Image.Image, code: str, src: str) -> dict:
    image = image.convert("RGBA")
    alpha = image.getchannel("A")
    mask = alpha.point(lambda v: 255 if v >= 8 else 0)
    bbox = mask.getbbox()
    if not bbox:
        raise ValueError(f"{code}: no visible pixels")
    image = image.crop(bbox)
    pad = max(10, round(max(image.size) * 0.015))
    output = Image.new("RGBA", (image.width + 2*pad, image.height + 2*pad), (0,0,0,0))
    output.alpha_composite(image, (pad,pad))
    out = DEST / f"{code}-transparent.png"
    output.save(out, "PNG", optimize=True, compress_level=9)
    check = Image.open(out).convert("RGBA")
    corners = [(0,0),(0,check.height-1),(check.width-1,0),(check.width-1,check.height-1)]
    assert all(check.getpixel(pos)[3] == 0 for pos in corners)
    return {"id":code,"asset":out.name,"source":src,"width":check.width,"height":check.height,
            "source_bounds":list(bbox),"fully_transparent_corners":True,"bytes":out.stat().st_size}


items = [
    ("WEB-LED-TRIO-001", embedded_svg_image("mascot-making-led-crisp.svg"), "mascot-making-led-crisp.svg"),
    ("WEB-KIDS-HERO-001", Image.open(ROOT / "kidsHero.png"), "kidsHero.png"),
    ("MS05-R06-C04", embedded_svg_image("d1-country-lounging.svg").resize((440,440), Image.Resampling.LANCZOS), "d1-country-lounging.svg"),
    ("MS01-R05-C03", Image.open(ROOT / "kidsFooter.png"), "kidsFooter.png"),
    ("MS01-R01-C04", rocket_with_transparency(), "mascot-rocket-trio.webp + MS01-R01-C04-clean.svg"),
]
manifest = [tight_png(im, code, src) for code, im, src in items]
(DEST / "manifest.json").write_text(json.dumps(manifest, indent=2)+"\n", encoding="utf-8")
print(json.dumps(manifest, indent=2))
