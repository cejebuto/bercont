'use strict';
/* ============ Estado de interfaz ============ */
const UI={tab:'inicio',sub:'actividades',f:{},
  g:{proceso:'__map',lane:'actor',info:true,sel:null,view:{x:20,y:20,k:1},fitNext:true},
  ind:{proceso:'all'},ex:{sel:{},fmt:'xlsx'},exf:{}};
/* Cada pestaña es una página HTML propia: [clave, etiqueta, número, archivo] */
const TABS=[['inicio','Inicio','','index.html'],['mapear','Mapear proceso','1','mapear.html'],['grafica','Vista gráfica','2','grafica.html'],['indicadores','Indicadores','3','indicadores.html'],['exportar','Exportar / integración','4','exportar.html'],['preguntas','Preguntas mejoradas','','preguntas.html']];
const SUBS=['actividades','actores','enlaces','procesos','etapas','areas','sistemas','entrevistas'];
const SUBKEY={entrevistas:'entrevistas'};
let toastT=null;
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2800)}

/* ---- Estado compartido entre páginas (filtros, proceso elegido, etc.) ---- */
const UI_KEY='bercont-ui';
const PENDING_KEY='bercont-pending';
/* Se guarda en localStorage para que filtros, pestañas y proceso elegido se recuerden
   también al cerrar y volver a abrir el navegador (sessionStorage queda de respaldo). */
function saveUI(){const s=JSON.stringify(UI);try{localStorage.setItem(UI_KEY,s)}catch(e){try{sessionStorage.setItem(UI_KEY,s)}catch(e2){}}}
function restoreUI(){let raw=null;try{raw=localStorage.getItem(UI_KEY)}catch(e){}if(!raw)try{raw=sessionStorage.getItem(UI_KEY)}catch(e){}
 try{const s=JSON.parse(raw||'null');if(s){const g=Object.assign({},UI.g,s.g||{});Object.assign(UI,s);UI.g=g}}catch(e){}}
/* Navega a otra pestaña (página). Si ya estamos en ella, solo vuelve a pintar. */
function goTo(tab,pending){
 if(tab===UI.tab){render();if(pending)runPending(pending);return}
 const t=TABS.find(x=>x[0]===tab);if(!t)return;
 if(pending)try{sessionStorage.setItem(PENDING_KEY,JSON.stringify(pending))}catch(e){}
 UI.tab=tab;saveUI();location.href=t[3];
}
/* Acción que se dejó pendiente al cambiar de página (p. ej. abrir «Nueva actividad») */
function runPending(p){if(p&&p.act==='new')openNew(p.e)}
function takePending(){try{const p=JSON.parse(sessionStorage.getItem(PENDING_KEY)||'null');sessionStorage.removeItem(PENDING_KEY);return p}catch(e){return null}}
window.addEventListener('pagehide',saveUI);
