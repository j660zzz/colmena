# AGENTS.md — reglas para cualquier agente que trabaje en Colmena

Este repo lo trabajan varios agentes a la vez (Claude, Gemini en Antigravity, otros). Léelo completo antes de tocar algo.

## Contexto rápido (léelo primero)
- **Estado y decisiones:** `docs/BITACORA.md` es el registro de lo que se construyó, lo que Jhon decidió y lo que sigue pendiente. Pendientes por agente: `TODO-AGENTES.md`.
- **Público:** estudiantes de DCV de 18 a 23 años que emprenden. Quieren rapidez e inmediatez: pantallas cortas, sin números que "chillen", sin espacios muertos, textos de una línea.
- **Producción y pruebas comparten la misma base de Supabase.** Aplicar una migración la deja en vivo para todos; los cambios de esquema los aprueba Jhon.
- Lo que Jhon ya descartó (no lo vuelvas a proponer sin preguntarle): la meta del mes con avances semanales, el panal dentro de Encuentro, SMS para guardar la cuenta.

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

## Interfaz actual
Marca arriba, portada con cifras reales (visitantes) o resumen propio (miembros), barra para publicar en Polen, tarjetas del Muro en Blanco con la acción principal en píldora Niebla de 44 px, listas compactas con logo en Beneficios, y navegación flotante en Tinta. Polen queda para la acción principal de cada pantalla.
- Cada pieza nueva tiene su carpeta en `docs/` con decisiones, fuentes y capturas: `muro-pulido`, `bienvenida`, `encuentro`, `convocatorias`, `beneficios`, `cuenta`, `iconos`.
- `design-qa.md` y `mockups/rediseno-ui/` documentan la primera versión (30 de octubre) y están desactualizados en varios detalles.
- **Íconos:** solo los del kit propio en `src/components/ui.jsx` (`I`). Sin logos de terceros ni de redes en el repo.
- **Movimiento:** 150 a 250 ms, sin rebote, y todo se apaga con `prefers-reduced-motion`.

## Imágenes de terceros
El repo es público. No subas referencias, capturas ni recursos de otros diseñadores o marcas: describe en texto lo que se toma de cada referencia.

## Reglas de contenido
- **Cero datos inventados presentados como reales.** Los perfiles y publicaciones de muestra tienen `es_ejemplo = true` y se muestran con la etiqueta "Ejemplo". No quites esa etiqueta.
- No pongas cifras de miembros, asistentes o encuentros pasados que no salgan de la base de datos.
- Español de Colombia, tono cercano y directo, tuteo.

## Voz y textos
Escribir como escriben las apps grandes en español (Mercado Pago, Google/Material): claro, corto y útil.
- Tuteo siempre, tono cordial y neutro. Nada de jerga ni regionalismos forzados ("me le mido", "una chimba", "sin cobrar un ojo", "embalarse").
- Decir qué hace cada cosa, no frases de eslogan. El eslogan va en piezas de marca, no en la interfaz.
- Vocabulario fijo: **ayuda** (no "mano"), **Participar** en el reto, **Útil** (no "Me sirve"), **Crear carnet**, **miembros** (no "la colmena" como sujeto).
- Errores: qué pasó y qué hacer ("No se pudo conectar. Revisa tu conexión."). Sin bromas.
- Botones con verbo: Publicar, Participar, Calcular, Guardar cambios.
- Cero datos sin fuente (nada de "evita el 80 %").

## Datos (Supabase)
- Lectura pública con la llave publicable; **toda escritura pasa por funciones RPC** que validan la clave del dispositivo (ver `supabase/README.md`).
- No hay contraseñas: al crear el carnet el servidor devuelve `{id, clave}` y se guarda en `localStorage` (`src/lib/session.js`). Para no perderlo, el miembro puede **guardarlo con su correo `@javerianacali.edu.co`** (Microsoft vía Supabase Auth; tabla privada `cuentas`). Esa sesión de Auth solo se usa un momento y se cierra; la app sigue usando la clave del dispositivo. Requiere que Jhon active el proveedor Azure (`docs/cuenta/README.md`).
- Las propuestas de miembros (beneficios, ferias, talleres) llegan a `solicitudes_beneficio`; el nombre empieza por `[Convocatoria]` o `[Taller]`.
- Todo lo de muestra lleva `es_ejemplo = true` y la etiqueta "Ejemplo", también los talleres.
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
