-- Auditoría de seguridad — consultas de SOLO LECTURA (Bloque A).
-- NO es una migración: no crea, no altera ni borra nada. Córrelas en el editor SQL de Supabase
-- y copia el resultado en el informe (docs/ingenieria/README.md). No requieren permisos especiales.
--
-- Objetivo: el repo no contiene el SQL de todas las RPC (las del `esquema_inicial`,
-- `solo_lectura_directa`, `v0_manos_whatsapp_retos`, etc. viven solo en Supabase). Estas consultas
-- recuperan las definiciones y los permisos para completar la auditoría sin tocar producción.

-- 1) Todas las funciones SECURITY DEFINER de public ejecutables por anon o authenticated,
--    con su `search_path` fijo (proconfig) y su definición completa.
select n.nspname                                       as esquema,
       p.proname                                       as funcion,
       pg_get_function_identity_arguments(p.oid)       as argumentos,
       p.prosecdef                                     as security_definer,
       coalesce(array_to_string(p.proconfig, ', '), '(sin search_path fijo)') as configuracion,
       pg_get_functiondef(p.oid)                       as definicion_sql
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.prosecdef
  and (has_function_privilege('anon', p.oid, 'EXECUTE')
       or has_function_privilege('authenticated', p.oid, 'EXECUTE'))
order by p.proname;

-- 2) Qué columnas puede leer cada rol en cada tabla (para confirmar que `whatsapp`
--    y `clave_hash` no están expuestos a anon ni authenticated).
select grantee, table_name, column_name, privilege_type
from information_schema.column_privileges
where grantee in ('anon', 'authenticated')
order by table_name, column_name, grantee;

-- 3) Permisos a nivel de tabla por rol.
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;

-- 4) Estado de RLS y número de políticas por tabla (para confirmar cuáles son "solo RPC"
--    sin políticas de lectura directa).
select c.relname            as tabla,
       c.relrowsecurity     as rls_activa,
       c.relforcerowsecurity as rls_forzada,
       (select count(*) from pg_policies pol
         where pol.schemaname = n.nspname and pol.tablename = c.relname) as num_politicas
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;

-- 5) Cómo se guarda y compara la clave: busca referencias a `clave_hash`, `digest`,
--    `sha256` y `pgcrypto` dentro de las definiciones de funciones (pistas del algoritmo,
--    la sal y si la comparación es en tiempo constante).
select proname, pg_get_functiondef(oid) as definicion_sql
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and proname not like '\_%'  -- incluye también las auxiliares públicas
  and (pg_get_functiondef(oid) ilike '%clave_hash%'
       or pg_get_functiondef(oid) ilike '%digest%'
       or pg_get_functiondef(oid) ilike '%sha256%')
order by proname;
