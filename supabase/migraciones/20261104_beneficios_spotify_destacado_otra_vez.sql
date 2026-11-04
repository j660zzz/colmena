-- Spotify vuelve a los destacados de Beneficios (al final del carrusel)
update public.beneficios set destacado = true where nombre = 'Spotify Premium Estudiantes' and tipo = 'digital';
