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
  x: 'M6 6l12 12 M18 6 6 18',
  wa: 'M4.5 19.5l1.2-3.6A8 8 0 1 1 8.6 18.6L4.5 19.5Z M9.2 8.6c.2-.4.5-.5.8-.5h.5l.9 2.1-.6.8c.5 1 1.3 1.8 2.3 2.3l.8-.6 2.1.9v.5c0 .4-.2.7-.5.8-.7.4-1.6.4-2.6-.1a8 8 0 0 1-3.6-3.6c-.5-1-.5-1.9-.1-2.6Z',
  lock: 'M6.5 10.5h11v9.5h-11z M8.8 10.5V8a3.2 3.2 0 0 1 6.4 0v2.5',
  hour: 'M7 3.5h10 M7 20.5h10 M8 3.5c0 4.5 8 4.5 8 8.5s-8 4-8 8.5 M16 3.5c0 4.5-8 4.5-8 8.5s8 4 8 8.5',
  trend: 'M3.5 17 9.5 11l4 4L20.5 8 M15 8h5.5v5.5',
  spark: 'M12 3.5l1.9 5.6 5.6 1.9-5.6 1.9L12 18.5l-1.9-5.6-5.6-1.9 5.6-1.9L12 3.5Z M19 16v4 M17 18h4',
  thumb: 'M7.5 10.5v9h-3v-9h3Z M7.5 10.5 11 4c1.6 0 2.5 1 2.2 2.6l-.5 2.9h5.2a1.8 1.8 0 0 1 1.8 2.1l-1.1 6.6a1.8 1.8 0 0 1-1.8 1.5H7.5',
  route: 'M6 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M18 9.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M8 16.5h6.5a3 3 0 0 0 0-6h-5a3 3 0 0 1 0-6H16',
  ext: 'M13.5 4.5h6v6 M19.5 4.5 11 13 M17.5 14v5.5h-13v-13H10',
  bag: 'M5 8h14l-1.2 12.5H6.2L5 8Z M9 8V6.5a3 3 0 0 1 6 0V8'
}

export function Icon({ n, s = 20, w = 1.6 }) {
  const parts = (I[n] || '').split(' M')
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {parts.map((d, i) => <path key={i} d={i ? 'M' + d : d} />)}
    </svg>
  )
}

/* ---------- Símbolo oficial v2.0 (La celda abierta) ---------- */
export function CeldaAbierta({ s = 24, color = 'var(--ink)' }) {
  return (
    <svg width={s} height={Math.round(s * 1.12)} viewBox="8 3 84 94" fill="none" aria-hidden="true" style={{ flex: 'none' }}>
      <path d="M84.64 38 L84.64 30 L50 10 L15.36 30 L15.36 70 L50 90 L84.64 70 L84.64 62" stroke={color} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="50,36 62.12,43 62.12,57 50,64 37.88,57 37.88,43" fill={color} />
    </svg>
  )
}

/* ---------- Avatar hexagonal (v2.0: fondo Tinta #0F0F0D, iniciales Polen #FFF200) ---------- */
export function Hex({ p, w = 40, h, fs, style }) {
  const hh = h || Math.round(w * 1.1)
  return (
    <div className="hexav" aria-hidden="true"
      style={{ width: w, height: hh, fontSize: fs || Math.round(w * 0.36), ...style }}>
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
export function BrandHeader({ right }) {
  return (
    <header className="brandhead">
      <div className="brand-lockup"><CeldaAbierta s={25} /><span>Colmena</span></div>
      <div className="hactions">{right}</div>
    </header>
  )
}

export function Header({ title, sub, right }) {
  return (
    <>
      <BrandHeader right={right} />
      <header className="apphead">
        <div className="hgroup"><h1>{title}</h1>{sub && <p className="sub">{sub}</p>}</div>
      </header>
    </>
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
  const dialog = useRef(null)
  useEffect(() => {
    const el = dialog.current
    if (open && !el.open) el.showModal()
    else if (!open && el.open) el.close()
  }, [open])
  return (
    <dialog ref={dialog} className="sheet" aria-label={label}
      onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet-content">
        <div className="grab" aria-hidden="true" />
        <button type="button" className="iconbtn sheet-close" onClick={onClose} aria-label="Cerrar"><Icon n="x" s={20} /></button>
        {open && children}
      </div>
    </dialog>
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
      <div className="empty-icon"><Icon n={icon} s={28} /></div>
      <b>{title}</b>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}

/* ---------- Panal de 19 celdas (1 + 6 + 12), hexágonos de punta arriba ---------- */
const PANAL_POS = (() => {
  const pos = []
  for (let q = -2; q <= 2; q++) for (let r = -2; r <= 2; r++) {
    const ring = Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r))
    if (ring > 2) continue
    const x = q + r / 2, y = 0.866 * r
    pos.push({ q, r, ring, ang: (Math.atan2(y, x) + 2.5 * Math.PI) % (2 * Math.PI) })
  }
  return pos.sort((a, b) => a.ring - b.ring || a.ang - b.ang).map((p) => [p.q, p.r])
})()

export function Panal({ celdas = [], total = 19, size = 26, dark = true }) {
  const w = Math.sqrt(3) * size, h = 2 * size
  const pts = PANAL_POS.slice(0, total).map(([q, r]) => [w * (q + r / 2), 0.75 * h * r])
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1])
  const minX = Math.min(...xs) - w / 2, minY = Math.min(...ys) - h / 2
  const W = Math.max(...xs) - minX + w / 2, H = Math.max(...ys) - minY + h / 2
  const hex = (cx, cy) => Array.from({ length: 6 }, (_, i) => {
    const a = (60 * i - 90) * Math.PI / 180, rr = size - 1.6
    return (cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1)
  }).join(' ')
  return (
    <svg className="panal" viewBox={`${minX.toFixed(1)} ${minY.toFixed(1)} ${W.toFixed(1)} ${H.toFixed(1)}`} role="img"
      aria-label={`${celdas.length} de ${total} celdas llenas`}>
      {pts.map(([x, y], i) => {
        const c = celdas[i]
        return (
          <g key={i}>
            <polygon points={hex(x, y)} fill={c ? 'var(--polen)' : 'none'}
              stroke={c ? 'var(--polen)' : (dark ? 'rgba(255,255,255,.28)' : 'rgba(15,15,13,.28)')} strokeWidth="1.4" strokeDasharray={c ? undefined : '3 3'} />
            {c && <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.52} fontWeight="700" fill="var(--ink)" fontFamily="var(--disp)">{c}</text>}
          </g>
        )
      })}
    </svg>
  )
}

export function Stars({ n, s = 14 }) {
  return (
    <span className="stars" aria-label={`${n} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={s} height={s} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3.5l2.6 5.5 6 .8-4.4 4.1 1.1 6-5.3-2.9-5.3 2.9 1.1-6-4.4-4.1 6-.8L12 3.5Z" fill={i <= n ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  )
}

export function Mark({ children }) {
  return <mark className="hl">{children}</mark>
}
