# Métricas de validación (OE3)

Este documento define qué se mide, cómo se calcula y qué no se puede medir con los datos que hay hoy. Es la base del reporte que se entrega a los jurados y del script `scripts/metricas.mjs` (Bloque 2).

Objetivo del OE3: demostrar con datos que Colmena se usa y que conecta a las personas. Las métricas están separadas en seis bloques: activación, muro, conexión real, comunidad, retención y calidad.

## Reglas generales

### Tiempo
- **Zona horaria:** `America/Bogota`, igual que `src/lib/logic.js`.
- **Semana:** de lunes 00:00 a domingo 23:59:59.999, hora de Colombia. Una publicación del domingo a las 11:30 p. m. cuenta en esa semana, no en la siguiente.
- **Día:** calendario de Colombia, de 00:00 a 23:59:59.999.
- **Cohortes:** se agrupan por la semana de registro del carnet.
- Las fechas que llegan de Supabase están en UTC (`timestamptz`). Todas se convierten a hora de Colombia antes de agrupar.

### Reales y de ejemplo
El reporte siempre muestra dos bloques separados: **datos reales** y **muestra de ejemplo**. Nunca se suman. Si no hay datos reales, el reporte lo dice con una frase explícita y no muestra tablas en cero que parezcan resultados.

Una fila es de ejemplo si:

| Tabla | Regla |
|---|---|
| `perfiles` | `es_ejemplo = true` |
| `publicaciones` | `es_ejemplo = true` **o** su autor es un perfil de ejemplo |
| `ayudas` | su publicación es de ejemplo **o** el perfil que responde es de ejemplo |
| `me_sirve` | su publicación es de ejemplo **o** el perfil es de ejemplo |
| `conexiones` | cualquiera de los dos perfiles es de ejemplo |
| `asistencias` | el perfil es de ejemplo |
| `reto_participantes` | el perfil es de ejemplo |
| `reto_votos` | el votante o el participante es de ejemplo |
| `taller_interes` | el perfil es de ejemplo. **No** se excluye por el taller: marcar interés en un taller de ejemplo es un dato real (así lo decidió Jhon el 4 de noviembre) |
| `resenas_publicas()` | cualquiera de los dos perfiles (`de_id`, `para_id`) es de ejemplo, o su publicación es de ejemplo |

Los IDs de perfil se usan solo para cruzar tablas dentro del cálculo. Nunca salen en el reporte, el CSV, los registros ni las pruebas.

### Privacidad
- Solo cifras agregadas. Nada de nombres, marcas, Instagram, WhatsApp, bio, portafolio, textos de publicaciones ni IDs.
- **Grupos pequeños:** si una casilla de un desglose corresponde a menos de 3 personas, se escribe `menos de 3` en vez del número. Aplica a conteos por categoría, por cohorte, por día y por semana en los datos reales. Los ejemplos no se suprimen porque son personajes ficticios.
- Un porcentaje cuyo denominador sea menor que 3, o que tenga 1 o 2 casos en el numerador, se escribe `menos de 3`. Una mediana con menos de 3 datos también. Un cero sí se muestra.
- El cero se muestra como cero: no revela a nadie.

### Cómo se leen los vacíos
- `0` significa que hubo cero casos en el periodo.
- `—` significa que la métrica no aplica o que todavía no hay tiempo suficiente para medirla (por ejemplo, retención de la semana 4 de un carnet creado hace 10 días).
- `menos de 3` significa que hubo casos, pero son tan pocos que no se muestran.

## 1. Activación

### 1.1 Carnets creados por día y por semana
- **Pregunta para el jurado:** ¿está entrando gente nueva a Colmena?
- **Fórmula:** `count(perfiles)` agrupado por día o por semana de `created_at`, excluyendo ejemplos.
- **Tablas y columnas:** `perfiles.created_at`, `perfiles.es_ejemplo`.
- **Limitaciones:** un carnet creado no garantiza que la persona haya usado la app. No mide visitas ni registros abandonados.

### 1.2 % de carnets que publican algo en sus primeros 7 días
- **Pregunta:** de quienes crean su carnet, ¿cuántos llegan al Muro?
- **Fórmula:**
  - Numerador: carnets de la cohorte con al menos una `publicaciones.created_at` en `[perfiles.created_at, perfiles.created_at + 7 días)`.
  - Denominador: carnets de la cohorte que ya cumplieron 7 días completos al momento de generar el reporte.
  - Resultado: `numerador / denominador × 100`.
- **Tablas y columnas:** `perfiles.id`, `perfiles.created_at`, `publicaciones.autor_id`, `publicaciones.created_at`.
- **Limitaciones:** las publicaciones borradas no dejan rastro y bajan el numerador. La ventana es fija de 7 días, no “alguna vez”. Los carnets con menos de 7 días se muestran como `—` y no entran al denominador.

## 2. Muro

### 2.1 Publicaciones por día y por semana (Necesito vs. Ofrezco)
- **Pregunta:** ¿el Muro se está usando y para qué?
- **Fórmula:** `count(publicaciones)` por día o semana de `created_at`, separando `tipo = 'need'` y `tipo = 'offer'`, más el total. Excluye ejemplos.
- **Tablas y columnas:** `publicaciones.tipo`, `publicaciones.created_at`, `publicaciones.es_ejemplo`, `publicaciones.autor_id`.
- **Limitaciones:** mide lo que se publica, no lo que se lee.

### 2.2 % de publicaciones con al menos una respuesta
- **Pregunta:** ¿la gente encuentra respuesta cuando pide o ofrece algo?
- **Fórmula:** publicaciones del periodo con al menos una fila en `ayudas` (cualquier estado) creada después de la publicación, divididas entre el total de publicaciones del periodo. `respuesta = existe ayuda con publicacion_id = publicación.id y created_at >= publicación.created_at`.
- **Tablas y columnas:** `publicaciones.id`, `publicaciones.created_at`, `ayudas.publicacion_id`, `ayudas.created_at`.
- **Limitaciones:** una respuesta no es una ayuda confirmada. Las publicaciones recientes tienen menos tiempo para recibir respuesta, así que la última semana puede salir más baja.

### 2.3 Tiempo mediano hasta la primera respuesta
- **Pregunta:** ¿qué tan rápido responde la comunidad?
- **Fórmula:** para cada publicación del periodo con al menos una ayuda, se calcula `min(ayudas.created_at) - publicaciones.created_at` en horas. Se descartan diferencias negativas (error de datos). La métrica es la mediana de esas diferencias.
- **Tablas y columnas:** `publicaciones.created_at`, `ayudas.created_at`, `ayudas.publicacion_id`.
- **Limitaciones:** la mediana con menos de 3 respuestas se escribe `menos de 3`. No mide cuánto tardó la persona en leer el mensaje, solo el registro en la base.

### 2.4 % de publicaciones resueltas
- **Pregunta:** ¿los problemas y ofertas se cierran?
- **Fórmula:** publicaciones del periodo con `resuelta_at` distinto de nulo, divididas entre el total de publicaciones del periodo.
- **Tablas y columnas:** `publicaciones.resuelta_at`, `publicaciones.created_at`.
- **Limitaciones:** la marca la pone el autor; no hay verificación. Una publicación puede resolverse después del periodo en que se creó y aun así cuenta como resuelta. No se mide si la ayuda funcionó.

### 2.5 Publicaciones por categoría
- **Pregunta:** ¿en qué categorías se mueve el Muro?
- **Fórmula:** una publicación cuenta en cada categoría de su arreglo `categorias`. Por categoría: total de publicaciones, cuántas tuvieron al menos una respuesta y el porcentaje.
- **Tablas y columnas:** `publicaciones.categorias`, `ayudas.publicacion_id`.
- **Limitaciones:** una publicación puede sumar en varias categorías, así que la suma de la tabla no da el total del Muro. Las categorías con menos de 3 publicaciones reales se muestran como `menos de 3`.

## 3. Conexión real

### 3.1 Ayudas confirmadas por semana
- **Pregunta:** ¿cuántas manos se dieron de verdad?
- **Fórmula:** `count(ayudas)` con `estado = 'confirmada'`, agrupadas por la fecha de confirmación: `coalesce(ayudas.resuelta_at, ayudas.created_at)`. Excluye ejemplos.
- **Tablas y columnas:** `ayudas.estado`, `ayudas.resuelta_at`, `ayudas.created_at`, `ayudas.publicacion_id`, `ayudas.perfil_id`.
- **Limitaciones:** solo cuenta lo que el autor confirmó. Las ayudas `pendiente` y `no` no cuentan. Si el autor nunca confirma, la ayuda existe pero no se mide aquí. Confirmar una ayuda tarde la asigna a la semana en que se confirmó, no a la semana en que se escribió.

### 3.2 Miembros distintos que dieron o recibieron ayuda
- **Pregunta:** ¿cuántas personas participan de la conexión, no solo cuántas manos hay?
- **Fórmula:** para cada ayuda confirmada del periodo se identifican las dos partes:
  - Publicación `need`: quien ayuda es `ayudas.perfil_id`; quien recibe es `publicaciones.autor_id`.
  - Publicación `offer`: quien ayuda es `publicaciones.autor_id`; quien recibe es `ayudas.perfil_id`.
  - Se reportan tres cifras: personas distintas que dieron, personas distintas que recibieron y personas distintas en cualquiera de los dos papeles (unión, sin repetir).
- **Tablas y columnas:** `ayudas.estado`, `ayudas.resuelta_at`, `ayudas.perfil_id`, `publicaciones.tipo`, `publicaciones.autor_id`.
- **Limitaciones:** una misma persona puede dar y recibir en la misma semana y cuenta una vez en la unión. Se excluyen ayudas de ejemplo en las dos puntas.

### 3.3 Ayudas entre personas que no se conocían antes
- **Pregunta:** ¿Colmena está creando conexiones nuevas o solo formalizando las que ya existían?
- **Fórmula:** de las ayudas confirmadas del periodo, se cuentan las parejas (quien ayuda, quien recibe) que **no** tienen ningún registro anterior entre ellas:
  - otra fila en `ayudas` entre las mismas dos personas (en cualquier dirección y cualquier estado) con `created_at` anterior, o
  - una fila en `conexiones` entre las mismas dos personas (en cualquier dirección) con `created_at` anterior.
  Se reporta el conteo y el porcentaje sobre las ayudas confirmadas del periodo.
- **Tablas y columnas:** `ayudas.publicacion_id`, `ayudas.perfil_id`, `ayudas.created_at`, `ayudas.estado`, `conexiones.de_id`, `conexiones.a_id`, `conexiones.created_at`, `publicaciones.tipo`, `publicaciones.autor_id`.
- **Limitaciones:** es una **inferencia**, no una certeza. Si las personas ya se conocían por fuera de la app, no hay forma de saberlo. Tampoco cuenta como contacto previo haber coincidido en un encuentro, haber marcado “Útil” o haber visto el mismo Muro. Se dice así en el reporte para no venderlo como un dato exacto.

## 4. Comunidad

### 4.1 Conexiones
- **Pregunta:** ¿la gente está agregando a otras personas a su red?
- **Fórmula:** parejas distintas con fila en `conexiones`, agrupadas por la semana de `created_at`. Se cuenta una vez por pareja, sin importar la dirección (A→B y B→A son la misma conexión). Excluye ejemplos.
- **Tablas y columnas:** `conexiones.de_id`, `conexiones.a_id`, `conexiones.created_at`.
- **Limitaciones:** la app permite quitar una conexión; al generarse el reporte, una conexión eliminada desaparece también de las semanas pasadas.

### 4.2 Asistentes al encuentro
- **Pregunta:** ¿cuánta gente se suma al encuentro presencial?
- **Fórmula:** personas distintas con fila en `asistencias` por `encuentro_id`, agrupadas por la semana de `asistencias.created_at`.
- **Tablas y columnas:** `asistencias.encuentro_id`, `asistencias.perfil_id`, `asistencias.created_at`.
- **Limitaciones:** es la inscripción en la app, **no** la asistencia real al evento. No hay forma de verificar quién llegó.

### 4.3 Interesados en talleres
- **Pregunta:** ¿qué temas convocan?
- **Fórmula:** personas distintas con fila en `taller_interes` por `taller_id`, agrupadas por la semana de `created_at`. Excluye perfiles de ejemplo, no talleres de ejemplo.
- **Tablas y columnas:** `taller_interes.taller_id`, `taller_interes.perfil_id`, `taller_interes.created_at`.
- **Limitaciones:** “Me interesa” es una intención, no una inscripción. Se puede quitar y desaparece del histórico.

### 4.4 Participantes y votos del reto
- **Pregunta:** ¿el reto de la semana activa a la comunidad?
- **Fórmula:** participantes distintos por `reto_id` y votos por `reto_id`, agrupados por la semana de `created_at`. Se excluyen ejemplos.
- **Tablas y columnas:** `reto_participantes.reto_id`, `reto_participantes.perfil_id`, `reto_participantes.created_at`; `reto_votos.reto_id`, `reto_votos.votante_id`, `reto_votos.participante_id`, `reto_votos.created_at`. El link de la propuesta no se usa para esta métrica.
- **Limitaciones:** un participante sin link no es elegible para el premio, pero aquí cuenta como participación. Los votos se pueden alternar y el conteo es el estado actual. El reporte no dice quién va ganando.

## 5. Retención

### 5.1 Miembros activos por semana
- **Pregunta:** ¿cuántas personas vuelven y hacen algo?
- **Fórmula:** personas distintas con al menos una de estas acciones dentro de la semana:
  1. Crear una publicación.
  2. Escribirle a alguien por una publicación (`ayudas.created_at`).
  3. Confirmar una ayuda (`ayudas.resuelta_at` de una ayuda confirmada; cuenta para el autor de la publicación).
  4. Marcar “Útil” (`me_sirve.created_at`).
  5. Conectar con otra persona (`conexiones.created_at`).
  6. Inscribirse al encuentro (`asistencias.created_at`).
  7. Participar en el reto (`reto_participantes.created_at`).
  8. Votar en el reto (`reto_votos.created_at`, cuenta el votante).
  9. Marcar interés en un taller (`taller_interes.created_at`).
  10. Calificar una ayuda (`resenas_publicas().created_at`, cuenta `de_id`).
- **Tablas y columnas:** las de la lista, más `perfiles.id` para deduplicar.
- **Limitaciones:** crear el carnet **no** cuenta como acción: si contara, todo el mundo sería activo la semana 0. No mide visitas sin acción ni tiempo en la app.

### 5.2 Retención semana 1, 2 y 4 por cohorte de registro
- **Pregunta:** ¿la gente vuelve después de registrarse?
- **Fórmula:** para cada cohorte (carnets reales creados en una semana):
  - Semana 1: `[created_at + 7 días, created_at + 14 días)`.
  - Semana 2: `[created_at + 14 días, created_at + 21 días)`.
  - Semana 4: `[created_at + 28 días, created_at + 35 días)`.
  - Retenido = tuvo al menos una acción de la lista 5.1 dentro de esa ventana.
  - Resultado = retenidos / integrantes de la cohorte con la ventana ya cerrada × 100.
- **Tablas y columnas:** las de 5.1 y `perfiles.created_at`.
- **Limitaciones:** las ventanas son relativas al registro, no semanas calendario, para no mezclar personas que se registraron en días distintos. Una cohorte con menos de 3 integrantes con la ventana cerrada, o con 1 o 2 retenidos, se escribe `menos de 3`. Las ventanas que aún no cierran se muestran como `—`. No se puede comparar con la retención de quien nunca creó carnet.

## 6. Calidad

### 6.1 Promedio de estrellas y cantidad de reseñas
- **Pregunta:** ¿cómo califican la experiencia quienes recibieron o dieron una ayuda?
- **Fórmula:** `count(resenas_publicas())` y `avg(estrellas)` por semana de `created_at`. Se excluyen reseñas donde `de_id` o `para_id` es un perfil de ejemplo, o donde la publicación es de ejemplo. Nada de comentarios ni chips en el reporte.
- **Tablas y columnas:** solo la RPC `resenas_publicas()`: `estrellas`, `created_at`, `de_id`, `para_id`, `publicacion_id`.
- **Limitaciones:** la RPC muestra una reseña solo cuando las dos partes calificaron o cuando pasaron 7 días. Las reseñas todavía ocultas no cuentan, así que el promedio puede cambiar después. No se puede leer `calificaciones` directamente.

## 7. Lo que hoy no se puede medir

| Qué | Por qué no | Qué haría falta |
|---|---|---|
| Visitas, páginas vistas y usuarios únicos | No hay analítica ni registro de eventos | Tabla de eventos anónimos (propuesta en la sección 8) |
| Abandono del registro | No se guarda en qué paso se fue cada persona | Eventos por paso del registro |
| Instalaciones de la PWA | No se registra el evento `appinstalled` | Evento anónimo `pwa_instalada` |
| Personas que vieron una publicación sin interactuar | No hay registro de vistas | Evento anónimo de pantalla, sin guardar cuál publicación (no propuesto todavía) |
| Búsquedas y filtros usados | No se registran | Evento anónimo de búsqueda, sin guardar el texto (no propuesto todavía) |
| Clics a WhatsApp y conversaciones por fuera | Ocurren fuera de la app | Solo se puede medir el clic si se instrumenta |
| Asistencia real al encuentro | Solo existe la inscripción | Registro manual el día del evento o código de entrada |
| Si una ayuda resolvió el problema | Solo hay auto-reporte del autor | Nada confiable sin seguimiento |
| Relaciones previas por fuera de la app | No hay dato | Entrevistas o encuesta, no base de datos |
| Tiempo en la app y sesiones | No hay eventos de navegación | Eventos anónimos |
| Personas que llegan por un link compartido | No se registra el origen | Parámetro `utm` en los enlaces + evento anónimo |

Estas ausencias se dicen en el reporte. No se inventan cifras ni se usan las de otras herramientas.

## 8. Propuesta para medir visitas y abandono sin rastreo de terceros

No se aplica nada de esto sin aprobación de Jhon. El SQL queda en `supabase/migraciones/20261105_metricas_propuesta.sql` como propuesta.

**Idea:** una tabla `eventos` con eventos anónimos y una RPC `registrar_evento` con límite de frecuencia. Sin cookies de terceros, sin IP, sin user-agent, sin nombre ni carnet.

- **Qué guarda:** `tipo` (lista cerrada), `ruta` (lista cerrada), `sesion` (token aleatorio de 32 caracteres hexadecimales que el navegador genera y rota cada día), `creado_en`.
- **Qué no guarda:** IP, user-agent, `perfil_id`, correo, texto libre.
- **Eventos propuestos:** `visita`, `muro_visto`, `registro_inicio`, `registro_paso_1`, `registro_paso_2`, `registro_paso_3`, `registro_completo`, `publicar_inicio`, `publicar_completo`, `pwa_instalada`, `carnet_compartido`.
- **Límite:** máximo 120 eventos por sesión por hora y máximo 1 cada 2 segundos. La RPC rechaza tipos y rutas que no estén en la lista.
- **Para qué sirve:** embudo de registro (`registro_inicio` → pasos → `registro_completo`), visitas por día, uso por pantalla e instalaciones. Con eso se puede responder “¿cuántos empiezan el registro y cuántos lo terminan?” sin identificar a nadie.
- **Riesgo:** un evento por sesión sigue siendo un seudónimo. Por eso el token es aleatorio, no se cruza con `perfiles.id` y se rota cada día. Jhon decide si prefiere no guardar ni el token y contar solo totales por día.
- **Alternativa sin eventos:** usar los logs de Netlify para visitas agregadas. No los tenemos hoy y no permiten medir el embudo dentro de la app.

## 9. Eficiencia en la base (propuesta)

Hoy el script descarga las filas y calcula en Node. Con miles de filas eso sigue siendo manejable, pero se proponen tres funciones que devuelven solo agregados calculados en Postgres:

- `metricas_semanales()`: una fila por métrica y semana (carnets, publicaciones, ayudas confirmadas, conexiones, asistentes, talleres, reto, reseñas y mediana de la primera respuesta).
- `retencion_cohortes()`: cohorte, semana 1, 2 o 4, integrantes con la ventana cerrada y cuántos volvieron.
- `resumen_eventos()`: conteos diarios de la tabla `eventos` para visitas y embudo de registro.

Ventajas:
- Evita bajar datos personales al equipo que genera el reporte.
- Permite usar `percentile_cont` para la mediana y ventanas para las cohortes.
- Devuelve únicamente conteos, promedios y semanas: ni IDs ni textos.

Están escritas, sin aplicar, en `supabase/migraciones/20261105_metricas_propuesta.sql`, junto con los índices sugeridos por `created_at` y la tabla `eventos`. El script actual funciona sin ellas; las usaría solo si Jhon las aplica.

## 10. Decisiones que le tocan a Jhon

1. Aprobar estas definiciones antes de fusionar el reporte (Bloque 2).
2. Confirmar el umbral de privacidad: `menos de 3`.
3. Confirmar las ventanas de retención (días 7, 14 y 28 desde el registro) y que crear el carnet no cuente como actividad.
4. Aceptar que “no se conocían antes” es una inferencia y decirlo así en el reporte.
5. Decidir si se aplica la propuesta de eventos anónimos para medir visitas y abandono, y con qué límites.
6. Decidir si se aplican `metricas_semanales()`, `retencion_cohortes()` y `resumen_eventos()`, y si el reporte se corre con la llave publicable o con una llave de servicio.
