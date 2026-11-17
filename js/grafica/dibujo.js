'use strict';
/* ---- Dibujo ---- */
function bpDefs(){const m=(id,c)=>`<marker id="bpm-${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${c}"/></marker>`;
 return m('n','var(--edge)')+m('x','var(--xfer)')+m('r','var(--rework)')}
/* Cuadrícula de puntos del lienzo (se mueve con el zoom y el desplazamiento) */
const bpGridDef=()=>`<pattern id="bpgrid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="var(--grid)"/></pattern>`;
function bpCanvasSVG(markup,ghost){return `<defs>${bpDefs()}${bpGridDef()}</defs><rect id="gbg" width="100%" height="100%" fill="url(#bpgrid)"/><g id="world">${markup}${ghost?'<path id="gghost" d="" fill="none" stroke="var(--focus)" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#bpm-n)" pointer-events="none"/>':''}</g><g id="lanelabels"></g>`}
function bpLabel(x,y,t,kind,anchor){const w=bpLW(t),x0=anchor==='end'?x-w:anchor==='middle'?x-w/2:x;
 const col=kind==='rework'?'var(--rework)':kind==='wait'?'var(--wait)':'var(--ink)',bg=kind==='rework'?'var(--rework-bg)':kind==='wait'?'var(--wait-bg)':'var(--surface)';
 return `<rect x="${x0}" y="${y-11}" width="${w}" height="15" rx="4" fill="${bg}" stroke="var(--line)" stroke-width=".8"/><text x="${x0+w/2}" y="${y}" text-anchor="middle" font-size="10.5" fill="${col}">${esc(t)}</text>`}
/* Marcadores de tipo de tarea BPMN (esquina superior izquierda) */
const bpIcoUser=(x,y)=>`<g transform="translate(${x} ${y})" fill="none" stroke="var(--muted)" stroke-width="1.2"><title>Tarea de usuario</title><circle cx="7" cy="4.5" r="2.8"/><path d="M1.5 13.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></g>`;
const bpIcoHand=(x,y)=>`<g transform="translate(${x} ${y})" fill="none" stroke="var(--manual)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><title>Tarea manual</title><path d="${BP_HAND}"/></g>`;
function bpTask(n){const a=n.a,ac=ENT_get('actores',a.actor),ar=ac&&ENT_get('areas',ac.area),est=a.estado||'Borrador',gaps=UI.g.gaps!==false;
 const miss=CORE.filter(k=>!filled(a,k)).length,valid=est==='Validado',draft=est==='Borrador';
 const dot=valid?'var(--ok)':est==='Por validar'?'var(--wait)':'var(--dim)';
 const icon=a.manual==='Sí'?bpIcoHand(n.x+9,n.y+8):ac?bpIcoUser(n.x+9,n.y+8):'',idx=n.x+(icon?28:10);
 const lines=wrapText(a.nombre,24,3),y0=n.y+46-(lines.length-1)*7.5;
 const flags=[];if(a.espera==='Sí')flags.push(['E','var(--wait)','var(--wait-bg)','Hay espera']);if(a.reproceso==='Sí')flags.push(['R','var(--rework)','var(--rework-bg)','Hay reproceso']);
 const tip=`${a.nombre}\nActor: ${ac?ac.nombre:'sin actor'} · Área: ${ar?ar.nombre:'sin área'}\nEstado: ${est}${miss?`\nFaltan ${miss} de ${CORE.length} datos por levantar`:''}`;
 return `<g class="bp-el bp-task" data-k="${n.k}" data-nid="${a.id}" tabindex="0" role="button" aria-label="${esc(`${a.nombre}. Actor: ${ac?ac.nombre:'sin actor'}. Área: ${ar?ar.nombre:'sin área'}. Estado: ${est}. Enter para ver el detalle.`)}"><title>${esc(tip)}</title>
<rect class="bp-box" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="10" fill="${draft?'var(--surface2)':'var(--surface)'}" stroke="var(--task)" stroke-width="1.5"${draft?' stroke-dasharray="6 4"':''}/>
${icon}<text x="${idx}" y="${n.y+18}" font-size="9" fill="var(--dim)">${a.id}</text>
<circle cx="${n.x+n.w-13}" cy="${n.y+14}" r="4" fill="${dot}"><title>Estado: ${esc(est)}</title></circle>
${lines.map((l,i)=>`<text x="${n.cx}" y="${y0+i*15}" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink)">${esc(l)}</text>`).join('')}
${gaps&&!ac?`<text x="${n.x+10}" y="${n.y+n.h-9}" font-size="9.5" font-weight="600" fill="var(--gap)">sin actor</text>`:gaps&&miss?`<rect x="${n.x+7}" y="${n.y+n.h-19}" width="${bpLW('faltan '+miss)-4}" height="13" rx="6.5" fill="var(--gap-bg)"/><text x="${n.x+12}" y="${n.y+n.h-9.5}" font-size="9.5" fill="var(--gap)">faltan ${miss}</text>`:''}
${flags.map((f,i)=>`<g><title>${f[3]}</title><rect x="${n.x+n.w-22-i*17}" y="${n.y+n.h-19}" width="14" height="13" rx="3" fill="${f[2]}"/><text x="${n.x+n.w-15-i*17}" y="${n.y+n.h-9.5}" text-anchor="middle" font-size="9" font-weight="700" fill="${f[1]}">${f[0]}</text></g>`).join('')}</g>`}
function bpNode(n){const gaps=UI.g.gaps!==false,{cx,cy}=n;
 if(n.type==='task')return bpTask(n);
 if(n.type==='start')return `<g class="bp-el" data-k="${n.k}"><title>Inicio: ${esc(n.a.nombre)}</title><circle cx="${cx}" cy="${cy}" r="15" fill="var(--ok-bg)" stroke="var(--ok)" stroke-width="2.2"/></g>`;
 if(n.type==='end')return `<g class="bp-el" data-k="${n.k}"><title>Fin del camino: «${esc(n.a.nombre)}» no tiene enlaces de salida registrados.</title><circle cx="${cx}" cy="${cy}" r="14" fill="var(--surface)" stroke="var(--ink)" stroke-width="4"/><text x="${cx}" y="${cy+30}" text-anchor="middle" font-size="9.5" fill="${gaps?'var(--gap)':'var(--muted)'}">fin /</text><text x="${cx}" y="${cy+41}" text-anchor="middle" font-size="9.5" fill="${gaps?'var(--gap)':'var(--muted)'}">pendiente de levantar</text></g>`;
 if(n.type==='gw'){const r=BP.GW/2,pend=n.pending,s=pend&&gaps?'var(--gap)':'var(--ink)',mk=n.gt==='+'?`<path d="M${cx-9} ${cy} H${cx+9} M${cx} ${cy-9} V${cy+9}" stroke="${s}" stroke-width="3"/>`:`<path d="M${cx-7} ${cy-7} L${cx+7} ${cy+7} M${cx+7} ${cy-7} L${cx-7} ${cy+7}" stroke="${s}" stroke-width="3"/>`;
  return `<g class="bp-el" data-k="${n.k}"><title>${n.gt==='+'?'Compuerta paralela (+): todas las salidas ocurren a la vez':'Compuerta exclusiva (X): se toma una sola salida'}${pend?' · por validar. '+esc(n.why):''}</title><path d="M${cx} ${cy-r} L${cx+r} ${cy} L${cx} ${cy+r} L${cx-r} ${cy} Z" fill="${pend&&gaps?'var(--gap-bg)':'var(--surface)'}" stroke="${s}" stroke-width="1.8"${pend?' stroke-dasharray="4 3"':''}/>${mk}${pend&&gaps?`<text x="${cx}" y="${cy-r-6}" text-anchor="middle" font-size="9.5" font-weight="600" fill="var(--gap)">por validar</text>`:''}</g>`}
 const out=n.type==='linkout',p=ENT_get('procesos',n.proc),pn=p?p.nombre:'otro proceso',L=wrapText(pn,22,2);
 return `<g class="bp-el bp-link" data-k="${n.k}" data-goproc="${p?p.id:''}" tabindex="0" role="button" aria-label="${esc((out?'Continúa en ':'Viene de ')+pn+'. Enter para abrir ese proceso.')}"><title>${esc((out?'Continúa en: ':'Viene de: ')+pn+' (clic para abrir)')}</title><circle cx="${cx}" cy="${cy}" r="15" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.6"/><circle cx="${cx}" cy="${cy}" r="11.5" fill="none" stroke="var(--brand)" stroke-width="1.2"/><path d="M${cx-6} ${cy-3} H${cx} V${cy-7} L${cx+7} ${cy} L${cx} ${cy+7} V${cy+3} H${cx-6} Z" fill="${out?'var(--brand)':'none'}" stroke="var(--brand)" stroke-width="1.2"/>
<text x="${cx}" y="${cy+29}" text-anchor="middle" font-size="9.5" fill="var(--muted)">${out?'continúa en':'viene de'}</text>${L.map((t,i)=>`<text x="${cx}" y="${cy+41+i*11}" text-anchor="middle" font-size="9.5" font-weight="600" fill="var(--brand)">${esc(t)}</text>`).join('')}</g>`}
function bpEdge(e){const d='M'+e.pts.map(p=>p.map(v=>Math.round(v*10)/10).join(' ')).join(' L'),col=e.ret?'var(--rework)':e.x?'var(--xfer)':'var(--edge)',mk=e.ret?'r':e.x?'x':'n',sw=e.x?2.2:1.5;
 const l=e.l,tip=l?`${l.tipo||'Enlace'}${e.x?' · cambia de área':''}${l.condicion?'\nCondición: '+l.condicion:''}${l.infoTransferida?'\nInformación: '+l.infoTransferida:''}${l.medio?'\nMedio: '+l.medio:''}\nClic para editar el enlace`:'';
 return `<g class="bp-el bp-edge" data-k="e:${e.i}"${l?` data-lid="${l.id}"`:''}>${l?`<title>${esc(tip)}</title><path d="${d}" fill="none" stroke="transparent" stroke-width="12"/>`:''}<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}"${e.ret?' stroke-dasharray="6 4"':''} stroke-linejoin="round" marker-end="url(#bpm-${mk})"/></g>`}
function bpEdgeLabel(e){if(!e.labels.length)return '';const p=e.pts,n=p.length;let s='';
 if(e.dir==='f'){const[x2,y2]=p[n-1];e.labels.forEach((L,i)=>{s+=bpLabel(x2-6,i?y2+16:y2-5,L.t,L.c,'end')})}
 else{const[a,b]=[p[2],p[3]],mx=(a[0]+b[0])/2;e.labels.forEach((L,i)=>{s+=bpLabel(mx,a[1]-5+i*17,L.t,L.c,'middle')})}
 return `<g class="bp-el" data-k="e:${e.i}">${s}</g>`}
function bpLaneHead(ln,x,y,w,h,fs){const L=wrapText(ln.name,Math.max(6,Math.floor(h/(fs*.62))),2),col=ln.none?'var(--gap)':ln.ext?'var(--muted)':'var(--ink)',c=x+w/2,m=y+h/2;
 return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ln.none?'var(--gap-bg)':'var(--surface2)'}" stroke="var(--task)" stroke-width=".8"/>`+L.map((t,i)=>`<text transform="translate(${c+(i-(L.length-1)/2)*(fs+3)} ${m}) rotate(-90)" text-anchor="middle" dominant-baseline="central" font-size="${fs}" font-weight="600" fill="${col}">${esc(t)}</text>`).join('')}
/* Pool (franja del proceso) + carriles (áreas) + elementos */
function bpSVG(L){let s='';const P=BP.POOL;
 L.lanes.forEach((ln,i)=>{s+=`<rect x="${P}" y="${ln.top}" width="${L.W-P}" height="${ln.h}" fill="${ln.none?'var(--gap-bg)':i%2?'var(--surface2)':'var(--surface)'}"${ln.none?' fill-opacity=".5"':i%2?' fill-opacity=".55"':''}/>`+bpLaneHead(ln,P,ln.top,BP.HDR,ln.h,12)+(i<L.lanes.length-1?`<line x1="${P}" x2="${L.W}" y1="${ln.top+ln.h}" y2="${ln.top+ln.h}" stroke="var(--task)" stroke-width=".8"/>`:'')});
 const pt=wrapText(L.title||'Proceso',Math.max(8,Math.floor(L.H/8.2)),2),pc=P/2,pm=L.H/2;
 s+=`<rect x="0" y="0" width="${P}" height="${L.H}" fill="var(--chrome)" stroke="var(--task)" stroke-width="1.3"/>`+pt.map((t,i)=>`<text transform="translate(${pc+(i-(pt.length-1)/2)*15} ${pm}) rotate(-90)" text-anchor="middle" dominant-baseline="central" font-size="12.5" font-weight="600" fill="var(--chrome-ink)" letter-spacing=".02em">${esc(t)}</text>`).join('');
 s+=`<rect x="0" y="0" width="${L.W}" height="${L.H}" fill="none" stroke="var(--task)" stroke-width="1.3"/>`;
 const ord=L.E.slice().sort((a,b)=>(a.x?1:0)-(b.x?1:0));
 s+=ord.map(bpEdge).join('')+L.keys.map(k=>bpNode(L.N[k])).join('')+L.E.map(bpEdgeLabel).join('');return s}

function drawGraph(){
 const svg=$('#gsvg');if(!svg)return;
 if(UI.g.proceso==='__map'){bpDrawMap();return}
 const pid=UI.g.proceso||'',M=bpModel(pid),empty=$('#gempty'),note=$('#gnote');
 if(!M.acts.length){svg.innerHTML='';G.layout=null;G.markup='';svg.setAttribute('aria-label','Diagrama vacío');note.hidden=true;$('#gpanel').hidden=true;empty.hidden=false;bpMini();
  empty.innerHTML=`<div><p><b>${DB.procesos.length?(pid?'Este proceso aún no tiene tareas.':'Aún no hay actividades registradas.'):'Aún no hay procesos registrados.'}</b></p><p class="dim">El diagrama se arma solo con las tareas y flujos. Usa <b>Tarea</b> en la paleta de la izquierda para crear la primera.</p><button class="btn primary" data-act="${DB.procesos.length?'gtask':'gnewe'}" data-d="procesos" type="button">${DB.procesos.length?'Crear tarea':'Crear proceso'}</button></div>`;return}
 empty.hidden=true;
 const pname=pid?T('procesos',pid):'Todos los procesos';
 const L=computeLayout(M);L.title=pname;G.layout=L;G.markup=bpSVG(L);
 svg.innerHTML=bpCanvasSVG(G.markup,true);
 const gws=L.keys.filter(k=>L.N[k].type==='gw'),pend=gws.filter(k=>L.N[k].pending).length,ends=L.keys.filter(k=>L.N[k].type==='end').length,nl=M.inner.length+M.extIn.length+M.extOut.length;
 svg.setAttribute('aria-label',`Diagrama BPMN AS-IS de ${pname}: ${M.acts.length} tareas, ${nl} enlaces, ${gws.length} compuertas (${pend} por validar) y ${ends} finales, en los carriles ${L.lanes.map(l=>l.name).join(', ')}. Use Tab para recorrer las tareas.`);
 const gaps=UI.g.gaps!==false;note.hidden=false;
 note.innerHTML=!nl?'<span>Aún no hay flujos: cada tarea se muestra sola, con su inicio y su fin.</span>':`<span><b>${M.acts.length}</b> tareas</span><span><b>${L.lanes.length}</b> carriles</span><span><b>${gws.length}</b> compuertas${pend?` · <b class="${gaps?'gapc':''}">${pend} por validar</b>`:''}</span><span><b>${ends}</b> finales${gaps&&ends?' <b class="gapc">pendientes</b>':''}</span>`;
 if(UI.g.sel&&L.N['t:'+UI.g.sel]){const el=$(`#gsvg [data-nid="${UI.g.sel}"]`);if(el)el.classList.add('sel');showPanel(UI.g.sel);bpHighlight('t:'+UI.g.sel)}else{UI.g.sel=null;$('#gpanel').hidden=true}
 bpMini();applyView();if(typeof paintTool==='function')paintTool()}
function drawLaneLabels(){const g=$('#lanelabels'),L=G.layout;if(!g)return;if(!L||!L.lanes){g.innerHTML='';return}const v=UI.g.view;
 if(v.x+(BP.POOL+BP.HDR)*v.k>=6){g.innerHTML='';return}
 g.innerHTML=L.lanes.map(ln=>{const y=v.y+ln.top*v.k,h=ln.h*v.k;return h<24?'':bpLaneHead(ln,0,y,30,h,11)}).join('')}
function applyView(){const w=$('#world');if(!w)return;const v=UI.g.view;w.setAttribute('transform',`translate(${v.x} ${v.y}) scale(${v.k})`);
 const pat=$('#bpgrid');if(pat)pat.setAttribute('patternTransform',`translate(${v.x} ${v.y}) scale(${v.k})`);
 const z=$('#gzoomv');if(z)z.textContent=Math.round(v.k*100)+' %';
 drawLaneLabels();bpMiniView();if(typeof gvSave==='function')gvSave()}
function fitView(readable){const svg=$('#gsvg'),L=G.layout;if(!svg||!L)return;const r=svg.getBoundingClientRect();if(!r.width||!r.height)return;
 const pad=24,top=24,aw=r.width-pad*2,ah=r.height-top-pad;let k=Math.min(aw/L.W,ah/L.H,1.15);if(readable)k=Math.max(k,Math.min(.72,ah/L.H));k=Math.max(.08,k);
 UI.g.view={k,x:L.W*k<aw?(r.width-L.W*k)/2:pad,y:L.H*k<ah?top+(ah-L.H*k)/2:top};applyView()}
function zoomAt(f,cx,cy){const svg=$('#gsvg');if(!svg)return;if(cx==null){const r=svg.getBoundingClientRect();cx=r.width/2;cy=r.height/2}const v=UI.g.view,k=Math.max(.08,Math.min(2.5,v.k*f));v.x=cx-(cx-v.x)*(k/v.k);v.y=cy-(cy-v.y)*(k/v.k);v.k=k;applyView()}
