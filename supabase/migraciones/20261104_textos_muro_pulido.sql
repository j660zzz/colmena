-- textos_muro_pulido (solo datos, 2026-11-04)
-- Textos visibles más claros y sin tono de eslogan. No cambia esquema ni políticas.
-- Reto 01: los pasos pasan a imperativo, igual que el resto de la app.
update retos
set pasos = jsonb_build_array(
  'Inscríbete',
  'Sube tu propuesta como link antes del cierre',
  'Los miembros votan con “Útil”',
  'Las tres más votadas se presentan en el encuentro'
)
where numero = 1;

-- Encuentro 01: título descriptivo en vez de frase de eslogan.
update encuentros
set titulo = 'Cómo ponerle precio a tu trabajo',
    que_llevar = 'Tu último presupuesto, aunque sea escrito a mano. Lo usamos en el taller.'
where numero = 1;
