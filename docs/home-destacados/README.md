# Home y destacados

4 de noviembre de 2026 · rama `diseno/home-destacados`, desde `main` actualizado. Trabajo autorizado por Jhon. PR contra `main`, sin fusionar.

## Composición y decisiones de diseño

Se consideraron tres composiciones:
1. Mantener la portada con cifras y añadir los destacados debajo: acumulaba dos presentaciones y retrasaba el contenido.
2. Una sección vertical completa por cada servicio: hacía demasiado largo el recorrido hasta las publicaciones.
3. **Elegida:** cabecera compacta, una tarjeta principal de reconocimiento, una vitrina de aliados y otra de novedades. Luego publicar, primeros pasos solo para visitantes y el flujo con pestañas.

La tarjeta oscura reconoce al ganador; los descuentos reales de cada fila son el protagonista de la vitrina blanca. Polen permanece como acción principal al publicar, además del indicador de navegación y las piezas de marca. Los avatares conservan hexágono, Tinta y Polen. No se alteran tokens. No se suben logos externos: se reutiliza la carga de favicons existente con su fallback del kit propio.

Se sustituyen Portada y Movimiento y se retira el carrusel intercalado entre publicaciones. El aviso personal «te necesitan» pasa junto a la acción de publicar. Hay accesos directos a las secciones de reto, talleres y convocatorias en Encuentro; los beneficios digitales llevan a Beneficios y la calculadora conserva su acceso.

En Beneficios, los aliados pasan antes del carrusel digital y las categorías; abren el detalle existente con Mostrar mi carnet. Los tres siguen identificados como Ejemplo y se explica que no representan negocios reales ni descuentos disponibles hoy. No se altera la propuesta de aliados nuevos.

## Premio y datos

Se leen los retos sin filtrar por activo, incluyendo el historial; el activo sigue siendo el de mayor número con `activo=true`. No se crean retos ni migraciones. El Muro y el carnet solicitan votos; las convocatorias pasan a formar parte de los datos del home. Se conservan carga independiente, deduplicación y plazo de espera de fiabilidad.

`src/lib/destacados.js` deriva ganadores de las lecturas existentes:
- Solo propuestas con link no vacío y participación anterior o igual al cierre.
- Solo votos anteriores o iguales al cierre, excluyendo votos propios y duplicados del mismo votante.
- Mínimo un voto; empate por participación más temprana, con id como orden estable si las fechas son idénticas.
- El destacado corresponde únicamente al reto cerrado más reciente, durante `[cierra_en, cierra_en + 7 días)`. Si ese reto no tiene ganador, no se recupera uno anterior.
- El historial de reconocimientos se conserva como resultado calculado de los retos cerrados, incluso después de los siete días. No es un registro inmutable del servidor: si los datos de participación o votos se eliminan, cambia el historial calculado.
- El reloj actualiza al cerrar o vencer un premio y al volver a la pestaña, sin depender de una nueva visita. Un ejemplo se marca explícitamente en home, carnet e historial.

Antes del cierre se invita a Participar en el reto. Tras el cierre, la muestra actual da como ganadora a Valentina Ruiz/Tinta Viva. El home permite ver su carnet y escribirle; con perfiles de ejemplo se explica que no hay una persona real a la cual contactar. La bienvenida y la tarjeta de reto explican el premio y su duración.

## Verificación

- `npm install --no-audit --no-fund` y `npm run build`: correctos. Sin cambios de dependencias o lockfile.
- `node --test tests/destacados.test.js`: 8 pruebas correctas (cierre, voto tardío, empate, cero votos, duplicados, participación tardía, expiración e historial, reto nuevo sin ganador).
- `COLMENA_CHROMIUM=/usr/bin/chromium node scripts/qa-home.cjs`: 17 comprobaciones correctas; anuncio, ganador, ejemplos, aliados, detalle, insignia y reconocimiento histórico. Todas las RPC se interceptan. [Resultado](resultados-home.json).
- `COLMENA_CHROMIUM=/usr/bin/chromium node scripts/qa-fiabilidad.cjs`: 35 comprobaciones correctas. [Resultado de esta rama](qa-fiabilidad-resultados.json).
- `COLMENA_CHROMIUM=/usr/bin/chromium node scripts/qa-pwa.cjs`: 6 comprobaciones correctas. [Resultado de esta rama](qa-pwa-resultados.json).
- Sin errores JS en la comprobación de home/carnet ni en fiabilidad; sin escrituras reales de QA en Supabase. En los scripts históricos de fiabilidad solo se deja pasar la lectura resenas_publicas. En el nuevo script de home todas las RPC reciben respuestas locales.

Los scripts necesitan un preview local en el puerto 4174 (o `COLMENA_QA_ORIGIN`), Playwright disponible y Chromium indicado por `COLMENA_CHROMIUM`. Las capturas usan 390 × 844, escala 2 y movimiento reducido. Visitante y miembro ficticio, con RPC interceptadas; fechas simuladas antes (`2026-11-04T20:00Z`) y después (`2026-11-05T05:01Z`) del cierre. Para repetir capturas: `PHASE=despues COLMENA_CHROMIUM=/usr/bin/chromium node scripts/capturas-home.cjs`; el estado anterior se capturó en la base de esta rama antes de editar, no se debe sobrescribir.

## Capturas y correcciones visuales

| Estado | Antes | Después |
|---|---|---|
| Visitante, abierto | [Inicio](antes-visitante-abierto.png) | [Inicio](despues-visitante-abierto.png) |
| Visitante, cerrado | [Inicio](antes-visitante-cerrado.png) | [Ganador](despues-visitante-cerrado.png) |
| Miembro, abierto | [Inicio](antes-miembro-abierto.png) | [Inicio](despues-miembro-abierto.png) |
| Miembro, cerrado | [Inicio](antes-miembro-cerrado.png) | [Ganador](despues-miembro-cerrado.png) |
| Beneficios | [Anterior](antes-beneficios.png) | [Aliados al principio](despues-beneficios.png) |

Cada estado tiene además una captura `-vitrinas.png` a la misma posición vertical. [Carnet ganador](despues-carnet-ganador.png). Se inspeccionaron los archivos guardados. Se corrigieron el recorte inicial de la primera tarjeta horizontal (scroll-padding), el salto vertical al llegar datos (overflow-anchor del muro) y el desplazamiento de novedades al último elemento cuando llegaban tarjetas nuevas: esa vitrina espera a sus fuentes antes de presentar todas las tarjetas juntas. No bloquea la navegación ni las herramientas locales.

## Segunda ronda: inicio atrapante (4 de noviembre de 2026)

Misma rama y mismo PR. Comentarios de Jhon sobre la versión anterior: la franja de aliados se veía fea (título, línea gris, nota, tarjetas cortadas, hueco debajo), el encabezado y la tarjeta del destacado eran muy simples, y el inicio debía ser MUY atrapante, con formato de historias/destacados y sin la palabra "DCV".

### Qué cambió
1. **Sin "DCV" en la interfaz.** Bienvenida ("Colmena conecta a estudiantes que emprenden."), estado del carnet ("Activa") y textos de compartir ("la red de estudiantes que emprenden", en Registro y MiCarnet). `grep -rn DCV src` queda vacío y se revisaron `retos`, `encuentros`, `talleres`, `convocatorias` y `beneficios` en la base: ninguna fila lo contiene. No se tocó `docs/marca/` (el spec todavía dice "Activa · DCV": ver decisiones de Jhon). El dominio `colmena-dcv.netlify.app` sigue igual: es una URL, no un texto de la interfaz.
2. **Perfil de prueba "jhon" eliminado** con migración de solo datos (`supabase/migraciones/20261104_borrar_perfil_prueba_jhon.sql`), solo por su id y con `not es_ejemplo`. Antes: 9 perfiles (1 real), 10+1 publicaciones; el objetivo tenía 1 publicación, 0 ayudas, 0 retos, 0 cuentas. Resultado: 1 publicación y 1 perfil borrados. Después: 8 perfiles (0 reales), 10 publicaciones (0 reales), 6 disponibles ahora. Revisión de estados: inicio, "Disponibles ahora", Miembros, destacado y bienvenida cargan sin vacíos ni errores (capturas más abajo y 17 comprobaciones de home).
3. **Descuentos de aliados como cupones.** Cada uno es un cupón horizontal: bloque Tinta con el valor en grande (−15 %, −10 %, POR MAYOR), perforación con muescas y cuerpo Blanco con nombre, condición, zona y la etiqueta Ejemplo. Debajo, un carnet mini en Polen (con tu hexágono y número si tienes carnet) con el botón "Mostrar" (o "Crear carnet"), que abre la pantalla `mostrar` que ya existía (si no hay carnet, primero ofrece crearlo). Al final, una invitación con borde punteado, "¿Tienes un negocio?", que abre el formulario de propuesta ya existente (`proponer_beneficio`). Se apilan en vertical, así que no hay tarjetas cortadas ni huecos; el inicio muestra 3 y "Ver todos" lleva a Beneficios. No hay logos ni imágenes inventadas: el valor hace de imagen.
4. **Destacados tipo historias.** Fila de anillos hexagonales justo bajo el encabezado, con íconos del kit propio: Destacado/Reto, Descuentos, Talleres, Cierran pronto (convocatorias con cierre en 21 días o menos) y Gratis (beneficios más útiles, en el mismo orden que Beneficios). Cada uno abre un visor a pantalla completa con las pantallas armadas solo con datos de la base (`src/lib/historias.js`, función pura con 6 pruebas). Una pantalla por descuento, taller, convocatoria y beneficio; el destacado y el reto llevan su pantalla. Todo lo de muestra conserva "Ejemplo". Si un grupo no tiene datos o su lectura falla, su anillo simplemente no aparece: nunca se bloquea nada.
   - Visor (`src/components/Historias.jsx`): `<dialog>` modal (foco dentro y fondo inerte por el navegador), una barra por pantalla, tocar a la derecha adelanta y a la izquierda vuelve, mantener presionado pausa (la barra y el reloj se detienen juntos), deslizar de lado cambia de destacado, deslizar hacia abajo cierra, flechas del teclado y Escape. Con `prefers-reduced-motion` no avanza solo. Al terminar un destacado pasa al siguiente; al terminar el último, cierra. Cada pantalla tiene un solo botón en Polen con la acción (Participar, Ver carnet, Mostrar mi carnet, Ver talleres…).
   - Visto/no visto en `localStorage` (`colmena.destacados.vistos.v1`), con firma del contenido: si cambian las pantallas de un anillo, vuelve a salir como nuevo. Si el almacenamiento falla, todo sigue funcionando.
5. **Encabezado y tarjeta del destacado más ricos, sin llenarlos.**
   - Encabezado: título más grande y una línea con "Disponibles ahora" (hexágonos y nombres de miembros con cupo, con la marca Ejemplo mientras todos sean de muestra) que lleva a Miembros. Para miembros, "Hola, Nombre" y "Esto es lo nuevo en la comunidad."
   - Tarjeta sin ganador: una frase que explica cómo se gana ("Participa en el reto. La propuesta con más votos Útil se muestra aquí durante 7 días."), el botón Participar y la cuenta regresiva al lado. Con ganador: el avatar entra con un movimiento corto.
   - Corrección tras la revisión de Jhon: se quitaron los pasos abreviados ("Reciben Útil", "7 días arriba"), que no se entendían; la sección de descuentos recuperó su espaciado (una limpieza de CSS había borrado su `display: flex`), lleva una línea de ayuda bajo el título, el carnet mini dice "Usa los descuentos · Crear carnet" (o tu nombre y "Mostrar") y la invitación a negocios es una fila delgada con borde punteado.
   - Ritmo: encabezado → anillos → tarjeta oscura → cupones → publicar → publicaciones, con las vitrinas intercaladas: "Esta semana" después de la tercera publicación y "Ya los tienes por ser estudiante" (3 beneficios con logo) después de la séptima. Solo aparecen con el filtro "Todo" y sin categoría, y si hay pocas publicaciones salen al final. Así el tramo largo de publicaciones se interrumpe con superficies de forma distinta (tarjetas horizontales, lista) y hay razones para seguir bajando.
   - Polen: botón de publicar y carnet mini como únicos focos; los anillos son Tinta/Blanco (visto = Blanco con borde fino, no visto = Tinta sólido). En el visor, Polen solo en el botón de acción.

### Por qué esta composición
Se pensaron cuatro opciones para el inicio: (a) anillos como único elemento nuevo y todo lo demás igual, (b) carrusel automático grande de portada, (c) anillos + cupones + vitrinas intercaladas, (d) mover los cupones debajo de las publicaciones. Se descartó (b) porque compite con la acción de publicar y se siente publicidad; (d) porque esconde el beneficio más tangible. Se eligió (c): los anillos dan la entrada rápida y conocida (formato Instagram) que pidió Jhon, la tarjeta oscura y los cupones conservan lo que ya le gustó, y las vitrinas intercaladas dan ritmo sin mover la acción principal. Para los aliados se descartó un carrusel horizontal (era lo que se veía cortado) y una tarjeta enorme; el cupón apilado se lee de un vistazo y escala a más negocios.

### `--mono` fuera del carnet y la calculadora
AGENTS.md dice que JetBrains Mono es solo para el número de carnet y las cifras de la calculadora. Se corrigió: `.cd` (cuenta regresiva), `.vence`, `.counter`, `.todo small` y `.m-cats button small` pasan a Space Grotesk 600 con cifras tabulares (las cifras van en Space Grotesk según el spec), y `.ficha pre` (texto de plantillas) pasa a Hanken Grotesk. Se mantienen en mono el número de carnet y el reloj de "Mostrar mi carnet", que es pantalla de carnet. Decisión de Jhon si prefiere que ese reloj también cambie.

### Verificación de esta ronda
- `npm run build`: correcto.
- `node --test tests/destacados.test.js tests/historias.test.js`: 14 pruebas correctas.
- `scripts/qa-home.cjs`: comprobaciones del home ampliadas (sin "DCV", cupones, invitación, carnet mini, anillos, visor, Escape, visto guardado); todas correctas antes y después del cierre del reto. [Resultado](resultados-home.json).
- `scripts/qa-visor.cjs` (nuevo, con movimiento normal): avance solo, pausa al mantener, toques a derecha/izquierda, deslizar hacia abajo, Escape, foco dentro y almacenamiento bloqueado. Todas correctas.
- `scripts/qa-fiabilidad.cjs` (35) y `scripts/qa-pwa.cjs` (6): siguen pasando. [Fiabilidad](qa-fiabilidad-resultados.json), [PWA](qa-pwa-resultados.json).
- Sin escrituras reales a Supabase desde las pruebas (todas las RPC interceptadas). La única escritura de esta ronda fue el borrado autorizado del perfil de prueba.
- Capturas a 390 × 844, escala 2, visitante y miembro, antes (`antes-pr-*`, estado del PR antes de esta ronda) y después (`despues-*`), con el reto abierto y cerrado: [visitante abierto](despues-visitante-abierto.png) · [visitante cerrado](despues-visitante-cerrado.png) · [miembro abierto](despues-miembro-abierto.png) · [miembro cerrado](despues-miembro-cerrado.png) · [vitrina intercalada](despues-visitante-abierto-intercalada.png) · visor: [reto](despues-visor-reto.png), [descuento](despues-visor-descuento.png), [destacado](despues-miembro-cerrado-visor.png) · [Beneficios](despues-beneficios.png). Antes: [visitante](antes-pr-visitante-abierto.png), [miembro cerrado](antes-pr-miembro-cerrado.png).

### Decisiones abiertas de Jhon (nuevas)
1. Actualizar `docs/marca/colmena-brand-spec.md`: el estado del carnet dice "Activa · DCV" y la app ahora dice "Activa".
2. Si "Cierran pronto" debe usar 21 días o otra ventana, y si "Gratis" muestra 4 beneficios o más.
3. Si el reloj de "Mostrar mi carnet" sigue en mono (hoy sí).

## Decisiones abiertas de Jhon

1. Confirmar si el premio se decide automáticamente por votos o requiere confirmación manual. Implementado por votos según el encargo; no hay administración nueva ni premio escrito en la base.
2. Definir el contenido del reto 2. No se creó ningún reto nuevo.

Persisten tus pendientes de Microsoft, encuentro y color de logos. No se hicieron cambios de esquema, políticas, RPC, datos de producción ni despliegues a producción. Quedan pendientes validación en teléfono físico y revisión del PR antes de cualquier fusión.

## Fuentes

Brief de Jhon adjunto en esta sesión; `AGENTS.md`, `docs/marca/colmena-brand-spec.md`, `supabase/README.md`, documentación de `muro-pulido`, `encuentro`, `beneficios` e `iconos`. Las reglas del premio son las indicadas por Jhon, no una investigación nueva ni una decisión definitiva sobre la moderación.
