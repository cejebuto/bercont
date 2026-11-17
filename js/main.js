'use strict';
/* ============ Arranque ============ */
const THEME_ICON={
 dark:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M16.5 12.2A6.8 6.8 0 0 1 7.8 3.5a6.8 6.8 0 1 0 8.7 8.7z"/></svg>',
 light:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="10" cy="10" r="3.6"/><path d="M10 1.8v2M10 16.2v2M1.8 10h2M16.2 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4"/></svg>'};
function isDark(){const cur=document.documentElement.dataset.theme;return cur?cur==='dark':matchMedia('(prefers-color-scheme: dark)').matches}
function paintThemeBtn(){const b=$('#themeBtn');if(!b)return;const d=isDark();b.innerHTML=d?THEME_ICON.light:THEME_ICON.dark;const l=d?'Cambiar a tema claro':'Cambiar a tema oscuro';b.title=l;b.setAttribute('aria-label',l)}
(function boot(){
 DB=load();
 restoreUI();
 UI.tab=document.body.dataset.page||'inicio';
 if(UI.tab==='grafica')UI.g.fitNext=true; /* restaura el encuadre guardado del diagrama o lo ajusta */
 try{const th=localStorage.getItem('bercont-theme');if(th)document.documentElement.dataset.theme=th}catch(e){}
 paintThemeBtn();
 $('#themeBtn').addEventListener('click',()=>{
  const next=isDark()?'light':'dark';document.documentElement.dataset.theme=next;
  try{localStorage.setItem('bercont-theme',next)}catch(e){}
  paintThemeBtn();
  if(UI.tab==='grafica')drawGraph();
 });
 try{if(!localStorage.getItem(STORE_KEY))save()}catch(e){storageOK=false}
 render();
 runPending(takePending());
 /* Abierto con doble clic (file://): Chrome y Edge comparten los datos entre todas las páginas;
    Firefox aísla cada archivo, así que lo guardado en una página no aparece en las otras. */
 if(location.protocol==='file:'&&/firefox/i.test(navigator.userAgent)){
  const n=document.createElement('div');n.className='fxnote';n.setAttribute('role','alert');
  n.innerHTML='<b>Firefox guarda los datos por separado en cada página</b> cuando se abre el archivo directamente. Para que todo quede conectado, abre BERCONT en Chrome o Edge.<button class="btn ghost sm" type="button">Entendido</button>';
  n.querySelector('button').addEventListener('click',()=>n.remove());$('#app').prepend(n)}
})();
