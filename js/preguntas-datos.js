'use strict';
/* ============ Preguntas mejoradas: contenido de la revisión del 7 de noviembre de 2026 ============
   Cada pregunta tiene un id fijo para que las respuestas guardadas no se mezclen si se edita la lista.
   Tipos: error = error de flujo, dato = dato faltante, contra = contradicción entre fuentes. */
const PREG_FECHA='7 de noviembre de 2026';
const PREG_TIPOS={error:['rework','Error de flujo'],dato:['wait','Dato faltante'],contra:['xfer','Contradicción']};

/* Cobertura estimada del recorrido del lead, etapa por etapa (estimación cualitativa, no la calcula la app) */
const PREG_ETAPAS=[
 ['Llegada (canales)',85,'Las solicitudes que llegan directo a John o César están sueltas (ACT-041). Falta el papel de la agencia.'],
 ['Calificación y registro (Marketing)',60,'Error 2: los leads que atiende Natalia no quedan registrados y no tienen salida. Falta qué pasa con los no urgentes.'],
 ['Asignación a Comercial y Preventa',45,'Error 3: preventa recibe el lead dos veces. No se sabe con qué criterio se asigna. El jefe comercial no fue entrevistado.'],
 ['Requerimiento y diseño (Preventa)',85,'Bien levantado.'],
 ['Cotización y aprobación de la oferta',70,'Error 1: una oferta privada ajustada termina en SECOP. No se sabe cuándo se le pide aporte a Proyectos.'],
 ['Licitaciones',80,'Faltan la búsqueda activa, la rama «no participar» y el aviso de ganado o perdido.'],
 ['Negociación y cierre (ganado / perdido)',25,'Hay una sola actividad (ACT-023). No existe el camino de propuesta perdida. Falta la firma del contrato, su revisión jurídica y quién marca la oportunidad como ganada.'],
 ['Entrega a Proyectos',70,'Bien descrita como problema. Falta el procedimiento que escribió Alfonso.'],
 ['Compras, implementación y operación',75,'La compra de equipos (ACT-045) no tiene actor ni se conecta con Compras. No queda claro quién instala los proyectos de audio y video.'],
 ['Facturación al cliente y cobro',15,'Solo hay una actividad en borrador y sin actor (ACT-044). La cartera no está levantada.']
];
const PREG_NOTAS=[
 ['Ninguna actividad está validada.','Las 78 están en «Por validar» o «Borrador». Nadie de Bercont ha confirmado todavía que así trabajan.'],
 ['No hay un dato que siga al lead de punta a punta.','Entre los datos para el ERP falta un identificador de oportunidad que una el lead con la propuesta, el contrato, el proyecto y la factura.']
];

/* Pasos para terminar el levantamiento */
const PREG_PASOS=[
 ['Agendar las entrevistas que faltan','Un comercial de omnicanalidad o contact center, un comercial de audio y video, John y César, y Katherine Núñez. Son las fichas marcadas «Sin entrevistar».'],
 ['Agendar validaciones cortas','Natalia, Preventa, Jairo, Alfonso, Compras y Francy. Bastan 20 a 30 minutos con cada uno para sus preguntas.'],
 ['Enviar las preguntas antes de cada reunión','Usa «Copiar preguntas» en la ficha de cada persona y pégalas en el correo o el chat de la invitación.'],
 ['Durante la reunión, anotar las respuestas aquí','Marca cada pregunta hecha y escribe la respuesta en su casilla. Se guarda en este navegador y viaja en la copia de seguridad.'],
 ['Registrar cada entrevista nueva en Mapear proceso','En la pestaña Entrevistas crea ENT-007 en adelante, y luego las actividades nuevas: negociación, cierre ganado o perdido, contrato, facturación y cobro.'],
 ['Corregir el mapa con las respuestas','Los 3 errores de flujo, las actividades sueltas y los puntos de «Se corrigen sin preguntar», que ya se pueden hacer hoy.'],
 ['Tomar las decisiones del equipo','Dónde guardar los requisitos del ERP, si Calidad es un área propia y el identificador de oportunidad.'],
 ['Validar con cada dueño de proceso','Recorre su proceso en Vista gráfica con él o ella y marca sus actividades como «Validado». Sin este paso no se llega al 99 %.'],
 ['Revisar el recorrido completo','En Vista gráfica sigue el lead desde «Recibir lead» hasta el pago recibido sin cortes. En Inicio, el panel «Lo que falta levantar o validar» debería quedar casi vacío.'],
 ['Descargar la copia final','En Exportar / integración descarga la copia de seguridad y el archivo de entrega.']
];

/* Preguntas por persona */
const PREG_PERSONAS=[
 {id:'comerciales',nombre:'Un comercial de cada línea',rol:'Omnicanalidad o contact center (Henry Roa) · Audio y video (Anuar Fayad, Wilman o Diana)',estado:'Sin entrevistar',nuevo:true,
  porque:'Es el vacío más grande del recorrido. El comercial es dueño del lead desde la asignación hasta el cierre (etapas 3 y 7) y ninguno ha sido entrevistado. Conviene una entrevista aparte con cada línea, porque trabajan distinto.',
  q:[
   ['com-01','¿Cómo te llega un lead u oportunidad nueva: por Natalia, por el jefe comercial o por preventa? ¿Por qué medio?','error','Error 3 · ACT-005, ACT-006'],
   ['com-02','Cuando te asignan la cuenta, ¿qué haces primero? ¿Llamas tú al cliente o lo llama preventa?','dato','Etapa 3 · ACT-006, ACT-015'],
   ['com-03','¿Qué información subes a Sinergy (u Odoo), en qué momento y con qué usuario?','dato','ACT-007'],
   ['com-04','Cuando preventa te entrega la propuesta, ¿la revisa alguien más antes de enviarla? ¿Por qué medio se la envías al cliente?','error','Error 1 · ACT-023'],
   ['com-05','Después de enviar la propuesta, ¿cómo haces el seguimiento: cada cuánto y por qué medio? ¿Cuánto tarda normalmente un cliente en decidir?','dato','Etapa 7 · ACT-023, IND-004'],
   ['com-06','¿Cómo se negocian el precio y las condiciones con el cliente? ¿Quién autoriza un descuento?','dato','Etapa 7 (sin actividad)'],
   ['com-07','Cuando el cliente acepta, ¿qué pasa? ¿Envía una orden de compra o se firma un contrato? ¿Quién lo revisa jurídicamente y quién lo firma por Bercont?','dato','Etapa 7 · ACT-044 (lo que reporta Francy)'],
   ['com-08','Cuando el cliente no acepta, ¿qué registras, dónde y a quién le avisas? ¿Se guarda el motivo de la pérdida?','dato','Etapa 7 (falta el camino de propuesta perdida)'],
   ['com-09','Cuando se gana, ¿cómo le entregas el proyecto a Proyectos y Operaciones y qué documentos le pasas?','dato','ACT-027, ACT-028'],
   ['com-10','¿Cuándo le haces un requerimiento de compra a Lizeth y con qué información?','dato','ACT-068'],
   ['com-11','¿Participas en la facturación al cliente o en el cobro? ¿Te avisan cuando un cliente no paga?','dato','Etapa 10 · ACT-044'],
   ['com-12','¿Usan algún número o código para identificar cada oportunidad desde el lead hasta la factura?','dato','Trazabilidad · Datos para ERP']
  ]},
 {id:'jefe-comercial',nombre:'John y César',rol:'Jefatura / gerencia comercial',estado:'Sin entrevistar',nuevo:true,
  porque:'Deciden los números de las ofertas, asignan las cuentas y pasan los proyectos ganados. Aparecen en casi todos los hallazgos y nadie los ha entrevistado.',
  q:[
   ['jef-01','¿Ustedes revisan los números de las ofertas privadas antes de que el comercial las envíe al cliente, o solo los de las licitaciones?','error','Error 1 · ACT-022, enlace 21→23'],
   ['jef-02','Si un cliente pide un cambio en una oferta privada, ¿la oferta ajustada vuelve a revisión con ustedes? ¿Quién la envía de nuevo al cliente?','error','Error 1 · ACT-025, enlace 25→22'],
   ['jef-03','Cuando llega un lead, ¿ustedes asignan el comercial antes de que preventa lo reciba, o Marketing se lo pasa directo al preventa de la línea? ¿Con qué criterio y por qué medio asignan?','error','Error 3 · ACT-006, ACT-015'],
   ['jef-04','Cuando un contacto suyo les pide una cotización directamente, ¿qué hacen con ella? ¿La pasan a preventa, la registran en Sinergy o la manejan ustedes?','dato','ACT-041 (actividad suelta)'],
   ['jef-05','En el Comité del martes, ¿quién toma la decisión de participar en una licitación? ¿Qué pasa con el proceso cuando se decide no participar?','dato','ACT-059 (falta la rama «no»)'],
   ['jef-06','¿Quién decide ir en unión temporal o consorcio, y en qué momento debería quedar definido?','dato','ACT-061'],
   ['jef-07','Cuando se gana una propuesta o una licitación, ¿quién le avisa a Proyectos y Operaciones y qué documentos le entrega?','dato','Enlaces 23→27 y 43→27'],
   ['jef-08','César: ¿es usted también quien firma las órdenes de compra y revisa el estado de cuenta semanal?','contra','Actor AGT-014 (ENT-002 frente a ENT-005)']
  ]},
 {id:'natalia',nombre:'Natalia Pardo',rol:'Marketing',estado:'Entrevistada · ENT-001',
  porque:'Resuelve cómo se registran y reparten los leads, que hoy tiene un camino sin salida.',
  q:[
   ['nat-01','¿Registras en el Excel todos los leads, incluidos los que atiendes tú directamente con precios? ¿Lo haces cuando llegan o después de decidir quién los atiende?','error','Error 2 · ACT-004, enlaces 3→4 y 3→40'],
   ['nat-02','Cuando atiendes tú el lead con los precios que tienes, ¿qué le entregas al cliente y qué pasa después? ¿Lo cierras tú, lo pasas a un comercial o lo subes a Sinergy?','error','Error 2 · ACT-040 (sin salida)'],
   ['nat-03','Los leads no urgentes que dejas para más tarde, ¿dónde quedan anotados y cuándo los retomas?','dato','Error 2 · ACT-003'],
   ['nat-04','Cuando entregas un lead, ¿se lo pasas al preventa de la línea, al jefe comercial o a los dos? ¿Cómo eliges a la persona concreta?','error','Error 3 · enlaces 5→6 y 5→15 (pregunta 7 sin respuesta)'],
   ['nat-05','Jairo dice que te envía licitaciones de audio y video. ¿Qué haces con esos correos?','dato','ENT-006 [22:29] · ACT-058']
  ]},
 {id:'preventa',nombre:'Julián Guerrero y Juan Carlos Montejo',rol:'Ingenieros de preventa',estado:'Entrevistados · ENT-002',
  porque:'Confirman el lado de preventa de los errores 1 y 3.',
  q:[
   ['pre-01','En una oferta privada, ¿haces la reunión de revisión de números con el jefe comercial antes de entregarle la propuesta al comercial?','error','Error 1 · enlace 21→23'],
   ['pre-02','Cuando el cliente pide un cambio, ¿te llega directo del cliente o por el comercial? Y la oferta ajustada, ¿a quién se la entregas?','error','Error 1 · ACT-025'],
   ['pre-03','¿Quién te avisa primero de un lead nuevo, Natalia o el jefe comercial? ¿Te puede llegar por los dos lados al mismo tiempo?','error','Error 3 · ACT-015 (dos entradas)'],
   ['pre-04','Cuando la plataforma «que se está montando en la oficina» esté lista, ¿qué parte de tu trabajo vas a hacer ahí? ¿Es Odoo?','dato','ENT-002 [4:16] · sistemas']
  ]},
 {id:'jairo',nombre:'Jairo Pérez',rol:'Coordinador de Calidad y Licitaciones',estado:'Entrevistado · ENT-006',
  porque:'Completa el proceso de licitaciones: lo que pasa antes de filtrar y después de presentar.',
  q:[
   ['jai-01','Cuando envías un proceso a las áreas, ¿adjuntas el informe de viabilidad hecho con IA o solo el correo con monto, fechas y enlace?','dato','ACT-058, enlace 58→16'],
   ['jai-02','¿Quiénes reciben los procesos de cada línea? Confirmar si «William» es Wilman y quién es la Valeria que nombras en audio y video.','contra','ENT-006 [22:29] · actores'],
   ['jai-03','Además de las alertas del buscador, ¿cómo buscas tú procesos por tu cuenta? ¿Dónde, cada cuánto y siguen el mismo camino?','dato','Falta el segundo mecanismo · ETP-010'],
   ['jai-04','Cuando el Comité del martes decide no participar, ¿qué haces con el proceso? ¿Queda registrado en la matriz?','dato','ACT-059, ACT-063'],
   ['jai-05','Si el retraso real es decidir ir solos o en unión temporal, ¿quién debería tomar esa decisión y en qué momento?','contra','ACT-061 (hoy dice «recolectar documentos»)'],
   ['jai-06','Cuando la entidad adjudica, ¿a quién le avisas si se ganó? Y si se perdió, ¿qué registras y a quién le informas?','dato','ACT-043, enlace 43→27']
  ]},
 {id:'alfonso',nombre:'Alfonso Tarquino',rol:'Gerente de Proyectos y Operaciones',estado:'Entrevistado · ENT-003',
  porque:'Conecta Proyectos con Compras y con Facturación, dos uniones que hoy no existen en el diagrama.',
  q:[
   ['alf-01','Cuando un proyecto necesita equipos, ¿quién hace el requerimiento de compra y quién lo aprueba? ¿Pasa por Lizeth en Compras o lo maneja tu equipo?','dato','ACT-045 (sin actor)'],
   ['alf-02','La facturación mensual que negocias con el cliente, ¿a quién se la envías en el área financiera y con qué información?','dato','ACT-037 sin conexión con ACT-044'],
   ['alf-03','¿Nos puedes compartir el procedimiento de entrega Comercial → Proyectos que escribiste?','dato','ACT-027, ACT-028'],
   ['alf-04','Cuando no hay que comprar equipos, ¿se pasa directo a la implementación después del kickoff interno?','dato','Enlace 30→31']
  ]},
 {id:'compras',nombre:'Lizeth, Angélica y César',rol:'Compras, análisis financiero y aprobación',estado:'Entrevistados · ENT-005',
  porque:'Hay una contradicción en el orden de la aprobación de compras.',
  q:[
   ['cmp-01','¿La orden de compra se envía al proveedor antes o después de que César la firme? En el flujo descrito se firma después, pero el requisito para el ERP pide aprobar antes.','contra','ACT-070, ACT-073'],
   ['cmp-02','¿Las compras de equipos para los proyectos de Alfonso pasan por este mismo flujo? ¿Quién les hace el requerimiento en ese caso?','dato','ACT-045 ↔ ACT-068'],
   ['cmp-03','¿Quién ejecuta el pago al proveedor y cómo se registra que ya se pagó?','dato','ACT-075']
  ]},
 {id:'katherine',nombre:'Katherine Núñez',rol:'Contadora',estado:'Sin entrevistar',nuevo:true,
  porque:'La facturación a clientes y el cobro de cartera siguen sin levantar: la entrevista de compras respondió esa parte con el flujo de proveedores.',
  q:[
   ['kat-01','¿Quién emite las facturas a los clientes, con qué información y de quién la recibe (Comercial, Alfonso, otra persona)?','dato','ACT-044, ACT-037'],
   ['kat-02','¿Qué documentos del contrato suelen faltar cuando se va a facturar, y quién los consigue?','dato','ACT-044'],
   ['kat-03','¿Cómo se hace el seguimiento de la cartera y qué pasa cuando un cliente se atrasa en el pago?','dato','PRO-007 (cartera sin levantar)']
  ]},
 {id:'francy',nombre:'Francy Cucunubá',rol:'Directora Administrativa',estado:'Entrevistada · ENT-004',
  porque:'Completa la parte de SST y el retraso en la facturación que ella describió.',
  q:[
   ['fra-01','¿Por qué medio envías los recordatorios de SST y cada cuánto? ¿Cuándo decides pedir apoyo a la gerencia?','dato','ACT-048, ACT-049'],
   ['fra-02','Cuando la facturación se retrasa porque falta algo del contrato, ¿quién te avisa y qué es lo que suele faltar?','dato','ACT-044']
  ]}
];

/* Lo que ya responden las entrevistas: se corrige sin preguntar */
const PREG_SIN_PREGUNTAR=[
 ['Jairo envía los procesos a las áreas por correo.','ENT-006 [22:13] · ACT-058, enlace 58→16'],
 ['La licitación entra a la matriz de control cuando se decide trabajarla, y se oculta (no se borra) cuando se resuelve.','ENT-006 [27:50], [29:56] · ACT-063'],
 ['Quien descarta la licitación es Jairo, después de que el área le responde por correo.','ENT-006 [23:09–23:27] · ACT-042'],
 ['Los datos incompletos del lead son un problema real, no un ejemplo de la plantilla: falta el teléfono o el correo está mal escrito.','ENT-001 pregunta 4 · ACT-001'],
 ['Min Salud lleva 2 años en operación, no 10.','ENT-003 [37:01] · ACT-034'],
 ['Faltan problemas que Alfonso sí describió: lee los correos con hasta 3 días de atraso (300 al día), exige citar reuniones con 24 horas de anticipación y tiene respaldos organizados en su equipo.','ENT-003 [53:35], [51:29], [57:45]'],
 ['Reenviar recordatorios de SST es trabajo manual: marcar «¿Manual?» como Sí.','ENT-004 · ACT-048']
];

/* Decisiones del equipo de levantamiento (no dependen de una entrevista) */
const PREG_DECISIONES=[
 'Dónde guardar los requisitos funcionales del ERP: Compras, Marketing, Francy, Jairo y Alfonso los mencionan, pero la app no tiene una sección para ellos.',
 'Si las actividades del Sistema de Gestión de Calidad deben ir en un área «Calidad» propia, para no inflar los números de Comercial.',
 'Poner etiqueta a la compuerta del enlace 30→31, por ejemplo «Sin compra de equipos».',
 'Agregar a «Datos para ERP» un identificador de oportunidad que una el lead, la propuesta, el contrato, el proyecto y la factura.'
];
