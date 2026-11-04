# Fiabilidad de los flujos

4 de noviembre de 2026 · Codex · rama `diseno/fiabilidad-flujos`.

Implementación autorizada por Jhon después de la auditoría técnica. Se conserva el diseño de marca v2.0. No se modificaron tokens, esquema, políticas, migraciones, credenciales ni configuración del entorno. No se activó Microsoft ni se cambió el encuentro.

## Qué cambió

- **Carga por pantalla.** Las fuentes se resuelven independientemente, las consultas simultáneas a la misma fuente se deduplican y las lecturas tienen un plazo de 6 segundos, sin multiplicar los reintentos del SDK. Los datos frescos se reutilizan durante un minuto. Regresar al primer plano ya no descarga todo de nuevo; se refresca lo que necesita la pantalla activa cuando corresponde. Las acciones confirmadas por RPC siguen siendo éxitos aunque falle la lectura posterior.
- **Carga, error y vacío.** Los errores muestran Reintentar y no se convierten en cifras cero o mensajes de “no hay publicaciones”. Si una actualización falla después de haber cargado datos, se mantienen los anteriores con un aviso. Beneficios puede fallar sin bloquear la calculadora ni las fichas.
- **Continuidad.** Borradores de publicación (incluidos tipo, categorías y duración) y de registro se guardan en `sessionStorage`, se conservan al cerrar o recargar la pestaña y se limpian después del éxito. No se guardan claves del dispositivo en estos borradores. El registro conserva también los datos de contacto introducidos hasta que se cierra la pestaña o se crea el carnet. Atrás del navegador retrocede un paso del registro y cierra el compositor de publicaciones.
- **Búsquedas y lectura.** Muro, Miembros y Beneficios conservan filtros; Muro, Miembros y Herramientas conservan posición de lectura al regresar de una vista secundaria. Ese estado de navegación vive en memoria, no es una cuenta ni se comparte entre usuarios.
- **Borrado.** La tarjeta permanece mientras se confirma la RPC. Si falla, sigue visible. El botón se deshabilita mientras hay una solicitud pendiente.
- **Compartir.** Los enlaces `?publicacion=<id>` abren la tarjeta concreta. Se consulta por id si no está entre las 300 publicaciones cargadas. Una publicación vencida, borrada o que no pudo cargarse tiene su propio mensaje. Los enlaces a carnet siguen funcionando.
- **Accesibilidad.** La bienvenida enfoca sus controles, vuelve inerte el fondo y confina el Tab; con movimiento reducido su demo permanece estática. Se ampliaron a 44 px los controles revisados. Se conserva el SVG y el kit de íconos propios.
- **Mensajes.** “Ganancia sobre el costo” describe la fórmula existente; no cambia el precio calculado. “Crea tu carnet en 3 pasos” reemplaza una duración no verificada. Se explica que Me interesa ayuda a elegir talleres, y el consentimiento distingue perfil público de WhatsApp para miembros. Guardar/recuperar con correo se presenta como pendiente si la configuración pública del proveedor indica que está inactivo; no se activa automáticamente.
- **PWA y JS.** Las pantallas secundarias se cargan bajo demanda y se incluyen en el precache para seguir disponibles sin conexión. Hay recuperación si falla un módulo. Una actualización no fuerza una recarga mientras hay un formulario o diálogo abierto. El paquete JS principal pasó de 537.622 a aproximadamente 462.200 bytes sin comprimir; de unos 153 KB a 135 KB comprimidos. Son tamaños de compilación, no mediciones de velocidad de teléfonos reales. El precache total es aproximadamente 843 KiB: no se presenta la división de módulos como reducción de todos los recursos de la PWA.

## Capturas comparables, 390 × 844

Se revisaron las capturas antes y después de los mismos estados. Las imágenes son de la propia app; se bloquearon favicons externos en las pruebas nuevas. El nombre y teléfono de prueba se introdujeron solo en el navegador y no se enviaron a producción. Los estados de error indicados son simulaciones locales.

| Caso | Antes | Después |
|---|---|---|
| Volver de un carnet | [Búsqueda perdida](antes-volver-busqueda.png) | [Búsqueda conservada](despues-busqueda.png) |
| Cerrar y reabrir Publicar | [Texto perdido](antes-borrador.png) | [Borrador conservado](despues-borrador.png) |
| Fallo de carga | [Cero y vacío engañosos](antes-error-red.png) | [Error con Reintentar](despues-error-red.png) |

Más evidencia: [carga parcial](despues-carga-parcial.png), [Atrás en registro](despues-atras-registro.png), [borrado fallido](despues-borrado-fallido.png), [guardado confirmado y lectura fallida](despues-guardado-confirmado.png), [demo estática](despues-movimiento-reducido.png), [Beneficios](despues-beneficios.png), [calculadora sin conexión](despues-calculadora-offline.png).

## Verificación y repetición

- `npm install --no-audit --no-fund`: correcto; sin cambios en lockfile ni dependencias.
- `npm run build`: correcto, incluida la generación del service worker y los módulos diferidos; desaparece la advertencia del chunk principal mayor a 500 KB.
- `node scripts/qa-fiabilidad.cjs`: **35 comprobaciones correctas**, sin errores de JavaScript. Incluye carga parcial, plazo de espera, errores, búsqueda y scroll, Atrás, borradores, enlace compartido, borrado rechazado, confirmación de publicación/registro con lectura posterior fallida, foco, movimiento reducido y controles táctiles revisados. Resultado de la corrida: [resultados.json](resultados.json).
- `node scripts/qa-pwa.cjs`: **6 comprobaciones correctas**: service worker activo, reutilización de datos frescos, edición protegida de recargas, fallo de red en menos de 8 s, módulo y calculadora disponibles sin conexión. Resultado: [pwa-resultados.json](pwa-resultados.json).
- `git diff --check`: correcto.

Los scripts requieren Playwright y Chromium disponibles en el entorno (ya suministrados en este entorno de nube), Node 22 y el servidor local de la compilación. No ejecutarlos contra Netlify ni contra otra URL sin revisar el alcance. El origen predeterminado es local; `COLMENA_QA_ORIGIN` y `COLMENA_CHROMIUM` permiten cambiar origen y ejecutable. Conservan el proxy y la verificación de certificados. `qa-fiabilidad` usa las lecturas públicas y los perfiles de ejemplo actuales, incluida Sara; si se retiran o cambia la muestra, habrá que actualizar esa precondición. Sus simulaciones de escritura se interceptan antes de salir del navegador. **No aplicar migraciones ni ejecutar el QA histórico de escrituras reales.**

```bash
# Terminal 1, raíz del repo
npm run build
npm run preview -- --host 127.0.0.1 --port 4174 --strictPort

# Terminal 2, raíz del repo (Playwright disponible)
node scripts/qa-fiabilidad.cjs
node scripts/qa-pwa.cjs
```

Los scripts generan capturas y resultados en esta carpeta y eliminan el JSON anterior al empezar para no confundir una corrida fallida con resultados viejos. Las únicas RPC enviadas al Supabase real durante QA son las lecturas `resenas_publicas`; las demás se interceptan. Registro y publicación confirmados son respuestas locales de prueba, no datos insertados. No se enviaron mensajes a terceros.

## Pendiente y límites

- Revisión de Jhon y PR contra `main` antes de fusionar; esta rama no se publica en producción por sí sola.
- Probar teclado virtual, instalación y navegación en iPhone y Android físicos, y VoiceOver/TalkBack. Las comprobaciones actuales usan Chromium y no certifican WCAG completa.
- Confirmar manualmente una operación real en una base de prueba separada cuando exista. No se hicieron escrituras reales en la base compartida.
- Para crecimiento de datos, paginación y cálculo agregado de actividad siguen siendo trabajo posterior; no se añadieron límites que pudieran ocultar miembros o alterar sus niveles.

## Fuentes y decisiones

- `AGENTS.md`, `docs/BITACORA.md`, `docs/marca/colmena-brand-spec.md`, `supabase/README.md` y auditoría previa de esta sesión.
- Implementación: `src/lib/store.jsx`, `src/lib/vista.js`, `src/App.jsx`, `src/components/EstadoDatos.jsx` y pantallas afectadas.
- [MDN: inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert), [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage), [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
- Los 44 px son una regla interna del proyecto; no se equiparan por sí solos a cumplimiento WCAG.
