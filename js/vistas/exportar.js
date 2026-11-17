'use strict';
/* ============ Exportar / integración ============ */
const nom=(e,id)=>{const r=ENT_get(e,id);return r?(r.nombre||r.dato||r.personas||''):''};
const acInfo=id=>{const a=ENT_get('actividades',id)||{};const ac=ENT_get('actores',a.actor)||{};return {act:a.nombre||'',actor:ac.nombre||'',area:ac.area?nom('areas',ac.area):''}};
const DS=[
 ['actores','Actores',()=>DB.actores.map(a=>({ID:a.id,Nombre:a.nombre,Cargo:a.cargo,'Área':nom('areas',a.area),'Tipo de actor':a.tipo,Observaciones:a.observaciones,'Fecha de creación':a.creadoEn,'Fecha de actualización':a.actualizadoEn}))],
 ['actividades','Actividades',()=>DB.actividades.map(a=>{const ac=ENT_get('actores',a.actor)||{};return {ID:a.id,Proceso:nom('procesos',a.proceso),Etapa:nom('etapas',a.etapa),Orden:a.orden,Actividad:a.nombre,'Descripción':a.descripcion,Estado:a.estado,Actor:ac.nombre||'',Cargo:ac.cargo||'','Área':ac.area?nom('areas',ac.area):'','Tipo de actor':ac.tipo||'','Rol en el proceso':a.rolProceso,'Información que recibe':a.infoRecibe,'Fuente de la información':a.fuenteInfo,'Información que genera':a.infoGenera,'Destinatario':a.destinatarioInfo,'Medio de recepción':a.medioRecibe,'Medio de entrega':a.medioEntrega,'Información requerida':a.infoRequerida,Sistemas:(a.sistemas||[]).map(id=>nom('sistemas',id)).join('; '),Frecuencia:a.frecuencia,Observaciones:a.observaciones,'Fecha de creación':a.creadoEn,'Fecha de actualización':a.actualizadoEn}})],
 ['flujo','Flujo de información',()=>DB.enlaces.map(l=>{const o=acInfo(l.origen),d=acInfo(l.destino);return {ID:l.id,Proceso:nom('procesos',l.proceso),'Actividad origen':o.act,'Actor origen':o.actor,'Área origen':o.area,'Actividad destino':d.act,'Actor destino':d.actor,'Área destino':d.area,'Tipo de transferencia':l.tipo,'Información transferida':l.infoTransferida,'Medio':l.medio,Frecuencia:l.frecuencia,'Tiempo de espera (min)':l.tiempoEspera,'Entre áreas':(o.area&&d.area)?(o.area!==d.area?'Sí':'No'):'Sin dato',Observaciones:l.observaciones}})],
 ['tiempos','Tiempos',()=>DB.actividades.map(a=>({ID:a.id,Proceso:nom('procesos',a.proceso),Actividad:a.nombre,Actor:nom('actores',a.actor),Inicio:a.inicio,Fin:a.fin,'Duración o demora (relato)':a.duracionDesc||'','Tiempo de ejecución (min)':a.tiempoEjecucion,'Tiempo de espera (min)':a.tiempoEspera,Frecuencia:a.frecuencia}))],
 ['reprocesos','Reprocesos y problemas',()=>DB.actividades.filter(a=>a.reproceso!==''||a.causaReproceso||a.problema||['espera','duplicacion','transferenciaAreas','solicitaInfo','manual'].some(k=>a[k]!=='')).map(a=>({ID:a.id,Proceso:nom('procesos',a.proceso),Etapa:nom('etapas',a.etapa),Actividad:a.nombre,'¿Espera?':a.espera||'Sin dato','¿Reproceso?':a.reproceso||'Sin dato','¿Duplicación de información?':a.duplicacion||'Sin dato','¿Transferencia entre áreas?':a.transferenciaAreas||'Sin dato','¿Solicita información de nuevo?':a.solicitaInfo||'Sin dato','¿Intervención manual?':a.manual||'Sin dato','Causa del reproceso':a.causaReproceso,'Descripción del problema':a.problema}))],
 ['erp','Datos potenciales para ERP',()=>DB.erpDatos.map(r=>({ID:r.id,Dato:r.dato,'Nombre del campo':r.campo,'Descripción':r.descripcion,Fuente:r.fuente,'Actor que lo genera':nom('actores',r.actorGenera),'Actor que lo utiliza':nom('actores',r.actorUtiliza),'Sistema actual':nom('sistemas',r.sistemaActual),Formato:r.formato,Frecuencia:r.frecuencia,'Etapa del proceso':nom('etapas',r.etapa),'¿Ya existe en el ERP?':r.existeERP||'Sin dato','¿Debería existir en el ERP?':r.deberiaERP||'Sin dato',Observaciones:r.observaciones}))],
 ['indicadores','Indicadores declarados',()=>DB.indicadores.map(r=>({ID:r.id,Indicador:r.nombre,Proceso:nom('procesos',r.proceso),'¿Se mide hoy?':r.seMideHoy||'Sin dato','Cómo se mide':r.como,Meta:r.meta,Frecuencia:r.frecuencia,Responsable:r.responsable,Observaciones:r.observaciones}))],
 ['procesos','Procesos',()=>DB.procesos.map(r=>({ID:r.id,Nombre:r.nombre,'Descripción':r.descripcion,Estado:r.estado,Fuente:nom('entrevistas',r.fuente)}))],
 ['etapas','Etapas',()=>DB.etapas.map(r=>({ID:r.id,Proceso:nom('procesos',r.proceso),Orden:r.orden,Etapa:r.nombre,'Descripción':r.descripcion}))],
 ['areas','Áreas',()=>DB.areas.map(r=>({ID:r.id,'Área':r.nombre,Tipo:r.tipo,'Descripción':r.descripcion}))],
 ['sistemas','Sistemas y herramientas',()=>DB.sistemas.map(r=>({ID:r.id,Sistema:r.nombre,Tipo:r.tipo,'Descripción':r.descripcion}))],
 ['entrevistas','Entrevistas',()=>DB.entrevistas.map(r=>({ID:r.id,Entrevistado:r.personas,Cargo:r.cargo,'Área':nom('areas',r.area),Fecha:r.fecha,Entrevistadores:r.entrevistadores,Observaciones:r.observaciones}))]
];
function pageExportar(){
 const hasX=typeof XLSX!=='undefined';
 if(!hasX&&UI.ex.fmt==='xlsx')UI.ex.fmt='json';
 const box=([k,l,fn])=>{const n=fn().length;if(UI.ex.sel[k]===undefined)UI.ex.sel[k]=['actores','actividades','flujo','tiempos','reprocesos','erp'].includes(k);return `<label${n?'':' class="zero"'}><input type="checkbox" data-ex="${k}"${UI.ex.sel[k]?' checked':''}> ${esc(l)}<small>${n}</small></label>`};
 const boxA=DS.slice(0,7).map(box).join(''),boxC=DS.slice(7).map(box).join('');
 const nSel=DS.filter(([k])=>UI.ex.sel[k]).length;
 return `<div class="page"><div class="ptitle"><div><h1>Exportar / integración</h1><p>Descarga los datos levantados para analizarlos fuera de la herramienta y revisa qué información podría alimentar el ERP.</p></div></div>
 <div class="sec"><h3>Exportar datos</h3><span>Elige qué incluir</span><button class="mini" data-act="exall" type="button">Todos</button><button class="mini" data-act="exnone" type="button">Ninguno</button></div>
 <div class="panel"><fieldset class="exset"><legend>Análisis</legend><div class="exgrid">${boxA}</div></fieldset><fieldset class="exset"><legend>Catálogos</legend><div class="exgrid">${boxC}</div></fieldset>
 <div class="radios" role="radiogroup" aria-label="Formato"><label><input type="radio" name="exfmt" value="xlsx"${UI.ex.fmt==='xlsx'?' checked':''}${hasX?'':' disabled'}> Excel (una hoja por conjunto)${hasX?'':' — requiere conexión a internet'}</label><label><input type="radio" name="exfmt" value="csv"${UI.ex.fmt==='csv'?' checked':''}> CSV (un archivo por conjunto)</label><label><input type="radio" name="exfmt" value="json"${UI.ex.fmt==='json'?' checked':''}> JSON (todo en un archivo)</label></div>
 <button class="btn primary" id="exnow" data-act="exportnow" type="button"${nSel?'':' disabled'}>${exLabel(nSel)}</button></div>
 <div class="sec"><h3>Copia de seguridad y datos</h3></div>
 <div class="panel"><p class="note">Los datos se guardan solo en este navegador. Descarga una copia para compartirla con el equipo o para no perderla.</p>
 <div class="exactions"><button class="btn" data-act="backup" type="button">Descargar copia completa (.json)</button><button class="btn" data-act="importclick" type="button">Importar copia…</button></div>
 <div class="exreset"><span class="muted">Reiniciar datos</span><button class="btn" data-act="reseed" type="button">Restaurar datos de las entrevistas</button><button class="btn danger" data-act="wipe" type="button">Vaciar todo</button></div><input type="file" id="importFile" accept=".json,application/json" hidden></div>
 <div class="sec"><h3>Información potencial para integración con ERP</h3><span>No se conecta con el ERP ni se asume su estructura: eso se definirá con la empresa.</span></div>${listHTML('erpDatos')}</div>`;
}
const exLabel=n=>n?`Exportar ${n} conjunto${n===1?'':'s'}`:'Elige al menos un conjunto';
function exSync(){const n=DS.filter(([k])=>UI.ex.sel[k]).length;const b=document.getElementById('exnow');if(b){b.textContent=exLabel(n);b.disabled=!n}}
const toCSV=rows=>{const keys=Object.keys(rows[0]);const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';return '\ufeff'+[keys.map(q).join(',')].concat(rows.map(r=>keys.map(k=>q(r[k])).join(','))).join('\r\n')};
async function doExport(){
 const sel=DS.filter(([k])=>UI.ex.sel[k]);
 if(!sel.length){toast('Selecciona al menos un conjunto de datos');return}
 const data=sel.map(([k,l,fn])=>[k,l,fn()]).filter(x=>x[2].length);
 if(!data.length){toast('Los conjuntos elegidos no tienen registros todavía');return}
 const skipped=sel.length-data.length;
 if(UI.ex.fmt==='json'){
  const obj={exportadoEn:nowISO(),herramienta:'BERCONT Process Mapping & Diagnostic Tool',datos:{}};data.forEach(([k,l,rows])=>obj.datos[k]=rows);
  await saveFile(`bercont_datos_${stamp()}.json`,JSON.stringify(obj,null,2));
 }else if(UI.ex.fmt==='xlsx'&&typeof XLSX!=='undefined'){
  const wb=XLSX.utils.book_new();data.forEach(([k,l,rows])=>{const ws=XLSX.utils.json_to_sheet(rows);ws['!cols']=Object.keys(rows[0]).map(h=>({wch:Math.min(48,Math.max(12,h.length+2))}));XLSX.utils.book_append_sheet(wb,ws,l.slice(0,31))});
  const buf=XLSX.write(wb,{bookType:'xlsx',type:'array'});
  await saveFile(`bercont_datos_${stamp()}.xlsx`,buf);
 }else{
  for(const [k,l,rows] of data){const ok=await saveFile(`bercont_${k}_${stamp()}.csv`,toCSV(rows));if(!ok)break}
 }
 if(skipped)toast(`${skipped} conjunto(s) sin registros no se incluyeron`);
}
