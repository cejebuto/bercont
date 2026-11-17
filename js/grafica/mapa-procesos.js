'use strict';
/* ---- Mapa de procesos (vista general) ---- */
const MP={W:252,H:142,GX:96,GY:36,PAD:28};
function bpMapModel(){
 const P=DB.procesos.map(p=>{const acts=DB.actividades.filter(a=>a.proceso===p.id),ids=new Set(acts.map(a=>a.id));
  const actors=new Set(acts.map(a=>a.actor).filter(Boolean)),areas=new Set(acts.map(a=>bpLaneKey(a)));
  const outs={};acts.forEach(a=>outs[a.id]=DB.enlaces.filter(l=>l.origen===a.id));
  const gwPend=acts.filter(a=>outs[a.id].length>1&&bpGwKind(outs[a.id]).pending).length;
  const noActor=acts.filter(a=>!a.actor).length,draft=acts.filter(a=>a.estado==='Borrador').length;
  const ends=acts.filter(a=>!outs[a.id].length).length;
  const fl={espera:0,reproceso:0,manual:0,solicitaInfo:0};acts.forEach(a=>Object.keys(fl).forEach(k=>{if(a[k]==='Sí')fl[k]++}));
  return{p,id:p.id,acts,ids,actors,areas:[...areas].filter(k=>k!=='_'),sinArea:areas.has('_'),gwPend,noActor,draft,ends,fl}});
 const byId={};P.forEach(n=>byId[n.id]=n);
 const EM={};DB.enlaces.forEach(l=>{const o=ENT_get('actividades',l.origen),d=ENT_get('actividades',l.destino);if(!o||!d||o.proceso===d.proceso||!byId[o.proceso]||!byId[d.proceso])return;
  const k=o.proceso+'>'+d.proceso,e=EM[k]||(EM[k]={from:o.proceso,to:d.proceso,ls:[],ret:0});e.ls.push(l);if(bpIsRet(l))e.ret++});
 return{P,E:Object.values(EM),byId}}
function bpMapLayout(M){
 const{P,E,byId}=M,n=P.length;P.forEach(x=>{x.col=0;x.row=0});
 const fwd=E.filter(e=>e.ret<e.ls.length);const adj={};P.forEach(x=>adj[x.id]=[]);fwd.forEach(e=>adj[e.from].push(e));
 const st={};P.forEach(r=>{if(st[r.id])return;st[r.id]=1;const S=[[r.id,0]];while(S.length){const t=S[S.length-1],ed=adj[t[0]];if(t[1]<ed.length){const e=ed[t[1]++];if(st[e.to]===1)e.back=true;else if(!st[e.to]){st[e.to]=1;S.push([e.to,0])}}else{st[t[0]]=2;S.pop()}}});
 const dag=fwd.filter(e=>!e.back),indeg={},succ={};P.forEach(x=>{indeg[x.id]=0;succ[x.id]=[]});dag.forEach(e=>{indeg[e.to]++;succ[e.from].push(e.to)});
 const q=P.filter(x=>!indeg[x.id]).map(x=>x.id);while(q.length){const k=q.shift();succ[k].forEach(t=>{byId[t].col=Math.max(byId[t].col,byId[k].col+1);if(!--indeg[t])q.push(t)})}
 const linked=new Set();E.forEach(e=>{linked.add(e.from);linked.add(e.to)});
 const maxCol=Math.max(0,...P.filter(x=>linked.has(x.id)).map(x=>x.col));
 const conn=P.filter(x=>linked.has(x.id)),alone=P.filter(x=>!linked.has(x.id));
 const rows={};conn.forEach(x=>{x.row=rows[x.col]||0;rows[x.col]=x.row+1});
 const topRows=Math.max(1,...Object.values(rows));
 alone.forEach((x,i)=>{x.col=i;x.row=topRows;x.alone=true});
 const cols=Math.max(maxCol+1,alone.length),W=MP.PAD*2+cols*MP.W+(cols-1)*MP.GX,rowsN=topRows+(alone.length?1:0);
 const sepH=alone.length?40:0,H=MP.PAD*2+rowsN*MP.H+(rowsN-1)*MP.GY+sepH;
 P.forEach(x=>{x.x=MP.PAD+x.col*(MP.W+MP.GX);x.y=MP.PAD+x.row*(MP.H+MP.GY)+(x.alone?sepH:0);x.cx=x.x+MP.W/2;x.cy=x.y+MP.H/2});
 const sepY=alone.length?MP.PAD+topRows*(MP.H+MP.GY)-MP.GY/2+sepH/2:null;
 return{W,H,P,E,byId,sepY,alone:alone.length}}
function bpMapCard(x){
 const gaps=UI.g.gaps!==false,p=x.p,est=p.estado||'',lines=wrapText(p.nombre,30,3);
 const stroke=est==='Validado'?'var(--edge)':est==='Borrador'?'var(--dim)':'var(--wait)',dash=est==='Validado'?'':est==='Borrador'?' stroke-dasharray="3 3"':' stroke-dasharray="7 4"';
 const pend=x.noActor+x.gwPend+x.draft,areas=x.areas.map(id=>areaName(id)).join(' · ')+(x.sinArea?(x.areas.length?' · ':'')+'sin área':'');
 const flags=[['espera','E','var(--wait)','var(--wait-bg)','esperas'],['reproceso','R','var(--rework)','var(--rework-bg)','reprocesos'],['manual','M','var(--manual)','var(--manual-bg)','pasos manuales']].filter(f=>x.fl[f[0]]);
 const tip=`${p.nombre}\nEstado: ${est||'sin estado'}\n${x.acts.length} actividades · ${x.actors.size} actores\nÁreas: ${areas||'—'}${pend&&gaps?`\n${pend} ${pend===1?'pendiente':'pendientes'} de levantar o validar`:''}\nClic para abrir el diagrama`;
 return `<g class="bp-el bp-link bp-card" data-k="p:${x.id}" data-goproc="${x.id}" tabindex="0" role="button" aria-label="${esc(`Proceso ${p.nombre}. ${x.acts.length} actividades. Estado ${est}. Enter para abrir el diagrama.`)}"><title>${esc(tip)}</title>
<rect x="${x.x}" y="${x.y}" width="${MP.W}" height="${MP.H}" rx="12" fill="${est==='Borrador'?'var(--surface2)':'var(--surface)'}" stroke="${stroke}" stroke-width="1.7"${dash}/>
<text x="${x.x+12}" y="${x.y+16}" font-size="9" fill="var(--dim)">${x.id} · ${esc(est)}</text>
${lines.map((l,i)=>`<text x="${x.x+12}" y="${x.y+35+i*15}" font-size="12.5" font-weight="600" fill="var(--ink)">${esc(l)}</text>`).join('')}
<text x="${x.x+12}" y="${x.y+88}" font-size="10.5" fill="var(--muted)">${x.acts.length} ${x.acts.length===1?'actividad':'actividades'} · ${x.actors.size} ${x.actors.size===1?'actor':'actores'}${x.ends?` · ${x.ends} ${x.ends===1?'final':'finales'}`:''}</text>
<text x="${x.x+12}" y="${x.y+102}" font-size="10" fill="var(--muted)">${esc(clip(areas||'Sin actividades',44))}</text>
${pend&&gaps?`<rect x="${x.x+10}" y="${x.y+MP.H-24}" width="${bpLW(pend+(pend===1?' pendiente':' pendientes'))-2}" height="15" rx="7.5" fill="var(--gap-bg)"/><text x="${x.x+16}" y="${x.y+MP.H-13}" font-size="10" fill="var(--gap)">${pend} ${pend===1?'pendiente':'pendientes'}</text>`:''}
${flags.map((f,i)=>`<g><title>${x.fl[f[0]]} ${f[4]}</title><rect x="${x.x+MP.W-26-i*20}" y="${x.y+MP.H-24}" width="17" height="15" rx="3" fill="${f[3]}"/><text x="${x.x+MP.W-17.5-i*20}" y="${x.y+MP.H-13}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${f[2]}">${f[1]}</text></g>`).join('')}</g>`}
function bpMapEdge(e,L){
 const A=L.byId[e.from],B=L.byId[e.to],allRet=e.ret===e.ls.length,fwd=B.col>A.col||(B.col===A.col&&B.row>A.row);
 const col=allRet?'var(--rework)':'var(--xfer)',mk=allRet?'r':'x';let d,lx,ly;
 if(B.col>A.col){const x1=A.x+MP.W,y1=A.cy+(A.id<B.id?-10:10),x2=B.x,y2=B.cy+(A.id<B.id?-10:10),mx=(x1+x2)/2;d=`M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;lx=mx;ly=(y1+y2)/2-8}
 else if(B.col<A.col){const x1=A.cx-24,y1=A.y+MP.H,x2=B.cx+24,y2=B.y+MP.H,yy=Math.max(y1,y2)+22;d=`M${x1} ${y1} L${x1} ${yy} L${x2} ${yy} L${x2} ${y2+2}`;lx=(x1+x2)/2;ly=yy-5}
 else{const x=A.cx,y1=fwd?A.y+MP.H:A.y,y2=fwd?B.y:B.y+MP.H;d=`M${x} ${y1} L${x} ${y2}`;lx=x+8;ly=(y1+y2)/2}
 const info=[...new Set(e.ls.map(l=>l.infoTransferida).filter(Boolean))],tip=`${A.p.nombre} → ${B.p.nombre}\n${e.ls.length} ${e.ls.length===1?'enlace':'enlaces'}${e.ret?` (${e.ret} de retorno / reproceso)`:''}${info.length?'\n· '+info.slice(0,4).join('\n· '):''}`;
 const lab=`${e.ls.length} ${e.ls.length===1?'entrega':'entregas'}${e.ret?' · '+e.ret+' reproceso':''}`;
 return `<g class="bp-el bp-edge" data-k="pe:${e.from}>${e.to}"><title>${esc(tip)}</title><path d="${d}" fill="none" stroke="transparent" stroke-width="12"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${allRet?1.6:2.4}"${allRet?' stroke-dasharray="6 4"':''} marker-end="url(#bpm-${mk})"/>${bpLabel(lx,ly,lab,allRet?'rework':'cond','middle')}</g>`}
function bpMapSVG(L){
 let s='';
 if(L.alone)s+=`<line x1="${MP.PAD}" x2="${L.W-MP.PAD}" y1="${L.sepY}" y2="${L.sepY}" stroke="var(--line)" stroke-dasharray="4 4"/><text x="${MP.PAD}" y="${L.sepY-7}" font-size="10.5" fill="var(--muted)">Procesos sin entregas registradas hacia otros procesos</text>`;
 s+=L.E.map(e=>bpMapEdge(e,L)).join('')+L.P.map(bpMapCard).join('');return s}
function bpDrawMap(){
 const svg=$('#gsvg'),empty=$('#gempty'),note=$('#gnote');
 if(!DB.procesos.length){svg.innerHTML='';G.layout=null;G.markup='';note.hidden=true;$('#gpanel').hidden=true;empty.hidden=false;
  empty.innerHTML=`<div><p><b>Aún no hay procesos registrados.</b></p><button class="btn primary" data-act="new" data-e="procesos">+ Agregar proceso</button></div>`;return}
 empty.hidden=true;$('#gpanel').hidden=true;UI.g.sel=null;
 const M=bpMapModel(),L=bpMapLayout(M);G.layout=L;G.markup=bpMapSVG(L);
 svg.innerHTML=bpCanvasSVG(G.markup,false);
 const nl=L.E.reduce((s,e)=>s+e.ls.length,0);
 svg.setAttribute('aria-label',`Mapa de procesos: ${L.P.length} procesos y ${nl} entregas entre procesos. Use Tab para recorrer los procesos y Enter para abrir uno.`);
 note.hidden=false;note.innerHTML=`<span><b>${L.P.length}</b> procesos</span><span><b>${nl}</b> ${nl===1?'entrega':'entregas'} entre procesos</span><span class="muted">Clic en un proceso para abrir su diagrama</span>`;
 const mini=$('#gmini');if(mini)mini.hidden=true;
 applyView()}

