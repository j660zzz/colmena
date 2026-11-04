-- Migración de SOLO DATOS (sin cambios de esquema, políticas ni RPC).
-- Borra el perfil de prueba "jhon" (carnet 101, creado el 2026-11-04), autorizado por Jhon.
-- Condiciones: ese id exacto y not es_ejemplo. Antes: 1 perfil, 1 publicación, 0 ayudas, 0 retos, 0 cuentas.
begin;
delete from publicaciones
 where autor_id = '8082b23a-5008-42df-94a2-434ffecb7473'
   and exists (select 1 from perfiles where id = '8082b23a-5008-42df-94a2-434ffecb7473' and not es_ejemplo);
delete from perfiles
 where id = '8082b23a-5008-42df-94a2-434ffecb7473' and not es_ejemplo;
commit;
