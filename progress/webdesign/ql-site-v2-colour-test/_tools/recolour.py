#!/usr/bin/env python3
"""Recolour only the separate Qwerty Labs colour-test assets, from untouched v2 sources."""
import base64,io,re
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parents[4]
SRC=ROOT/"progress/webdesign/ql-site-v2"
DST=ROOT/"progress/webdesign/ql-site-v2-colour-test"
HEX={"Blue":"#4C69E3","Pink":"#F66DC1","Green":"#92D644","Orange":"#FF9029","Pale":"#F7F4EB","Ink":"#020020"}
ART=[
("hero-paper.svg","Orange"),("kids-green-panel-untaped.svg","Green"),
("adults-pink-panel-untaped.svg","Pink"),("teens-blue-panel-untaped.svg","Blue"),
("project-backboard.svg","Ink"),("current-project-label.svg","Blue"),
("ideas-panel-untaped.svg","Pink"),("components-panel-untaped.svg","Blue"),
("projects-panel-untaped.svg","Orange")]
PAT=re.compile(r'(href="data:image/webp;base64,)([A-Za-z0-9+/=]+)(")')
def rgb(s):return np.array([int(s[i:i+2],16) for i in (1,3,5)],dtype=np.float32)
def open_image(s):
    m=PAT.search(s)
    if not m:raise ValueError("No embedded WebP")
    return Image.open(io.BytesIO(base64.b64decode(m.group(2)))).convert("RGBA")
def encode(im):
    b=io.BytesIO();im.save(b,format="WEBP",lossless=True,method=6,exact=True)
    if not np.array_equal(np.asarray(im),np.asarray(Image.open(io.BytesIO(b.getvalue())).convert("RGBA"))):raise ValueError("Lossless roundtrip failed")
    return base64.b64encode(b.getvalue()).decode("ascii")
def replace_image(svg,im):
    out,n=PAT.subn(lambda m:m.group(1)+encode(im)+m.group(3),svg,count=1)
    if n!=1:raise ValueError("Could not replace image")
    return out
def hsv(arr):
    a=arr.astype(np.float32)/255
    hi=a.max(axis=-1);lo=a.min(axis=-1);diff=hi-lo
    sat=np.where(hi>0,diff/np.maximum(hi,0.000001),0)
    ch=a.argmax(axis=-1);d=np.maximum(diff,0.000001)
    hue=np.where(ch==0,(a[...,1]-a[...,2])/d,np.where(ch==1,2+(a[...,2]-a[...,0])/d,4+(a[...,0]-a[...,1])/d))
    return (hue/6)%1,sat
def recolour(im,role):
    x=np.asarray(im).copy();v=x[...,:3].astype(np.float32);alpha=x[...,3].astype(np.float32)
    h,w=x.shape[:2]
    block=x[h//5:4*h//5:5,w//5:4*w//5:5]
    core=block[block[...,3]>240,:3]
    if len(core)<100:raise ValueError("Insufficient paper pixels")
    centre=np.median(core,axis=0).astype(np.float32)
    if role=="Ink":weight=np.clip(alpha/160,0,1);strength=.72
    else:
        hue,sat=hsv(v); h0=hsv(centre.reshape(1,1,3))[0][0,0]
        distance=np.abs(hue-h0);distance=np.minimum(distance,1-distance)
        weight=np.clip((.16-distance)/.085,0,1)*np.clip((sat-.27)/.22,0,1)*np.clip(alpha/130,0,1)
        strength=.90
    desired=np.clip(rgb(HEX[role])+(v-centre)*strength,0,255)
    x[...,:3]=np.rint(v*(1-weight[...,None])+desired*weight[...,None]).astype(np.uint8)
    if not np.array_equal(x[...,3],np.asarray(im)[...,3]):raise ValueError("Changed transparency")
    outblock=x[h//5:4*h//5:5,w//5:4*w//5:5]
    result=np.median(outblock[outblock[...,3]>240,:3],axis=0)
    return Image.fromarray(x,"RGBA"),[int(round(k)) for k in centre],[int(round(k)) for k in result],round(float(np.mean((weight>.8)&(alpha>180))*100),1)
def recolour_wordmark(im):
    original=np.asarray(im)
    arr=original.copy()
    if arr.shape[1]!=2013:raise ValueError("Wrong wordmark width")
    corner_alpha=float(np.mean(original[0:50,0:100,3]))
    print("WORDMARK original corner alpha",round(corner_alpha,1),flush=True)
    if corner_alpha>240:
        # Source bitmap has an opaque black backdrop. Recover glyph alpha from
        # the original ink intensity BEFORE applying exact palette RGB values.
        max_ink=original[...,:3].max(axis=2).astype(np.float32)
        coverage=np.clip((max_ink-15)/220,0,1)
        arr[...,3]=np.rint(arr[...,3].astype(np.float32)*coverage).astype(np.uint8)
        print("WORDMARK recovered transparent backdrop",flush=True)
    arr[:,:1290,:3]=rgb(HEX["Pale"]).astype(np.uint8)
    arr[:,1290:,:3]=rgb(HEX["Blue"]).astype(np.uint8)
    return Image.fromarray(arr,"RGBA")
def montage(pairs):
    board=Image.new("RGB",(900,len(pairs)*182+60),"#111829");d=ImageDraw.Draw(board)
    d.text((10,10),"APPROVED v2 SOURCE",fill=HEX["Pale"])
    d.text((470,10),"BRAND PALETTE TEST",fill=HEX["Pale"])
    for i,(name,a,b) in enumerate(pairs):
        top=55+i*182;d.text((12,top),name,fill=HEX["Pale"])
        for j,im in enumerate([a,b]):
            im=im.copy();im.thumbnail((434,145),Image.Resampling.LANCZOS)
            board.paste(im,(j*450+(450-im.width)//2,top+26+(145-im.height)//2),im)
    board.save(DST/"COLOUR_COMPARISON.png",optimize=True)
def main():
    if not SRC.is_dir() or not DST.is_dir():raise ValueError("Missing site source/test")
    pairs=[];rows=[]
    for filename,role in ART:
        svg=(SRC/"img"/filename).read_text()
        before=open_image(svg)
        after,old,new,coverage=recolour(before,role)
        (DST/"img"/filename).write_text(replace_image(svg,after))
        pairs.append((filename,before,after))
        rows.append((filename,role,old,new,HEX[role],coverage))
        print(filename,role,old,new,coverage,flush=True)
    before=open_image((SRC/"img/wordmark.svg").read_text());after=recolour_wordmark(before)
    opening='<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" width="2013" height="460" viewBox="0 0 2013 460" overflow="hidden">'
    wordmark=opening+'<image preserveAspectRatio="none" width="2013" height="609" href="data:image/webp;base64,'+encode(after)+'"/></svg>'
    (DST/"img/wordmark.svg").write_text(wordmark)
    pairs.insert(0,("wordmark.svg",before,after))
    htmlpath=DST/"index.html";html=htmlpath.read_text()
    for name in ["wordmark.svg"]+[r[0] for r in ART]:
        pattern=r'(src="img/'+re.escape(name)+r')(?:\?[^"#]*)?(")'
        html,n=re.subn(pattern,r'\g<1>?v=brand-raster-v1\2',html)
        if n!=1:raise ValueError("Expected one HTML reference "+name+"; got "+str(n))
    htmlpath.write_text(html)
    report=["# Qwerty Labs — artwork colour audit","",
            "Only the separate colour-test version has been modified. Approved v2 is untouched.",
            "## Exact palette","",
            "| Role | Hex |","|---|---|"]
    report += ["| "+k+" | "+v+" |" for k,v in HEX.items()]
    report += ["","## Actual artwork roles and measured corrections","",
               "| Asset | Intended colour | Original median RGB | Corrected median RGB | Target | Recoloured core |",
               "|---|---|---|---|---|---|"]
    for filename,role,old,new,target,coverage in rows:
        report.append(f"| {filename} | {role} | {old} | {new} | {target} | {coverage}% |")
    report += ["","## Exclusions","",
      "The photographic header/footer, mascots, project photo and photo frame remain untouched and are linked from approved v2.",
      "Paper folds, transparent edges and separately coloured tape remain protected. Text and geometry are untouched.",
      "The wordmark is rewritten as a lossless two-colour raster with transparent backdrop and exact palette RGB values.",
      "The papers are corrected within their embedded WebP pixels, not with CSS or SVG filters.",
      "Surface texture intentionally means adjacent pixels vary around their brand-colour anchor.",
      "See COLOUR_COMPARISON.png for the before/after contact sheet."]
    (DST/"COLOUR_AUDIT.md").write_text("\n".join(report)+"\n")
    montage(pairs)
    print("PASS: 10 assets plus audit and comparisons",flush=True)
if __name__=="__main__":main()
