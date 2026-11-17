'use strict';
/* ---- Minimapa ---- */
function bpMini(){
 const wrap=$('.gwrap'),L=G.layout;let m=$('#gmini');
 if(!wrap||!L||UI.g.proceso==='__map'||!L.lanes||(typeof GP!=='undefined'&&!GP.mini)){if(m)m.hidden=true;return}
 if(!m){m=document.createElementNS('http://www.w3.org/2000/svg','svg');m.id='gmini';m.setAttribute('class','gmini');m.setAttribute('aria-hidden','true');wrap.appendChild(m);
  m.addEventListener('pointerdown',e=>{e.stopPropagation();const r=m.getBoundingClientRect(),k=G.miniK||1,svg=$('#gsvg'),R=svg.getBoundingClientRect(),v=UI.g.view;
   const wx=(e.clientX-r.left)/k,wy=(e.clientY-r.top)/k;v.x=R.width/2-wx*v.k;v.y=R.height/2-wy*v.k;applyView()})}
 const R0=wrap.getBoundingClientRect(),MW=Math.max(200,Math.min(340,R0.width*.24)),k=Math.max(Math.min(MW/L.W,130/L.H),Math.min(48/L.H,Math.min(460,R0.width*.34)/L.W));G.miniK=k;const W=Math.ceil(L.W*k),H=Math.ceil(L.H*k);
 m.setAttribute('width',W);m.setAttribute('height',H);m.setAttribute('viewBox',`0 0 ${W} ${H}`);
 let s=`<rect width="${W}" height="${H}" fill="var(--surface)"/>`;
 L.lanes.forEach((ln,i)=>{s+=`<rect x="0" y="${ln.top*k}" width="${W}" height="${ln.h*k}" fill="${ln.none?'var(--gap-bg)':i%2?'var(--surface2)':'var(--surface)'}"/>`});
 L.keys.forEach(key=>{const n=L.N[key];if(n.type!=='task')return;const a=n.a;s+=`<rect x="${n.x*k}" y="${n.y*k}" width="${Math.max(2,n.w*k)}" height="${Math.max(2,n.h*k)}" rx="1" fill="${a.estado==='Validado'?'var(--edge)':a.estado==='Borrador'?'var(--dim)':'var(--wait)'}" fill-opacity=".85"/>`});
 s+=`<rect id="gminivp" x="0" y="0" width="0" height="0" fill="var(--brand)" fill-opacity=".08" stroke="var(--brand)" stroke-width="1.2"/>`;
 m.innerHTML=s;m.hidden=false;bpMiniView()}
function bpMiniView(){
 const m=$('#gmini'),vp=$('#gminivp'),L=G.layout,svg=$('#gsvg');if(!m||m.hidden||!vp||!L||!svg)return;
 const r=svg.getBoundingClientRect(),v=UI.g.view,k=G.miniK||1;
 const x=(-v.x/v.k)*k,y=(-v.y/v.k)*k,w=(r.width/v.k)*k,h=(r.height/v.k)*k;
 const full=x<=0.5&&y<=0.5&&x+w>=L.W*k-0.5&&y+h>=L.H*k-0.5;
 m.style.opacity=full?'0':'1';m.style.pointerEvents=full?'none':'auto';
 vp.setAttribute('x',Math.max(0,x).toFixed(1));vp.setAttribute('y',Math.max(0,y).toFixed(1));vp.setAttribute('width',Math.max(0,Math.min(w,L.W*k-Math.max(0,x))).toFixed(1));vp.setAttribute('height',Math.max(0,Math.min(h,L.H*k-Math.max(0,y))).toFixed(1))}

