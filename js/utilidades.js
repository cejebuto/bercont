'use strict';
/* ============ Utilidades ============ */
const $=(s,el=document)=>el.querySelector(s);
const $$=(s,el=document)=>[...el.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nowISO=()=>new Date().toISOString();
const fmtDT=iso=>iso?new Date(iso).toLocaleString('es-CO',{dateStyle:'medium',timeStyle:'short'}):'';
const num=v=>(v===''||v==null||isNaN(Number(v)))?null:Number(v);
const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;
const fmtMin=m=>{if(m==null)return '';m=Math.round(m*10)/10;if(m<60)return m+' min';const h=Math.floor(m/60),r=Math.round(m%60);return h+' h'+(r?' '+r+' min':'')};
const clip=(s,n)=>{s=String(s||'');return s.length>n?s.slice(0,n-1)+'…':s};
const pct=x=>Math.round(x*100)+'%';
const ICON_X='<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
const STORE_KEY='bercont-pmdt-v4';
const CFG={MIN_N:3,ALERT_RATE:0.3,ALERT_MIN_COUNT:2,XFER_ALERT:3,COVER_TOTAL:0.8};
let storageOK=true;

