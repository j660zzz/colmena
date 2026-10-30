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

## Sistema de marca (bloqueado)
- **Colores**: solo los de `tokens.css`. Tinta `#17140F`, crema `#F7F3EB`, blanco.
- **Ámbar `#F5A623`** se usa SOLO en: botón primario, pill NECESITO, insignia ganada, indicador de pestaña activa. No lo uses de fondo ni de decoración.
- **Verde `#0F7A66`** es SOLO semántico: OFREZCO y estados confirmados.
- **Tipografía por rol**: Space Grotesk (logotipo, títulos, cifras) · Hanken Grotesk (toda la interfaz) · JetBrains Mono (solo número de carnet y cifras de la calculadora). No agregar otras fuentes.
- **Hexágono estructural, no decorativo**: avatares, insignias, marca de agua del carnet. Nada de abejas literales, caricaturas ni fondos de panal saturados.
- Personalidad: **colectivo, útil, caluroso**. Referentes de solidez: Google, Uber, Pinterest. Nada de gradientes "startup" ni look de fundación o entidad pública.
- Retícula de 8 pt. Objetivos táctiles de 44 px mínimo. Respetar `prefers-reduced-motion`.

## Reglas de contenido
- **Cero datos inventados presentados como reales.** Los perfiles y publicaciones de muestra tienen `es_ejemplo = true` y se muestran con la etiqueta "Ejemplo". No quites esa etiqueta.
- No pongas cifras de miembros, asistentes o encuentros pasados que no salgan de la base de datos.
- Español de Colombia, tono cercano y directo, tuteo.

## Datos (Supabase)
- Lectura pública con la llave publicable; **toda escritura pasa por funciones RPC** que validan la clave del dispositivo (`supabase/schema.sql`).
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
