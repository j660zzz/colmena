-- talleres (2026-11-04). Jhon descartó la meta del mes: se retiran sus tablas (solo tenían ejemplos)
-- y Encuentro pasa a girar alrededor de talleres prácticos dictados entre miembros.
alter publication supabase_realtime drop table public.metas, public.avances;
drop function if exists public.guardar_meta(uuid, text, uuid, text);
drop function if exists public.contar_avance(uuid, text, uuid, text, text);
drop function if exists public.alternar_muestra(uuid, text, uuid);
drop function if exists public.marcar_meta_cumplida(uuid, text, uuid, boolean);
drop table if exists public.avances;
drop table if exists public.metas;

-- Talleres. Los de muestra tienen es_ejemplo = true y la app los marca "Ejemplo".
create table if not exists public.talleres (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  resumen text not null,
  aprendes text[] not null default '{}',
  categoria text not null,
  modalidad text not null check (modalidad in ('presencial', 'virtual')),
  duracion text not null,
  cuando text,
  dicta_id uuid references public.perfiles(id) on delete set null,
  dicta_texto text,
  llevar text,
  orden int not null default 100,
  activo boolean not null default true,
  es_ejemplo boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.taller_interes (
  taller_id uuid not null references public.talleres(id) on delete cascade,
  perfil_id uuid not null references public.perfiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (taller_id, perfil_id)
);
alter table public.talleres enable row level security;
alter table public.taller_interes enable row level security;
create policy "lectura publica" on public.talleres for select to anon, authenticated using (true);
create policy "lectura publica" on public.taller_interes for select to anon, authenticated using (true);
revoke insert, update, delete on public.talleres, public.taller_interes from anon, authenticated;
grant select on public.talleres, public.taller_interes to anon, authenticated;

-- "Me interesa" en un taller. Sirve para saber qué talleres programar primero.
create or replace function public.alternar_interes_taller(p_id uuid, p_clave text, p_taller uuid)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
begin
  if public._perfil_por_clave(p_id, p_clave) is null then raise exception 'no autorizado'; end if;
  if exists (select 1 from public.taller_interes where taller_id = p_taller and perfil_id = p_id) then
    delete from public.taller_interes where taller_id = p_taller and perfil_id = p_id; return false;
  end if;
  insert into public.taller_interes (taller_id, perfil_id) values (p_taller, p_id); return true;
end $$;
grant execute on function public.alternar_interes_taller(uuid, text, uuid) to anon, authenticated;
alter publication supabase_realtime add table public.taller_interes;

insert into public.talleres (titulo, resumen, aprendes, categoria, modalidad, duracion, cuando, dicta_id, dicta_texto, llevar, orden, es_ejemplo)
select v.titulo, v.resumen, v.aprendes, v.categoria, v.modalidad, v.duracion, v.cuando,
       (select id from public.perfiles where nombre = v.dicta and es_ejemplo), case when v.dicta is null then 'Invitado por confirmar' end,
       v.llevar, v.orden, true
from (values
  ('Edita reels con el celular', 'De la grabación al reel publicado en una tarde, solo con el celular.', array['Ganchos para los primeros 3 segundos', 'Cortes, subtítulos y música en CapCut', 'Formatos que funcionan para mostrar un producto'], 'Video', 'presencial', '90 min', 'Noviembre', 'Andrés Zapata', 'Tu celular cargado y un producto o servicio para grabar', 10),
  ('Claude Code: tu primera página web', 'Crea y publica la página de tu emprendimiento describiendo lo que quieres, sin saber programar.', array['Qué es Claude Code y qué puede hacer por ti', 'Pedir cambios con instrucciones claras', 'Publicar la página gratis en internet'], 'Web e IA', 'presencial', '2 h', 'Noviembre', null, 'Tu portátil', 20),
  ('Fotos de producto con luz natural', 'Fotos que venden, con lo que tienes en casa.', array['Dónde poner el producto y la luz', 'Fondos con cartulina', 'Edición rápida en el celular'], 'Foto', 'presencial', '90 min', 'Diciembre', 'Camila Torres', 'Tu celular y un producto', 30),
  ('Un mes de contenido en una tarde', 'Planea y diseña tus publicaciones de todo el mes.', array['Calendario de publicaciones', 'Plantillas en Canva y Figma', 'Textos cortos que invitan a comprar'], 'Redes', 'virtual', '60 min', 'Diciembre', 'Sara Ospina', null, 40),
  ('IA para tu emprendimiento', 'Usa ChatGPT, Gemini y Claude para escribir, cotizar y responder clientes.', array['Instrucciones que dan buenos resultados', 'Textos para redes y descripciones de producto', 'Qué revisar antes de publicar lo que hace la IA'], 'Web e IA', 'virtual', '60 min', 'Enero', null, null, 50),
  ('Vende por WhatsApp Business', 'Catálogo, respuestas rápidas y etiquetas para no perder pedidos.', array['Montar tu catálogo', 'Respuestas rápidas y mensaje de bienvenida', 'Etiquetas para seguir cada pedido'], 'Ventas', 'virtual', '45 min', 'Enero', 'Mateo Arboleda', null, 60)
) as v(titulo, resumen, aprendes, categoria, modalidad, duracion, cuando, dicta, llevar, orden);

-- Encuentro 01: evento pensado para estudiantes que emprenden
update public.encuentros
set titulo = 'Noche de marcas: muestra tu emprendimiento',
    agenda = jsonb_build_array(
      jsonb_build_object('hora', '6:00', 'titulo', 'Llegada', 'detalle', 'Café y presentaciones rápidas.'),
      jsonb_build_object('hora', '6:20', 'titulo', 'Vitrina de marcas', 'detalle', 'Cada marca se presenta en un minuto: qué hace y qué necesita.'),
      jsonb_build_object('hora', '7:00', 'titulo', 'Taller corto: reels con el celular', 'detalle', 'Graba y edita un reel de tu producto ahí mismo.'),
      jsonb_build_object('hora', '7:45', 'titulo', 'Conexiones', 'detalle', 'Quien necesita algo encuentra a quien lo hace.'),
      jsonb_build_object('hora', '8:15', 'titulo', 'Cierre', 'detalle', 'Se vota el taller del próximo mes.')
    ),
    que_llevar = 'Tu producto, tu portafolio en el celular o lo que quieras mostrar.'
where numero = 1;
