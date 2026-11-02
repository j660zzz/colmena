# Base de datos — Supabase (proyecto `colmena`, región São Paulo)

Las migraciones viven en el proyecto de Supabase (`supabase_migrations.schema_migrations`):
`esquema_inicial`, `proteger_clave_y_semilla`, `borrar_perfil`, `solo_lectura_directa`, `v0_manos_whatsapp_retos`, `v0_confirmar_mano_directa`.

## Tablas (lectura pública, sin escritura directa)
| Tabla | Para qué |
|---|---|
| `perfiles` | Carnet de cada miembro. `es_ejemplo = true` marca los perfiles de muestra. `clave_hash` y `whatsapp` nunca son legibles desde el cliente (permisos por columna); solo se expone `tiene_whatsapp`. |
| `publicaciones` | Muro: `tipo` = `need` (necesito) u `offer` (ofrezco), `texto`, `categorias`, `vence_en` (24 h, 3 días o 1 semana). |
| `ayudas` | Quién le escribió a quién por una publicación. `estado` = `pendiente`, `confirmada` o `no`; el autor confirma "¿Se dio la mano?". Las confirmadas llenan el panal. |
| `me_sirve` | "Me sirve" en publicaciones. |
| `calificaciones` | Reseñas después de una mano confirmada. Doble ciego: se leen solo por `resenas_publicas()`, que muestra una reseña cuando las dos partes calificaron o pasaron 7 días. |
| `contactos`, `contactos_vistos` | Registro de quién pidió el WhatsApp de quién (límite contra recolección de números). Sin lectura pública. |
| `retos`, `reto_participantes`, `reto_votos` | Reto de la semana: el activo es el de mayor `numero` con `activo = true`; los participantes suben un link y la colmena vota. |
| `conexiones` | Conexiones entre miembros (`de_id` → `a_id`). |
| `encuentros` | Encuentro presencial. La app muestra el de mayor `numero` con `activo = true`. `fecha` nula = "Fecha por confirmar". |
| `asistencias` | Quién se apuntó a qué encuentro. |

## Escrituras: solo por RPC
Todas reciben `p_id` y `p_clave` (los entrega `crear_perfil` y se guardan en el navegador) y fallan con `no autorizado` si no coinciden.

- `crear_perfil(p_nombre, p_marca, p_rol, p_categorias, p_habilidades, p_instagram, p_color, p_whatsapp)` → `{id, clave, carnet}`
- `actualizar_perfil(p_id, p_clave, …, p_whatsapp)` · `mi_whatsapp(p_id, p_clave)` (solo el propio)
- `borrar_perfil(p_id, p_clave)` — borra perfil y toda su actividad (derecho de supresión, Ley 1581).
- `publicar(p_id, p_clave, p_tipo, p_texto, p_categorias, p_dias)` — máximo 5 publicaciones cada 10 minutos.
- `borrar_publicacion(p_id, p_clave, p_post)`
- `contactar(p_id, p_clave, p_perfil, p_post)` → número de WhatsApp del otro (solo con carnet; con `p_post` registra la ayuda).
- `confirmar_mano(p_id, p_clave, p_post, p_perfil, p_estado)` — solo el autor de la publicación.
- `mis_pendientes(p_id, p_clave)` → manos por confirmar y por calificar.
- `calificar(p_id, p_clave, p_post, p_para, p_estrellas, p_chips, p_comentario)`
- `alternar_me_sirve`, `alternar_ayuda`, `alternar_conexion`, `alternar_asistencia`
- `unirse_reto(p_id, p_clave, p_reto, p_link)`, `salir_reto`, `alternar_voto_reto(p_id, p_clave, p_reto, p_participante)`

Tiempo real activado en `publicaciones`, `ayudas`, `me_sirve`, `reto_participantes`, `reto_votos` y `asistencias`.

## Administración
- **Reto de la semana**: Table Editor → `retos`. Para cambiarlo, crea una fila nueva con `numero` mayor, `titulo`, `descripcion`, `cierra_en` y `activo = true` (y pon `activo = false` en el anterior).
- Fecha y lugar del encuentro: Table Editor → `encuentros` → editar `fecha`, `hora_texto`, `lugar`.
- Quitar los ejemplos cuando haya suficientes miembros reales: `delete from perfiles where es_ejemplo;` (borra también sus publicaciones).
- Moderar una publicación: Table Editor → `publicaciones` → borrar la fila.
