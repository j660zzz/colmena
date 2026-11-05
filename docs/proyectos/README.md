# Proyectos en el carnet

5 de noviembre de 2026 · rama `datos/proyectos`. Pedido de Jhon: perfiles de ejemplo más nutridos, con proyectos. Jhon eligió que **funcione para todos** (tabla nueva) y **portadas de marca** en lugar de fotos.

## Qué se construyó
- **Base** (`supabase/migraciones/20261105_proyectos.sql`, aplicada el 5 de noviembre con aprobación de Jhon): tabla `proyectos` (título, tipo, cliente, año, descripción de una línea, link, orden, `es_ejemplo`), lectura pública y escritura solo por RPC `guardar_proyecto` (crea o edita uno propio, máximo 4) y `borrar_proyecto`, que validan la clave del dispositivo. Borrar el perfil borra sus proyectos. Se comprobó que una clave falsa es rechazada y que `anon` no puede insertar directo.
- **Ejemplos:** 20 proyectos de muestra repartidos en los 8 perfiles de ejemplo (2 o 3 cada uno), con clientes ficticios y sin links para no enviar a sitios reales. Bios y habilidades de los 8 ejemplos, más completas. Todo con `es_ejemplo = true` y la etiqueta "Ejemplo".
- **Carnet:** sección "Proyectos" después de "Sobre…", en cuadrícula de dos columnas (sin tarjetas cortadas). Al tocar uno se abre su detalle con portada grande, cliente, año, descripción y "Ver el proyecto" si tiene link. Si es tu propio carnet y no tienes proyectos, invita a agregarlos.
- **Editar carnet:** sección "Proyectos" debajo de "Guardar cambios", con conteo "N de 4", editar y borrar. "Agregar proyecto" abre un formulario corto (nombre, tipo, cliente, año, qué hiciste, link) con la portada en vivo. Cada proyecto se guarda por separado al tocar "Guardar proyecto".

## Portadas
Sin fotos inventadas ni recursos de terceros. Cada portada es un color plano de la marca con la `Celda` (la forma del logo) recortada en la esquina, el ícono del tipo de trabajo del kit propio y el tipo y el año arriba. El primer proyecto va en Polen (es el principal); los demás alternan Tinta y Blanco, para que Polen no se repita en la pantalla.

## Verificación
- `npm run build` correcto; `npm test` 33 de 33.
- `scripts/qa-proyectos.cjs` (nuevo): 12 comprobaciones (proyectos y etiqueta Ejemplo en un carnet de ejemplo, portadas, detalle, sin links externos en ejemplos, editor fuera del formulario del perfil, validaciones del formulario, llamada interceptada a `guardar_proyecto` y error del servidor visible, sin errores JS). Todas las RPC interceptadas.
- `qa-home` 35, `qa-visor` 9, `qa-fiabilidad` 35 y `qa-pwa` 6 siguen pasando.

| Carnet | Detalle | Editor | Agregar |
|---|---|---|---|
| [captura](carnet-proyectos.png) | [captura](detalle-proyecto.png) | [captura](editor-proyectos.png) | [captura](agregar-proyecto.png) |

## Pendiente (decisión de Jhon)
- Fotos reales subidas por los miembros: requiere almacenamiento en Supabase, límite de tamaño y moderación. Las portadas de marca quedan como respaldo cuando no haya foto.
