'use strict';
/* ---- Resaltado de caminos, selección, herramientas y teclado ---- */
function bpReach(k){const L=G.layout,on=new Set([k]),eo=new Set(),S=[k];
 while(S.length){const c=S.pop();L.E.forEach(e=>{if(e.from!==c)return;eo.add(e.i);if(e.ret){on.add(e.to);return}if(!on.has(e.to)){on.add(e.to);S.push(e.to)}})}return{on,eo}}
function bpHighlight(k){const svg=$('#gsvg');if(!svg)return;const els=$$('#world [data-k]');
 if(!k||!G.layout||!G.layout.N||!G.layout.N[k]){svg.classList.remove('hl');els.forEach(x=>x.classList.remove('on'));return}
 const R=bpReach(k);svg.classList.add('hl');els.forEach(x=>{const v=x.dataset.k;x.classList.toggle('on',v.startsWith('e:')?R.eo.has(+v.slice(2)):R.on.has(v))})}
const bpRest=()=>bpHighlight(G.hover||(UI.g.sel?'t:'+UI.g.sel:null));
function bpSelect(id){UI.g.sel=id;$$('#gsvg .bp-task.sel').forEach(x=>x.classList.remove('sel'));const el=$(`#gsvg [data-nid="${id}"]`);if(el){el.classList.add('sel');if(document.activeElement!==el)el.focus({preventScroll:true})}showPanel(id);bpHighlight('t:'+id)}
function bpClear(){UI.g.sel=null;$$('#gsvg .bp-task.sel').forEach(x=>x.classList.remove('sel'));const p=$('#gpanel');if(p)p.hidden=true;bpRest()}
function bpGoProc(id){if(!id||!ENT_get('procesos',id))return;UI.g.proceso=id;UI.g.sel=null;UI.g.fitNext=true;render()}
function bpNeighbor(id,dir){const L=G.layout,k='t:'+id,me=L.N[k],tasks=L.keys.filter(x=>L.N[x].type==='task').map(x=>L.N[x]);
 const walk=(start,fwd)=>{const res=[],seen=new Set([start]),S=[start];while(S.length){const c=S.shift();L.E.forEach(e=>{if(e.ret)return;const nx=fwd?(e.from===c&&e.to):(e.to===c&&e.from);if(!nx||seen.has(nx))return;seen.add(nx);if(L.N[nx].type==='task')res.push(L.N[nx]);else S.push(nx)})}return res};
 let c=[];if(dir==='ArrowRight')c=walk(k,true);else if(dir==='ArrowLeft')c=walk(k,false);
 else{const down=dir==='ArrowDown';c=tasks.filter(n=>n!==me&&(down?n.cy>me.cy+1:n.cy<me.cy-1));c.sort((a,b)=>Math.abs(a.cx-me.cx)-Math.abs(b.cx-me.cx)||Math.abs(a.cy-me.cy)-Math.abs(b.cy-me.cy));return c[0]}
 c.sort((a,b)=>Math.abs(a.cy-me.cy)-Math.abs(b.cy-me.cy));return c[0]}
function bpEnsureVisible(n){const svg=$('#gsvg'),r=svg.getBoundingClientRect(),v=UI.g.view,x=v.x+n.x*v.k,y=v.y+n.y*v.k,w=n.w*v.k,h=n.h*v.k;
 if(x<40||y<10||x+w>r.width-10||y+h>r.height-10){v.x=r.width/2-n.cx*v.k;v.y=r.height/2-n.cy*v.k;applyView()}}

function initGraph(){
 const svg=$('#gsvg');if(!svg)return;
 drawGraph();if(UI.g.fitNext){UI.g.fitNext=false;if(gvRestore())applyView();else fitView(true)}
 /* El panel de propiedades se acopla a la derecha: al abrirse o cerrarse cambia el tamaño del lienzo */
 const wrap=$('.gwrap');if(wrap&&window.ResizeObserver){let t=null;new ResizeObserver(()=>{clearTimeout(t);t=setTimeout(()=>{bpMini();drawLaneLabels()},60)}).observe(wrap)}
 svg.addEventListener('wheel',e=>{e.preventDefault();const r=svg.getBoundingClientRect();zoomAt(e.deltaY<0?1.12:1/1.12,e.clientX-r.left,e.clientY-r.top)},{passive:false});
 svg.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0&&e.button!==1)return;
  const hand=G.tool==='hand'||e.button===1;
  const n=!hand&&e.target.closest('[data-nid]'),go=!hand&&e.target.closest('[data-goproc]'),lk=!hand&&e.target.closest('[data-lid]');
  G.drag={x:e.clientX,y:e.clientY,moved:false,vx:UI.g.view.x,vy:UI.g.view.y,nid:n&&n.dataset.nid,go:go&&go.dataset.goproc,lid:!n&&!go&&lk?lk.dataset.lid:null};
  svg.setPointerCapture(e.pointerId)});
 svg.addEventListener('pointermove',e=>{const d=G.drag;
  if(!d){if(G.from&&LINK_TOOLS.includes(G.tool))gGhost(gWorldPt(e));
   const n=e.target.closest&&e.target.closest('[data-nid]'),k=n?'t:'+n.dataset.nid:null;if(k!==G.hover){G.hover=k;bpRest()}return}
  const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!d.moved&&Math.hypot(dx,dy)<4)return;d.moved=true;svg.classList.add('grabbing');UI.g.view.x=d.vx+dx;UI.g.view.y=d.vy+dy;applyView()});
 const end=()=>{const d=G.drag;G.drag=null;svg.classList.remove('grabbing');if(!d||d.moved)return;
  if(d.nid){if(!toolPick(d.nid))bpSelect(d.nid)}
  else if(d.go){if(!LINK_TOOLS.includes(G.tool))bpGoProc(d.go)}
  else if(d.lid){if(G.tool==='select')openForm('enlaces',d.lid)}
  else if(G.tool==='select')bpClear()};
 svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',()=>{G.drag=null;svg.classList.remove('grabbing')});
 svg.addEventListener('pointerleave',()=>{gGhost(null);if(!G.drag&&G.hover){G.hover=null;bpRest()}});
 svg.addEventListener('focusin',e=>{const n=e.target.closest&&e.target.closest('[data-nid]');if(n){bpHighlight('t:'+n.dataset.nid);const L=G.layout;if(L&&L.N['t:'+n.dataset.nid])bpEnsureVisible(L.N['t:'+n.dataset.nid])}});
 svg.addEventListener('focusout',()=>setTimeout(()=>{if(!svg.contains(document.activeElement))bpRest()},0));
 svg.addEventListener('keydown',e=>{const n=e.target.closest&&e.target.closest('[data-nid]'),go=e.target.closest&&e.target.closest('[data-goproc]');
  if(e.key==='Escape'){if(G.tool==='select')bpClear();return}
  if(go&&(e.key==='Enter'||e.key===' ')){e.preventDefault();bpGoProc(go.dataset.goproc);return}
  if(!n)return;const id=n.dataset.nid;
  if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!toolPick(id))bpSelect(id);return}
  if(e.key.startsWith('Arrow')){e.preventDefault();const t=bpNeighbor(id,e.key);if(t){const el=$(`#gsvg [data-nid="${t.a.id}"]`);if(el)el.focus()}}});
}
