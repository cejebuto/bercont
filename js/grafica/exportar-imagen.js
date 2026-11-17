'use strict';
/* ---- Exportar SVG / PNG ---- */
function bpResolveVars(str){const cs=getComputedStyle(document.documentElement);return str.replace(/var\((--[a-z0-9-]+)\)/gi,(m,n)=>cs.getPropertyValue(n).trim()||'#888')}
function bpExportSVG(){const L=G.layout;if(!L){toast('No hay diagrama para descargar');return null}
 const pad=24,top=48,W=Math.ceil(L.W+pad*2),H=Math.ceil(L.H+top+pad),pid=UI.g.proceso,title=`BERCONT · AS-IS · ${pid==='__map'?'Mapa de procesos':pid?T('procesos',pid):'Todos los procesos'}`;
 const raw=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="IBM Plex Sans, Segoe UI, Roboto, Helvetica, Arial, sans-serif" role="img" aria-label="${esc(title)}"><defs>${bpDefs()}</defs><rect width="100%" height="100%" fill="var(--surface)"/><text x="${pad}" y="30" font-size="15" font-weight="600" fill="var(--ink)">${esc(title)}</text><text x="${W-pad}" y="30" text-anchor="end" font-size="10.5" fill="var(--muted)">Generado ${esc(fmtDT(nowISO()))}</text><g transform="translate(${pad} ${top})">${G.markup.replace(/ tabindex="0"/g,'')}</g></svg>`;
 return{svg:bpResolveVars(raw),W,H}}
function bpDownloadSVG(){const x=bpExportSVG();if(x)saveFile(`bercont_bpmn_${stamp()}.svg`,new Blob([x.svg],{type:'image/svg+xml;charset=utf-8'}))}
function bpDownloadPNG(){const x=bpExportSVG();if(!x)return;let sc=Math.min(2,16000/x.W,16000/x.H);if(x.W*x.H*sc*sc>1.2e8)sc=Math.sqrt(1.2e8/(x.W*x.H));
 const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=Math.round(x.W*sc);c.height=Math.round(x.H*sc);const ctx=c.getContext('2d');ctx.scale(sc,sc);ctx.drawImage(img,0,0);
  c.toBlob(b=>b?saveFile(`bercont_bpmn_${stamp()}.png`,b):toast('No se pudo generar el PNG'),'image/png')};
 img.onerror=()=>toast('No se pudo generar el PNG');img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(x.svg)}

