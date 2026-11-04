# Íconos Colmena

Kit propio, dibujado para Colmena. Todos viven en `I` dentro de `src/components/ui.jsx` y se usan con `<Icon n="nombre" />`. Hoja de muestra: `kit.png` (se genera desde `kit.html`).

## Reglas
- Retícula de 24 × 24 con área útil de 3 a 21.
- Trazo de 1,75 (el componente lo aplica por defecto). Remates y uniones redondos.
- Esquinas de radio 2 a 2,5 en rectángulos.
- El hexágono de punta arriba es el motivo de marca: Carnet (`card`) y Verificado (`seal`).
- Sin logos de terceros. WhatsApp se representa con un globo de chat (`wa`) e Instagram con una cámara (`ig`).
- Cobra (`cash`) e Intercambia (`deal`) son pareja: la misma moneda, con signo de pesos o con dos flechas que se cruzan. Siempre aparecen juntos en la insignia "Cobra o intercambia".

## Qué se corrigió (4 de noviembre de 2026)
- El sello de Verificado tenía los picos desiguales: ahora es un hexágono con chulo.
- Tamaños desiguales: `$`, mano, bombillo y apretón de manos se veían más pequeños que el resto.
- Esquinas mezcladas (documento, candado, papelera rectos; calendario redondeado): ahora todas son redondeadas.
- Se reemplazaron los logos de Instagram y WhatsApp por dibujos genéricos.

## Qué se corrigió (4 de noviembre de 2026, segunda revisión)
- Intercambia (`deal`) era un apretón de manos con muchos dedos: a 14–18 px se volvía una mancha y no hacía pareja con la moneda de Cobra. Ahora es la misma moneda con dos flechas que se cruzan. Se quitó su ajuste de escala.
- Necesito (`hand`) tenía cuatro dedos muy juntos que se empastaban en la píldora de 13 px. Ahora son tres dedos y el pulgar, con más aire entre trazos.
- `kit.html` y `kit.png` se regeneraron con los dibujos nuevos.

## Celda (contenedor con la forma del logo)
`Celda` en `src/components/ui.jsx` repite el símbolo como contenedor: el trazo abierto usa las coordenadas literales de la celda abierta (viewBox `8 3 84 94`, abertura en el lado derecho) y el hexágono interior es regular, concéntrico y separado del trazo por el mismo aire en los seis lados. Antes, el aro era un polígono SVG y el interior un `clip-path` CSS con otra proporción, por eso no se veían concéntricos; y el carnet de la bienvenida usaba un trazo con lados sueltos. Ahora se usa la misma forma en:
- los destacados del inicio (Tinta; el trazo se dibuja al entrar y queda gris cuando ya se vio),
- el visor (Tinta en pantallas claras, Blanco en oscuras),
- el ganador de la semana (Polen, como insignia ganada) en la tarjeta del inicio y en el visor,
- el carnet de la bienvenida ("Tú").
Los avatares de miembros siguen siendo hexágonos sólidos, y el indicador de nivel (`CeldaNivel`) sigue cerrando un lado por nivel.
