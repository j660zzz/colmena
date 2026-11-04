import { useState } from 'react'
import { Icon, Sheet } from './ui'

// Cómo cobra cada miembro. El dato es perfiles.intercambio: dinero, trueque o ambos.
export const COBRO = {
  dinero: { t: 'Cobra', ic: ['cash'], d: 'Cobra por su trabajo. El precio lo acuerdan entre ustedes.' },
  trueque: { t: 'Intercambia', ic: ['deal'], d: 'Cambia su trabajo por el de otro miembro.' },
  ambos: { t: 'Cobra o intercambia', ic: ['cash', 'deal'], d: 'Cobra o intercambia, según el proyecto.' }
}
export const QUE_ES_INTERCAMBIAR = 'Intercambiar es cambiar tu trabajo por el de otro miembro.'

export function CobroIconos({ modo, s = 16 }) {
  const x = COBRO[modo]
  if (!x) return null
  return <span className="cobro-ic" aria-hidden="true">{x.ic.map((n) => <Icon key={n} n={n} s={n === 'deal' ? Math.round(s * 1.25) : s} w={1.8} />)}</span>
}

// Insignia. Con `abrir` es un botón que explica qué significa; sin él, solo se muestra.
// `solo` deja solo los íconos (para la línea del autor en el muro).
export function CobroInsignia({ modo, abrir = false, solo = false }) {
  const [ver, setVer] = useState(false)
  const x = COBRO[modo]
  if (!x) return null
  const cuerpo = <><CobroIconos modo={modo} s={solo ? 15 : 16} />{!solo && <span>{x.t}</span>}</>
  if (!abrir) return <span className={'cobro' + (solo ? ' solo' : '')} title={x.t}>{cuerpo}{solo && <span className="sr">{x.t}</span>}</span>
  return (
    <>
      <button type="button" className={'cobro btn-cobro' + (solo ? ' solo' : '')} onClick={(e) => { e.stopPropagation(); setVer(true) }}
        aria-label={`${x.t}. Ver qué significa`}>
        {cuerpo}
      </button>
      <Sheet open={ver} onClose={() => setVer(false)} label="Cómo cobra">
        {ver && <CobroExplica modo={modo} />}
      </Sheet>
    </>
  )
}

export function CobroExplica({ modo }) {
  return (
    <div className="cobro-hoja">
      <h3>{modo ? COBRO[modo].t : 'Cómo cobra cada miembro'}</h3>
      <p className="soft">{QUE_ES_INTERCAMBIAR}</p>
      <CobroLista modo={modo} />
    </div>
  )
}

export function CobroLista({ modo }) {
  return (
    <ul className="cobro-lista">
      {Object.entries(COBRO).map(([k, x]) => (
        <li key={k} className={k === modo ? 'on' : ''}>
          <CobroIconos modo={k} s={18} />
          <div><b>{x.t}</b><span>{x.d}</span></div>
        </li>
      ))}
    </ul>
  )
}
