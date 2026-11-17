'use strict';
/* ============ Vistas ============ */
/* Mapear proceso: navegación lateral por tipo de registro + lista con filtros */
const SUB_ICO={
 actividades:'<rect x="2.5" y="5" width="15" height="10" rx="2.6"/>',
 enlaces:'<circle cx="4.5" cy="10" r="2"/><circle cx="15.5" cy="10" r="2"/><path d="M6.5 10h6.2M10.8 7.6l2.4 2.4-2.4 2.4"/>',
 etapas:'<path d="M2.8 6h5.4l2 4-2 4H2.8l2-4zM10.6 6h4.6l2 4-2 4h-4.6l2-4z" stroke-linejoin="round"/>',
 procesos:'<rect x="2.5" y="4" width="15" height="12" rx="2.6"/><path d="M6 8.2h8M6 11.8h5"/>',
 actores:'<circle cx="10" cy="6.8" r="3"/><path d="M4.4 16.6a5.6 5.6 0 0 1 11.2 0"/>',
 areas:'<rect x="2.5" y="4" width="15" height="12" rx="1.2"/><path d="M6 4v12M6 10h11.5"/>',
 sistemas:'<rect x="2.5" y="3.5" width="15" height="10" rx="1.5"/><path d="M7 16.5h6M10 13.5v3"/>',
 entrevistas:'<path d="M3.5 4.5h13v8.5H9.2l-3.7 3v-3h-2z" stroke-linejoin="round"/>'};
const SUB_GROUPS=[['El proceso',['actividades','enlaces','etapas','procesos']],['Quién participa',['actores','areas']],['Contexto',['sistemas','entrevistas']]];
const SUB_HINT={actividades:'Cada registro es un paso del proceso. Completa solo lo que se sepa; la barra «Datos» muestra cuánto falta.',actores:'Personas, cargos o áreas que intervienen. Puedes crear actores genéricos (p. ej. «Equipo comercial») si aún no se conocen los nombres.',enlaces:'Un enlace es la información o el trabajo que pasa de una actividad a la siguiente. Alimenta la vista gráfica y los indicadores de transferencias.',procesos:'Los procesos se agregan conforme avanzan las entrevistas.',etapas:'Agrupan las actividades de un proceso (p. ej. captación, calificación).',areas:'Áreas o departamentos, internos o externos.',sistemas:'ERP, Excel, correo, otro software o herramientas manuales.',entrevistas:'Registro de cada entrevista; sirve para saber de dónde salió cada dato.'};
function pageMapear(){
 const sub=SUBS.includes(UI.sub)?UI.sub:'actividades';
 const item=s=>`<button class="mni" data-act="sub" data-sub="${s}" type="button"${s===sub?' aria-current="page"':''}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">${SUB_ICO[s]||''}</svg><span class="mnl">${esc(ENT[s].many)}</span><span class="mnc">${DB[s].length}</span></button>`;
 const nav=SUB_GROUPS.map(([g,list])=>`<div class="mng"><div class="mngh">${esc(g)}</div>${list.filter(s=>SUBS.includes(s)).map(item).join('')}</div>`).join('');
 return `<div class="page mapear"><div class="mlayout">
<nav class="mnav" aria-label="Tipo de registro"><h1 class="mtitle">Mapear proceso</h1>${nav}</nav>
<section class="mmain" aria-labelledby="mh"><header class="mhead"><h2 id="mh">${esc(ENT[sub].many)}</h2><p>${esc(SUB_HINT[sub]||'')}</p></header>${listHTML(sub)}</section>
</div></div>`;
}
