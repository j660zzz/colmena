# AGENTS.md — reglas para cualquier agente que trabaje en Colmena

Este repo lo trabajan varios agentes a la vez (Claude, Gemini en Antigravity, otros). Léelo completo antes de tocar algo.

## Qué es Colmena
App web instalable (PWA) del Proyecto de Grado de Jhon Alexander Marín Rivera, Diseño de Comunicación Visual, Pontificia Universidad Javeriana Cali. Título oficial del proyecto: **"Sistema articulado de apoyo para el emprendedor local"**. Colmena es el nombre del sistema diseñado.

Conecta a estudiantes emprendedores de DCV que hoy trabajan aislados. Tres pilares:
- **Símbolo** → Carnet (identidad, pertenencia, insignias).
- **Encuentro** → Muro necesito/ofrezco (el núcleo, el "perro caliente") + encuentro presencial mensual.
- **Herramienta** → calculadora de precios y fichas prácticas.

Promesa: "Donde el que empieza deja de estar solo." Remate: "Solos, celdas sueltas; juntos, colmena."

## Reparto de trabajo (para no pisarse)
| Zona | Archivos | Dueño principal |
|---|---|---|
| Capa visual | `src/styles/app.css`, marcado JSX de `src/screens/*` y `src/components/ui.jsx` | Agente de diseño (Antigravity/Gemini) |
| Tokens de marca | `src/styles/tokens.css` | Solo con aprobación de Jhon |
| Datos y lógica | `src/lib/*`, `supabase/*` | Claude |
| Contenido | `src/data/contenido.js` | Cualquiera, revisado por Jhon |

Si un cambio visual necesita un dato nuevo, **no inventes columnas ni llamadas**: déjalo anotado en `TODO-AGENTES.md` y sigue con lo visual.

## Sistema de marca v2.0 (bloqueado)
**Fuente de verdad:** `docs/marca/colmena-brand-spec.md` y `docs/marca/colmena-tokens.json`. Si algo de este archivo choca con el spec, manda el spec. Brand board de referencia: `docs/marca/brand-board-v2.png`.

- **Solo 5 colores, todos planos (cero degradados):**
  - Polen `#FFF200`: color principal. En la interfaz, solo en botón o acción principal, indicador activo, resaltados, insignias ganadas y piezas de marca (carnet).
  - Tinta `#0F0F0D`: texto, logotipo, superficies oscuras.
  - Blanco `#FFFFFF`: superficies y tarjetas.
  - Niebla `#F2F2EE`: fondo de interfaz.
  - Verde `#0F7A66`: SOLO semántico. "Ofrezco" = píldora Verde con texto Blanco; "confirmado" = fondo Verde al 12 % con texto Verde. Nunca decorativo.
- **Texto sobre Polen siempre en Tinta.** Polen nunca como texto ni logotipo sobre Blanco o Niebla (1,17:1, ilegible).
- **Tipografía:** Space Grotesk 700/600 (logotipo, títulos, cifras y el titular de cada publicación) · Hanken Grotesk 400/600 (interfaz y texto corrido, incluido el cuerpo de las publicaciones) · JetBrains Mono 500 (solo número de carnet y cifras de la calculadora).
- **Símbolo:** la celda abierta, copiada literal del SVG del spec (`CeldaAbierta` en `src/components/ui.jsx`). No se redibuja, rota ni deforma.
- **Avatares:** hexágono de punta arriba, fondo Tinta, iniciales en Polen.
- Prohibido: abejas o mascotas, panal cubriendo todo un fondo, estética institucional (sellos, escudos, azul), lorem ipsum.
- Personalidad: **colectivo, útil, caluroso**. Retícula de 8 pt, objetivos táctiles de 44 px mínimo, respetar `prefers-reduced-motion`.

## Interfaz actual: Bloques · Vínculo
Marca arriba, tarjetas del Muro alternando Blanco y Tinta, barra para publicar en Polen y navegación flotante en Tinta. Decisiones y verificación en `design-qa.md`; exploraciones en `mockups/rediseno-ui/`.

## Imágenes de terceros
El repo es público. No subas referencias, capturas ni recursos de otros diseñadores o marcas: describe en texto lo que se toma de cada referencia.

## Reglas de contenido
- **Cero datos inventados presentados como reales.** Los perfiles y publicaciones de muestra tienen `es_ejemplo = true` y se muestran con la etiqueta "Ejemplo". No quites esa etiqueta.
- No pongas cifras de miembros, asistentes o encuentros pasados que no salgan de la base de datos.
- Español de Colombia, tono cercano y directo, tuteo.

## Datos (Supabase)
- Lectura pública con la llave publicable; **toda escritura pasa por funciones RPC** que validan la clave del dispositivo (ver `supabase/README.md`).
- No hay cuentas: al crear el carnet el servidor devuelve `{id, clave}` y se guarda en `localStorage` (`src/lib/session.js`).
- No cambies el esquema desde el cliente ni agregues políticas de escritura directa.

## Cómo correrlo
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/ con la PWA
```

## Flujo con Git
- Trabaja en una rama (`diseno/<tema>` o `datos/<tema>`), haz commits pequeños y abre PR o avisa antes de fusionar a `main`.
- `main` es lo que está publicado. Antes de empezar: `git pull`.
