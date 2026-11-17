'use strict';
/* ============ Paleta BPMN (izquierda), herramientas y preferencias ============
   Preferencias del modelador y encuadre de cada diagrama se guardan en localStorage,
   así que al volver a abrir el navegador el diagrama queda como se dejó. */
const GP_KEY='bercont-grafica-prefs',GV_KEY='bercont-grafica-vistas';
function lsGet(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
const GP=Object.assign({wide:false,legend:false,mini:true,help:true},lsGet(GP_KEY)||{});
function gpSet(k,v){GP[k]=v;lsSet(GP_KEY,GP)}

/* ---- Encuadre (zoom y posición) por diagrama ---- */
let gvT=null;
const gvKey=()=>UI.g.proceso===''?'__all':(UI.g.proceso||'__map');
function gvSave(){clearTimeout(gvT);const key=gvKey(),v=Object.assign({},UI.g.view);gvT=setTimeout(()=>{const all=lsGet(GV_KEY)||{};all[key]=v;lsSet(GV_KEY,all)},250)}
function gvRestore(){const v=(lsGet(GV_KEY)||{})[gvKey()];if(v&&[v.x,v.y,v.k].every(Number.isFinite)&&v.k>0){UI.g.view={x:v.x,y:v.y,k:v.k};return true}return false}

/* ---- Iconos (trazo propio, 20×20) ---- */
const GI={
 select:'<path d="M5 2.8l10.2 7.4-4.6.9-2.4 4.4z" stroke-linejoin="round"/>',
 hand:'<path d="M7 10.5V4.6a1.2 1.2 0 0 1 2.4 0v4.6M9.4 8.8V3.6a1.2 1.2 0 0 1 2.4 0v5.2M11.8 8.8V4.8a1.2 1.2 0 0 1 2.4 0v6.4a5.4 5.4 0 0 1-5.4 5.4h-.4a5 5 0 0 1-4.1-2.1l-2.2-3.1a1.2 1.2 0 0 1 1.9-1.4L7 11.6" stroke-linejoin="round"/>',
 connect:'<circle cx="4.6" cy="15.4" r="2"/><path d="M6.2 13.8l8.8-8.8M10.4 4.6H15v4.6" stroke-linejoin="round"/>',
 task:'<rect x="2.5" y="5" width="15" height="10" rx="2.6"/>',
 gwx:'<path d="M10 2.4l7.6 7.6-7.6 7.6L2.4 10z" stroke-linejoin="round"/><path d="M7.6 7.6l4.8 4.8M12.4 7.6l-4.8 4.8"/>',
 gwp:'<path d="M10 2.4l7.6 7.6-7.6 7.6L2.4 10z" stroke-linejoin="round"/><path d="M10 6.6v6.8M6.6 10h6.8"/>',
 proc:'<rect x="2.5" y="4" width="15" height="12" rx="2.6"/><rect x="8" y="10.6" width="4" height="4" rx=".6"/><path d="M10 11.5v2.2M8.9 12.6h2.2"/>',
 lane:'<rect x="2.5" y="4" width="15" height="12" rx="1"/><path d="M5.6 4v12M5.6 10h11.9"/>',
 actor:'<circle cx="10" cy="6.8" r="3"/><path d="M4.4 16.6a5.6 5.6 0 0 1 11.2 0"/>',
 zin:'<circle cx="8.6" cy="8.6" r="5.4"/><path d="M12.6 12.6l4.6 4.6M6.4 8.6h4.4M8.6 6.4v4.4"/>',
 zout:'<circle cx="8.6" cy="8.6" r="5.4"/><path d="M12.6 12.6l4.6 4.6M6.4 8.6h4.4"/>',
 fit:'<path d="M3 7.4V3h4.4M12.6 3H17v4.4M17 12.6V17h-4.4M7.4 17H3v-4.4"/><rect x="7" y="7" width="6" height="6" rx="1"/>',
 mini:'<rect x="2.5" y="4" width="15" height="12" rx="1.6"/><rect x="9" y="9" width="6" height="4.6" rx=".6"/>',
 gaps:'<circle cx="10" cy="10" r="7.2"/><path d="M10 6.2v4.6M10 13.6v.1"/>',
 legend:'<path d="M7.5 5.5h9.5M7.5 10h9.5M7.5 14.5h9.5"/><circle cx="4" cy="5.5" r="1"/><circle cx="4" cy="10" r="1"/><circle cx="4" cy="14.5" r="1"/>',
 help:'<circle cx="10" cy="10" r="7.2"/><path d="M7.8 7.8a2.3 2.3 0 0 1 4.4 1c0 1.6-2.2 1.9-2.2 3.3M10 14.4v.1"/>',
 svg:'<path d="M10 3v9M6.4 8.6L10 12.2l3.6-3.6M3.5 14v2.5h13V14"/>',
 png:'<rect x="2.5" y="3.5" width="15" height="13" rx="1.6"/><circle cx="7" cy="8" r="1.5"/><path d="M2.8 14.6l4.4-4 3.2 2.8 2.6-2.2 4.4 3.8"/>',
 wide:'<path d="M7 5l5 5-5 5"/>',
 narrow:'<path d="M13 5l-5 5 5 5"/>',
 close:'<path d="M5 5l10 10M15 5L5 15"/>',
 map:'<rect x="2.5" y="3.5" width="6" height="5" rx="1"/><rect x="11.5" y="3.5" width="6" height="5" rx="1"/><rect x="7" y="11.5" width="6" height="5" rx="1"/><path d="M8.5 6h3M14.5 8.5v1.5H10v1.5"/>'};
const gIcon=(k,cls)=>`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"${cls?` class="${cls}"`:''} aria-hidden="true">${GI[k]}</svg>`;

/* ---- Herramientas ---- */
if(!G.tool)G.tool='select';
const LINK_TOOLS=['connect','gwx','gwp'];
const onMap=()=>UI.g.proceso==='__map';
function paletteHTML(){
 const map=onMap(),t=G.tool;
 const b=o=>`<button class="pt" type="button" data-act="${o.act}"${o.tool?` data-tool="${o.tool}" aria-pressed="${t===o.tool}"`:''}${o.on!=null?` aria-pressed="${!!o.on}"`:''}${o.d?` data-d="${o.d}"`:''}${o.dis?` disabled title="${esc(o.dis)}"`:''} data-tip="${esc(o.tip)}" aria-label="${esc(o.l+(o.k?' ('+o.k+')':''))}">${gIcon(o.i)}<span class="pl">${esc(o.l)}</span>${o.k?`<kbd>${o.k}</kbd>`:''}</button>`;
 const grp=(title,items)=>`<div class="pg" role="group" aria-label="${title}"><div class="ph">${title}</div>${items.map(b).join('')}</div>`;
 const noMap='Abre un proceso para usar esta herramienta';
 return grp('Herramientas',[
   {act:'gtool',tool:'select',i:'select',l:'Seleccionar',k:'V',tip:'Seleccionar y ver detalle · V'},
   {act:'gtool',tool:'hand',i:'hand',l:'Mano (mover lienzo)',k:'H',tip:'Mano: mover el lienzo · H'},
   {act:'gtool',tool:'connect',i:'connect',l:'Flujo de secuencia',k:'C',tip:'Conectar dos tareas · C',dis:map&&noMap}])
 +grp('Elementos BPMN',[
   {act:'gtask',i:'task',l:'Tarea',k:'T',tip:'Nueva tarea (actividad) · T'},
   {act:'gtool',tool:'gwx',i:'gwx',l:'Compuerta exclusiva',k:'X',tip:'Salida exclusiva (X) entre dos tareas · X',dis:map&&noMap},
   {act:'gtool',tool:'gwp',i:'gwp',l:'Compuerta paralela',k:'P',tip:'Salida paralela (+) entre dos tareas · P',dis:map&&noMap},
   {act:'gnewe',d:'procesos',i:'proc',l:'Proceso / subproceso',tip:'Nuevo proceso'},
   {act:'gnewe',d:'areas',i:'lane',l:'Carril (área)',tip:'Nuevo carril: cada área es un carril'},
   {act:'gnewe',d:'actores',i:'actor',l:'Participante (actor)',tip:'Nuevo participante'}])
 +grp('Vista',[
   {act:'gzoom',d:'1.25',i:'zin',l:'Acercar',k:'+',tip:'Acercar · +'},
   {act:'gzoom',d:'0.8',i:'zout',l:'Alejar',k:'−',tip:'Alejar · −'},
   {act:'gfit',i:'fit',l:'Ajustar a pantalla',k:'0',tip:'Ajustar a pantalla · 0'},
   {act:'gmini',i:'mini',l:'Minimapa',on:GP.mini,tip:'Mostrar u ocultar el minimapa',dis:map&&'El minimapa aparece dentro de un proceso'},
   {act:'ggaps',i:'gaps',l:'Señalar faltantes',on:UI.g.gaps!==false,tip:'Señalar en café lo que falta levantar'},
   {act:'glegend',i:'legend',l:'Leyenda',on:GP.legend,tip:'Leyenda de símbolos'}])
 +grp('Exportar',[
   {act:'gsvg',i:'svg',l:'Descargar SVG',tip:'Descargar el diagrama en SVG'},
   {act:'gpng',i:'png',l:'Descargar PNG',tip:'Descargar el diagrama en PNG'}])
 +`<div class="pfoot">${b({act:'ghelp',i:'help',l:'Ayuda y atajos',on:GP.help,tip:'Ayuda y atajos de teclado'})}${b({act:'gwide',i:GP.wide?'narrow':'wide',l:GP.wide?'Contraer paleta':'Mostrar nombres',tip:GP.wide?'Contraer paleta':'Mostrar los nombres de las herramientas'})}</div>`}
function paintPalette(){const p=$('#palette');if(p)p.innerHTML=paletteHTML()}

function setTool(t){
 if(LINK_TOOLS.includes(t)&&onMap()){toast('Abre un proceso para conectar tareas');return}
 G.tool=t;G.from=null;
 if(LINK_TOOLS.includes(t)&&UI.g.sel&&G.layout&&G.layout.N&&G.layout.N['t:'+UI.g.sel])G.from=UI.g.sel;
 paintTool()}
function paintTool(){
 $$('#palette [data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===G.tool)));
 const svg=$('#gsvg');if(svg)svg.dataset.tool=G.tool;
 $$('#gsvg .bp-task.from').forEach(x=>x.classList.remove('from'));
 if(G.from){const el=$(`#gsvg [data-nid="${G.from}"]`);if(el)el.classList.add('from')}
 const h=$('#ghint');if(!h)return;
 if(!LINK_TOOLS.includes(G.tool)){h.hidden=true;gGhost(null);return}
 const what=G.tool==='gwx'?'una salida exclusiva (X)':G.tool==='gwp'?'una salida paralela (+)':'un flujo de secuencia';
 const fa=G.from&&ENT_get('actividades',G.from);
 h.innerHTML=`${gIcon(G.tool==='connect'?'connect':G.tool)}<span>${fa?`Creando ${what} desde <b>${esc(clip(fa.nombre,42))}</b>: haz clic en la tarea destino.`:`Creando ${what}: haz clic en la tarea de origen.`}</span><kbd>Esc</kbd><button class="btn ghost sm" data-act="gtool" data-tool="select" type="button">Cancelar</button>`;
 h.hidden=false;if(!fa)gGhost(null)}
/* Clic sobre una tarea con una herramienta de enlace: primero origen, luego destino */
function toolPick(id){
 if(!LINK_TOOLS.includes(G.tool))return false;
 if(!G.from){G.from=id;paintTool();return true}
 if(id===G.from){toast('Elige una tarea distinta como destino');return true}
 const preset={origen:G.from,destino:id};if(G.tool==='gwx')preset.compuerta='Exclusiva';if(G.tool==='gwp')preset.compuerta='Paralela';
 G.tool='select';G.from=null;paintTool();openForm('enlaces',null,{preset});return true}
/* Línea guía mientras se elige el destino */
function gGhost(pt){const g=$('#gghost');if(!g)return;const L=G.layout,n=G.from&&L&&L.N&&L.N['t:'+G.from];
 if(!pt||!n){g.setAttribute('d','');return}
 g.setAttribute('d',`M${n.x+n.w} ${n.cy} L${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`)}
function gWorldPt(e){const svg=$('#gsvg'),r=svg.getBoundingClientRect(),v=UI.g.view;return[(e.clientX-r.left-v.x)/v.k,(e.clientY-r.top-v.y)/v.k]}

/* ---- Acciones de creación ---- */
function gNewTask(){
 const pid=UI.g.proceso&&!onMap()&&ENT_get('procesos',UI.g.proceso)?UI.g.proceso:(DB.procesos[0]||{}).id||'';
 if(!pid){openForm('procesos');return}
 const mx=DB.actividades.filter(x=>x.proceso===pid).reduce((m,x)=>Math.max(m,num(x.orden)||0),0);
 openForm('actividades',null,{preset:{proceso:pid,orden:mx+1,estado:'Borrador'}})}

function gToggle(k){
 if(k==='gaps'){UI.g.gaps=UI.g.gaps===false;drawGraph();paintPalette();return}
 gpSet(k,!GP[k]);
 if(k==='legend'){const l=$('#glegend');if(l)l.hidden=!GP.legend}
 if(k==='help'){const l=$('#ghelp');if(l)l.hidden=!GP.help}
 if(k==='mini')bpMini();
 if(k==='wide'){const m=$('.modeler');if(m)m.classList.toggle('wide',GP.wide)}
 paintPalette();paintTool()}

/* ---- Atajos de teclado del modelador ---- */
document.addEventListener('keydown',e=>{
 if(UI.tab!=='grafica'||e.ctrlKey||e.metaKey||e.altKey)return;
 const t=e.target;if(t&&t.closest&&t.closest('input,select,textarea,[contenteditable]'))return;if(document.querySelector('dialog[open]'))return;
 if(e.key==='Escape'&&G.tool!=='select'){e.preventDefault();setTool('select');return}
 const f={v:()=>setTool('select'),h:()=>setTool('hand'),c:()=>setTool('connect'),x:()=>setTool('gwx'),p:()=>setTool('gwp'),t:gNewTask,'+':()=>zoomAt(1.25),'=':()=>zoomAt(1.25),'-':()=>zoomAt(.8),'0':()=>fitView(false)}[e.key.toLowerCase()];
 if(f){e.preventDefault();f()}});
