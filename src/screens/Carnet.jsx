import { useState } from 'react'
import { useColmena } from '../lib/store'
import { BADGES } from '../data/contenido'
import { carnetId, firstName, igUrl, mesDesde } from '../lib/format'
import { Icon, Hex, Header, SubHeader, Empty, Ejemplo, useToast, CeldaAbierta } from '../components/ui'

const TABS_PERFIL = [
  { id: 'port', label: 'Portafolio' },
  { id: 'hab', label: 'Habilidades' },
  { id: 'ins', label: 'Insignias' }
]

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
  const [tab, setTab] = useState('port')
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

  const conectadosIds = new Set()
  c.conexiones.forEach((x) => { if (x.de_id === m.id) conectadosIds.add(x.a_id); if (x.a_id === m.id) conectadosIds.add(x.de_id) })
  const conectados = [...conectadosIds].map((x) => c.perfil(x)).filter(Boolean)

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
      <div className="body fade profile-body">
        <section className="profile-hero" aria-label="Perfil de miembro">
          <div className="profile-hero-top">
            <div className="profile-brand"><CeldaAbierta s={19} color="var(--surface)" /><span>COLMENA</span></div>
            <span className="profile-member">{m.es_ejemplo ? 'PERFIL DE EJEMPLO' : 'MIEMBRO'}</span>
          </div>
          <div className="profile-identity">
            <div className="profile-avatar"><Hex p={m} w={72} h={82} fs={26} /></div>
            <div className="profile-info">
              <h2>{m.nombre}</h2>
              <p>{[m.marca, m.rol].filter(Boolean).join(' · ') || 'Estudiante y creador'}</p>
            </div>
          </div>
          {m.categorias.length > 0 && (
            <div className="profile-cats" aria-label="Categorías">
              {m.categorias.map((x) => <span key={x} className="profile-cat">{x}</span>)}
            </div>
          )}
          <div className="profile-credentials">
            <span className="profile-number"><span>N.º DE MIEMBRO</span><b>{carnetId(m.carnet)}</b></span>
            <span className="profile-status"><i className="status-hex" />{m.es_ejemplo ? 'Ejemplo' : 'DCV · Javeriana Cali'}</span>
          </div>
          {m.instagram && !m.es_ejemplo && (
            <a className="profile-instagram" href={igUrl(m.instagram)} target="_blank" rel="noopener noreferrer">
              <Icon n="ig" s={16} />@{m.instagram}
            </a>
          )}
        </section>

        <div className="profile-stats">
          <div><Icon n="link" s={16} /><b>{s.conexiones}</b><span>Conexiones</span></div>
          <div><Icon n="wall" s={16} /><b>{s.publicaciones}</b><span>Publicaciones</span></div>
          <div><Icon n="hand" s={16} /><b>{s.ayudo}</b><span>Manos dadas</span></div>
        </div>

        {conectados.length > 0 && (
          <div className="profile-connections">
            <div className="stack">{conectados.slice(0, 5).map((p) => <Hex key={p.id} p={p} w={30} fs={11} />)}</div>
            <p>
              <b>{conectados.length} {conectados.length === 1 ? 'conexión' : 'conexiones'}</b>
              <span className="profile-connections-names">
                {conectados.slice(0, 2).map((p, i) => <span key={p.id}>{i > 0 && ', '}{firstName(p.nombre)}<Ejemplo p={p} /></span>)}
                {conectados.length > 2 && ` y ${conectados.length - 2} más`}
              </span>
            </p>
          </div>
        )}

        {propio ? (
          <div className="profile-actions">
            <button type="button" className="btn primary full" onClick={editar}><Icon n="edit" s={17} />Editar perfil</button>
            <button type="button" className="btn ghost full" onClick={compartir}><Icon n="share" s={17} />Compartir perfil</button>
            {!s.completo && <p className="nota">Agrega marca, rol, habilidades e Instagram: ganas la insignia de perfil completo y te encuentran más fácil.</p>}
            <button type="button" className="linkbtn danger profile-delete" onClick={borrar}>Borrar mi perfil y mis datos</button>
          </div>
        ) : (
          <div className="profile-actions">
            <button type="button" className={'btn full ' + (conectado ? 'done' : 'primary')} onClick={conectar}>
              {conectado ? <><Icon n="check" s={18} w={2.1} />Conectados</> : `Conectar con ${firstName(m.nombre)}`}
            </button>
            {m.instagram && !m.es_ejemplo && (
              <a className="btn ghost full" href={igUrl(m.instagram)} target="_blank" rel="noopener noreferrer"><Icon n="ig" s={18} />Escribirle · @{m.instagram}</a>
            )}
            {m.es_ejemplo && <p className="nota">Este es un perfil de ejemplo para mostrar cómo funciona la colmena. No corresponde a una persona real.</p>}
          </div>
        )}

        <div className="profile-tabs segbar" role="group" aria-label="Secciones del perfil">
          {TABS_PERFIL.map((t) => (
            <button key={t.id} type="button" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        <div className="profile-tabpanel" key={tab}>
          {tab === 'port' && (
            <section className="profile-section">
              <div className="portfolio-empty">
                <div className="portfolio-grid-preview" aria-hidden="true">
                  <div className="portfolio-tile"><Icon n="image" s={18} /></div>
                  <div className="portfolio-tile"><Icon n="note" s={18} /></div>
                  <div className="portfolio-tile"><Icon n="folder" s={18} /></div>
                  <div className="portfolio-tile" />
                  <div className="portfolio-tile" />
                  <div className="portfolio-tile" />
                </div>
                <div className="portfolio-copy">
                  <span className="profile-upcoming">En preparación</span>
                  <h4>Tu trabajo merece un lugar propio.</h4>
                  <p>Pronto podrás reunir aquí tus piezas, tu portafolio en PDF y tus proyectos en carpetas.</p>
                </div>
                <div className="portfolio-formats" aria-label="Formatos planeados">
                  <span><Icon n="image" s={15} />Piezas</span>
                  <span><Icon n="note" s={15} />PDF</span>
                  <span><Icon n="folder" s={15} />Carpetas</span>
                </div>
              </div>
            </section>
          )}

          {tab === 'hab' && (
            <section className="profile-section">
              {m.habilidades.length > 0 ? (
                <div className="profile-skills">{m.habilidades.map((x) => <span key={x} className="tag">{x}</span>)}</div>
              ) : (
                <Empty icon="star" title="Sin habilidades aún">
                  {propio ? 'Agrega lo que sabes hacer desde Editar perfil, para que te encuentren más fácil.' : 'Este miembro todavía no agregó habilidades.'}
                </Empty>
              )}
            </section>
          )}

          {tab === 'ins' && (
            <section className="profile-section profile-badges">
              <div className="profile-section-head">
                <span className="eyebrow">{ganadas.length} de {BADGES.length} ganadas</span>
                <span className="profile-badge-count">{Math.round(ganadas.length / BADGES.length * 100)}%</span>
              </div>
              <div className="prog" aria-hidden="true"><i style={{ width: Math.round(ganadas.length / BADGES.length * 100) + '%' }} /></div>
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
            </section>
          )}
        </div>
      </div>
    </>
  )
}
