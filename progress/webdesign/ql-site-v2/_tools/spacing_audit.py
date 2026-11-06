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
  page.wait_for_function("""() => {
    const elements=[...document.querySelectorAll(
      '.footer-nav-card h2, .footer-nav-card .footer-card-links, .footer-nav-card .footer-card-address'
    )];
    const last=Math.max(...elements.map(el=>el.getBoundingClientRect().bottom));
    const top=document.querySelector('.country-ack').getBoundingClientRect().top;
    return Math.abs((top-last)-24)<0.7;
  }""", timeout=10000)
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
  board=edges("blurbBoard","footer-experiment-dark-vtrim.webp" if width>760 else "footer-experiment-dark.webp")
  tape=edges("blurbLabel","footer-blue-tape-vtrim.svg")
  # The tape is the first visible paint: the dark board begins below it.
  blurb=[min(board[0],tape[0]),board[1]]
  blue=edges("footerCards")
  country=edges("country") # painted background may have alpha, print separately
  lowest_copy_bottom=page.evaluate("""() => Math.max(
    ...[...document.querySelectorAll(
      '.footer-nav-card h2, .footer-nav-card .footer-card-links, .footer-nav-card .footer-card-address'
    )].map(el => el.getBoundingClientRect().bottom)
  )""")
  copy_to_country=round(country[0]-lowest_copy_bottom,2)
  legal=edges("legal")
  # Horizontal paint bounds: footer paper images vs the stretched country
  # backboard. They should share the same external alignment guides.
  def horizontal(key, asset=None):
   xs=[]
   for v in values[key]:
    fname=asset or v["src"].split("?")[0].split("/")[-1]
    ins=alpha.get(fname,{}).get("insets",[0,0,0,0])
    xs.append([v["left"]+v["width"]*ins[0],v["right"]-v["width"]*ins[2]])
   return [min(q[0] for q in xs),max(q[1] for q in xs)]
  blue_x=horizontal("footerCards")
  country_x=horizontal("country","project-backboard.svg")
  horizontal_diff={"left":round(country_x[0]-blue_x[0],2),
                   "right":round(country_x[1]-blue_x[1],2)}
  gaps={
    "cards_to_project":round(project[0]-card[1],1),
    "project_to_blurb":round(blurb[0]-project[1],1),
    "blurb_to_blue":round(blue[0]-blurb[1],1),
    "blue_to_country":round(country[0]-blue[1],1),
    "country_to_legal":round(legal[0]-country[1],1)
  }
  dimensions[str(width)]={"gaps":gaps, "copy_to_country":copy_to_country,
     "horizontal":{"footerCards":blue_x,"country":country_x,"difference":horizontal_diff},
     "navTop":round(values["nav"][0]["top"],1),
     "wordmarkTop":round(values["wordmark"][0]["top"],1),
     "painted":{"cards":card,"project":project,"blurb":blurb,"board":board,"tape":tape,"footerCards":blue,
                "country":country,"legal":legal},
     "rects":{k:[{"top":round(v["top"],1),"bottom":round(v["bottom"],1),
                   "height":round(v["height"],1)} for v in values[k]]
              for k in values}}
  # Painted bounds include the blue tape's top and the paper edges.
  # Assert exactly half of the three selected existing gaps at each breakpoint.
  zoom=1 if width<=760 else max(0.70,min(1.85,(width-84)/986))
  expected={
    "cards_to_project":26*zoom,
    "project_to_blurb":(46 if width>760 else 26)*zoom,
    "blurb_to_blue":(65+(53 if width>760 else 0))*zoom,
    "country_to_legal":38.918919*zoom
  }
  deviations={key:round(gaps[key]-target,2) for key,target in expected.items()}
  dimensions[str(width)]["expected"]=expected
  dimensions[str(width)]["deviations"]=deviations
  broken=page.evaluate("() => [...document.images].filter(im => getComputedStyle(im).display!=='none' && (!im.complete || im.naturalWidth===0)).map(im=>im.src)")
  dimensions[str(width)]["brokenImages"]=broken
  if width<=760:
    mobile=page.evaluate("""() => {
      const box=document.querySelector(".footer-scene__art").getBoundingClientRect();
      const link=document.querySelector(".footer-scene__content .scene-link").getBoundingClientRect();
      const robot=document.querySelector(".footer-scene__mascot");
      return {
        robotDisplay:getComputedStyle(robot).display,
        robotRectHeight:robot.getBoundingClientRect().height,
        boardBottom:box.bottom,linkBottom:link.bottom,
        mobileMedia:matchMedia("(max-width:760px)").matches
      };
    }""")
    dimensions[str(width)]["mobileBlurb"]=mobile
    assert mobile["robotDisplay"]=="none", f"Robot obstructs mobile paragraph: {mobile}"
    assert mobile["linkBottom"]<=blurb[1]+1, f"Link overflows painted board edge: {mobile}, paint bottom={blurb[1]}"
  # Screenshot geometry/alpha are subject to a fraction of a pixel rounding.
  assert not broken, f"Broken images at {width}: {broken}"
  assert all(abs(d)<=1.5 for d in deviations.values()), f"Bad spacing {width}: {deviations}"
  if width>760:
    assert all(abs(d)<=2 for d in horizontal_diff.values()), f"Country width mismatch {width}: {horizontal_diff}"
  # Check the new overlap is real, Country is in front, and no blue-card
  # navigation link is obscured by the raised blackboard.
  assert abs(copy_to_country-24) <= 1, f"Country must begin 24px below lowest text at {width}: {copy_to_country}px"
  assert gaps["blue_to_country"] < 0, "Country paper must overlap blue cards"
  overlap_state=page.evaluate("""() => {
    const country=document.querySelector(".country-ack").getBoundingClientRect();
    const links=[...document.querySelectorAll(".footer-nav-cards .footer-card-links a")];
    const maxBottom=Math.max(...links.map(el=>el.getBoundingClientRect().bottom));
    return {countryTop:country.top,maxLinkBottom:maxBottom,
      countryLayer:getComputedStyle(document.querySelector(".lab-footer")).zIndex,
      cardsLayer:getComputedStyle(document.querySelector(".footer-scene + .small-cards")).zIndex};
  }""")
  assert float(overlap_state["countryLayer"]) > float(overlap_state["cardsLayer"]), overlap_state
  assert overlap_state["maxLinkBottom"] < overlap_state["countryTop"] - 4, f"Overlap covers a blue-card link: {overlap_state}"
  dimensions[str(width)]["overlapState"]=overlap_state
  if width>760: assert abs(values["nav"][0]["top"]-13)<0.5
  assert page.locator(".feature-cards a").count()==0, "Cards must not be links"
  assert page.locator(".feature-cards .feature").count()==3
  states=page.evaluate("""() => {
    const cs=s=>getComputedStyle(document.querySelector(s));
    return {navDecoration:cs(".navigation a").textDecorationLine,
      legalDecoration:cs(".footer-legal-links a").textDecorationLine,
      bodyDecoration:cs(".scene-link").textDecorationLine};
  }""")
  assert states["navDecoration"]=="none" and states["legalDecoration"]=="none", states
  assert states["bodyDecoration"]=="underline", states
  blue_hover=page.evaluate("""() =>
    getComputedStyle(document.querySelector(".footer-nav-cards .footer-card-links a"),"::after").backgroundImage
  """)
  assert "F7F4EB" in blue_hover, "Footer card link hover must use ivory stroke"
  page.close()
 browser.close()
server.shutdown()
report={"alpha":alpha,"viewports":dimensions}
print("QL_SPACING_AUDIT_START")
print(json.dumps(report,indent=2))
print("QL_SPACING_AUDIT_END")
(ROOT/"_tools/audit-report.json").write_text(json.dumps(report,indent=2))
