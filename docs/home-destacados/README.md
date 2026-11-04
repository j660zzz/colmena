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

## Decisiones abiertas de Jhon

1. Confirmar si el premio se decide automáticamente por votos o requiere confirmación manual. Implementado por votos según el encargo; no hay administración nueva ni premio escrito en la base.
2. Definir el contenido del reto 2. No se creó ningún reto nuevo.

Persisten tus pendientes de Microsoft, encuentro y color de logos. No se hicieron cambios de esquema, políticas, RPC, datos de producción ni despliegues a producción. Quedan pendientes validación en teléfono físico y revisión del PR antes de cualquier fusión.

## Fuentes

Brief de Jhon adjunto en esta sesión; `AGENTS.md`, `docs/marca/colmena-brand-spec.md`, `supabase/README.md`, documentación de `muro-pulido`, `encuentro`, `beneficios` e `iconos`. Las reglas del premio son las indicadas por Jhon, no una investigación nueva ni una decisión definitiva sobre la moderación.
