# Auditoría de interfaz · Colmena

Fecha: 4 de noviembre de 2026 · Rama auditada: `v0/onboarding` (commit `c6801b3`) · Tamaño: 390 × 844, deviceScaleFactor 2.
Esta sesión fue solo de diagnóstico: no se cambió código de la app.

---

## 0. Cómo se hicieron las capturas (léelo antes de juzgarlas)

- La red de este entorno **bloquea** `colmena-dcv.netlify.app`, la versión de prueba `6aeb41d02a6851c286ab157f--colmena-dcv.netlify.app` y `gajqknhwlwvgjeionfmo.supabase.co` (el proxy responde 403). Por eso no se usó la URL de prueba.
- Se corrió la rama `v0/onboarding` en local (`npm run dev`).
- Los datos **son los reales**: se leyeron del proyecto `colmena` en Supabase con el conector, ejecutando la consulta **como rol `anon`**. Es decir, se aplicaron las mismas reglas de RLS que ve el navegador con la llave publicable, y se pidieron las mismas columnas que pide `src/lib/store.jsx`. Playwright interceptó las llamadas a Supabase y respondió con esos datos. Todas las escrituras (RPC) se bloquearon: **cero escrituras a producción**.
- Vista "con sesión" (capturas 17 a 19): se simuló la sesión del perfil `jhon` (COL-0101, es tu perfil real) con una clave falsa. `mis_pendientes` se devolvió vacío, así que la campana sale sin avisos aunque en la realidad podría tener alguno.
- El tiempo relativo ("hace 14 h", "Cierra en 13 h") corresponde al 4 de noviembre de 2026.
- **Verificación contra la versión de prueba (actualizado):** cuando Jhon permitió `*.netlify.app` y `gajqknhwlwvgjeionfmo.supabase.co` en la red del entorno, se repitieron las 19 capturas directamente en `https://6aeb41d02a6851c286ab157f--colmena-dcv.netlify.app/`, con lecturas en vivo a Supabase. Las RPC de escritura siguieron bloqueadas, `mis_pendientes` se devolvió vacío y `resenas_publicas` se dejó pasar. **Las 19 capturas salieron idénticas píxel a píxel** a las locales, así que el diagnóstico aplica tal cual a la versión de prueba. Las capturas de esta carpeta corresponden a esa versión.
- **Fuentes web:** el entorno solo permitió la búsqueda web. Abrir páginas directamente (WebFetch) falló porque estaban bloqueados `help.behance.net`, `newsroom.tiktok.com`, `www.nngroup.com` y `m3.material.io`. Todo lo citado viene de los resultados de búsqueda, que muestran fragmentos de esas páginas. Cada afirmación lleva su link. Si una frase dice **"criterio"**, es mi opinión de diseñador y no un dato.

| # | Captura | Qué muestra |
|---|---|---|
| 01 | `capturas/01-muro-arriba.png` | Muro, primera pantalla (visitante) |
| 02 | `capturas/02-muro-publicaciones.png` | Muro, primeras publicaciones |
| 03 | `capturas/03-muro-mas-abajo.png` | Muro, más publicaciones |
| 04 | `capturas/04-beneficios-arriba.png` | Beneficios, arriba |
| 05 | `capturas/05-beneficios-filas.png` | Beneficios, filas por categoría |
| 06 | `capturas/06-beneficios-aliados.png` | Beneficios, filas inferiores |
| 07 | `capturas/07-beneficios-gratis.png` | Beneficios con filtro "Gratis" |
| 08 | `capturas/08-beneficio-detalle.png` | Detalle de Microsoft 365 |
| 09 | `capturas/09-miembros.png` | Miembros |
| 10 | `capturas/10-miembros-abajo.png` | Miembros, más abajo |
| 11 | `capturas/11-carnet-ejemplo.png` | Carnet de ejemplo (Sara Ospina) |
| 12 | `capturas/12-carnet-ejemplo-abajo.png` | Carnet de ejemplo, más abajo |
| 13–15 | `capturas/13-encuentro.png`, `14-…`, `15-…` | Encuentro: evento, reto y panal |
| 16 | `capturas/16-mi-carnet-visitante.png` | Mi carnet sin carnet |
| 17 | `capturas/17-muro-con-sesion.png` | Muro con sesión |
| 18–19 | `capturas/18-mi-carnet-con-sesion.png`, `19-…` | Mi carnet con sesión: nivel e insignias |

---

## 1. Resumen sin anestesia

Colmena está **bien hecha y mal puesta en escena**. La marca se respeta, los textos son claros y el código está cuidado. Pero la interfaz se comporta como un **folleto** y no como una **app de contenido**:

- En la primera pantalla de lo que vinimos a ver no aparece nada.
- Cada pestaña gasta una quinta parte de la pantalla en un título fijo.
- No hay ninguna imagen y todas las tarjetas se ven iguales.
- El Polen está en tantos sitios que ya no señala nada.

Las cuatro apps de referencia hacen lo contrario: **el contenido de otras personas es la interfaz**, y el cromo (la estructura de la app) se hace a un lado.

---

## 2. Diagnóstico, de lo más grave a lo menos grave

### F1. El Muro entierra su propio contenido (grave)
**Evidencia:** capturas 01 y 17. En la primera pantalla del Muro no hay **ni una publicación**. Ese espacio lo ocupan la etiqueta "Muro · DCV Javeriana", un titular de 3 líneas a 38 px, un párrafo, el compositor, el aviso de prueba, la tarjeta de "Primeros pasos" y el carrusel "Esta semana", que aparece cortado por la barra de navegación. La primera publicación empieza alrededor de **1.160 px** desde arriba: hay que bajar casi una pantalla y media (captura 02). Además, el titular "Ayuda entre emprendedores de DCV" **repite la bienvenida**, que ya se mostró en `Onboarding.jsx`.

**Qué hacen las referencias:**
- Instagram, en su rediseño de 2016, quitó "el color y el ruido de las superficies donde el contenido de la gente debe ser el protagonista" ([cobertura de la explicación de Ian Spalter](https://martech.org/instagram-redesigned-logo-mobile-apps), [TechCrunch](https://techcrunch.com/?p=1320494)).
- El feed de Instagram arranca con la tira de Historias encima de las publicaciones, no con un texto institucional ([anuncio de Stories](https://about.instagram.com/blog/announcements/introducing-instagram-stories)).
- TikTok abre directamente en el feed "Para ti". A una cuenta nueva que no elige intereses le muestra primero videos populares, en vez de una explicación ([TikTok Newsroom](https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you/)).

**Cómo adaptarlo:** quita el titular y el párrafo del Muro cuando la bienvenida ya se vio. Deja el compositor como una sola barra Polen de 56 px. Junta el aviso de prueba y los primeros pasos en **una fila de 56 px**. Mueve el carrusel "Esta semana" para que aparezca **después de la tercera publicación**, como una pausa en el muro y no como su portada. Meta: que la primera publicación empiece por encima de los 300 px. Detalle en la mejora M1.

### F2. Las cabeceras fijas se comen la pantalla (grave)
**Evidencia:** capturas 04 a 07, 09, 10 y 13 a 15.
- En Miembros, Encuentro y Mi carnet, el título grande y el subtítulo **quedan fijos** arriba mientras el contenido pasa por debajo. Medido en el navegador, el contenido desplazable empieza en y = 139 px (en Beneficios, en y = 161 px).
- La barra de navegación flotante ocupa de y = 768 a 844.
- Resultado: en Beneficios solo queda **el 72 % de la pantalla** para contenido, y el subtítulo "Descuentos, aliados y herramientas para tu emprendimiento" se queda pegado en cada captura.
- En el carnet de ejemplo (captura 12), el botón fijo "Crear carnet para escribirle" más la navegación tapan unos 230 px y esconden justo la sección de Insignias.
- En Miembros, "Busca por nombre o habilidad" sale **dos veces**: como subtítulo fijo y como texto del buscador (captura 09).

**Qué hacen las referencias:**
- Apple pide mantener visible la barra de pestañas, porque esconderla hace que la gente pierda la orientación ([HIG, Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)). Lo que sí debe quedarse fijo es la navegación, no el título.
- **Criterio:** Instagram y TikTok no tienen un título grande fijo en sus pantallas principales. La marca vive en una cabecera delgada o directamente encima del contenido.

**Cómo adaptarlo:** el `h1` de cada pestaña se desplaza con el contenido. Solo queda fija la cabecera de marca, de unos 62 px. Se borran los subtítulos que repiten lo que ya dice el buscador. El botón fijo del carnet baja a 56 px de alto y lleva fondo Niebla sólido (ver F10). Detalle en M2.

### F3. Sin imagen, todo es igual: Beneficios y Miembros no tienen nada que mirar (grave)
**Evidencia:**
- Capturas 05 a 07: en cada tarjeta de beneficio, la "portada" es **una letra dentro de un hexágono**. Adobe y Apple Music muestran la misma "A"; Spotify y Samsung, la misma "S"; Framer y Figma, la misma "F". Las portadas solo alternan entre Tinta, Polen y Niebla, así que nada distingue un beneficio de otro.
- Capturas 09 y 10: los 9 miembros tienen el mismo avatar (hexágono Tinta con iniciales Polen), la misma tarjeta, la misma etiqueta "NIVEL 2" y casi siempre "1 ayuda dada".
- En la base de datos no hay ninguna imagen: `publicaciones`, `perfiles` y `beneficios` no tienen columna de foto.

**Qué hacen las referencias:**
- Behance hace de la portada el centro del descubrimiento. Exige un tamaño único "para que cada proyecto tenga la misma representación" (mínimo 808 × 632, se ve a 202 × 158) ([Behance Help](https://help.behance.net/hc/en-us/articles/204483484-What-is-a-Cover-Image-)). Su equipo de curaduría pide que la portada "muestre el look and feel del proyecto" y **sin texto**, porque el proyecto se explica por dentro ([Behance Blog](https://www.behance.net/blog/how-to-get-featured-on-behance)). También dice que la portada debe dar ganas de abrir el proyecto y a la vez representarlo bien ([Behance Curation, 2015](https://medium.com/behance-blog/behance-curation-philosophy-and-approach-6e0ae9ab350f)).
- Facebook resolvió el "no hay foto" con tipografía y color: los estados de menos de 35 caracteres se muestran más grandes y en negrita, y los estados de solo texto pueden ir sobre un fondo de color ([TechCrunch](https://techcrunch.com/2016/12/19/facebook-status-background-color/), [Pocket-lint](https://www.pocket-lint.com/apps/news/facebook/139777-here-s-how-to-make-your-facebook-posts-colourful)).

**Cómo adaptarlo sin romper la marca ni subir logos de terceros** (AGENTS.md no lo permite):
- **Portada tipográfica:** en cada beneficio, la portada es **el valor** ("GRATIS", "−45 %", "1 AÑO", "US$100") en Space Grotesk 700 grande, que ocupe toda la portada como si fuera la imagen.
- **Motivo de panal:** una esquina de retícula de panal a ≤ 10 % de opacidad, como permite la sección 5 del spec.
- **Ícono de categoría:** un ícono de línea de los que ya existen (`spark`, `link`, `note`, `clock`, `bag`), en vez de la letra.
- **Miembros:** que se diferencien por lo que **hacen** y no por el nivel. Muestra la primera habilidad en grande, el estado "Disponible" (con la píldora Verde que ya existe) y las ayudas dadas solo si son más de 0.
- **Imágenes reales:** a mediano plazo, cuando haya fotos de producto o portafolio, se necesita una columna nueva. No la invento aquí: la anoto como pendiente para Claude/Jhon (ver M3).

### F4. El Polen está en todo, entonces nada resalta (grave)
**Evidencia:**
- Captura 02: en una sola pantalla hay Polen en el botón "Crear carnet" de la cabecera, el borde de la tarjeta del reto, el chip "Quedan 9 h", el botón "Me interesa" de cada publicación y la pestaña activa.
- Captura 03: dos publicaciones = dos botones Polen idénticos, más la navegación.
- Captura 05: la mitad de las portadas de beneficios son Polen sólido.
- La regla de marca se cumple **en forma** (Polen solo en acciones, activos y resaltados). **Criterio:** se incumple en espíritu. Si cada tarjeta tiene su "acción principal" en Polen, el ojo no tiene a dónde ir primero.

**Qué hacen las referencias:**
- Instagram pasó a una interfaz casi en blanco y negro, y dejó el color para lo que de verdad debe llamar la atención: las notificaciones pasaron de naranja a rojo y el texto azul a negro ([MarTech](https://martech.org/instagram-redesigned-logo-mobile-apps), [TechCrunch](https://techcrunch.com/?p=1320494)).
- En Material, solo el destino activo de la barra lleva indicador de color ([resumen de la guía de Navigation bar de M3, vía SAP Fiori](https://www.sap.com/design-system/fiori-design-android/v26-4/components/m3-standard-components/navigation-bar/usage)).

**Cómo adaptarlo:**
- En el Muro, un solo Polen por pantalla: el compositor. Lo demás en Tinta y Blanco.
- El botón "Puedo ayudar / Me interesa" pasa a Tinta con texto Blanco: sigue siendo fuerte, pero no compite.
- El chip "Quedan 9 h" pasa a texto JetBrains Mono gris con el ícono `hour`.
- Para el visitante, "Crear carnet" de la cabecera pasa a contorno Tinta, porque el compositor ya es la acción Polen.
- Las portadas Polen en Beneficios se reservan para los destacados.

Detalle en M4.

### F5. Beneficios parece un inventario, no una tienda (grave)
**Evidencia:**
- Captura 04: lo primero que ves es un bloque Tinta con **estadísticas** (13 gratis, 5 con descuento, 3 aliados de ejemplo), no algo que puedas conseguir.
- Los destacados gritan "GRATIS" a 38 px dos veces seguidas (Microsoft 365 y Adobe), así que el titular no distingue nada. Lo que sí importa, el nombre ("Microsoft 365"), va más pequeño.
- Captura 07: con el filtro "Gratis" activo, **cada** tarjeta repite la etiqueta "GRATIS". Todas repiten también "PARA ESTUDIANTES" en el pie, aunque eso aplica a 15 de 18.
- No hay ninguna razón para volver: nada se puede guardar ni marcar como "ya lo activé", y no hay nada "nuevo".
- Detalle (captura 08): está bien resuelto. Pasos numerados, requisito, fuente y fecha de revisión. Es la mejor pantalla de la sección.

**Qué hacen las referencias:**
- Behance organiza el descubrimiento en galerías **curadas a mano**: más de 100, desde "Best of Behance" hasta galerías por campo. Marca lo elegido con una bandera de "Featured" sobre la portada ([Behance Help, Discover](https://help.behance.net/hc/en-us/articles/204484044-Guide-Discover-Creative-Work-on-Behance)).
- Instagram añadió Colecciones para guardar y ordenar publicaciones en privado. Según Instagram, el 46 % de sus usuarios había guardado al menos una publicación desde diciembre de 2016 ([TechCrunch](https://techcrunch.com/2017/04/17/instagram-now-lets-you-organize-bookmarks-into-private-collections/), [9to5Mac](https://9to5mac.com/2017/04/17/instagram-save-posts-private-collections-folders/)).
- NN/g advierte que en los carruseles la gente se fija sobre todo en el primer elemento, y que ese primero define qué espera del resto ([NN/g, Mobile carousels](https://www.nngroup.com/articles/mobile-carousels/)).
- El equipo de Material probó con distintos tamaños de "asomo" del siguiente elemento para indicar que hay más contenido ([Material 3 carousel research](https://m2.material.io/blog/material-3-carousel-research-design)).

**Cómo adaptarlo:**
- Quita el bloque de estadísticas y pon el conteo en una línea bajo el título.
- El primer destacado debe ser el más útil para un emprendedor de DCV. **Criterio:** Adobe o el dominio web, no Office.
- El titular del destacado es el **nombre** y el valor va en el sello.
- Esconde la etiqueta repetida cuando el filtro ya la implica, y borra "PARA ESTUDIANTES" (deja solo la excepción "Gratis para todos").
- Agrega "Guardar" y "Ya lo activé" **solo en este dispositivo** (`localStorage`, como permite AGENTS.md para preferencias por persona). No requiere base de datos.

Detalle en M3.

### F6. La gamificación existe pero no se siente (media)
**Evidencia:**
- Captura 18: "Nivel 1 · Nuevo · 0 puntos · te faltan 3 para Activo". La celda de nivel es un contorno gris casi invisible y la barra está vacía.
- Captura 19: 2 de 8 insignias en Polen y 6 bloques grises con candado del mismo peso: el carnet se ve **"incompleto"** antes que **"en camino"**.
- Capturas 09 y 10: todos los miembros dicen "NIVEL 2", así que la etiqueta no aporta nada al comparar.
- Captura 16: el visitante que entra a "Mi carnet" ve una pantalla **75 % vacía**. Y la pieza más bonita de la marca, el carnet Polen (captura 11), no aparece.

**Qué hacen las referencias:**
- Behance convierte el reconocimiento en algo social: "Apreciar" un proyecto se le notifica a quienes te siguen ([Behance Help](https://help.behance.net/hc/en-us/articles/204484044-Guide-Discover-Creative-Work-on-Behance)).
- Instagram probó esconder los "me gusta" para "despresurizar" la plataforma. Al final lo dejó como opción, con resultados mixtos: a algunos les sirvió y a otros les molestó ([Meta Newsroom, 2021](https://about.fb.com/news/2021/05/giving-people-more-control/)).
- Lección (**criterio**): el conteo que **compara personas** genera presión. El progreso **propio** y los reconocimientos de otros funcionan mejor.
- TikTok probó rachas en mensajes directos: un número con una llama que se pierde si pasan 24 horas sin escribir ([Tribune / TechCrunch](https://tribune.com.pk/story/2470572/entertainment), [htxt](https://htxt.co.za/2024/06/tiktok-testing-streaks-to-boost-engagement)). Esto es justo lo que **no** hay que copiar (sección 5).

**Cómo adaptarlo:**
- En Mi carnet, muestra **una sola** insignia siguiente con su acción ("Te falta 1 cosa para *Primera ayuda*: responde una publicación") en vez de 6 candados.
- Cuando se gana una insignia, la celda se llena de Polen con una animación de 300 ms, una sola vez y sin sonido. Con `prefers-reduced-motion`, aparece llena sin animación.
- En Miembros, quita la etiqueta de nivel cuando todos tienen el mismo.
- Para el visitante, "Mi carnet" debe mostrar **la vista previa de su carnet** (Polen, COL-····, "Tu nombre") con el botón "Crear el mío".

Detalle en M5.

### F7. Carga en blanco y poca respuesta al tocar (media)
**Evidencia:**
- Mientras carga, `App.jsx` muestra solo un hexágono (`.loading > .hexav`). No hay esqueleto de las tarjetas.
- La respuesta al tocar es solo un `transform: scale(.97–.985)` (`app.css`, líneas 483–485 y 713).
- "Útil" espera al servidor para cambiar de estado (`alternarMeSirve` en `store.jsx`). Sin conexión rápida, no pasa nada visible.
- `prefers-reduced-motion` sí se respeta (líneas 410, 465 y 646). Bien.

**Qué hacen las referencias:**
- Nielsen: por debajo de 0,1 s la respuesta se siente instantánea, y por debajo de 1 s no se rompe el hilo de pensamiento ([NN/g, 3 response time limits](https://www.nngroup.com/videos/3-response-time-limits-interaction-design/)).
- NN/g recomienda pantallas esqueleto porque reducen la sensación de espera ([NN/g, Skeleton screens](https://nngroup.com/articles/skeleton-screens/), [video](https://www.nngroup.com/videos/skeleton-screens-vs-progress-bars-vs-spinners/)).
- Facebook publicó en código abierto Shimmer, su efecto de carga para tarjetas ([GitHub facebook/Shimmer](https://awesome.ecosyste.ms/projects/github.com%2Ffacebook%2FShimmer)).
- En el diseño de Reacciones, Facebook iteró la animación hasta que cada reacción "se sintiera viva", y descartó opciones que estorbaban la lectura del feed ([CSMonitor sobre el post de Geoff Teehan](https://www.csmonitor.com/Technology/2016/0224/How-Facebook-narrowed-range-of-human-emotions-down-to-six-reactions), [Motionographer](https://motionographer.com/2016/02/25/the-key-to-facebook-reactions-animation-of-course/)).

**Cómo adaptarlo:**
- Esqueleto de 3 tarjetas de publicación, en bloques **planos** Blanco sobre Niebla con un pulso de opacidad (0,6 → 1, 1,2 s). Nada de brillo con degradado, porque la marca prohíbe los degradados.
- "Útil" optimista: el número sube y el ícono pulsa (escala 1 → 1,15 → 1, 160 ms) al instante; si el servidor falla, se revierte. El código ya recarga si falla.

### F8. Navegación: íconos sin nombre y una bolsa que no dice "beneficios" (media-baja)
**Evidencia:**
- Todas las capturas: en la barra flotante solo la pestaña activa lleva texto. Las otras 4 son íconos solos.
- La de Beneficios es una bolsa de compras (`bag`), que se lee como "tienda" o "carrito".
- Internamente la pestaña se llama `herramientas` (`App.jsx`, `TABS`), y en pantalla dice "Beneficios". El pilar "Herramienta" de la marca ya no tiene una puerta visible.

**Qué hacen las referencias:** las guías de Material piden de 3 a 5 destinos y etiquetas cortas. Una barra sin etiquetas existe, pero es la versión reducida ([resumen M3 vía SAP](https://www.sap.com/design-system/fiori-design-android/v26-4/components/m3-standard-components/navigation-bar/usage)). Apple recomienda pocas pestañas y que cada una sea una sección de primer nivel ([HIG](https://developer.apple.com/design/human-interface-guidelines/tab-bars)).

**Cómo adaptarlo:** etiqueta de 11 px bajo cada ícono inactivo (Hanken Grotesk 600), con la píldora Polen solo en la activa. Cambia el ícono de Beneficios a `seal` o `spark`. **Criterio:** que la pestaña se llame "Beneficios" está bien. Las fichas y la calculadora deberían vivir dentro de ella como una fila más ("Herramientas para cobrar bien").

### F9. Sobra texto de interfaz (baja)
**Evidencia:**
- El Muro explica cómo funciona (párrafo + "¿Cómo funciona?" + aviso + primeros pasos) **cuatro veces** en la primera pantalla (captura 01).
- Encuentro tiene subtítulo, nota "Tres semanas en la app…", pasos del reto y párrafo del panal (capturas 13 a 15).
- Los botones "¿?" del carrusel y del reto ya cubren esa ayuda.

**Qué hacen las referencias:** **criterio**, basado en las referencias de arriba. Instagram y TikTok casi no escriben interfaz y ponen la explicación en el momento en que hace falta. NN/g encontró que la ayuda en contexto, cuando la persona llega a una pantalla vacía, funciona mejor que un tutorial al inicio ([resumen de NN/g, empty states](https://vp0.com/blogs/designing-ios-empty-states-that-feel-intentional), [NN/g](https://www.nngroup.com/videos/empty-states-in-application-design-guidelines/)).

**Cómo adaptarlo:** una sola explicación por pantalla. El resto se va a los "¿?" que ya existen.

### F10. Detalles menores
- **Número que no cuadra:** el carrusel del Muro dice "Tienes **15** beneficios de estudiante…" (captura 01) y Beneficios dice "**18** beneficios para ti" (captura 04). Hay una razón: el carrusel excluye los 3 "gratis para todos" (`Muro.jsx`, línea 113). Para quien lee, es una contradicción. Usa la misma cifra o di "15 solo por ser estudiante".
- **Degradado escondido:** `.sticky` usa `linear-gradient(to top, var(--app-bg) 70%, transparent)` (`app.css`, línea 50). El spec prohíbe los degradados. Cámbialo por fondo Niebla sólido con borde superior de 1 px `var(--line)`.
- **El ritmo Blanco/Tinta se perdió:** AGENTS.md describe la interfaz "Bloques · Vínculo" con tarjetas del Muro que alternan Blanco y Tinta, pero en esta rama todas las publicaciones son Blancas (capturas 02 y 03). Era justo el cambio de ritmo que le falta al Muro (punto 2 de la sección 3). Hay que confirmar si se quitó a propósito al compactar el muro.
- **Etiqueta "Ejemplo" en el carnet de Sara (captura 11):** el estado del carnet dice "Ejemplo" en lugar de "Activa · DCV". Está bien que se marque, no lo quites. **Criterio:** visualmente parece un error y no una etiqueta. Usa la misma pastilla `.ejemplo` del resto de la app.
- **Publicación de prueba en producción:** "servicio de redes sociales" (perfil `jhon`, real) es lo primero del Muro (captura 02) y es un texto de 4 palabras en minúscula. **No es un problema de diseño**, pero es lo primero que ve cualquiera. Considera borrarla antes de mostrar la app.

---

## 3. Lo que hacen las referencias, punto por punto

| Punto | Qué hacen (hecho, con fuente) | Qué está haciendo Colmena |
|---|---|---|
| 1. Jerarquía | Instagram quitó color y ruido de las superficies de contenido y dejó el color para lo que necesita atención ([MarTech](https://martech.org/instagram-redesigned-logo-mobile-apps)). | Polen en cada tarjeta (F4). Titular institucional antes del contenido (F1). |
| 2. Densidad y ritmo | TikTok evita mostrar seguidos dos videos del mismo creador o del mismo sonido, y mezcla contenido variado ([TikTok Newsroom](https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you/)). Instagram Stories pone una tira horizontal de piezas cortas sobre el feed vertical ([Instagram](https://about.instagram.com/blog/announcements/introducing-instagram-stories)). | Todas las tarjetas del Muro tienen el mismo molde y el mismo peso. El carrusel es el único cambio de ritmo y está antes del contenido. |
| 3. Contenido protagonista | Behance: portada de tamaño único, sin texto, que represente el proyecto ([Behance Help](https://help.behance.net/hc/en-us/articles/204483484-What-is-a-Cover-Image-), [Behance Blog](https://www.behance.net/blog/how-to-get-featured-on-behance)). Facebook: sin foto, texto corto grande y fondos de color ([TechCrunch](https://techcrunch.com/2016/12/19/facebook-status-background-color/)). | Cero imágenes. Las portadas son una letra (F3). |
| 4. Descubrimiento | Behance: más de 100 galerías curadas y bandera "Featured" ([Behance Help](https://help.behance.net/hc/en-us/articles/204484044-Guide-Discover-Creative-Work-on-Behance)). Instagram: Colecciones privadas para guardar ([TechCrunch](https://techcrunch.com/2017/04/17/instagram-now-lets-you-organize-bookmarks-into-private-collections/)). Explore de Instagram: cientos de millones de personas lo visitan cada día ([Engineering at Meta](https://engineering.fb.com/2023/08/09/ml-applications/scaling-instagram-explore-recommendations-system/)). | Filas por categoría bien planteadas, pero sin curaduría ("lo que más sirve para tu marca"), sin guardar y sin "nuevo" (F5). |
| 5. Microinteracciones | Límites de 0,1 s / 1 s / 10 s ([NN/g](https://www.nngroup.com/videos/3-response-time-limits-interaction-design/)). Esqueletos de carga ([NN/g](https://nngroup.com/articles/skeleton-screens/)). Shimmer de Facebook ([GitHub](https://awesome.ecosyste.ms/projects/github.com%2Ffacebook%2FShimmer)). Reacciones de Facebook animadas e iteradas ([Motionographer](https://motionographer.com/2016/02/25/the-key-to-facebook-reactions-animation-of-course/)). | Hexágono solo al cargar. "Útil" espera al servidor (F7). |
| 6. Navegación | Barra inferior siempre visible con secciones de primer nivel ([Apple HIG](https://developer.apple.com/design/human-interface-guidelines/tab-bars)). De 3 a 5 destinos con etiqueta ([M3 vía SAP](https://www.sap.com/design-system/fiori-design-android/v26-4/components/m3-standard-components/navigation-bar/usage)). | 5 destinos (bien) pero sin etiquetas, y un título fijo que roba espacio (F2, F8). |
| 7. Tipografía e íconos | Instagram creó Instagram Sans con estilos Regular, Headline y Condensed ([Instagram](https://about.instagram.com/blog/announcements/instagram-visual-refresh), [Creative Boom](https://www.creativeboom.com/news/instagram-reveals-its-first-brand-refresh-in-10-years-with-a-new-wordmark-and-three-typefaces/)). TikTok tiene su propia tipografía variable, TikTok Sans, con ejes de peso, ancho, inclinación y tamaño óptico, liberada en 2025 ([TikTok for Developers](https://developers.tiktok.com/blog/tiktok-sans-open-source), [Type Network](https://typenetwork.com/articles/tiktok-sans-open-source-case-study)). **Criterio:** las dos tienen una voz tipográfica de display muy reconocible y un cuerpo neutro, como Colmena. | Space Grotesk + Hanken Grotesk está bien. El problema no es la fuente sino la escala: casi todo cae entre 15 y 19 px, y faltan saltos grandes de tamaño que marquen qué es lo importante. |
| 8. Gamificación | Instagram dejó opcional esconder los "me gusta" para bajar la presión ([Meta](https://about.fb.com/news/2021/05/giving-people-more-control/)). TikTok probó rachas con llama y conteo de días ([htxt](https://htxt.co.za/2024/06/tiktok-testing-streaks-to-boost-engagement)). Behance: "Apreciar" notifica a los seguidores ([Behance Help](https://help.behance.net/hc/en-us/articles/204484044-Guide-Discover-Creative-Work-on-Behance)). | Niveles e insignias bien pensados ("tu celda se va cerrando" es una gran metáfora), pero se ven grises y todos tienen el mismo nivel (F6). |

---

## 4. Las 5 mejoras con más impacto y menos esfuerzo

Están ordenadas por impacto/esfuerzo. Todas respetan los tokens actuales (no hay que tocar `tokens.css`) y **ninguna** requiere columnas ni llamadas nuevas a Supabase. Cada una indica cómo comprobarla con Playwright a 390 × 844.

### M1. Muro: el contenido sube a la primera pantalla
**Archivos:** `src/screens/Muro.jsx` (componentes `Muro`, `Movimiento` y `AvisoPrueba`), `src/screens/Onboarding.jsx` (`PrimerosPasos`), `src/styles/app.css`.

**Estructura nueva del `.body` del Muro, de arriba abajo:**
1. **Compositor** (`.composer`): 56 px de alto, radio 16 px, Polen, texto Hanken 600 16 px ("¿Qué necesitas o qué ofreces?") y botón `+` de 40 px en Tinta. Es lo primero del `.body`.
2. **Fila de estado** (nuevo componente `FilaPasos` dentro de `PrimerosPasos`): 56 px de alto, fondo Blanco, radio 16 px.
   - A la izquierda, la celda de nivel en miniatura (24 × 26) y el texto "2 de 4 · Responde una publicación" (Hanken 600 15 px).
   - A la derecha, un chevron.
   - Al tocarla se abre la hoja de pasos que ya existe.
   - Si el aviso de prueba no se ha cerrado, se muestra como prefijo dentro de la misma fila (pastilla "Prueba"). Se elimina el bloque `AvisoPrueba` aparte.
   - Cuando los 4 pasos están completos, la fila desaparece.
3. **Pestañas** `Todo / Piden ayuda / Ofrecen` + "Filtrar": se mantienen, pero el `h3` "El muro" desaparece, porque ya estás en el Muro.
4. **Publicaciones.** Después de la **tercera** publicación (o al final, si hay menos de 3) se inserta `Movimiento` (el carrusel "Esta semana"). En esa posición las tarjetas miden 148 px de alto, en vez de las ~300 actuales.
5. **Titular y párrafo:** se renderizan solo si `!introVista()` o cuando `teNecesitan.length > 0`. Este último es el titular útil ("3 personas necesitan lo que sabes hacer") y debe quedarse, a 28 px y no a 38.

**Estados:**
- Cargando: esqueleto (ver M5 de "Después").
- Vacío: el `Empty` actual.
- Con filtro activo: la fila de estado se esconde.

**Criterio de éxito:** a 390 × 844 como visitante, `document.querySelector('.posts > article').getBoundingClientRect().top` es menor o igual a 300 px. Hoy está alrededor de 1.160 px.

### M2. Cabecera que se va con el contenido
**Archivos:** `src/components/ui.jsx` (`Header`), las pantallas que lo usan (`Miembros.jsx`, `Encuentro.jsx`, `MiCarnet.jsx` y `Herramientas.jsx`/`Beneficios.jsx`), `src/screens/Carnet.jsx` y `src/styles/app.css` (`.apphead`, `.sticky`, `.body.with-sticky`).

**Cambios:**
- `Header` solo renderiza `BrandHeader`, que queda fijo con 56 px de alto y padding 8/16.
- El título pasa a ser el primer hijo de `.body`, como `<h1 className="ptitle">`: Space Grotesk 700, 30 px, interlineado 1,05, tracking −0,04 em, margen inferior 4 px. Desaparece al hacer scroll.
- Se eliminan los `sub` que repiten información:
  - Miembros: "Busca por nombre o habilidad".
  - Beneficios: "Descuentos, aliados…".
  - Encuentro: se puede dejar en 14 px.
- Opcional, siguiente iteración: cuando `.body.scrollTop > 48`, `BrandHeader` muestra el nombre de la pestaña en Hanken 600 16 px junto al logo, con un fade de 150 ms y sin animación si hay `prefers-reduced-motion`.
- **Carnet de otra persona:** `.sticky` pasa a fondo `var(--app-bg)` sólido, sin degradado, con `border-top: 1px solid var(--line)` y padding 8/16. El botón mide 52 px de alto. `.body.with-sticky` cambia su `padding-bottom` a `calc(76px + 68px + 16px + safe-area)`, para que la sección Insignias se pueda leer completa.

**Criterio de éxito:** en Beneficios, Miembros y Encuentro, el top de `.body` es menor o igual a 64 px. En el carnet de ejemplo, al final del scroll, la última fila de insignias queda completa por encima del botón fijo.

### M3. Beneficios: portada tipográfica y una tienda que se puede recorrer
**Archivos:** `src/screens/Beneficios.jsx` (`SeccionBeneficios`, `Tile`), `src/styles/app.css` (`.ben-hero`, `.bdest*`, `.btile*`, `.bgrid`).

**1. Hero:**
- Se elimina `.ben-hero` (el bloque de estadísticas).
- Debajo del título queda una línea Hanken 400 15 px en `var(--muted)`: "**13 gratis** y 5 con descuento con tu correo Javeriana". Las cifras van en Hanken 600 Tinta y salen de los datos.

**2. Destacados** (`.bdest`):
- Ancho `flex: 0 0 86%`, min-height 232 px, radio 22 px, padding 20 px.
- Orden interno:
  1. Categoría: etiqueta 12 px en mayúsculas.
  2. **Nombre**: Space Grotesk 700, 30 px, interlineado 1,05.
  3. Oferta: Hanken 400 15 px.
  4. Sello del valor: `etiqueta` en Space Grotesk 700 20 px. Sobre tarjeta Tinta el sello va con fondo Polen y texto Tinta; sobre tarjeta Polen, con fondo Tinta y texto Polen. Radio 10 px, padding 6/10, alineado arriba a la derecha.
  5. "Cómo obtenerlo →" abajo.
- Retícula de panal (`Comb`, que ya existe en `ui.jsx`) en la esquina inferior derecha: 120 × 120 px, trazo 1,5 px. Opacidad 0,10 sobre Polen y 0,16 en blanco sobre Tinta.
- **Orden de los destacados (criterio):** Suite de Adobe, Dominio web, Framer, Microsoft 365, Spotify. Hoy el orden lo da `orden` en la base. Si no se quiere tocar datos, el componente puede ordenar por una lista fija de ids, aunque lo ideal es ajustar `orden` en Supabase (pídeselo a Claude/Jhon).

**3. Tile** (`.btile`):
- 156 × 208 px.
- **Portada** (`.btile-cov`) de 112 px de alto, cuyo contenido principal es **el valor**: `b.etiqueta` en Space Grotesk 700, 28 px, interlineado 1, máximo 2 líneas, alineado abajo a la izquierda. Con más de 10 caracteres ("PRECIO ESTUDIANTE"), 20 px.
- Se quita `.btile-l`, la letra en hexágono.
- Arriba a la derecha va el ícono de categoría de 18 px (`Diseño` → `spark`, `Web` → `link`, `Productividad` → `note`, `Audio y video` → `clock`, `Equipos` → `bag`, aliados → `pin`).
- La portada alterna Tinta (valor en Polen) y Blanco con borde 1 px `var(--line)` (valor en Tinta). **Polen solo si `b.destacado`.**
- Cuerpo: nombre en Space Grotesk 700 16 px y oferta en Hanken 13 px, máximo 2 líneas.
- Se elimina el pie "PARA ESTUDIANTES". Solo se muestra "Gratis para todos" cuando `b.para_todos`, y para aliados la zona + `Ejemplo`, igual que hoy.
- Se elimina `.bet`, porque el valor ya es la portada.

**4. Filtro:** con `filtro === 'gratis'`, la portada muestra `b.oferta` resumida en vez de "GRATIS". Así no se repite la misma palabra 13 veces.

**5. Guardar en este dispositivo:**
- En `Detalle` se agrega `Guardar` (ícono `star`) y `Ya lo activé` (ícono `check`), guardados en `localStorage` con la clave `colmena.beneficios.v1 = { guardados: [ids], activados: [ids] }`. Todo dentro de try/catch.
- Se agrega un chip de filtro "Guardados" que solo aparece si hay alguno.
- Al activar, la tile muestra una marca `check` Verde de 20 px en la portada. Verde es correcto aquí porque comunica un estado: "confirmado".

**Estados:**
- Sin resultados: el `Empty` actual.
- Sin `localStorage`: los botones funcionan solo durante la sesión, sin error.

**Criterio de éxito:** a 390 × 844, la primera pantalla de Beneficios muestra el destacado completo y el inicio de la primera fila. En la captura con el filtro "Gratis", la palabra "GRATIS" aparece como mucho una vez, en el chip.

> **Pendiente para datos (no se programa aquí):** para fotos reales de producto en publicaciones o de portafolio en perfiles hace falta una columna `imagen_url` y almacenamiento. Anotarlo en `TODO-AGENTES.md` para que Claude lo diseñe con RPC, como dice AGENTS.md.

### M4. Un solo Polen por pantalla en el Muro
**Archivos:** `src/screens/Muro.jsx` (`Post`), `src/App.jsx` (`headerRight` del visitante), `src/styles/app.css` (`.post-foot .btn`, `.vence`, `.enter`).

**Cambios:**
- **Botón de la publicación** ("Puedo ayudar" / "Me interesa"):
  - Pasa de `btn primary` a `btn dark`: fondo Tinta, texto Blanco, ícono WhatsApp en Blanco.
  - Alto 44 px, padding 0/18, radio 999.
  - En las tarjetas Tinta del patrón alternado de `design-qa.md`, si existen, el botón es Blanco con texto Tinta.
- **`.vence`** ("Quedan 9 h"): sin fondo Polen. JetBrains Mono 500 13 px en `var(--muted)` con el ícono `hour` de 13 px. **Excepción:** si quedan menos de 3 h, texto Tinta 600. Sigue sin Polen.
- **`.enter`** ("Crear carnet" del visitante en la cabecera): fondo transparente y `box-shadow: inset 0 0 0 1.5px var(--ink)`. El compositor queda como la única acción Polen arriba.
- **"Útil"**: sin cambios de color. Cuando está marcado (`aria-pressed=true`), fondo Tinta y texto Blanco.

**Criterio de éxito:** en la captura del Muro a la altura de las publicaciones (equivalente a la 02), los únicos elementos Polen visibles son la pestaña activa de la navegación y, si se ve, el compositor.

### M5. El carnet como gancho: vista previa para el visitante y siguiente insignia clara
**Archivos:** `src/screens/MiCarnet.jsx`, `src/components/Nivel.jsx`, `src/screens/Miembros.jsx`, `src/styles/app.css` (`.celda-nivel`, `.nivel-card`, `.m-nv`, insignias).

**1. Mi carnet sin sesión** (captura 16):
- En lugar del `Empty`, se renderiza el mismo componente de carnet Polen de la captura 11, en modo "fantasma":
  - Nombre: "Tu nombre".
  - Línea de marca: "Tu emprendimiento · Lo que haces".
  - Número: "COL-····" en JetBrains Mono.
  - Estado: "Por crear".
  - Avatar: hexágono Tinta con un `+` en Polen.
- Debajo: botón Polen de ancho completo y 52 px de alto, "Crear mi carnet", y una línea Hanken 14 px "Toma menos de un minuto".
- No es un dato inventado: es una vista previa con marcadores que se notan como tales.

**2. Tarjeta de nivel** (`.nivel-card`):
- La celda de nivel crece a 72 × 80.
- Los lados ganados van en Tinta con trazo de 10. Los no ganados, en `var(--line)` y no gris claro.
- El texto principal pasa de "0 puntos · te faltan 3…" a la **próxima acción concreta**: "Responde una publicación y sumas 1 punto".

**3. Insignias:**
- Se muestran las ganadas (Polen) y **una sola** siguiente: contorno Tinta de 2 px, sin relleno, con el texto de cómo ganarla.
- Las demás se agrupan en un enlace "Ver las 8 insignias" que abre una `Sheet`.
- Al ganar una insignia nueva (comparar con la última lista vista, guardada en `localStorage`), la celda pasa de contorno a Polen. La transición es `clip-path`/`opacity` de 300 ms, una sola vez. Con `prefers-reduced-motion: reduce` no hay animación.

**4. Miembros:** si todos los perfiles visibles tienen el mismo nivel, no se pinta `.m-nv`. "1 ayuda dada" se mantiene, porque es información real y diferencia a las personas.

**Criterio de éxito:** la captura de Mi carnet sin sesión muestra el carnet Polen en la primera pantalla. Con sesión, se ven como mucho 3 hexágonos de insignia antes del enlace.

### Después de estas 5 (siguiente tanda)
- **Esqueleto de carga** (F7): en `App.jsx`, reemplazar `.loading` por 3 tarjetas de esqueleto en bloques planos con pulso de opacidad.
- **"Útil" optimista** (F7).
- **Etiquetas en la navegación** e ícono nuevo para Beneficios (F8).
- **Publicaciones cortas en grande**, al estilo de los estados cortos de Facebook: si `titular.length <= 60` y no hay cuerpo, `.post-lead` sube a 24 px.
- **Unificar la cifra de beneficios y quitar el degradado** de `.sticky` (F10).

---

## 5. Qué NO copiar de esas apps, y por qué

1. **Scroll infinito.** Su propio inventor, Aza Raskin, ha dicho públicamente que se arrepiente por lo que hizo con la atención de la gente ([Masters of Scale](https://mastersofscale.com/video/he-invented-infinite-scroll-and-says-he-regrets-it/), [TED / Adam Grant](https://www.ted.com/podcasts/rethinking-with-adam-grant/aza-raskin-on-why-technology-and-democracy-are-in-an-imagination-crisis-transcript)). NN/g también lo desaconseja cuando la persona busca algo concreto ([NN/g](https://www.nngroup.com/videos/infinite-scrolling-when/)). Colmena es una herramienta para **encontrar ayuda**, no para pasar el rato. El Muro debe terminar, y ya termina con "Las publicaciones se ocultan solas cuando vencen". Lo que sí vale la pena tomar: Instagram añadió el aviso "Ya viste todo" cuando terminas lo nuevo de los últimos dos días ([Instagram](https://about.instagram.com/blog/announcements/introducing-youre-all-caught-up-in-feed)). Colmena podría cerrar el Muro con "Viste todo lo de esta semana. ¿Publicas algo?".
2. **Rachas que se pierden.** La racha de TikTok se rompe si pasan 24 horas sin mensajes ([htxt](https://htxt.co.za/2024/06/tiktok-testing-streaks-to-boost-engagement)). En una comunidad de estudiantes con parciales, castigar la ausencia va contra "caluroso" y contra la promesa "deja de estar solo". El panal semanal de Colmena ya es una versión **colectiva** que se reinicia sin culpar a nadie. Hay que mantenerlo así.
3. **Conteos que comparan personas en público.** Instagram tuvo que dejar opcional esconder los "me gusta" para bajar la presión ([Meta](https://about.fb.com/news/2021/05/giving-people-more-control/)). En Colmena no mostraría rankings de miembros ni "el más útil". Los niveles deberían ser algo privado o de progreso propio, y en el directorio mostrar lo que la persona **hace**.
4. **Notificaciones agresivas y avisos para volver.** TikTok tuvo que poner un límite de 60 minutos por defecto para menores de 18 y avisos de "tómate un descanso" ([KTVZ/CNN](https://ktvz.com/lifestyle/technology/cnn-social-media-technology/2023/03/01/tiktok-to-set-one-hour-daily-screen-time-limit-by-default-for-users-under-18/)). Colmena solo debería avisar cuando **alguien te escribió o confirmó tu ayuda**, que es lo que ya hace la campana.
5. **Recomendación algorítmica opaca.** TikTok y Explore deciden con modelos de aprendizaje automático que cambian todo el tiempo ([Meta Transparency](https://transparency.meta.com/features/explaining-ranking/ig-explore/)). Con 9 perfiles, ordenar por algoritmo no aporta y quita confianza. Un orden cronológico más la curaduría humana al estilo de Behance encaja mejor con la escala y con el tono de "par".
6. **Degradados y brillos.** El famoso degradado de Instagram y el *shimmer* con degradado de Facebook chocan con la regla de colores planos. El esqueleto de carga de Colmena debe pulsar con opacidad, no con degradado.

---

## 6. Fuentes

Todas consultadas a través de la búsqueda web el 4 de noviembre de 2026. Las páginas no se abrieron directamente porque la red del entorno bloquea WebFetch (ver sección 0).

**Instagram / Meta**
- Rediseño 2016 (explicación de Ian Spalter): https://martech.org/instagram-redesigned-logo-mobile-apps · https://techcrunch.com/?p=1320494
- Introducing Instagram Stories: https://about.instagram.com/blog/announcements/introducing-instagram-stories
- Collections (2017): https://techcrunch.com/2017/04/17/instagram-now-lets-you-organize-bookmarks-into-private-collections/ · https://9to5mac.com/2017/04/17/instagram-save-posts-private-collections-folders/
- "You're All Caught Up": https://about.instagram.com/blog/announcements/introducing-youre-all-caught-up-in-feed
- Visual refresh e Instagram Sans (2022): https://about.instagram.com/blog/announcements/instagram-visual-refresh · https://www.creativeboom.com/news/instagram-reveals-its-first-brand-refresh-in-10-years-with-a-new-wordmark-and-three-typefaces/
- Esconder conteo de "me gusta": https://about.fb.com/news/2021/05/giving-people-more-control/
- Explore: https://engineering.fb.com/2023/08/09/ml-applications/scaling-instagram-explore-recommendations-system/ · https://transparency.meta.com/features/explaining-ranking/ig-explore/

**Facebook**
- Fondos de color y texto grande en estados: https://techcrunch.com/2016/12/19/facebook-status-background-color/ · https://www.pocket-lint.com/apps/news/facebook/139777-here-s-how-to-make-your-facebook-posts-colourful
- Diseño de Reacciones: https://www.csmonitor.com/Technology/2016/0224/How-Facebook-narrowed-range-of-human-emotions-down-to-six-reactions · https://motionographer.com/2016/02/25/the-key-to-facebook-reactions-animation-of-course/
- Shimmer: https://awesome.ecosyste.ms/projects/github.com%2Ffacebook%2FShimmer

**TikTok**
- Cómo recomienda "Para ti": https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you/
- TikTok Sans: https://developers.tiktok.com/blog/tiktok-sans-open-source · https://typenetwork.com/articles/tiktok-sans-open-source-case-study
- Rachas (prueba 2024): https://htxt.co.za/2024/06/tiktok-testing-streaks-to-boost-engagement · https://tribune.com.pk/story/2470572/entertainment
- Límite de 60 minutos: https://ktvz.com/lifestyle/technology/cnn-social-media-technology/2023/03/01/tiktok-to-set-one-hour-daily-screen-time-limit-by-default-for-users-under-18/

**Behance**
- Cover images: https://help.behance.net/hc/en-us/articles/204483484-What-is-a-Cover-Image-
- Discover y galerías curadas: https://help.behance.net/hc/en-us/articles/204484044-Guide-Discover-Creative-Work-on-Behance
- Cómo ser destacado: https://www.behance.net/blog/how-to-get-featured-on-behance
- Filosofía de curaduría: https://medium.com/behance-blog/behance-curation-philosophy-and-approach-6e0ae9ab350f

**Guías y usabilidad**
- Apple HIG, Tab bars: https://developer.apple.com/design/human-interface-guidelines/tab-bars
- Material 3 Navigation bar (resumen vía SAP Fiori): https://www.sap.com/design-system/fiori-design-android/v26-4/components/m3-standard-components/navigation-bar/usage
- Material 3 carousel research: https://m2.material.io/blog/material-3-carousel-research-design
- NN/g, Skeleton screens: https://nngroup.com/articles/skeleton-screens/ · https://www.nngroup.com/videos/skeleton-screens-vs-progress-bars-vs-spinners/
- NN/g, Response time limits: https://www.nngroup.com/videos/3-response-time-limits-interaction-design/
- NN/g, Mobile carousels: https://www.nngroup.com/articles/mobile-carousels/
- NN/g, Infinite scrolling: https://www.nngroup.com/videos/infinite-scrolling-when/
- NN/g, Empty states: https://www.nngroup.com/videos/empty-states-in-application-design-guidelines/ · resumen: https://vp0.com/blogs/designing-ios-empty-states-that-feel-intentional
- Aza Raskin sobre el scroll infinito: https://mastersofscale.com/video/he-invented-infinite-scroll-and-says-he-regrets-it/ · https://www.ted.com/podcasts/rethinking-with-adam-grant/aza-raskin-on-why-technology-and-democracy-are-in-an-imagination-crisis-transcript
