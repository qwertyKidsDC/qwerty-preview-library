(function(){
const slides=[...document.querySelectorAll('.slide')]; if(!slides.length)return;
const page=document.body.dataset.deck||'deck'; let current=0;
const saved=JSON.parse(localStorage.getItem('ql:'+page+':done')||'[]');
function show(n){current=Math.max(0,Math.min(slides.length-1,n));slides.forEach((s,i)=>s.classList.toggle('active',i===current));
document.querySelector('[data-count]').textContent=(current+1)+' / '+slides.length;
document.querySelector('[data-progress]').style.width=((current+1)/slides.length*100)+'%';
document.querySelector('[data-prev]').disabled=current===0;document.querySelector('[data-next]').disabled=current===slides.length-1;
document.querySelector('.dots').innerHTML=slides.map((s,i)=>'<span class="dot '+(saved.includes(i)?'on ':'')+(i===current?'here':'')+'" title="'+(i+1)+'"></span>').join('');
history.replaceState(null,'','#'+(current+1));}
document.querySelector('[data-prev]').onclick=()=>show(current-1);
document.querySelector('[data-next]').onclick=()=>{if(!saved.includes(current)){saved.push(current);localStorage.setItem('ql:'+page+':done',JSON.stringify(saved));}show(current+1)};
document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')document.querySelector('[data-next]').click();if(e.key==='ArrowLeft')document.querySelector('[data-prev]').click();});
const h=parseInt(location.hash.slice(1),10);show(Number.isFinite(h)?h-1:0);
})();