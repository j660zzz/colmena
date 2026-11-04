const SEMANA = 7 * 86400000
// El historial se deriva de resultados verificables; no se escribe en Supabase.
export function ganadores(retos, participantes, votos, ahora = Date.now()) {
  return retos
    .filter(
      (r) =>
        Number.isFinite(Date.parse(r.cierra_en)) &&
        Date.parse(r.cierra_en) <= ahora,
    )
    .sort(
      (a, b) =>
        Date.parse(b.cierra_en) - Date.parse(a.cierra_en) ||
        b.numero - a.numero,
    )
    .map((reto) => {
      const cierre = Date.parse(reto.cierra_en)
      const candidatos = participantes
        .filter(
          (p) =>
            p.reto_id === reto.id &&
            p.link?.trim() &&
            Date.parse(p.created_at) <= cierre,
        )
        .map((p) => ({
          ...p,
          utiles: new Set(
            votos
              .filter(
                (v) =>
                  v.reto_id === reto.id &&
                  v.participante_id === p.perfil_id &&
                  v.votante_id !== p.perfil_id &&
                  Date.parse(v.created_at) <= cierre,
              )
              .map((v) => v.votante_id),
          ).size,
        }))
        .filter((p) => p.utiles >= 1)
        .sort(
          (a, b) =>
            b.utiles - a.utiles ||
            Date.parse(a.created_at) - Date.parse(b.created_at) ||
            a.perfil_id.localeCompare(b.perfil_id),
        )
      return candidatos[0]
        ? { reto, ...candidatos[0], hasta: cierre + SEMANA }
        : null
    })
    .filter(Boolean)
}
export function destacadoActual(
  retos,
  participantes,
  votos,
  ahora = Date.now(),
) {
  const cerrado = [...retos]
    .filter((r) => Date.parse(r.cierra_en) <= ahora)
    .sort(
      (a, b) =>
        Date.parse(b.cierra_en) - Date.parse(a.cierra_en) ||
        b.numero - a.numero,
    )[0]
  if (!cerrado || ahora >= Date.parse(cerrado.cierra_en) + SEMANA) return null
  return ganadores([cerrado], participantes, votos, ahora)[0] || null
}
