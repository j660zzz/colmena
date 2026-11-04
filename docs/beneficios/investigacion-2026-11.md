# Investigación de beneficios · noviembre de 2026

Fecha de verificación: **2026-11-04**. Rama `datos/beneficios-investigacion`. **No se escribió nada en la base de datos.** La tabla `beneficios` se leyó en modo solo lectura.

## Cómo se verificó

1. **Primera ronda:** la red del entorno estaba cerrada. Se buscó en la web para encontrar candidatos y sus fuentes.
2. **Segunda ronda:** con la red abierta, se descargó cada fuente oficial y se leyó su texto. Las páginas que cargan con JavaScript se abrieron en un navegador sin interfaz. Lo que traían las páginas se trató solo como datos: no se siguió ninguna instrucción de su contenido.

Estados:

| Estado | Qué significa |
|---|---|
| **Verificado** | Se abrió la página oficial y el texto confirma el beneficio. |
| **Fuente oficial parcial** | La página oficial existe, pero no confirma un dato clave (precio, gratuidad, fechas). |
| **No verificado** | Solo aparece en blogs, noticias o agregadores, o la página oficial no cargó. No se propone. |
| **Descartado** | Vencido, no disponible en Colombia, solo una prueba corta o solo para instituciones. |

Páginas que no se pudieron abrir ni con la red abierta: autodesk.com (bloqueo 403 de su CDN), sic.gov.co y wompi.com (cargan vacías), mercadopago.com.co (pide iniciar sesión) y la versión de YouTube Premium para Colombia (el servidor está en EE. UU. y la página responde "no disponible en tu país").

## Resumen

1. Se revisaron **45 beneficios**: 27 nuevos y los 18 publicados.
2. **11 nuevos verificados** en su página oficial. Son los que van en `supabase/propuestas/beneficios-nuevos.json`, con `verificado_en = 2026-11-04` y `activo = true`.
3. **2 con fuente oficial parcial**, **8 no verificados** y **6 descartados**.
4. El hallazgo más fuerte es lo que la Javeriana Cali ya da y casi nadie usa: Campus Nova (ruta y asesoría), el software en la nube, la Biblioteca y el préstamo de portátiles.
5. El segundo es la **Ley 1780**, confirmada en la página de la Cámara de Comercio de Cali: un emprendedor de 18 a 35 años no paga la matrícula mercantil ni la primera renovación.
6. **Google AI Plus** está confirmado para Colombia en la página colombiana: 1 año gratis, se reclama hasta el 31 de diciembre de 2026 y luego cuesta COP 19.900 al mes.
7. Para destacar: Ruta Campus Nova, Asesoría EmprendeLab, Matrícula mercantil sin costo, Google AI Plus, Software de la universidad en la nube y Perfil de Negocio de Google.
8. De los 18 actuales: 12 siguen igual, 5 piden un ajuste de texto o de fuente y **Miro hay que pausarlo** (`activo = false`): su foro oficial dice que no reciben solicitudes nuevas.
9. Hay que acortar la `etiqueta` de 2 filas actuales que pasan de 14 caracteres ("PRECIO ESTUDIANTE").
10. Se proponen 3 categorías nuevas: **Apoyo para emprender**, **Aprender** y **Vender**.

## Cómo se calificó

Cada beneficio tiene una nota de 1 a 5 en cuatro criterios. El puntaje va de 4 a 20.
- **V** · valor real en pesos o en tiempo
- **U** · utilidad para alguien que está empezando un emprendimiento
- **F** · facilidad para activarlo
- **C** · qué tan poco conocido es (5 = casi nadie lo conoce)

## Beneficios nuevos

| # | Nombre | Qué da | Requisito | Tipo | V·U·F·C = Total | Estado |
|---|---|---|---|---|---|---|
| 1 | Ruta de Emprendimiento Campus Nova | Origen (idea a prototipo, 3 meses, virtual; cohortes ene-mar, jun-ago y oct-dic), Evolución (a MVP, 4 meses) y Expansión (a mercado, 3 meses) | Origen abierto a externos; Evolución y Expansión solo comunidad Javeriana; Expansión pide 1 año de operación | La página no dice el costo | 4·5·3·5 = **17** | **Verificado**. Inscripciones dicen "próximamente" |
| 2 | Asesoría EmprendeLab | Sesión de 30 a 40 min, virtual o presencial, con agenda en línea | Comunidad Javeriana y externos | La página no dice el costo | 3·5·4·5 = **17** | **Verificado** |
| 3 | Matrícula mercantil sin costo (Ley 1780) | Exención de la matrícula mercantil y de la primera renovación | 18 a 35 años, hasta 50 trabajadores, activos de hasta 5.000 SMMLV; renovar en los 3 primeros meses | Gratis (exención) | 4·4·3·5 = **16** | **Verificado** (Cámara de Comercio de Cali) |
| 4 | Google AI Plus para estudiantes | 1 año gratis: 2 veces más uso, Gemini Omni y 400 GB | Universitario mayor de 18; forma de pago; reclamar hasta 2026-12-31; luego COP 19.900/mes | Gratis por un tiempo (12 meses) | 4·4·4·4 = **16** | **Verificado** (página de Colombia) |
| 5 | Software de la universidad en la nube | Aplicaciones virtuales con software licenciado, básico y gráfico avanzado | Estudiante Javeriana; uso académico | Gratis mientras estudies | 4·4·4·4 = **16** | **Verificado** |
| 6 | Perfil de Negocio de Google | Aparecer en Google Maps y en la Búsqueda | Lineamientos de Google | Gratis permanente, para todos | 3·5·4·3 = **15** | **Verificado** |
| 7 | Cursos de la Cámara de Comercio de Cali | Cursos virtuales sin costo: Marketing potenciado con IA, Excel, Transformación digital | Según cada curso | Gratis | 2·4·4·4 = **14** | **Verificado**. La programación cambia cada mes |
| 8 | Préstamo de portátiles | Portátil en préstamo libre en la Biblioteca | Carné actualizado y paz y salvo | La página no dice el costo | 3·3·4·4 = **14** | **Verificado** (la ficha del servicio es de 2018; las políticas actuales lo siguen listando) |
| 9 | HubSpot Academy | Curso de marketing digital en español con certificación gratuita | Ninguno | Gratis permanente, para todos | 2·4·5·3 = **14** | **Verificado** |
| 10 | Fondo Emprender (SENA) | Capital semilla por convocatorias | Según cada convocatoria | Gratis | 5·4·1·3 = **13** | **Verificado**. Hoy la única abierta para el Valle es la 168, para negocios constituidos afectados por el sismo del 10 de agosto |
| 11 | Bases de datos de la Biblioteca | E-books, revistas y videos, dentro y fuera del campus | Estudiante Javeriana | Gratis mientras estudies | 2·3·4·3 = **12** | **Verificado** |
| 12 | SENA cursos cortos (Zajuna) | Cursos cortos 100 % virtuales | Según cada curso | Sin confirmar | 2·4·4·2 = 12 | **Fuente oficial parcial**: zajuna.sena.edu.co muestra los cursos, pero no dice "gratis" en el texto que cargó |
| 13 | Bold | Datáfono y link de pago; QR a 1,50 % y 0 % según el plan; tarjetas desde 2,69 % + $300 | Comprar el datáfono | Tarifa | 2·3·4·2 = 11 | **Fuente oficial parcial**: bold.co/tarifas tiene varias tablas por plan; no es un beneficio. Sirve para una ficha comparativa |
| 14 | Cámara de Comercio de Cali: Prospera | Rutas "De la idea al negocio" | Sin confirmar | Gratis según noticias | 3·5·3·3 = 14 | No verificado: solo notas de prensa de 2025 |
| 15 | Tarifa mipyme para registrar marca (SIC) | Primera clase en línea a $970.000 en vez de $1.347.500, según blogs | Mipyme acreditada | Descuento | 4·4·2·4 = 14 | No verificado: sic.gov.co cargó vacía |
| 16 | iNNpulsa Emprendimiento Digital 2026 | Hasta $2.000.000 en herramientas digitales | Empresas de la industria digital | Gratis | 2·2·2·4 = 10 | No verificado: sin fecha de cierre oficial |
| 17 | Wompi | Link de pago a 2,65 % + $700 + impuestos; QR a 1 % + IVA | Cuenta Bancolombia | Tarifa | 3·4·4·2 = 13 | No verificado: wompi.com cargó vacía |
| 18 | Nequi Negocios | Cobros con QR y con tarjeta sin cuota | Celular con NFC para tarjeta | Tarifa | 3·4·5·2 = 14 | No verificado: la página oficial no muestra tarifas. Sí confirma "Escuela Nequi Negocios", con cursos gratis de IA y nube |
| 19 | Mercado Pago (link de pago) | 3,49 % + IVA, según un blog | Cuenta Mercado Pago | Tarifa | 2·3·4·1 = 10 | No verificado: la página pide iniciar sesión |
| 20 | Perplexity Education Pro | US$10 al mes | SheerID | Descuento | 2·2·4·3 = 11 | No verificado: el año gratis terminó |
| 21 | Apple Education en Colombia | Precio de estudiante en Mac y iPad | Estudiante verificado | Descuento | 3·2·2·2 = 9 | No verificado: fuentes contradictorias |
| 22 | ChatGPT Plus para estudiantes | 4 meses gratis | Universidad de EE. UU. | — | — | **Descartado**: solo EE. UU.; venció el 2026-10-31 según agregadores |
| 23 | Adobe Express Premium para estudiantes | 6 meses gratis | Residir en EE. UU. | — | — | **Descartado**: solo EE. UU.; venció el 2026-02-27 |
| 24 | Webflow para estudiantes | Plan CMS gratis por un año | — | — | — | **Descartado**: retirado el 2026-02-28 |
| 25 | Canva para la Educación | Canva gratis para estudiantes | Solo colegios (K-12) | — | — | **Descartado**: no aplica a universitarios. Vale la pena preguntarle a la Javeriana si tiene Canva for Campus |
| 26 | Tiendanube | Tienda en línea | — | — | — | **Descartado**: la página de Colombia solo ofrece "Probar 7 días gratis" |
| 27 | Google AI Pro para estudiantes | 1 año gratis | Solo EE. UU. | — | — | **Descartado** para Colombia: aquí aplica AI Plus (ver #4) |

**No se alcanzó a investigar:** Claude para estudiantes, Microsoft Copilot para estudiantes, Shopify, Wix, Mailchimp, Metricool, Later, Hootsuite, CapCut, Procreate, Google Fonts, Lenovo, Amazon Prime Student, AWS Educate, Google Cloud, Platzi, Domestika, LinkedIn Learning, Meta Blueprint, cuentas bancarias para jóvenes, y transporte o cultura en Cali.

## Revisión de los 18 beneficios actuales

Todos se revisaron el 2026-11-04 abriendo la fuente.

| Beneficio | Estado | Qué hacer | Fuente |
|---|---|---|---|
| Microsoft 365 | Sigue | Nada. La guía dice "puedes descargar de forma gratuita toda la suite" | [Guía 2024-2](https://neojaverianos.javerianacali.edu.co/sites/default/files/Guia_acceso_rapido_2024_2.pdf) |
| Suite de Adobe | Sigue | La guía solo dice "acceso a la suite de Adobe" y remite al CSI (`requerimientoscsi@javerianacali.edu.co`). Se puede sumar ese correo a los pasos | [Guía 2024-2](https://neojaverianos.javerianacali.edu.co/sites/default/files/Guia_acceso_rapido_2024_2.pdf) |
| Figma | Sigue | Confirmado: Professional para educación superior, un año para estudiantes y "solo en algunas regiones". Agregar al requisito: aplica con el correo de la universidad | [help.figma.com](https://help.figma.com/hc/en-us/articles/360041061214) |
| Spotify Premium Estudiantes | Sigue | $10.100 al mes; Individual $18.500; hasta 4 años | [spotify.com/co-es/student](https://www.spotify.com/co-es/student/) |
| Apple Music Estudiantes | Sigue | $9.900 al mes, 1 mes gratis, con Apple TV | [apple.com/co/apple-music](https://www.apple.com/co/apple-music/) |
| YouTube Premium Estudiantes | Ajustar | La ayuda confirma Colombia, hasta 4 años y verificación anual. No se pudo ver el precio. Cambiar la etiqueta "PRECIO ESTUDIANTE" (17 caracteres) por "ESTUDIANTE" | [support.google.com/youtube](https://support.google.com/youtube/answer/9158808?hl=es-419) |
| Notion | Sigue | Confirmado. Agregar al requisito: si pasas el espacio a un plan pago, pierdes el plan Education para siempre | [notion.com/help](https://www.notion.com/help/notion-for-education) |
| Miro | **Pausar** | La ayuda sigue describiendo el plan (2 años para estudiantes, 10 miembros), pero en el foro oficial un moderador dice que no reciben solicitudes nuevas. Poner `activo = false` y revisar cada mes | [help.miro.com](https://help.miro.com/hc/es/articles/360017730473-Plan-Education) · [community.miro.com](https://community.miro.com/ask-the-community-45/i-can-t-apply-for-education-plan-29381) |
| Framer | Sigue | Confirmado: Basic de US$120 al año, 1.000 créditos de IA al mes y nueva solicitud cada 11 meses | [framer.com/students](https://www.framer.com/students) |
| Dominio web gratis | Ajustar | Confirmado: dominio .me por un año y SSL por un año con Namecheap; Name.com da un dominio gratis en algunas extensiones (.live, .studio, .app, .dev). No aparece ".tech": quitarlo del `detalle` | [education.github.com/pack](https://education.github.com/pack) |
| GitHub Student Pack | Ajustar | El plan se llama ahora "Copilot Student". Cambiar el `detalle` | [docs.github.com](https://docs.github.com/en/copilot/how-tos/copilot-on-github/set-up-copilot/enable-copilot/set-up-for-students) |
| Azure para estudiantes | Sigue | US$100 sin tarjeta, un año, renovable; mayor de 18 y tiempo completo | [learn.microsoft.com](https://learn.microsoft.com/es-mx/azure/education-hub/about-azure-for-students) |
| Autodesk | Sigue, sin confirmar | La página bloqueó el acceso automático (403) | [autodesk.com/education](https://www.autodesk.com/education.html) |
| Deezer Student | Sigue | Colombia está en la lista; de 18 a 25 años; verificación anual con UNiDAYS | [support.deezer.com](https://support.deezer.com/hc/es/articles/115005788109-Deezer-Student) |
| Samsung Estudiantes | Ajustar | Hay campañas vigentes hasta el 2026-12-31 (primera compra, Bre-B, VISA y 0 % de interés). Cambiar la etiqueta "PRECIO ESTUDIANTE" por "ESTUDIANTE" | [samsung.com/co](https://www.samsung.com/co/info/tyc/students/) |
| Affinity | Ajustar fuente | La página oficial dice "Affinity es gratis para particulares". Cambiar `fuente` de MacRumors a `https://www.affinity.studio/es_419` | [affinity.studio](https://www.affinity.studio/es_419) |
| DaVinci Resolve | Sigue | Descarga gratuita confirmada; Studio es la versión paga | [blackmagicdesign.com](https://www.blackmagicdesign.com/products/davinciresolve) |
| Blender | Sigue | "Free and Open Source software, forever" | [blender.org](https://www.blender.org/about/) |

Los 3 aliados de ejemplo no se tocaron.

## Destacados recomendados

| Beneficio | Puntaje | Por qué |
|---|---|---|
| Ruta de Emprendimiento Campus Nova | 17 | Es lo más útil para quien está empezando y casi nadie en DCV lo usa. Además, Campus Nova ya trabaja con estudiantes de DCV en retos de marca |
| Asesoría EmprendeLab | 17 | Es la puerta de entrada más fácil: una sesión que se agenda en línea |
| Matrícula mercantil sin costo | 16 | Ahorro real y directo al formalizarse. Casi nadie sabe que existe |
| Software de la universidad en la nube | 16 | Resuelve el problema de no tener un computador potente para diseñar |
| Google AI Plus | 16 | Un año gratis confirmado para Colombia, con fecha límite: el 31 de diciembre. Ojo: pide forma de pago y cobra al terminar si no cancelas |
| Perfil de Negocio de Google | 15 | Gratis para siempre y ayuda a vender desde el primer día, tengas o no local |

Spotify sigue en los destacados, al final del carrusel (decisión de Jhon, 2026-11-04): no ayuda a emprender, pero es un gancho que casi todos usan y el ahorro se entiende de inmediato.

## Categorías nuevas que se proponen

- **Apoyo para emprender**: programas, asesorías, fondos y exenciones. Hoy no hay dónde ponerlos y son lo que más valor tiene.
- **Aprender**: cursos, certificados y bases de datos.
- **Vender**: herramientas para que te encuentren y te paguen.

Para que se vean en la app hay que sumarlas a `CATS_B`, `TITULO` e `ICONO_CAT` en `src/screens/Beneficios.jsx`. Ese archivo es zona del agente de diseño y no se cambió aquí. **Si se cargan las filas antes de ese cambio, las de estas categorías no aparecen en las filas por categoría** (sí en "Todo" filtrado, en búsqueda y en destacados). La columna `tipo` solo acepta `digital` o `aliado`, así que los apoyos van como `digital`.

## Ideas para que Beneficios enganche más (criterio propio)

1. **Agrupar por etapa del emprendimiento, no por tipo de app**: "Para empezar" (Campus Nova, asesoría, Ley 1780), "Para lanzar tu marca" (Adobe, Figma, Framer, dominio), "Para vender" (Perfil de Negocio) y "Para aprender gratis". Alguien que empieza busca qué hacer, no qué software hay.
2. **"Lo que ya tienes por ser Javeriano"** como primera fila, en Polen. Es el contenido que nadie más puede mostrar y el que más sorprende.
3. **Contador de ahorro calculado, no inventado**: sumar el precio de lista que publica cada marca (por ejemplo, Framer: US$120 al año) para los beneficios que el usuario marcó como "Ya lo activé". Exige una columna nueva (`valor` y su fuente), así que queda como propuesta para Jhon.
4. **Aviso de vencimiento**: mostrar "Reclámalo antes del 31 dic." en ofertas con fecha límite, como Google AI Plus. Exige otra columna nueva (`vence_en`).
5. **Ficha "¿Con qué cobro?"** en Herramientas, que compare Nequi Negocios, Wompi, Bold y Mercado Pago con sus tarifas oficiales y la fecha de revisión. Solo cuando se puedan leer las cuatro páginas de tarifas.

## Fuentes abiertas el 2026-11-04

**Javeriana Cali**
- [Incubación · Campus Nova](https://www.javerianacali.edu.co/centro-de-innovacion-y-emprendimiento/Incubacion)
- [Centro de Innovación y Emprendimiento](https://www.javerianacali.edu.co/centro-de-innovacion-y-emprendimiento)
- [Herramientas digitales para estudiantes](https://www.javerianacali.edu.co/estudiantes/recursos-virtuales/herramientas-digitales)
- [Guía de acceso rápido 2024-2 (PDF)](https://neojaverianos.javerianacali.edu.co/sites/default/files/Guia_acceso_rapido_2024_2.pdf)
- [Préstamo de portátiles](https://neojaverianos.javerianacali.edu.co/node/88)
- [Biblioteca · Recursos digitales](https://www.javerianacali.edu.co/biblioteca/recursos-digitales)
- [Biblioteca · Información y políticas](https://www.javerianacali.edu.co/biblioteca/informacion-y-politicas)

**Apoyo público y gremial**
- [Matrícula y Ley 1780 · Cámara de Comercio de Cali](https://www.ccc.org.co/sedevirtual/tramites-de-registros-publicos/registro-mercantil/tramites/matricula/)
- [Capacitaciones · Cámara de Comercio de Cali](https://www.ccc.org.co/capacitaciones-eventos-y-convocatorias/maraton-de-asesorias/)
- [Fondo Emprender · Convocatorias vigentes](https://www.fondoemprender.com/SitePages/FondoEmprenderConvocatoriasVigentes.aspx)
- [Zajuna · SENA](https://zajuna.sena.edu.co/)

**Herramientas, formación y pagos**
- [Gemini para estudiantes · Colombia](https://gemini.google/co/students/?hl=es-419)
- [Blog de Google · oferta para estudiantes](https://blog.google/innovation-and-ai/products/gemini-app/student-offer-google-ai/)
- [Perfil de Negocio de Google](https://business.google.com/es-all/business-profile/)
- [Agregar o reclamar tu Perfil de Negocio](https://support.google.com/business/answer/2911778?hl=es-419)
- [HubSpot Academy · Marketing digital](https://academy.hubspot.com/es/courses/digital-marketing)
- [Tarifas de Bold](https://bold.co/tarifas)
- [Nequi Negocios](https://www.nequi.com.co/negocios)
- [Tiendanube · Planes Colombia](https://www.tiendanube.com/co/planes-y-precios)

**Beneficios actuales**
- [Figma for Education](https://help.figma.com/hc/en-us/articles/360041061214)
- [YouTube · membresía para estudiantes](https://support.google.com/youtube/answer/9158808?hl=es-419)
- [Notion for Education](https://www.notion.com/help/notion-for-education)
- [Miro · Plan Education](https://help.miro.com/hc/es/articles/360017730473-Plan-Education) y [foro de Miro](https://community.miro.com/ask-the-community-45/i-can-t-apply-for-education-plan-29381)
- [Framer para estudiantes](https://www.framer.com/students)
- [GitHub Student Pack](https://education.github.com/pack) y [Copilot para estudiantes](https://docs.github.com/en/copilot/how-tos/copilot-on-github/set-up-copilot/enable-copilot/set-up-for-students)
- [Azure para estudiantes](https://learn.microsoft.com/es-mx/azure/education-hub/about-azure-for-students)
- [Deezer Student](https://support.deezer.com/hc/es/articles/115005788109-Deezer-Student)
- [Samsung · términos estudiantes](https://www.samsung.com/co/info/tyc/students/)
- [Affinity](https://www.affinity.studio/es_419)
- [DaVinci Resolve](https://www.blackmagicdesign.com/products/davinciresolve)
- [Blender](https://www.blender.org/about/)
- [Spotify Estudiantes](https://www.spotify.com/co-es/student/)
- [Apple Music](https://www.apple.com/co/apple-music/)

Fuentes de la primera ronda (solo buscador), que se usaron para los no verificados y descartados: [Adobe Express, términos](https://www.adobe.com/offer-terms/express-terms-premium-free-students.html), [Webflow, retiro del descuento](https://help.webflow.com/hc/en-us/articles/33961230226963-Webflow-for-students), [Canva para la Educación](https://www.canva.com/es_es/help/about-canva-for-education/), [Prospera · Gaceta Regional](https://www.gacetaregional.com/prospera-programa-lider-de-la-camara-de-comercio-de-cali-acompana-a-emprendedores/), [Tasas SIC · Prensa Jurídica](https://www.prensajuridica.com/details/item/36656-sic-modifica-las-tasas-de-propiedad-industrial-para-la-vigencia-2026.html), [iNNpulsa ED 2026 (PDF)](https://www.innpulsacolombia.com/wp-content/uploads/2026/04/PPT-CONVOCATORIAS-ED-2026-1.pdf), [Wompi QR · Enter.co](https://www.enter.co/fintech/wompi-baja-la-tarifa-del-qr-al-1-y-amplia-los-pagos-desde-el-celular/), [Perplexity Education Pro](https://intercom.help/perplexity-ai/en/articles/12590157-what-is-education-pro).
