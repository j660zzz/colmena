# Bitácora de Colmena

Registro de lo que se decidió y se construyó, para que cualquier persona o agente que empiece una sesión nueva tenga el contexto correcto. Va de lo más reciente a lo más antiguo. Léelo junto con `AGENTS.md` (reglas) y `TODO-AGENTES.md` (pendientes).

## Dónde está todo
| Qué | Dónde |
|---|---|
| App publicada | https://somoscolmena.app (dominio propio desde el 5 de noviembre de 2026; también responde https://colmena-dcv.netlify.app). Netlify, proyecto `colmena-dcv`, se publica sola desde `main` |
| Repositorio | https://github.com/j660zzz/colmena (público) |
| Base de datos | Supabase, proyecto `colmena` (`gajqknhwlwvgjeionfmo`, São Paulo). **Producción y versiones de prueba comparten la misma base**: cualquier migración queda en vivo al aplicarla |
| Versiones de prueba | Netlify solo genera `deploy-preview-N--colmena-dcv.netlify.app` para PR cuya base es `main`. El enlace permanente de cada versión es `<id-del-deploy>--colmena-dcv.netlify.app` |
| Marca | `docs/marca/colmena-brand-spec.md` (manda sobre todo lo demás) |

## 5 de noviembre de 2026 · Métricas de validación del OE3 (DeepSeek)

Ramas `validacion/metricas` (definiciones) y `validacion/reporte` (reporte, pruebas, workflow y propuesta). **No fusionadas ni publicadas:** Jhon revisa y da el "sube".

- `docs/validacion/metricas.md` define activación, muro, conexión real, comunidad, retención y calidad; usa la semana de lunes a domingo en `America/Bogota`; fija la regla de `menos de 3` y dice qué no se puede medir con los datos actuales.
- `src/lib/metricas.js` concentra el cálculo puro y `tests/metricas.test.js` lo cubre con 19 pruebas: cero datos, solo ejemplo, mezcla real y ejemplo, publicaciones sin respuesta, confirmación tardía, cambio de semana en hora de Colombia, cohortes y supresión de grupos pequeños.
- `scripts/metricas.mjs` lee con la llave publicable y no pide nombres, textos de publicaciones ni comentarios de reseñas. Escribe `docs/validacion/reporte-AAAA-MM-DD.md` y `.csv`; se corre con `npm run metricas`.
- `.github/workflows/metricas.yml` se puede lanzar a mano y corre los lunes a las 7 a. m. de Colombia. Deja el `.md` y el `.csv` como artefacto descargable; no hace commit ni push.
- Reporte del 5 de noviembre: 0 datos reales, 8 carnets y 10 publicaciones de ejemplo. Lo real y lo de ejemplo van separados; si no hay reales, el reporte lo dice en vez de mostrar ceros que confundan.
- Propuesta sin aplicar en `supabase/migraciones/20261105_metricas_propuesta.sql`: índices, `metricas_semanales()`, `retencion_cohortes()`, tabla `eventos` con `registrar_evento()` y `resumen_eventos()`. No se aplicó nada ni se escribió en Supabase.
- La pantalla interna de cifras no se construyó: queda a decisión de Jhon después de ver el reporte.
- Verificado: `npm run build`, las 33 pruebas del repo, `npm run metricas` y revisión del `.md` y el `.csv` sin UUID, correos ni nombres.
- **Pendiente de Jhon:** aprobar las definiciones, confirmar el umbral de 3, decidir si aplica la propuesta y si quiere la pantalla interna.

## 5 de noviembre de 2026 · Proyectos en el carnet (Claude)

Por pedido de Jhon (eligió proyectos para todos y portadas de marca). Migración `20261105_proyectos.sql` **aplicada**: tabla `proyectos`, RPC `guardar_proyecto` y `borrar_proyecto` (máximo 4 por miembro), 20 proyectos de ejemplo y bios y habilidades más completas en los 8 perfiles de ejemplo. Carnet con sección "Proyectos" y editor en "Editar carnet". Detalle en `docs/proyectos/README.md`. Pendiente de Jhon: fotos reales subidas (almacenamiento y moderación).

## 5 de noviembre de 2026 · Dominio propio en la vista previa (Claude)

`somoscolmena.app` ya sirve la app (certificado emitido el 4 de noviembre a las 23:59 UTC) pero WhatsApp no mostraba vista previa: probablemente se guardó en caché antes de que el dominio estuviera listo, y las etiquetas apuntaban a `colmena-dcv.netlify.app`. Ahora `og:url`, `canonical` y la imagen usan `somoscolmena.app` (imagen con `?v=2` para forzar una lectura nueva). **Pendiente de Jhon:** agregar `https://somoscolmena.app` en Supabase → Authentication → URL Configuration (Site URL y Redirect URLs) para que "Guardar con correo Javeriana" funcione también desde el dominio nuevo; ver `docs/cuenta/README.md`.

## 4 de noviembre de 2026 · Vista previa al compartir el link (Claude)

Rama `diseno/vista-previa`. Etiquetas Open Graph y de Twitter en `index.html` con imagen `public/og-colmena.png` (1200 × 630, Polen plano con el símbolo y "Tu comunidad para emprender" en Tinta, centrada para el recorte cuadrado de WhatsApp). Se genera con `node scripts/og-imagen.cjs`. Se quitó "Diseño de Comunicación Visual" de la descripción de la página y del manifiesto. WhatsApp guarda en caché la vista previa de cada link: para ver la nueva en un link ya compartido, agregarle algo al final (por ejemplo `?v=2`). Pendiente opcional: vista previa propia por publicación (`?publicacion=`) con una función de Netlify que lea Supabase.

## 4 de noviembre de 2026 · Íconos de manos y celda unificada (Claude)

Rama `diseno/iconos-manos` (PR #12). Por pedido de Jhon: Intercambia pasa a ser la moneda con flechas (pareja de Cobra), Necesito queda con tres dedos y pulgar, y todos los hexágonos con trazo (destacados, visor, ganador y carnet de la bienvenida) usan el nuevo componente `Celda`, que repite la forma literal del logo con un interior concéntrico. Detalle en `docs/iconos/README.md`. Publicado por pedido de Jhon.

## 4 de noviembre de 2026 · Inicio atrapante, destacados y cupones (Claude)

Misma rama y PR (`diseno/home-destacados`). **Fusionado y publicado** el 4 de noviembre de 2026 (PR #11) por pedido de Jhon, tras aprobar el encabezado rediseñado. Detalle, razonamiento y capturas en `docs/home-destacados/README.md`.
- "DCV" fuera de la interfaz (bienvenida, estado del carnet "Activa", textos de compartir). **Pendiente de Jhon:** el spec de marca aún dice "Activa · DCV"; no se editó.
- Perfil de prueba "jhon" (carnet 101) borrado con migración de solo datos `supabase/migraciones/20261104_borrar_perfil_prueba_jhon.sql`: 1 perfil y 1 publicación borrados. La base queda con 8 perfiles, todos de ejemplo.
- Aliados como cupones ("Mostrar mi carnet" en el detalle de cada uno) e invitación a sumar un negocio. Fila de destacados tipo historias con visor a pantalla completa (reto/destacado, descuentos, talleres, convocatorias que cierran pronto, beneficios), visto/no visto en el navegador. Encabezado con "Disponibles ahora", tarjeta del destacado con los pasos y vitrinas intercaladas entre publicaciones.
- Uso de `--mono` corregido fuera del carnet y la calculadora (ver README). Decisión abierta: el reloj de "Mostrar mi carnet" sigue en mono.
- Verificado: build, 14 pruebas de reglas, QA de home ampliado, `qa-visor` nuevo, 35 de fiabilidad y 6 de PWA.

## 4 de noviembre de 2026 · Home y destacados (Codex)

Rama `diseno/home-destacados`, desde `main` actualizado. Composición aprobada por Jhon: destacado, aliados y novedades antes de publicar y del flujo. Portada y Movimiento reemplazados para evitar duplicaciones; aliados también al principio de Beneficios. Los tres negocios siguen como Ejemplo, con aviso explícito de que no son descuentos disponibles.
- Premio: lectura de retos incluyendo cerrados; activo = mayor número activo. Ganador por Útil al cierre entre propuestas con link, mínimo un voto, empate por primera participación. Exposición por 7 días desde el cierre del reto cerrado más reciente; insignia en carnet e historial calculado. No se crean retos ni se escribe en Supabase.
- **Decisión abierta de Jhon:** mantener elección automática por votos o confirmación manual. Implementada por votos según el encargo, pendiente de esa decisión. **Reto 2:** contenido pendiente de Jhon; no creado.
- Antes del cierre hay anuncio; después se identifica a Valentina/Tinta Viva como Ejemplo. Bienvenida y reto explican el premio.
- Verificado: build, 8 pruebas de reglas, 17 comprobaciones de home y 35 de fiabilidad + 6 de PWA. Capturas 390 × 844 a escala 2, visitante/miembro y antes/después del cierre; sin escrituras reales.
- Razonamiento, fuentes, capturas y límites en `docs/home-destacados/README.md`. Pendiente de revisión de PR contra main; no fusionar sin indicación de Jhon.

## 4 de noviembre de 2026 · Fiabilidad de los flujos (Codex)

Mejoras autorizadas por Jhon tras la auditoría técnica, en `diseno/fiabilidad-flujos`. **Fusionado y publicado** el 4 de noviembre de 2026 (PR #9) por pedido de Jhon. Antes de fusionar se volvieron a correr `scripts/qa-fiabilidad.cjs` (35 de 35) y `scripts/qa-pwa.cjs` (6 de 6) y se probó producción: bienvenida, muro, talleres, convocatorias y Beneficios cargan sin errores y el service worker queda activo. Para correr los scripts hace falta `COLMENA_CHROMIUM` apuntando a un Chromium disponible (por ejemplo `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome` en la nube).
- Carga independiente por pantalla, lecturas con plazo de 6 s y solicitudes deduplicadas; se reutilizan datos frescos un minuto. Error y vacío se muestran por separado; calculadora y fichas no dependen del éxito de Beneficios.
- Borradores temporales de publicación y registro por pestaña; se conservan con Atrás y recarga. Búsquedas, filtros y posición de lectura se recuperan al volver de un carnet.
- Borrado visible solo tras confirmación, enlaces directos a publicaciones y mensajes que distinguen guardado exitoso de lectura posterior fallida.
- Demo estática con movimiento reducido, foco confinado en bienvenida y objetivos táctiles revisados de 44 px. “Ganancia sobre el costo” conserva la fórmula de precios. Correo Javeriana inactivo se explica antes de intentar la acción, sin activarlo.
- Pantallas secundarias bajo demanda, precacheadas para uso sin conexión. Una actualización no interrumpe formularios o diálogos abiertos. Paquete JS principal: aproximadamente 462 KB frente a 538 KB anteriores, sin comprimir.
- Verificado: npm install y build correctos; 35 comprobaciones de flujos y 6 de PWA, sin errores JS ni escrituras reales. Capturas, decisiones, scripts reproducibles y límites en `docs/fiabilidad-flujos/README.md`.
- Tokens de marca, esquema y políticas intactos. Pendientes de Jhon (Microsoft, fecha/lugar del encuentro y color de logos) sin cambios. Faltan teléfono físico, lectores de pantalla y validación de operaciones reales en una base separada.

## 4 de noviembre de 2026 · Pulido para los jurados
Trabajo de Jhon con Claude en la rama `diseno/muro-pulido` (PR #8, que arrastra #5, #6 y #7). Se publicó en `main` al final del día. El detalle de cada pieza está en su carpeta de `docs/`.

### Qué quedó en la app
- **Inicio (Muro).** Portada oscura para quien no tiene carnet, con tres tarjetas de cifras reales de la base (personas que piden ayuda, beneficios, reto con cuenta regresiva). Para miembros: su nivel y cuántas personas le escribieron. Tarjetas del muro más livianas (9 elementos en vez de 12): metadatos en una línea, píldora Necesito/Ofrezco con ícono arriba a la derecha, acción principal en píldora Niebla de 44 px, "Útil" sin borde. Detalle: `docs/muro-pulido/`.
- **Bienvenida.** Cinco "historias" que avanzan solas (barra de progreso, tocar a la derecha adelanta, a la izquierda devuelve, mantener pausa, con `prefers-reduced-motion` no avanza sola). Demo animada de Necesito y Ofrezco con Sara y Camila (ejemplos). Detalle: `docs/bienvenida/`.
- **Cobro.** Insignia "Cobra / Intercambia / Cobra o intercambia" con íconos propios (`cash`, `deal`) leída de `perfiles.intercambio`. Está en el carnet, en Miembros, junto a "Ofrezco" en el muro y en el editor; al tocarla abre una hoja que explica. La frase fija es "Intercambiar es cambiar tu trabajo por el de otro miembro."
- **Encuentro.** Evento principal "Noche de marcas: muestra tu emprendimiento", "A quién vas a conocer" (inscritos con su habilidad), **Talleres** (6 de ejemplo, con "Me interesa" y "Dicta uno"), **Ferias y convocatorias** reales en Cali y el reto de la semana. Detalle y fuentes: `docs/encuentro/`, `docs/convocatorias/`.
- **Beneficios.** Listas compactas por categoría, con el logo de cada marca (favicon del sitio oficial, en escala de grises; lo institucional usa el ícono de la categoría), destacados más bajos y filtros en una línea. Detalle: `docs/beneficios/`.
- **Cuenta.** Guardar y recuperar el carnet con el correo `@javerianacali.edu.co` (Microsoft). **El código está, pero no funciona hasta que Jhon active el proveedor Azure** (ver "Pendiente de Jhon"). Mientras tanto los botones avisan "todavía no está activo". Detalle: `docs/cuenta/`.
- **Íconos.** Kit propio de 38 íconos (retícula 24, trazo 1,75, remates redondos, hexágono como motivo). Sin logos de terceros: `wa` es un globo de chat e `ig` una cámara. Hoja de muestra: `docs/iconos/kit.png`.
- **Textos.** Revisión completa de la interfaz y de los datos visibles, con tabla antes → después en `docs/muro-pulido/README.md`. Los errores del servidor se reescriben en `src/lib/store.jsx` (`MENSAJES`).
- **Menos ruido.** Se quitaron los contadores decorativos (pestañas Todo/Piden/Ofrecen, chips, "6 en Cali"). Quedan solo los que indican progreso (insignias "2 de 8", fichas leídas, "te escribieron").

### Decisiones de Jhon (no reabrir sin preguntarle)
- Guardar la cuenta con **correo Javeriana**, no con teléfono (el SMS cuesta) ni con código por correo (el correo de Supabase solo llega al equipo del proyecto y 2 por hora).
- El servicio de Encuentro son **ferias y convocatorias reales** y **talleres**. La **meta del mes** (con avances semanales) se construyó y se **descartó**: "no la siento relevante". El **panal** también salió de Encuentro.
- El evento principal debe estar **adaptado a estudiantes** y los ejemplos deben mostrar posibilidades (edición de contenido, Claude Code, fotos, IA, WhatsApp Business).
- Público: jóvenes de 18 a 23 años; quieren **rapidez e inmediatez**. Nada de números que "chillen", espacios muertos ni textos largos.
- Beneficios se ve mejor con **logo de cada marca** y listas compactas.
- Spotify sigue en los destacados de Beneficios, al final del carrusel.

### Base de datos
Migraciones de este día (copias en `supabase/migraciones/`, todas ya aplicadas): `beneficios_investigacion_2026_11`, `beneficios_spotify_no_destacado`, `beneficios_spotify_destacado_otra_vez`, `textos_muro_pulido`, `cuentas_javeriana`, `convocatorias`, `metas_del_mes` y `talleres`. En la base también está `beneficios_marketplace`, que no tiene copia en el repo.
- `metas_del_mes` creó `metas` y `avances`; `talleres` las **eliminó** el mismo día (no tenían datos reales). El archivo `20261104_metas_del_mes.sql` queda solo como historia.
- Tablas nuevas: `convocatorias` (lectura pública), `cuentas` (privada, sin políticas), `talleres` y `taller_interes` (lectura pública).
- Funciones nuevas: `vincular_cuenta`, `recuperar_carnet`, `mi_cuenta`, `alternar_interes_taller`.
- Las propuestas de miembros (beneficios, ferias, talleres) llegan todas a `solicitudes_beneficio`: el nombre empieza por `[Convocatoria]` o `[Taller]` para distinguirlas. Se revisan en el Table Editor.
- **Ejemplos:** perfiles, publicaciones, ayudas y los 6 talleres tienen `es_ejemplo = true` y se muestran con la etiqueta "Ejemplo". "Me interesa" en un taller es un dato real aunque el taller sea de ejemplo.
- Regla de siempre: nada de cifras ni datos inventados presentados como reales. Las fuentes de convocatorias y beneficios se guardan con `fuente` y `verificado_en`.

### Pendiente de Jhon
1. **Activar el correo Javeriana** (unos 15 minutos): registrar la app en Microsoft Entra, activar el proveedor Azure en Supabase y configurar las URL permitidas. Pasos exactos en `docs/cuenta/README.md`. Riesgo: si sistemas de la Javeriana no deja que estudiantes autoricen apps, hay que pedirle a la mesa de servicio del CSI que apruebe "Colmena".
2. Fecha y lugar reales del **Encuentro 01** (hoy "por confirmar") y si "Noche de marcas" es el formato definitivo.
3. Decidir si los **logos** de Beneficios van en gris (hoy) o a color.
4. Decidir si el **panal** sale de toda la app (sigue en Mi carnet, en la pantalla de una publicación propia y en el aviso "se sumó una celda al panal").
5. Cuándo quitar los perfiles de ejemplo (`delete from perfiles where es_ejemplo;`).
6. Cuando haya un taller real, agregarlo en `talleres` con `es_ejemplo = false`.

### Fechas límite y revisiones mensuales
- **10 de noviembre de 2026, 11:59 p.m.:** cierran las tres convocatorias de Corfecali (mini carrozas, piezas de gran formato, carroza real). La app oculta sola lo vencido.
- **22 de noviembre de 2026:** FinFest Cali (en `convocatorias`).
- **31 de diciembre de 2026:** último día para reclamar Google AI Plus; ese día poner `activo = false` en `beneficios`.
- Cada mes: revisar `beneficios`, `convocatorias` (fuentes en `docs/convocatorias/README.md`) y Miro (pausado, no recibe solicitudes).

### Cómo se verificó (y cómo repetirlo)
- `npm run build` pasa sin errores. No hay suite de pruebas automática en el repo.
- Capturas con Playwright a 390 × 844 y `deviceScaleFactor` 2, contra `npx vite preview --port 4173` o contra la versión de prueba. En la versión de prueba de Netlify hay que **ocultar o bloquear el iframe "Netlify Drawer"**, que tapa los botones.
- Para ver la app como miembro sin escribir en la base: guardar en `localStorage` la clave `colmena.sesion.v1` con `{"id": "<id de un perfil de ejemplo>", "clave": "x"}` e **interceptar todas las llamadas `/rest/v1/rpc/`** (dejar pasar solo `resenas_publicas`). Para ver la bienvenida otra vez: borrar `colmena.intro.v1`.
- Probado: navegador de escritorio emulando celular, gestos de la bienvenida, seguridad de `cuentas` (no se puede leer desde el cliente) y de `recuperar_carnet` sin sesión. **No probado:** teléfono físico, lector de pantalla, el inicio de sesión con Microsoft (no está activo) ni escrituras reales de "Me interesa".

### Cosas técnicas que conviene saber
- El carnet vive en `localStorage` (`colmena.sesion.v1`). Se pierde si la persona borra datos, cambia de celular o, en iPhone sin instalar la app, tras 7 días sin abrirla. Por eso existe la cuenta Javeriana.
- `src/lib/supabase.js` ahora tiene `persistSession: true` con `storageKey: 'colmena.auth'` solo para el inicio de sesión de Microsoft; la app sigue usando la clave del dispositivo y cierra la sesión de Auth al terminar.
- `Icon` aplica trazo 1,75 por defecto; `deal` se escala 1,14 para igualar el peso óptico (`ESCALA` en `ui.jsx`).
- Los logos de Beneficios se piden a `google.com/s2/favicons` en el navegador; no se guarda ningún logo en el repo (repo público). Si falla la carga se muestra el ícono de la categoría.
- `design-qa.md` documenta la interfaz del 30 de octubre ("Bloques · Vínculo"); la de hoy la reemplaza en muchos detalles (tarjetas del muro, bienvenida, Beneficios).
- Colores: Polen solo en acción principal; Verde solo semántico ("Ofrezco", "cumplida"/"confirmado"). Si algo nuevo necesita un color, la respuesta es Tinta, Blanco o Niebla.

## 30 de octubre al 3 de noviembre de 2026 · Base
- 30 oct: marca v2.0 bloqueada (5 colores planos, 3 tipografías, la celda abierta). Interfaz "Bloques · Vínculo" (`design-qa.md`). Base en Supabase con lectura pública y escrituras por RPC con la clave del dispositivo.
- 2–3 nov: V0 con ayudas por WhatsApp, retos, niveles, reseñas de doble ciego; onboarding (PR #5); bienvenida tipo pase y auditoría de UI (PR #6, `docs/auditoria-ui/`).
- 4 nov: Beneficios como tienda y la investigación de 27 beneficios nuevos (PR #7, `docs/beneficios/investigacion-2026-11.md`).
