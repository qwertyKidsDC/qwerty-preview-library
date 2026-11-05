"""Generate lossless SVG viewBox trims and a vertically cropped WebP.

Only transparent top/bottom pixels are removed; horizontal edges are untouched.
Each original file stays in place so established artwork can be restored.
"""
from pathlib import Path
from PIL import Image
import re, json

ROOT=Path(__file__).resolve().parents[1]
IMG=ROOT/"img"

# Bounds measured from the real current artwork, with a small safety margin
# to protect antialiased paper edges and shadows. (top, bottom) in source px.
CROPS={
    "kids-green-panel-untaped.svg":(90,894),
    "adults-pink-panel-untaped.svg":(77,859),
    "teens-blue-panel-untaped.svg":(72,825),
    "current-project-label.svg":(38,471),
    "footer-blue-tape.svg":(38,471),
    "footer-explore-blue.svg":(90,759),
    "footer-find-blue.svg":(72,825),
    "footer-hello-blue.svg":(94,829),
}
manifest={}
for name,(top,bottom) in CROPS.items():
    source=IMG/name
    contents=source.read_text(encoding="utf-8")
    match=re.match(r"<svg\b[^>]*>",contents)
    if not match:
        raise ValueError("Missing initial SVG tag: "+name)
    root=match.group(0)
    width=int(re.search(r'\bwidth="(\d+)"',root).group(1))
    height=int(re.search(r'\bheight="(\d+)"',root).group(1))
    if not (0<=top<bottom<=height):raise ValueError(name)
    if not re.search(r'\bviewBox="0 0 '+str(width)+' '+str(height)+r'"',root):
        raise ValueError("Unexpected viewBox: "+name)
    replacement=root.replace('height="'+str(height)+'"','height="'+str(bottom-top)+'"',1)
    replacement=replacement.replace(
        'viewBox="0 0 '+str(width)+' '+str(height)+'"',
        'viewBox="0 '+str(top)+' '+str(width)+' '+str(bottom-top)+'"',1)
    out=source.with_name(source.stem+"-vtrim.svg")
    out.write_text(replacement+contents[len(root):],encoding="utf-8")
    manifest[name]={"sourceHeight":height,"top":top,"bottom":bottom,
                    "topFraction":round(top/height,7),
                    "heightFraction":round((bottom-top)/height,7),
                    "trimmed":out.name}
    print(name, "top",top,"bottom",bottom,"trimmed",out.name)

source=IMG/"footer-experiment-dark.webp"
img=Image.open(source).convert("RGBA")
assert (img.width,img.height)==(2172,724)
top,bottom=134,603
new=IMG/"footer-experiment-dark-vtrim.webp"
img.crop((0,top,img.width,bottom)).save(new,format="WEBP",quality=99,method=6)
manifest[source.name]={"sourceHeight":img.height,"top":top,"bottom":bottom,
                       "topFraction":round(top/img.height,7),
                       "heightFraction":round((bottom-top)/img.height,7),
                       "trimmed":new.name}
(IMG/"trim-manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
print("Dark panel crop",source.name,(img.width,img.height),"to",(img.width,bottom-top))
