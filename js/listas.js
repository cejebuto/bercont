'use strict';
/* ============ Lista genérica con búsqueda y filtros ============ */
function searchText(e,r){
 return ENT[e].fields.map(f=>{const v=r[f.k];if(f.t==='ref')return T(f.e,v);if(f.t==='multiref')return(v||[]).map(x=>T(f.e,x)).join(' ');return v}).concat([r.id]).join(' ').toLowerCase();
}
function filteredRows(e,fs){
 const meta=ENT[e];let rows=DB[e].slice();
 if(fs.q){const q=fs.q.toLowerCase();rows=rows.filter(r=>searchText(e,r).includes(q))}
 (meta.filters||[]).forEach(f=>{const v=fs[f.id];if(v)rows=rows.filter(r=>f.fn(r,v))});
 if(e==='actividades')rows.sort((a,b)=>(a.proceso||'').localeCompare(b.proceso||'')||((num(a.orden)??1e9)-(num(b.orden)??1e9)));
 else if(e==='etapas')rows.sort((a,b)=>(a.proceso||'').localeCompare(b.proceso||'')||((num(a.orden)??1e9)-(num(b.orden)??1e9)));
 else if(e==='enlaces')rows.sort((a,b)=>{const A=ENT_get('actividades',a.origen),B=ENT_get('actividades',b.origen);return (num(A&&A.orden)??1e9)-(num(B&&B.orden)??1e9)});
 return rows;
}
const lc1=s=>s.charAt(0).toLowerCase()+s.slice(1);
function nActOf(e,fs){return (ENT[e].filters||[]).filter(f=>fs[f.id]).length+(fs.q?1:0)}
function tableHTML(e,rows,total){
 const meta=ENT[e];
 if(!rows.length)return `<div class="tblwrap"><div class="empty"><b>${total?'Ningún registro coincide con los filtros':'Aún no hay '+esc(lc1(meta.many))}</b>${total?'Prueba limpiando los filtros.':'Agrégalo a partir de una entrevista.'}<div class="empty-act">${total?`<button class="btn sm" data-act="clearf" data-e="${e}" type="button">Limpiar filtros</button>`:`<button class="btn primary" data-act="new" data-e="${e}" type="button">Agregar</button>`}</div></div></div>`;
 /* Agrupa por proceso (encabezado de grupo) cuando la lista lo define y no hay un proceso filtrado */
 const grouped=meta.group&&!(UI.f[e]||{}).proceso,nc=meta.cols.length+1;let last=null;
 const counts={};if(grouped)rows.forEach(r=>{const k=meta.group(r)[0];counts[k]=(counts[k]||0)+1});
 const body=rows.map(r=>{let h='';
  if(grouped){const[k,l]=meta.group(r);if(k!==last){last=k;h=`<tr class="grp"><th colspan="${nc}" scope="colgroup"><span>${esc(l)}</span><small>${counts[k]} ${counts[k]===1?'registro':'registros'}</small></th></tr>`}}
  const lb=esc(meta.label(r));
  return h+`<tr data-act="edit" data-e="${e}" data-id="${r.id}">${meta.cols.map(c=>`<td>${c.v(r)}</td>`).join('')}<td class="act"><button class="btn ghost ico" data-act="edit" data-e="${e}" data-id="${r.id}" type="button" aria-label="Editar ${lb}" title="Editar">${LI.edit}</button><button class="btn ghost ico danger" data-act="del" data-e="${e}" data-id="${r.id}" type="button" aria-label="Eliminar ${lb}" title="Eliminar">${LI.del}</button></td></tr>`}).join('');
 return `<div class="tblwrap"><table class="tbl"><thead><tr>${meta.cols.map(c=>`<th>${esc(c.h)}</th>`).join('')}<th><span class="sr">Acciones</span></th></tr></thead><tbody>${body}</tbody></table></div>`;
}
/* ---- Barra de filtros ----
   Búsqueda + filtro principal (proceso) a la vista; el resto va en el panel «Filtros».
   Los filtros activos se muestran como etiquetas que se quitan con un clic.
   Si el panel queda abierto o cerrado se recuerda por lista en localStorage. */
const FP_KEY='bercont-filtros-abiertos';
function lsRead(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function lsWrite(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
const fpIsOpen=e=>!!(lsRead(FP_KEY)||{})[e];
function fpSetOpen(e,v){const o=lsRead(FP_KEY)||{};o[e]=v;lsWrite(FP_KEY,o)}
const FGROUP={proceso:'Ubicación',etapa:'Ubicación',area:'Ubicación',actor:'Ubicación',sistema:'Herramientas',problema:'Problemas',reproceso:'Problemas',estado:'Estado del registro',tipo:'Tipo',mide:'Medición',existe:'ERP'};
const LI={
 search:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="8.6" cy="8.6" r="5.4"/><path d="M12.6 12.6l4.4 4.4"/></svg>',
 filter:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M3 5h14M6 10h8M8.5 15h3"/></svg>',
 x:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>',
 plus:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M7 2v10M2 7h10"/></svg>',
 edit:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.6 3.6l2.8 2.8L7.2 15.6 3.6 16.4l.8-3.6z"/><path d="M11.8 5.4l2.8 2.8"/></svg>',
 del:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 5.5h13M8 5.5V3.8h4v1.7M5.2 5.5l.8 11h8l.8-11M8.4 8.6v5M11.6 8.6v5"/></svg>'};
function fSplit(e){const fl=ENT[e].filters||[],prim=fl.find(f=>f.id==='proceso')||(fl.length===1?fl[0]:null);return{prim,rest:fl.filter(f=>f!==prim)}}
function fSel(f,fs,prim){return `<select data-f="${f.id}" class="fsel${prim?' fprim':''}${fs[f.id]?' on':''}" aria-label="${esc(f.l)}"><option value="">${prim?esc(f.l)+': todos':'Todos'}</option>${f.opts().map(([v,l])=>`<option value="${esc(v)}"${fs[f.id]===v?' selected':''}>${esc(l)}</option>`).join('')}</select>`}
function fPanel(e,rest,fs){
 const groups={};rest.forEach(f=>{const g=FGROUP[f.id]||'Filtros';(groups[g]||(groups[g]=[])).push(f)});
 return Object.entries(groups).map(([g,fl])=>`<fieldset class="fgrp"><legend>${esc(g)}</legend>${fl.map(f=>`<label class="ff"><span>${esc(f.l)}</span>${fSel(f,fs,false)}</label>`).join('')}</fieldset>`).join('')}
function fChips(e,fs){
 const meta=ENT[e],c=[];
 if(fs.q)c.push(['q','Búsqueda','«'+fs.q+'»']);
 (meta.filters||[]).forEach(f=>{const v=fs[f.id];if(!v)return;const o=f.opts().find(x=>x[0]===v);c.push([f.id,f.l,o?o[1]:v])});
 if(!c.length)return '';
 return c.map(([id,l,v])=>`<button class="fchip" data-act="fclear" data-e="${e}" data-f="${id}" type="button" aria-label="Quitar filtro ${esc(l)}: ${esc(v)}" title="Quitar este filtro"><span>${esc(l)}:</span><b>${esc(clip(v,48))}</b>${LI.x}</button>`).join('')+(c.length>1?`<button class="btn ghost sm" data-act="clearf" data-e="${e}" type="button">Quitar todos</button>`:'')}
function fCount(e,rows){const n=rows.length,t=DB[e].length;return n===t?`${t} ${t===1?'registro':'registros'}`:`<b>${n}</b> de ${t}`}
function listHTML(e){
 const meta=ENT[e];const fs=UI.f[e]||(UI.f[e]={});
 const{prim,rest}=fSplit(e),nRest=rest.filter(f=>fs[f.id]).length,open=rest.length&&fpIsOpen(e);
 const rows=filteredRows(e,fs);
 return `<div class="lbar" data-e="${e}">
 <label class="fsearch${fs.q?' on':''}">${LI.search}<input type="search" data-f="q" placeholder="${esc(meta.search||'Buscar en '+lc1(meta.many)+'…')}" value="${esc(fs.q||'')}" aria-label="Buscar"></label>
 ${prim?fSel(prim,fs,true):''}
 ${rest.length?`<button class="btn ftog${nRest?' on':''}" data-act="ftoggle" data-e="${e}" aria-expanded="${!!open}" aria-controls="fpanel" type="button">${LI.filter}Filtros<span class="fbadge" id="fbadge"${nRest?'':' hidden'}>${nRest}</span></button>`:''}
 <span class="grow"></span><span class="count" id="cnt" aria-live="polite">${fCount(e,rows)}</span>
 <button class="btn primary" data-act="new" data-e="${e}" type="button">${LI.plus}Agregar</button></div>
 ${rest.length?`<div class="fpanel" id="fpanel" data-e="${e}"${open?'':' hidden'}>${fPanel(e,rest,fs)}</div>`:''}
 <div class="fchips" id="fchips">${fChips(e,fs)}</div>
 <div id="results">${tableHTML(e,rows,DB[e].length)}</div>`;
}
function paintResults(e){
 const fs=UI.f[e]||{};const rows=filteredRows(e,fs);
 const r=$('#results');if(r)r.innerHTML=tableHTML(e,rows,DB[e].length);
 const c=$('#cnt');if(c)c.innerHTML=fCount(e,rows);
 const ch=$('#fchips');if(ch)ch.innerHTML=fChips(e,fs);
 $$('.lbar select[data-f],.fpanel select[data-f]').forEach(el=>el.classList.toggle('on',!!fs[el.dataset.f]));
 const s=$('.fsearch');if(s)s.classList.toggle('on',!!fs.q);
 const{rest}=fSplit(e),nRest=rest.filter(f=>fs[f.id]).length,b=$('#fbadge'),t=$('.ftog');
 if(b){b.textContent=nRest;b.hidden=!nRest}if(t)t.classList.toggle('on',!!nRest);
}
/* Abrir/cerrar el panel de filtros y quitar un filtro desde su etiqueta */
document.addEventListener('click',ev=>{
 const b=ev.target.closest('[data-act="ftoggle"],[data-act="fclear"]');if(!b)return;
 const e=b.dataset.e;
 if(b.dataset.act==='ftoggle'){const p=$('#fpanel');if(!p)return;const open=p.hidden;p.hidden=!open;b.setAttribute('aria-expanded',String(open));fpSetOpen(e,open);if(open){const f=p.querySelector('select');if(f)f.focus()}return}
 const fs=UI.f[e]||(UI.f[e]={}),k=b.dataset.f;fs[k]='';
 const ctl=document.querySelector(`[data-e="${e}"] [data-f="${k}"]`);if(ctl)ctl.value='';
 paintResults(e);if(typeof saveUI==='function')saveUI();
 const nx=$('#fchips .fchip')||$('.fsearch input');if(nx)nx.focus();
});

