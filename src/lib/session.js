// Sesión sin cuenta: al crear el perfil, el servidor devuelve un id y una
// clave secreta que viven solo en este navegador. Con esa clave el
// dispositivo puede publicar, ayudar y confirmar a nombre de su perfil.
const K = 'colmena.sesion.v1'

export function leerSesion() {
  try {
    const raw = localStorage.getItem(K)
    if (!raw) return null
    const s = JSON.parse(raw)
    return s && s.id && s.clave ? s : null
  } catch { return null }
}

export function guardarSesion(s) {
  try { localStorage.setItem(K, JSON.stringify(s)) } catch { /* modo privado */ }
}

export function borrarSesion() {
  try { localStorage.removeItem(K) } catch { /* nada */ }
}

const K_VISTO = 'colmena.bienvenida.v1'
export const yaVioBienvenida = () => { try { return localStorage.getItem(K_VISTO) === '1' } catch { return false } }
export const marcarBienvenida = () => { try { localStorage.setItem(K_VISTO, '1') } catch { /* nada */ } }
