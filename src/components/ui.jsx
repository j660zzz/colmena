import { useEffect, useRef, useState, useCallback, createContext, useContext } from 'react'
import { initials } from '../lib/format'

/* ---------- Íconos (trazo 1.6, 24×24) ---------- */
const I = {
  // Kit de íconos Colmena v1 · retícula 24, área útil 3–21, trazo 1.75, remates y uniones redondas,
  // esquinas de radio 2–2,5. El hexágono de punta arriba es el motivo de marca (carnet, verificado).
  // Dibujos propios: no se usan logos de terceros (WhatsApp e Instagram se representan con chat y cámara).
  bell: 'M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15l1.5-2Z M10 21h4',
  search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z M15.3 15.3 20 20',
  plus: 'M12 5v14 M5 12h14',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  back: 'M15 5l-7 7 7 7',
  right: 'M9 5l7 7-7 7',
  share: 'M12 14.5V4 M8 7.5 12 3.5l4 4 M5 12v6.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V12',
  clock: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z M12 7.5V12l3 2',
  pin: 'M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 1 1 13 0c0 5.4-6.5 11-6.5 11Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  cal: 'M6.5 5h11A2.5 2.5 0 0 1 20 7.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5v-11A2.5 2.5 0 0 1 6.5 5Z M8 3v4 M16 3v4 M4 10h16',
  note: 'M14 3.5H7.5A2.5 2.5 0 0 0 5 6v12a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18V8.5l-5-5Z M14 3.5V7a1.5 1.5 0 0 0 1.5 1.5H19 M9 13h6 M9 16.5h4',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M2.5 20a6.5 6.5 0 0 1 13 0 M16 4.3a3.5 3.5 0 0 1 0 6.4 M18 14c2 .9 3.5 3 3.5 6',
  wall: 'M6 4h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z M6 13h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Z',
  tools: 'M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7 M6 7h12a2.5 2.5 0 0 1 2.5 2.5v8A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5v-8A2.5 2.5 0 0 1 6 7Z M3.5 12.5h17',
  card: 'M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9L12 3Z M12 12a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z M8.5 16.6c.6-1.7 1.9-2.6 3.5-2.6s2.9.9 3.5 2.6',
  link: 'M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1 M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z',
  gift: 'M5 11.5v7A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-7 M4.5 7.5h15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z M12 7.5V20 M12 7.5C10.8 4.6 7.5 3.8 7.5 5.9c0 1.2 1.8 1.6 4.5 1.6 M12 7.5c1.2-2.9 4.5-3.7 4.5-1.6 0 1.2-1.8 1.6-4.5 1.6',
  seal: 'M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9L12 3Z M8.6 12.2l2.4 2.4 4.6-4.8',
  hand: 'M8.5 12V6.5a1.5 1.5 0 0 1 3 0V11 M11.5 10.5V5a1.5 1.5 0 0 1 3 0v5.5 M14.5 11V6.5a1.5 1.5 0 0 1 3 0V13 M8.5 12.5 7 11a1.7 1.7 0 0 0-2.6 2.2l2.9 4.4A6.5 6.5 0 0 0 12.7 20.5h.3a4.5 4.5 0 0 0 4.5-4.5V13',
  bulb: 'M9.5 18h5 M10.5 21h3 M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.3v.4h5v-.4c0-.9.4-1.7 1.1-2.3A6 6 0 0 0 12 3Z',
  copy: 'M10 8h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2',
  ig: 'M8.5 6.5l1.2-2h4.6l1.2 2H18a2.5 2.5 0 0 1 2.5 2.5v8.5A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5V9A2.5 2.5 0 0 1 6 6.5h2.5Z M12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  trash: 'M4.5 6.5h15 M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5 M6.5 6.5l.8 12.1A2.5 2.5 0 0 0 9.8 21h4.4a2.5 2.5 0 0 0 2.5-2.4l.8-12.1 M10 10.5v6 M14 10.5v6',
  edit: 'M4 20h4L19.3 8.7a2.1 2.1 0 0 0 0-3l-1-1a2.1 2.1 0 0 0-3 0L4 16v4Z M13.5 6.5l4 4',
  alert: 'M10.3 4.3 2.9 17.5a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z M12 9.5v4 M12 17h.01',
  x: 'M6 6l12 12 M18 6 6 18',
  wa: 'M12 3.5a8.5 8.5 0 0 0-7.4 12.7L3.5 20.5l4.4-1.1A8.5 8.5 0 1 0 12 3.5Z M8.5 12h.01 M12 12h.01 M15.5 12h.01',
  lock: 'M7.5 10.5V8a4.5 4.5 0 0 1 9 0v2.5 M6.5 10.5h11A1.5 1.5 0 0 1 19 12v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19v-7a1.5 1.5 0 0 1 1.5-1.5Z M12 14.5v2',
  hour: 'M6.5 3.5h11 M6.5 20.5h11 M7.5 3.5v2.3c0 1.8 1 3.4 2.5 4.3l2 1.4 2-1.4c1.5-.9 2.5-2.5 2.5-4.3V3.5 M7.5 20.5v-2.3c0-1.8 1-3.4 2.5-4.3l2-1.4 2 1.4c1.5.9 2.5 2.5 2.5 4.3v2.3',
  trend: 'M3.5 16.5 9 11l4 4 7.5-7.5 M15 7.5h5.5V13',
  spark: 'M11 3.5l1.8 5.2 5.2 1.8-5.2 1.8L11 17.5l-1.8-5.2L4 10.5l5.2-1.8L11 3.5Z M18.5 15v5 M16 17.5h5',
  thumb: 'M4 12a1.5 1.5 0 0 1 1.5-1.5h2V20h-2A1.5 1.5 0 0 1 4 18.5V12Z M7.5 10.5 11.2 4a2.2 2.2 0 0 1 2.3 2.6l-.5 3h4.8a2 2 0 0 1 2 2.3l-1.1 6.4a2 2 0 0 1-2 1.7H7.5',
  route: 'M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M18 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M8 18h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16',
  ext: 'M14 4h6v6 M20 4l-9 9 M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4',
  bag: 'M5.5 8h13l-1 11a2 2 0 0 1-2 1.8h-7a2 2 0 0 1-2-1.8l-1-11Z M9 8V6.5a3 3 0 0 1 6 0V8',
  // Cobro: moneda con signo de pesos. Intercambio: la misma moneda con dos flechas que se cruzan (pareja visual)
  cash: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z M14.6 9.3c-.4-.9-1.4-1.6-2.6-1.6-1.4 0-2.5.8-2.5 1.9 0 2.6 5.1 1.3 5.1 4 0 1.2-1.1 2-2.6 2-1.3 0-2.3-.6-2.7-1.5 M12 6.2v1.5 M12 15.6v1.6',
  deal: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z M7.75 9.75h8.5 M14 7.5l2.25 2.25L14 12 M16.25 14.25h-8.5 M10 12l-2.25 2.25L10 16.5'
}

// Ajuste óptico: algunos dibujos se ven pequeños a igual tamaño y se escalan sin engrosar el trazo
const ESCALA = {}

export function Icon({ n, s = 20, w = 1.75 }) {
  const parts = (I[n] || '').split(' M')
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g transform={ESCALA[n] ? `translate(12 12.5) scale(${ESCALA[n]}) translate(-12 -12.5)` : undefined} strokeWidth={ESCALA[n] ? w / ESCALA[n] : undefined}>
        {parts.map((d, i) => <path key={i} d={i ? 'M' + d : d} />)}
      </g>
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

// La marca queda fija arriba; el título de cada pestaña va dentro del scroll (ver Titulo)
export function Header({ right }) {
  return <BrandHeader right={right} />
}

export function Titulo({ title, sub }) {
  return (
    <header className="ptitle">
      <h1>{title}</h1>
      {sub && <p className="sub">{sub}</p>}
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
