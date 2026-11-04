# Muro pulido

Rama `diseno/muro-pulido`, sobre `datos/beneficios-investigacion` (PR #7). Fecha: 4 de noviembre de 2026.
Capturas a 390 × 844, `deviceScaleFactor` 2: `antes/` es la versión de prueba del PR #7, `despues/` es esta rama. `comparacion-*.png` las pone lado a lado (antes a la izquierda). Las vistas con sesión usan un perfil de ejemplo con todas las RPC interceptadas: no se escribió nada en Supabase.

## Qué cambió y por qué

### 1. Tarjeta del muro
Antes cada publicación tenía unas 12 piezas y un botón negro grande. Ahora tiene 9 y ninguna pesa como un botón negro:

| Antes | Ahora |
|---|---|
| Avatar 40 px, nombre, línea de marca y rol | Avatar 36 px, nombre y una sola línea: `hace 2 días · Marca` (el rol se ve en el carnet) |
| Píldora Necesito/Ofrezco debajo del autor | Píldora arriba a la derecha, siempre en el mismo lugar, con ícono (mano para Necesito, destello para Ofrezco) |
| Etiquetas de categoría como píldoras y "Quedan N días" siempre | Categorías como texto corto (`Marca · Diseño`). "Quedan N h" solo cuando quedan menos de 24 h, en negrita si quedan menos de 3 |
| Línea divisoria | Se quitó: el espacio separa el pie |
| "Útil" con borde | "Útil" sin borde, en gris; al marcarlo pasa a Tinta y el pulgar se rellena |
| "N escribió" | Avatares y el número (el texto completo queda para lectores de pantalla) |
| Botón negro "Puedo ayudar" / "Me interesa" | Píldora Niebla de 44 px con el ícono de WhatsApp, a la derecha |

- **Ritmo:** las publicaciones cortas (sin cuerpo y titular de 70 caracteres o menos) usan menos relleno y un titular de 17 px. El cuerpo se corta en 3 líneas.
- **Necesito y Ofrezco** se distinguen por la píldora, su ícono, la posición fija, el verbo de la acción ("Puedo ayudar" / "Me interesa") y, en Ofrezco, la insignia de cobro junto a la píldora.
- **Coherencia (retícula de 8):** radio 20, relleno 16 (12 arriba en las cortas), 8 px entre tarjetas, una sola sombra (`--soft`) y todos los objetivos táctiles de 44 px.
- El muro completo pasó de 4.511 px a unos 3.660 px de alto con las mismas 11 publicaciones (19 % menos de desplazamiento).
- **Encabezado:** el composer en Polen se queda como la única acción principal de la pantalla. "Siguiente paso", pestañas y carrusel "Esta semana" se dejaron, con espaciados de 8 y el carrusel un poco más bajo.
- **Publicación propia:** "Compartir" y "Marcar resuelta" usan la misma píldora liviana; la papelera queda en la misma fila.

### 2. Cómo cobra cada persona
- Íconos nuevos dibujados como trazos propios en `Icon` (`src/components/ui.jsx`), con el mismo grosor y remates redondos: `cash` (signo de pesos) y `deal` (dos manos que se dan la mano).
- `src/components/Cobro.jsx`: insignia con los textos **Cobra**, **Intercambia** y **Cobra o intercambia**. Al tocarla se abre una hoja corta con la frase "Intercambiar es cambiar tu trabajo por el de otro miembro." y las tres opciones.
- Se ve en el carnet ("Cómo trabaja" y la ficha amarilla), en las tarjetas de Miembros y, solo con los íconos, junto a la píldora de las publicaciones Ofrezco.
- El editor del carnet usa los mismos íconos. "¿Cómo funciona?" tiene un tema nuevo con las tres opciones.
- No se cambió la base: se sigue leyendo `perfiles.intercambio` (`dinero`, `trueque`, `ambos`).

### 3. Bienvenida, ayuda y movimiento
- La primera pantalla ahora dice qué es Colmena ("Colmena conecta a estudiantes de DCV que emprenden.") y lista Muro, Beneficios y Encuentro. Se quitó el "pase" con "Costo $0".
- La pantalla del carnet muestra la insignia de cobro y explica el nivel en una línea.
- Movimiento: entradas de 200 a 240 ms con escalonado de 50 ms y sin rebote (antes 420 a 700 ms con sobreimpulso). Las hojas suben en 220 ms y el fondo se oscurece; los avisos aparecen en 180 ms; los botones se encogen al tocarlos; una publicación recién creada entra desde arriba. Todo se apaga con `prefers-reduced-motion`.
- El esqueleto de carga sigue la forma de la tarjeta nueva.

### 4. Textos
Tabla en la sección "Textos: antes → después". Los datos de `retos` y `encuentros` se cambiaron con la migración de solo datos `supabase/migraciones/20261104_textos_muro_pulido.sql` (ya aplicada). Los textos de `beneficios` no se cambiaron: ya eran claros y verificados.

## Referencias

Lo que se tomó de cada referencia, con fuente. Donde no encontré documentación pública oficial, lo marco como observación propia.

| Práctica | Fuente | Cómo se usó |
|---|---|---|
| Una tarjeta es un resumen corto que invita a tocar para ver más; agrupa pocas piezas relacionadas | Nielsen Norman Group, [Cards: UI-Component Definition](https://www.nngroup.com/articles/cards-component/) | Se quitó lo que no ayuda a decidir (rol, divisor, etiquetas en píldora). El detalle vive en el carnet |
| Las acciones complementarias van al pie; con más de dos, se usa un menú | Material Design 2, [Cards](https://m2.material.io/components/cards) | Pie con solo dos acciones (Útil y la principal) |
| Fila de acciones con íconos bajo cada publicación, sin botones grandes | Reseña de Threads en 9to5Google, [Threads Android app brief review](https://9to5google.com/2023/07/07/threads-android-app-brief-review/) | "Útil" como ícono con texto y sin borde |
| Rediseño centrado en el contenido, con la caja para publicar más pequeña | LinkedIn, [Desktop redesign puts conversations and content at the center](https://blog.linkedin.com/2017/january/19/linkedin-desktop-redesign-puts-conversations-and-content-at-the-center) | El contenido de la publicación es lo que más pesa; las acciones son secundarias |
| Las tarjetas de una misma sección comparten propiedades | GC Design System, [Card](https://design-system.canada.ca/en/components/card/design/) | Un radio, un relleno y una sombra para todo el muro |
| Límites de caracteres por parte de la tarjeta | Red Hat Design System, [Card guidelines](https://ux.redhat.com/patterns/card/guidelines/) | El cuerpo se corta en 3 líneas y las cortas se compactan |
| Metadatos en una línea gris junto al nombre (`autor · hace 2 h`) | Observación propia de Threads e Instagram; no encontré guía oficial publicada | Línea `hace 2 días · Marca` |
| La imagen o el título manda y las acciones aparecen poco o al pasar el cursor | Observación propia de Behance y Pinterest; no encontré guía oficial publicada | Titular en Space Grotesk como lo más visible |
| Distinguir tipos de contenido con etiqueta fija y verbo distinto, no solo con color | Observación propia de Mercado Libre (etiquetas como "Envío gratis" en un lugar fijo de la tarjeta); no encontré documentación pública de su sistema de diseño | Píldora fija arriba a la derecha con ícono + verbo de la acción |

Criterio propio (no es un hecho de las fuentes): usar Niebla y no Polen para la acción de cada tarjeta, para que Polen siga siendo la única acción principal de la pantalla (el composer), como pide la marca.

## Textos: antes → después

Solo los que cambiaron.

| Dónde | Antes | Después |
|---|---|---|
| Muro, final | Viste todo lo que hay por ahora. | No hay más publicaciones por ahora. |
| Muro, aviso | Lo marcado como Ejemplo no son personas reales. | Lo marcado como Ejemplo es de muestra: no son personas reales. |
| Muro, aviso al reabrir | Publicación activa otra vez | Tu publicación está activa otra vez |
| Muro, aviso al resolver | Marcada como resuelta | Marcaste la publicación como resuelta |
| Muro, botón de la propia | Resuelta | Marcar resuelta |
| Muro, respuestas | N escribió / N escribieron | (avatares y número) |
| Carrusel, calculadora | Materiales, horas y gastos fijos: la calculadora te da un precio en un minuto. | Suma materiales, horas y gastos fijos, y te da un precio sugerido. |
| Publicar, botón | Publicar en el muro | Publicar |
| Carnet, Cómo trabaja | Dinero / Intercambio / Ambos + "Cobra en dinero. Trabaja por un precio acordado." | Insignia "Cobra" + "Cobra por su trabajo. El precio lo acuerdan entre ustedes." |
| Carnet y ficha | Cobra en dinero / Prefiere intercambio / Dinero o intercambio | Cobra / Intercambia / Cobra o intercambia |
| Carnet, descripción | Acepta las dos formas, según el proyecto. | Cobra o intercambia, según el proyecto. |
| Miembros | Intercambio | Intercambia |
| Editar carnet | ¿Cómo prefieres trabajar? · Dinero / Intercambio / Ambos | ¿Cómo cobras? · Cobra / Intercambia / Cobra o intercambia + "Intercambiar es cambiar tu trabajo por el de otro miembro." |
| Editar carnet, aviso | Tu perfil fue borrado | Borramos tu perfil |
| Bienvenida 1 | Todo esto es gratis en Colmena. + Pase Colmena, Incluido, Costo $0 | Colmena conecta a estudiantes de DCV que emprenden. + Muro, Beneficios, Encuentro + "Es gratis." |
| Bienvenida 2, ejemplo | Hola, te vi en Colmena. ¡Puedo ayudarte! | Hola, te vi en Colmena. Puedo revisarte el logo. |
| Bienvenida 2 | Quien puede ayudarte toca “Puedo ayudar” y te escribe por WhatsApp. No hay intermediarios ni comisiones. | Quien puede ayudarte toca “Puedo ayudar” y te escribe por WhatsApp. Si ves algo que te sirve, toca “Me interesa”. Sin comisiones. |
| Bienvenida 4 | Muestra lo que sabes hacer para que otros miembros te encuentren. Con él publicas, escribes por WhatsApp y usas los descuentos de aliados. Subes de nivel cada vez que ayudas. No necesitas correo ni contraseña. | Muestra lo que sabes hacer y si cobras o intercambias. Lo necesitas para publicar y escribirles a otros miembros. No pide correo ni contraseña. + "Tu nivel sube cuando ayudas, participas en retos y vas a los encuentros." |
| ¿Cómo funciona? | (no existía) | Cobra o intercambia: Cada carnet muestra cómo trabaja esa persona. Intercambiar es cambiar tu trabajo por el de otro miembro. |
| Beneficios, aliados | Negocios que dan descuento a los miembros de Colmena. Muestras tu carnet y listo. | Negocios que dan descuento a los miembros de Colmena. Para usarlos, muestra tu carnet. |
| Ficha "Mensajes para conseguir clientes" | A otro emprendedor de la colmena | A otro emprendedor de Colmena |
| Error sin carnet | Necesitas un perfil | Necesitas un carnet para hacer esto. |
| Error de clave | Tu sesión no es válida en este dispositivo. | No pudimos validar tu carnet en este dispositivo. Recarga la página e inténtalo otra vez. |
| Error de red en acciones | (mensaje técnico del navegador) | No se pudo conectar. Revisa tu conexión e inténtalo otra vez. |
| Límite al publicar | Vas muy rápido. Espera unos minutos para volver a publicar. | Publicaste varias veces seguidas. Espera unos minutos y vuelve a intentarlo. |
| Límite al escribir | Vas muy rápido. Espera un rato para escribir a más personas. | Les escribiste a muchas personas seguidas. Espera un rato y vuelve a intentarlo. |
| Calificar | Solo se califica una mano confirmada. | Solo puedes calificar una ayuda confirmada. |
| Confirmar | No puedes darte la mano a ti mismo. | No puedes confirmar una ayuda contigo. |
| Escribir | Ese eres tú. | Esta publicación es tuya. |
| Confirmar | Estado no válido | No se pudo guardar. Inténtalo otra vez. |
| Base · Reto 01, pasos | Te inscribes · Subes tu propuesta como link antes del cierre | Inscríbete · Sube tu propuesta como link antes del cierre |
| Base · Encuentro 01, título | Cómo cobrar lo que vales | Cómo ponerle precio a tu trabajo |
| Base · Encuentro 01, qué llevar | Tu último presupuesto, aunque sea escrito a mano. Vamos a trabajar sobre casos reales. | Tu último presupuesto, aunque sea escrito a mano. Lo usamos en el taller. |

Los errores del servidor se reescriben en `src/lib/store.jsx` (las funciones RPC no se tocaron).

## Verificación
- `npm run build`: sin errores.
- Capturas de antes y después revisadas lado a lado. Lo que salió peor en la primera pasada y se corrigió: la hora se cortaba con marcas largas (ahora va primero), se perdía "Quedan 7 h" (vuelve cuando quedan menos de 24 h), la papelera de la publicación propia bajaba de línea y la insignia del carnet no se veía sobre Niebla.
- Sin errores de JavaScript en ninguna captura.
- No se cambió `src/styles/tokens.css`, el esquema ni las políticas de Supabase.
