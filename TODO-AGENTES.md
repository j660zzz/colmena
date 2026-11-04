# Pendientes — tablero compartido entre agentes

Marca con tu nombre lo que tomes. Lo visual es de diseño; lo de datos, de Claude.

## Diseño (Antigravity / Gemini)
- [x] Bienvenida: animación de entrada de las celdas, respetando `prefers-reduced-motion` (Claude, rediseño de la bienvenida tipo pase desbloqueado).
- [ ] Muro: microinteracción al tocar "Puedo ayudar" (la celda se llena) y al publicar (la tarjeta nueva entra desde arriba).
- [ ] Carnet: versión "para compartir" del carnet como imagen vertical 1080 × 1920 (historia de Instagram).
- [ ] Estados vacíos con ilustración propia de celdas (sin abejas literales).
- [ ] Revisar contraste AA de textos `--ink-3` / `--ink-4` sobre crema.
- [ ] Escritorio (≥ 1024 px): hoy es la app centrada; evaluar una vista de dos columnas.

## Datos y lógica (Claude)
- [ ] Notificaciones dentro de la app cuando alguien responde tu publicación.
- [ ] Panel de métricas para la validación (OE3): publicaciones, respuestas, conexiones y asistencias por día.
- [ ] Recuperar el carnet en otro dispositivo (código de recuperación).
- [ ] Moderación: botón "reportar" en publicaciones.
- [ ] Imágenes reales: columna `imagen_url` en `publicaciones` (foto de producto) y portada de portafolio en `perfiles`, con almacenamiento y RPC. La auditoría UI (`docs/auditoria-ui/informe.md`, F3) lo pide para que el muro y el directorio dejen de ser solo texto.
- [ ] Orden de destacados de Beneficios: hoy el componente pone primero Adobe, Dominio web, Framer y Microsoft 365 con una lista fija; lo ideal es ajustar `orden` en la tabla `beneficios`.

## Decisiones de Jhon
- [ ] Fecha y lugar reales del Encuentro 01 (hoy dice "por confirmar").
- [ ] Cuándo quitar los perfiles de ejemplo.
