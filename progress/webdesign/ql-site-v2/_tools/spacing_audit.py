"""Inspect painted bounds and layout gaps for the Qwerty Labs v2 homepage."""
from pathlib import Path
from io import BytesIO
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json, threading, os
from PIL import Image
import cairosvg
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/"img"
FILES=[
"kids-green-panel-untaped.svg","adults-pink-panel-untaped.svg",
"teens-blue-panel-untaped.svg","project-backboard.svg",
"current-project-label.svg","project-photo-frame.svg",
"footer-experiment-dark.webp","footer-blue-tape.svg",
"footer-explore-blue.svg","footer-find-blue.svg","footer-hello-blue.svg",
"kids-green-panel-untaped-vtrim.svg","adults-pink-panel-untaped-vtrim.svg",
"teens-blue-panel-untaped-vtrim.svg","current-project-label-vtrim.svg",
"footer-experiment-dark-vtrim.webp","footer-blue-tape-vtrim.svg",
"footer-explore-blue-vtrim.svg","footer-find-blue-vtrim.svg","footer-hello-blue-vtrim.svg",
]
def alpha_report(name):
    fp=ASSETS/name
    if fp.suffix == ".svg":
        data=cairosvg.svg2png(url=str(fp))
        image=Image.open(BytesIO(data)).convert("RGBA")
    else:
        image=Image.open(fp).convert("RGBA")
    alpha=image.getchannel("A").point(lambda p: 255 if p > 12 else 0)
    x0,y0,x1,y1=alpha.getbbox() or (0,0,image.width,image.height)
    return {"size":[image.width,image.height],"bbox":[x0,y0,x1,y1],
            "insets":[round(x0/image.width,5),round(y0/image.height,5),
                      round((image.width-x1)/image.width,5),
                      round((image.height-y1)/image.height,5)]}

def handler(*args,**kwargs):
    SimpleHTTPRequestHandler(*args,directory=str(ROOT.parent),**kwargs)
server=ThreadingHTTPServer(("127.0.0.1",0),handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f"http://127.0.0.1:{server.server_address[1]}/{ROOT.name}/"

alpha={}
for name in FILES:
    try:alpha[name]=alpha_report(name)
    except Exception as ex:alpha[name]={"error":str(ex)}

selectors={
"nav":".navigation a",
"wordmark":".header .logo img",
"cards":".feature-cards .paper-bg",
"projectLabel":".project-label",
"projectBoard":".project-panel",
"projectFrame":".photo-collage .project-frame",
"blurbBoard":".footer-scene__art",
"blurbLabel":".footer-scene__tape",
"footerCards":".footer-nav-cards .paper-bg",
"country":".country-ack",
"legal":".footer-legal"
}
dimensions={}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,args=["--no-sandbox"])
 for width,height in [(2005,1100),(1604,1000),(1024,900),(390,844)]:
  page=browser.new_page(viewport={"width":width,"height":height},device_scale_factor=1)
  page.goto(base,wait_until="networkidle",timeout=90000)
  page.evaluate("document.fonts.ready")
  page.screenshot(path=str(ROOT/("_tools/audit-"+str(width)+".png")),full_page=True)
  values=page.evaluate("""(selectors) => {
    const r={};
    for(const [key,s] of Object.entries(selectors)) {
      r[key]=[...document.querySelectorAll(s)].map(el=>{
       const b=el.getBoundingClientRect();
       return {top:b.top,bottom:b.bottom,left:b.left,right:b.right,
               width:b.width,height:b.height,src:el.currentSrc||el.getAttribute("src")||"",
               zoom:getComputedStyle(document.querySelector(".cardboard-page")).zoom};
      });
    }
    return r;
   }""",selectors)
  def painted(name,key):
   vals=values.get(key,[])
   result=[]
   for v in vals:
    if name:
     a=alpha.get(name,{})
    else:
     filename=(v["src"].split("?")[0].split("/")[-1])
     a=alpha.get(filename,{})
    if "bbox" in a:
     ins=a["insets"]
     top=v["top"]+v["height"]*ins[1]
     bottom=v["bottom"]-v["height"]*ins[3]
    else:top,bottom=v["top"],v["bottom"]
    result.append([top,bottom])
   return result
  def edges(key,name=None):
   coords=painted(name,key)
   return [min(q[0] for q in coords),max(q[1] for q in coords)] if coords else [None,None]
  card=edges("cards")
  projectLabel=edges("projectLabel","current-project-label-vtrim.svg")
  projectBoard=edges("projectBoard","project-backboard.svg")
  projectFrame=edges("projectFrame","project-photo-frame.svg")
  project=[min(projectLabel[0],projectBoard[0],projectFrame[0]),
           max(projectLabel[1],projectBoard[1],projectFrame[1])]
  blurb=edges("blurbBoard","footer-experiment-dark-vtrim.webp" if width>760 else "footer-experiment-dark.webp")
  blue=edges("footerCards")
  country=edges("country") # painted background may have alpha, print separately
  legal=edges("legal")
  gaps={
    "cards_to_project":round(project[0]-card[1],1),
    "project_to_blurb":round(blurb[0]-project[1],1),
    "blurb_to_blue":round(blue[0]-blurb[1],1),
    "blue_to_country":round(country[0]-blue[1],1),
    "country_to_legal":round(legal[0]-country[1],1)
  }
  dimensions[str(width)]={"gaps":gaps,
     "navTop":round(values["nav"][0]["top"],1),
     "wordmarkTop":round(values["wordmark"][0]["top"],1),
     "painted":{"cards":card,"project":project,"blurb":blurb,"footerCards":blue,
                "country":country,"legal":legal},
     "rects":{k:[{"top":round(v["top"],1),"bottom":round(v["bottom"],1),
                   "height":round(v["height"],1)} for v in values[k]]
              for k in values}}
  page.close()
 browser.close()
server.shutdown()
report={"alpha":alpha,"viewports":dimensions}
print("QL_SPACING_AUDIT_START")
print(json.dumps(report,indent=2))
print("QL_SPACING_AUDIT_END")
(ROOT/"_tools/audit-report.json").write_text(json.dumps(report,indent=2))
