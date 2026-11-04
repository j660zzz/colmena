import { useEffect, useState } from 'react'
import { TOOLS, TOOLCATS } from '../data/contenido'
import { cop } from '../lib/format'
import { Icon, Header, SubHeader, useToast } from '../components/ui'
import { marcarCalcAbierta } from './Onboarding'
import { EstadoDatos } from '../components/EstadoDatos'
import { useEstadoVista, useScrollVista } from '../lib/vista'
import { SeccionBeneficios } from './Beneficios'

const K_LEIDAS = 'colmena.leidas.v1'
const leidas = () => { try { return JSON.parse(localStorage.getItem(K_LEIDAS) || '[]') } catch { return [] } }
const marcarLeida = (id) => { try { const l = leidas(); if (!l.includes(id)) localStorage.setItem(K_LEIDAS, JSON.stringify([...l, id])) } catch { /* nada */ } }
const ICONO = { Precio: 'note', Ventas: 'trend', Legal: 'seal', Marca: 'spark' }

export default function Herramientas({ nav, headerRight, pedirPerfil }) {
  const [cat, setCat] = useEstadoVista('herramientas.cat', null)
  const scroll = useScrollVista('herramientas.scroll')
  const ya = leidas()
  const lista = cat ? TOOLS.filter((t) => t.cat === cat) : TOOLS
  const empezar = TOOLS.filter((t) => !ya.includes(t.id)).slice(0, 2)
  const n = TOOLS.filter((t) => ya.includes(t.id)).length
  return (
    <>
      <Header right={headerRight} />
      <div className="body fade" ref={scroll}>
        <EstadoDatos nombres={['beneficios']}><SeccionBeneficios pedirPerfil={pedirPerfil} nav={nav} /></EstadoDatos>

        <div className="sec-h"><h3>Herramientas</h3></div>
        <button type="button" className="feature" onClick={() => nav({ t: 'calc' })}>
          <span className="dollar" aria-hidden="true">$</span>
          <span className="k">Calculadora</span>
          <h3>¿Cuánto cuesta lo que haces?</h3>
          <p>Calcula tu precio a partir de materiales, horas de trabajo y gastos fijos.</p>
          <span className="btn primary sm">Abrir calculadora <Icon n="right" s={16} w={2.2} /></span>
        </button>

        {empezar.length > 0 && (
          <>
            <div className="sec-h"><h3>Para empezar</h3><span className="meta">5 min de lectura</span></div>
            <div className="duo">
              {empezar.map((t) => (
                <button key={t.id} type="button" className="tool-mini" onClick={() => nav({ t: 'ficha', id: t.id })}>
                  <span className="ti"><Icon n={ICONO[t.cat] || 'note'} s={18} w={2} /></span>
                  <span className="tag">{t.k}</span>
                  <b>{t.n}</b>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="sec-h"><h3>Biblioteca</h3><span className="meta">{n} de {TOOLS.length} leídas</span></div>
        <div className="prog"><i style={{ width: Math.round(n / TOOLS.length * 100) + '%' }} /></div>
        <div className="chips" role="group" aria-label="Filtrar herramientas">
          <button type="button" className="chip" aria-pressed={!cat} onClick={() => setCat(null)}>Todo</button>
          {TOOLCATS.map((x) => <button key={x} type="button" className="chip" aria-pressed={cat === x} onClick={() => setCat(cat === x ? null : x)}>{x}</button>)}
        </div>
        <div className="cards">
          {lista.map((t) => {
            const leida = ya.includes(t.id)
            return (
              <button key={t.id} type="button" className="row-card link" onClick={() => nav({ t: 'ficha', id: t.id })}>
                <span className="ti"><Icon n={ICONO[t.cat] || 'note'} s={18} w={2} /></span>
                <span className="row-text"><span className="tag">{t.k}</span><b>{t.n}</b><small>{t.d}</small></span>
                {leida ? <span className="readhex" aria-label="Leída"><Icon n="check" s={12} w={3} /></span> : <Icon n="right" s={18} />}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

export function Ficha({ id, onBack }) {
  const toast = useToast()
  const t = TOOLS.find((x) => x.id === id)
  useEffect(() => { if (t) marcarLeida(t.id) }, [t])
  if (!t) return null
  const copiar = async (txt) => {
    try { await navigator.clipboard.writeText(txt); toast('Plantilla copiada') } catch { toast('No se pudo copiar', true) }
  }
  return (
    <>
      <SubHeader title={t.k} onBack={onBack} />
      <div className="body ficha fade">
        <h2>{t.n}</h2>
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

export function Calculadora({ onBack, abrirComposer }) {
  useEffect(() => { marcarCalcAbierta() }, [])
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
  const pct = (x) => costo > 0 ? Math.round(x / costo * 100) : 0
  const resumen = `Mi precio en Colmena: ${cop(precio)}\nMateriales: ${cop(v.mat)}\nTrabajo (${v.hrs} h): ${cop(mano)}\nGastos fijos: ${cop(fijo)}\nCosto total: ${cop(costo)}\nGanancia sobre el costo: ${v.mg}%`

  const F = ({ id, label, k, pre, suf, step = 1000 }) => (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="inp">
        {pre && <span className="pre">{pre}</span>}
        <input id={id} className="num mono" type="number" inputMode="numeric" min="0" step={step} value={v[k]} onChange={set(k)} />
        {suf && <span className="suf">{suf}</span>}
      </div>
    </div>
  )

  return (
    <>
      <SubHeader title="¿Cuánto cuesta lo que haces?" onBack={onBack} />
      <div className="body fade">
        <div className="out">
          <span className="k">Precio sugerido</span>
          <b className="price">{cop(precio)}</b>
          <span className="gain">Ganancia +{cop(precio - costo)}</span>
          <div className="out-panel">
            <div className="bar" aria-hidden="true"><i style={{ width: pct(v.mat) + '%' }} /><i style={{ width: pct(mano) + '%' }} /><i style={{ width: pct(fijo) + '%' }} /></div>
            <div className="line"><span><i className="sw s1" />Materiales e insumos</span><b className="mono">{cop(v.mat)}</b></div>
            <div className="line"><span><i className="sw s2" />Tu trabajo · {v.hrs} h</span><b className="mono">{cop(mano)}</b></div>
            <div className="line"><span><i className="sw s3" />Gastos fijos asignados</span><b className="mono">{cop(fijo)}</b></div>
            <div className="line total"><span>Costo total</span><b className="mono">{cop(costo)}</b></div>
          </div>
        </div>
        <div className="sec-h"><h3>Tus cifras</h3><span className="meta">Pesos colombianos</span></div>
        <div className="form">
          {F({ id: 'c-mat', label: 'Materiales e insumos del proyecto', k: 'mat', pre: '$' })}
          <div className="grid2">
            {F({ id: 'c-hrs', label: 'Horas de trabajo', k: 'hrs', suf: 'h', step: 1 })}
            {F({ id: 'c-vh', label: 'Valor de tu hora', k: 'vh', pre: '$' })}
          </div>
          <div className="grid2">
            {F({ id: 'c-fix', label: 'Gastos fijos al mes', k: 'fix', pre: '$' })}
            {F({ id: 'c-proj', label: 'Proyectos al mes', k: 'proj', step: 1 })}
          </div>
          <div className="field">
            <label htmlFor="c-mg">Ganancia sobre el costo <b className="mono">{v.mg}%</b></label>
            <input id="c-mg" className="range" type="range" min="0" max="100" step="5" value={v.mg} onChange={set('mg')} />
          </div>
        </div>
        <div className="tip"><Icon n="bulb" s={19} /><p>Los gastos fijos son arriendo, internet, software y transporte. Repartirlos entre los proyectos del mes evita cobrar por debajo de tus costos.</p></div>
        <section className="ink-card">
          <h3>¿Quieres una segunda opinión?</h3>
          <p>Publica una pregunta en el muro. Tus cifras no se muestran.</p>
          <button type="button" className="btn primary full" onClick={() => abrirComposer({ tipo: 'need', texto: '¿Estoy cobrando bien? Busco a alguien que me revise cómo calculo mis precios.' })}>Preguntar en el muro</button>
        </section>
        <a className="btn ghost full" href={`https://wa.me/?text=${encodeURIComponent(resumen)}`} target="_blank" rel="noopener noreferrer"><Icon n="wa" s={18} />Enviar por WhatsApp</a>
        <p className="fine center">Tus cifras se guardan solo en este dispositivo.</p>
      </div>
    </>
  )
}
