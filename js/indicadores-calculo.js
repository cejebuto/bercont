'use strict';
/* ============ Cálculo de indicadores (solo con datos registrados) ============ */
const tally=(arr,fn)=>{const m=new Map();arr.forEach(x=>{const k=fn(x);m.set(k,(m.get(k)||0)+1)});return [...m.entries()].sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0]),'es'))};
const areaName=id=>{const a=ENT_get('areas',id);return a?a.nombre:'Sin área'};
const actorName=a=>{const x=ENT_get('actores',a.actor);return x?x.nombre:'Sin actor asignado'};
function stats(pid){
 const acts=DB.actividades.filter(a=>pid==='all'||a.proceso===pid);
 const ids=new Set(acts.map(a=>a.id));
 const links=DB.enlaces.filter(l=>ids.has(l.origen)&&ids.has(l.destino));
 const cross=links.filter(xarea);
 const MIN=CFG.MIN_N;
 const ex=acts.map(a=>num(a.tiempoEjecucion)).filter(v=>v!=null);
 const wa=acts.map(a=>num(a.tiempoEspera)).filter(v=>v!=null);
 const wl=links.map(l=>num(l.tiempoEspera)).filter(v=>v!=null);
 const waits=wa.concat(wl);
 const S={acts,links,cross};
 S.avgExec=ex.length>=MIN?{ok:true,v:avg(ex),n:ex.length}:{ok:false,n:ex.length};
 S.avgWait=waits.length>=MIN?{ok:true,v:avg(waits),n:waits.length}:{ok:false,n:waits.length};
 const cover=acts.length?ex.length/acts.length:0;
 S.total=(ex.length>=MIN&&cover>=CFG.COVER_TOTAL)?{ok:true,v:ex.reduce((s,x)=>s+x,0)+waits.reduce((s,x)=>s+x,0),cover}:{ok:false,cover,n:ex.length};
 S.topWait=acts.filter(a=>num(a.tiempoEspera)>0).sort((a,b)=>num(b.tiempoEspera)-num(a.tiempoEspera)).slice(0,6);
 S.waitFlag=acts.filter(a=>a.espera==='Sí');
 const rAns=acts.filter(a=>a.reproceso!=='');const rYes=acts.filter(a=>a.reproceso==='Sí');
 S.reproceso={answered:rAns.length,yes:rYes,rate:rAns.length>=MIN?rYes.length/rAns.length:null};
 S.causas=tally(rYes,a=>(a.causaReproceso||'').trim()||'Causa sin registrar');
 S.reStage=tally(rYes,a=>(ENT_get('etapas',a.etapa)||{}).nombre||'Sin etapa');
 S.byActor=tally(acts,actorName);
 S.byArea=tally(acts,a=>{const x=ENT_get('actores',a.actor);return x&&x.area?areaName(x.area):'Sin área'});
 S.byStage=tally(acts,a=>(ENT_get('etapas',a.etapa)||{}).nombre||'Sin etapa');
 S.pairs=tally(cross,l=>`${areaName(areaOfAct(l.origen))} → ${areaName(areaOfAct(l.destino))}`);
 const per=new Map();cross.forEach(l=>[areaOfAct(l.origen),areaOfAct(l.destino)].forEach(x=>per.set(x,(per.get(x)||0)+1)));
 S.areaXfer=[...per.entries()].map(([k,v])=>[areaName(k),v]).sort((a,b)=>b[1]-a[1]);
 S.reask={answered:acts.filter(a=>a.solicitaInfo!=='').length,yes:acts.filter(a=>a.solicitaInfo==='Sí')};
 const sy=new Map();acts.forEach(a=>(a.sistemas||[]).forEach(s=>sy.set(s,(sy.get(s)||0)+1)));
 S.systems=[...sy.entries()].map(([k,v])=>[T('sistemas',k)||k,v]).sort((a,b)=>b[1]-a[1]);
 return S;
}
function alertsFor(S){
 const A=S.acts,nA=A.length,out=[];
 const flag=(title,key,what)=>{
  const ans=A.filter(a=>a[key]!==''),yes=A.filter(a=>a[key]==='Sí');
  let st,detail;
  if(!ans.length){st='insufficient';detail=`Ninguna de las ${nA} actividades tiene este dato.`}
  else if(!yes.length){st=ans.length>=CFG.MIN_N?'none':'insufficient';detail=st==='none'?`${ans.length} de ${nA} actividades con dato; ninguna lo marca.`:`Solo ${ans.length} de ${nA} actividades tienen dato (mínimo ${CFG.MIN_N} para concluir).`}
  else{st=(yes.length>=CFG.ALERT_MIN_COUNT&&yes.length/ans.length>=CFG.ALERT_RATE)?'alert':'watch';detail=`${yes.length} de ${ans.length} actividades con dato ${what} (${nA} en total): ${yes.map(a=>a.nombre).join('; ')}.`}
  out.push({title,st,detail});
 };
 flag('Alta cantidad de reprocesos','reproceso','tienen reproceso');
 flag('Alta espera','espera','tienen espera');
 flag('Duplicación de información','duplicacion','duplican información');
 {let st,detail;
  if(!S.links.length){st='insufficient';detail='No hay enlaces registrados.'}
  else if(S.cross.length>=CFG.XFER_ALERT){st='alert';detail=`${S.cross.length} de ${S.links.length} enlaces cruzan áreas: ${S.pairs.map(p=>p[0]+' ('+p[1]+')').join('; ')}.`}
  else if(S.cross.length>0){st='watch';detail=`${S.cross.length} de ${S.links.length} enlaces cruzan áreas.`}
  else{st=S.links.length>=CFG.MIN_N?'none':'insufficient';detail=`${S.links.length} enlaces sin cruce de áreas registrado.`}
  out.push({title:'Muchas transferencias entre áreas',st,detail})}
 {const g=tally(A,a=>(a.nombre||'').trim().toLowerCase()).filter(x=>x[1]>1);
  out.push(g.length?{title:'Actividades repetidas',st:'alert',detail:`Nombres repetidos: ${g.map(x=>x[0]+' ('+x[1]+')').join('; ')}.`}:{title:'Actividades repetidas',st:nA>=CFG.MIN_N?'none':'insufficient',detail:nA>=CFG.MIN_N?'No se encontraron nombres de actividad repetidos.':`Solo hay ${nA} actividades registradas.`})}
 flag('Dependencia de procesos manuales','manual','requieren intervención manual');
 return out;
}
const ALERT_LBL={alert:'Alerta',watch:'Para observar',none:'Sin alerta',insufficient:'Datos insuficientes'};
function card(title,val,why,wide){
 return `<div class="ind${wide?' wide':''}"><h4>${esc(title)}</h4>${val==null?'<div class="val ins">Datos insuficientes</div>':(val.startsWith('<')?val:`<div class="val">${esc(val)}</div>`)}${why?`<div class="why">${esc(why)}</div>`:''}</div>`;
}
function bars(list,unit=''){
 if(!list.length)return '<div class="val ins">Datos insuficientes</div>';
 const mx=Math.max(...list.map(x=>x[1]));
 return list.map(([l,n])=>`<div class="barrow"><span class="t" title="${esc(l)}">${esc(l)}</span><i><b style="width:${Math.max(4,n/mx*100)}%"></b></i><span class="n">${n}${unit}</span></div>`).join('');
}
