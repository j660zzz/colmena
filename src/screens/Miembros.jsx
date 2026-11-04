import { useMemo, useRef, useState } from 'react'
import { useColmena } from '../lib/store'
import { CATS } from '../data/contenido'
import { firstName } from '../lib/format'
import { activa, activoSemana, manosDadas, quienesPueden, normal, nivelDe, puntosDe } from '../lib/logic'
import { Icon, Hex, Ejemplo, Header, Titulo, Empty, Mark } from '../components/ui'
import { statsDe } from './Carnet'
import { CobroInsignia } from '../components/Cobro'

const MODOS = [['todos', 'Todos'], ['disponibles', 'Disponibles'], ['intercambio', 'Intercambian']]

export default function Miembros({ nav, headerRight }) {
  const c = useColmena()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState(null)
  const [modo, setModo] = useState('todos')
  const buscador = useRef(null)

  const ordenados = useMemo(() => [...c.perfiles].sort((a, b) =>
    (a.es_ejemplo - b.es_ejemplo) || ((nivelDe(c, b.id).n >= 5) - (nivelDe(c, a.id).n >= 5)) || (puntosDe(c, b.id).total - puntosDe(c, a.id).total) || (new Date(b.created_at) - new Date(a.created_at))), [c.perfiles, c.ayudas, c.participantes, c.asistencias, c.resenas]) // eslint-disable-line react-hooks/exhaustive-deps

  const otros = ordenados.filter((m) => !(c.yo && m.id === c.yo.id))
  const t = normal(q.trim())
  const lista = otros.filter((m) => {
    if (cat && !m.categorias.includes(cat)) return false
    if (modo === 'disponibles' && !m.disponible) return false
    if (modo === 'intercambio' && !['trueque', 'ambos'].includes(m.intercambio)) return false
    return !t || normal([m.nombre, m.marca, m.rol, m.bio, ...m.habilidades, ...m.categorias].join(' ')).includes(t)
  })
  const cats = CATS.map((x) => [x, otros.filter((m) => m.categorias.includes(x)).length]).filter(([, n]) => n > 0)
  const disponibles = otros.filter((m) => m.disponible).slice(0, 8)
  const filtrando = !!(cat || t || modo !== 'todos')

  const miNecesito = c.yo && c.publicaciones.find((p) => p.autor_id === c.yo.id && p.tipo === 'need' && activa(p))
  const sugeridos = miNecesito ? quienesPueden(c, miNecesito.categorias, c.yo.id).slice(0, 6) : []

  // Si todos tienen el mismo nivel, la etiqueta no ayuda a distinguir a nadie
  const mismoNivel = new Set(lista.map((m) => nivelDe(c, m.id).n).filter((n) => n > 1)).size <= 1
  const limpiar = () => { setQ(''); setCat(null); setModo('todos') }

  return (
    <>
      <Header right={headerRight} />
      <div className="body fade">
        <Titulo title="Miembros" sub="Encuentra a quien sabe lo que necesitas." />
        <div className="search">
          <Icon n="search" s={19} />
          <input ref={buscador} type="search" placeholder="Logo, fotos, reels, costos…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar miembros por nombre o habilidad" />
          {q && <button type="button" className="iconbtn" aria-label="Limpiar búsqueda" onClick={() => { setQ(''); buscador.current?.focus() }}><Icon n="x" s={18} /></button>}
        </div>

        <section className="m-necesitas" aria-label="Filtrar por lo que necesitas">
          <span className="k">¿Qué necesitas?</span>
          <div className="m-cats">
            {cats.map(([x]) => (
              <button key={x} type="button" aria-pressed={cat === x} onClick={() => setCat(cat === x ? null : x)}>
                {x}
              </button>
            ))}
          </div>
          <div className="m-modos" role="group" aria-label="Mostrar">
            {MODOS.map(([k, txt]) => <button key={k} type="button" aria-pressed={modo === k} onClick={() => setModo(k)}>{txt}</button>)}
          </div>
        </section>

        {sugeridos.length > 0 && !filtrando && (
          <>
            <div className="sec-h"><h3>Te pueden ayudar con lo que publicaste</h3></div>
            <p className="soft">Saben de <Mark>{miNecesito.categorias.join(', ')}</Mark></p>
            <div className="hscroll">
              {sugeridos.map((m) => (
                <button key={m.id} type="button" className="mcard" onClick={() => nav({ t: 'carnet', id: m.id })}>
                  <Hex p={m} w={44} h={48} fs={16} />
                  <b>{firstName(m.nombre)}</b>
                  <span className="tag dark">{m.habilidades[0] || m.categorias[0]}</span>
                  {m.es_ejemplo ? <small>Ejemplo</small> : manosDadas(c, m.id) > 0 && <small>{manosDadas(c, m.id)} {manosDadas(c, m.id) === 1 ? 'ayuda dada' : 'ayudas dadas'}</small>}
                </button>
              ))}
            </div>
          </>
        )}

        {!filtrando && disponibles.length > 0 && (
          <section className="m-disp" aria-label="Disponibles para proyectos">
            <div className="sec-h"><h3>Disponibles ahora</h3></div>
            <div className="m-disp-pista">
              {disponibles.map((m, i) => (
                <button key={m.id} type="button" className={'m-dcard' + (i % 2 ? ' claro' : '')} onClick={() => nav({ t: 'carnet', id: m.id })}>
                  <span className="m-dtop"><Hex p={m} w={48} h={52} fs={17} /><span className="m-dok"><i />Con cupo</span></span>
                  <b>{m.nombre}<Ejemplo p={m} /></b>
                  <span className="m-drol">{m.rol || m.marca}</span>
                  <span className="m-dskills">{(m.habilidades.length ? m.habilidades : m.categorias).slice(0, 2).map((x) => <em key={x}>{x}</em>)}</span>
                  <span className="go">Ver carnet <Icon n="right" s={14} w={2.2} /></span>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="sec-h">
          <h3>{filtrando ? `${lista.length} ${lista.length === 1 ? 'resultado' : 'resultados'}` : 'Todos los miembros'}</h3>
          {filtrando ? <button type="button" className="ver" onClick={limpiar}>Limpiar</button> : null}
        </div>

        {lista.length === 0 ? (
          <Empty title="Sin resultados" action={<button type="button" className="btn ghost sm" onClick={limpiar}>Ver todos</button>}>
            {q ? `Nadie coincide con “${q}”. Prueba con una habilidad, como “foto” o “identidad”.` : 'Nadie coincide con esos filtros todavía.'}
          </Empty>
        ) : (
          <div className="cards">
            {lista.map((m) => {
              const st = statsDe(c, m.id)
              const nv = nivelDe(c, m.id)
              const activo = !m.es_ejemplo && activoSemana(c, m.id)
              const sabe = (m.habilidades.length ? m.habilidades : m.categorias).slice(0, 3)
              return (
                <button key={m.id} type="button" className="member2" onClick={() => nav({ t: 'carnet', id: m.id })}>
                  <span className="m2-top">
                    <span className="mhex"><Hex p={m} w={48} h={52} fs={17} />{activo && <i className="live" title="Activo esta semana" />}</span>
                    <span className="m2-who">
                      <b>{m.nombre}<Ejemplo p={m} /></b>
                      <span>{[m.rol, m.marca].filter(Boolean).join(' · ') || 'Miembro de Colmena'}</span>
                    </span>
                    <Icon n="right" s={18} />
                  </span>
                  {sabe.length > 0 && <span className="m2-skills">{sabe.map((x) => <em key={x}>{x}</em>)}</span>}
                  <span className="m2-meta">
                    <span className={'m2-disp' + (m.disponible ? ' on' : '')}><i />{m.disponible ? 'Disponible' : 'Sin cupo'}</span>
                    {m.intercambio && <CobroInsignia modo={m.intercambio} />}
                    {st.manos > 0 && <span><Icon n="hand" s={13} />{st.manos}</span>}
                    {st.promedio > 0 && <span><Icon n="star" s={13} w={2} />{st.promedio.toFixed(1)}</span>}
                    {nv.n > 1 && !mismoNivel && <span className="m-nv">Nivel {nv.n}</span>}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
