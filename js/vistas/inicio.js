'use strict';
function pageInicio(){
 const S=stats('all');
 const rp=S.reproceso;
 const cross=S.cross.length;
 const strip=[
  [DB.procesos.length,'Procesos registrados',''],
  [DB.actividades.length,'Actividades',`${DB.actividades.filter(a=>(a.problema||'').trim()).length} con problema descrito`],
  [DB.actores.length,'Actores',''],
  [rp.answered?rp.yes.length:null,'Reprocesos identificados',rp.answered?`de ${rp.answered} ${rp.answered===1?'actividad':'actividades'} con dato`:'Datos insuficientes'],
  [DB.entrevistas.length,'Entrevistas',''],
  [S.links.length,'Transferencias de información',`${cross} entre áreas`]
 ].map(([v,l,s])=>`<div>${v==null?`<div class="v small">Datos insuficientes</div>`:`<div class="v">${esc(v)}</div>`}<div class="l">${esc(l)}</div>${s&&v!=null?`<div class="s">${esc(s)}</div>`:''}</div>`).join('');
 const procs=DB.procesos.map(p=>{const as=DB.actividades.filter(a=>a.proceso===p.id);const c=as.length?avg(as.map(complete)):null;const ids=new Set(as.map(a=>a.id));return `<tr data-act="goproc" data-id="${p.id}" tabindex="0"><td><span class="name">${esc(p.nombre)}</span></td><td>${chip(p.estado)}</td><td>${as.length}</td><td>${DB.enlaces.filter(l=>ids.has(l.origen)).length}</td><td>${c==null?'<span class="dim">—</span>':`<div class="meter"><i><b style="width:${Math.round(c*100)}%"></b></i><span>${Math.round(c*100)}%</span></div>`}</td></tr>`}).join('');
 const gaps=CORE.map(k=>{const n=DB.actividades.filter(a=>filled(a,k)).length;return {k,n,r:DB.actividades.length?n/DB.actividades.length:0}}).sort((a,b)=>a.r-b.r).slice(0,7);
 const gapRows=DB.actividades.length?gaps.map(g=>`<div class="barrow gap"><span class="t" title="${esc(fieldLabel(g.k))}">${esc(fieldLabel(g.k))}</span><i><b style="width:${Math.round(g.r*100)}%"></b></i><span class="n">${g.n}/${DB.actividades.length}</span></div>`).join(''):'<p class="dim">Aún no hay actividades.</p>';
 const ents=DB.entrevistas.map(e=>`<li>${esc(e.personas)} <span class="muted">— ${esc(e.cargo)}${e.fecha?', '+esc(e.fecha):''}</span></li>`).join('')||'<li class="dim">Sin entrevistas registradas.</li>';
 return `<div class="page"><div class="ptitle"><div><h1>Resumen del levantamiento</h1><p>Herramienta para pasar de lo que se cuenta en las entrevistas a un proceso estructurado y analizable. Es cualitativa: Bercont no mide tiempos por actividad, así que las demoras y los reprocesos se registran como los describen las personas. Lo que aún no se ha levantado aparece como «Sin dato» y nunca se rellena por suposición.</p></div><button class="btn primary" data-act="new" data-e="actividades" data-go="mapear" type="button"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M7 2.5v9M2.5 7h9"/></svg>Nueva actividad</button></div>
 <ol class="steps" aria-label="Flujo de uso"><li><b>Entrevista</b></li><li><b>Registro de actores y actividades</b></li><li><b>Conexiones</b></li><li><b>Mapa gráfico</b></li><li><b>Esperas, reprocesos y transferencias</b></li><li><b>Indicadores</b></li><li><b>Datos para el ERP</b></li><li><b>Exportación</b></li></ol>
 <div class="strip">${strip}</div>
 <div class="cols2"><div class="panel"><h3>Estado del levantamiento</h3><p class="note">Haz clic en un proceso para verlo en el mapa. «Completitud» es el promedio de campos con dato en sus actividades.</p><div class="tblwrap" style="border:0"><table class="tbl"><thead><tr><th>Proceso</th><th>Estado</th><th>Actividades</th><th>Enlaces</th><th>Completitud</th></tr></thead><tbody>${procs||'<tr><td colspan="5" class="empty">Sin procesos.</td></tr>'}</tbody></table></div></div>
 <div><div class="panel" style="margin-bottom:20px"><h3>Qué preguntar en la próxima entrevista</h3><p class="note">Campos de las actividades con menos datos hasta ahora.</p>${gapRows}</div><div class="panel"><h3>Entrevistas registradas</h3><ul style="margin:0;padding-left:18px">${ents}</ul></div></div></div>${pendingHTML()}</div>`;
}


function pendingHTML(){
 const A=DB.actividades,gw=A.filter(a=>{const o=DB.enlaces.filter(l=>l.origen===a.id);return o.length>1&&typeof bpGwKind==='function'&&bpGwKind(o).pending});
 const items=[
  [A.filter(a=>!a.actor),'actividades sin actor asignado'],
  [A.filter(a=>a.estado==='Borrador'),'actividades en «Borrador» (detalle pendiente o actor no entrevistado)'],
  [gw,'compuertas por validar (salidas sin tipo de decisión)'],
  [A.filter(a=>/inferencia/i.test((a.observaciones||'')+(a.descripcion||''))),'actividades con una posible inferencia que requiere validación'],
  [A.filter(a=>/no especificad/i.test(a.observaciones||'')),'actividades con algún dato «no especificado» en la entrevista'],
  [DB.procesos.filter(p=>p.estado==='Borrador'),'procesos solo mencionados, sin levantar'],
  [DB.actores.filter(x=>x.tipo==='Interno'&&!A.some(a=>a.actor===x.id)),'actores internos sin actividades levantadas']];
 const li=items.filter(([l])=>l.length).map(([l,t])=>`<li><b>${l.length}</b><span>${esc(t)}: <span class="muted">${esc(l.slice(0,6).map(x=>x.nombre).join('; '))}${l.length>6?'…':''}</span></span></li>`).join('');
 return `<div class="panel" style="margin-top:20px"><h3>Lo que falta levantar o validar</h3><p class="note">Calculado con los datos registrados. Se marca en café en el mapa y en los formularios.</p>${li?`<ul class="gaplist">${li}</ul>`:'<p class="dim">No hay pendientes registrados.</p>'}</div>`;
}
