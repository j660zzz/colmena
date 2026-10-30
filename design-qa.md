# Colmena · Bloques / Vínculo · revisión de implementación

**final result: passed**

Fecha: 30 de octubre de 2026. Rama: `diseno/rediseno-ui`. Base de implementación: `7fe78ed`.

## Fuente y captura

- Diseño elegido: `mockups/rediseno-ui/ronda-2.html`, variante `vinculo`. Fuente visual reproducible: `muro.html?estilo=vinculo` y `variantes.css`.
- Marca: archivos del usuario `D:/colmena-brand-spec.md` y `D:/colmena-tokens.json` v2.0.
- Referencia capturada: `docs/qa/bloques-vinculo/referencia-390.png`.
- Implementación de producción capturada: `docs/qa/bloques-vinculo/produccion-390.png`.
- Comparación completa: `docs/qa/bloques-vinculo/comparacion-final.png` (referencia izquierda, app derecha).
- Comparación de autor, texto, etiquetas y acción: `docs/qa/bloques-vinculo/comparacion-detalle.png`.
- Viewport: **390 × 844 CSS px**, vista de visitante, Muro sin filtros, misma primera publicación de Sara Ospina. Capturas a escala CSS; se recortó únicamente el píxel adicional por redondeo de densidad del navegador a 390 × 844. No se estiró la interfaz. Comparación completa: 780 × 844; detalle: 716 × 374.
- Se inspeccionaron juntas ambas imágenes, además del detalle legible. Las capturas finales usan `127.0.0.1`, con escala de página 100%; se descartaron capturas preliminares de localhost afectadas por el zoom preexistente del navegador.

## Superficies de fidelidad

1. **Tipografía:** Space Grotesk 700 a 44 px en apertura y 23/1.16 en publicaciones; Hanken Grotesk 400/600 en interfaz. Coinciden los saltos de línea del primer aporte. Space 600 para cifras destacadas y JetBrains Mono 500 para carnet/calculadora. Se retiraron importaciones de pesos no especificados.
2. **Espaciado y composición:** marca, apertura, compositor, primera tarjeta, autor y acción conservan las posiciones del mockup; primer bloque comienza cerca de y=280. Márgenes 16/24, tarjetas 20, navegación flotante y espacio de scroll suficiente para llegar al último control.
3. **Color:** la capa visual utiliza los cinco colores de marca. Necesito en contorno Tinta, Ofrezco y confirmaciones en Verde; Polen en acción principal, destino activo, avatares e insignias y en el carnet como pieza de marca. No se modificó tokens.css ni se usan sus neutros adicionales en la nueva CSS. No hay degradados.
4. **Activos:** celda oficial idéntica al SVG suministrado, avatares hexagonales del sistema, iconos existentes y fuentes locales. Iconos PWA generados desde el SVG oficial; no se interpretó o redibujó la celda. El símbolo mantiene 84:94 y ocupa 58% del lado del icono en altura.
5. **Contenido:** los seis perfiles de ejemplo y publicaciones del Muro se leen de Supabase en producción. No se sustituyen por el snapshot de los mockups. Se mantiene Ejemplo en Muro, directorio, carnet, bienvenida, ayudantes y nombres de asistentes de muestra.

## Diferencias intencionales

- Se conserva la funcionalidad existente de categorías mediante **Filtrar** junto al selector de tipo; no agrega altura al primer bloque.
- Las fechas usan el tiempo relativo existente de Colmena en vez de la fecha fija del mockup.
- Los contadores de respuestas se muestran cuando hay respuestas reales; los botones propios y confirmados siguen usando el estado existente.
- Los otros destinos reciben el mismo sistema visual, sin inventar pantallas, chats, actividad o campos de datos.

## Revisión e iteraciones

Un revisor independiente examinó el diff y reportó tres P2. Se reprodujeron antes de corregirlos:

| Hallazgo | Evidencia anterior | Corrección y comprobación |
|---|---|---|
| Error de publicar fuera del diálogo nativo | El modal seguía abierto, con cero alertas internas y un toast fuera del top layer. | Error local `role=alert` dentro de Composer, texto conservado y reintento exitoso. Prueba interceptada RED→GREEN; captura `error-publicar-fixture.png`. |
| Foco invisible en superficies contrastadas | Outline Blanco sobre tarjeta Blanca, e inversión equivalente en Tinta. | Anillo doble Tinta/Blanco. La prueba verifica `:focus-visible`, outline Tinta y anillo Blanco. |
| Primer nombre largo desbordaba la bienvenida | Nombre de 60 caracteres: x=-119 a x=377 en viewport de 320. | Retícula de tres columnas, `max-width:100%` y `overflow-wrap:anywhere`. Nombre contenido en su columna; captura `bienvenida-nombre-largo.png`. |

Sin P0/P1/P2 pendientes. No se difieren hallazgos menores del revisor. La búsqueda también tiene un botón de limpiar de 44 × 44 con icono Tinta, que devuelve el foco al campo y evita el control nativo coloreado y pequeño.

## Comprobaciones ejecutadas

- Muro: filtros 3 Necesito / 3 Ofrezco / 2 Video en datos públicos; respuesta de visitante abre creación de carnet.
- Todos los destinos a 390 × 844, y controles persistentes en 320 × 844 y escritorio 1440 × 1024: sin desbordamiento horizontal, botones/enlaces/summary visibles ≥44 px.
- Directorio: búsqueda por habilidad, sin resultados y limpiar búsqueda (de 1 resultado de reels a 6; foco vuelve al campo).
- Carnet de ejemplo y enlace directo `?carnet=...`; bienvenida con tres etiquetas Ejemplo.
- Seis fichas, calculadora con actualización de cifras y restauración del valor modificado.
- Creación de carnet: botón deshabilitado sin consentimiento y regreso a la app tras enviar, con RPC totalmente interceptado.
- Suite autenticada `docs/qa/bloques-vinculo/check-signed.playwright.js`: **16/16**. Texto de 500 caracteres, nombres largos, publicación vacía, foco modal, error/reintento, ayudantes Ejemplo, Escape/restauración de foco, responder, conectar, asistencia, edición y último botón sobre navegación.
- Los escenarios autenticados usan contexto aislado, sesión ficticia y todos los REST/RPC interceptados: **cero escrituras de prueba a Supabase**.
- Navegación nativa del diálogo y `prefers-reduced-motion` comprobados en navegador.
- `npm run icons` y `npm run build`: exit 0. Manifest Niebla, PNG 192/512/512/180 y service worker generados. Build servido en `http://127.0.0.1:4173/`: seis publicaciones y seis etiquetas Ejemplo, fuentes cargadas y cero errores de runtime.
- `git diff --check` correcto; sin diff en `src/lib/*`, `supabase/*`, `src/data/contenido.js` y `src/styles/tokens.css`.

## Alcance de la validación

No se instaló la PWA en un teléfono físico ni se probó el teclado o lector de pantalla nativo de iOS/Android. Las escrituras reales mantienen las RPC originales y no fueron ejercitadas contra producción. No se fusionó ni se hizo push o despliegue.
