/* Qwerty Labs · Subpage Studio
   Isolated experiment. The approved index.html, its CSS and assets are never rewritten.
   Uses the homepage document as the preview, preserving its exact header and footer. */
(() => {
  'use strict';
  const $ = (s, base = document) => base.querySelector(s);
  const $$ = (s, base = document) => Array.from(base.querySelectorAll(s));
  const frame = $('#page-frame');
  const stageWrap = $('#frame-wrap');
  const inspector = $('#inspector');
  const library = $('#asset-library');
  const status = $('#save-status');
  const storageKey = 'qwerty-labs-subpage-studio-v4';
  const legacyStorageKey = 'qwerty-labs-subpage-studio-v1';
  const versionKey = 'qwerty-labs-subpage-studio-versions-v1';
  const catalog = [
    // From this conversation: unchanged paper/cardboard/photographic artwork.
    { id:'beige-board', name:'Beige + trim', group:'Paper & cardboard', src:'img/studio-beige-board.png', kind:'panel' },
    { id:'pink-board', name:'Pink + trim', group:'Paper & cardboard', src:'img/studio-pink-board.png', kind:'panel' },
    { id:'green-board', name:'Green + trim', group:'Paper & cardboard', src:'img/studio-green-board.png', kind:'panel' },
    { id:'blue-board', name:'Blue + trim', group:'Paper & cardboard', src:'img/studio-blue-board.png', kind:'panel' },
    { id:'orange-board', name:'Orange + trim', group:'Paper & cardboard', src:'img/studio-orange-board.png', kind:'panel' },
    { id:'cardboard-board', name:'Exposed cardboard', group:'Paper & cardboard', src:'img/studio-cardboard-board.png', kind:'panel' },
    { id:'black-board', name:'Blackboard', group:'Paper & cardboard', src:'img/studio-black-board.png', kind:'panel' },
    { id:'beige-paper', name:'Worn beige sheet', group:'Paper & cardboard', src:'img/studio-beige-paper.png', kind:'panel' },
    { id:'green-card', name:'Kids green card', group:'Homepage pieces', src:'img/kids-green-panel-untaped-vtrim.svg', kind:'panel' },
    { id:'pink-card', name:'Adults pink card', group:'Homepage pieces', src:'img/adults-pink-panel-untaped-vtrim.svg', kind:'panel' },
    { id:'orange-card', name:'Teens orange card', group:'Homepage pieces', src:'img/teens-blue-panel-untaped-vtrim.svg', kind:'panel' },
    { id:'hero', name:'Blue hero paper', group:'Homepage pieces', src:'img/hero-paper.svg', kind:'panel' },
    { id:'backboard', name:'Projects backboard', group:'Homepage pieces', src:'img/project-backboard.svg', kind:'panel' },
    { id:'country-board', name:'Country blackboard', group:'Homepage pieces', src:'img/footer-experiment-dark-vtrim.webp', kind:'panel' },
    { id:'label-blue', name:'Blue label', group:'Labels · same original', src:'img/footer-blue-tape-vtrim.svg', kind:'panel' },
    { id:'label-green', name:'Green label', group:'Labels · same original', src:'img/footer-label-green-vtrim.svg', kind:'panel' },
    { id:'label-pink', name:'Pink label', group:'Labels · same original', src:'img/footer-label-pink-vtrim.svg', kind:'panel' },
    { id:'label-orange', name:'Orange label', group:'Labels · same original', src:'img/footer-label-orange-vtrim.svg', kind:'panel' },
    { id:'frame-cardboard', name:'Cardboard photo frame', group:'Frames & photos', src:'img/studio-frame-cardboard.png', kind:'image' },
    { id:'frame-taped', name:'Taped paper frame', group:'Frames & photos', src:'img/studio-frame-taped.png', kind:'image' },
    { id:'frame-project', name:'Website photo frame', group:'Frames & photos', src:'img/project-photo-frame.svg', kind:'image' },
    { id:'robotics', name:'Robotics photo', group:'Frames & photos', src:'img/code-camp-robotics-700.jpg', kind:'image' },
    { id:'cloud', name:'Cloud project', group:'Frames & photos', src:'img/cloud-poster-selected.webp', kind:'image' },
    { id:'mascots', name:'Approved maker mascots', group:'Frames & photos', src:'img/mascot-making-led-crisp.svg', kind:'image' },
    { id:'q-country', name:'Q mascot', group:'Frames & photos', src:'img/q-country-mascot.svg', kind:'image' }
  ];
  let counter = 0;
  const id = (prefix='q') => `${prefix}-${Date.now().toString(36)}-${(++counter).toString(36)}`;
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const copy = value => JSON.parse(JSON.stringify(value));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const findAsset = assetId => catalog.find(a => a.id===assetId);
  let model, selected = { type:'row', rowId:null, cell:0 }, iframeDoc=null, canvas=null;
  let undoStack=[], redoStack=[], preview=false, painting=false, savedSnapshot='';
  let toastTimer;
  let heroSection=null;
  const heroTintCache=new Map();
  const artworkCache = new Map();

  function toast(message) {
    const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>el.classList.remove('show'),2800);
  }
  function panel(assetId,title='',body='') {
    const a=findAsset(assetId);
    return {id:id('item'),kind:'panel',asset:assetId,src:a.src,title,body,mode:'flow',width:100,x:0,y:0,rotation:0,z:2,align:'left'};
  }
  function textItem(title='',body='') {
    return {id:id('item'),kind:'text',asset:null,src:'',title,body,mode:'flow',width:100,x:0,y:0,rotation:0,z:2,align:'left'};
  }
  function imageItem(asset) {
    return {id:id('item'),kind:'image',asset:asset.id,src:asset.src,title:'',body:'',mode:'flow',width:80,x:0,y:0,rotation:0,z:2,align:'left'};
  }
  const row = (cols,minHeight=175) => ({id:id('row'),columns:cols,minHeight,cells:Array.from({length:cols},()=>[])});
  const heroColours = Object.freeze({
    blue:'#4C69E3',green:'#92D644',pink:'#F66DC1',
    orange:'#FF9029',ivory:'#F7F4EB'
  });
  const originalHeroMascots='img/mascot-making-led-crisp.svg?v=full-res-20261106';
  const defaultHero=()=>({
    title:'Kids',colour:'green',mascots:originalHeroMascots,mascotScale:100
  });
  // Blank means no rows at all. The fixed homepage hero and footer remain on screen.
  function blankTemplate(){
    return {version:1,name:'Untitled subpage',hero:defaultHero(),rows:[],uploads:[]};
  }
  function normalizeModel(data){
    if(!data.hero||typeof data.hero!=='object')data.hero=defaultHero();
    data.hero={...defaultHero(),...data.hero};
    if(!Object.hasOwn(heroColours,data.hero.colour))data.hero.colour='blue';
    data.uploads ||= [];
    return data;
  }
  function validModel(data) {return data && data.version===1 && Array.isArray(data.rows) && data.rows.every(r=>r && r.id && Number.isInteger(r.columns) && r.columns>=1 && r.columns<=3 && Array.isArray(r.cells) && r.cells.length===r.columns && r.cells.every(Array.isArray));}
  try {const raw=localStorage.getItem(storageKey);const parsed=raw?JSON.parse(raw):null;model=validModel(parsed)?normalizeModel(parsed):blankTemplate();} catch {model=blankTemplate();}
  selected={type:'row',rowId:model.rows[0]?.id ?? null,cell:0};
  savedSnapshot=JSON.stringify(model);

  function snapshot() {undoStack.push(JSON.stringify(model));if(undoStack.length>65)undoStack.shift();redoStack=[];updateHistoryButtons();}
  function change(mutator,{repaint=true}={}){snapshot();mutator();if(repaint)render();status.textContent='Unsaved edits';}
  function updateHistoryButtons(){ $('#undo').disabled=!undoStack.length; $('#redo').disabled=!redoStack.length; }
  function undo(){if(!undoStack.length)return;redoStack.push(JSON.stringify(model));model=JSON.parse(undoStack.pop());ensureSelection();render();updateHistoryButtons();status.textContent='Unsaved edits';}
  function redo(){if(!redoStack.length)return;undoStack.push(JSON.stringify(model));model=JSON.parse(redoStack.pop());ensureSelection();render();updateHistoryButtons();status.textContent='Unsaved edits';}
  function getRow(rowId){return model.rows.find(r=>r.id===rowId);}
  function lookupItem(itemId){for(const [ri,r] of model.rows.entries())for(const [ci,cell] of r.cells.entries())for(const [ii,item] of cell.entries())if(item.id===itemId)return {row:r,rowIndex:ri,cellIndex:ci,itemIndex:ii,item};return null;}
  function ensureSelection(){if(selected.type==='item' && lookupItem(selected.itemId))return;if(selected.type!=='item'&&getRow(selected.rowId))return;selected={type:'row',rowId:model.rows[0]?.id??null,cell:0};}
  function selectRow(rowId,cell=0){selected={type:'row',rowId,cell};updateSelection();}
  function selectItem(itemId){const f=lookupItem(itemId);if(!f)return;selected={type:'item',rowId:f.row.id,cell:f.cellIndex,itemId};updateSelection();}
  function targetCell(){const r=getRow(selected.rowId)||model.rows[model.rows.length-1];if(!r)return null;return {row:r,cell:clamp(selected.cell||0,0,r.columns-1)};}

  function deleteItem(itemId){
    if(preview)return;
    const f=lookupItem(itemId);if(!f)return;
    change(()=>{
      f.row.cells[f.cellIndex].splice(f.itemIndex,1);
      selected={type:'row',rowId:f.row.id,cell:f.cellIndex};
    });
    toast('Element deleted · Undo to restore');
  }

  // Trim only fully transparent margins in Studio, without altering original brand assets.
  function trimmedArtwork(src){
    if(artworkCache.has(src))return artworkCache.get(src);
    const promise=new Promise(resolve=>{
      const image=new Image();
      image.onerror=()=>resolve(src);
      image.onload=()=>{
        try{
          const w=image.naturalWidth,h=image.naturalHeight;
          if(!w||!h){resolve(src);return;}
          // Use a small analysis canvas; decode at a larger resolution only if a crop exists.
          const scanScale=Math.min(1,640/Math.max(w,h));
          const sw=Math.max(1,Math.round(w*scanScale)),sh=Math.max(1,Math.round(h*scanScale));
          const scan=document.createElement('canvas');scan.width=sw;scan.height=sh;
          const ctx=scan.getContext('2d',{willReadFrequently:true});
          if(!ctx){resolve(src);return;}
          ctx.drawImage(image,0,0,sw,sh);
          const pixels=ctx.getImageData(0,0,sw,sh).data;
          let left=sw,top=sh,right=-1,bottom=-1;
          for(let y=0;y<sh;y++){
            for(let x=0;x<sw;x++){
              if(pixels[(y*sw+x)*4+3]<9)continue;
              left=Math.min(left,x);top=Math.min(top,y);
              right=Math.max(right,x);bottom=Math.max(bottom,y);
            }
          }
          if(right<0){resolve(src);return;}
          left=Math.max(0,left-2);top=Math.max(0,top-2);
          right=Math.min(sw,right+3);bottom=Math.min(sh,bottom+3);
          if(left===0&&top===0&&right===sw&&bottom===sh){resolve(src);return;}
          const outputScale=Math.min(1,2400/Math.max(w,h));
          const fullW=Math.max(1,Math.round(w*outputScale)),fullH=Math.max(1,Math.round(h*outputScale));
          const x0=Math.floor(left/sw*fullW),y0=Math.floor(top/sh*fullH);
          const x1=Math.ceil(right/sw*fullW),y1=Math.ceil(bottom/sh*fullH);
          const result=document.createElement('canvas');
          result.width=Math.max(1,x1-x0);result.height=Math.max(1,y1-y0);
          const out=result.getContext('2d');
          if(!out){resolve(src);return;}
          out.drawImage(image,0,0,w,h,-x0,-y0,fullW,fullH);
          resolve(result.toDataURL('image/png'));
        }catch(err){console.warn('Studio artwork crop skipped:',src,err);resolve(src);}
      };
      image.src=src;
    });
    artworkCache.set(src,promise);
    return promise;
  }

  function assetTile(asset){const b=document.createElement('button');b.type='button';b.className='asset-tile';b.draggable=true;b.title=`Add ${asset.name}`;b.dataset.assetId=asset.id;b.innerHTML=`<img src="${esc(asset.src)}" alt="" loading="lazy"><span>${esc(asset.name)}</span>`;trimmedArtwork(asset.src).then(src=>{const thumb=b.querySelector('img');if(thumb?.isConnected&&src!==thumb.src)thumb.src=src;});b.addEventListener('click',()=>addAsset(asset.id));b.addEventListener('dragstart',e=>{e.dataTransfer.effectAllowed='copy';e.dataTransfer.setData('application/x-qwerty-asset',asset.id);e.dataTransfer.setData('text/plain',`asset:${asset.id}`);});return b;}
  function drawLibrary(){library.replaceChildren();const groups=[...new Set(catalog.map(a=>a.group))];for(const group of groups){const section=document.createElement('div');section.className='asset-group';const title=document.createElement('h3');title.textContent=group;const grid=document.createElement('div');grid.className='asset-grid';catalog.filter(a=>a.group===group).forEach(a=>grid.appendChild(assetTile(a)));section.append(title,grid);library.appendChild(section);}$('#asset-count').textContent=`${catalog.length} assets`;}
  function addAsset(assetId,rowId,cellIndex){const a=findAsset(assetId);if(!a)return;let t=rowId?{row:getRow(rowId),cell:cellIndex}:targetCell();if(!t || !t.row){const newRow=row(1);change(()=>model.rows.push(newRow));t={row:newRow,cell:0};}const item=a.kind==='panel'?panel(assetId):imageItem(a);if(item.kind==='panel'){item.title=assetId.startsWith('label-')?'YOUR LABEL':'Your heading';item.body=assetId.startsWith('label-')?'':'Click this panel to edit its copy. The artwork grows with longer text.';}change(()=>t.row.cells[t.cell].push(item));selectItem(item.id);toast(`${a.name} added`);}
  function addText(kind){let t=targetCell();if(!t){const r=row(1);change(()=>model.rows.push(r));t={row:r,cell:0};}const item=kind==='heading'?textItem('A new heading',''):textItem('','Edit this text in the left panel.');change(()=>t.row.cells[t.cell].push(item));selectItem(item.id);}
  function addRow(cols){const r=row(cols,210);const selectedIndex=model.rows.findIndex(x=>x.id===selected.rowId);change(()=>model.rows.splice(selectedIndex>=0?selectedIndex+1:model.rows.length,0,r));selectRow(r.id,0);toast(`${cols}-column row added`);}

  const iframeStyles=`
  html {scroll-behavior:auto!important} body.studio-iframe .cardboard-page {overflow:hidden} body.studio-iframe main {position:relative;z-index:3}
  #lab-playground-canvas {position:relative;margin:18px 39px 45px;min-height:120px;padding-bottom:32px;z-index:7;}
  #lab-playground-canvas .lab-empty-intro{padding:26px 28px;min-height:115px;display:grid;place-content:center;text-align:center;border:2px dashed #4c69e366;color:#57546e;font:700 15px 'Atkinson Hyperlegible',sans-serif;}
  body.studio-iframe.studio-clean #lab-playground-canvas:has(.lab-empty-intro){min-height:0;margin:0;padding:0!important;}
  body.studio-iframe.studio-clean #lab-playground-canvas .lab-empty-intro{display:none;}
  body.studio-iframe .hero h1{white-space:pre-line;}
  body.studio-iframe .hero .mascots{transform:scale(var(--studio-mascot-scale,1));transform-origin:top right;}
  body.studio-iframe.studio-clean .hero{cursor:default;}
  body.studio-iframe:not(.studio-clean) .hero h1{cursor:pointer;}
  body.studio-iframe:not(.studio-clean) .hero h1:hover{outline:2px dashed #4c69e3;outline-offset:4px;}
  #lab-playground-canvas .lab-row {display:grid;grid-template-columns:repeat(var(--cols),minmax(0,1fr));align-items:stretch;gap:14px;min-height:var(--row-min);position:relative;margin-bottom:22px;}
  #lab-playground-canvas .lab-cell {min-width:0;position:relative;display:flex;flex-direction:column;gap:11px;min-height:var(--row-min);padding:0;}
  #lab-playground-canvas .lab-item {box-sizing:border-box;position:relative;min-width:0;max-width:none;display:block;user-select:none;cursor:pointer;}
  #lab-playground-canvas .lab-item.lab-flow {flex:none;margin:0;}
  #lab-playground-canvas .lab-item.lab-overlay {position:absolute!important;left:var(--pos-x);top:var(--pos-y);width:var(--item-width)!important;z-index:var(--layer-z);margin:0;touch-action:none;cursor:grab;}
  /* Nine-slice artwork: fixed corners, flexible centre, text controls natural height. */
  #lab-playground-canvas .lab-panel {box-sizing:border-box;position:relative;isolation:isolate;min-height:190px;height:auto;width:100%;padding:clamp(38px,5vw,64px) clamp(35px,6vw,80px) clamp(48px,6vw,78px);overflow-wrap:anywhere;display:flow-root;}
  #lab-playground-canvas .lab-panel::before {content:"";position:absolute;inset:0;z-index:0;pointer-events:none;border:1px solid transparent;border-image-source:var(--lab-art);border-image-slice:26% 19% 27% 19% fill;border-image-width:clamp(24px,4vw,46px) clamp(26px,4vw,53px);border-image-repeat:stretch;}
  #lab-playground-canvas .lab-panel > h2, #lab-playground-canvas .lab-panel > p {position:relative;z-index:1;}
  #lab-playground-canvas .lab-item[data-label=true] .lab-panel {min-height:95px;padding:clamp(20px,3vw,31px) clamp(22px,4vw,39px);}
  #lab-playground-canvas .lab-item[data-label=true] .lab-panel::before {border-image-slice:22% 17% 22% 17% fill;border-image-width:23px 28px;}
  #lab-playground-canvas .lab-item[data-label=true] .lab-panel h2{font-size:clamp(16px,2.4vw,24px);margin-bottom:4px;}
  #lab-playground-canvas .lab-panel h2,#lab-playground-canvas .lab-text h2 {font-size:clamp(22px,3vw,32px);line-height:1.15;letter-spacing:-.04em;margin:0 0 11px;color:#020020;font-weight:700;text-transform:none;}
  #lab-playground-canvas .lab-panel p,#lab-playground-canvas .lab-text p {font-size:clamp(13px,1.6vw,16px);line-height:1.42;margin:0;white-space:pre-line;color:#020020;}
  #lab-playground-canvas .lab-item[data-dark=true] .lab-panel h2,#lab-playground-canvas .lab-item[data-dark=true] .lab-panel p{color:#F7F4EB;}
  #lab-playground-canvas .lab-text {padding:18px 12px;}
  #lab-playground-canvas .lab-image {height:auto;min-height:36px;padding:0;}
  #lab-playground-canvas .lab-image img {display:block;max-width:none;width:100%;height:auto;pointer-events:none;}
  #lab-playground-canvas .lab-item[data-align=center] h2,#lab-playground-canvas .lab-item[data-align=center] p {text-align:center}
  #lab-playground-canvas .lab-item[data-align=right] h2,#lab-playground-canvas .lab-item[data-align=right] p {text-align:right}
  #lab-playground-canvas .lab-panel,.lab-image,.lab-text{transform:rotate(var(--rotation));transform-origin:50% 50%;}
  body.studio-iframe:not(.studio-clean) #lab-playground-canvas .lab-cell {outline:1px dashed #4c69e377;outline-offset:5px;}
  body.studio-iframe:not(.studio-clean) #lab-playground-canvas .lab-cell:hover{outline:2px dashed #4c69e3;}
  body.studio-iframe:not(.studio-clean) #lab-playground-canvas .lab-item:hover{outline:1px dashed #4c69e3;outline-offset:2px;}
  body.studio-iframe:not(.studio-clean) #lab-playground-canvas .lab-item.is-selected{outline:3px solid #4c69e3;outline-offset:3px;}
  body.studio-iframe:not(.studio-clean) #lab-playground-canvas .lab-cell.is-cell-selected{box-shadow:inset 0 0 0 2px #4c69e365;}
  #lab-playground-canvas .lab-cell-empty {display:none;position:absolute;inset:10px;align-items:center;justify-content:center;text-align:center;color:#5b64a0;font:700 12px 'Atkinson Hyperlegible',sans-serif;pointer-events:none;background:#e9ebf3a8;border:1px dashed #a4b3e6;}
  body.studio-iframe:not(.studio-clean) #lab-playground-canvas .lab-cell[data-has-item="false"] .lab-cell-empty {display:flex;}
  #lab-playground-canvas .lab-grab, #lab-playground-canvas .lab-resizer, #lab-playground-canvas .lab-delete {display:none;position:absolute;z-index:30;border:0;background:#4C69E3;color:#fff;font:700 11px 'Atkinson Hyperlegible',sans-serif;}
  body.studio-iframe:not(.studio-clean) #lab-playground-canvas .lab-item.is-selected .lab-grab {display:block;top:-26px;left:50%;transform:translateX(-50%);padding:5px 9px;border-radius:4px;cursor:grab;touch-action:none;white-space:nowrap;}
  body.studio-iframe:not(.studio-clean) #lab-playground-canvas .lab-item.is-selected.lab-overlay .lab-resizer {display:block;bottom:-6px;right:-6px;padding:6px;cursor:nwse-resize;touch-action:none;border-radius:2px;}
  body.studio-iframe:not(.studio-clean) #lab-playground-canvas .lab-item.is-selected .lab-delete {display:block;top:-27px;right:0;background:#b13e49;border-radius:4px;padding:5px 9px;cursor:pointer;white-space:nowrap;}
  body.studio-iframe:not(.studio-clean) #lab-playground-canvas .lab-item.is-selected .lab-delete:focus-visible{outline:3px solid #020020;outline-offset:2px;}
  #lab-playground-canvas .lab-row-tag {display:none;position:absolute;top:-18px;left:0;background:#4C69E3;color:white;font:700 10px 'Atkinson Hyperlegible',sans-serif;padding:2px 7px;cursor:pointer;}
  body.studio-iframe:not(.studio-clean) #lab-playground-canvas .lab-row:hover .lab-row-tag,body.studio-iframe:not(.studio-clean) #lab-playground-canvas .lab-row:focus-within .lab-row-tag {display:block;}
  body.studio-iframe.studio-clean #lab-playground-canvas .lab-item {cursor:default;}
  @media(max-width:680px){#lab-playground-canvas {margin:20px 18px 34px}#lab-playground-canvas .lab-row {grid-template-columns:1fr;gap:22px}#lab-playground-canvas .lab-cell {min-height:120px}#lab-playground-canvas .lab-panel {padding:30px 30px}#lab-playground-canvas .lab-panel h2 {font-size:24px}#lab-playground-canvas .lab-panel p {font-size:15px} }
  `;
  function prepareFrame() {
    try {
      if(canvas && canvas.isConnected && iframeDoc===frame.contentDocument) return;
      iframeDoc=frame.contentDocument;
      if(!iframeDoc || !iframeDoc.querySelector('#main'))throw new Error('The homepage did not load.');
      const main=$('#main',iframeDoc);
      const preserved=$('.footer-nav-cards',main);
      heroSection=$('.hero',main);
      if(!preserved||!heroSection)throw new Error('The original hero or three blue cards were not found.');
      [...main.children].forEach(el=>{if(el!==preserved&&el!==heroSection)el.remove();});
      canvas=iframeDoc.createElement('div');canvas.id='lab-playground-canvas';canvas.setAttribute('aria-label','Editable subpage layout');main.insertBefore(canvas,preserved);
      const style=iframeDoc.createElement('style');style.textContent=iframeStyles;iframeDoc.head.appendChild(style);
      iframeDoc.body.classList.add('studio-iframe');
      iframeDoc.addEventListener('click',e=>{if(!preview && e.target.closest('a'))e.preventDefault();},true);
      iframeDoc.addEventListener('dragover',e=>{if(e.target.closest('#lab-playground-canvas'))e.preventDefault();});
      iframeDoc.addEventListener('drop',onFrameDrop);
      iframeDoc.addEventListener('keydown',onKeyDown);
      const page=$('.cardboard-page',iframeDoc);
      if('ResizeObserver' in window){new ResizeObserver(()=>resizeFrame()).observe(page);}
      iframeDoc.fonts?.ready.then(resizeFrame);
      render();setTimeout(resizeFrame,100);setTimeout(resizeFrame,700);
    } catch(error){console.error(error);toast('Preview could not initialise. Open from the published website.');}
  }
  function resizeFrame(){if(!iframeDoc)return;const stage=$('.cardboard-stage',iframeDoc);const page=$('.cardboard-page',iframeDoc);const bottom=stage?.getBoundingClientRect().bottom||page?.getBoundingClientRect().bottom||0;const height=Math.ceil(bottom+12);if(height>250 && Math.abs((parseFloat(frame.style.height)||0)-height)>2)frame.style.height=height+'px';}
  function nodeText(tag,text){const el=iframeDoc.createElement(tag);el.textContent=text;return el;}
  function renderItem(item) {
    const wrapper=iframeDoc.createElement('article');wrapper.className=`lab-item lab-${item.mode||'flow'}`;wrapper.dataset.id=item.id;wrapper.dataset.align=item.align||'left';wrapper.dataset.dark=['black-board','backboard','country-board'].includes(item.asset)?'true':'false';wrapper.dataset.label=String(item.asset?.startsWith('label-')||false);wrapper.tabIndex=preview?-1:0;
    wrapper.style.setProperty('--rotation',`${Number(item.rotation)||0}deg`);wrapper.style.setProperty('--item-width',`${clamp(Number(item.width)||100,10,180)}%`);
    wrapper.style.setProperty('--pos-x',`${Number(item.x)||0}%`);wrapper.style.setProperty('--pos-y',`${Number(item.y)||0}px`);wrapper.style.setProperty('--layer-z',String(item.z??2));
    wrapper.style.width=item.mode==='overlay'?`${clamp(Number(item.width)||100,10,180)}%`:`${clamp(Number(item.width)||100,10,180)}%`;
    if(selected.type==='item' && selected.itemId===item.id)wrapper.classList.add('is-selected');
    if(item.kind==='image'){
      const content=iframeDoc.createElement('div');content.className='lab-image';const img=iframeDoc.createElement('img');img.src=item.src;img.alt=item.asset?findAsset(item.asset)?.name||'Artwork':'Uploaded image';img.loading='lazy';img.addEventListener('load',()=>{syncOverlaySpace();resizeFrame();});content.appendChild(img);wrapper.appendChild(content);trimmedArtwork(item.src).then(src=>{if(img.isConnected&&img.src!==src)img.src=src;});
    } else {
      const content=iframeDoc.createElement('div');content.className=item.kind==='panel'?'lab-panel':'lab-text';if(item.kind==='panel'){content.style.setProperty('--lab-art',`url(${JSON.stringify(item.src)})`);trimmedArtwork(item.src).then(src=>{if(content.isConnected){content.style.setProperty('--lab-art',`url(${JSON.stringify(src)})`);syncOverlaySpace();resizeFrame();}});}
      if(item.title)content.appendChild(nodeText('h2',item.title));if(item.body)content.appendChild(nodeText('p',item.body));wrapper.appendChild(content);
    }
    const handle=iframeDoc.createElement('button');handle.className='lab-grab';handle.type='button';handle.textContent=item.mode==='overlay'?'✥ Drag anywhere':'⋮⋮ Move / reorder';handle.title=item.mode==='overlay'?'Drag this element anywhere on the page':'Drag this element to another column';wrapper.appendChild(handle);
    const resizer=iframeDoc.createElement('button');resizer.type='button';resizer.className='lab-resizer';resizer.textContent='↘';resizer.title='Resize overlay';wrapper.appendChild(resizer);
    const del=iframeDoc.createElement('button');del.type='button';del.className='lab-delete';del.textContent='× Delete';del.title='Delete selected element (Undo available)';del.setAttribute('aria-label','Delete selected element');del.addEventListener('pointerdown',e=>e.stopPropagation());del.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();deleteItem(item.id);});wrapper.appendChild(del);
    wrapper.addEventListener('click',e=>{if(preview)return;e.stopPropagation();selectItem(item.id);});
    wrapper.addEventListener('keydown',e=>{if(e.key==='Enter'&&!preview){selectItem(item.id);e.stopPropagation();}});
    wrapper.draggable=!preview && item.mode!=='overlay';
    wrapper.addEventListener('dragstart',e=>{if(preview||item.mode==='overlay'){e.preventDefault();return;}e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('application/x-qwerty-item',item.id);e.dataTransfer.setData('text/plain',`item:${item.id}`);});
    wrapper.addEventListener('pointerdown',e=>{if(preview||item.mode!=='overlay'||e.target.closest('.lab-resizer, .lab-delete'))return;startPointerMove(e,item.id,false);});
    resizer.addEventListener('pointerdown',e=>{if(preview||item.mode!=='overlay')return;startPointerMove(e,item.id,true);});
    return wrapper;
  }
  function onFrameDrop(e){
    if(preview || !e.target.closest('#lab-playground-canvas'))return;
    const cells=$$('.lab-cell',canvas);
    const dest=e.target.closest('.lab-cell') || cells.find(cell=>{
      const r=cell.getBoundingClientRect();
      return e.clientX>=r.left && e.clientX<=r.right && e.clientY>=r.top && e.clientY<=r.bottom;
    });
    if(!dest){toast('Drop onto a row or column');return;}
    e.preventDefault();e.stopPropagation();
    const toRow=getRow(dest.dataset.rowId),toCell=Number(dest.dataset.cell);
    if(!toRow||toCell>=toRow.columns)return;
    const plain=e.dataTransfer.getData('text/plain');
    const asset=e.dataTransfer.getData('application/x-qwerty-asset')||(plain.startsWith('asset:')?plain.slice(6):'');
    const itemId=e.dataTransfer.getData('application/x-qwerty-item')||(plain.startsWith('item:')?plain.slice(5):'');
    if(findAsset(asset)){addAsset(asset,toRow.id,toCell);return;}
    const f=lookupItem(itemId);if(!f || (f.row.id===toRow.id&&f.cellIndex===toCell))return;
    change(()=>{f.row.cells[f.cellIndex].splice(f.itemIndex,1);f.item.x=0;f.item.y=0;f.item.mode='flow';f.item.width=f.item.flowWidth||f.item.width;delete f.item.coordinateSpace;toRow.cells[toCell].push(f.item);});
    selectItem(f.item.id);toast('Element moved');
  }
  function startPointerMove(e,itemId,resizing){
    if(e.button!==0)return;
    e.preventDefault();e.stopPropagation();selectItem(itemId);
    const f=lookupItem(itemId);if(!f||!canvas)return;
    const item=f.item,rect=canvas.getBoundingClientRect();
    const start={x:e.clientX,y:e.clientY,pX:Number(item.x)||0,pY:Number(item.y)||0,w:Number(item.width)||100};
    const before=JSON.stringify(model);let moving=false;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const move=ev=>{
      moving=true;
      const dx=(ev.clientX-start.x)/rect.width*100,dy=ev.clientY-start.y;
      if(resizing)item.width=clamp(Math.round((start.w+dx)*10)/10,10,180);
      else{
        item.x=Math.round((start.pX+dx)*10)/10;
        item.y=Math.round(start.pY+dy);
      }
      const el=canvas.querySelector(`[data-id="${itemId}"]`);
      if(!el)return;
      el.style.setProperty('--pos-x',`${item.x}%`);
      el.style.setProperty('--pos-y',`${item.y}px`);
      el.style.setProperty('--item-width',`${item.width}%`);
      el.style.width=`${item.width}%`;
      syncOverlaySpace();resizeFrame();
    };
    const stop=()=>{
      iframeDoc.removeEventListener('pointermove',move);
      iframeDoc.removeEventListener('pointerup',stop);
      iframeDoc.removeEventListener('pointercancel',stop);
      if(moving){
        undoStack.push(before);if(undoStack.length>65)undoStack.shift();redoStack=[];
        updateHistoryButtons();status.textContent='Unsaved edits';drawInspector();
      }
    };
    iframeDoc.addEventListener('pointermove',move);
    iframeDoc.addEventListener('pointerup',stop);
    iframeDoc.addEventListener('pointercancel',stop);
  }
  function syncOverlaySpace(){
    if(!canvas)return;
    const bounds=canvas.getBoundingClientRect(),rows=$$('.lab-row',canvas);
    const flowBottom=rows.length?rows[rows.length-1].getBoundingClientRect().bottom-bounds.top:0;
    let overlayBottom=0;
    $$('.lab-item.lab-overlay',canvas).forEach(el=>{
      overlayBottom=Math.max(overlayBottom,el.getBoundingClientRect().bottom-bounds.top);
    });
    const needed=Math.max(32,Math.ceil(overlayBottom-flowBottom+38));
    if(canvas.style.paddingBottom!==`${needed}px`)canvas.style.paddingBottom=`${needed}px`;
  }
  function setOverlayMode(item,enabled){
    if(enabled){
      const node=canvas?.querySelector(`[data-id="${item.id}"]`);
      const bounds=canvas?.getBoundingClientRect(),rect=node?.getBoundingClientRect();
      item.flowWidth=Number(item.width)||100;
      item.mode='overlay';item.coordinateSpace='canvas';
      if(bounds?.width && rect){
        item.x=Math.round((rect.left-bounds.left)/bounds.width*1000)/10;
        item.y=Math.round(rect.top-bounds.top);
        item.width=clamp(Math.round(rect.width/bounds.width*1000)/10,10,180);
      }else{
        item.x=0;item.y=0;
      }
    }else{
      item.mode='flow';item.width=item.flowWidth||100;
      item.x=0;item.y=0;delete item.coordinateSpace;
    }
  }
  function render(){
    if(!canvas||painting)return;
    painting=true;canvas.replaceChildren();
    const overlays=[];
    model.rows.forEach((r,i)=>{
      const rowEl=iframeDoc.createElement('section');
      rowEl.className='lab-row';rowEl.dataset.rowId=r.id;
      rowEl.style.setProperty('--cols',r.columns);
      rowEl.style.setProperty('--row-min',`${r.minHeight||175}px`);
      const tag=nodeText('button',`ROW ${i+1} · ${r.columns} COL`);
      tag.type='button';tag.className='lab-row-tag';
      tag.addEventListener('click',e=>{e.stopPropagation();selectRow(r.id,0);});
      rowEl.appendChild(tag);
      r.cells.forEach((items,ci)=>{
        const cell=iframeDoc.createElement('div');
        cell.className='lab-cell';cell.dataset.rowId=r.id;
        cell.dataset.cell=ci;cell.dataset.hasItem=String(items.length>0);
        if(selected.type==='row'&&selected.rowId===r.id&&selected.cell===ci)cell.classList.add('is-cell-selected');
        const placeholder=nodeText('span','+ Select column · add an asset');
        placeholder.className='lab-cell-empty';cell.appendChild(placeholder);
        items.forEach(item=>{
          if(item.mode==='overlay')overlays.push({item,rowId:r.id,cellIndex:ci});
          else cell.appendChild(renderItem(item));
        });
        cell.addEventListener('click',e=>{if(preview)return;e.stopPropagation();selectRow(r.id,ci);});
        rowEl.appendChild(cell);
      });
      canvas.appendChild(rowEl);
    });
    // Upgrade old browser-saved overlays from column positions to page coordinates.
    const bounds=canvas.getBoundingClientRect();
    for(const {item,rowId,cellIndex} of overlays){
      if(item.coordinateSpace!=='canvas'){
        const cell=canvas.querySelector(`.lab-cell[data-row-id="${rowId}"][data-cell="${cellIndex}"]`);
        const rect=cell?.getBoundingClientRect();
        if(rect&&bounds.width){
          const originalWidth=Number(item.width)||100;
          item.flowWidth=originalWidth;
          item.x=Math.round((rect.left-bounds.left+(Number(item.x)||0)/100*rect.width)/bounds.width*1000)/10;
          item.y=Math.round(rect.top-bounds.top+(Number(item.y)||0)/100*rect.height);
          item.width=clamp(Math.round(originalWidth*rect.width/bounds.width*10)/10,10,180);
        }
        item.coordinateSpace='canvas';
      }
      canvas.appendChild(renderItem(item));
    }
    if(!model.rows.length && !preview){
      const hint=nodeText('div','Blank canvas · Choose 1, 2 or 3 columns in Structure to add a row.');
      hint.className='lab-empty-intro';canvas.appendChild(hint);
    }
    painting=false;
    renderHero();
    drawInspector();updateToolbar();
    syncOverlaySpace();resizeFrame();
  }
  function updateSelection(){if(!canvas)return;$$('.lab-item',canvas).forEach(el=>el.classList.toggle('is-selected',selected.type==='item'&&selected.itemId===el.dataset.id));$$('.lab-cell',canvas).forEach(el=>el.classList.toggle('is-cell-selected',selected.type==='row'&&selected.rowId===el.dataset.rowId&&selected.cell===Number(el.dataset.cell)));drawInspector();updateToolbar();}
  function updateToolbar(){$('#layout-name').textContent=model.name;const nameInput=$('#design-name');if(nameInput && document.activeElement!==nameInput)nameInput.value=model.name;let label='Select something to edit';if(selected.type==='item'){const f=lookupItem(selected.itemId);label=f?`${f.item.kind} · row ${f.rowIndex+1}, column ${f.cellIndex+1}`:'Item';}else if(selected.rowId){const i=model.rows.findIndex(x=>x.id===selected.rowId);label=`Row ${i+1} · column ${(selected.cell||0)+1}`;}$('#selection-indicator').textContent=label;}
  function drawInspector(){inspector.replaceChildren();if(selected.type==='item'){const f=lookupItem(selected.itemId);if(f)drawItemInspector(f);else drawRowInspector();}else drawRowInspector();}
  function field(label,value,type,onChange,opts={}){const wrap=document.createElement('div');wrap.className='field';const l=document.createElement('label');l.textContent=label;wrap.appendChild(l);let input;if(type==='textarea')input=document.createElement('textarea');else if(type==='select'){input=document.createElement('select');for(const [val,title] of opts.options||[]){const op=document.createElement('option');op.value=val;op.textContent=title;input.appendChild(op);}}else{input=document.createElement('input');input.type=type||'text';if(type==='range'){input.min=opts.min??0;input.max=opts.max??100;input.step=opts.step??1;}if(type==='number'){input.min=opts.min??-500;input.max=opts.max??9999;input.step=opts.step??1;}}
    input.value=String(value??'');if(type==='range'){const v=document.createElement('span');v.className='small-value';v.textContent=String(value);l.appendChild(v);input.addEventListener('input',()=>v.textContent=input.value);}
    const event=type==='textarea'||type==='text'?'change':'change';input.addEventListener(event,()=>onChange(type==='number'||type==='range'?Number(input.value):input.value));wrap.appendChild(input);return wrap;}
  function button(text,fn,cls=''){const b=document.createElement('button');b.type='button';b.textContent=text;if(cls)b.className=cls;b.addEventListener('click',fn);return b;}
  function twoButtons(list){const el=document.createElement('div');el.className='inspector-actions';list.forEach(([name,fn,cls])=>el.appendChild(button(name,fn,cls)));return el;}
  function drawRowInspector(){const r=getRow(selected.rowId);if(!r){inspector.appendChild(nodeText('p','No preset rows. Choose 1, 2 or 3 columns in Structure to add your first row.'));return;}const idx=model.rows.indexOf(r);inspector.appendChild(nodeText('div',`ROW ${idx+1} · COLUMN ${(selected.cell||0)+1}`)).className='inspector-title';
    inspector.appendChild(field('Columns',r.columns,'select',n=>change(()=>{const newCount=Number(n);if(newCount<r.columns){for(let i=newCount;i<r.columns;i++)r.cells[newCount-1].push(...r.cells[i]);r.cells.length=newCount;}else while(r.cells.length<newCount)r.cells.push([]);r.columns=newCount;selected.cell=clamp(selected.cell,0,newCount-1);}),{options:[[1,'1 · Full width'],[2,'2 · Side by side'],[3,'3 · Three across']]}));
    inspector.appendChild(field('Minimum row height (px)',r.minHeight||175,'range',n=>change(()=>r.minHeight=n),{min:120,max:750,step:10}));
    inspector.appendChild(twoButtons([['↑ Move row up',()=>moveRow(r.id,-1)],['↓ Move row down',()=>moveRow(r.id,1)]]));
    inspector.appendChild(twoButtons([['Duplicate row',()=>{const r2=copy(r);r2.id=id('row');r2.cells.forEach(a=>a.forEach(i=>i.id=id('item')));change(()=>model.rows.splice(model.rows.indexOf(r)+1,0,r2));selectRow(r2.id,0);}],['Delete row',()=>{change(()=>{model.rows.splice(model.rows.indexOf(r),1);selected={type:'row',rowId:model.rows[0]?.id??null,cell:0};});},'danger']]));
    const info=nodeText('p','Click any element to edit it. Drag the selected element into another column. Overlay mode lets you position items freely across rows and columns.');info.className='field-note';inspector.appendChild(info);
  }
  function moveRow(rowId,dir){const index=model.rows.findIndex(r=>r.id===rowId);const to=index+dir;if(to<0||to>=model.rows.length)return;change(()=>{const [r]=model.rows.splice(index,1);model.rows.splice(to,0,r);});}
  function liveCopyField(label,item,key){
    const value=item[key]||'';
    const wrap=field(label,value,key==='body'?'textarea':'text',()=>{});
    const input=wrap.querySelector(key==='body'?'textarea':'input');
    let began=false;
    const fit=()=>{
      if(key!=='body')return;
      input.style.height='auto';
      input.style.height=`${Math.min(input.scrollHeight,420)}px`;
    };
    input.addEventListener('input',()=>{
      if(!began){snapshot();began=true;}
      item[key]=input.value;
      const host=canvas?.querySelector(`[data-id="${item.id}"] .lab-panel, [data-id="${item.id}"] .lab-text`);
      if(host){
        const tag=key==='title'?'h2':'p';
        let textNode=host.querySelector(tag);
        if(input.value){
          if(!textNode){
            textNode=nodeText(tag,'');
            if(key==='title')host.prepend(textNode);else host.appendChild(textNode);
          }
          textNode.textContent=input.value;
        }else textNode?.remove();
      }
      fit();syncOverlaySpace();resizeFrame();status.textContent='Unsaved edits';
    });
    fit();return wrap;
  }
  function drawItemInspector(f){const item=f.item;const title=nodeText('div',`${item.kind.toUpperCase()} · ROW ${f.rowIndex+1} / COL ${f.cellIndex+1}`);title.className='inspector-title';inspector.appendChild(title);
    if(item.kind!=='image'){
      inspector.appendChild(liveCopyField('Heading',item,'title'));
      inspector.appendChild(liveCopyField('Copy',item,'body'));
      inspector.appendChild(field('Text align',item.align||'left','select',v=>change(()=>item.align=v),{options:[['left','Left'],['center','Centre'],['right','Right']]}));
    }
    const label=document.createElement('label');label.className='switch-label';const toggle=document.createElement('input');toggle.type='checkbox';toggle.checked=item.mode==='overlay';toggle.addEventListener('change',()=>change(()=>setOverlayMode(item,toggle.checked)));label.append(toggle,document.createTextNode('Overlay / free positioning'));inspector.appendChild(label);
    const hint=nodeText('span',item.mode==='overlay'?'Drag the element itself anywhere on the page. Resize from its bottom-right corner.':'Flow items expand with their content and stack in the column.');hint.className='hint-chip';inspector.appendChild(hint);
    inspector.appendChild(field('Width (%)',item.width||100,'range',v=>change(()=>item.width=v),{min:10,max:180,step:5}));
    inspector.appendChild(field('Rotation (degrees)',item.rotation||0,'range',v=>change(()=>item.rotation=v),{min:-20,max:20,step:1}));
    if(item.mode==='overlay'){
      const xy=document.createElement('div');xy.className='field-inline';xy.appendChild(field('Left (%)',item.x||0,'number',v=>change(()=>item.x=v),{min:-100,max:200}));xy.appendChild(field('Top (px)',item.y||0,'number',v=>change(()=>item.y=v),{min:-600,max:6000}));inspector.appendChild(xy);
      inspector.appendChild(field('Layer order',item.z??2,'range',v=>change(()=>item.z=v),{min:1,max:20,step:1}));
    }
    inspector.appendChild(twoButtons([['↑ Bring forward',()=>change(()=>item.z=clamp((item.z||2)+1,1,20))],['↓ Send behind',()=>change(()=>item.z=clamp((item.z||2)-1,1,20))]]));
    inspector.appendChild(twoButtons([['← Move column',()=>moveItemColumn(item.id,-1)],['Move column →',()=>moveItemColumn(item.id,1)]]));
    inspector.appendChild(twoButtons([['Duplicate',()=>{const newItem=copy(item);newItem.id=id('item');change(()=>f.row.cells[f.cellIndex].splice(f.itemIndex+1,0,newItem));selectItem(newItem.id);}],['Delete',()=>deleteItem(item.id),'danger']]));
    const tip=nodeText('p','Tip: while an overlay is selected, use arrow keys to nudge (1% sideways, 5px vertically). Hold Shift for bigger steps.');tip.className='field-note';inspector.appendChild(tip);
  }
  function moveItemColumn(itemId,direction){const f=lookupItem(itemId);if(!f)return;const target=f.cellIndex+direction;if(target<0||target>=f.row.columns){toast('That is the edge of this row');return;}change(()=>{f.row.cells[f.cellIndex].splice(f.itemIndex,1);f.row.cells[target].push(f.item);f.item.x=0;f.item.y=0;});selectItem(itemId);}
  function save(){try{localStorage.setItem(storageKey,JSON.stringify(model));savedSnapshot=JSON.stringify(model);status.textContent='Saved in this browser ✓';toast('Layout saved locally');}catch(e){toast('Browser storage is full. Use Export to save a JSON file.');}}
  function getVersions(){try{return JSON.parse(localStorage.getItem(versionKey)||'[]');}catch{return [];}}
  function drawVersions(){const host=$('#version-list');host.replaceChildren();const versions=getVersions();if(!versions.length){const hint=document.createElement('p');hint.className='tool-hint';hint.textContent='Save variations here to compare arrangements.';host.appendChild(hint);return;}
    for(const v of versions){const entry=document.createElement('div');entry.className='version-entry';const open=button('',()=>{if(!window.confirm(`Open “${v.name}”? Unsaved edits to your current design may be lost.`))return;snapshot();model=normalizeModel(copy(v.model));ensureSelection();selected={type:'row',rowId:model.rows[0]?.id??null,cell:0};render();status.textContent='Unsaved edits';toast(`Opened ${v.name}`);});open.textContent=v.name;const small=document.createElement('small');small.textContent=new Date(v.time).toLocaleString('en-AU',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});open.appendChild(small);const del=button('×',()=>{if(!window.confirm(`Delete saved variation “${v.name}”?`))return;try{localStorage.setItem(versionKey,JSON.stringify(getVersions().filter(x=>x.id!==v.id)));drawVersions();}catch{toast('Could not remove this version');}});del.title='Delete version';entry.append(open,del);host.appendChild(entry);}
  }
  function saveVersion(){try{const versions=getVersions();versions.unshift({id:id('version'),name:model.name||'Untitled',time:Date.now(),model:copy(model)});localStorage.setItem(versionKey,JSON.stringify(versions.slice(0,15)));drawVersions();save();toast('A new variation was saved');}catch{toast('Browser storage full: use Export instead');}}
  function exportJSON(){const blob=new Blob([JSON.stringify(model,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`qwerty-subpage-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('Layout exported');}
  function loadFromFile(file){if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(!validModel(data))throw new Error('Wrong format');snapshot();model=normalizeModel(data);selected={type:'row',rowId:model.rows[0]?.id??null,cell:0};if(Array.isArray(model.uploads)){model.uploads.forEach(a=>{if(!findAsset(a.id))catalog.push(a);});drawLibrary();}render();toast('Design opened');}catch(e){toast('This does not look like a Studio layout JSON file.');}};reader.readAsText(file);}
  function uploadImages(files){const valid=[...files].filter(f=>/^image\/(png|jpeg|webp|svg\+xml)$/.test(f.type));if(!valid.length)return;Promise.all(valid.map(file=>new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>{const a={id:id('upload'),name:file.name.replace(/\.[^.]*$/,''),group:'Your uploaded artwork',kind:'image',src:String(reader.result)};resolve(a);};reader.onerror=()=>resolve(null);reader.readAsDataURL(file);}))).then(assets=>{const good=assets.filter(Boolean);if(!good.length)return;change(()=>{for(const asset of good){catalog.push(asset);model.uploads.push(asset);}});drawLibrary();addAsset(good[0].id);toast(`${good.length} real image asset${good.length===1?'':'s'} imported`);});}
  function onKeyDown(e){const t=e.target;if(t instanceof HTMLElement && /input|textarea|select/i.test(t.tagName))return;const cmd=e.metaKey||e.ctrlKey;if(cmd&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();return;}if(preview||selected.type!=='item')return;const f=lookupItem(selected.itemId);if(!f)return;const item=f.item;if((e.key==='Delete'||e.key==='Backspace')&&!cmd){e.preventDefault();deleteItem(item.id);return;}if(item.mode==='overlay'&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const step=e.shiftKey?5:1;change(()=>{if(e.key==='ArrowLeft')item.x-=step;else if(e.key==='ArrowRight')item.x+=step;else if(e.key==='ArrowUp')item.y-=step*5;else item.y+=step*5;});}}
  function setViewport(name){stageWrap.classList.toggle('tablet',name==='tablet');stageWrap.classList.toggle('mobile',name==='mobile');$$('[data-viewport]').forEach(b=>{const active=b.dataset.viewport===name;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});$('#viewport-width').textContent=name==='mobile'?'390px · mobile':name==='tablet'?'768px · tablet':'Desktop · responsive';setTimeout(resizeFrame,280);}
  function setPreview(){preview=!preview;iframeDoc?.body.classList.toggle('studio-clean',preview);$('#toggle-preview').textContent=preview?'Edit':'Preview';$('#toggle-preview').classList.toggle('active',preview);render();toast(preview?'Clean preview enabled':'Editing enabled');}
  function switchTemplate(){
    if(!window.confirm('Clear the content canvas and return the hero to its starting settings? Save a version first to keep this arrangement.'))return;
    snapshot();model=blankTemplate();selected={type:'row',rowId:null,cell:0};render();
    status.textContent='Unsaved edits';toast('Blank canvas ready');
  }
  function restoreLegacyLayout(){
    let previous;
    try{previous=JSON.parse(localStorage.getItem(legacyStorageKey)||'null');}
    catch{toast('The previous layout is not readable');return;}
    if(!validModel(previous)){toast('No previous Studio layout saved in this browser');return;}
    if(!window.confirm('Load your earlier Studio canvas? Save the current layout first if needed.'))return;
    snapshot();model=normalizeModel(previous);
    selected={type:'row',rowId:model.rows[0]?.id??null,cell:0};
    if(Array.isArray(model.uploads))model.uploads.forEach(a=>{if(!findAsset(a.id))catalog.push(a);});
    drawLibrary();render();status.textContent='Unsaved edits';toast('Earlier Studio layout opened');
  }
  $$('[data-add-row]').forEach(b=>b.addEventListener('click',()=>addRow(Number(b.dataset.addRow))));
  $('#add-paragraph').addEventListener('click',()=>addText('paragraph'));
  $('#add-heading').addEventListener('click',()=>addText('heading'));
  $('#clear-canvas').addEventListener('click',switchTemplate);
  $('#restore-previous').addEventListener('click',restoreLegacyLayout);
  $('#asset-upload').addEventListener('change',e=>{uploadImages(e.target.files);e.target.value='';});
  $('#undo').addEventListener('click',undo);$('#redo').addEventListener('click',redo);
  $('#save-layout').addEventListener('click',save);
  $('#save-version').addEventListener('click',saveVersion);
  $('#design-name').addEventListener('change',e=>change(()=>model.name=e.target.value.trim()||'Untitled experiment'));
  $('#export-layout').addEventListener('click',exportJSON);
  $('#import-layout').addEventListener('click',()=>$('#import-file').click());$('#import-file').addEventListener('change',e=>{loadFromFile(e.target.files[0]);e.target.value='';});
  $('#toggle-preview').addEventListener('click',setPreview);
  $$('[data-viewport]').forEach(b=>b.addEventListener('click',()=>setViewport(b.dataset.viewport)));
  document.addEventListener('keydown',onKeyDown);
  frame.addEventListener('load',prepareFrame);
  // A cached homepage may finish loading before this deferred script executes.
  if(frame.contentDocument?.readyState==='complete' && frame.contentDocument.querySelector('#main'))prepareFrame();
  drawLibrary();drawVersions();updateHistoryButtons();updateToolbar();
  window.addEventListener('beforeunload',e=>{if(JSON.stringify(model)!==savedSnapshot){e.preventDefault();e.returnValue='';}});
})();
