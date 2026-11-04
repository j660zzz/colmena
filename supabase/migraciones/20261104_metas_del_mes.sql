-- metas_del_mes (2026-11-04). El ciclo del mes en Encuentro:
-- semana 1 escribes tu meta, cada semana cuentas tu avance y en el encuentro lo muestras.
-- Lectura pública; escritura solo por RPC con la clave del dispositivo.

create table if not exists public.metas (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfiles(id) on delete cascade,
  encuentro_id uuid not null references public.encuentros(id) on delete cascade,
  texto text not null check (char_length(texto) between 5 and 120),
  muestra boolean not null default false,
  cumplida boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (perfil_id, encuentro_id)
);
create table if not exists public.avances (
  id uuid primary key default gen_random_uuid(),
  meta_id uuid not null references public.metas(id) on delete cascade,
  perfil_id uuid not null references public.perfiles(id) on delete cascade,
  texto text not null check (char_length(texto) between 3 and 140),
  link text check (link is null or link ~ '^https?://'),
  created_at timestamptz not null default now()
);
create index if not exists avances_meta_idx on public.avances (meta_id, created_at desc);

alter table public.metas enable row level security;
alter table public.avances enable row level security;
create policy "lectura publica" on public.metas for select to anon, authenticated using (true);
create policy "lectura publica" on public.avances for select to anon, authenticated using (true);
revoke insert, update, delete on public.metas, public.avances from anon, authenticated;
grant select on public.metas, public.avances to anon, authenticated;

-- Escribir o cambiar mi meta del encuentro
create or replace function public.guardar_meta(p_id uuid, p_clave text, p_encuentro uuid, p_texto text)
returns uuid language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid; v_texto text := trim(coalesce(p_texto, ''));
begin
  if public._perfil_por_clave(p_id, p_clave) is null then raise exception 'no autorizado'; end if;
  if char_length(v_texto) < 5 then raise exception 'Escribe tu meta en al menos 5 caracteres.'; end if;
  if char_length(v_texto) > 120 then raise exception 'Tu meta debe tener máximo 120 caracteres.'; end if;
  if not exists (select 1 from public.encuentros where id = p_encuentro and activo) then raise exception 'Este encuentro ya no está activo.'; end if;
  insert into public.metas (perfil_id, encuentro_id, texto) values (p_id, p_encuentro, v_texto)
  on conflict (perfil_id, encuentro_id) do update set texto = excluded.texto, updated_at = now()
  returning id into v_id;
  return v_id;
end $$;

-- Contar un avance de mi meta (máximo 10 por meta)
create or replace function public.contar_avance(p_id uuid, p_clave text, p_encuentro uuid, p_texto text, p_link text)
returns uuid language plpgsql security definer set search_path = public, extensions as $$
declare v_meta uuid; v_id uuid; v_texto text := trim(coalesce(p_texto, '')); v_link text := nullif(trim(coalesce(p_link, '')), '');
begin
  if public._perfil_por_clave(p_id, p_clave) is null then raise exception 'no autorizado'; end if;
  select id into v_meta from public.metas where perfil_id = p_id and encuentro_id = p_encuentro;
  if v_meta is null then raise exception 'Primero escribe tu meta del mes.'; end if;
  if char_length(v_texto) < 3 then raise exception 'Cuenta tu avance en al menos 3 caracteres.'; end if;
  if char_length(v_texto) > 140 then raise exception 'Tu avance debe tener máximo 140 caracteres.'; end if;
  if v_link is not null and v_link !~ '^https?://' then raise exception 'El link debe empezar por https://'; end if;
  if (select count(*) from public.avances where meta_id = v_meta) >= 10 then raise exception 'Ya contaste 10 avances de esta meta.'; end if;
  insert into public.avances (meta_id, perfil_id, texto, link) values (v_meta, p_id, v_texto, v_link) returning id into v_id;
  return v_id;
end $$;

-- Apuntarme (o no) a mostrar mi avance en el encuentro
create or replace function public.alternar_muestra(p_id uuid, p_clave text, p_encuentro uuid)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare v boolean;
begin
  if public._perfil_por_clave(p_id, p_clave) is null then raise exception 'no autorizado'; end if;
  update public.metas set muestra = not muestra, updated_at = now()
  where perfil_id = p_id and encuentro_id = p_encuentro returning muestra into v;
  if v is null then raise exception 'Primero escribe tu meta del mes.'; end if;
  return v;
end $$;

-- Marcar mi meta como cumplida (o quitarlo)
create or replace function public.marcar_meta_cumplida(p_id uuid, p_clave text, p_encuentro uuid, p_cumplida boolean)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare v boolean;
begin
  if public._perfil_por_clave(p_id, p_clave) is null then raise exception 'no autorizado'; end if;
  update public.metas set cumplida = coalesce(p_cumplida, false), updated_at = now()
  where perfil_id = p_id and encuentro_id = p_encuentro returning cumplida into v;
  if v is null then raise exception 'Primero escribe tu meta del mes.'; end if;
  return v;
end $$;

grant execute on function public.guardar_meta(uuid, text, uuid, text), public.contar_avance(uuid, text, uuid, text, text),
  public.alternar_muestra(uuid, text, uuid), public.marcar_meta_cumplida(uuid, text, uuid, boolean) to anon, authenticated;

-- Ejemplos: metas de perfiles de ejemplo (se ven con la etiqueta Ejemplo porque su autor es_ejemplo)
with enc as (select id from public.encuentros where numero = 1),
ej as (
  select p.id as perfil_id, v.texto, v.muestra from (values
    ('Sara Ospina', 'Cerrar mi primer cliente de identidad de marca', true),
    ('Mateo Arboleda', 'Probar el empaque nuevo de Pega''o con 4 personas', true),
    ('Valentina Ruiz', 'Subir mi tienda de ilustraciones a Instagram', false)
  ) as v(nombre, texto, muestra)
  join public.perfiles p on p.nombre = v.nombre and p.es_ejemplo
)
insert into public.metas (perfil_id, encuentro_id, texto, muestra)
select ej.perfil_id, enc.id, ej.texto, ej.muestra from ej, enc
on conflict (perfil_id, encuentro_id) do nothing;

insert into public.avances (meta_id, perfil_id, texto, created_at)
select m.id, m.perfil_id, v.texto, now() - (v.dias || ' days')::interval
from (values
  ('Sara Ospina', 'Mandé la propuesta a dos marcas del barrio.', 3),
  ('Sara Ospina', 'Una me pidió cotización. Ya la envié.', 1),
  ('Mateo Arboleda', 'Imprimí 10 empaques de prueba.', 2),
  ('Valentina Ruiz', 'Tomé fotos de 8 ilustraciones.', 1)
) as v(nombre, texto, dias)
join public.perfiles p on p.nombre = v.nombre and p.es_ejemplo
join public.metas m on m.perfil_id = p.id
where not exists (select 1 from public.avances a where a.meta_id = m.id and a.texto = v.texto);

alter publication supabase_realtime add table public.metas, public.avances;
