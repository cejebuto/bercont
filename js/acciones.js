'use strict';
function handleAct(a,el){
 switch(a){
  case 'gclose':bpClear();break;
  case 'gedit':openForm('actividades',el.dataset.id);break;
  case 'glink':openForm('enlaces',null,{preset:{origen:el.dataset.id}});break;
  case 'gzoom':zoomAt(parseFloat(el.dataset.d));break;
  case 'gfit':fitView(false);break;
  case 'gmap':UI.g.proceso='__map';UI.g.sel=null;UI.g.fitNext=true;G.tool='select';G.from=null;render();break;
  case 'gtool':setTool(el.dataset.tool);break;
  case 'gtask':gNewTask();break;
  case 'gnewe':openForm(el.dataset.d);break;
  case 'gmini':gToggle('mini');break;
  case 'ggaps':gToggle('gaps');break;
  case 'glegend':gToggle('legend');break;
  case 'ghelp':gToggle('help');break;
  case 'gwide':gToggle('wide');break;
  case 'gsvg':bpDownloadSVG();break;
  case 'gpng':bpDownloadPNG();break;
  case 'exportnow':doExport();break;
  case 'exall':case 'exnone':DS.forEach(([k])=>UI.ex.sel[k]=a==='exall');render();break;
  case 'backup':saveFile(`bercont_copia_${stamp()}.json`,JSON.stringify(DB,null,2));break;
  case 'importclick':$('#importFile').click();break;
  case 'reseed':confirmBox('Restaurar datos de las entrevistas','<p>Se reemplazarán todos los datos actuales por los cargados desde las entrevistas registradas (ENT-001 a ENT-006). Se perderán los cambios hechos después. Las respuestas anotadas en «Preguntas mejoradas» se conservan.</p>','Restaurar',true).then(ok=>{if(ok){const keep=DB.preguntas;DB=seed();if(keep)DB.preguntas=keep;save();render();toast('Datos restaurados')}});break;
  case 'wipe':confirmBox('Vaciar todo','<p>Se eliminarán todos los procesos, actividades, actores y demás registros de este navegador. Descarga una copia antes si quieres conservarlos.</p>','Vaciar todo',true).then(ok=>{if(ok){DB=emptyDB();save();render();toast('Todo vaciado')}});break;
 }
}
function handleChange(e){
 const t=e.target;
 if(t.dataset.g){const k=t.dataset.g;if(k==='proceso'){UI.g.proceso=t.value;UI.g.sel=null;UI.g.fitNext=true;if(t.value==='__map'){G.tool='select';G.from=null}render()}else if(k==='gaps'){UI.g.gaps=t.checked;drawGraph()}return}
 if(t.dataset.ind){UI.ind.proceso=t.value;render();return}
 if(t.dataset.ex){UI.ex.sel[t.dataset.ex]=t.checked;if(typeof exSync==='function')exSync();return}
 if(t.name==='exfmt'){UI.ex.fmt=t.value;return}
 if(t.id==='importFile'&&t.files&&t.files[0]){
  const f=t.files[0];const rd=new FileReader();
  rd.onload=async()=>{
   try{const d=JSON.parse(rd.result);if(!d||!d.v||!Array.isArray(d.actividades))throw new Error('formato');
    const ok=await confirmBox('Importar copia',`<p>Se reemplazarán los datos actuales por los de <b>${esc(f.name)}</b> (${d.actividades.length} actividades, ${(d.actores||[]).length} actores).</p>`,'Importar',false);
    if(ok){DB=Object.assign(emptyDB(),d);save();render();toast('Copia importada')}
   }catch(err){toast('El archivo no es una copia válida de BERCONT')}
   t.value='';
  };
  rd.readAsText(f);
 }
}

