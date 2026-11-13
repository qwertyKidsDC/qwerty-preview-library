"""Build lightweight WebP versions of approved Kids tool frames without altering originals."""
from pathlib import Path
from PIL import Image, ImageChops

BASE = Path(__file__).resolve().parents[1]
IMAGES = BASE / "img"
HTML = BASE / "kids.html"
FRAMES = (
    "CodeyRocky-frame-fixed",
    "GameGo-frame-fixed",
    "Microbit-frame-fixed",
    "RaspberryPi5-frame-fixed",
)

content = HTML.read_text(encoding="utf-8")
for stem in FRAMES:
    source = IMAGES / (stem + ".png")
    target = IMAGES / (stem + ".webp")
    with Image.open(source) as image:
        original = image.convert("RGBA")
        original.save(target, format="WEBP", quality=90, method=6, exact=True)
    with Image.open(target) as reloaded:
        result = reloaded.convert("RGBA")
        if result.size != original.size:
            raise RuntimeError(f"{stem}: dimensions changed")
        if ImageChops.difference(original.getchannel("A"), result.getchannel("A")).getbbox():
            raise RuntimeError(f"{stem}: transparency changed")
    before, after = source.stat().st_size, target.stat().st_size
    if after >= before:
        raise RuntimeError(f"{stem}: WebP is not smaller ({before} -> {after})")
    print(f"{stem}: {before:,} -> {after:,} bytes ({100 * (1 - after / before):.1f}% smaller); pixels {result.size}; alpha intact")
    old, new = f'img/{stem}.png', f'img/{stem}.webp'
    if content.count(old) != 1:
        raise RuntimeError(f"{stem}: expected one reference in kids.html")
    content = content.replace(old, new)

HTML.write_text(content, encoding="utf-8")
print("Kids page now references four independently checked WebP frames.")
