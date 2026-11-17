'use strict';
/* ============ Diálogos ============ */
function confirmBox(title,html,okText='Eliminar',danger=true){
 return new Promise(res=>{
  const d=document.createElement('dialog');
  d.innerHTML=`<div class="dh"><h3>${esc(title)}</h3></div><div class="db">${html}</div><div class="df"><button class="btn" data-x="0" type="button">Cancelar</button><button class="btn ${danger?'danger solid':'primary'}" data-x="1" type="button">${esc(okText)}</button></div>`;
  d.style.width='min(520px,94vw)';
  document.body.appendChild(d);
  d.addEventListener('click',e=>{const b=e.target.closest('[data-x]');if(b){d.close();res(b.dataset.x==='1')}});
  d.addEventListener('close',()=>{d.remove();res(false)});
  d.showModal();
 });
}
function fieldHTML(f,val){
 const id='f_'+f.k;let inp='';
 const optHTML=(list,cur)=>list.map(o=>{const [v,l]=Array.isArray(o)?o:[o,o];return `<option value="${esc(v)}"${String(cur)===String(v)?' selected':''}>${esc(l)}</option>`}).join('');
 switch(f.t){
  case 'text':inp=`<input id="${id}" name="${f.k}" type="text" value="${esc(val)}">`;break;
  case 'textarea':inp=`<textarea id="${id}" name="${f.k}" rows="3">${esc(val)}</textarea>`;break;
  case 'number':inp=`<input id="${id}" name="${f.k}" type="number" min="0" step="any" value="${esc(val)}">`;break;
  case 'date':inp=`<input id="${id}" name="${f.k}" type="date" value="${esc(val)}">`;break;
  case 'datetime':inp=`<input id="${id}" name="${f.k}" type="datetime-local" value="${esc(val)}">`;break;
  case 'select':inp=`<select id="${id}" name="${f.k}"><option value="">—</option>${optHTML(f.o,val)}</select>`;break;
  case 'tri':inp=`<select id="${id}" name="${f.k}">${optHTML(TRI,val)}</select>`;break;
  case 'ref':inp=`<div class="refrow"><select id="${id}" name="${f.k}" data-ref="${f.e}"><option value="">—</option>${optHTML(optsOf(f.e),val)}</select><button type="button" class="btn sm refadd" data-add="${f.e}" data-target="${f.k}" aria-label="Agregar ${esc(ENT[f.e].one.toLowerCase())}">+ Nuevo</button></div>`;break;
  case 'multiref':inp=`<div class="checks" id="${id}" role="group" aria-labelledby="${id}_l" data-multi="${f.k}" data-ref="${f.e}">${multiHTML(f,val)}</div><div><button type="button" class="btn sm refadd" data-add="${f.e}" data-target="${f.k}">+ Nuevo sistema</button></div>`;break;
 }
 const full=f.full||['textarea','multiref'].includes(f.t);
 return (f.g?`<h4 class="fgroup">${esc(f.g)}</h4>`:'')+`<div class="fld${full?' full':''}"><label id="${id}_l"${f.t==='multiref'?'':` for="${id}"`}>${esc(f.l)}${f.req?' *':''}</label>${inp}${f.h?`<small>${esc(f.h)}</small>`:''}</div>`;
}
function multiHTML(f,val){const sel=val||[];const o=optsOf(f.e);return o.length?o.map(([v,l])=>`<label><input type="checkbox" name="${f.k}" value="${esc(v)}"${sel.includes(v)?' checked':''}> ${esc(l)}</label>`).join(''):'<span class="dim">Aún no hay sistemas registrados.</span>'}
function openForm(en,id,opts={}){
 const meta=ENT[en];const rec=id?ENT_get(en,id):null;
 const init=rec?rec:Object.assign(defaults(en),opts.preset||{});
 const d=document.createElement('dialog');
 const masc=['procesos','sistemas','actores','enlaces','erpDatos','indicadores'].includes(en);
 d.innerHTML=`<div class="dh"><h3>${rec?'Editar':masc?'Nuevo':'Nueva'} ${esc(meta.one.toLowerCase())}${rec?`<span class="id">${rec.id}</span>`:''}</h3><button class="btn ghost dclose" data-x="c" type="button" aria-label="Cerrar">${ICON_X}</button></div>
 <div class="db">${en==='actividades'?'<p class="dim" style="margin:0 0 14px;font-size:12.5px">Todos los campos son opcionales salvo el nombre. Déjalos vacíos si aún no se tiene el dato; se pueden completar en la siguiente entrevista.</p>':''}<div class="grid">${meta.fields.map(f=>fieldHTML(f,init[f.k])).join('')}</div>${rec?`<p class="dim" style="margin:10px 0 0;font-size:12px">Creado ${fmtDT(rec.creadoEn)} · Actualizado ${fmtDT(rec.actualizadoEn)}</p>`:''}</div>
 <div class="df"><span class="err" role="alert"></span><button class="btn" data-x="c" type="button">Cancelar</button><button class="btn primary" data-x="s" type="button" title="Guardar (Ctrl+Enter)">Guardar</button></div>`;
 document.body.appendChild(d);
 let dirty=false;const mark=()=>dirty=true;
 d.addEventListener('input',mark);d.addEventListener('change',mark);
 const tryClose=async()=>{if(!dirty||await confirmBox('Descartar cambios','<p>Hay cambios sin guardar en este formulario.</p>','Descartar'))d.close()};
 d.addEventListener('cancel',e=>{e.preventDefault();tryClose()});
 d.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();d.querySelector('[data-x="s"]').click()}});
 d.addEventListener('click',e=>{
  const add=e.target.closest('[data-add]');
  if(add){
   const ae=add.dataset.add,target=add.dataset.target;const preset={};
   if(ae==='etapas'){const p=d.querySelector('[name="proceso"]');if(p&&p.value)preset.proceso=p.value}
   if(ae==='actores'||ae==='sistemas'||ae==='etapas'||ae==='areas'||ae==='procesos'||ae==='entrevistas'||ae==='actividades'){
    openForm(ae,null,{preset,onSaved:r=>{dirty=true;refreshRef(d,meta,target,ae,r.id)}});
   }
   return;
  }
  const b=e.target.closest('[data-x]');if(!b)return;
  if(b.dataset.x==='c'){tryClose();return}
  $$('[aria-invalid]',d).forEach(x=>x.removeAttribute('aria-invalid'));
  const vals={};let bad='',badK='';
  meta.fields.forEach(f=>{
   if(f.t==='multiref')vals[f.k]=$$(`input[name="${f.k}"]:checked`,d).map(x=>x.value);
   else{const el=d.querySelector(`[name="${f.k}"]`);let v=el?el.value:'';if(f.t==='number')v=num(v)==null?'':num(v);else if(f.t==='text'||f.t==='textarea')v=v.trim();vals[f.k]=v}
   if(f.req&&(vals[f.k]===''||vals[f.k]==null)){if(!badK){bad=`Falta: ${f.l}.`;badK=f.k}}
  });
  if(bad){d.querySelector('.err').textContent=bad;const el=d.querySelector(`[name="${badK}"]`);if(el){el.setAttribute('aria-invalid','true');el.focus();el.scrollIntoView({block:'center'})}return}
  const t=nowISO();let out;
  if(rec){Object.assign(rec,vals,{actualizadoEn:t});out=rec}
  else{out=Object.assign(defaults(en),vals,{id:nextId(en),creadoEn:t,actualizadoEn:t});DB[en].push(out)}
  if(en==='enlaces'){const o=ENT_get('actividades',out.origen);out.proceso=o?o.proceso:''}
  save();d.close();toast(rec?'Cambios guardados':'Registro creado');
  if(opts.onSaved)opts.onSaved(out);
  render();
 });
 d.addEventListener('close',()=>d.remove());
 d.showModal();
 const first=d.querySelector('input[type=text]');if(first)first.focus();
 return d;
}
function refreshRef(d,meta,target,ae,newId){
 const f=meta.fields.find(x=>x.k===target);if(!f)return;
 if(f.t==='multiref'){const box=d.querySelector(`[data-multi="${target}"]`);const cur=$$(`input[name="${target}"]:checked`,d).map(x=>x.value);cur.push(newId);box.innerHTML=multiHTML(f,cur)}
 else{const sel=d.querySelector(`[name="${target}"]`);sel.innerHTML=`<option value="">—</option>`+optsOf(f.e).map(([v,l])=>`<option value="${esc(v)}"${v===newId?' selected':''}>${esc(l)}</option>`).join('')}
}
function refsTo(e,id){
 const out=[];
 ENT_ORDER.forEach(en=>ENT[en].fields.forEach(f=>{
  if(f.e!==e)return;
  DB[en].forEach(r=>{const hit=f.t==='ref'?r[f.k]===id:f.t==='multiref'?(r[f.k]||[]).includes(id):false;if(hit)out.push({en,r,f})});
 }));
 return out;
}
async function askDelete(e,id){
 const rec=ENT_get(e,id);if(!rec)return;
 const refs=refsTo(e,id);
 if(e==='procesos'){
  const n=refs.filter(x=>x.en==='actividades').length,m=refs.filter(x=>x.en==='etapas').length;
  if(n||m){await confirmBox('No se puede eliminar el proceso',`<p>«${esc(rec.nombre)}» todavía tiene ${n} actividad(es) y ${m} etapa(s). Elimínalas o muévelas a otro proceso primero.</p>`,'Entendido',false);return}
 }
 const links=e==='actividades'?refs.filter(x=>x.en==='enlaces'):[];
 const others=refs.filter(x=>!(e==='actividades'&&x.en==='enlaces'));
 let html=`<p>Se eliminará <b>${esc(ENT[e].label(rec))}</b> (${rec.id}). Esta acción no se puede deshacer.</p>`;
 if(links.length)html+=`<p>También se eliminarán ${links.length} enlace(s) de información que la conectan con otras actividades.</p>`;
 if(others.length)html+=`<p>Está referido en ${others.length} registro(s); esa referencia quedará vacía (${esc([...new Set(others.map(x=>ENT[x.en].many))].join(', '))}).</p>`;
 if(!(await confirmBox('Eliminar registro',html)))return;
 links.forEach(x=>{DB.enlaces=DB.enlaces.filter(l=>l.id!==x.r.id)});
 others.forEach(x=>{if(x.f.t==='multiref')x.r[x.f.k]=x.r[x.f.k].filter(v=>v!==id);else x.r[x.f.k]=''});
 DB[e]=DB[e].filter(r=>r.id!==id);
 save();toast('Registro eliminado');render();
}

