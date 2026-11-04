# Cambios aplicados después de la auditoría UI

Fecha: 4 de noviembre de 2026. Base: `v0/onboarding` (`c6801b3`). Diagnóstico completo en `informe.md`; capturas del antes en `capturas/` y del después en `despues/`.

## Versión de prueba

PR [j660zzz/colmena#6](https://github.com/j660zzz/colmena/pull/6) · vista previa de Netlify: https://deploy-preview-6--colmena-dcv.netlify.app (para ver la bienvenida otra vez, borra los datos del sitio o abre en ventana privada).

## Cómo volver a la versión anterior

La versión anterior está guardada en la rama **`respaldo/antes-de-mejoras-ui`** (commit `c6801b3`, idéntica a `v0/onboarding` antes de estos cambios).

- Para probarla: haz deploy de esa rama en Netlify o córrela en local con `git checkout respaldo/antes-de-mejoras-ui && npm run dev`.
- Para descartar las mejoras: no fusiones esta rama; `v0/onboarding` y `main` siguen intactas.

## Qué cambió

| # | Cambio | Archivos |
|---|---|---|
| Bienvenida | 4 pantallas con forma de "pase desbloqueado": el panal se arma, el Pase Colmena lista lo incluido ($0), demo del muro con WhatsApp, beneficios con cifras reales que suben y el carnet con la celda de nivel dibujándose. Barra de progreso tipo historias, fondo que cambia por pantalla y entradas escalonadas. Con `prefers-reduced-motion` todo aparece sin animar. | `src/screens/Onboarding.jsx` (`Bienvenida`), `app.css` |
| M1 | Muro: compositor arriba, primeros pasos en una sola fila (la lista completa abre en una hoja), pestañas y filtro en una barra fija, carrusel "Esta semana" después de la tercera publicación y cierre "Viste todo lo que hay por ahora". Primera publicación: de ~1.160 px a ~320 px. | `src/screens/Muro.jsx`, `Onboarding.jsx` (`PrimerosPasos`) |
| M2 | El título de cada pestaña se desplaza con el contenido; solo la marca queda fija. Se quitaron subtítulos repetidos. El botón fijo del carnet ya no usa degradado. | `src/components/ui.jsx` (`Header`, `Titulo`), pantallas |
| M3 | Beneficios: sin bloque de estadísticas; destacados con el nombre como titular, sello del valor y retícula de panal; tarjetas cuya portada es el valor (GRATIS, −45 %, 1 AÑO…) con ícono de categoría; el filtro Gratis no repite "GRATIS"; Guardar y "Ya lo activé" en este dispositivo, con filtro Guardados. | `src/screens/Beneficios.jsx` |
| M4 | Un solo Polen por pantalla en el Muro: botones de las publicaciones en Tinta, "Quedan…" en mono gris, "Crear carnet" de la cabecera en contorno. | `Muro.jsx`, `app.css` |
| M5 | Mi carnet sin sesión muestra la vista previa del carnet. Nivel con la siguiente acción concreta. Insignias: se ven las ganadas y una "Siguiente insignia" con cómo ganarla; las nuevas se llenan una vez. En Miembros se oculta el nivel si todos tienen el mismo. | `MiCarnet.jsx`, `Carnet.jsx` (`Insignias`), `Nivel.jsx`, `Miembros.jsx`, `Registro.jsx` |
| Carnet | Sin inclinaciones. El carnet es una ficha: "Puede ayudarte con" (habilidades), disponibilidad, cómo cobra y ayudas dadas. En el carnet de otra persona, "Pídele ayuda con" abre WhatsApp con un mensaje sobre esa habilidad. Quien no tiene carnet ve la vista previa y para qué sirve. | `Registro.jsx` (`CarnetCard`), `Carnet.jsx`, `MiCarnet.jsx` |
| Miembros | "¿Qué necesitas?" con categorías y cuántos saben de cada una, filtros Todos / Disponibles / Intercambian, carrusel "Disponibles ahora" y tarjetas con habilidades, disponibilidad, cómo cobra, ayudas y calificación. | `Miembros.jsx` |
| Extras | Esqueleto de carga plano en vez del hexágono solo; navegación con nombre en las 5 pestañas e ícono nuevo para Beneficios; pulso al marcar "Útil"; la cifra de beneficios del Muro coincide con la de Beneficios. | `App.jsx`, `app.css` |

## Qué no se tocó

`src/styles/tokens.css`, `src/lib/*`, `supabase/*` y `src/data/contenido.js`. No hay columnas ni llamadas nuevas a Supabase. Las etiquetas "Ejemplo" siguen en todo el contenido de muestra.

## Comprobado

- `npm run build`: sin errores.
- Playwright a 390 × 844 con datos reales en vivo y escrituras bloqueadas: cero errores de JavaScript.
- 320 px: sin scroll horizontal en las 5 pestañas; pestañas de 56 px de alto.
- `prefers-reduced-motion`: la bienvenida muestra todo sin animar.
- Saltar la bienvenida se recuerda; la hoja de primeros pasos abre con los 4 pasos; Guardar y "Ya lo activé" persisten y aparecen en el filtro Guardados.

No probado: teléfono físico, lector de pantalla y escrituras reales (publicar, Útil, crear carnet) contra producción.
