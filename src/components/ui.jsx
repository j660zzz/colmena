import { useEffect, useRef, useState, useCallback, createContext, useContext } from 'react'
import { initials } from '../lib/format'

/* ---------- Íconos (trazo 1.6, 24×24) ---------- */
const I = {
  bell: 'M18 16v-5a6 6 0 1 0-12 0v5l-1.5 2.5h15L18 16Z M9.5 19a2.5 2.5 0 0 0 5 0',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z M16.2 16.2 21 21',
  plus: 'M12 5v14 M5 12h14',
  check: 'M4.5 12.5 9.5 17.5 19.5 6.5',
  back: 'M14.5 5 8 12l6.5 7',
  right: 'M9.5 5 16 12l-6.5 7',
  share: 'M12 15V3 M8 6.5 12 2.5l4 4 M4.5 13v6.5h15V13',
  clock: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z M12 8v4.4l3 1.8',
  pin: 'M12 21s6.5-6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  cal: 'M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v11A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5v-11Z M8 3v4 M16 3v4 M4 10.5h16',
  note: 'M6 3.5h9L19 8v12.5H6V3.5Z M14.5 3.5V8H19 M9 12.5h7 M9 16h5',
  users: 'M9.2 4.6a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6Z M2.8 20c0-3.5 2.9-6.4 6.4-6.4s6.4 2.9 6.4 6.4 M15.8 5.4a3 3 0 0 1 0 5.4 M17.6 14.2c2.1.9 3.6 2.7 3.6 5.8',
  wall: 'M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v3A1.5 1.5 0 0 1 18.5 10h-13A1.5 1.5 0 0 1 4 8.5v-3Z M4 15.5A1.5 1.5 0 0 1 5.5 14h13a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-3Z',
  tools: 'M9 7V5.6A1.6 1.6 0 0 1 10.6 4h2.8A1.6 1.6 0 0 1 15 5.6V7 M3.5 7.5h17v11a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-11Z M3.5 12.5h17',
  card: 'M12 3l7.5 4.4v9.2L12 21l-7.5-4.4V7.4L12 3Z M12 11.4a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2Z M8.2 16.6c.4-1.9 1.9-2.9 3.8-2.9s3.4 1 3.8 2.9',
  link: 'M10 13.8a3.6 3.6 0 0 0 5.1 0l2.6-2.6a3.6 3.6 0 0 0-5.1-5.1l-1.2 1.2 M14 10.2a3.6 3.6 0 0 0-5.1 0l-2.6 2.6a3.6 3.6 0 0 0 5.1 5.1l1.2-1.2',
  star: 'M12 4l2.4 5.2 5.6.7-4.1 3.9 1 5.6-4.9-2.7-4.9 2.7 1-5.6L4 9.9l5.6-.7L12 4Z',
  seal: 'M12 3.5l2 1.6 2.5-.3 1 2.4 2.2 1.3-.7 2.4.7 2.4-2.2 1.3-1 2.4-2.5-.3-2 1.6-2-1.6-2.5.3-1-2.4L2.3 15l.7-2.4-.7-2.4 2.2-1.3 1-2.4 2.5.3 2-1.6Z M9 12l2 2 4-4',
  hand: 'M8 12.5V6.8a1.4 1.4 0 0 1 2.8 0v5 M10.8 11V5.4a1.4 1.4 0 0 1 2.8 0V11 M13.6 11.4V7a1.4 1.4 0 0 1 2.8 0v6.5c0 3.6-2.4 6.5-6 6.5s-6-2.9-6-6.5v-1.6a1.4 1.4 0 0 1 2.8 0',
  bulb: 'M9 17.5h6 M10 21h4 M12 3a6 6 0 0 0-3.5 10.9V17.5h7V13.9A6 6 0 0 0 12 3Z',
  copy: 'M8.5 8.5h11v11h-11z M15.5 8.5V4.5h-11v11h4',
  ig: 'M7.5 3.5h9a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4Z M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z M17 6.8h.01',
  trash: 'M4.5 7h15 M9.5 7V4.5h5V7 M6.5 7l1 13h9l1-13',
  edit: 'M4.5 19.5h4l10-10-4-4-10 10v4Z M13 7l4 4',
  alert: 'M12 4 2.8 20h18.4L12 4Z M12 10v4.5 M12 17.5h.01',
  x: 'M6 6l12 12 M18 6 6 18'
}

export function Icon({ n, s = 20, w = 1.6 }) {
  const parts = (I[n] || '').split(' M')
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {parts.map((d, i) => <path key={i} d={i ? 'M' + d : d} />)}
    </svg>
  )
}

/* ---------- Avatar hexagonal ---------- */
export function Hex({ p, w = 40, h, fs, style }) {
  const hh = h || Math.round(w * 1.1)
  return (
    <div className="hexav" aria-hidden="true"
      style={{ width: w, height: hh, background: p?.color || 'var(--hairline)', fontSize: fs || Math.round(w * 0.36), ...style }}>
      {p ? initials(p.nombre) : ''}
    </div>
  )
}

export function Ejemplo({ p }) {
  return p?.es_ejemplo ? <span className="ejemplo" title="Perfil de muestra">Ejemplo</span> : null
}

/* ---------- Panal (patrón estructural) ---------- */
export function combPoints(r, w, h, x0, y0, inset = 2) {
  const dx = 1.7320508 * r, dy = 1.5 * r, out = []
  let row = 0
  for (let y = y0; y < h; y += dy, row++) {
    for (let x = x0 + (row % 2 ? dx / 2 : 0); x < w; x += dx) {
      const p = []
      for (let i = 0; i < 6; i++) {
        const a = (60 * i - 90) * Math.PI / 180
        p.push((x + (r - inset) * Math.cos(a)).toFixed(1) + ',' + (y + (r - inset) * Math.sin(a)).toFixed(1))
      }
      out.push(p.join(' '))
    }
  }
  return out
}

export function Comb({ className, viewBox, r, w, h, x0, y0, stroke, sw = 1, inset }) {
  const pts = combPoints(r, w, h, x0, y0, inset)
  return (
    <svg className={className} viewBox={viewBox} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {pts.map((p, i) => <polygon key={i} points={p} fill="none" stroke={stroke} strokeWidth={sw} />)}
    </svg>
  )
}

/* ---------- Cabeceras ---------- */
export function Header({ title, sub, right }) {
  return (
    <header className="apphead">
      <div className="hgroup"><h2>{title}</h2>{sub && <p className="sub">{sub}</p>}</div>
      <div className="hactions">{right}</div>
    </header>
  )
}

export function SubHeader({ title, onBack, right }) {
  return (
    <header className="subhead">
      <button type="button" className="iconbtn" onClick={onBack} aria-label="Volver"><Icon n="back" s={22} /></button>
      <h2>{title}</h2>
      {right}
    </header>
  )
}

/* ---------- Bottom sheet ---------- */
export function Sheet({ open, onClose, label, children }) {
  useEffect(() => {
    if (!open) return
    const k = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])
  return (
    <>
      <div className={'scrim' + (open ? ' on' : '')} onClick={onClose} />
      <div className={'sheet' + (open ? ' on' : '')} role="dialog" aria-modal="true" aria-label={label} aria-hidden={!open}>
        <div className="grab" />
        {open && children}
      </div>
    </>
  )
}

/* ---------- Toast ---------- */
const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [t, setT] = useState({ on: false, msg: '', error: false })
  const timer = useRef()
  const show = useCallback((msg, error = false) => {
    setT({ on: true, msg, error })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setT((x) => ({ ...x, on: false })), 2800)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className={'toast' + (t.on ? ' on' : '') + (t.error ? ' error' : '')} role="status" aria-live="polite">
        <Icon n={t.error ? 'alert' : 'check'} s={18} w={2.2} /><span>{t.msg}</span>
      </div>
    </ToastCtx.Provider>
  )
}

/* ---------- Estado vacío ---------- */
export function Empty({ icon = 'search', title, children, action }) {
  return (
    <div className="empty">
      <div className="hexav" style={{ width: 52, height: 58, background: 'var(--hairline)', color: 'var(--ink-4)' }}><Icon n={icon} s={22} /></div>
      <b>{title}</b>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}
