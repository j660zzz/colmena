-- Revisión mensual (2026-11-05): sin cambios de contenido, solo fecha de verificación.
-- Miro sigue sin recibir solicitudes (foro oficial); Fondo Emprender: la única abierta para el Valle sigue siendo la 168;
-- Cámara de Comercio de Cali: sigue habiendo cursos sin costo.
update public.beneficios set verificado_en = date '2026-11-05' where tipo = 'digital' and nombre in ('Miro', 'Fondo Emprender del SENA', 'Cursos de la Cámara de Comercio de Cali');
