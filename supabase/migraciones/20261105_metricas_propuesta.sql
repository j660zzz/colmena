-- PROPUESTA DE MIGRACIÓN · NO APLICADA
--
-- Qué hace
--   1. Crea índices por fecha para que los reportes no recorran tablas completas.
--   2. Crea la función metricas_semanales(), que devuelve cifras agregadas por semana
--      (lunes a domingo en America/Bogota) sin bajar filas personales al cliente.
--   3. Crea la función retencion_cohortes(), que calcula la retención de las semanas
--      1, 2 y 4 por cohorte de registro con SQL.
--   4. Crea la tabla eventos y la función registrar_evento() para medir visitas,
--      embudo de registro e instalaciones de la PWA sin rastreo de terceros.
--
-- Por qué
--   Hoy scripts/metricas.mjs descarga las filas y calcula en Node. Con miles de
--   filas eso funciona, pero obliga a que el equipo que genera el reporte tenga
--   en memoria datos que no necesita. Estas funciones devuelven solo conteos,
--   promedios y semanas. Además, el embudo de registro no se puede medir con las
--   tablas actuales.
--
-- Cómo revertir
--   drop function if exists public.metricas_semanales();
--   drop function if exists public.retencion_cohortes();
--   drop function if exists public.registrar_evento(text, text, text);
--   drop function if exists public.resumen_eventos();
--   drop table if exists public.eventos;
--   drop index if exists public.idx_publicaciones_created_at;
--   drop index if exists public.idx_perfiles_created_at;
--   drop index if exists public.idx_ayudas_publicacion;
--   drop index if exists public.idx_ayudas_confirmadas;
--   drop index if exists public.idx_conexiones_created_at;
--   drop index if exists public.idx_asistencias_created_at;
--   drop index if exists public.idx_reto_participantes_created_at;
--   drop index if exists public.idx_reto_votos_created_at;
--   drop index if exists public.idx_taller_interes_created_at;
--
-- Permisos
--   - metricas_semanales() y retencion_cohortes(): execute para anon (la llave
--     publicable). Solo devuelven cifras agregadas, nunca IDs, textos ni fechas
--     de personas. Si Jhon prefiere, se puede quitar anon y correr el script con
--     una llave de servicio.
--   - eventos: sin select ni insert directo para anon ni authenticated. Solo se
--     escribe por registrar_evento(), que valida tipo, ruta y frecuencia.
--   - resumen_eventos(): execute para anon; devuelve conteos por día y tipo.
--   - Las funciones son security definer y fijan search_path = public.
--
-- Esta migración NO se ha aplicado. Producción y las versiones de prueba comparten
-- la misma base: aplicarla cambia el esquema en vivo para todos.

-- ---------------------------------------------------------------------------
-- 1. Índices
-- ---------------------------------------------------------------------------

create index if not exists idx_perfiles_created_at
  on public.perfiles (created_at);

create index if not exists idx_publicaciones_created_at
  on public.publicaciones (created_at);

create index if not exists idx_ayudas_publicacion
  on public.ayudas (publicacion_id);

create index if not exists idx_ayudas_confirmadas
  on public.ayudas (estado, resuelta_at)
  where estado = 'confirmada';

create index if not exists idx_conexiones_created_at
  on public.conexiones (created_at);

create index if not exists idx_asistencias_created_at
  on public.asistencias (created_at);

create index if not exists idx_reto_participantes_created_at
  on public.reto_participantes (created_at);

create index if not exists idx_reto_votos_created_at
  on public.reto_votos (created_at);

create index if not exists idx_taller_interes_created_at
  on public.taller_interes (created_at);

-- ---------------------------------------------------------------------------
-- 2. Métricas semanales agregadas
-- ---------------------------------------------------------------------------

-- Devuelve una fila por métrica y semana. La semana es la fecha del lunes en
-- hora de Colombia. Excluye perfiles, publicaciones, ayudas y reseñas de ejemplo.
create or replace function public.metricas_semanales()
returns table (metrica text, semana date, valor numeric)
language sql
stable
security definer
set search_path = public
as $$
  -- Carnets creados
  select 'carnets'::text, date_trunc('week', (p.created_at at time zone 'America/Bogota'))::date, count(*)::numeric
  from public.perfiles p
  where not p.es_ejemplo
  group by 2

  union all

  -- Publicaciones que necesitan algo
  select 'publicaciones_need', date_trunc('week', (p.created_at at time zone 'America/Bogota'))::date, count(*)::numeric
  from public.publicaciones p
  join public.perfiles a on a.id = p.autor_id
  where not p.es_ejemplo and not a.es_ejemplo and p.tipo = 'need'
  group by 2

  union all

  -- Publicaciones que ofrecen algo
  select 'publicaciones_offer', date_trunc('week', (p.created_at at time zone 'America/Bogota'))::date, count(*)::numeric
  from public.publicaciones p
  join public.perfiles a on a.id = p.autor_id
  where not p.es_ejemplo and not a.es_ejemplo and p.tipo = 'offer'
  group by 2

  union all

  -- Publicaciones con al menos una respuesta registrada
  select 'publicaciones_con_respuesta', date_trunc('week', (p.created_at at time zone 'America/Bogota'))::date, count(*)::numeric
  from public.publicaciones p
  join public.perfiles a on a.id = p.autor_id
  where not p.es_ejemplo and not a.es_ejemplo
    and exists (select 1 from public.ayudas h where h.publicacion_id = p.id)
  group by 2

  union all

  -- Publicaciones marcadas como resueltas
  select 'publicaciones_resueltas', date_trunc('week', (p.created_at at time zone 'America/Bogota'))::date, count(*)::numeric
  from public.publicaciones p
  join public.perfiles a on a.id = p.autor_id
  where not p.es_ejemplo and not a.es_ejemplo and p.resuelta_at is not null
  group by 2

  union all

  -- Mediana de horas hasta la primera respuesta (solo publicaciones respondidas)
  select
    'mediana_primera_respuesta_horas',
    date_trunc('week', (p.created_at at time zone 'America/Bogota'))::date,
    round(
      percentile_cont(0.5) within group (
        order by extract(epoch from (r.primera - p.created_at)) / 3600
      )::numeric,
      1
    )
  from public.publicaciones p
  join public.perfiles a on a.id = p.autor_id
  join lateral (
    select min(h.created_at) as primera
    from public.ayudas h
    join public.perfiles r on r.id = h.perfil_id
    where h.publicacion_id = p.id
      and not r.es_ejemplo
  ) r on r.primera is not null and r.primera >= p.created_at
  where not p.es_ejemplo and not a.es_ejemplo
  group by 2

  union all

  -- Ayudas confirmadas, contadas por la fecha de confirmación
  select 'ayudas_confirmadas', date_trunc('week', (coalesce(h.resuelta_at, h.created_at) at time zone 'America/Bogota'))::date, count(*)::numeric
  from public.ayudas h
  join public.publicaciones p on p.id = h.publicacion_id
  join public.perfiles a on a.id = p.autor_id
  join public.perfiles r on r.id = h.perfil_id
  where h.estado = 'confirmada'
    and not p.es_ejemplo and not a.es_ejemplo and not r.es_ejemplo
  group by 2

  union all

  -- Conexiones: parejas distintas, sin importar la dirección
  select
    'conexiones',
    date_trunc('week', (c.created_at at time zone 'America/Bogota'))::date,
    count(distinct least(c.de_id::text, c.a_id::text) || '|' || greatest(c.de_id::text, c.a_id::text))::numeric
  from public.conexiones c
  join public.perfiles d on d.id = c.de_id
  join public.perfiles a on a.id = c.a_id
  where not d.es_ejemplo and not a.es_ejemplo
  group by 2

  union all

  -- Personas distintas inscritas al encuentro
  select 'asistentes_encuentro', date_trunc('week', (s.created_at at time zone 'America/Bogota'))::date, count(distinct s.perfil_id)::numeric
  from public.asistencias s
  join public.perfiles p on p.id = s.perfil_id
  where not p.es_ejemplo
  group by 2

  union all

  -- Personas distintas interesadas en talleres
  select 'interesados_talleres', date_trunc('week', (i.created_at at time zone 'America/Bogota'))::date, count(distinct i.perfil_id)::numeric
  from public.taller_interes i
  join public.perfiles p on p.id = i.perfil_id
  where not p.es_ejemplo
  group by 2

  union all

  -- Personas distintas que participan en un reto
  select 'participantes_reto', date_trunc('week', (r.created_at at time zone 'America/Bogota'))::date, count(distinct r.perfil_id)::numeric
  from public.reto_participantes r
  join public.perfiles p on p.id = r.perfil_id
  where not p.es_ejemplo
  group by 2

  union all

  -- Votos del reto (una fila por voto)
  select 'votos_reto', date_trunc('week', (v.created_at at time zone 'America/Bogota'))::date, count(*)::numeric
  from public.reto_votos v
  join public.perfiles voto on voto.id = v.votante_id
  join public.perfiles part on part.id = v.participante_id
  where not voto.es_ejemplo and not part.es_ejemplo
  group by 2

  union all

  -- Reseñas visibles, respetando el doble ciego de resenas_publicas()
  select 'resenas_visibles', date_trunc('week', (r.created_at at time zone 'America/Bogota'))::date, count(*)::numeric
  from public.resenas_publicas() r
  join public.perfiles d on d.id = r.de_id
  join public.perfiles p on p.id = r.para_id
  where not d.es_ejemplo and not p.es_ejemplo
  group by 2

  union all

  -- Promedio de estrellas de esas reseñas
  select 'estrellas_promedio', date_trunc('week', (r.created_at at time zone 'America/Bogota'))::date, round(avg(r.estrellas)::numeric, 2)
  from public.resenas_publicas() r
  join public.perfiles d on d.id = r.de_id
  join public.perfiles p on p.id = r.para_id
  where not d.es_ejemplo and not p.es_ejemplo
  group by 2

  order by 2, 1;
$$;

revoke all on function public.metricas_semanales() from public;
grant execute on function public.metricas_semanales() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Retención por cohorte
-- ---------------------------------------------------------------------------

-- Una fila por cohorte (semana de registro) y semana N. base = integrantes con
-- la ventana ya cerrada; activos = los que hicieron al menos una acción dentro
-- de la ventana. Las cuentas de ejemplo se excluyen en cada tabla.
create or replace function public.retencion_cohortes()
returns table (cohorte date, semana_n integer, base bigint, activos bigint)
language sql
stable
security definer
set search_path = public
as $$
  with cohortes as (
    select p.id, p.created_at,
      date_trunc('week', (p.created_at at time zone 'America/Bogota'))::date as cohorte
    from public.perfiles p
    where not p.es_ejemplo
  ),
  acciones as (
    select p.autor_id as perfil_id, p.created_at as fecha
    from public.publicaciones p
    join public.perfiles a on a.id = p.autor_id
    where not p.es_ejemplo and not a.es_ejemplo

    union all
    select h.perfil_id, h.created_at
    from public.ayudas h
    join public.publicaciones p on p.id = h.publicacion_id
    join public.perfiles a on a.id = p.autor_id
    join public.perfiles r on r.id = h.perfil_id
    where not p.es_ejemplo and not a.es_ejemplo and not r.es_ejemplo

    union all
    select p.autor_id, h.resuelta_at
    from public.ayudas h
    join public.publicaciones p on p.id = h.publicacion_id
    join public.perfiles a on a.id = p.autor_id
    where h.estado = 'confirmada' and h.resuelta_at is not null
      and not p.es_ejemplo and not a.es_ejemplo

    union all
    select m.perfil_id, m.created_at
    from public.me_sirve m
    join public.publicaciones p on p.id = m.publicacion_id
    join public.perfiles a on a.id = m.perfil_id
    where not p.es_ejemplo and not a.es_ejemplo

    union all
    select c.de_id, c.created_at from public.conexiones c
    join public.perfiles p on p.id = c.de_id where not p.es_ejemplo
    union all
    select c.a_id, c.created_at from public.conexiones c
    join public.perfiles p on p.id = c.a_id where not p.es_ejemplo

    union all
    select s.perfil_id, s.created_at from public.asistencias s
    join public.perfiles p on p.id = s.perfil_id where not p.es_ejemplo

    union all
    select r.perfil_id, r.created_at from public.reto_participantes r
    join public.perfiles p on p.id = r.perfil_id where not p.es_ejemplo

    union all
    select v.votante_id, v.created_at from public.reto_votos v
    join public.perfiles p on p.id = v.votante_id where not p.es_ejemplo

    union all
    select i.perfil_id, i.created_at from public.taller_interes i
    join public.perfiles p on p.id = i.perfil_id where not p.es_ejemplo

    union all
    select r.de_id, r.created_at from public.resenas_publicas() r
    join public.perfiles p on p.id = r.de_id where not p.es_ejemplo
  ),
  ventanas as (
    select c.id, c.cohorte, n.semana_n,
      c.created_at + (7 * n.semana_n) * interval '1 day' as inicio,
      c.created_at + (7 * (n.semana_n + 1)) * interval '1 day' as fin
    from cohortes c
    cross join (values (1), (2), (4)) as n(semana_n)
  )
  select
    v.cohorte,
    v.semana_n,
    (count(*) filter (where now() >= v.fin))::bigint as base,
    (count(*) filter (
      where now() >= v.fin
        and exists (
          select 1 from acciones a
          where a.perfil_id = v.id and a.fecha >= v.inicio and a.fecha < v.fin
        )
    ))::bigint as activos
  from ventanas v
  group by v.cohorte, v.semana_n
  order by v.cohorte, v.semana_n;
$$;

revoke all on function public.retencion_cohortes() from public;
grant execute on function public.retencion_cohortes() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Eventos anónimos (visitas y abandono del registro)
-- ---------------------------------------------------------------------------

create table if not exists public.eventos (
  id bigint generated always as identity primary key,
  tipo text not null,
  ruta text not null,
  sesion text not null,
  creado_en timestamptz not null default now(),
  constraint eventos_tipo_valido check (tipo in (
    'visita', 'muro_visto', 'registro_inicio', 'registro_paso_1', 'registro_paso_2',
    'registro_paso_3', 'registro_completo', 'publicar_inicio', 'publicar_completo',
    'pwa_instalada', 'carnet_compartido'
  )),
  constraint eventos_ruta_valida check (ruta in (
    '/', '/muro', '/miembros', '/encuentro', '/beneficios', '/carnet', '/registro', '/publicar'
  )),
  constraint eventos_sesion_valida check (sesion ~ '^[a-f0-9]{32}$')
);

alter table public.eventos enable row level security;
revoke all on public.eventos from anon, authenticated;
grant all on public.eventos to service_role;

create index if not exists idx_eventos_creado_en on public.eventos (creado_en);
create index if not exists idx_eventos_tipo_creado on public.eventos (tipo, creado_en);
create index if not exists idx_eventos_sesion_creado on public.eventos (sesion, creado_en);

-- Registra un evento anónimo. No guarda IP, user-agent, perfil ni texto libre.
-- Límite: 120 eventos por sesión por hora y uno cada 2 segundos.
create or replace function public.registrar_evento(p_tipo text, p_ruta text, p_sesion text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  recientes integer;
begin
  if p_tipo not in (
    'visita', 'muro_visto', 'registro_inicio', 'registro_paso_1', 'registro_paso_2',
    'registro_paso_3', 'registro_completo', 'publicar_inicio', 'publicar_completo',
    'pwa_instalada', 'carnet_compartido'
  ) then
    raise exception 'tipo de evento no válido';
  end if;

  if p_ruta not in ('/', '/muro', '/miembros', '/encuentro', '/beneficios', '/carnet', '/registro', '/publicar') then
    raise exception 'ruta no válida';
  end if;

  if p_sesion !~ '^[a-f0-9]{32}$' then
    raise exception 'sesión no válida';
  end if;

  select count(*) into recientes
  from public.eventos
  where sesion = p_sesion and creado_en > now() - interval '1 hour';

  if recientes >= 120 then
    return;
  end if;

  if exists (
    select 1 from public.eventos
    where sesion = p_sesion and creado_en > now() - interval '2 seconds'
  ) then
    return;
  end if;

  insert into public.eventos (tipo, ruta, sesion) values (p_tipo, p_ruta, p_sesion);
end;
$$;

revoke all on function public.registrar_evento(text, text, text) from public;
grant execute on function public.registrar_evento(text, text, text) to anon;

-- Conteos diarios de eventos. No devuelve la sesión ni nada que identifique a una persona.
create or replace function public.resumen_eventos()
returns table (dia date, tipo text, eventos bigint, sesiones bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    date_trunc('day', (e.creado_en at time zone 'America/Bogota'))::date as dia,
    e.tipo,
    count(*)::bigint as eventos,
    count(distinct e.sesion)::bigint as sesiones
  from public.eventos e
  group by 1, 2
  order by 1 desc, 2;
$$;

revoke all on function public.resumen_eventos() from public;
grant execute on function public.resumen_eventos() to anon, authenticated;
