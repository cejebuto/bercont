'use strict';
/* ============ Esquema de datos ============ */
const F=(k,l,t,x={})=>Object.assign({k,l,t},x);
const TRI=[['','Sin dato'],['Sí','Sí'],['No','No']];
const ESTADOS=['Borrador','Por validar','Validado'];
const ENT={
 entrevistas:{p:'ENT',one:'Entrevista',many:'Entrevistas',label:r=>`${r.personas||'Sin nombre'} · ${r.fecha||'sin fecha'}`,
  fields:[F('personas','Persona(s) entrevistada(s)','text',{req:1}),F('cargo','Cargo','text'),F('area','Área','ref',{e:'areas'}),F('fecha','Fecha de entrevista','date'),F('entrevistadores','Entrevistador(es)','text'),F('observaciones','Observaciones','textarea')],
  cols:[{h:'ID',v:r=>`<span class="id">${r.id}</span>`},{h:'Entrevistado(a)',v:r=>`<span class="name">${esc(r.personas)}</span>`},{h:'Cargo',v:r=>esc(r.cargo)},{h:'Área',v:r=>refT('areas',r.area)},{h:'Fecha',v:r=>esc(r.fecha)},{h:'Entrevistadores',v:r=>esc(r.entrevistadores)},{h:'Observaciones',v:r=>`<div class="sub">${esc(r.observaciones)}</div>`}],
  filters:[]},
 procesos:{p:'PRO',one:'Proceso',many:'Procesos',label:r=>r.nombre,
  fields:[F('nombre','Nombre del proceso','text',{req:1}),F('descripcion','Descripción','textarea'),F('estado','Estado','select',{o:['Borrador','En levantamiento','Por validar','Validado']}),F('fuente','Fuente (entrevista)','ref',{e:'entrevistas'})],
  cols:[{h:'ID',v:r=>`<span class="id">${r.id}</span>`},{h:'Proceso',v:r=>`<span class="name">${esc(r.nombre)}</span><div class="sub">${esc(r.descripcion)}</div>`},{h:'Estado',v:r=>chip(r.estado)},{h:'Actividades',v:r=>DB.actividades.filter(a=>a.proceso===r.id).length},{h:'Fuente',v:r=>refT('entrevistas',r.fuente)}],
  filters:[]},
 etapas:{p:'ETP',one:'Etapa',many:'Etapas',label:r=>`${T('procesos',r.proceso)||'Sin proceso'} · ${r.nombre}`,
  fields:[F('nombre','Nombre de la etapa','text',{req:1}),F('proceso','Proceso','ref',{e:'procesos'}),F('orden','Orden','number'),F('descripcion','Descripción','textarea')],
  cols:[{h:'ID',v:r=>`<span class="id">${r.id}</span>`},{h:'Proceso',v:r=>refT('procesos',r.proceso)},{h:'Orden',v:r=>esc(r.orden)},{h:'Etapa',v:r=>`<span class="name">${esc(r.nombre)}</span>`},{h:'Actividades',v:r=>DB.actividades.filter(a=>a.etapa===r.id).length}],
  filters:[{id:'proceso',l:'Proceso',opts:()=>optsOf('procesos'),fn:(r,v)=>r.proceso===v}]},
 areas:{p:'ARE',one:'Área',many:'Áreas',label:r=>r.nombre,
  fields:[F('nombre','Nombre del área','text',{req:1}),F('tipo','Tipo','select',{o:['Interna','Externa']}),F('descripcion','Descripción','textarea')],
  cols:[{h:'ID',v:r=>`<span class="id">${r.id}</span>`},{h:'Área',v:r=>`<span class="name">${esc(r.nombre)}</span>`},{h:'Tipo',v:r=>esc(r.tipo)},{h:'Actores',v:r=>DB.actores.filter(a=>a.area===r.id).length},{h:'Descripción',v:r=>`<div class="sub">${esc(r.descripcion)}</div>`}],
  filters:[]},
 sistemas:{p:'SIS',one:'Sistema o herramienta',many:'Sistemas',label:r=>r.nombre,
  fields:[F('nombre','Nombre','text',{req:1}),F('tipo','Tipo','select',{o:['ERP','Excel','Correo','Otro software','Herramienta manual','Ninguno']}),F('descripcion','Descripción','textarea')],
  cols:[{h:'ID',v:r=>`<span class="id">${r.id}</span>`},{h:'Sistema',v:r=>`<span class="name">${esc(r.nombre)}</span>`},{h:'Tipo',v:r=>esc(r.tipo)},{h:'Actividades que lo usan',v:r=>DB.actividades.filter(a=>(a.sistemas||[]).includes(r.id)).length},{h:'Descripción',v:r=>`<div class="sub">${esc(r.descripcion)}</div>`}],
  filters:[{id:'tipo',l:'Tipo',opts:()=>['ERP','Excel','Correo','Otro software','Herramienta manual','Ninguno'].map(x=>[x,x]),fn:(r,v)=>r.tipo===v}]},
 actores:{p:'AGT',one:'Actor',many:'Actores',label:r=>r.nombre+(r.area?` (${T('areas',r.area)})`:''),
  fields:[F('nombre','Nombre','text',{req:1}),F('cargo','Cargo','text'),F('area','Área / departamento','ref',{e:'areas'}),F('tipo','Tipo de actor','select',{o:['Interno','Externo']}),F('observaciones','Observaciones','textarea')],
  cols:[{h:'ID',v:r=>`<span class="id">${r.id}</span>`},{h:'Nombre',v:r=>`<span class="name">${esc(r.nombre)}</span>`},{h:'Cargo',v:r=>esc(r.cargo)||'<span class="dim">—</span>'},{h:'Área',v:r=>refT('areas',r.area)},{h:'Tipo',v:r=>esc(r.tipo)||'<span class="dim">—</span>'},{h:'Actividades',v:r=>DB.actividades.filter(a=>a.actor===r.id).length},{h:'Observaciones',v:r=>`<div class="sub">${esc(r.observaciones)}</div>`}],
  filters:[{id:'area',l:'Área',opts:()=>optsOf('areas'),fn:(r,v)=>r.area===v},{id:'tipo',l:'Tipo',opts:()=>[['Interno','Interno'],['Externo','Externo']],fn:(r,v)=>r.tipo===v}]},
 actividades:{p:'ACT',one:'Actividad',many:'Actividades',label:r=>(r.orden!==''&&r.orden!=null?r.orden+'. ':'')+r.nombre,
  fields:[
   F('nombre','Nombre de la actividad','text',{req:1,g:'Información de la actividad'}),F('proceso','Proceso al que pertenece','ref',{e:'procesos'}),
   F('descripcion','Descripción','textarea',{full:1}),F('etapa','Etapa','ref',{e:'etapas'}),F('orden','Orden dentro del proceso','number'),F('estado','Estado','select',{o:ESTADOS,def:'Borrador'}),F('fuente','Fuente (entrevista)','ref',{e:'entrevistas'}),
   F('actor','Nombre del actor','ref',{e:'actores',g:'Actor / responsable'}),F('rolProceso','Rol dentro del proceso','text',{h:'El cargo, área y tipo se toman del actor.'}),
   F('infoRecibe','Información que recibe el actor','textarea',{g:'Información'}),F('fuenteInfo','Fuente de la información','text'),F('medioRecibe','Medio por el que se recibe','text'),F('infoGenera','Información que genera','textarea'),F('destinatarioInfo','Destinatario de la información','text'),F('medioEntrega','Medio por el que se entrega','text'),F('infoRequerida','Información requerida para poder ejecutar la actividad','textarea',{full:1}),
   F('sistemas','Sistemas y herramientas utilizados','multiref',{e:'sistemas',g:'Sistemas y herramientas'}),
   F('duracionDesc','Duración o demora (como la describen)','textarea',{full:1,g:'Duración y frecuencia (cualitativo)',h:'Bercont no mide tiempos por actividad: registra lo que cuentan, p. ej. «los mayoristas se demoran bastante».'}),F('frecuencia','Frecuencia de la actividad','text',{full:1}),F('inicio','Fecha/hora de inicio (opcional)','datetime'),F('fin','Fecha/hora de finalización (opcional)','datetime'),F('tiempoEjecucion','Tiempo de ejecución en min (opcional)','number'),F('tiempoEspera','Tiempo de espera en min (opcional)','number'),
   F('espera','¿Existe espera?','tri',{g:'Problemas'}),F('reproceso','¿Existe reproceso?','tri'),F('duplicacion','¿Existe duplicación de información?','tri'),F('transferenciaAreas','¿Existe transferencia entre áreas?','tri'),F('solicitaInfo','¿Se requiere solicitar nuevamente información?','tri'),F('manual','¿Requiere intervención manual?','tri'),
   F('causaReproceso','Causa del reproceso','text',{full:1}),F('problema','Descripción del problema','textarea',{full:1}),F('observaciones','Observaciones','textarea',{full:1})],
  cols:[{h:'#',v:r=>`<span class="id">${esc(r.orden)}</span><div class="sub id">${r.id}</div>`},
   {h:'Actividad',v:r=>`<div class="cact"><span class="name">${esc(r.nombre)}</span>${r.descripcion?`<div class="sub l1" title="${esc(r.descripcion)}">${esc(r.descripcion)}</div>`:''}</div>`},
   {h:'Datos',v:r=>`<div class="meter"><i><b style="width:${Math.round(complete(r)*100)}%"></b></i><span>${Math.round(complete(r)*100)}%</span></div>`},
   {h:'Etapa',v:r=>{const et=ENT_get('etapas',r.etapa);return `<div class="cetapa">${et?esc(et.nombre):'<span class="dim">—</span>'}</div>`}},
   {h:'Actor',v:r=>{const a=ENT_get('actores',r.actor);return a?`<div class="cactor">${esc(a.nombre)}<div class="sub">${esc(T('areas',a.area))}</div></div>`:'<span class="dim">—</span>'}},
   {h:'Sistemas',v:r=>{const s=(r.sistemas||[]).map(id=>T('sistemas',id)).filter(Boolean);if(!s.length)return '<span class="dim">—</span>';const more=s.length-2;return `<div class="csys">${s.slice(0,2).map(t=>chip(t)).join('')}${more>0?`<span class="chip more" title="${esc(s.slice(2).join(', '))}">+${more}</span>`:''}</div>`}},
   {h:'Estado',v:r=>chip(r.estado||'—',r.estado==='Validado'?'ok':'')},{h:'Marcas',v:r=>`<div class="cmarks">${marks(r)}</div>`}],
  /* En Mapear las actividades se agrupan por proceso (encabezado de grupo) */
  group:r=>[r.proceso||'_',T('procesos',r.proceso)||'Sin proceso'],
  filters:[
   {id:'proceso',l:'Proceso',opts:()=>optsOf('procesos'),fn:(r,v)=>r.proceso===v},
   {id:'etapa',l:'Etapa',opts:()=>optsOf('etapas'),fn:(r,v)=>r.etapa===v},
   {id:'area',l:'Área',opts:()=>optsOf('areas'),fn:(r,v)=>(ENT_get('actores',r.actor)||{}).area===v},
   {id:'actor',l:'Actor',opts:()=>optsOf('actores'),fn:(r,v)=>r.actor===v},
   {id:'sistema',l:'Sistema',opts:()=>optsOf('sistemas'),fn:(r,v)=>(r.sistemas||[]).includes(v)},
   {id:'problema',l:'Tipo de problema',opts:()=>[['espera','Espera'],['duplicacion','Duplicación de información'],['transferenciaAreas','Transferencia entre áreas'],['solicitaInfo','Solicita información de nuevo'],['manual','Intervención manual']],fn:(r,v)=>r[v]==='Sí'},
   {id:'reproceso',l:'Reproceso',opts:()=>[['Sí','Con reproceso'],['No','Sin reproceso'],['_','Sin dato']],fn:(r,v)=>v==='_'?r.reproceso==='':r.reproceso===v},
   {id:'estado',l:'Estado',opts:()=>ESTADOS.map(x=>[x,x]),fn:(r,v)=>r.estado===v}]},
 enlaces:{p:'ENL',one:'Enlace de información',many:'Enlaces',label:r=>`${T('actividades',r.origen)} → ${T('actividades',r.destino)}`,
  fields:[F('origen','Origen (actividad)','ref',{e:'actividades',req:1}),F('destino','Destino (actividad)','ref',{e:'actividades',req:1}),
   F('tipo','Tipo de transferencia','select',{o:['Continuación (mismo actor)','Transferencia de trabajo','Información / reporte','Solicitud de información','Retorno / reproceso']}),
   F('compuerta','Compuerta (si el origen tiene varias salidas)','select',{o:['Exclusiva','Paralela'],h:'Vacío: se dibuja como Exclusiva por defecto y queda «por validar».'}),F('condicion','Condición / etiqueta de la flecha','text',{h:'Ej.: «Lead grande», «Participar», «Semáforo en rojo».'}),
   F('infoTransferida','Información transferida','textarea',{full:1}),F('medio','Medio utilizado','text'),F('frecuencia','Frecuencia','text'),F('tiempoEspera','Tiempo de espera en min (opcional)','number'),F('observaciones','Observaciones','textarea',{full:1})],
  cols:[{h:'ID',v:r=>`<span class="id">${r.id}</span>`},
   {h:'Origen',v:r=>linkEnd(r.origen)},{h:'Destino',v:r=>linkEnd(r.destino)},
   {h:'Tipo',v:r=>{const x=xarea(r);return esc(r.tipo)+(x?' '+chip('Entre áreas','xfer'):'')}},
   {h:'Información',v:r=>`<div class="sub">${esc(r.infoTransferida)}</div>`},{h:'Medio',v:r=>esc(r.medio)},{h:'Condición',v:r=>r.condicion?chip(r.condicion):'<span class="dim">—</span>'}],
  filters:[{id:'proceso',l:'Proceso',opts:()=>optsOf('procesos'),fn:(r,v)=>r.proceso===v},{id:'tipo',l:'Tipo',opts:()=>ENT.enlaces.fields[2].o.map(x=>[x,x]),fn:(r,v)=>r.tipo===v},{id:'area',l:'Área (origen o destino)',opts:()=>optsOf('areas'),fn:(r,v)=>[areaOfAct(r.origen),areaOfAct(r.destino)].includes(v)}]},
 erpDatos:{p:'ERD',one:'Dato potencial para ERP',many:'Datos potenciales para ERP',search:'Buscar dato, campo o sistema…',label:r=>r.dato,
  fields:[F('dato','Dato','text',{req:1}),F('campo','Nombre del campo','text',{h:'Solo si ya se conoce; no se asume la estructura del ERP.'}),F('descripcion','Descripción','textarea',{full:1}),F('fuente','Fuente','text'),F('actorGenera','Actor que lo genera','ref',{e:'actores'}),F('actorUtiliza','Actor que lo utiliza','ref',{e:'actores'}),F('sistemaActual','Sistema donde actualmente se encuentra','ref',{e:'sistemas'}),F('formato','Formato','text'),F('frecuencia','Frecuencia','text'),F('etapa','Etapa del proceso','ref',{e:'etapas'}),F('existeERP','¿Ya existe en el ERP?','tri'),F('deberiaERP','¿Debería existir en el ERP?','tri'),F('observaciones','Observaciones','textarea',{full:1})],
  cols:[{h:'ID',v:r=>`<span class="id">${r.id}</span>`},{h:'Dato',v:r=>`<span class="name">${esc(r.dato)}</span><div class="sub">${esc(r.descripcion)}</div>`},{h:'Campo',v:r=>esc(r.campo)||'<span class="dim">—</span>'},{h:'Genera → Utiliza',v:r=>`${esc(T('actores',r.actorGenera).replace(/ \(.*\)$/,''))||'—'} → ${esc(T('actores',r.actorUtiliza).replace(/ \(.*\)$/,''))||'—'}`},{h:'Sistema actual',v:r=>refT('sistemas',r.sistemaActual)},{h:'Etapa',v:r=>refT('etapas',r.etapa)},{h:'¿En ERP?',v:r=>triChip(r.existeERP)},{h:'¿Debería?',v:r=>triChip(r.deberiaERP)}],
  filters:[{id:'etapa',l:'Etapa',opts:()=>optsOf('etapas'),fn:(r,v)=>r.etapa===v},{id:'sistema',l:'Sistema actual',opts:()=>optsOf('sistemas'),fn:(r,v)=>r.sistemaActual===v},{id:'existe',l:'¿Existe en ERP?',opts:()=>[['Sí','Sí'],['No','No'],['_','Sin dato']],fn:(r,v)=>v==='_'?r.existeERP==='':r.existeERP===v}]},
 indicadores:{p:'IND',one:'Indicador declarado',many:'Indicadores declarados',label:r=>r.nombre,
  fields:[F('nombre','Indicador','text',{req:1}),F('proceso','Proceso','ref',{e:'procesos'}),F('seMideHoy','¿Se mide hoy?','select',{o:['Sí','Parcial','No']}),F('como','¿Cómo / con qué herramienta?','textarea',{full:1}),F('meta','Meta propuesta','text'),F('frecuencia','Frecuencia','text'),F('responsable','Responsable','text'),F('fuente','Fuente (entrevista)','ref',{e:'entrevistas'}),F('observaciones','Observaciones','textarea',{full:1})],
  cols:[{h:'ID',v:r=>`<span class="id">${r.id}</span>`},{h:'Indicador',v:r=>`<span class="name">${esc(r.nombre)}</span>`},{h:'¿Se mide hoy?',v:r=>r.seMideHoy?chip(r.seMideHoy,r.seMideHoy==='Sí'?'ok':r.seMideHoy==='Parcial'?'wait':''):'<span class="dim">Sin dato</span>'},{h:'Cómo',v:r=>`<div class="sub">${esc(r.como)}</div>`},{h:'Meta',v:r=>esc(r.meta)},{h:'Frecuencia',v:r=>esc(r.frecuencia)},{h:'Responsable',v:r=>esc(r.responsable)},{h:'Observaciones',v:r=>`<div class="sub">${esc(r.observaciones)}</div>`}],
  filters:[{id:'mide',l:'¿Se mide hoy?',opts:()=>[['Sí','Sí'],['Parcial','Parcial'],['No','No'],['_','Sin dato']],fn:(r,v)=>v==='_'?!r.seMideHoy:r.seMideHoy===v}]}
};
const ENT_ORDER=Object.keys(ENT);
function ENT_get(e,id){return DB[e].find(r=>r.id===id)}
function T(e,id){const r=ENT_get(e,id);return r?ENT[e].label(r):''}
function refT(e,id){const t=T(e,id);return t?esc(e==='etapas'?(ENT_get(e,id).nombre):t):'<span class="dim">—</span>'}
function optsOf(e){return DB[e].slice().sort((a,b)=>ENT[e].label(a).localeCompare(ENT[e].label(b),'es')).map(r=>[r.id,ENT[e].label(r)])}
const chip=(t,c='')=>t?`<span class="chip ${c}">${esc(t)}</span>`:'';
const triChip=v=>v==='Sí'?chip('Sí','ok'):v==='No'?chip('No'):'<span class="dim">Sin dato</span>';
function marks(a){const m=[];if(a.espera==='Sí')m.push(chip('Espera','wait'));if(a.reproceso==='Sí')m.push(chip('Reproceso','rework'));if(a.duplicacion==='Sí')m.push(chip('Info duplicada','rework'));if(a.transferenciaAreas==='Sí')m.push(chip('Entre áreas','xfer'));if(a.solicitaInfo==='Sí')m.push(chip('Pide info otra vez','wait'));if(a.manual==='Sí')m.push(chip('Manual','manual'));return m.join('')||'<span class="dim">—</span>'}
const areaOfAct=id=>{const a=ENT_get('actividades',id);const ac=a&&ENT_get('actores',a.actor);return ac?ac.area:''};
const xarea=l=>{const A=areaOfAct(l.origen),B=areaOfAct(l.destino);return !!(A&&B&&A!==B)};
function linkEnd(id){const a=ENT_get('actividades',id);if(!a)return '<span class="dim">—</span>';const ac=ENT_get('actores',a.actor);return `${esc(a.nombre)}<div class="sub">${esc(ac?ac.nombre:'Sin actor')}${ac&&ac.area?' · '+esc(T('areas',ac.area)):''}</div>`}
const CORE=['descripcion','etapa','actor','rolProceso','infoRecibe','fuenteInfo','infoGenera','destinatarioInfo','medioRecibe','medioEntrega','infoRequerida','sistemas','frecuencia','espera','reproceso','duplicacion','transferenciaAreas','solicitaInfo','manual'];
const filled=(a,k)=>{const v=a[k];return Array.isArray(v)?v.length>0:(v!==''&&v!=null)};
const complete=a=>CORE.filter(k=>filled(a,k)).length/CORE.length;
const fieldLabel=k=>(ENT.actividades.fields.find(f=>f.k===k)||{l:k}).l;

