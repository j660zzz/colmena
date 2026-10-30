import { useColmena } from '../lib/store'
import { BADGES } from '../data/contenido'
import { carnetId, firstName, igUrl, mesDesde } from '../lib/format'
import { Icon, Hex, Comb, Header, SubHeader, Empty, useToast, CeldaAbierta } from '../components/ui'

export function statsDe(c, id) {
  const p = c.perfil(id)
  const conectados = new Set()
  c.conexiones.forEach((x) => { if (x.de_id === id) conectados.add(x.a_id); if (x.a_id === id) conectados.add(x.de_id) })
  return {
    conexiones: conectados.size,
    publicaciones: c.publicaciones.filter((x) => x.autor_id === id).length,
    encuentros: c.asistencias.filter((x) => x.perfil_id === id).length,
    ayudo: c.ayudas.filter((x) => x.perfil_id === id).length,
    completo: !!(p && p.marca && p.rol && p.habilidades.length && p.instagram)
  }
}

export default function Carnet({ id, onBack, nav, pedirPerfil, editar, headerRight }) {
  const c = useColmena()
  const toast = useToast()
  const propio = !id || (c.yo && id === c.yo.id)
  const m = propio ? c.yo : c.perfil(id)

  if (propio && !c.yo) {
    return (
      <>
        <Header title="Mi carnet" right={headerRight} />
        <div className="body">
          <Empty icon="card" title="Aún no tienes carnet"
            action={<button type="button" className="btn primary" onClick={() => pedirPerfil(null, () => {})}>Crear mi carnet</button>}>
            Tu carnet es tu identidad en la colmena: quién eres, qué haces y lo que has aportado.
          </Empty>
        </div>
      </>
    )
  }
  if (!m) return <><SubHeader title="Carnet" onBack={onBack} /><div className="body"><Empty title="Este miembro ya no está" /></div></>

  const s = statsDe(c, m.id)
  const ganadas = BADGES.filter((b) => b.ok(s))
  const conectado = c.yo && c.conexiones.some((x) => x.de_id === c.yo.id && x.a_id === m.id)

  const compartir = async () => {
    const url = `${location.origin}/?carnet=${m.id}`
    const data = { title: `${m.nombre} en Colmena`, text: `Mi carnet en Colmena · ${carnetId(m.carnet)}`, url }
    try {
      if (navigator.share) await navigator.share(data)
      else { await navigator.clipboard.writeText(url); toast('Enlace copiado') }
    } catch { /* cancelado */ }
  }

  const conectar = () => pedirPerfil('Para conectar necesitas tu carnet.', async () => {
    try { const on = await c.alternarConexion(m.id); if (on) toast(`Conectaste con ${firstName(m.nombre)}`) } catch (e) { toast(e.message, true) }
  })

  const borrar = async () => {
    if (!confirm('Esto borra tu perfil, tus publicaciones y tu actividad de forma permanente. ¿Seguro?')) return
    try { await c.borrarPerfil(); toast('Tu perfil fue borrado') } catch (e) { toast(e.message, true) }
  }

  return (
    <>
      {propio
        ? <Header title="Mi carnet" sub={`Miembro desde ${mesDesde(m.created_at)}`} right={headerRight} />
        : <SubHeader title="Carnet de miembro" onBack={onBack} />}
      <div className="body fade">
        {/* Carnet de miembro v2.0: fondo Polen, textos en Tinta */}
        <div className="carnet">
          <Comb className="combmark" viewBox="0 0 210 250" r={26} w={230} h={270} x0={-16} y0={-20} stroke="rgba(15,15,13,.10)" />
          <div className="carnet-head">
            <div className="carnet-lockup">
              <CeldaAbierta s={18} color="var(--ink)" />
              <span className="carnet-brand">Colmena</span>
            </div>
            <span className="carnet-badge">MIEMBRO</span>
          </div>
          <div className="carnet-body">
            <Hex p={m} w={56} h={64} fs={20} />
            <div className="carnet-info">
              <h3>{m.nombre}</h3>
              <p className="role">{[m.marca, m.rol].filter(Boolean).join(' · ') || 'Miembro'}</p>
            </div>
          </div>
          <div className="carnet-foot">
            <div className="carnet-col">
              <span className="carnet-lbl">N.º DE CARNET</span>
              <span className="carnet-val mono">{carnetId(m.carnet)}</span>
            </div>
            <div className="carnet-col">
              <span className="carnet-lbl">NODO</span>
              <span className="carnet-val">DCV · JAVERIANA</span>
            </div>
            <div className="carnet-col right">
              <span className="carnet-lbl">ESTADO</span>
              <span className="carnet-status">
                <i className="status-hex" />
                {m.es_ejemplo ? 'Ejemplo' : 'Activa · DCV'}
              </span>
            </div>
          </div>
        </div>

        <div className="stats">
          <div><b>{s.conexiones}</b><span>Conexiones</span></div>
          <div><b>{s.publicaciones}</b><span>Publicaciones</span></div>
          <div><b>{s.ayudo}</b><span>Manos dadas</span></div>
        </div>

        {m.habilidades.length > 0 && (
          <>
            <div className="sec-h"><h3>Lo que comparte</h3></div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>{m.habilidades.map((x) => <span key={x} className="tag">{x}</span>)}</div>
          </>
        )}

        <div className="sec-h"><h3>Insignias</h3><span className="meta">{ganadas.length} de {BADGES.length}</span></div>
        <div className="prog" aria-hidden="true"><i style={{ width: Math.round(ganadas.length / BADGES.length * 100) + '%' }} /></div>
        <div className="gap-16" />
        <div className="badges">
          {BADGES.map((b) => {
            const on = b.ok(s)
            return (
              <div key={b.n} className={'badge ' + (on ? 'on' : 'off')}>
                <div className="h"><Icon n={b.k} s={22} w={on ? 2 : 1.6} /></div>
                <small>{b.n}</small>
              </div>
            )
          })}
        </div>

        <div className="gap-24" />
        {propio ? (
          <>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn ghost" style={{ flex: 1 }} onClick={editar}><Icon n="edit" s={17} />Editar</button>
              <button type="button" className="btn ghost" style={{ flex: 1 }} onClick={compartir}><Icon n="share" s={17} />Compartir</button>
            </div>
            {!s.completo && <p className="nota">Completa tu marca, rol, habilidades e Instagram para ganar la insignia de perfil completo y que te encuentren más fácil.</p>}
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <button type="button" className="linkbtn danger" onClick={borrar}>Borrar mi perfil y mis datos</button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button type="button" className={'btn full ' + (conectado ? 'done' : 'primary')} onClick={conectar}>
              {conectado ? <><Icon n="check" s={18} w={2.1} />Conectados</> : `Conectar con ${firstName(m.nombre)}`}
            </button>
            {m.instagram && !m.es_ejemplo && (
              <a className="btn ghost full" href={igUrl(m.instagram)} target="_blank" rel="noopener noreferrer"><Icon n="ig" s={18} />Escribirle · @{m.instagram}</a>
            )}
            {m.es_ejemplo && <p className="nota">Este es un perfil de ejemplo para mostrar cómo funciona la colmena. No corresponde a una persona real.</p>}
          </div>
        )}
      </div>
    </>
  )
}
