'use strict';
/* ============ Vista gráfica: diagrama BPMN AS-IS (generado desde DB) ============ */
const BP={TW:184,TH:84,GW:42,EV:32,ROWH:128,HDR:46,POOL:34,PADL:30,GAP:58,TRK:8};
/* Mano de «tarea manual» (BPMN), caja 14×14 */
const BP_HAND='M3.4 8.2V3.6a1 1 0 0 1 2 0V7M5.4 6.6V2.6a1 1 0 0 1 2 0v4M7.4 6.6V3.2a1 1 0 0 1 2 0v3.6M9.4 7a1 1 0 0 1 2 0v2.4a4.4 4.4 0 0 1-4.4 4.4h-.4a4 4 0 0 1-3.3-1.7L1.4 9.4a1 1 0 0 1 1.6-1.1l.4.5';
const G={drag:null,layout:null,hover:null,markup:''};
const bpIsRet=l=>!!l&&l.tipo==='Retorno / reproceso';
function wrapText(s,n,max){const w=String(s||'').split(/\s+/).filter(Boolean),L=[];let c='';w.forEach(x=>{if((c+' '+x).trim().length>n&&c){L.push(c);c=x}else c=(c+' '+x).trim()});if(c)L.push(c);if(L.length>max){L.length=max;L[max-1]=clip(L[max-1],n-1)+'…'}return L}
const bpLW=t=>Math.round(String(t).length*5.6+14);
function bpLaneKey(a){const ac=a&&ENT_get('actores',a.actor);return ac&&ac.area&&ENT_get('areas',ac.area)?ac.area:'_'}
function bpLaneOrder(used){const ids=[...DB.areas.filter(a=>a.tipo!=='Externa'),...DB.areas.filter(a=>a.tipo==='Externa')].map(a=>a.id).filter(id=>used.has(id));if(used.has('_'))ids.push('_');return ids}
function bpGwKind(ls){const v=ls.map(l=>l.compuerta||''),set=v.filter(Boolean),kinds=[...new Set(set)];
 if(!set.length)return{t:'X',pending:true,why:'Compuerta sin definir en los enlaces: se dibuja Exclusiva por defecto.'};
 if(kinds.length>1)return{t:'X',pending:true,why:'Los enlaces de salida tienen compuertas distintas.'};
 const part=set.length<v.length;return{t:kinds[0]==='Paralela'?'+':'X',pending:part,why:part?'Algunos enlaces de salida no tienen compuerta.':''}}
function bpModel(pid){
 const acts=DB.actividades.filter(a=>!pid||a.proceso===pid),ids=new Set(acts.map(a=>a.id)),inner=[],extOut=[],extIn=[];
 DB.enlaces.forEach(l=>{const o=ids.has(l.origen),d=ids.has(l.destino);
  if(o&&d)inner.push(l);else if(o&&ENT_get('actividades',l.destino))extOut.push(l);else if(d&&ENT_get('actividades',l.origen))extIn.push(l)});
 return{acts,inner,extOut,extIn}}
function bpEdgeLabels(e){if(!e.l)return[];const r=[];const c=(e.cond||'').trim();
 if(e.ret)r.push({t:'reproceso'+(c?' · '+clip(c,24):''),c:'rework'});else if(c)r.push({t:clip(c,34),c:'cond'});
 const w=num(e.l.tiempoEspera);if(w>0)r.push({t:'espera '+fmtMin(w),c:'wait'});return r}

function computeLayout(M){
 const N={},E=[],outs={},ins={};
 const node=(k,o)=>(N[k]=Object.assign({k,col:0,slot:-1},o));
 const ordOf=a=>{const v=num(a&&a.orden);return v==null?999:v};
 M.acts.forEach(a=>{outs[a.id]=[];ins[a.id]=[];node('t:'+a.id,{type:'task',a,lane:bpLaneKey(a),ord:ordOf(a)})});
 M.inner.forEach(l=>{outs[l.origen].push({l,to:'t:'+l.destino});ins[l.destino].push(l)});
 M.extOut.forEach(l=>{const o=ENT_get('actividades',l.origen),d=ENT_get('actividades',l.destino),k='xo:'+l.id;node(k,{type:'linkout',l,proc:d.proceso,lane:bpLaneKey(o),ord:ordOf(o),after:'t:'+o.id});outs[l.origen].push({l,to:k})});
 M.extIn.forEach(l=>{const o=ENT_get('actividades',l.origen),d=ENT_get('actividades',l.destino),k='xi:'+(o.proceso||'_')+':'+d.id;ins[l.destino].push(l);
  if(N[k]){N[k].ls.push(l);return}node(k,{type:'linkin',l,ls:[l],proc:o.proceso,lane:bpLaneKey(d),ord:ordOf(d),anchor:'t:'+d.id});E.push({from:k,to:'t:'+d.id,l})});
 M.acts.forEach(a=>{const t='t:'+a.id,o=outs[a.id],{lane,ord}=N[t];
  if(!o.length){node('e:'+a.id,{type:'end',a,lane,ord});E.push({from:t,to:'e:'+a.id})}
  else if(o.length===1)E.push({from:t,to:o[0].to,l:o[0].l});
  else{const g='g:'+a.id,gk=bpGwKind(o.map(x=>x.l));node(g,{type:'gw',a,lane,ord,gt:gk.t,pending:gk.pending,why:gk.why});E.push({from:t,to:g});o.forEach(x=>E.push({from:g,to:x.to,l:x.l,cond:x.l.condicion||''}))}
  if(!ins[a.id].some(l=>!bpIsRet(l))){node('s:'+a.id,{type:'start',a,lane,ord,anchor:t});E.push({from:'s:'+a.id,to:t})}});
 E.forEach((e,i)=>{e.i=i;e.ret=bpIsRet(e.l);e.x=!!(e.l&&xarea(e.l))});
 const rank=n=>({start:0,linkin:0,task:1,gw:2,end:3,linkout:3})[n.type];
 const hasIn={};E.forEach(e=>{if(!e.ret)hasIn[e.to]=1});
 const keys=Object.keys(N).sort((p,q)=>(hasIn[p]?1:0)-(hasIn[q]?1:0)||N[p].ord-N[q].ord||rank(N[p])-rank(N[q])||p.localeCompare(q));
 // 1) Aristas de retroceso (ciclos) por DFS, ignorando los enlaces de retorno
 const adj={};keys.forEach(k=>adj[k]=[]);E.forEach(e=>{if(!e.ret)adj[e.from].push(e)});
 const st={};keys.forEach(r=>{if(st[r])return;st[r]=1;const S=[[r,0]];
  while(S.length){const top=S[S.length-1],ed=adj[top[0]];if(top[1]<ed.length){const e=ed[top[1]++];if(st[e.to]===1)e.back=true;else if(!st[e.to]){st[e.to]=1;S.push([e.to,0])}}else{st[top[0]]=2;S.pop()}}});
 // 2) Columna = camino más largo (orden topológico)
 const dag=E.filter(e=>!e.ret&&!e.back),succ={},pred={},indeg={};
 keys.forEach(k=>{succ[k]=[];pred[k]=[];indeg[k]=0});dag.forEach(e=>{succ[e.from].push(e.to);pred[e.to].push(e.from);indeg[e.to]++});
 const q=keys.filter(k=>!indeg[k]),topo=[];
 while(q.length){const k=q.shift();topo.push(k);succ[k].forEach(t=>{N[t].col=Math.max(N[t].col,N[k].col+1);if(!--indeg[t])q.push(t)})}
 // acercar tareas iniciales a su primer sucesor y pegar inicio/entradas a su tarea
 topo.slice().reverse().forEach(k=>{const n=N[k];if(n.type!=='task'||!succ[k].length)return;
  if(pred[k].every(p=>['start','linkin'].includes(N[p].type))){const m=Math.min(...succ[k].map(s=>N[s].col))-1;if(m>n.col)n.col=m}});
 keys.forEach(k=>{const n=N[k];if(n.anchor&&N[n.anchor])n.col=Math.max(0,N[n.anchor].col-1);if(n.after&&N[n.after])n.col=Math.max(n.col,N[n.after].col+1)});
 const usedCols=[...new Set(keys.map(k=>N[k].col))].sort((a,b)=>a-b),cmap={};usedCols.forEach((c,i)=>cmap[c]=i);keys.forEach(k=>N[k].col=cmap[N[k].col]);
 const C=usedCols.length;
 // 3) Fila = carril del área + posición dentro del carril
 const occ={},place=(n,pref)=>{const key=n.lane+'|'+n.col,c=occ[key]||(occ[key]=new Set());const s=Math.max(0,Math.round(pref||0));
  for(let d=0;;d++){if(!c.has(s+d)){n.slot=s+d;break}if(s-d>=0&&!c.has(s-d)){n.slot=s-d;break}}c.add(n.slot)};
 const late=k=>['start','linkin'].includes(N[k].type);
 for(let c=0;c<C;c++){keys.filter(k=>N[k].col===c&&!late(k)).map(k=>{const n=N[k],ps=pred[k].map(p=>N[p]).filter(p=>p.slot>=0&&p.lane===n.lane);n._p=ps.length?avg(ps.map(p=>p.slot)):0;n._h=ps.length?0:1;return n})
  .sort((a,b)=>a._h-b._h||a._p-b._p||a.ord-b.ord||a.k.localeCompare(b.k)).forEach(n=>place(n,n._p))}
 keys.filter(late).map(k=>N[k]).sort((a,b)=>(N[a.anchor]?N[a.anchor].slot:0)-(N[b.anchor]?N[b.anchor].slot:0)).forEach(n=>{const t=N[n.anchor];place(n,t?t.slot:0)});
 const rows={};keys.forEach(k=>{const n=N[k];rows[n.lane]=Math.max(rows[n.lane]||0,n.slot+1)});
 let y=0;const lanes=bpLaneOrder(new Set(Object.keys(rows))).map(id=>{const ar=ENT_get('areas',id),h=rows[id]*BP.ROWH,ln={id,top:y,h,name:id==='_'?'Sin área':ar.nombre,ext:!!(ar&&ar.tipo==='Externa'),none:id==='_'};y+=h;return ln});
 const laneBy={};lanes.forEach(l=>laneBy[l.id]=l);
 // 4) Anchos de columna y de canal (espacio para etiquetas)
 const foot=n=>n.type==='task'?BP.TW:n.type==='gw'?BP.GW:n.type==='end'?118:n.type.startsWith('link')?132:BP.EV;
 const colW=new Array(C).fill(0),gN=new Array(C).fill(0),gL=new Array(C).fill(0);
 keys.forEach(k=>{const n=N[k];colW[n.col]=Math.max(colW[n.col],foot(n))});
 E.forEach(e=>{const A=N[e.from],B=N[e.to];e.labels=bpEdgeLabels(e);
  if(B.col>A.col){gN[B.col-1]++;if(B.col>A.col+1)gN[A.col]++;if(!e.ret)gL[B.col-1]=Math.max(gL[B.col-1],...e.labels.map(x=>bpLW(x.t)),0)}else gN[A.col]++});
 const gapW=gN.map((n,c)=>Math.max(BP.GAP,22+BP.TRK*Math.max(0,n-1)+(gL[c]?gL[c]+12:16)));
 const colX=[BP.POOL+BP.HDR+BP.PADL];for(let c=1;c<C;c++)colX[c]=colX[c-1]+colW[c-1]+gapW[c-1];
 const W=colX[C-1]+colW[C-1]+gapW[C-1],H=Math.max(y,BP.ROWH);
 keys.forEach(k=>{const n=N[k],ln=laneBy[n.lane],cx=colX[n.col]+colW[n.col]/2,cy=ln.top+n.slot*BP.ROWH+BP.ROWH/2,w=n.type==='task'?BP.TW:n.type==='gw'?BP.GW:BP.EV,h=n.type==='task'?BP.TH:w;Object.assign(n,{cx,cy,w,h,x:cx-w/2,y:cy-h/2})});
 // 5) Enrutado ortogonal por canales (entre columnas) y corredores (entre filas)
 const chan={},corr={},CO=[5,-5,11,-11,17,-17];
 const chx=c=>{const n=chan[c]||0;chan[c]=n+1;return colX[c]+colW[c]+10+Math.min(n*BP.TRK,Math.max(0,gapW[c]-30))};
 const coy=b=>{const n=corr[b]||0;corr[b]=n+1;return b+CO[n%CO.length]};
 const reach=n=>n.type==='end'||n.type.startsWith('link')?34:6;
 const free=(yy,c1,c2)=>!keys.some(k=>{const n=N[k];return n.col>=c1&&n.col<=c2&&yy>=n.y-6&&yy<=n.y+n.h+reach(n)});
 const inF={},inB={};E.forEach(e=>{const A=N[e.from],B=N[e.to];(B.col>A.col?(inF[e.to]=inF[e.to]||[]):(inB[e.to]=inB[e.to]||[])).push(e)});
 Object.values(inF).forEach(a=>{a.sort((p,q)=>N[p.from].cy-N[q.from].cy);const B=N[a[0].to],st=a.length>1?Math.min(12,(B.h-14)/(a.length-1)):0;a.forEach((e,i)=>e.ey=B.cy+(i-(a.length-1)/2)*st)});
 Object.values(inB).forEach(a=>{a.sort((p,q)=>N[q.from].cx-N[p.from].cx);const B=N[a[0].to];a.forEach((e,i)=>e.ex=B.cx+(i-(a.length-1)/2)*16)});
 E.forEach(e=>{const A=N[e.from],B=N[e.to],x1=A.x+A.w,y1=A.cy;
  if(B.col>A.col){const x2=B.x,y2=e.ey;e.dir='f';
   if(B.col===A.col+1){if(Math.abs(y1-y2)<.5)e.pts=[[x1,y1],[x2,y2]];else{const g=chx(A.col);e.pts=[[x1,y1],[g,y1],[g,y2],[x2,y2]]}}
   else if(free(y1,A.col+1,B.col-1)){if(Math.abs(y1-y2)<.5)e.pts=[[x1,y1],[x2,y2]];else{const g=chx(B.col-1);e.pts=[[x1,y1],[g,y1],[g,y2],[x2,y2]]}}
   else if(free(y2,A.col+1,B.col-1)){const g=chx(A.col);e.pts=[[x1,y1],[g,y1],[g,y2],[x2,y2]]}
   else{const ln=laneBy[A.lane],b=y2>y1?ln.top+(A.slot+1)*BP.ROWH:ln.top+A.slot*BP.ROWH,cy=coy(b),ga=chx(A.col),gb=chx(B.col-1);e.pts=[[x1,y1],[ga,y1],[ga,cy],[gb,cy],[gb,y2],[x2,y2]]}}
  else{const ln=laneBy[B.lane],cy=coy(ln.top+(B.slot+1)*BP.ROWH),ga=chx(A.col);e.dir='b';e.pts=[[x1,y1],[ga,y1],[ga,cy],[e.ex,cy],[e.ex,B.y+B.h]]}});
 return{N,E,lanes,laneBy,keys,W,H,colX,colW,C}}

