import { useMemo, useRef, useState } from 'react'
import { useColmena } from '../lib/store'
import { CATS } from '../data/contenido'
import { firstName } from '../lib/format'
import { activa, activoSemana, manosDadas, quienesPueden } from '../lib/logic'
import { Icon, Hex, Ejemplo, Header, Empty, Mark } from '../components/ui'

export default function Miembros({ nav, headerRight }) {
  const c = useColmena()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState(null)
  const buscador = useRef(null)

  const ordenados = useMemo(() => [...c.perfiles].sort((a, b) =>
    (a.es_ejemplo - b.es_ejemplo) || (manosDadas(c, b.id) - manosDadas(c, a.id)) || (new Date(b.created_at) - new Date(a.created_at))), [c.perfiles, c.ayudas]) // eslint-disable-line react-hooks/exhaustive-deps

  const lista = ordenados.filter((m) => {
    if (c.yo && m.id === c.yo.id) return false
    if (cat && !m.categorias.includes(cat)) return false
    const t = q.trim().toLowerCase()
    return !t || [m.nombre, m.marca, m.rol, ...m.habilidades, ...m.categorias].join(' ').toLowerCase().includes(t)
  })
  const activos = c.perfiles.filter((m) => !m.es_ejemplo && activoSemana(c, m.id)).length

  const miNecesito = c.yo && c.publicaciones.find((p) => p.autor_id === c.yo.id && p.tipo === 'need' && activa(p))
  const sugeridos = miNecesito ? quienesPueden(c, miNecesito.categorias, c.yo.id).slice(0, 6) : []

  return (
    <>
      <Header title="Miembros" sub="Encuentra a alguien por lo que sabe hacer" right={headerRight} />
      <div className="body fade">
        <div className="search">
          <Icon n="search" s={19} />
          <input ref={buscador} type="search" placeholder="Buscar por nombre o habilidad" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar miembros" />
          {q && <button type="button" className="iconbtn" aria-label="Limpiar búsqueda" onClick={() => { setQ(''); buscador.current?.focus() }}><Icon n="x" s={18} /></button>}
        </div>

        {sugeridos.length > 0 && (
          <>
            <div className="sec-h"><h3>Te pueden ayudar con lo que publicaste</h3></div>
            <p className="soft">Saben de <Mark>{miNecesito.categorias.join(', ')}</Mark></p>
            <div className="hscroll">
              {sugeridos.map((m) => (
                <button key={m.id} type="button" className="mcard" onClick={() => nav({ t: 'carnet', id: m.id })}>
                  <Hex p={m} w={44} h={48} fs={16} />
                  <b>{firstName(m.nombre)}</b>
                  <span className="tag dark">{m.habilidades[0] || m.categorias[0]}</span>
                  {m.es_ejemplo ? <small>Ejemplo</small> : <small>{manosDadas(c, m.id)} manos dadas</small>}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="chips" role="group" aria-label="Filtrar por categoría">
          <button type="button" className="chip" aria-pressed={!cat} onClick={() => setCat(null)}>Todos</button>
          {CATS.map((x) => <button key={x} type="button" className="chip" aria-pressed={cat === x} onClick={() => setCat(cat === x ? null : x)}>{x}</button>)}
        </div>
        <p className="eyebrow">{lista.length} {lista.length === 1 ? 'miembro' : 'miembros'}{activos > 0 ? ` · ${activos} ${activos === 1 ? 'activo' : 'activos'} esta semana` : ''}</p>

        {lista.length === 0 ? (
          <Empty title="Sin resultados">
            {q ? `Nadie coincide con “${q}”. Prueba con una habilidad, como “foto” o “identidad”.` : 'Todavía no hay miembros en esta categoría.'}
          </Empty>
        ) : (
          <div className="cards">
            {lista.map((m) => {
              const n = manosDadas(c, m.id)
              const activo = !m.es_ejemplo && activoSemana(c, m.id)
              return (
                <button key={m.id} type="button" className="member" onClick={() => nav({ t: 'carnet', id: m.id })}>
                  <span className="mhex"><Hex p={m} w={52} h={58} fs={18} />{activo && <i className="live" title="Activo esta semana" />}</span>
                  <span className="minfo">
                    <b>{m.nombre}<Ejemplo p={m} /></b>
                    <span>{[m.rol, m.marca].filter(Boolean).join(' · ') || 'Miembro de la colmena'}</span>
                    {(m.habilidades.length > 0 || m.categorias.length > 0) && (
                      <span className="post-tags">{(m.habilidades.length ? m.habilidades : m.categorias).slice(0, 2).map((s) => <span key={s} className="tag">{s}</span>)}</span>
                    )}
                    <small><Icon n="hand" s={14} />{n} {n === 1 ? 'mano dada' : 'manos dadas'}</small>
                  </span>
                  <span className="vc">Ver carnet</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
