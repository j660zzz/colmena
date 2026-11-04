# Encuentro: por qué funciona

Fecha: 4 de noviembre de 2026. Pedido de Jhon: que Encuentro tenga un factor determinante, difícil de derrumbar, basado en cómo funcionan comunidades exitosas.

## El problema
Un encuentro presencial mensual, solo, es un evento más: es fácil no ir y no deja nada entre un mes y otro. Además, en los eventos gratis no llega una parte grande de los inscritos. Los proveedores de software para eventos hablan de 30 % a 60 %, pero son cifras de vendedores, no estudios ([Ticket Spot](https://ticketspotapp.com/blog/automated-reminders-reduce-no-shows), [Eventtia](https://www.eventtia.com/?p=92920)).

## Lo que funciona en otras comunidades
| Comunidad | Qué hace | Qué tomamos |
|---|---|---|
| **Dominican University of California** (estudio de Gail Matthews, 267 participantes) | Más del 70 % de quienes escribieron su meta y mandaron avances semanales a un amigo la lograron, contra 35 % de quienes no la escribieron ni la compartieron ([resumen oficial](https://www.dominican.edu/sites/default/files/2020-02/gailmatthews-harvard-goals-researchsummary.pdf), [nota de prensa](https://scholar.dominican.edu/news-releases/3/)) | Escribir la meta, compartirla con otros miembros y contar el avance cada semana |
| **Buildspace, Nights & Weekends** | Programa gratis de seis semanas: eliges una idea, la construyes con miles de personas, mandas actualizaciones y terminas en un demo day ([experiencia de un participante](https://prithvibharadwaj.substack.com/p/the-buildspace-experience), [otra](https://dev.to/adamelitzur/6-weeks-of-building-my-dream-with-buildspace-nights-weekends-3h6n)) | El mes como temporada: meta, avances y muestra final |
| **CreativeMornings** | Desayuno gratis una vez al mes, con un tema mensual común para todas las ciudades. Lo organizan voluntarios y existe desde 2008 en Nueva York; hoy está en cientos de ciudades ([Orlando](https://creativemornings.com/cities/orl/about), [San Diego Sun](https://thesandiegosun.com/creative-mornings-san-diego/)) | Ritual fijo y un tema por encuentro ("Cómo ponerle precio a tu trabajo") |
| **PechaKucha Night** | 20 imágenes de 20 segundos: presentaciones cortas y con ritmo. Nació en Tokio en 2003 y se hace en cientos de ciudades ([Klein Dytham](https://klein-dytham.com/pechakucha), [SD Architecture](https://sdarchitecture.org/programs/pechakucha)) | Cada persona tiene 3 minutos para mostrar su avance |
| **Grupos de pares (mastermind)** | Grupos pequeños que se reúnen siempre y se piden cuentas. No hay estudios controlados; la evidencia es la de metas y rendición de cuentas ([SK Murphy](https://www.skmurphy.com/blog/2026/01/27/masterminds-help-founders-with-empathy-feedback-follow-through/)) | Ver las metas de otros miembros y su último avance |

## Lo que se construyó: el mes en Colmena
1. **Semana 1. Escribe tu meta.** Una frase: "Conseguir mi primer cliente". Queda visible para los demás miembros.
2. **Semanas 2 y 3. Cuenta tu avance.** Una frase y, si quieres, un link. Cada avance aparece en tu tarjeta de meta.
3. **Encuentro. Muéstralo.** Te apuntas a mostrar tu avance y tienes 3 minutos. La app muestra quién se apuntó.
4. **Cumplirla suma 2 puntos a tu nivel**, igual que las demás acciones.

Así, Encuentro deja de ser solo una fecha: es el cierre de un mes en el que cada persona avanzó en algo concreto. Las demás piezas lo alimentan:
- El **Muro** es donde pides ayuda para tu meta.
- Las **ferias y convocatorias** son lugares para usar lo que lograste.
- El **reto** practica una habilidad.
- El **panal** cuenta las ayudas.

## Por qué es difícil de derrumbar (argumentos para los jurados)
- **Hay evidencia:** escribir la meta y reportar avances tiene respaldo en un estudio publicado por la universidad, no es una suposición del proyecto.
- **No es nuevo para la gente:** el formato de temporada con muestra final ya funciona con jóvenes en Buildspace, y el ritual mensual funciona en CreativeMornings.
- **Responde al problema de asistencia:** quien tiene una meta escrita y se apuntó a mostrarla tiene una razón concreta para ir.
- **Usa lo que ya existe:** carnet, nivel, muro y encuentro. No es una función aislada.
- **Cuesta muy poco:** una frase por semana. Está pensado para estudiantes con poco tiempo.

## Datos
Migración `supabase/migraciones/20261104_metas_del_mes.sql`. Tablas `metas` (una por miembro y encuentro) y `avances` (máximo 10 por meta). Lectura pública y escritura solo por RPC: `guardar_meta`, `contar_avance`, `alternar_muestra` y `marcar_meta_cumplida`. Tres metas de ejemplo pertenecen a perfiles de ejemplo y se ven con la etiqueta "Ejemplo".

## Pendiente
- Recordatorio semanal para contar el avance: por ahora la app lo pide al entrar a Encuentro. Una notificación push necesitaría un servicio aparte.
- Medir en la validación cuántos miembros escriben su meta, cuántos cuentan avances y cuántos la cumplen.
