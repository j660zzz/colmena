import { useLayoutEffect, useRef, useState } from 'react'

// Solo estado de navegación; no contiene credenciales ni se comparte entre pestañas.
const vistas = new Map()
export function useEstadoVista(clave, inicial) {
  const [valor, guardar] = useState(() => vistas.has(clave) ? vistas.get(clave) : inicial)
  const set = (cambio) => guardar((anterior) => {
    const siguiente = typeof cambio === 'function' ? cambio(anterior) : cambio
    vistas.set(clave, siguiente)
    return siguiente
  })
  return [valor, set]
}
export function useScrollVista(clave) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.scrollTop = vistas.get(clave) || 0
    const guardar = () => vistas.set(clave, el.scrollTop)
    el.addEventListener('scroll', guardar)
    return () => el.removeEventListener('scroll', guardar)
  }, [clave])
  return ref
}

export function leerBorrador(clave, inicial) {
  try { return { ...inicial, ...JSON.parse(sessionStorage.getItem(clave) || '{}') } } catch { return inicial }
}
export function guardarBorrador(clave, valor) {
  try { sessionStorage.setItem(clave, JSON.stringify(valor)) } catch { /* La edición sigue funcionando sin almacenamiento. */ }
}
export function borrarBorrador(clave) {
  try { sessionStorage.removeItem(clave) } catch { /* sin almacenamiento */ }
}
