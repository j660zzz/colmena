const COP = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })
export const cop = (v) => '$' + COP.format(Math.max(0, Math.round(v || 0)))

export const initials = (n = '') => {
  const p = n.trim().split(/\s+/)
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || '·'
}

export const firstName = (n = '') => n.trim().split(/\s+/)[0] || n

export const carnetId = (num) => 'COL-' + String(num ?? 0).padStart(4, '0')

export function hace(fecha) {
  const s = Math.max(0, (Date.now() - new Date(fecha).getTime()) / 1000)
  if (s < 60) return 'ahora'
  const m = Math.floor(s / 60)
  if (m < 60) return `hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'ayer'
  if (d < 7) return `hace ${d} días`
  return new Date(fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

export function fechaLarga(f) {
  if (!f) return null
  const s = new Date(f).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Bogota' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function mesDesde(f) {
  const s = new Date(f).toLocaleDateString('es-CO', { month: 'long', year: 'numeric', timeZone: 'America/Bogota' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const AVATAR_COLORS = ['#17140F', '#0F7A66', '#C4761A', '#3D5A4C', '#8A5A07', '#2E3A4A', '#7A3E52', '#4A5D23']

export const igUrl = (u) => 'https://instagram.com/' + encodeURIComponent(u.replace(/^@/, ''))
