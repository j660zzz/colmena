import { useEffect, useState } from 'react'
export function useRelojRetos(retos) {
  const [ahora, setAhora] = useState(Date.now)
  useEffect(() => {
    const siguiente = retos
      .flatMap((r) => [
        Date.parse(r.cierra_en),
        Date.parse(r.cierra_en) + 7 * 86400000,
      ])
      .filter((t) => t > ahora)
      .sort((a, b) => a - b)[0]
    const actualizar = () => setAhora(Date.now())
    const timer = setTimeout(
      actualizar,
      Math.min(60000, siguiente ? siguiente - ahora + 1 : 60000),
    )
    document.addEventListener('visibilitychange', actualizar)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', actualizar)
    }
  }, [retos, ahora])
  return ahora
}
