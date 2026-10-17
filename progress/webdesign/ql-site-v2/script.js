/* Retain the approved responsive cardboard scaling and scene fade. */
"use strict";

/* Cross-browser layout scale. Firefox 157 supports `zoom`, but not length÷length typed arithmetic in CSS calc().
   Keep the cardboard source's 986px geometry and its exact min/max scaling limits. */
(() => {
  const updateScale = () => {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const scale = Math.max(0.70, Math.min(1.575, (viewportWidth - 84) / 986));
    document.documentElement.style.setProperty('--ql-cardboard-zoom', String(scale));
  };
  updateScale();
  window.addEventListener('resize', updateScale, {passive: true});
})();


/* Set the fade position from the actual laid-out heading, without scaling art. */
(()=>{
 const host=document.querySelector('.site');
 const project=document.getElementById('projects');
 const update=()=>{
  const relative=project.getBoundingClientRect().top-host.getBoundingClientRect().top;
  const mobile=window.innerWidth<=750;
  const w=window.innerWidth;
  const originalHeight=Math.max(285,Math.min(740,w*.36));
  const photoWidth=mobile?w:Math.max(w,originalHeight*3.227799);
  const available=photoWidth*1169/1346;
  const start=Math.max(100,Math.min(relative-55,available-(mobile?130:250)));
  const end=Math.min(start+360,available-2);
  host.style.setProperty('--top-fade-start',start+'px');
  host.style.setProperty('--top-fade-end',end+'px');
  [0.2,0.5,0.8].forEach((t,i)=>host.style.setProperty('--top-fade-stop'+(i+1),(start+(end-start)*t)+'px'));
 };
 new ResizeObserver(update).observe(document.querySelector('.cardboard-stage'));
 window.addEventListener('resize',update,{passive:true});
 window.addEventListener('load',update);update();
})();
