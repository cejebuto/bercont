'use strict';
/* ============ Ruteo y eventos ============ */
function render(){
 const m=$('#main');const keep=m.scrollTop;
 $('#tabs').innerHTML=TABS.map(([k,l,n,href])=>`<button data-act="tab" data-tab="${k}"${UI.tab===k?' aria-current="page"':''} type="button">${n?`<span class="n">${n}</span>`:''}${esc(l)}</button>`).join('');
 if(UI.tab==='inicio')m.innerHTML=pageInicio();
 else if(UI.tab==='mapear')m.innerHTML=pageMapear();
 else if(UI.tab==='grafica'){m.innerHTML=pageGrafica();initGraph()}
 else if(UI.tab==='indicadores')m.innerHTML=pageIndicadores();
 else if(UI.tab==='exportar')m.innerHTML=pageExportar();
 else if(UI.tab==='preguntas')m.innerHTML=pagePreguntas();
 m.scrollTop=(UI.tab===UI.lastTab)?keep:0;UI.lastTab=UI.tab;
 paintSaveState();saveUI();
}
/* Abre el formulario «Nuevo» con valores sugeridos según los filtros actuales */
function openNew(en){
 const preset={};
 if(en==='actividades'){const pf=(UI.f.actividades||{}).proceso||UI.g.proceso||(DB.procesos[0]||{}).id||'';preset.proceso=pf;const mx=DB.actividades.filter(x=>x.proceso===pf).reduce((m,x)=>Math.max(m,num(x.orden)||0),0);preset.orden=mx+1;preset.estado='Borrador'}
 if(en==='etapas'){const pf=(UI.f.etapas||{}).proceso;if(pf)preset.proceso=pf}
 openForm(en,null,{preset});
}
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-act]');if(!el)return;
 if(el.tagName==='TR'&&e.target.closest('button'))return;
 const a=el.dataset.act,en=el.dataset.e,id=el.dataset.id;
 switch(a){
  case 'tab':if(el.dataset.tab==='grafica')UI.g.fitNext=true;goTo(el.dataset.tab);break;
  case 'sub':UI.sub=el.dataset.sub;render();break;
  case 'new':if(el.dataset.go){UI.sub=en;goTo(el.dataset.go,{act:'new',e:en})}else openNew(en);break;
  case 'edit':openForm(en,id);break;
  case 'del':askDelete(en,id);break;
  case 'clearf':UI.f[en]={};render();break;
  case 'goproc':UI.g.proceso=id;UI.g.fitNext=true;goTo('grafica');break;
  case 'goact':{const x=ENT_get('actividades',id);if(x){UI.g.proceso=x.proceso;UI.g.sel=id;UI.g.fitNext=true;goTo('grafica')}break}
  default:if(typeof handleAct==='function')handleAct(a,el,e);
 }
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('li[data-act][role="button"],tr[data-act][tabindex]')){e.preventDefault();e.target.click()}});
document.addEventListener('input',e=>{
 const el=e.target.closest('[data-f]');if(!el)return;
 const tb=el.closest('[data-e]');if(!tb)return;
 const en=tb.dataset.e;(UI.f[en]||(UI.f[en]={}))[el.dataset.f]=el.value;paintResults(en);
});
document.addEventListener('change',e=>{if(typeof handleChange==='function')handleChange(e)});
