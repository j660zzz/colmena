import { useMemo, useRef, useState } from 'react'
import { useColmena } from '../lib/store'
import { CATS } from '../data/contenido'
import { Icon, Hex, Ejemplo, Header, Empty, useToast } from '../components/ui'

export default function Miembros({ nav, pedirPerfil, headerRight }) {
  const c = useColmena()
  const toast = useToast()
  const [q, setQ] = useState('')
  const buscador = useRef(null)
  const [cats, setCats] = useState([])

  // Reales primero (más nuevos arriba), ejemplos al final
  const ordenados = useMemo(() => [...c.perfiles].sort((a, b) =>
    (a.es_ejemplo - b.es_ejemplo) || (new Date(b.created_at) - new Date(a.created_at))), [c.perfiles])

  const lista = ordenados.filter((m) => {
    if (c.yo && m.id === c.yo.id) return false
    if (cats.length && !m.categorias.some((x) => cats.includes(x))) return false
    const t = q.trim().toLowerCase()
    if (!t) return true
    return [m.nombre, m.marca, m.rol, ...m.habilidades].join(' ').toLowerCase().includes(t)
  })

  const conectar = (m) => pedirPerfil('Para conectar con alguien necesitas tu carnet.', async () => {
    try {
      const on = await c.alternarConexion(m.id)
      if (on) toast(`Conectaste con ${m.nombre.split(' ')[0]}`)
    } catch (e) { toast(e.message, true) }
  })

  const toggle = (x) => setCats((l) => l.includes(x) ? l.filter((y) => y !== x) : [...l, x])

  return (
    <>
      <Header title="Miembros" sub="Encuentra a alguien por lo que sabe hacer" right={headerRight} />
      <div className="body">
        <div className="search">
          <Icon n="search" s={19} />
          <input ref={buscador} type="search" placeholder="Buscar por nombre o habilidad" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar miembros" />
          {q && <button type="button" className="iconbtn" aria-label="Limpiar búsqueda" onClick={() => { setQ(''); buscador.current?.focus() }}><Icon n="x" s={18} /></button>}
        </div>
        <div className="gap-12" />
        <div className="chips" role="group" aria-label="Filtrar por categoría">
          {CATS.map((x) => <button key={x} type="button" className="chip" aria-pressed={cats.includes(x)} onClick={() => toggle(x)}>{x}</button>)}
        </div>
        <div className="sec-h"><h3>Resultados</h3><span className="meta">{lista.length}</span></div>

        {lista.length === 0 ? (
          <Empty title="Sin resultados">
            {q ? `Nadie coincide con “${q}”. Prueba con una habilidad, como “foto” o “identidad”.` : 'Todavía no hay miembros en esta categoría.'}
          </Empty>
        ) : (
          <div className="rowlist">
            {lista.map((m, i) => {
              const on = c.yo && c.conexiones.some((x) => x.de_id === c.yo.id && x.a_id === m.id)
              return (
                <div key={m.id}>
                  {i > 0 && <div className="divider" />}
                  <div className="mrow">
                    <button type="button" onClick={() => nav({ t: 'carnet', id: m.id })} aria-label={`Ver carnet de ${m.nombre}`}><Hex p={m} w={40} /></button>
                    <button type="button" className="info" onClick={() => nav({ t: 'carnet', id: m.id })}>
                      <b>{m.nombre}<Ejemplo p={m} /></b>
                      <span>{[m.rol, m.marca].filter(Boolean).join(' · ')}</span>
                      {m.habilidades.length > 0 && <span className="sk">{m.habilidades.slice(0, 3).map((s) => <i key={s}>{s}</i>)}</span>}
                    </button>
                    <button type="button" className={'btn sm ' + (on ? 'done' : 'ghost')} onClick={() => conectar(m)}>
                      {on ? <><Icon n="check" s={15} w={2.1} />Conectado</> : 'Conectar'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
