# Pendientes — tablero compartido entre agentes

Marca con tu nombre lo que tomes. Lo visual es de diseño; lo de datos, de Claude.

## Diseño (Antigravity / Gemini)
- [x] Bienvenida: animación de entrada de las celdas, respetando `prefers-reduced-motion` (Claude, rediseño de la bienvenida tipo pase desbloqueado).
- [ ] Muro: microinteracción al tocar "Puedo ayudar" (la celda se llena). Hecho por Claude en `diseno/muro-pulido`: la publicación nueva entra desde arriba, "Útil" se rellena al marcarlo y las hojas suben con movimiento corto.
- [ ] Carnet: versión "para compartir" del carnet como imagen vertical 1080 × 1920 (historia de Instagram).
- [ ] Estados vacíos con ilustración propia de celdas (sin abejas literales).
- [ ] Revisar contraste AA de textos `--ink-3` / `--ink-4` sobre crema.
- [ ] Escritorio (≥ 1024 px): hoy es la app centrada; evaluar una vista de dos columnas.
- [x] Beneficios: sumar las categorías nuevas (Claude, con permiso de Jhon) **Apoyo para emprender**, **Aprender** y **Vender** a `CATS_B`, `TITULO` e `ICONO_CAT` en `src/screens/Beneficios.jsx`. Ya hay 7 filas con esas categorías en la tabla `beneficios` (Campus Nova, Ley 1780, Fondo Emprender, Perfil de Negocio, Biblioteca, Cámara de Comercio, HubSpot). Hasta que se agreguen, solo salen en destacados, en la búsqueda y en el filtro Gratis. Títulos sugeridos: "Para empezar tu emprendimiento", "Para aprender gratis" y "Para vender". Detalle en `docs/beneficios/investigacion-2026-11.md`.
- [x] Beneficios: en `PRIMERO` (`src/screens/Beneficios.jsx`) dar prioridad a Campus Nova, Ley 1780 y Google AI Plus. Spotify sigue destacado, al final del carrusel (decisión de Jhon).

## Datos y lógica (Claude)
- [ ] Notificaciones dentro de la app cuando alguien responde tu publicación.
- [ ] Panel de métricas para la validación (OE3): publicaciones, respuestas, conexiones y asistencias por día.
- [x] Recuperar el carnet en otro dispositivo: hecho con el correo Javeriana (`docs/cuenta/README.md`). Falta que Jhon active el proveedor Azure.
- [ ] Recordatorio semanal (notificación push) para volver a la app: necesita un servicio aparte.
- [ ] Probar en teléfono físico (iOS y Android) y con lector de pantalla; el repo solo tiene pruebas en navegador de escritorio emulando celular.
- [ ] Los pasos del reto ya no se muestran en la tarjeta de Encuentro (siguen en la base, `retos.pasos`): si se quieren de vuelta, usar un desplegable.
- [ ] Moderación: botón "reportar" en publicaciones.
- [ ] Imágenes reales: columna `imagen_url` en `publicaciones` (foto de producto) y portada de portafolio en `perfiles`, con almacenamiento y RPC. La auditoría UI (`docs/auditoria-ui/informe.md`, F3) lo pide para que el muro y el directorio dejen de ser solo texto.
- [ ] Beneficios: revisar cada mes Miro (pausado el 2026-11-04 porque no recibe solicitudes) y las convocatorias de Fondo Emprender. Google AI Plus se puede reclamar hasta el 2026-12-31: ese día poner `activo = false`. Ya hay tareas programadas en la sesión de Claude para ambas cosas (revisión el día 5 de cada mes y la pausa de Google AI Plus el 2027-01-01).
- [ ] Orden de destacados de Beneficios: hoy el componente pone primero Adobe, Dominio web, Framer y Microsoft 365 con una lista fija; lo ideal es ajustar `orden` en la tabla `beneficios`.

## Pendientes de Jhon
- [ ] Activar "Guardar con correo Javeriana": registrar la app en Microsoft Entra y activar el proveedor Azure en Supabase. Pasos en `docs/cuenta/README.md`.
- [ ] Revisar cada mes la tabla `convocatorias` (las tres de Corfecali cierran el 10 de noviembre de 2026).

## Decisiones de Jhon
- [ ] Fecha y lugar reales del Encuentro 01 (hoy dice "por confirmar") y si "Noche de marcas" es el formato definitivo.
- [ ] Logos de Beneficios: en gris (hoy) o a color.
- [ ] Panal: ¿sale de toda la app? Sigue en Mi carnet, en la pantalla de una publicación propia y en el aviso "se sumó una celda al panal".
- [ ] Talleres reales: cuando haya uno, agregarlo en `talleres` con `es_ejemplo = false`.
- [ ] Cuándo quitar los perfiles de ejemplo.
