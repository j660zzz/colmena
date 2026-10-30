# Base de datos — Supabase (proyecto `colmena`, región São Paulo)

Las migraciones viven en el proyecto de Supabase (`supabase_migrations.schema_migrations`):
`esquema_inicial`, `proteger_clave_y_semilla`, `borrar_perfil`, `solo_lectura_directa`.

## Tablas (lectura pública, sin escritura directa)
| Tabla | Para qué |
|---|---|
| `perfiles` | Carnet de cada miembro. `es_ejemplo = true` marca los perfiles de muestra. `clave_hash` nunca es legible desde el cliente. |
| `publicaciones` | Muro: `tipo` = `need` (necesito) u `offer` (ofrezco), `texto`, `categorias`. |
| `ayudas` | Quién respondió "Puedo ayudar / Me interesa" a qué publicación. |
| `conexiones` | Conexiones entre miembros (`de_id` → `a_id`). |
| `encuentros` | Encuentro presencial. La app muestra el de mayor `numero` con `activo = true`. `fecha` nula = "Fecha por confirmar". |
| `asistencias` | Quién se apuntó a qué encuentro. |

## Escrituras: solo por RPC
Todas reciben `p_id` y `p_clave` (los entrega `crear_perfil` y se guardan en el navegador) y fallan con `no autorizado` si no coinciden.

- `crear_perfil(p_nombre, p_marca, p_rol, p_categorias, p_habilidades, p_instagram, p_color)` → `{id, clave, carnet}`
- `actualizar_perfil(p_id, p_clave, …)`
- `borrar_perfil(p_id, p_clave)` — borra perfil y toda su actividad (derecho de supresión, Ley 1581).
- `publicar(p_id, p_clave, p_tipo, p_texto, p_categorias)` — máximo 5 publicaciones cada 10 minutos por perfil.
- `borrar_publicacion(p_id, p_clave, p_post)`
- `alternar_ayuda(p_id, p_clave, p_post)` → `true` si quedó marcada
- `alternar_conexion(p_id, p_clave, p_a)`
- `alternar_asistencia(p_id, p_clave, p_encuentro)`

Tiempo real activado en `publicaciones`, `ayudas` y `asistencias`.

## Administración
- Fecha y lugar del encuentro: Table Editor → `encuentros` → editar `fecha`, `hora_texto`, `lugar`.
- Quitar los ejemplos cuando haya suficientes miembros reales: `delete from perfiles where es_ejemplo;` (borra también sus publicaciones).
- Moderar una publicación: Table Editor → `publicaciones` → borrar la fila.
