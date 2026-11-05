import { useState } from 'react'
import { useColmena } from '../lib/store'
import { CATS } from '../data/contenido'
import { Icon, Celda, Sheet, Ejemplo, useToast } from './ui'

// Proyectos del carnet: hasta 4 por miembro. La portada se genera con la marca (sin fotos subidas):
// color plano, la celda del logo con el ícono del tipo de trabajo y el tipo y el año arriba.
export const MAX_PROYECTOS = 4
const ICONO = {
  Marca: 'seal', 'Diseño': 'edit', 'Redes sociales': 'share', 'Web/UX': 'link', Foto: 'ig', Video: 'spark',
  'Ilustración': 'star', 'Producción': 'tools', Moda: 'bag', Comida: 'note', Otro: 'bulb'
}
// Polen solo en la primera tarjeta: es el proyecto principal del carnet
const VARIANTES = ['polen', 'tinta', 'blanco', 'tinta']

export const proyectosDe = (c, id) => c.proyectos.filter((x) => x.perfil_id === id).sort((a, b) => a.orden - b.orden)
const meta = (x) => [x.cliente, x.anio].filter(Boolean).join(' · ')

export function Portada({ p, i = 0, grande = false, mini = false }) {
  const v = VARIANTES[i % VARIANTES.length]
  return (
    <span className={'portada ' + v + (grande ? ' grande' : '') + (mini ? ' mini' : '')} aria-hidden="true">
      {!mini && <span className="portada-k">{[p.tipo, p.anio].filter(Boolean).join(' · ')}</span>}
      <Celda s={grande ? 132 : mini ? 40 : 92} className="portada-celda"><Icon n={ICONO[p.tipo] || 'bulb'} s={grande ? 40 : mini ? 16 : 28} w={1.8} /></Celda>
    </span>
  )
}

export function ProyectosSeccion({ m, propio, nav }) {
  const c = useColmena()
  const [abierto, setAbierto] = useState(null)
  const lista = proyectosDe(c, m.id)
  if (!lista.length && !propio) return null
  return (
    <section className="perfil-sec proyectos-sec">
      <div className="proy-h">
        <h3>Proyectos</h3>
        {lista.length > 0 && lista.every((x) => x.es_ejemplo) && <Ejemplo p={{ es_ejemplo: true }} />}
      </div>
      {lista.length === 0 ? (
        <button type="button" className="proy-vacio" onClick={() => nav({ t: 'editar' })}>
          <Celda s={44} className="proy-vacio-celda"><Icon n="plus" s={18} w={2.2} /></Celda>
          <span><b>Muestra tus trabajos</b><small>Agrega hasta {MAX_PROYECTOS} proyectos a tu carnet.</small></span>
          <Icon n="right" s={18} w={2} />
        </button>
      ) : (
        <div className="proy-grid">
          {lista.map((x, i) => (
            <button key={x.id} type="button" className="proy-card" onClick={() => setAbierto({ x, i })}>
              <Portada p={x} i={i} />
              <span className="proy-t">
                <b>{x.titulo}</b>
                {meta(x) && <small>{meta(x)}</small>}
              </span>
            </button>
          ))}
        </div>
      )}
      {m.es_ejemplo && lista.length > 0 && <p className="fine">Proyectos de ejemplo con clientes ficticios.</p>}
      <Sheet open={!!abierto} onClose={() => setAbierto(null)} label="Detalle del proyecto">
        {abierto && (
          <div className="proy-det">
            <Portada p={abierto.x} i={abierto.i} grande />
            <h2>{abierto.x.titulo}<Ejemplo p={abierto.x} /></h2>
            {meta(abierto.x) && <p className="soft">{meta(abierto.x)}</p>}
            {abierto.x.descripcion && <p>{abierto.x.descripcion}</p>}
            {abierto.x.link && (
              <a className="btn ink full" href={abierto.x.link} target="_blank" rel="noopener noreferrer">Ver el proyecto <Icon n="ext" s={16} /></a>
            )}
          </div>
        )}
      </Sheet>
    </section>
  )
}

// Editor dentro de "Editar carnet". Cada proyecto se guarda por separado al tocar "Guardar proyecto".
export function ProyectosEditor() {
  const c = useColmena()
  const toast = useToast()
  const [editando, setEditando] = useState(null)
  const lista = c.yo ? proyectosDe(c, c.yo.id) : []
  const borrar = async (x) => {
    if (!confirm(`¿Borrar "${x.titulo}"?`)) return
    try { await c.borrarProyecto(x.id); toast('Proyecto borrado') } catch (e) { toast(e.message, true) }
  }
  return (
    <section className="proy-editor" aria-label="Proyectos">
      <div className="proy-h"><h3>Proyectos</h3><span className="meta">{lista.length} de {MAX_PROYECTOS}</span></div>
      <p className="soft">Muestra trabajos que hayas hecho. Cada uno lleva una portada con la marca de Colmena.</p>
      {lista.map((x, i) => (
        <div key={x.id} className="proy-fila">
          <Portada p={x} i={i} mini />
          <span className="proy-t"><b>{x.titulo}</b><small>{meta(x) || x.tipo}</small></span>
          <button type="button" className="iconbtn" onClick={() => setEditando(x)} aria-label={`Editar ${x.titulo}`}><Icon n="edit" s={18} /></button>
          <button type="button" className="iconbtn" onClick={() => borrar(x)} aria-label={`Borrar ${x.titulo}`}><Icon n="trash" s={18} /></button>
        </div>
      ))}
      {lista.length < MAX_PROYECTOS && (
        <button type="button" className="btn ghost full" onClick={() => setEditando({})}><Icon n="plus" s={16} w={2.2} />Agregar proyecto</button>
      )}
      <Sheet open={!!editando} onClose={() => setEditando(null)} label={editando?.id ? 'Editar proyecto' : 'Agregar proyecto'}>
        {editando && <ProyectoForm inicial={editando} onListo={() => setEditando(null)} />}
      </Sheet>
    </section>
  )
}

function ProyectoForm({ inicial, onListo }) {
  const c = useColmena()
  const toast = useToast()
  const [f, setF] = useState({
    titulo: inicial.titulo || '', tipo: inicial.tipo || c.yo?.categorias?.[0] || 'Marca', cliente: inicial.cliente || '',
    anio: inicial.anio ? String(inicial.anio) : String(new Date().getFullYear()), descripcion: inicial.descripcion || '', link: inicial.link || ''
  })
  const [enviando, setEnviando] = useState(false)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const anioOk = !f.anio || (/^\d{4}$/.test(f.anio) && +f.anio >= 2015 && +f.anio <= new Date().getFullYear() + 1)
  const linkOk = !f.link.trim() || /^(https?:\/\/)?\S+\.\S+$/.test(f.link.trim())
  const ok = f.titulo.trim().length >= 3 && f.cliente.trim().length !== 1 && anioOk && linkOk
  const guardar = async (e) => {
    e.preventDefault(); if (!ok || enviando) return
    setErr(''); setEnviando(true)
    try { await c.guardarProyecto({ ...f, id: inicial.id }); toast(inicial.id ? 'Proyecto actualizado' : 'Proyecto agregado'); onListo() }
    catch (x) { setErr(x.message) } finally { setEnviando(false) }
  }
  return (
    <form className="form proy-form" onSubmit={guardar}>
      <h3>{inicial.id ? 'Editar proyecto' : 'Agregar proyecto'}</h3>
      <Portada p={{ tipo: f.tipo, anio: anioOk ? f.anio : '' }} i={0} grande />
      <div className="field"><label htmlFor="pr-t">Nombre del proyecto *</label>
        <div className="inp"><input id="pr-t" maxLength={60} value={f.titulo} onChange={set('titulo')} placeholder="Ej: Identidad para una panadería" /></div></div>
      <span className="lbl">Tipo de trabajo</span>
      <div className="chips wrap">
        {CATS.map((x) => <button key={x} type="button" className="chip" aria-pressed={f.tipo === x} onClick={() => setF({ ...f, tipo: x })}>{x}</button>)}
      </div>
      <div className="proy-form-2">
        <div className="field"><label htmlFor="pr-c">Cliente o marca</label>
          <div className="inp"><input id="pr-c" maxLength={60} value={f.cliente} onChange={set('cliente')} placeholder="Opcional" /></div></div>
        <div className="field"><label htmlFor="pr-a">Año</label>
          <div className="inp"><input id="pr-a" inputMode="numeric" maxLength={4} value={f.anio} onChange={set('anio')} /></div></div>
      </div>
      <div className="field"><label htmlFor="pr-d">En una línea, qué hiciste</label>
        <div className="ta"><textarea id="pr-d" maxLength={140} value={f.descripcion} onChange={set('descripcion')} placeholder="Ej: Logo, paleta y bolsas de papel." /></div></div>
      <div className="field"><label htmlFor="pr-l">Link para verlo</label>
        <div className="inp"><input id="pr-l" type="url" inputMode="url" autoCapitalize="none" maxLength={200} value={f.link} onChange={set('link')} placeholder="Behance, Drive o Instagram (opcional)" /></div></div>
      {!anioOk && <p className="err">Escribe un año de 4 cifras.</p>}
      {!linkOk && <p className="err">Revisa el link. Ej: https://www.behance.net/tu-usuario</p>}
      {err && <p className="err" role="alert">{err}</p>}
      <button type="submit" className="btn primary full big" disabled={!ok || enviando}>{enviando ? 'Guardando…' : 'Guardar proyecto'}</button>
    </form>
  )
}
