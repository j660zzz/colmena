import { useState } from 'react'
import { TOOLS, TOOLCATS } from '../data/contenido'
import { cop } from '../lib/format'
import { Icon, Header, SubHeader, useToast } from '../components/ui'

export default function Herramientas({ nav, headerRight }) {
  const [cat, setCat] = useState(null)
  const lista = cat ? TOOLS.filter((t) => t.cat === cat) : TOOLS
  return (
    <>
      <Header title="Herramientas" sub="Para dejar de improvisar" right={headerRight} />
      <div className="body">
        <button type="button" className="feature" onClick={() => nav({ t: 'calc' })}>
          <span className="k">Calculadora</span>
          <h3>¿Cuánto cuesta lo que haces?</h3>
          <p>Construye tu precio desde materiales, horas y gastos fijos. Deja de cotizar a ojo.</p>
          <span className="go">Abrir calculadora <Icon n="right" s={17} w={2} /></span>
        </button>
        <div className="sec-h"><h3>Biblioteca</h3><span className="meta">{lista.length} recursos</span></div>
        <div className="chips" role="group" aria-label="Filtrar herramientas">
          {TOOLCATS.map((x) => <button key={x} type="button" className="chip" aria-pressed={cat === x} onClick={() => setCat(cat === x ? null : x)}>{x}</button>)}
        </div>
        <div className="gap-16" />
        <div className="tools">
          {lista.map((t) => (
            <button key={t.id} type="button" className="tool" onClick={() => nav({ t: 'ficha', id: t.id })}>
              <span className="k">{t.k}</span><b>{t.n}</b><span>{t.d}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export function Ficha({ id, onBack }) {
  const toast = useToast()
  const t = TOOLS.find((x) => x.id === id)
  if (!t) return null
  const copiar = async (txt) => {
    try { await navigator.clipboard.writeText(txt); toast('Plantilla copiada') } catch { toast('No se pudo copiar', true) }
  }
  return (
    <>
      <SubHeader title={t.k} onBack={onBack} />
      <div className="body ficha fade">
        <h2 style={{ margin: '4px 0 0', fontFamily: 'var(--disp)', fontSize: 26, letterSpacing: '-.03em', lineHeight: 1.15 }}>{t.n}</h2>
        <p className="lead">{t.lead}</p>
        {t.secciones.map((s) => (
          <section key={s.h}>
            <h4>{s.h}</h4>
            {s.p && s.p.map((x, i) => <p key={i}>{x}</p>)}
            {s.ul && <ul>{s.ul.map((x, i) => <li key={i}>{x}</li>)}</ul>}
            {s.ol && <ol>{s.ol.map((x, i) => <li key={i}>{x}</li>)}</ol>}
            {s.pre && (
              <>
                <pre>{s.pre}</pre>
                <div className="gap-12" />
                <button type="button" className="btn ghost full" onClick={() => copiar(s.pre)}><Icon n="copy" s={17} />Copiar</button>
              </>
            )}
          </section>
        ))}
        {t.nota && <p className="nota">{t.nota}</p>}
      </div>
    </>
  )
}

const K_CALC = 'colmena.calc.v1'
const INICIAL = { mat: 120000, hrs: 14, vh: 35000, fix: 900000, proj: 4, mg: 35 }

export function Calculadora({ onBack }) {
  const [v, setV] = useState(() => {
    try { return { ...INICIAL, ...JSON.parse(localStorage.getItem(K_CALC) || '{}') } } catch { return INICIAL }
  })
  const set = (k) => (e) => {
    const n = { ...v, [k]: Math.max(0, Number(e.target.value) || 0) }
    setV(n)
    try { localStorage.setItem(K_CALC, JSON.stringify(n)) } catch { /* nada */ }
  }
  const mano = v.hrs * v.vh
  const fijo = v.proj > 0 ? v.fix / v.proj : 0
  const costo = v.mat + mano + fijo
  const precio = costo * (1 + v.mg / 100)

  const F = ({ id, label, k, pre, suf, step = 1000 }) => (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="inp">
        {pre && <span className="pre">{pre}</span>}
        <input id={id} className="num" type="number" inputMode="numeric" min="0" step={step} value={v[k]} onChange={set(k)} />
        {suf && <span className="suf">{suf}</span>}
      </div>
    </div>
  )

  return (
    <>
      <SubHeader title="¿Cuánto cuesta lo que haces?" onBack={onBack} />
      <div className="body fade">
        <div className="out">
          <div className="hero"><div className="l"><span>Precio sugerido</span><b>{cop(precio)}</b></div><em>+{cop(precio - costo)}</em></div>
          <div className="line"><span>Materiales e insumos</span><b>{cop(v.mat)}</b></div>
          <div className="line"><span>Tu trabajo · {v.hrs} h</span><b>{cop(mano)}</b></div>
          <div className="line"><span>Gastos fijos asignados</span><b>{cop(fijo)}</b></div>
          <div className="line" style={{ background: 'var(--surface-2)' }}><span style={{ fontWeight: 650, color: 'var(--ink)' }}>Costo total</span><b>{cop(costo)}</b></div>
        </div>
        <div className="sec-h"><h3>Tus cifras</h3><span className="meta">Pesos colombianos</span></div>
        <div className="calc">
          {F({ id: 'c-mat', label: 'Materiales e insumos del proyecto', k: 'mat', pre: '$' })}
          <div className="grid2">
            {F({ id: 'c-hrs', label: 'Horas de trabajo', k: 'hrs', suf: 'h', step: 1 })}
            {F({ id: 'c-vh', label: 'Valor de tu hora', k: 'vh', pre: '$' })}
          </div>
          <div className="grid2">
            {F({ id: 'c-fix', label: 'Gastos fijos al mes', k: 'fix', pre: '$' })}
            {F({ id: 'c-proj', label: 'Proyectos al mes', k: 'proj', step: 1 })}
          </div>
          {F({ id: 'c-mg', label: 'Margen de ganancia', k: 'mg', suf: '%', step: 1 })}
        </div>
        <div className="bring" style={{ marginTop: 18 }}>
          <Icon n="bulb" s={19} />
          <p>Los gastos fijos son arriendo, internet, software y transporte. Repartirlos entre tus proyectos del mes es lo que casi nadie hace, y es donde se pierde la plata.</p>
        </div>
      </div>
    </>
  )
}
