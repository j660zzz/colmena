# Colmena — Especificación de marca v2.0

Versión 2.0 · 30 de octubre de 2026 · Autor: Jhon Alexander Marín Rivera (Proyecto de Grado, Diseño de Comunicación Visual, Pontificia Universidad Javeriana Cali).
Este documento es la fuente de verdad del brand board. Si la imagen y este texto no coinciden, manda este texto.

## Instrucciones para una IA que use esta marca

1. Usa solo los valores HEX de la sección 3. No los estimes a partir de una imagen.
2. Usa solo las tres tipografías de la sección 4, con los pesos indicados.
3. El símbolo se dibuja con el SVG de la sección 2. No lo redibujes, no lo interpretes y no agregues una abeja.
4. El texto sobre Polen siempre va en Tinta. Polen nunca va como texto ni como logotipo sobre Blanco o Niebla.
5. Escribe en español colombiano, tuteando, en registro de par (sección 8).
6. Antes de entregar, revisa la lista de prohibiciones (sección 9).

## 1. Qué es Colmena

- **Qué es:** sistema comunicacional colaborativo para estudiantes emprendedores de Diseño de Comunicación Visual (DCV) de la Javeriana Cali, de 18 a 23 años. Es la marca de una comunidad, no de un producto.
- **Problema que resuelve:** los emprendedores trabajan solos y aislados. Colmena los conecta.
- **Tres pilares:**
    - Símbolo (pertenencia): identidad, perfil, carnet e insignias de miembro.
    - Encuentro (conexiones): comunidad digital diaria (muro "necesito / ofrezco", directorio) y un encuentro presencial mensual.
    - Herramienta (conocimiento): fichas, plantillas y calculadora de precios.
- **Metáfora:** cada emprendedor es una celda; la estructura solo existe si las celdas están conectadas.
- **Idea central:** "Solos, celdas sueltas; juntos, colmena."
- **Promesa:** "Donde el que empieza deja de estar solo."
- **Personalidad:** colectivo · útil · caluroso. Cercana, viva, con calle pero con criterio.

## 2. Logotipo

### Símbolo: la celda abierta

Hexágono de punta arriba dibujado como contorno grueso, con una apertura en el lado derecho y un núcleo hexagonal sólido en el centro. La apertura representa la conexión con las demás celdas.

| Parte | Especificación |
|---|---|
| Contorno | Hexágono de punta arriba, radio 40 u, trazo 13 u, extremos y uniones redondeados |
| Apertura | Lado derecho, abierta entre y = 38 u e y = 62 u (60 % del lado derecho) |
| Núcleo | Hexágono sólido de punta arriba, radio 14 u, centrado |
| Caja (viewBox) | 8 3 84 94 |

SVG oficial (versión principal en Tinta):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="8 3 84 94">
  <path d="M84.64 38 L84.64 30 L50 10 L15.36 30 L15.36 70 L50 90 L84.64 70 L84.64 62" fill="none" stroke="#0F0F0D" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
  <polygon points="50,36 62.12,43 62.12,57 50,64 37.88,57 37.88,43" fill="#0F0F0D"/>
</svg>
```

### Wordmark y lockup

- Wordmark: "Colmena", en Space Grotesk Bold (700), con tracking de −0.045 em. Solo la C va en mayúscula.
- Lockup horizontal: símbolo a la izquierda y wordmark a la derecha.
    - La altura del símbolo es 1,1 veces la altura de la fuente.
    - El espacio entre el símbolo y el wordmark es de 0,26 em.
    - El símbolo y el wordmark van centrados en el eje vertical.
- Área de respeto: alrededor del lockup, deja como mínimo el alto del núcleo del símbolo.
- Tamaño mínimo:
    - Lockup: 96 px de ancho en pantalla y 25 mm en impresión.
    - Símbolo solo: 16 px.

### Versiones permitidas

| Versión | Fondo | Símbolo | Núcleo | Wordmark | Uso |
|---|---|---|---|---|---|
| Principal | Polen `#FFF200` | Tinta | Tinta | Tinta | Piezas de marca, redes, carnet, ícono |
| Negativo | Tinta `#0F0F0D` | Polen | Polen | Blanco `#FFFFFF` | Fondos oscuros, video, presentaciones |
| Monocromo | Blanco o Niebla | Tinta | Tinta | Tinta | Documentos, interfaz clara, impresión a una tinta |

## 3. Color

| Nombre | HEX | RGB | Rol | Proporción de uso |
|---|---|---|---|---|
| Polen | `#FFF200` | 255 242 0 | Color principal de marca. Fondo de piezas de marca, botón principal, resaltados | ~35 % |
| Tinta | `#0F0F0D` | 15 15 13 | Texto, logotipo, superficies oscuras | ~30 % |
| Blanco | `#FFFFFF` | 255 255 255 | Superficies y tarjetas | ~20 % |
| Niebla | `#F2F2EE` | 242 242 238 | Fondo de interfaz | ~14 % |
| Verde | `#0F7A66` | 15 122 102 | Solo semántico: "ofrezco", "confirmado", éxito | ≤ 1 % |

### Reglas de contraste (WCAG)

| Combinación | Contraste | Regla |
|---|---|---|
| Tinta sobre Polen | 16,4 : 1 | Permitido. Es la combinación principal |
| Polen sobre Tinta | 16,4 : 1 | Permitido |
| Polen sobre Blanco | 1,17 : 1 | Prohibido: no se lee |
| Polen sobre Niebla | 1,04 : 1 | Prohibido: no se lee |

### Impresión

- Polen está muy cerca del amarillo de proceso (CMYK 0 / 0 / 100 / 0), así que se reproduce bien en impresión. Antes de una impresión final, pide una prueba de color a la imprenta.
- No hay equivalencia Pantone definida en esta versión.

### Reglas de uso

- En piezas de marca (post, carnet, ícono, portada), Polen puede ser el fondo completo.
- En interfaces, el fondo es Niebla o Blanco, y Polen se reserva para el botón principal, el indicador activo y los resaltados.
- Verde nunca se usa como decoración. Solo comunica un estado.
- No hay degradados. Todos los colores son planos.

## 4. Tipografía

Las tres familias son gratuitas y están en Google Fonts.

| Familia | Pesos | Rol |
|---|---|---|
| Space Grotesk | 700 (títulos, logotipo), 600 (cifras destacadas) | Logotipo, títulos y cifras |
| Hanken Grotesk | 400 (cuerpo), 600 (subtítulos, botones) | Interfaz y texto corrido |
| JetBrains Mono | 500 | Solo números de carnet y datos |

### Jerarquía de referencia

| Nivel | Familia y peso | Tamaño / interlineado | Tracking |
|---|---|---|---|
| Display | Space Grotesk 700 | 64–104 px / 1,0 | −0.045 em |
| Título | Space Grotesk 700 | 38 px / 1,0 | −0.04 em |
| Subtítulo | Hanken Grotesk 600 | 21 px / 1,15 | 0 |
| Cuerpo | Hanken Grotesk 400 | 16 px / 1,45 | 0 |
| Etiqueta | Hanken Grotesk 600, MAYÚSCULAS | 12–14 px | +0.12 em |
| Dato | JetBrains Mono 500 | 15 px / 1,2 | 0 |

- Resaltado de marca: una palabra clave puede llevar un fondo Polen con el texto en Tinta, como si estuviera marcada con resaltador. Ejemplo: "Juntos, **colmena.**"

## 5. Motivo: retícula de panal

- Retícula de hexágonos de punta arriba, dibujada solo con línea fina: 1,5–2 px en Tinta, con una opacidad del 10 al 24 %.
- Pueden ir rellenas una o pocas celdas, en Polen o en Tinta, para señalar una celda activa. Las demás quedan vacías.
- La retícula va en una esquina o en un borde, con una opacidad de 10 % o menos sobre fondos de color. Nunca cubre todo el fondo ni pasa detrás de un texto largo.

## 6. Avatar e ícono de app

- **Avatar:**
    - Recorte hexagonal de punta arriba, con fondo Tinta.
    - Iniciales en Polen, en Space Grotesk 700.
    - Si hay foto, va recortada en el mismo hexágono.
    - Indicador de actividad: un hexágono Polen pequeño con un anillo Tinta, en la esquina inferior derecha.
- **Ícono de app:**
    - Fondo Polen de borde a borde y símbolo en Tinta.
    - El símbolo ocupa el 58 % del lado del ícono.
    - Radio de esquina: 23 %, o la máscara del sistema operativo.
    - Debe leerse desde 32 px.

## 7. Aplicaciones

| Pieza | Especificación |
|---|---|
| Carnet de miembro | Formato CR80 (85,6 × 54 mm), fondo Polen, textos en Tinta. Arriba: lockup pequeño y etiqueta "MIEMBRO" (fondo Tinta, texto Polen). Centro: avatar hexagonal, nombre en Hanken 700 y nombre del emprendimiento en Hanken 500. Abajo: número de carnet con formato `COL-0000`, en JetBrains Mono 500, y estado ("Activa · DCV") con un hexágono Tinta. Retícula de panal al 10 % en la esquina inferior derecha |
| Post de Instagram | 1080 × 1080, fondo Polen completo. Frase en Space Grotesk 700, en Tinta; la primera parte de la frase al 55 % de opacidad. Arriba: celdas sueltas a la izquierda que se unen en panal a la derecha. Abajo: lockup pequeño |
| Insignia | Hexágono de punta arriba, fondo Polen y borde Tinta de unos 6 px. Texto en Space Grotesk 700, en Tinta (ejemplo: "1ª venta") |
| Etiquetas del muro | "Ofrezco": píldora con fondo Verde y texto Blanco. "Necesito": píldora con contorno Tinta de 1,5 px y texto Tinta. "Confirmado": fondo Verde al 12 % y texto Verde |

## 8. Voz

- Registro de par, nunca institucional. Tuteo y "nosotros".
- Directa, cálida, sin jerga corporativa.
- Frases base: "Solos, celdas sueltas; juntos, colmena." · "Donde el que empieza deja de estar solo." · "Aquí nadie arranca solo."

## 9. Prohibido

- Abejas, caricaturas o mascotas.
- Panal literal cubriendo todo un fondo.
- Polen como texto o logotipo sobre Blanco o Niebla.
- Degradados, sobre todo los azules o morados de startup.
- Estética de fundación, alcaldía o entidad pública: sellos, escudos, azul institucional.
- Cambiar la tipografía del logotipo, deformar el símbolo, rotarlo, delinear el wordmark o ponerle sombras.
- Usar Verde como color decorativo.
- Texto de relleno o lorem ipsum.

## 10. Tokens (JSON)

```json
{
  "brand": "Colmena",
  "version": "2.0",
  "color": {
    "polen":  { "hex": "#FFF200", "rgb": [255, 242, 0],   "role": "primary" },
    "tinta":  { "hex": "#0F0F0D", "rgb": [15, 15, 13],    "role": "text, dark surfaces" },
    "blanco": { "hex": "#FFFFFF", "rgb": [255, 255, 255], "role": "surface" },
    "niebla": { "hex": "#F2F2EE", "rgb": [242, 242, 238], "role": "ui background" },
    "verde":  { "hex": "#0F7A66", "rgb": [15, 122, 102],  "role": "semantic only" }
  },
  "usage": { "polen": 0.35, "tinta": 0.30, "blanco": 0.20, "niebla": 0.14, "verde": 0.01 },
  "font": {
    "display": { "family": "Space Grotesk", "weights": [600, 700], "tracking": "-0.04em" },
    "text":    { "family": "Hanken Grotesk", "weights": [400, 600] },
    "data":    { "family": "JetBrains Mono", "weights": [500] }
  },
  "shape": { "hexagon": "pointy-top", "appIconRadius": "23%", "cardRadius": "16-20px", "chipRadius": "999px" },
  "rules": {
    "textOnPolen": "tinta",
    "forbidden": ["polen on blanco", "polen on niebla", "gradients", "bees", "verde as decoration"]
  }
}
```
