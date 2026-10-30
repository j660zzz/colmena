# Colmena · Exploración del Muro

Tres mockups independientes para elegir dirección visual. No son implementación de la app.

## Segunda exploración: Bloques

Tras elegir Bloques como base, `ronda-2.html` lo compara **sin modificarlo** con dos evoluciones:

- **Bloques · Vínculo:** identidad al comienzo de la tarjeta, cabecera corta y una invitación explícita a publicar. Recomendación para priorizar reconocimiento entre compañeros.
- **Bloques · Directo:** cabecera compacta, primer bloque en Tinta y firma junto a la respuesta. Más contenido en el primer vistazo; simplifica la firma a nombre y marca.

Ambas reutilizan el mismo snapshot, orden y textos completos. Conservan etiquetas Ejemplo, fuentes, símbolo, cinco destinos y restricciones de color. No se implementa el rediseño de la app hasta elegir la definitiva. `variantes.css` contiene solo las reglas de estas dos nuevas propuestas.

`ronda-2-comparacion.png` muestra la vista inicial lado a lado. Los archivos `ronda-2-vinculo.png` y `ronda-2-directo.png` conservan las capturas de cada propuesta a 390 × 844.

- **Entre pares:** personas primero, tarjetas claras y navegación flotante.
- **Bloques:** mensajes grandes como afiches, superficies Niebla/Tinta.
- **Pulso:** apertura editorial y lectura continua.

## Verlos

Con `npm run dev` desde la raíz, abre `/mockups/rediseno-ui/` en la dirección que anuncie Vite. Cada iframe mide exactamente **390 × 844 CSS px**. Desplázate dentro de cada pantalla para ver las seis publicaciones.

`index.html` reúne las tres pantallas, pros/contras, recomendación y análisis individual de las seis referencias. `comparacion.png` conserva la vista inicial de las tres, lado a lado.

También se puede servir esta carpeta con cualquier servidor estático: no depende de React, de los módulos de la app ni de llamadas a Supabase. Los filtros operan sobre `data.json`; las demás acciones solo muestran un aviso de simulación.

## Fuentes

- Marca: `D:/colmena-brand-spec.md` y `D:/colmena-tokens.json`, versión 2.0, leídos el 30 de octubre de 2026. Prevalecen sobre la sección antigua de AGENTS.md y los neutros adicionales de tokens.css.
- Símbolo: SVG copiado literalmente del spec, sin reinterpretación.
- Contenido: lectura de Supabase público el 30 de octubre de 2026. Solo se conserva el contenido de los seis perfiles con `es_ejemplo = true` y sus seis publicaciones. `data.json` incluye IDs y fechas para rastrear el origen; no contiene claves ni sesiones.
- Referencias: seis imágenes aportadas por Jhon, copiadas a `assets/ref-*` para que el análisis siga siendo consultable.
- Fuentes: archivos WOFF2 de los paquetes @fontsource ya instalados. Solo Space Grotesk 700, Hanken Grotesk 400/600 y JetBrains Mono 500. Mono no se aplica al Muro, porque no muestra datos de carnet ni calculadora.
- Íconos: trazados existentes de `src/components/ui.jsx`.

## Decisiones

- Misma vista de visitante, mismas seis publicaciones completas, mismo orden y mismas etiquetas Ejemplo en las tres propuestas.
- No hay indicadores de conexión en línea, usuarios activos, métricas, reacciones o asistentes inventados. Los avatares apilados se identifican como perfiles de ejemplo.
- Solo se usan los cinco HEX autorizados. No se extiende el uso de Polen a grandes superficies; las tarjetas alternan Niebla y Tinta. Verde solo identifica Ofrezco.
- Los títulos de apertura son copy propuesto, no contenido atribuido a los miembros.
- Se conserva el modelo de cinco destinos; no se inventa un chat. Los filtros de tipo funcionan en el mockup. El filtro por categoría puede seguir en un control secundario durante una futura implementación; su ausencia aquí no supone eliminarlo de la app.
- No se modifica la app, tokens.css, src/lib ni supabase. No se despliega ni se hace push.

## Revisión

Se ejecutó `npm install` y `npm run dev` en `diseno/rediseno-ui` (base `7df5439`). Recorrido a 390 × 844: bienvenida, Muro, Miembros, Encuentro, Carnet sin sesión, creación de carnet sin enviar, carnet de Sara, Herramientas, calculadora y ficha de presupuesto. El código de todas las fichas comparte la misma pantalla; también se revisó el contenido de las seis.

Verificación visual y de navegador de los tres mockups: fuentes locales cargadas, seis textos completos y etiquetas Ejemplo, ausencia de desbordamiento horizontal, objetivos táctiles ≥44 px, filtros Todo/Necesito/Ofrezco, avisos de simulación, scroll hasta Daniela y prefers-reduced-motion. No hay animaciones automáticas.

No se ejecuta `npm run build` como aprobación de un rediseño implementado: esta sesión termina con la elección de estilo pendiente. La compilación de la app corresponde a la siguiente fase, después de elegir.
