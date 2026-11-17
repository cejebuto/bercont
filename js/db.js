'use strict';
/* ============ Datos iniciales (entrevistas ENT-001 a ENT-006) ============ */
let DB=null;
function emptyDB(){const d={v:1};ENT_ORDER.forEach(e=>d[e]=[]);return d}
function defaults(e){const o={};ENT[e].fields.forEach(f=>{o[f.k]=f.t==='multiref'?[]:(f.def!==undefined?f.def:'')});return o}
const sid=(p,n)=>p+'-'+String(n).padStart(3,'0');
function nextId(e){const p=ENT[e].p;const mx=DB[e].reduce((m,r)=>{const n=parseInt(String(r.id).split('-')[1],10);return isNaN(n)?m:Math.max(m,n)},0);return sid(p,mx+1)}
function load(){
 try{const r=localStorage.getItem(STORE_KEY);if(r){const d=JSON.parse(r);if(d&&d.v)return Object.assign(emptyDB(),d)}}catch(e){storageOK=false}
 return seed();
}
function save(){
 try{localStorage.setItem(STORE_KEY,JSON.stringify(DB));storageOK=true}catch(e){storageOK=false}
 paintSaveState();
}
function paintSaveState(){const s=$('#savestate');if(!s)return;s.textContent=storageOK?'Guardado en este navegador':'Sin guardado automático: exporta una copia';s.classList.toggle('off',!storageOK)}
