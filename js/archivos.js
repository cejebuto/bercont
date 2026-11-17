'use strict';
/* ============ Descarga de archivos (usado por Exportar y por la Vista gráfica) ============ */
const stamp=()=>new Date().toISOString().slice(0,10);
async function saveFile(filename,data){
 let dl=null;try{dl=window.claude&&window.claude.use?await window.claude.use('downloads'):null}catch(e){dl=null}
 if(dl){try{await dl.save({filename,data});toast('Archivo listo: '+filename);return true}catch(e){if(e&&e.code!=='declined')toast('No se pudo guardar el archivo'+(e&&e.code?' ('+e.code+')':''));return false}}
 try{const blob=data instanceof Blob?data:new Blob([data]);const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();a.remove();toast('Archivo descargado: '+filename);return true}catch(e){toast('No se pudo descargar el archivo');return false}
}
