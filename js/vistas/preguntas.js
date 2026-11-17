'use strict';
/* ============ Vista: Preguntas mejoradas ============
   Lo que se marca y se responde se guarda en DB.preguntas, así viaja en la copia de seguridad
   y se conserva al usar «Restaurar datos de la entrevista». */
function pqState(){
 if(!DB.preguntas||typeof DB.preguntas!=='object')DB.preguntas={hecha:{},resp:{}};
 const s=DB.preguntas;if(!s.hecha)s.hecha={};if(!s.resp)s.resp={};return s;
}
const pqTodas=()=>PREG_PERSONAS.flatMap(p=>p.q);
const pqNivel=v=>v>=80?'hi':v>=50?'mid':'lo';
const pqHechas=p=>p.q.filter(q=>pqState().hecha[q[0]]).length;
function pqTotales(){const s=pqState(),all=pqTodas();return {total:all.length,hechas:all.filter(q=>s.hecha[q[0]]).length,resp:all.filter(q=>(s.resp[q[0]]||'').trim()).length}}

function pagePreguntas(){
 const s=pqState(),c=pqTotales();
 const cov=Math.round(avg(PREG_ETAPAS.map(e=>e[1])));
 const errores=pqTodas().filter(q=>q[2]==='error').length;
 const strip=[
  [PREG_PERSONAS.length,'Personas o grupos','',''],
  [c.total,'Preguntas',`${errores} corrigen errores de flujo`,''],
  [c.hechas,'Preguntadas','','pq-n-hechas'],
  [c.resp,'Con respuesta anotada','','pq-n-resp'],
  [PREG_PERSONAS.filter(p=>p.nuevo).length,'Sin entrevistar todavía','','']
 ].map(([v,l,sub,id])=>`<div><div class="v"${id?` id="${id}"`:''}>${esc(v)}</div><div class="l">${esc(l)}</div>${sub?`<div class="s">${esc(sub)}</div>`:''}</div>`).join('');

 const etapas=PREG_ETAPAS.map((e,i)=>`<li class="${pqNivel(e[1])}"><span class="sn">${i+1}</span><b>${esc(e[0])}</b><span class="bar"><i><b style="width:${e[1]}%"></b></i><span>${e[1]} %</span></span><span class="gapt">${esc(e[2])}</span></li>`).join('');
 const notas=PREG_NOTAS.map(n=>`<li><b>${esc(n[0])}</b> ${esc(n[1])}</li>`).join('');
 const pasos=PREG_PASOS.map(p=>`<li><b>${esc(p[0])}</b><span>${esc(p[1])}</span></li>`).join('');

 const indice=PREG_PERSONAS.map(p=>`<li><a href="#pq-${p.id}">${esc(p.nombre)}</a><span class="pqprog" data-pqidx="${p.id}">${pqHechas(p)}/${p.q.length}</span></li>`).join('');
 const fichas=PREG_PERSONAS.map(p=>{
  const n=pqHechas(p);
  const qs=p.q.map(([id,texto,tipo,ref])=>{const tp=PREG_TIPOS[tipo]||['',tipo];const ok=!!s.hecha[id];
   return `<li class="${ok?'done':''}"><input type="checkbox" id="pq-c-${id}" data-pq="${id}"${ok?' checked':''}>
    <div class="pqbody"><label for="pq-c-${id}">${esc(texto)}</label>
     <div class="pqmeta">${chip(tp[1],tp[0])}<span class="ref">${esc(ref)}</span></div>
     <textarea id="pq-r-${id}" data-pqr="${id}" rows="2" placeholder="Respuesta" aria-label="Respuesta a la pregunta">${esc(s.resp[id]||'')}</textarea></div></li>`}).join('');
  return `<section class="panel pqcard" id="pq-${p.id}">
   <div class="pqhead"><div class="pqname"><h3>${esc(p.nombre)}</h3><div class="muted">${esc(p.rol)}</div></div>${chip(p.estado,p.nuevo?'wait':'')}</div>
   <p class="note">${esc(p.porque)}</p>
   <ol class="pqlist">${qs}</ol>
   <div class="pqfoot"><span class="pqprog${n===p.q.length?' full':''}" data-pqcard="${p.id}">${n} de ${p.q.length} preguntadas</span><button class="btn sm" type="button" data-pqcopy="${p.id}">Copiar preguntas</button></div>
  </section>`}).join('');

 const sinPreguntar=PREG_SIN_PREGUNTAR.map(x=>`<li>${esc(x[0])} <span class="ref">${esc(x[1])}</span></li>`).join('');
 const decisiones=PREG_DECISIONES.map(x=>`<li>${esc(x)}</li>`).join('');

 return `<div class="page pq">
 <div class="ptitle"><div><h2>Preguntas mejoradas</h2><p>Revisión del mapeo frente a las entrevistas (${esc(PREG_FECHA)}). Muestra cuánto del recorrido del lead está mapeado, qué preguntarle a cada persona para completarlo y los pasos para terminar. Lo que marques y respondas se guarda en este navegador y va incluido en la copia de seguridad.</p></div><button class="btn" type="button" data-pqcopy="__todas">Copiar todas las preguntas</button></div>
 <div class="strip pqstrip">${strip}</div>
 <div class="cols2">
  <div class="panel"><h3>Cobertura del recorrido del lead</h3>
   <div class="pqverdict"><div class="big">~${cov} %</div><p>Hay un camino continuo desde «Recibir lead» hasta la operación del proyecto, pero se corta antes del final: no llega a «factura emitida» ni a «pago recibido», y el comercial, que acompaña al lead durante más tiempo, no ha sido entrevistado.</p></div>
   <ol class="pqstages">${etapas}</ol>
   <ul class="pqnotes">${notas}</ul>
   <p class="note">Estimación hecha a mano siguiendo los enlaces del mapa. No se recalcula sola: al corregir el mapa hay que actualizarla.</p>
  </div>
  <div class="panel"><h3>Pasos para finalizar</h3><ol class="pqpasos">${pasos}</ol></div>
 </div>
 <h3 class="pqsec">Preguntas por persona</h3>
 <div class="pqlayout">
  <nav class="panel pqindex" aria-label="Personas"><ul>${indice}</ul></nav>
  <div class="pqpeople">${fichas}</div>
 </div>
 <div class="cols2 pqend">
  <div class="panel"><h3>Se corrigen sin preguntar</h3><p class="note">Las entrevistas ya tienen la respuesta. Basta con pasarla al mapa.</p><ul class="pqplain">${sinPreguntar}</ul></div>
  <div class="panel"><h3>Decisiones del equipo de levantamiento</h3><p class="note">No dependen de una entrevista. Las define el equipo que construye la herramienta.</p><ul class="pqplain">${decisiones}</ul></div>
 </div>
</div>`;
}

/* Actualiza contadores sin volver a pintar la página (para no perder el foco al escribir) */
function pqPaint(){
 const c=pqTotales();const h=$('#pq-n-hechas'),r=$('#pq-n-resp');if(h)h.textContent=c.hechas;if(r)r.textContent=c.resp;
 PREG_PERSONAS.forEach(p=>{const n=pqHechas(p);
  const a=$(`[data-pqidx="${p.id}"]`);if(a)a.textContent=`${n}/${p.q.length}`;
  const b=$(`[data-pqcard="${p.id}"]`);if(b){b.textContent=`${n} de ${p.q.length} preguntadas`;b.classList.toggle('full',n===p.q.length)}});
}
function pqTexto(p){
 const s=pqState();
 return `Preguntas para ${p.nombre} (${p.rol})\n\n`+p.q.map((q,i)=>{const r=(s.resp[q[0]]||'').trim();return `${i+1}. ${q[1]}`+(r?`\n   Respuesta: ${r}`:'')}).join('\n');
}
function pqCopiar(txt){
 const fallback=()=>{const ta=document.createElement('textarea');ta.value=txt;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();toast(ok?'Preguntas copiadas':'No se pudo copiar automáticamente')};
 try{navigator.clipboard.writeText(txt).then(()=>toast('Preguntas copiadas'),fallback)}catch(e){fallback()}
}
let pqTimer=null;
const pqGuardar=()=>{clearTimeout(pqTimer);pqTimer=null;save();pqPaint()};
document.addEventListener('change',e=>{
 const t=e.target;if(!t.matches||!t.matches('[data-pq]'))return;
 const s=pqState();if(t.checked)s.hecha[t.dataset.pq]=true;else delete s.hecha[t.dataset.pq];
 const li=t.closest('li');if(li)li.classList.toggle('done',t.checked);
 pqGuardar();
});
document.addEventListener('input',e=>{
 const t=e.target;if(!t.matches||!t.matches('[data-pqr]'))return;
 const s=pqState();if(t.value.trim())s.resp[t.dataset.pqr]=t.value;else delete s.resp[t.dataset.pqr];
 clearTimeout(pqTimer);pqTimer=setTimeout(pqGuardar,400);
});
window.addEventListener('pagehide',()=>{if(pqTimer)pqGuardar()});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-pqcopy]');if(!b)return;
 const id=b.dataset.pqcopy;
 if(id==='__todas')pqCopiar(PREG_PERSONAS.map(pqTexto).join('\n\n---\n\n'));
 else{const p=PREG_PERSONAS.find(x=>x.id===id);if(p)pqCopiar(pqTexto(p))}
});
