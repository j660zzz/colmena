-- proyectos (2026-11-05). Aprobado por Jhon: proyectos en el carnet para todos los miembros, con portada
-- generada con la marca (sin imágenes subidas). Cada miembro puede tener hasta 4.
-- Lectura pública; escritura solo por RPC con la clave del dispositivo, igual que el resto de la base.
-- Revertir: drop function public.guardar_proyecto(uuid, text, uuid, text, text, text, int, text, text);
--           drop function public.borrar_proyecto(uuid, text, uuid); drop table public.proyectos;

create table if not exists public.proyectos (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfiles(id) on delete cascade,
  titulo text not null check (char_length(titulo) between 3 and 60),
  tipo text not null check (tipo in ('Marca', 'Diseño', 'Redes sociales', 'Web/UX', 'Foto', 'Video', 'Ilustración', 'Producción', 'Moda', 'Comida', 'Otro')),
  cliente text check (cliente is null or char_length(cliente) between 2 and 60),
  anio int check (anio is null or anio between 2015 and 2100),
  descripcion text check (descripcion is null or char_length(descripcion) <= 140),
  link text check (link is null or (char_length(link) <= 200 and link ~* '^https?://')),
  orden int not null default 100,
  es_ejemplo boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_proyectos_perfil on public.proyectos (perfil_id, orden);

alter table public.proyectos enable row level security;
create policy "lectura publica" on public.proyectos for select to anon, authenticated using (true);
revoke insert, update, delete on public.proyectos from anon, authenticated;
grant select on public.proyectos to anon, authenticated;

-- Crea (p_proyecto nulo) o edita un proyecto propio. Máximo 4 por miembro.
create or replace function public.guardar_proyecto(
  p_id uuid, p_clave text, p_proyecto uuid, p_titulo text, p_tipo text,
  p_cliente text, p_anio int, p_descripcion text, p_link text
) returns uuid language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid; v_link text := nullif(btrim(coalesce(p_link, '')), '');
begin
  if public._perfil_por_clave(p_id, p_clave) is null then raise exception 'no autorizado'; end if;
  if v_link is not null and v_link !~* '^https?://' then v_link := 'https://' || v_link; end if;
  if p_proyecto is null then
    if (select count(*) from public.proyectos where perfil_id = p_id) >= 4 then
      raise exception 'Puedes mostrar hasta 4 proyectos. Borra uno para agregar otro.';
    end if;
    insert into public.proyectos (perfil_id, titulo, tipo, cliente, anio, descripcion, link, orden)
    values (p_id, btrim(p_titulo), p_tipo, nullif(btrim(coalesce(p_cliente, '')), ''), p_anio,
            nullif(btrim(coalesce(p_descripcion, '')), ''), v_link,
            coalesce((select max(orden) + 10 from public.proyectos where perfil_id = p_id), 10))
    returning id into v_id;
  else
    update public.proyectos
    set titulo = btrim(p_titulo), tipo = p_tipo, cliente = nullif(btrim(coalesce(p_cliente, '')), ''),
        anio = p_anio, descripcion = nullif(btrim(coalesce(p_descripcion, '')), ''), link = v_link
    where id = p_proyecto and perfil_id = p_id
    returning id into v_id;
    if v_id is null then raise exception 'no autorizado'; end if;
  end if;
  return v_id;
end $$;

create or replace function public.borrar_proyecto(p_id uuid, p_clave text, p_proyecto uuid)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if public._perfil_por_clave(p_id, p_clave) is null then raise exception 'no autorizado'; end if;
  delete from public.proyectos where id = p_proyecto and perfil_id = p_id;
end $$;

revoke all on function public.guardar_proyecto(uuid, text, uuid, text, text, text, int, text, text) from public;
revoke all on function public.borrar_proyecto(uuid, text, uuid) from public;
grant execute on function public.guardar_proyecto(uuid, text, uuid, text, text, text, int, text, text) to anon, authenticated;
grant execute on function public.borrar_proyecto(uuid, text, uuid) to anon, authenticated;

-- Proyectos de muestra para los 8 perfiles de ejemplo (es_ejemplo = true, la app los marca "Ejemplo").
-- Clientes ficticios. Sin links: un perfil de ejemplo no debe enviar a sitios reales.
insert into public.proyectos (perfil_id, titulo, tipo, cliente, anio, descripcion, orden, es_ejemplo)
select p.id, v.titulo, v.tipo, v.cliente, v.anio, v.descripcion, v.orden, true
from (values
  (1, 'Identidad para una panadería de barrio', 'Marca', 'Panadería La Espiga', 2026, 'Logo, paleta, bolsas de papel y un manual de una página.', 10),
  (1, 'Empaque para línea de jabones', 'Diseño', 'Jabones Brisa', 2025, 'Cajas plegables impresas en una tinta para bajar costos.', 20),
  (1, 'Rediseño de marca para un estudio de yoga', 'Marca', 'Estudio Prana', 2025, 'Símbolo nuevo, tipografía y plantillas para redes.', 30),
  (2, 'Menú y marca del food truck', 'Comida', 'Pega''o', 2026, 'Menú de una cara, precios por porción y letrero del camión.', 10),
  (2, 'Costeo de recetas para una feria', 'Comida', 'Feria de emprendedores', 2025, 'Hoja de costos por plato para vender con margen en feria.', 20),
  (3, 'Colección de bolsos en lona', 'Producción', 'Casa Mora', 2026, 'Tiraje de 40 bolsos con un taller del centro de Cali.', 10),
  (3, 'Accesorios para una tienda de regalos', 'Moda', 'Tienda Lazo', 2025, 'Monederos y estuches en tela estampada por encargo.', 20),
  (3, 'Kit de proveedores de tela', 'Producción', null, 2025, 'Lista de proveedores y precios por metro para tirajes cortos.', 30),
  (4, 'Ilustraciones para un libro infantil', 'Ilustración', 'Editorial Viento', 2026, '12 ilustraciones a doble página y la portada.', 10),
  (4, 'Patrón textil para pañoletas', 'Ilustración', 'Casa Mora', 2025, 'Patrón repetible de flores del Pacífico en tres colores.', 20),
  (4, 'Mural para una cafetería', 'Ilustración', 'Café del Parque', 2025, 'Mural de 4 metros pintado a mano en dos fines de semana.', 30),
  (5, 'Serie de reels para una marca de ropa', 'Video', 'Barrio Club', 2026, 'Seis reels cortos para el lanzamiento de la colección.', 10),
  (5, 'Documental corto sobre artesanos', 'Video', null, 2025, 'Ocho minutos sobre tres talleres de Cali.', 20),
  (6, 'Vajilla para un café de especialidad', 'Producción', 'Café Origen', 2026, '60 tazas y platos a torno con esmalte mate.', 10),
  (6, 'Línea de materas pequeñas', 'Producción', 'Malva', 2025, 'Materas para suculentas vendidas en ferias.', 20),
  (7, 'Catálogo de joyería en fondo blanco', 'Foto', 'Joyería Alba', 2026, '80 fotos editadas para la tienda en línea.', 10),
  (7, 'Bodegón para una marca de café', 'Foto', 'Café Origen', 2025, 'Fotos de empaque y producto para redes.', 20),
  (7, 'Fotos de producto para una feria', 'Foto', 'Malva', 2025, 'Sesión con luz natural para el catálogo de cerámica.', 30),
  (8, 'Primera colección de camisetas', 'Moda', 'Barrio Club', 2026, 'Cinco diseños estampados en serigrafía, tallas S a XL.', 10),
  (8, 'Etiquetas y hangtags', 'Diseño', 'Barrio Club', 2026, 'Etiqueta interna, hangtag y bolsa de envío.', 20)
) as v(carnet, titulo, tipo, cliente, anio, descripcion, orden)
join public.perfiles p on p.carnet = v.carnet and p.es_ejemplo;

-- Bios y habilidades más completas en los perfiles de ejemplo (solo filas es_ejemplo).
update public.perfiles p set bio = v.bio, habilidades = v.habilidades
from (values
  (1, 'Diseño identidades para marcas que están empezando: logo, paleta, tipografía y un manual corto para usarlas bien. Trabajo por etapas y con dos rondas de ajustes. Me gusta trabajar con panaderías, cafés y tiendas de barrio.', array['Identidad', 'Manual de marca', 'Packaging', 'Tipografía', 'Plantillas para redes']),
  (2, 'Tengo un food truck de comida del Pacífico y estoy armando la marca desde cero. Sé de costos de cocina, proveedores en Cali y ventas en ferias. Busco ayuda con fotos y diseño del menú; a cambio te ayudo a costear tus recetas.', array['Food branding', 'Menús', 'Costos de cocina', 'Ferias', 'Proveedores de alimentos']),
  (3, 'Hago bolsos y accesorios en textil con tirajes cortos. Conozco talleres de confección y proveedores de telas en el centro de Cali, y te ayudo a producir tus primeras 30 o 50 unidades sin pagar de más.', array['Textil', 'Tirajes cortos', 'Confección', 'Proveedores', 'Costeo por unidad']),
  (4, 'Ilustro para editoriales y marcas, y diseño patrones para textil. He pintado murales en cafés de Cali. Puedo cambiar ilustración por fotografía o video para mis propios proyectos.', array['Editorial', 'Patrones', 'Mural', 'Procreate', 'Ilustración infantil']),
  (5, 'Grabo y edito reels y piezas cortas para marcas locales. Tengo luces y trípode que presto a otros miembros los fines de semana. Te ayudo a planear qué grabar para que un video corto venda.', array['Reels', 'Documental', 'Luces', 'Edición', 'Guion corto']),
  (6, 'Hago piezas de cerámica a torno para cafés y tiendas de decoración. Estoy aprendiendo a calcular bien el costo de cada pieza y busco a alguien que me ayude con fotos para mi catálogo.', array['Torno', 'Esmaltes', 'Pedidos para cafés', 'Piezas por encargo']),
  (7, 'Fotografío producto con fondo blanco y en bodegón para tiendas en línea. Entrego fotos editadas, listas para Instagram y catálogos, y te enseño a tomar las básicas con el celular.', array['Fondo blanco', 'Bodegón', 'Retoque', 'Catálogos', 'Luz natural']),
  (8, 'Tengo una marca de ropa urbana y estoy sacando mi primera colección. Sé de estampado, tallaje y producción con talleres locales, y te cuento qué aprendí para no perder plata en el primer tiraje.', array['Estampado', 'Tallaje', 'Etiquetas', 'Producción local', 'Serigrafía'])
) as v(carnet, bio, habilidades)
where p.carnet = v.carnet and p.es_ejemplo;
