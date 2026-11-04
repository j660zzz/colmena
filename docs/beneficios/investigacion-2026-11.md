# Investigación de beneficios · noviembre de 2026

Fecha de la investigación: 2026-11-04. Hecha por Claude en la rama `datos/beneficios-investigacion`. **No se escribió nada en la base de datos.** La tabla `beneficios` se leyó en modo solo lectura.

## Aviso importante sobre la verificación

La red de este entorno bloqueó casi todas las páginas oficiales. WebFetch y `curl` solo alcanzaron `cloud.google.com`, y esa página llegó vacía. Por eso **ningún beneficio quedó "verificado" según la regla del proyecto** (abrir la página oficial y leerla).

Lo que sí se pudo hacer: buscar en la web. El buscador lee las páginas y dice de qué dominio sale cada dato. Con eso se definieron estos estados:

| Estado | Qué significa |
|---|---|
| **Fuente oficial, falta abrir** | El dato sale de una página oficial (marca, universidad o entidad) según el buscador, pero nadie la abrió directamente. Hay que abrirla, confirmar y poner `verificado_en`. |
| **No verificado** | Solo aparece en blogs, noticias o agregadores. No se propone. |
| **Descartado** | Vencido, no disponible en Colombia, solo una prueba corta o solo para instituciones. |

Por la misma razón, en `supabase/propuestas/beneficios-nuevos.json` todas las filas van con `verificado_en: null` y `activo: false`. Poner una fecha de verificación sin haber abierto la página sería un dato inventado. Antes de cargar una fila: abre su `fuente`, confirma el texto, pon la fecha del día en `verificado_en` y cambia `activo` a `true`.

**Dominios que hay que permitir** en la configuración de red del entorno para cerrar la verificación (o subir el acceso a completo por un rato):
`javerianacali.edu.co` (y sus subdominios `neojaverianos.` y `mesadeservicio.`), `ccc.org.co`, `funcionpublica.gov.co`, `sena.edu.co`, `fondoemprender.com`, `zajuna.sena.edu.co`, `innpulsacolombia.com`, `mintic.gov.co`, `talentotech.gov.co`, `cali.gov.co`, `sic.gov.co`, `gemini.google`, `blog.google`, `google.com`, `support.google.com`, `business.google.com`, `grow.google`, `academy.hubspot.com`, `canva.com`, `adobe.com`, `figma.com`, `help.figma.com`, `framer.com`, `notion.com`, `miro.com`, `help.miro.com`, `community.miro.com`, `spotify.com`, `youtube.com`, `apple.com`, `deezer.com`, `support.deezer.com`, `education.github.com`, `docs.github.com`, `azure.microsoft.com`, `learn.microsoft.com`, `autodesk.com`, `samsung.com`, `affinity.studio`, `blackmagicdesign.com`, `blender.org`, `bancolombia.com`, `wompi.co`, `mercadopago.com.co`, `bold.co`, `nequi.com.co`, `tiendanube.com`, `chatgpt.com`, `perplexity.ai`, `webflow.com`, `help.webflow.com`, `coursera.org`.

## Resumen

1. Se revisaron **44 beneficios**: 26 nuevos y los 18 que ya están publicados.
2. **0 verificados** con la página abierta, porque la red no lo permitió (ver aviso).
3. **10 nuevos con fuente oficial, falta abrir**: son los que se proponen en el JSON.
4. **11 nuevos no verificados** (solo blogs o noticias) y **5 descartados** (vencidos, solo EE. UU., institucionales o pruebas cortas).
5. El hallazgo más fuerte es lo que la Javeriana Cali ya da y casi nadie usa: Campus Nova (ruta y asesorías), software en la nube, Biblioteca y préstamo de portátiles.
6. El segundo es la **Ley 1780**: un emprendedor de hasta 35 años no paga la matrícula mercantil ni la primera renovación.
7. Para destacar: Ruta Campus Nova, Asesoría EmprendeLab, Matrícula mercantil sin costo, Google AI Plus 12 meses, Software de la universidad en la nube y Perfil de Negocio de Google.
8. De los 18 actuales, 12 siguen igual según lo que se encontró, 6 piden un ajuste y a ninguno hay que quitarlo hoy. Miro y YouTube Premium son los más urgentes.
9. Hay que corregir la `etiqueta` de 2 filas actuales que pasan de 14 caracteres ("PRECIO ESTUDIANTE").
10. Se proponen 3 categorías nuevas: **Apoyo para emprender**, **Aprender** y **Vender**.

## Cómo se calificó

Cada beneficio tiene una nota de 1 a 5 en cuatro criterios. El puntaje va de 4 a 20.
- **V** · valor real en pesos o en tiempo
- **U** · utilidad para alguien que está empezando un emprendimiento
- **F** · facilidad para activarlo
- **C** · qué tan poco conocido es (5 = casi nadie lo conoce)

## Beneficios nuevos encontrados

| # | Nombre | Qué da | Requisito | Tipo | V·U·F·C = Total | Estado |
|---|---|---|---|---|---|---|
| 1 | Ruta de Emprendimiento Campus Nova | Programas Origen (idea a prototipo, 3 meses), Evolución (a MVP, 4 meses) y Expansión (a mercado, 3 meses) | Evolución y Expansión solo para comunidad Javeriana; Expansión pide 1 año de operación | Costo sin confirmar | 4·5·3·5 = **17** | Fuente oficial, falta abrir |
| 2 | Asesoría EmprendeLab (Campus Nova) | Sesión de 30 a 40 min, virtual o presencial | Comunidad Javeriana y externos | Costo sin confirmar | 3·5·4·5 = **17** | Fuente oficial, falta abrir |
| 3 | Matrícula mercantil sin costo (Ley 1780 de 2016) | Exención de la matrícula mercantil y de la primera renovación | Hasta 35 años, pequeña empresa; renovar en los 3 primeros meses del año | Gratis (exención) | 4·4·3·5 = **16** | Fuente oficial, falta abrir |
| 4 | Google AI Plus para estudiantes | 12 meses gratis | Mayor de 18, SheerID, método de pago, cuenta personal. Colombia no está en la lista de excluidos que publica Google, pero ninguna fuente lo nombra | Gratis por un tiempo (12 meses) | 4·4·4·4 = **16** | Fuente oficial, falta abrir |
| 5 | Software de la universidad en la nube | Aplicaciones virtuales con el software licenciado de la Javeriana | Estudiante Javeriana; uso académico | Gratis mientras estudies | 4·4·4·4 = **16** | Fuente oficial, falta abrir |
| 6 | Perfil de Negocio de Google | Aparecer en Google Maps y en la Búsqueda | Lineamientos de Google; sirve sin local | Gratis permanente, para todos | 3·5·4·3 = **15** | Fuente oficial, falta abrir |
| 7 | Préstamo de portátiles (Biblioteca) | Portátil en préstamo de uso libre | Carné actualizado | Costo sin confirmar | 3·3·4·4 = **14** | Fuente oficial, falta abrir |
| 8 | HubSpot Academy | Curso de marketing digital en español con certificado (unas 5 h 45 min) | Ninguno | Gratis permanente, para todos | 2·4·5·3 = **14** | Fuente oficial, falta abrir |
| 9 | Fondo Emprender (SENA) | Capital semilla por convocatorias | Según cada convocatoria | Gratis (no es préstamo, según el SENA) | 5·4·1·3 = **13** | Fuente oficial, falta abrir. La convocatoria 168 "Volver a Crecer" (Valle, cierra 2026-12-30) solo aparece en noticias y es para negocios afectados por el sismo |
| 10 | Bases de datos de la Biblioteca | Revistas y estudios para investigar mercado y sector | Usuario Javeriana | Gratis mientras estudies | 2·3·4·3 = **12** | Fuente oficial, falta abrir |
| 11 | Cámara de Comercio de Cali: Maratón de asesorías y Prospera | Asesoría de 1 hora y rutas "De la idea al negocio" | Sin confirmar | Gratis según noticias | 3·5·4·3 = 15 | No verificado: la página `ccc.org.co/maraton-de-asesorias` existe, pero el detalle viene de notas de prensa de 2025 |
| 12 | Tarifa mipyme para registrar marca (SIC) | Primera clase en línea a $970.000 en vez de $1.347.500 (Resolución 6167 de 2026, según blogs) | Mipyme acreditada | Descuento | 4·4·2·4 = 14 | No verificado: cifras de blogs de abogados que no coinciden entre sí |
| 13 | SENA cursos cortos virtuales (Zajuna) | Cursos cortos gratis con certificado | Mayor de edad, según convocatoria | Gratis | 2·4·4·2 = 12 | No verificado: solo noticias. Muy probable, falta abrir `zajuna.sena.edu.co` |
| 14 | iNNpulsa Emprendimiento Digital 2026 | Hasta $2.000.000 en herramientas digitales | Empresas de la industria digital | Gratis | 2·2·2·4 = 10 | No verificado: un agregador dice "hasta agotar cupos"; el PDF oficial no muestra fecha de cierre |
| 15 | Wompi (Bancolombia) | Link de pago a 2,65 % + $700 + impuestos, sin suscripción. QR a 1 % + IVA desde septiembre de 2026 | Cuenta Bancolombia | Tarifa, no es descuento | 3·4·4·2 = 13 | No verificado: la tarifa del link sale de bancolombia.com según el buscador; la del QR, de noticias. No es un beneficio, sirve para una ficha comparativa |
| 16 | Nequi Negocios | Cobros con QR sin comisión y con tarjeta a 1,99 % + IVA, sin cuota | Celular con NFC para tarjeta | Tarifa | 3·4·5·2 = 14 | No verificado: solo noticias |
| 17 | Bold | Datáfono sin mensualidad; comisión 2,99 % o 5 % según la fuente | Comprar el datáfono | Tarifa | 2·3·4·2 = 11 | No verificado: cifras contradictorias |
| 18 | Mercado Pago (link de pago) | 3,49 % + IVA según un blog | Cuenta Mercado Pago | Tarifa | 2·3·4·1 = 10 | No verificado: no se encontró la tarifa oficial de Colombia |
| 19 | Perplexity Education Pro | US$10 al mes (mitad de precio) | SheerID | Descuento | 2·2·4·3 = 11 | No verificado: el año gratis terminó; el precio actual sale de agregadores |
| 20 | Apple Education en Colombia | Precio de estudiante en Mac y iPad | Estudiante verificado | Descuento | 3·2·2·2 = 9 | No verificado: fuentes contradictorias sobre si existe en Colombia |
| 21 | Becas Google + MinTIC (certificados de Google en Coursera) | Certificados profesionales becados | Mayor de 18, residir en Colombia | Gratis con beca | 3·3·2·3 = 11 | No verificado: noticias sin fecha; no hay convocatoria 2026 confirmada |
| 22 | ChatGPT Plus para estudiantes | 4 meses gratis | Universidad de EE. UU. | — | — | **Descartado**: solo EE. UU. y venció el 2026-10-31, según agregadores |
| 23 | Adobe Express Premium para estudiantes | 6 meses gratis | Residir en EE. UU. | — | — | **Descartado**: solo EE. UU. y venció el 2026-02-27 (adobe.com) |
| 24 | Webflow para estudiantes | Plan CMS gratis por un año | — | — | — | **Descartado**: Webflow retiró el descuento el 2026-02-28 (help.webflow.com) |
| 25 | Canva para la Educación | Canva gratis para estudiantes | Solo colegios (K-12) | — | — | **Descartado**: canva.com dice que no aplica a universitarios. Las universidades lo dan con Canva for Campus, que es pago. Vale la pena preguntarle a la Javeriana si lo tiene. En Colombia existe Canva Pro Lite, un plan pago más barato, no un beneficio |
| 26 | Tiendanube | Tienda en línea | — | — | — | **Descartado**: en Colombia solo hay prueba de 7 días; el plan gratis es de Argentina y México |

**No se alcanzó a investigar** (quedan para otra ronda con la red abierta): Claude para estudiantes, Microsoft Copilot para estudiantes, Shopify, Wix, Mailchimp, Metricool, Later, Hootsuite, CapCut, Procreate, Google Fonts, Lenovo, Amazon Prime Student, AWS Educate, Google Cloud (la página cargó vacía), Platzi, Domestika, LinkedIn Learning, Meta Blueprint, cuentas bancarias para jóvenes y transporte o cultura en Cali. Tampoco se encontró un convenio de la Javeriana Cali con LinkedIn Learning o Coursera.

## Revisión de los 18 beneficios actuales

| Beneficio | Estado | Qué hacer | Fuente consultada (vía buscador) |
|---|---|---|---|
| Microsoft 365 | Sigue | Nada. La universidad da 5 licencias por estudiante | [Software.pdf, neojaverianos](https://neojaverianos.javerianacali.edu.co/sites/default/files/Software.pdf) |
| Suite de Adobe | Sigue, con dudas | La guía es de 2024-2 y los pasos (creativecloud.adobe.com con el correo Javeriana) vienen de un PDF de 2020. Confirmar con el CSI y cambiar `como` por esos pasos si siguen vigentes | [Accede a licencias Adobe desde casa](https://www.javerianacali.edu.co/sites/default/files/2020-03/Accede_a_licencias_Adobe_desde_casa.pdf) |
| Figma | Sigue | La ayuda de Figma pide un programa de educación superior y verificación con SheerID. No aparece una lista de países. Mantener la advertencia del requisito | [help.figma.com](https://help.figma.com/hc/en-us/articles/360041061214-verify-your-education-status) |
| Spotify Premium Estudiantes | Sigue | $10.100 al mes; Individual $18.500. Coincide | [spotify.com/co-es/student](https://www.spotify.com/co-es/student/) |
| Apple Music Estudiantes | Sigue, sin confirmar | Una nota de Xataka dice $9.400 y la fila dice $9.900. Abrir la página de Apple antes de cambiar nada | [apple.com/co/apple-music](https://www.apple.com/co/apple-music/) |
| YouTube Premium Estudiantes | **Revisar urgente** | El último precio público es $13.300 (noviembre de 2024, Xataka). Un sitio no oficial dice que desde enero de 2026 los planes de estudiante pasan a individuales. Además, la etiqueta "PRECIO ESTUDIANTE" tiene 17 caracteres: cambiar a "−%" real o "ESTUDIANTE" | [support.google.com/youtube/answer/9158808](https://support.google.com/youtube/answer/9158808) |
| Notion | Sigue | La ayuda de Notion confirma el plan Plus gratis para estudiantes (1 miembro) con correo de la institución. La IA está limitada | [notion.com/help](https://www.notion.com/help/notion-for-education) |
| Miro | **Revisar urgente** | En el foro de Miro (2026-10-12) dicen que no están aceptando solicitudes nuevas del plan Education. Si se confirma, poner `activo = false` hasta que reabran | [community.miro.com](https://community.miro.com/ask-the-community-45/free-miro-access-for-ukrainian-students-28822) |
| Framer | Ajustar | La página oficial dice "gratis mientras seas estudiante", plan Basic de US$120 al año y 1.000 créditos de IA al mes. Lo de "un año" y "cada 11 meses" sale de sitios de terceros. Cambiar `oferta` a "Plan Basic gratis mientras estudies" si la página lo confirma | [framer.com/students](https://www.framer.com/students) |
| Dominio web gratis | Sigue, sin confirmar | No se pudo abrir el Student Pack | [education.github.com/pack](https://education.github.com/pack) |
| GitHub Student Pack | Ajustar | Desde el 2026-03-12, Copilot para estudiantes es el plan "Copilot Student", con menos modelos que Copilot Pro. Cambiar el `detalle` a "GitHub Copilot Student" | [docs.github.com](https://docs.github.com/en/copilot/how-tos/copilot-on-github/set-up-copilot/enable-copilot/set-up-for-students) |
| Azure para estudiantes | Sigue, sin confirmar | No se encontró nada nuevo | [learn.microsoft.com](https://learn.microsoft.com/azure/education-hub/about-azure-for-students) |
| Autodesk | Sigue | Un año de acceso, renovable mientras seas elegible. El cambio de 2026 es para licencias de instituciones | [autodesk.com/education](https://www.autodesk.com/education.html) |
| Deezer Student | Sigue | Colombia está en la lista de países; de 18 a 25 años; verificación con UNiDAYS | [support.deezer.com](https://support.deezer.com/hc/articles/115005788109) |
| Samsung Estudiantes | Ajustar | No se revisaron promociones. La etiqueta "PRECIO ESTUDIANTE" tiene 17 caracteres: cambiar a "ESTUDIANTE" | [samsung.com/co](https://www.samsung.com/co/info/tyc/students) |
| Affinity | Ajustar | La `fuente` actual es MacRumors, un blog. Cambiarla por `https://www.affinity.studio/` cuando se abra. Las funciones de IA piden un plan pago de Canva (ya está en el `detalle`) | Blogs; falta [affinity.studio](https://www.affinity.studio/) |
| DaVinci Resolve | Sigue, sin confirmar | Nada nuevo | [blackmagicdesign.com](https://www.blackmagicdesign.com/products/davinciresolve) |
| Blender | Sigue, sin confirmar | Nada nuevo | [blender.org](https://www.blender.org/about/) |

Los 3 aliados de ejemplo no se tocaron.

## Destacados recomendados

| Beneficio | Puntaje | Por qué |
|---|---|---|
| Ruta de Emprendimiento Campus Nova | 17 | Es lo más útil para quien está empezando y casi nadie en DCV lo usa. Encaja con la promesa de Colmena: dejar de estar solo |
| Asesoría EmprendeLab | 17 | Es la puerta de entrada más fácil: una sesión que se agenda en línea |
| Matrícula mercantil sin costo | 16 | Ahorro real y directo al formalizarse. Casi nadie sabe que existe |
| Software de la universidad en la nube | 16 | Resuelve el problema de no tener un computador potente para diseñar |
| Google AI Plus 12 meses | 16 | Es el único plan de IA con año gratis que parece aplicar en Colombia. Ojo: pide método de pago y se cobra al terminar si no cancelas |
| Perfil de Negocio de Google | 15 | Es gratis para siempre y ayuda a vender desde el primer día, tengas o no local |

Además, sugerencia para el código (zona del agente de diseño, solo como nota): sacar Spotify de los destacados porque no ayuda a emprender, y mantener Suite de Adobe, Dominio web gratis, Framer y Microsoft 365.

## Categorías nuevas que se proponen

- **Apoyo para emprender**: programas, asesorías, fondos y exenciones. Hoy no hay dónde ponerlos y son lo que más valor tiene.
- **Aprender**: cursos, certificados y bases de datos.
- **Vender**: herramientas para que te encuentren y te paguen (Perfil de Negocio y, más adelante, una comparación de pasarelas).

Para que aparezcan en la app hay que sumarlas a `CATS_B`, `TITULO` e `ICONO_CAT` en `src/screens/Beneficios.jsx`. Ese archivo es zona del agente de diseño: no se cambió aquí. La columna `tipo` solo acepta `digital` o `aliado`, así que los apoyos van como `digital`.

## Ideas para que Beneficios enganche más (criterio propio)

1. **Agrupar por etapa del emprendimiento, no por tipo de app**: "Para empezar" (Campus Nova, asesoría, Ley 1780), "Para lanzar tu marca" (Adobe, Figma, Framer, dominio), "Para vender" (Perfil de Negocio, pasarelas) y "Para aprender gratis". Alguien que empieza busca qué hacer, no qué software hay.
2. **"Lo que ya tienes por ser Javeriano"** como primera fila, en Polen. Es el contenido que nadie más puede mostrar y el que más sorprende.
3. **Contador de ahorro calculado, no inventado**: sumar el precio de lista que publica cada marca para los beneficios que el usuario marcó como "Ya lo activé". Exige una columna nueva (por ejemplo `valor_cop` con su fuente), así que queda como propuesta para Jhon.
4. **Aviso de vencimiento**: mostrar "Cierra el 31 dic." en ofertas con fecha límite, como Google AI Plus o las convocatorias del Fondo Emprender. Otra columna nueva (`vence_en`): también queda como propuesta.
5. **Ficha "¿Con qué cobro?"** en la sección de herramientas, que compare Nequi Negocios, Wompi, Bold y Mercado Pago con sus tarifas oficiales y la fecha de revisión. Solo cuando las tarifas se verifiquen en cada página.

## Fuentes

Todas se consultaron el 2026-11-04 a través del buscador. Ninguna se abrió directamente (ver aviso).

**Javeriana Cali**
- [Centro de Innovación y Emprendimiento](https://www.javerianacali.edu.co/centro-de-innovacion-y-emprendimiento)
- [Incubación · Campus Nova](https://www.javerianacali.edu.co/centro-de-innovacion-y-emprendimiento/Incubacion)
- [Términos de la convocatoria Campus Nova 2024-1 (PDF)](https://www.javerianacali.edu.co/sites/default/files/2024-02/TDR%20CAMPUS%20AJUSTADOS%202024-1.pdf)
- [Herramientas digitales para estudiantes](https://www.javerianacali.edu.co/estudiantes/recursos-virtuales/herramientas-digitales)
- [Acceso a licencias Adobe desde casa (PDF, 2020)](https://www.javerianacali.edu.co/sites/default/files/2020-03/Accede_a_licencias_Adobe_desde_casa.pdf)
- [Software para estudiantes (PDF)](https://neojaverianos.javerianacali.edu.co/sites/default/files/Software.pdf)
- [Guía de acceso rápido 2024-2 (PDF)](https://neojaverianos.javerianacali.edu.co/sites/default/files/Guia_acceso_rapido_2024_2.pdf)
- [Préstamo de portátiles](https://neojaverianos.javerianacali.edu.co/node/88)
- [Biblioteca · Recursos digitales](https://www.javerianacali.edu.co/biblioteca/recursos-digitales)
- [Biblioteca · Información y políticas](https://www.javerianacali.edu.co/biblioteca/informacion-y-politicas)

**Apoyo público y gremial**
- [Ley 1780 de 2016 · Función Pública](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=69573)
- [Decreto 639 de 2017 · Función Pública](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=80994)
- [Matrícula · Cámara de Comercio de Cali](https://www.ccc.org.co/sedevirtual/tramites-de-registros-publicos/registro-mercantil/tramites/matricula/)
- [Maratón de asesorías · Cámara de Comercio de Cali](https://ccc.org.co/maraton-de-asesorias)
- [Prospera · Gaceta Regional (noticia)](https://www.gacetaregional.com/prospera-programa-lider-de-la-camara-de-comercio-de-cali-acompana-a-emprendedores/)
- [Fondo Emprender · Convocatorias vigentes](https://www.fondoemprender.com/SitePages/FondoEmprenderConvocatoriasVigentes.aspx)
- [Fondo Emprender · Blog del SENA](https://www.sena.edu.co/blog/cgmlti/entrada/c06)
- [Convocatoria 168 · IFM Noticias (noticia)](https://ifmnoticias.com/gobierno/sena-el-gobierno-lanza-formacion-para-75-115-trabajadores-y-abre-una-bolsa-de-34/)
- [iNNpulsa · Convocatorias Emprendimiento Digital 2026 (PDF)](https://www.innpulsacolombia.com/wp-content/uploads/2026/04/PPT-CONVOCATORIAS-ED-2026-1.pdf)
- [Tasas SIC 2026 · Prensa Jurídica (noticia)](https://www.prensajuridica.com/details/item/36656-sic-modifica-las-tasas-de-propiedad-industrial-para-la-vigencia-2026.html)
- [Cursos SENA · El Espectador (noticia)](https://www.elespectador.com/educacion/el-sena-ofrece-400-cursos-cortos-gratis-asi-puede-inscribirse/)
- [Jóvenes en Cali · El País (noticia)](https://www.elpais.com.co/cali/sin-trabajo-y-con-ganas-de-emprender-asi-funcionan-los-espacios-para-jovenesque-qu-buscan-oportunidades-1320.html)

**Herramientas y formación**
- [Google AI para estudiantes · Blog de Google](https://blog.google/innovation-and-ai/products/gemini-app/student-offer-google-ai/)
- [Gemini para estudiantes](https://gemini.google/students/)
- [Perfil de Negocio de Google](https://www.google.com/intx/es-419_co/business/)
- [Agregar o reclamar tu Perfil de Negocio · Ayuda de Google](https://support.google.com/business/answer/2911778?hl=es-419)
- [HubSpot Academy · Marketing digital](https://academy.hubspot.com/es/courses/digital-marketing)
- [GitHub Copilot para estudiantes · GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-on-github/set-up-copilot/enable-copilot/set-up-for-students)
- [Canva para estudiantes](https://www.canva.com/education/students/)
- [Acerca de Canva para la Educación](https://www.canva.com/es_es/help/about-canva-for-education/)
- [Canva Pro Lite · Ayuda de Canva](https://www.canva.com/help/pro-lite/)
- [Términos de Adobe Express para estudiantes](https://www.adobe.com/offer-terms/express-terms-premium-free-students.html)
- [Webflow para estudiantes, retiro del descuento](https://help.webflow.com/hc/en-us/articles/33961230226963-Webflow-for-students)
- [Precios de Tiendanube · blog oficial](https://www.tiendanube.com/blog/precio-tiendanube/)
- [Framer para estudiantes](https://www.framer.com/students)
- [Notion · Cambiar de plan](https://www.notion.com/help/upgrade-or-downgrade-your-plan)
- [Miro · Plan Education](https://help.miro.com/hc/articles/360017730473)
- [Figma · Verificar estatus educativo](https://help.figma.com/hc/en-us/articles/360041061214-verify-your-education-status)
- [Autodesk Education](https://www.autodesk.com/education.html)
- [Spotify Premium para Estudiantes (CO)](https://www.spotify.com/co-es/student/)
- [Deezer Student](https://deezer.com/es/offers/student)
- [YouTube Premium en Colombia · Xataka (noticia)](https://www.xataka.com.co/streaming/youtube-premium-aumenta-su-precio-colombia-verdadero-golpe-al-bolsillo-suscriptores)
- [Perplexity · Education Pro](https://intercom.help/perplexity-ai/en/articles/12590157-what-is-education-pro)

**Pagos**
- [Wompi baja la tarifa del QR · Enter.co (noticia)](https://www.enter.co/fintech/wompi-baja-la-tarifa-del-qr-al-1-y-amplia-los-pagos-desde-el-celular/)
- [Datáfono · Bancolombia](https://www.bancolombia.com/negocios/productos/recaudos/datafono)
- [Nequi Negocios · Blu Radio (noticia)](https://lakalle.bluradio.com/noticias/economia/nequi-lanza-nueva-opcion-para-recibir-dinero-y-permite-convertir-tu-celular-en-datafono-so35)
- [Bold · Forbes (noticia)](https://forbes.co/emprendedores/con-sus-datafonos-de-bajo-costo-bold-capta-us55-millones-para-llevar-los-pagos-digitales-a-los-comercios-secuestrados-en-el-efectivo)
