'use strict';
/* ============ Indicadores cualitativos ============ */
const QTYPES=[
 ['espera','Demoras y esperas','wait','Dónde cuentan que el trabajo se detiene o se demora.'],
 ['reproceso','Reprocesos','rework','Trabajo que se repite o vuelve atrás.'],
 ['solicitaInfo','Información que hay que volver a pedir','wait','Puntos donde la información llega incompleta y toca insistir.'],
 ['manual','Trabajo manual o en papel','manual','Pasos hechos a mano: Excel, impresiones, firmas, mensajes.'],
 ['duplicacion','Información duplicada','rework','La misma información se digita o registra más de una vez.'],
 ['transferenciaAreas','Traspasos entre áreas','xfer','La actividad entrega o recibe trabajo de otra área.']];
const actArea=a=>{const x=ENT_get('actores',a.actor);return x&&x.area?x.area:''};
const actMeta=a=>{const x=ENT_get('actores',a.actor);return [x?x.nombre:'Sin actor',x&&x.area?areaName(x.area):'',(ENT_get('procesos',a.proceso)||{}).nombre||''].filter(Boolean).join(' · ')};
function qItem(a,txt,extra){return `<li data-act="goact" data-id="${a.id}" tabindex="0" role="button" aria-label="Ver ${esc(a.nombre)} en el mapa"><div class="qh"><b>${esc(a.nombre)}</b>${extra||''}</div><div class="qm">${esc(actMeta(a))}</div>${txt?`<blockquote>${esc(clip(txt,260))}</blockquote>`:'<div class="qm gapc">Sin relato registrado.</div>'}</li>`}
function qStats(pid){
 const acts=DB.actividades.filter(a=>pid==='all'||a.proceso===pid);
 const ids=new Set(acts.map(a=>a.id));
 const links=DB.enlaces.filter(l=>ids.has(l.origen)&&ids.has(l.destino));
 const Q={acts,links,cross:links.filter(xarea),ret:links.filter(l=>l.tipo==='Retorno / reproceso')};
 QTYPES.forEach(([k])=>Q[k]=acts.filter(a=>a[k]==='Sí'));
 Q.dur=acts.filter(a=>(a.duracionDesc||'').trim());
 Q.pain=acts.filter(a=>(a.problema||'').trim()||QTYPES.some(([k])=>a[k]==='Sí'));
 const areas=[...new Set(acts.map(actArea))];
 const inX=new Set(Q.cross.flatMap(l=>[l.origen,l.destino]));const has=(a,k)=>a[k]==='Sí'||(k==='transferenciaAreas'&&inX.has(a.id));Q.has=has;
 Q.heat=areas.map(ar=>{const as=acts.filter(a=>actArea(a)===ar);return {ar,name:ar?areaName(ar):'Sin área / sin actor',n:as.length,c:QTYPES.map(([k])=>as.filter(a=>has(a,k)).length)}}).sort((a,b)=>b.c.reduce((s,x)=>s+x,0)-a.c.reduce((s,x)=>s+x,0)||a.name.localeCompare(b.name,'es'));
 Q.infer=acts.filter(a=>/inferencia/i.test((a.observaciones||'')+(a.descripcion||''))).length+links.filter(l=>/inferid|inferencia/i.test(l.observaciones||'')).length;
 return Q;
}
function heatHTML(Q){
 const mx=Math.max(1,...Q.heat.flatMap(h=>h.c));
 const lvl=n=>n===0?0:n/mx>0.66?3:n/mx>0.33?2:1;
 const word=['—','Poco mencionado','Mencionado','Muy mencionado'];
 return `<div class="tblwrap"><table class="tbl heat"><caption class="sr">Menciones de cada tipo de problema por área</caption><thead><tr><th>Área</th><th>Actividades</th>${QTYPES.map(([,l])=>`<th>${esc(l)}</th>`).join('')}</tr></thead><tbody>${Q.heat.map(h=>`<tr><td><span class="name">${esc(h.name)}</span></td><td>${h.n}</td>${h.c.map((n,i)=>`<td><span class="hcell l${lvl(n)} ${QTYPES[i][2]}" title="${esc(word[lvl(n)])}">${n?`<span class="pips" aria-hidden="true">${'<i></i>'.repeat(lvl(n))}</span><span class="hn">${n}</span>`:'<span class="dim">—</span>'}</span></td>`).join('')}</tr>`).join('')}</tbody></table></div>
 <p class="note" style="margin-top:8px"><span class="pips" aria-hidden="true"><i></i></span> poco mencionado · <span class="pips" aria-hidden="true"><i></i><i></i></span> mencionado · <span class="pips" aria-hidden="true"><i></i><i></i><i></i></span> muy mencionado (relativo a esta vista). El número es cuántas actividades lo mencionan (en traspasos: actividades que entregan o reciben de otra área), no una medición de tiempo.</p>`;
}
function stagesHTML(pid){
 const ps=DB.procesos.filter(p=>pid==='all'||p.id===pid);
 const rows=ps.map(p=>{const et=DB.etapas.filter(e=>e.proceso===p.id).sort((a,b)=>(num(a.orden)||0)-(num(b.orden)||0));if(!et.length)return '';
  return `<div class="stg"><div class="stg-h"><b>${esc(p.nombre)}</b>${chip(p.estado)}</div><ol class="stg-l">${et.map(e=>{const as=DB.actividades.filter(a=>a.etapa===e.id);const fl=QTYPES.filter(([k])=>as.some(a=>a[k]==='Sí')).map(([k,l,c])=>`<i class="dot ${c}" title="${esc(l)}"></i>`).join('');const dur=as.filter(a=>(a.duracionDesc||'').trim());
  return `<li class="${as.length?'':'empty-st'}"><span class="sn">${esc(e.nombre)}</span><span class="sc">${as.length} ${as.length===1?'actividad':'actividades'}${fl?` <span class="dots">${fl}</span>`:''}</span>${dur.length?`<span class="sd" title="${esc(dur.map(a=>a.nombre+': '+a.duracionDesc).join(' | '))}">${esc(clip(dur[0].duracionDesc,90))}</span>`:''}</li>`}).join('')}</ol></div>`}).join('');
 return rows||'<div class="val ins">No hay etapas registradas.</div>';
}
function pageIndicadores(){
 const pid=UI.ind.proceso,Q=qStats(pid),nA=Q.acts.length;
 const sel=`<select data-ind="proceso" aria-label="Proceso"><option value="all">Todos los procesos</option>${DB.procesos.map(p=>`<option value="${p.id}"${pid===p.id?' selected':''}>${esc(p.nombre)}</option>`).join('')}</select>`;
 if(!nA)return `<div class="page"><div class="ptitle"><div><h1>Indicadores cualitativos</h1></div>${sel}</div><div class="panel empty"><b>Aún no hay actividades para analizar</b>Registra actividades en «Mapear proceso».</div></div>`;
 const strip=[[Q.espera.length,'Demoras o esperas','actividades que las mencionan'],[Q.reproceso.length+Q.ret.length,'Reprocesos y retornos',`${Q.reproceso.length} ${Q.reproceso.length===1?'actividad':'actividades'} · ${Q.ret.length} ${Q.ret.length===1?'retorno':'retornos'}`],[Q.solicitaInfo.length,'Info que se vuelve a pedir','actividades'],[Q.manual.length,'Pasos manuales o en papel','actividades'],[Q.acts.filter(a=>Q.has(a,'transferenciaAreas')).length,'Traspasos entre áreas',`actividades · ${Q.cross.length} ${Q.cross.length===1?'enlace':'enlaces'} entre áreas`],[Q.infer,'Inferencias por validar','marcadas en actividades y enlaces']]
  .map(([v,l,s])=>`<div><div class="v">${v}</div><div class="l">${esc(l)}</div><div class="s">${esc(s)}</div></div>`).join('');
 const empt=[];
 const lists=QTYPES.map(([k,l,c,why])=>{const as=Q[k];if(k==='transferenciaAreas')return '';
  const ret=k==='reproceso'?Q.ret.map(r=>{const o=ENT_get('actividades',r.origen),d=ENT_get('actividades',r.destino);return o&&d?qItem(o,(r.observaciones||r.infoTransferida||''),` <span class="chip rework">Retorno → ${esc(clip(d.nombre,40))}</span>`):''}).join(''):'';
  const body=as.map(a=>qItem(a,(k==='reproceso'&&a.causaReproceso?'Causa: '+a.causaReproceso+'. ':'')+((k==='espera'&&a.duracionDesc)?a.duracionDesc:(a.problema||a.observaciones||'')))).join('')+ret;
  if(!body){empt.push(l);return ''}
  const n=(body.match(/<li /g)||[]).length;
  return `<div class="ind wide qcard"><h4>${chip(l,c)}<span class="qn">${n}</span></h4><div class="why" style="margin:2px 0 8px">${esc(why)}</div><ul class="qlist">${body}</ul></div>`}).join('');
 const durL=Q.dur.length?`<ul class="qlist">${Q.dur.map(a=>qItem(a,a.duracionDesc)).join('')}</ul>`:'<div class="val ins">No hay relatos de duración registrados.</div>';
 const flujo=[
  card('Recorridos entre áreas',Q.cross.length?bars(tally(Q.cross,l=>`${areaName(areaOfAct(l.origen))} → ${areaName(areaOfAct(l.destino))}`)):null,Q.cross.length?'Número de enlaces que cruzan cada par de áreas.':'No hay traspasos entre áreas en esta vista.',true),
  card('Actividades por área',bars(tally(Q.acts,a=>actArea(a)?areaName(actArea(a)):'Sin área')),'',true),
  card('Sistemas y herramientas que aparecen',(()=>{const m=new Map();Q.acts.forEach(a=>(a.sistemas||[]).forEach(s=>m.set(s,(m.get(s)||0)+1)));const l=[...m.entries()].map(([k,v])=>[T('sistemas',k)||k,v]).sort((a,b)=>b[1]-a[1]).slice(0,12);return l.length?bars(l):null})(),'Actividades que usan cada uno (máx. 12).',true)].join('');
 const S=stats(pid);
 const ORD={alert:0,watch:1,insufficient:2,none:3};
 const al=alertsFor(S).slice().sort((x,y)=>ORD[x.st]-ORD[y.st]).map(a=>{const i=a.detail.indexOf(': '),head=i>0?a.detail.slice(0,i)+'.':a.detail,list=i>0?a.detail.slice(i+2).replace(/\.$/,''):'';
  return `<div class="al ${a.st}"><div class="st">${chip(ALERT_LBL[a.st],{alert:'rework',watch:'wait',none:'ok',insufficient:''}[a.st])}</div><div><b>${esc(a.title)}</b><span>${esc(head)}</span>${list?`<details class="al-more"><summary>${/áreas/.test(a.title)?'Ver áreas':'Ver actividades'}</summary><span>${esc(list)}</span></details>`:''}</div></div>`}).join('');
 const decl=DB.indicadores.length?tableHTML('indicadores',DB.indicadores.filter(i=>pid==='all'||i.proceso===pid||!i.proceso),DB.indicadores.length):`<div class="tblwrap"><div class="empty"><b>Aún no hay indicadores declarados</b>Registra los que cada área dice medir hoy.</div></div>`;
 return `<div class="page"><div class="ptitle"><div><h1>Indicadores cualitativos</h1><p>Lo que las personas cuentan sobre demoras, reprocesos y traspasos, organizado por área y etapa.</p></div>${sel}</div>
 <div class="qnote" role="note"><b>Cómo se trata el tiempo en esta herramienta.</b> Bercont no mide tiempos por actividad. El tiempo que sí se controla es la duración de cada proyecto, que Proyectos divide por fases y tareas en Project y sigue con semáforo. Los reprocesos y las demoras se registran como los describen las personas, con sus palabras.</div>
 <div class="strip">${strip}</div>
 <div class="sec"><h3>Mapa de dolor por área</h3><span>Qué tipo de problema mencionan en cada área</span></div>${heatHTML(Q)}
 <div class="sec"><h3>Lo que cuentan las personas</h3><span>Haz clic en un punto para verlo en el mapa</span></div><div class="igrid q2">${lists}</div>${empt.length?`<p class="note">Nadie lo ha mencionado en esta vista: ${empt.map(esc).join(', ')}.</p>`:''}
 <div class="sec"><h3>Duración y fases</h3><span>Etapas de cada proceso y cómo describen su duración</span></div><div class="ind" style="margin-bottom:14px"><h4>Recorrido por etapas</h4><div class="why" style="margin:2px 0 10px">Cada tarjeta es una etapa, en orden. Los puntos indican qué tipo de problema mencionan; el borde punteado café, una etapa sin actividades.</div>${stagesHTML(pid)}</div><div class="ind qcard" style="margin-bottom:22px"><h4>Cómo describen la duración</h4><div class="why" style="margin:2px 0 8px">Relatos registrados en el campo «Duración o demora».</div>${durL.replace('class="qlist"','class="qlist cols"')}</div>
 <div class="sec"><h3>Flujo de información</h3></div><div class="igrid">${flujo}</div>
 <div class="sec"><h3>Alertas</h3><span>Se activan con ≥${CFG.ALERT_MIN_COUNT} actividades y ≥${pct(CFG.ALERT_RATE)} de las que tienen dato; ≥${CFG.XFER_ALERT} traspasos entre áreas.</span></div><div class="alerts">${al}</div>
 <div class="sec"><h3>Indicadores que la empresa dice medir hoy</h3><span>Declarados en las entrevistas</span><button class="btn sm primary" style="margin-left:auto" data-act="new" data-e="indicadores" type="button"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M7 2v10M2 7h10"/></svg>Agregar</button></div><div id="results">${decl}</div>
 <p class="disclaimer">Este diagnóstico es descriptivo y depende de lo levantado en las entrevistas. No señala responsables.</p></div>`;
}

