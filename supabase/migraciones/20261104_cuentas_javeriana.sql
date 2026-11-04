-- cuentas_javeriana (2026-11-04). Aprobado por Jhon: guardar el carnet con el correo Javeriana.
-- Tabla privada que une un carnet con una cuenta de Microsoft de @javerianacali.edu.co.
-- No cambia `perfiles`. Sin políticas: nadie la lee desde el cliente; solo la usan las funciones.

create table if not exists public.cuentas (
  perfil_id uuid primary key references public.perfiles(id) on delete cascade,
  auth_id uuid not null unique,
  correo text not null,
  created_at timestamptz not null default now()
);
alter table public.cuentas enable row level security;
revoke all on public.cuentas from anon, authenticated;

-- Correo de la sesión de Supabase Auth, solo si es de la Javeriana Cali
create or replace function public._correo_javeriana()
returns text language sql stable set search_path = public as $$
  select case when lower(coalesce(auth.jwt() ->> 'email', '')) like '%@javerianacali.edu.co'
              then lower(auth.jwt() ->> 'email') end
$$;

-- Une el carnet de este dispositivo con la cuenta Javeriana que inició sesión
create or replace function public.vincular_cuenta(p_id uuid, p_clave text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare v_correo text := public._correo_javeriana();
begin
  if public._perfil_por_clave(p_id, p_clave) is null then raise exception 'no autorizado'; end if;
  if auth.uid() is null then raise exception 'Inicia sesión con tu correo Javeriana.'; end if;
  if v_correo is null then raise exception 'Usa tu correo @javerianacali.edu.co.'; end if;
  if exists (select 1 from public.cuentas where auth_id = auth.uid() and perfil_id <> p_id) then
    raise exception 'Ese correo ya guarda otro carnet.';
  end if;
  insert into public.cuentas (perfil_id, auth_id, correo) values (p_id, auth.uid(), v_correo)
  on conflict (perfil_id) do update set auth_id = excluded.auth_id, correo = excluded.correo;
  return json_build_object('correo', v_correo);
end $$;

-- Devuelve el carnet guardado con esa cuenta y una clave nueva para este dispositivo
create or replace function public.recuperar_carnet()
returns json language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid; v_carnet int; v_clave text := encode(extensions.gen_random_bytes(24), 'hex');
begin
  if auth.uid() is null or public._correo_javeriana() is null then raise exception 'Inicia sesión con tu correo Javeriana.'; end if;
  select perfil_id into v_id from public.cuentas where auth_id = auth.uid();
  if v_id is null then return null; end if;
  update public.perfiles set clave_hash = encode(extensions.digest(v_clave, 'sha256'), 'hex')
  where id = v_id returning carnet into v_carnet;
  return json_build_object('id', v_id, 'clave', v_clave, 'carnet', v_carnet);
end $$;

-- Con qué correo está guardado mi carnet (solo el dueño)
create or replace function public.mi_cuenta(p_id uuid, p_clave text)
returns text language plpgsql security definer set search_path = public, extensions as $$
begin
  if public._perfil_por_clave(p_id, p_clave) is null then raise exception 'no autorizado'; end if;
  return (select correo from public.cuentas where perfil_id = p_id);
end $$;

revoke execute on function public._correo_javeriana() from public, anon, authenticated;
grant execute on function public.vincular_cuenta(uuid, text), public.recuperar_carnet(), public.mi_cuenta(uuid, text) to anon, authenticated;
