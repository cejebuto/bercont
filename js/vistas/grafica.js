'use strict';
/* ---- Página y panel lateral ---- */
function pageGrafica(){const g=UI.g;if(g.gaps===undefined)g.gaps=true;if(g.proceso&&g.proceso!=='__map'&&!ENT_get('procesos',g.proceso))g.proceso='__map';
 const sw=(svg,t)=>`<span><svg viewBox="0 0 30 18" width="30" height="18" aria-hidden="true">${svg}</svg>${t}</span>`;
 const legend=[
  sw('<circle cx="15" cy="9" r="7" fill="var(--ok-bg)" stroke="var(--ok)" stroke-width="2"/>','Evento de inicio'),
  sw('<circle cx="15" cy="9" r="6.5" fill="var(--surface)" stroke="var(--ink)" stroke-width="3"/>','Evento de fin'),
  sw('<rect x="2" y="3" width="26" height="12" rx="3" fill="var(--surface)" stroke="var(--task)" stroke-width="1.4"/><circle cx="24" cy="6.5" r="2" fill="var(--ok)"/>','Tarea validada'),
  sw('<rect x="2" y="3" width="26" height="12" rx="3" fill="var(--surface)" stroke="var(--task)" stroke-width="1.4"/><circle cx="24" cy="6.5" r="2" fill="var(--wait)"/>','Tarea por validar'),
  sw('<rect x="2" y="3" width="26" height="12" rx="3" fill="var(--surface2)" stroke="var(--task)" stroke-width="1.4" stroke-dasharray="4 3"/>','Tarea en borrador'),
  sw('<g transform="translate(8 2)" fill="none" stroke="var(--muted)" stroke-width="1.3"><circle cx="7" cy="4.5" r="2.8"/><path d="M1.5 13.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></g>','Tarea de usuario (tiene actor)'),
  sw('<g transform="translate(8 2)" fill="none" stroke="var(--manual)" stroke-width="1.3"><path d="'+BP_HAND+'"/></g>','Tarea manual'),
  sw('<path d="M15 1 L23 9 L15 17 L7 9 Z" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.4"/><path d="M12 6 L18 12 M18 6 L12 12" stroke="var(--ink)" stroke-width="2"/>','Compuerta exclusiva'),
  sw('<path d="M15 1 L23 9 L15 17 L7 9 Z" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.4"/><path d="M11 9 H19 M15 5 V13" stroke="var(--ink)" stroke-width="2"/>','Compuerta paralela'),
  sw('<path d="M2 9 H24" stroke="var(--edge)" stroke-width="1.5"/><path d="M22 5 L29 9 L22 13 z" fill="var(--edge)"/>','Flujo'),
  sw('<path d="M2 9 H24" stroke="var(--xfer)" stroke-width="2.8"/><path d="M22 5 L29 9 L22 13 z" fill="var(--xfer)"/>','Cambio de área'),
  sw('<path d="M2 9 H24" stroke="var(--rework)" stroke-width="1.5" stroke-dasharray="4 3"/><path d="M22 5 L29 9 L22 13 z" fill="var(--rework)"/>','Retorno / reproceso'),
  sw('<circle cx="15" cy="9" r="7" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.3"/><path d="M11 7.5 H15 V5 L19 9 L15 13 V10.5 H11 Z" fill="var(--brand)"/>','Otro proceso'),
  sw('<rect x="3" y="4" width="24" height="10" rx="5" fill="var(--gap-bg)"/><path d="M15 2 L19 6 L15 10 L11 6Z" fill="none"/><text x="15" y="12" text-anchor="middle" font-size="8" fill="var(--gap)">falta</text>','Falta levantar')].join('');
 const map=g.proceso==='__map';
 const opts=`<option value="__map"${map?' selected':''}>Mapa de procesos (vista general)</option><option value=""${g.proceso===''?' selected':''}>Todos los procesos (unidos por sus entregas)</option>${DB.procesos.map(p=>`<option value="${p.id}"${p.id===g.proceso?' selected':''}>${esc(p.nombre)}</option>`).join('')}`;
 const help=`<div class="ghelp" id="ghelp"${GP.help?'':' hidden'} role="note" aria-label="Cómo usar el modelador">
  <div class="gph"><b>Cómo leer y editar el diagrama</b><button class="btn ghost sm ico" data-act="ghelp" type="button" aria-label="Cerrar ayuda">${gIcon('close')}</button></div>
  <p>${map?'Cada tarjeta es un proceso y las flechas son las entregas de información entre ellos. Haz clic en un proceso para abrir su diagrama BPMN.':'Se lee de izquierda a derecha. La franja de la izquierda es el proceso (pool) y cada carril es un área. Clic en una tarea para ver su detalle.'}</p>
  <ul><li>Usa la <b>paleta de la izquierda</b> para crear tareas, conectar tareas o agregar compuertas.</li><li>Arrastra el fondo para moverte y usa la rueda del mouse para hacer zoom.</li><li>Atajos: <kbd>V</kbd> seleccionar, <kbd>H</kbd> mano, <kbd>C</kbd> conectar, <kbd>T</kbd> tarea, <kbd>0</kbd> ajustar, <kbd>Esc</kbd> cancelar.</li></ul>
  <button class="btn sm" data-act="ghelp" type="button">Entendido</button></div>`;
 return `<div class="modeler${GP.wide?' wide':''}">
<aside class="palette" id="palette" aria-label="Paleta BPMN">${paletteHTML()}</aside>
<section class="canvas" aria-label="Lienzo del diagrama">
 <div class="ctxbar">
  <nav class="crumbs" aria-label="Ubicación">${map?`<span class="crumb cur">${gIcon('map')}<span class="ct">Mapa de procesos</span></span>`:`<button class="crumb" data-act="gmap" type="button" aria-label="Volver al mapa de procesos">${gIcon('map')}<span class="ct">Mapa de procesos</span></button><span class="sep" aria-hidden="true">/</span>`}
   <label class="psel"><span class="sr">Diagrama a mostrar</span><select data-g="proceso">${opts}</select></label></nav>
  <div class="gstats" id="gnote" hidden></div>
  <span class="grow"></span>
  <span class="zoomv" id="gzoomv" title="Nivel de zoom">100 %</span>
 </div>
 <div class="gwrap">
  <svg id="gsvg" role="img" aria-label="Diagrama BPMN del proceso" data-tool="${G.tool}"></svg>
  <div class="ghint" id="ghint" hidden role="status"></div>
  <div class="gempty" id="gempty" hidden></div>
  ${help}
  <div class="glegend" id="glegend"${GP.legend?'':' hidden'} aria-label="Leyenda"><div class="gph"><b>Leyenda</b><button class="btn ghost sm ico" data-act="glegend" type="button" aria-label="Cerrar leyenda">${gIcon('close')}</button></div><div class="bp-legend">${legend}</div></div>
 </div>
</section>
<aside class="gpanel" id="gpanel" hidden aria-live="polite" aria-label="Propiedades de la tarea"></aside>
</div>`}
function panelHTML(a){
 const ac=ENT_get('actores',a.actor),gaps=UI.g.gaps!==false;
 const row=(l,v)=>v?`<dt>${esc(l)}</dt><dd>${esc(v)}</dd>`:'';
 const inL=DB.enlaces.filter(l=>l.destino===a.id),outL=DB.enlaces.filter(l=>l.origen===a.id);
 const lnk=(l,dir)=>{const o=ENT_get('actividades',dir==='in'?l.origen:l.destino);return `<li>${dir==='in'?'De':'A'}: <b>${esc(o?o.nombre:'—')}</b>${l.condicion?` <span class="chip">${esc(l.condicion)}</span>`:''}${l.infoTransferida?` — ${esc(l.infoTransferida)}`:''}${l.medio?` <span class="muted">(${esc(l.medio)})</span>`:''}${xarea(l)?' '+chip('Entre áreas','xfer'):''}${l.tipo==='Retorno / reproceso'?' '+chip('Reproceso','rework'):''}${o&&o.proceso!==a.proceso?' '+chip('Otro proceso'):''}</li>`};
 const flags=[['espera','Espera'],['reproceso','Reproceso'],['duplicacion','Duplicación de información'],['transferenciaAreas','Transferencia entre áreas'],['solicitaInfo','Solicita información de nuevo'],['manual','Intervención manual']].filter(([k])=>a[k]!=='').map(([k,l])=>`${chip(l+': '+a[k],a[k]==='Sí'?(k==='reproceso'||k==='duplicacion'?'rework':'wait'):'')}`).join('');
 const miss=CORE.filter(k=>!filled(a,k));
 const gk=outL.length>1?bpGwKind(outL):null;
 return `<div class="gpanel-h"><span>Propiedades de la tarea</span><button class="btn ghost sm ico" data-act="gclose" type="button" aria-label="Cerrar panel">${gIcon('close')}</button></div>
 <h4>${esc(a.nombre)}</h4><div class="muted">${a.id} · ${esc(T('procesos',a.proceso))}${a.etapa&&ENT_get('etapas',a.etapa)?' · '+esc(ENT_get('etapas',a.etapa).nombre):''}</div><div style="margin-top:6px">${chip(a.estado||'Sin estado',a.estado==='Validado'?'ok':'')}${!ac&&gaps?' <span class="chip gap">Sin actor asignado</span>':''}</div>
 <dl>${row('Descripción',a.descripcion)}${row('Actor',ac?[ac.nombre,ac.cargo,T('areas',ac.area)&&ENT_get('areas',ac.area).nombre,ac.tipo].filter((v,i,x)=>v&&x.indexOf(v)===i).join(' · '):'')}${row('Rol en el proceso',a.rolProceso)}
 ${row('Información que recibe',a.infoRecibe)}${row('Fuente',a.fuenteInfo)}${row('Medio de recepción',a.medioRecibe)}${row('Información que genera',a.infoGenera)}${row('Destinatario',a.destinatarioInfo)}${row('Medio de entrega',a.medioEntrega)}${row('Información requerida',a.infoRequerida)}
 ${(a.sistemas||[]).length?`<dt>Sistemas</dt><dd>${a.sistemas.map(id=>chip(T('sistemas',id))).join('')}</dd>`:''}
 ${row('Duración o demora (relato)',a.duracionDesc)}${row('Tiempo de ejecución',a.tiempoEjecucion!==''?fmtMin(num(a.tiempoEjecucion)):'')}${row('Tiempo de espera',a.tiempoEspera!==''?fmtMin(num(a.tiempoEspera)):'')}${row('Frecuencia',a.frecuencia)}${row('Inicio',a.inicio?fmtDT(a.inicio):'')}${row('Fin',a.fin?fmtDT(a.fin):'')}
 ${flags?`<dt>Problemas</dt><dd>${flags}</dd>`:''}${row('Causa del reproceso',a.causaReproceso)}${row('Descripción del problema',a.problema)}${row('Observaciones',a.observaciones)}${row('Fuente (entrevista)',T('entrevistas',a.fuente))}</dl>
 ${inL.length?`<dt class="muted" style="font-size:11.5px">Recibe de</dt><ul style="margin:4px 0 8px;padding-left:18px">${inL.map(l=>lnk(l,'in')).join('')}</ul>`:'<div class="muted" style="font-size:12px;margin-bottom:6px">Sin entradas: es un inicio.</div>'}
 ${outL.length?`<dt class="muted" style="font-size:11.5px">Entrega a${gk?` · compuerta ${gk.t==='+'?'paralela (+)':'exclusiva (X)'}`:''}</dt>${gk&&gk.pending?`<div class="gapc" style="font-size:12px">Compuerta por validar: ${esc(gk.why)}</div>`:''}<ul style="margin:4px 0 8px;padding-left:18px">${outL.map(l=>lnk(l,'out')).join('')}</ul>`:`<div class="${gaps?'gapc':'muted'}" style="font-size:12px;margin-bottom:6px">Sin salidas registradas: fin / pendiente de levantar.</div>`}
 ${miss.length?(gaps?`<div class="gp-miss"><b>Falta levantar (${miss.length} de ${CORE.length} campos clave)</b><div>${miss.map(k=>`<span class="chip gap">${esc(fieldLabel(k))}</span>`).join('')}</div></div>`:`<div class="dim" style="font-size:12px">${miss.length} de ${CORE.length} campos clave sin dato.</div>`):''}
 <div class="row"><button class="btn sm primary" data-act="gedit" data-id="${a.id}" type="button">Editar actividad</button><button class="btn sm" data-act="glink" data-id="${a.id}" type="button">+ Enlace desde aquí</button></div>`;
}
function showPanel(id){const a=ENT_get('actividades',id),p=$('#gpanel');if(!a||!p)return;p.innerHTML=panelHTML(a);p.hidden=false;p.scrollTop=0}

