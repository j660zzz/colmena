# Íconos Colmena

Kit propio, dibujado para Colmena. Todos viven en `I` dentro de `src/components/ui.jsx` y se usan con `<Icon n="nombre" />`. Hoja de muestra: `kit.png` (se genera desde `kit.html`).

## Reglas
- Retícula de 24 × 24 con área útil de 3 a 21.
- Trazo de 1,75 (el componente lo aplica por defecto). Remates y uniones redondos.
- Esquinas de radio 2 a 2,5 en rectángulos.
- El hexágono de punta arriba es el motivo de marca: Carnet (`card`) y Verificado (`seal`).
- Sin logos de terceros. WhatsApp se representa con un globo de chat (`wa`) e Instagram con una cámara (`ig`).
- Ajuste óptico: `deal` (Intercambia) se dibuja un 14 % más grande sin engrosar el trazo (`ESCALA` en `ui.jsx`).

## Qué se corrigió (4 de noviembre de 2026)
- El sello de Verificado tenía los picos desiguales: ahora es un hexágono con chulo.
- Tamaños desiguales: `$`, mano, bombillo y apretón de manos se veían más pequeños que el resto.
- Esquinas mezcladas (documento, candado, papelera rectos; calendario redondeado): ahora todas son redondeadas.
- Se reemplazaron los logos de Instagram y WhatsApp por dibujos genéricos.
