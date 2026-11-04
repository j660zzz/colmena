# Encuentro: talleres y una noche al mes para mostrar tu marca

Fecha: 4 de noviembre de 2026. Jhon descartó la meta del mes y el panal de Encuentro porque no los sentía relevantes para el público. Esta es la versión que los reemplaza.

## Para quién es
Estudiantes de DCV de 18 a 23 años que ya tienen o quieren tener un emprendimiento. Lo que más dicen necesitar no es motivación: son **habilidades prácticas** y **visibilidad**.
- En una encuesta global de Samsung, casi 7 de cada 10 jóvenes de la generación Z dijeron que no tienen las habilidades para empezar su emprendimiento, y el 60 % que no tienen tiempo ([Samsung, 2024](https://news.samsung.com/us/new-samsung-study-for-nearly-70-percent-gen-z-side-hustlers-ai-critical-to-success)).
- En el reporte de ZenBusiness 2026, los fundadores jóvenes usan la IA sobre todo para diseño y piezas creativas (31 %), finanzas (25 %) y contenido de marketing (24 %). El 70 % gasta más de la mitad de su publicidad en redes ([ZenBusiness, 2026](https://www.zenbusiness.com/media-assets/State_of_Entrepreneurship_Report_2026.pdf)).
- Ambas son encuestas de empresas que venden productos o servicios: sirven como señal, no como prueba.

## Qué se construyó
1. **Noche de marcas (Encuentro 01).** Cada marca se presenta en un minuto, hay un taller corto de reels con el celular y un rato de conexiones: quien necesita algo encuentra a quien lo hace. Se vota el taller del mes siguiente.
2. **A quién vas a conocer.** Lista de quienes se inscribieron, con su marca y su habilidad. Toca para ver su carnet.
3. **Talleres.** Cortos (45 min a 2 h), presenciales o virtuales y dictados por miembros:
   - Reels con el celular
   - Claude Code para tu primera página web
   - Fotos de producto
   - Un mes de contenido en una tarde
   - IA para tu emprendimiento
   - WhatsApp Business

   Los seis son **de ejemplo** y se ven con la etiqueta "Ejemplo". Con "Me interesa" se registra qué taller quieren los miembros, y esa cifra sí es real: sirve para decidir cuál programar primero.
4. **Dicta un taller.** Cualquier miembro puede proponer uno. La propuesta llega al buzón `solicitudes_beneficio` con el nombre empezando por `[Taller]`. Enseñar también sirve a quien enseña; los estudios que se citan sobre esto (Chase et al., 2009) no se verificaron directamente, así que no se usan como cifra.
5. **Ferias y convocatorias** reales en Cali (ver `docs/convocatorias/README.md`) y el **reto de la semana**.

## Datos
Migración `supabase/migraciones/20261104_talleres.sql`:
- Retira las tablas `metas` y `avances`, que no tenían datos reales.
- Crea `talleres` (con `es_ejemplo`) y `taller_interes`, con la función `alternar_interes_taller`.
- Cambia el título, la agenda y el "qué llevar" del Encuentro 01.

## Capturas
`encuentro-1.png` y `encuentro-2.png` (390 × 844).
