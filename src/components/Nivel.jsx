import { useEffect, useState } from 'react'
import { useColmena } from '../lib/store'
import { nivelDe, NIVELES, PUNTOS } from '../lib/logic'
import { Icon, Sheet, useToast } from './ui'

// Hexágono de punta arriba con un lado por nivel. No es el símbolo de marca: es un indicador de progreso.
const PTS = [0, 1, 2, 3, 4, 5].map((i) => {
  const a = Math.PI / 180 * (60 * i - 90)
  return [50 + 42 * Math.cos(a), 50 + 42 * Math.sin(a)]
})
export function CeldaNivel({ n, size = 56, oscuro = false, numero = true }) {
  const lleno = n >= 4
  return (
    <svg className={'celda-nivel' + (oscuro ? ' oscuro' : '')} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`Nivel ${n} de 6`}>
      {lleno && <polygon points={PTS.map((p) => p.join(',')).join(' ')} className="cn-fondo" />}
      {PTS.map((p, i) => {
        const q = PTS[(i + 1) % 6]
        return <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} className={i < n ? 'on' : 'off'} />
      })}
      {numero && <text x="50" y="50" dominantBaseline="central" textAnchor="middle">{n}</text>}
    </svg>
  )
}

export function NivelChip({ id, nombre }) {
  const c = useColmena()
  const [ver, setVer] = useState(false)
  const l = nivelDe(c, id)
  if (l.n < 2) return null
  return (
    <>
      <button type="button" className="nivel-chip" onClick={() => setVer(true)} aria-label={`Nivel ${l.n}, ${l.t}. Ver cómo funcionan los niveles`}>
        <CeldaNivel n={l.n} size={24} numero={false} />Nivel {l.n} · {l.t}<Icon n="right" s={14} w={2} />
      </button>
      <Sheet open={ver} onClose={() => setVer(false)} label="Cómo funcionan los niveles">
        {ver && <ComoSubir actual={l} otro={nombre} />}
      </Sheet>
    </>
  )
}

export function NivelCard({ id }) {
  const c = useColmena()
  const [ver, setVer] = useState(false)
  const l = nivelDe(c, id)
  return (
    <section className="nivel-card">
      <CeldaNivel n={l.n} size={64} />
      <div className="nv-t">
        <span className="k">Tu nivel</span>
        <b>Nivel {l.n} · {l.t}</b>
        {l.sig ? (
          <>
            <div className="prog"><i style={{ width: Math.max(4, Math.round(l.avance * 100)) + '%' }} /></div>
            <small>{l.puntos} puntos · te {l.faltan === 1 ? 'falta 1' : `faltan ${l.faltan}`} para {l.sig.t}</small>
          </>
        ) : <small>{l.puntos} puntos · llegaste al nivel más alto</small>}
        <button type="button" className="linkbtn" onClick={() => setVer(true)}>Cómo subir de nivel</button>
      </div>
      <Sheet open={ver} onClose={() => setVer(false)} label="Cómo subir de nivel">
        {ver && <ComoSubir actual={l} />}
      </Sheet>
    </section>
  )
}

function ComoSubir({ actual, otro }) {
  return (
    <div className="como-subir">
      <h2>{otro ? 'Cómo funcionan los niveles' : 'Tu celda se va cerrando'}</h2>
      <p className="soft">Cada nivel cierra un lado de tu celda. Subes con lo que haces por otros miembros. No pierdes nada si no subes: todo Colmena funciona desde el nivel 1.</p>
      <h3>Cómo sumar puntos</h3>
      <ul className="cs-puntos">
        {PUNTOS.map((p) => (
          <li key={p.k}><span>{p.t}</span><b>+{p.v}</b>{!otro && actual.detalle[p.k] > 0 && <small>{p.k === 'completo' ? 'Hecho' : `Llevas ${actual.detalle[p.k]}`}</small>}</li>
        ))}
      </ul>
      <h3>Los niveles</h3>
      <ol className="cs-niveles">
        {NIVELES.map((x) => (
          <li key={x.n} className={x.n === actual.n ? 'now' : x.n < actual.n ? 'ok' : ''}>
            <CeldaNivel n={x.n} size={36} />
            <div><b>{x.t}{x.n === actual.n && <em> · {otro ? `${otro} está aquí` : 'Estás aquí'}</em>}</b><span>{x.da}</span><small>Desde {x.desde} puntos</small></div>
          </li>
        ))}
      </ol>
    </div>
  )
}

// Aviso suave cuando subes de nivel (se recuerda en este navegador)
const K = 'colmena.nivel.v1'
export function AvisoNivel() {
  const c = useColmena()
  const toast = useToast()
  const id = c.yo?.id
  const n = id ? nivelDe(c, id).n : 0
  const t = id ? nivelDe(c, id).t : ''
  useEffect(() => {
    if (!id || c.cargando) return
    let antes = 0
    try { antes = Number(localStorage.getItem(K + id) || 0) } catch { /* sin almacenamiento */ }
    if (antes && n > antes) toast(`Subiste a nivel ${n}: ${t}`)
    try { localStorage.setItem(K + id, String(n)) } catch { /* sin almacenamiento */ }
  }, [id, n, c.cargando]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
