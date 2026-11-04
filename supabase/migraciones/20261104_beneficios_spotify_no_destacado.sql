-- Spotify no ayuda a emprender: sale de los destacados de Beneficios
update public.beneficios set destacado = false where nombre = 'Spotify Premium Estudiantes' and tipo = 'digital';
