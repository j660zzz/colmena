import { Fragment, useMemo, useRef, useState } from 'react'
import { useColmena } from '../lib/store'
import { CATS } from '../data/contenido'
import { hace, firstName, initials, igUrl, fechaLarga } from '../lib/format'
import { activa, quedan, cierraEn, panalSemana, quienesTeNecesitan, waLink, cuantosEjemplo, nivelDe, PANAL } from '../lib/logic'
import { Icon, Hex, Ejemplo, BrandHeader, Empty, Panal, Mark, Sheet, useToast } from '../components/ui'
import { PrimerosPasos, marcarPractica } from './Onboarding'
import { CobroInsignia } from '../components/Cobro'

export default function Muro({ nav, irTab, pedirPerfil, headerRight, abrirComposer, abrirAyuda }) {
  const c = useColmena()
  const [tipo, setTipo] = useState('todo')
  const [cat, setCat] = useState(null)

  const activas = useMemo(() => c.publicaciones.filter((p) => activa(p)), [c.publicaciones])
  const lista = activas.filter((p) => (tipo === 'todo' || p.tipo === tipo) && (!cat || p.categorias.includes(cat)))
    .sort((a, b) => (!!a.resuelta_at - !!b.resuelta_at))
  const teNecesitan = c.yo ? quienesTeNecesitan(c, c.yo) : []
  const irLista = () => setTimeout(() => document.getElementById('lista')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  const porCat = CATS.map((x) => [x, activas.filter((p) => p.categorias.includes(x)).length])
  const [verCats, setVerCats] = useState(false)

  return (
    <>
      <BrandHeader right={headerRight} />
      <div className="body fade muro-body">
        {teNecesitan.length > 0 && (
          <button type="button" className="te-necesitan" onClick={() => { setTipo('need'); setCat(null); irLista() }}>
            <b><Mark>{teNecesitan.length} {teNecesitan.length === 1 ? 'persona necesita' : 'personas necesitan'}</Mark> lo que sabes hacer.</b>
            <Icon n="right" s={18} w={2} />
          </button>
        )}

        <Portada irTab={irTab} pedirPerfil={pedirPerfil} activas={activas} verPiden={() => { setTipo('need'); setCat(null); irLista() }} />

        <button type="button" className="composer" onClick={() => abrirComposer()}>
          <span>¿Qué necesitas o qué ofreces?</span>
          <span className="plus"><Icon n="plus" s={18} w={2.4} /></span>
        </button>

        <PrimerosPasos irTab={irTab} nav={nav} pedirPerfil={pedirPerfil} abrirComposer={abrirComposer} />

        <div className="muro-bar" id="lista">
          <div className="tabs-t" role="tablist" aria-label="Tipo de publicación">
            {[['todo', 'Todo'], ['need', 'Piden'], ['offer', 'Ofrecen']].map(([k, t]) => (
              <button key={k} type="button" role="tab" aria-selected={tipo === k} onClick={() => setTipo(k)}>{t}</button>
            ))}
          </div>
          {cat
            ? <button type="button" className="cat-btn on" onClick={() => setCat(null)} aria-label={`Quitar filtro ${cat}`}>{cat}<Icon n="x" s={14} w={2.2} /></button>
            : <button type="button" className="cat-btn" onClick={() => setVerCats(true)} aria-label="Filtrar por categoría"><Icon n="search" s={15} w={2} />Filtrar</button>}
        </div>
        <AvisoPrueba />
        <Sheet open={verCats} onClose={() => setVerCats(false)} label="Filtrar por categoría">
          <div className="cats-sheet">
            <h2>¿Qué estás buscando?</h2>
            <p className="soft">Muestra solo las publicaciones de una categoría.</p>
            <div className="cats-list">
              {porCat.map(([x, n]) => (
                <button key={x} type="button" disabled={n === 0} onClick={() => { setCat(x); setVerCats(false); irLista() }}>
                  <span>{x}</span><small>{n === 0 ? 'Nada todavía' : `${n} ${n === 1 ? 'publicación' : 'publicaciones'}`}</small>
                </button>
              ))}
            </div>
          </div>
        </Sheet>

        {lista.length === 0 ? (
          <Empty title="Todavía no hay publicaciones"
            action={<button type="button" className="btn primary sm" onClick={() => abrirComposer({ tipo: tipo === 'offer' ? 'offer' : 'need' })}>Publicar</button>}>
            Publica lo que necesitas o lo que ofreces.
          </Empty>
        ) : (
          <div className="posts" key={tipo + (cat || '')}>
            {lista.map((p, k) => (
              <Fragment key={p.id}>
                <Post post={p} nav={nav} pedirPerfil={pedirPerfil} />
                {k === Math.min(2, lista.length - 1) && tipo === 'todo' && !cat && (
                  <Movimiento irTab={irTab} nav={nav} pedirPerfil={pedirPerfil} abrirAyuda={abrirAyuda} />
                )}
              </Fragment>
            ))}
          </div>
        )}
        {lista.length === 0 && <Movimiento irTab={irTab} nav={nav} pedirPerfil={pedirPerfil} abrirAyuda={abrirAyuda} />}
        <div className="muro-fin">
          <b>No hay más publicaciones por ahora.</b>
          <p>Las publicaciones se ocultan solas cuando vencen. <button type="button" className="como-in" onClick={() => abrirAyuda()}>¿Cómo funciona?</button></p>
          <button type="button" className="btn ink sm" onClick={() => abrirComposer()}><Icon n="plus" s={16} w={2.4} />Publicar</button>
        </div>
      </div>
    </>
  )
}

// Portada: qué hay hoy en Colmena, con cifras de la base. Para miembros, lo suyo.
function Portada({ irTab, pedirPerfil, activas, verPiden }) {
  const c = useColmena()
  const piden = activas.filter((p) => p.tipo === 'need' && !p.resuelta_at)
  const pidenEj = piden.filter((p) => c.perfil(p.autor_id)?.es_ejemplo).length
  const nBen = c.beneficios.filter((b) => b.tipo === 'digital').length
  const nGratis = c.beneficios.filter((b) => b.tipo === 'digital' && b.gratis).length
  const e = c.encuentro
  const r = c.reto
  const retoAbierto = r && new Date(r.cierra_en).getTime() > Date.now()
  const yo = c.yo
  const nv = yo ? nivelDe(c, yo.id) : null
  const mias = yo ? activas.filter((p) => p.autor_id === yo.id).map((p) => p.id) : []
  const meEscribieron = yo ? c.ayudas.filter((a) => mias.includes(a.publicacion_id)).length : 0

  const tiles = [
    { k: 'piden', ic: 'hand', n: piden.length, t: piden.length === 1 ? 'persona pide ayuda' : 'personas piden ayuda', nota: pidenEj ? `${pidenEj} de ejemplo` : null, go: verPiden },
    nBen > 0 && { k: 'ben', ic: 'gift', n: nBen, t: 'beneficios de estudiante', nota: nGratis ? `${nGratis} gratis` : null, go: () => irTab('herramientas') },
    retoAbierto
      ? { k: 'reto', ic: 'spark', n: null, t: 'Reto de la semana', nota: cierraEn(r.cierra_en), go: () => irTab('encuentro') }
      : e && { k: 'enc', ic: 'cal', n: null, t: `Encuentro ${String(e.numero).padStart(2, '0')}`, nota: fechaLarga(e.fecha) || 'Fecha por confirmar', go: () => irTab('encuentro') }
  ].filter(Boolean)

  if (yo) {
    return (
      <section className="portada mia" aria-label="Lo tuyo">
        <button type="button" onClick={() => irTab('carnet')}>
          <small>Tu nivel</small><b>{nv.n} · {nv.t}</b><span>{nv.sig ? `Te ${nv.faltan === 1 ? 'falta 1 punto' : `faltan ${nv.faltan} puntos`}` : 'Nivel más alto'}</span>
        </button>
        <button type="button" onClick={() => irTab('carnet')}>
          <small>Te escribieron</small><b>{meEscribieron}</b><span>{mias.length ? `En ${mias.length} ${mias.length === 1 ? 'publicación' : 'publicaciones'}` : 'Publica para recibir ayuda'}</span>
        </button>
      </section>
    )
  }
  return (
    <section className="portada" aria-label="Qué hay en Colmena">
      <div className="portada-top">
        <h1>Pide ayuda, ofrece lo que sabes y usa tus beneficios.</h1>
        <p>Para estudiantes de DCV que emprenden. Gratis.</p>
      </div>
      <div className="portada-tiles">
        {tiles.map((x) => (
          <button key={x.k} type="button" onClick={x.go}>
            <Icon n={x.ic} s={18} />
            {x.n != null ? <b>{x.n}</b> : null}
            <span>{x.t}</span>
            {x.nota && <small>{x.nota}</small>}
          </button>
        ))}
      </div>
    </section>
  )
}

// "Lo que se mueve": lo vivo de la colmena en un carrusel (reto, panal, encuentro, herramienta)
function Movimiento({ irTab, nav, pedirPerfil, abrirAyuda }) {
  const c = useColmena()
  const toast = useToast()
  const pista = useRef(null)
  const [i, setI] = useState(0)
  const r = c.reto
  const e = c.encuentro
  const { llenas, ejemplos, manos } = panalSemana(c)
  const celdas = manos.slice(0, PANAL).map((m) => initials(c.perfil(m.ayuda)?.nombre || ''))

  const gente = r ? c.participantes.filter((x) => x.reto_id === r.id) : []
  const yoEnReto = c.yo && gente.some((x) => x.perfil_id === c.yo.id)
  const retoAbierto = r && new Date(r.cierra_en).getTime() > Date.now()
  const ejReto = cuantosEjemplo(c, gente.map((x) => x.perfil_id))
  const medirse = () => pedirPerfil('Necesitas un carnet para participar en el reto.', async () => {
    try { await c.unirseReto(r.id); toast('Ya estás participando. Sube tu propuesta en Encuentro.'); irTab('encuentro') } catch (x) { toast(x.message, true) }
  })

  const van = e ? c.asistencias.filter((a) => a.encuentro_id === e.id).map((a) => c.perfil(a.perfil_id)).filter(Boolean) : []
  const ejVan = van.filter((p) => p.es_ejemplo).length

  const nBen = c.beneficios.filter((b) => b.tipo === 'digital').length
  const slides = [
    nBen > 0 && (
      <article key="beneficios" className="mov ink">
        <div className="mov-top"><span className="k">Con tu correo Javeriana</span></div>
        <h3>Tienes {nBen} beneficios que quizás no estás usando.</h3>
        <p className="mov-facts claro">Office, Adobe, Figma, Spotify y más, gratis o con descuento.</p>
        <button type="button" className="go" onClick={() => irTab('herramientas')}>Ver beneficios <Icon n="right" s={15} w={2.2} /></button>
      </article>
    ),
    r && (
      <article key="reto" className="mov polen">
        <div className="mov-top"><span className="k">Reto de la semana <QueEs onClick={() => abrirAyuda('reto')} /></span><span className="cd">{cierraEn(r.cierra_en)}</span></div>
        <h3>{r.titulo}</h3>
        <div className="mov-foot">
          <span className="mov-who">
            {gente.length > 0 && <span className="stack">{gente.slice(0, 3).map((x) => <Hex key={x.perfil_id} p={c.perfil(x.perfil_id)} w={22} fs={8} />)}</span>}
            <span>{gente.length === 0 ? 'Nadie participa todavía' : `${gente.length} ${gente.length === 1 ? 'participa' : 'participan'}`}{ejReto > 0 && <em><br />{ejReto} de ejemplo</em>}</span>
          </span>
          {!retoAbierto ? <button type="button" className="btn ink sm" onClick={() => irTab('encuentro')}>Ver</button>
            : yoEnReto ? <button type="button" className="btn ink sm" onClick={() => irTab('encuentro')}>Subir propuesta</button>
            : <button type="button" className="btn ink sm" onClick={medirse}>Participar</button>}
        </div>
      </article>
    ),
    <article key="panal" className="mov ink">
      <div className="mov-split">
        <div>
          <span className="k">El panal de esta semana <QueEs onClick={() => abrirAyuda('panal')} /></span>
          <b className="mov-big"><em>{llenas}</em>/{PANAL}</b>
          <p>{llenas === 0 ? 'Cada ayuda confirmada llena una celda.' : `ayudas esta semana · faltan ${Math.max(PANAL - llenas, 0)}`}</p>
          {ejemplos > 0 && <span className="ej-note">{ejemplos} {ejemplos === 1 ? 'es' : 'son'} de ejemplo</span>}
        </div>
        <Panal celdas={celdas} size={14} />
      </div>
      <button type="button" className="go" onClick={() => irTab('encuentro')}>Ver el panal <Icon n="right" s={15} w={2.2} /></button>
    </article>,
    e && (
      <article key="encuentro" className="mov white">
        <div className="mov-top"><span className="k">Encuentro {String(e.numero).padStart(2, '0')} · cierre del mes</span></div>
        <h3>{e.titulo}</h3>
        <p className="mov-facts"><Icon n="cal" s={15} />{fechaLarga(e.fecha) || 'Fecha por confirmar'}{e.lugar ? ` · ${e.lugar}` : ''}</p>
        <div className="mov-foot">
          <span className="mov-who">
            {van.length > 0 && <span className="stack">{van.slice(0, 3).map((p) => <Hex key={p.id} p={p} w={22} fs={8} />)}</span>}
            <span>{van.length === 0 ? 'Nadie se ha inscrito todavía' : `${van.length} ${van.length === 1 ? 'quiere ir' : 'quieren ir'}`}{ejVan > 0 && <em><br />{ejVan} de ejemplo</em>}</span>
          </span>
          <button type="button" className="btn primary sm" onClick={() => irTab('encuentro')}>Quiero ir</button>
        </div>
      </article>
    ),
    <article key="calc" className="mov white">
      <div className="mov-top"><span className="k">Herramienta</span></div>
      <h3>¿Cuánto deberías cobrar por lo que haces?</h3>
      <p className="mov-facts">Suma materiales, horas y gastos fijos, y te da un precio sugerido.</p>
      <div className="mov-foot"><span /><button type="button" className="btn ink sm" onClick={() => nav({ t: 'calc' })}>Calcular</button></div>
    </article>
  ].filter(Boolean)

  const alMover = () => {
    const el = pista.current
    if (!el || !el.firstElementChild) return
    const paso = el.firstElementChild.getBoundingClientRect().width + 12
    setI(Math.min(slides.length - 1, Math.round(el.scrollLeft / paso)))
  }

  return (
    <section className="movimiento" aria-label="Lo que se mueve">
      <div className="sec-h"><h3>Esta semana</h3><span className="meta mono">{i + 1}/{slides.length}</span></div>
      <div className="mov-pista" ref={pista} onScroll={alMover}>{slides}</div>
      <div className="mov-dots" aria-hidden="true">{slides.map((_, k) => <i key={k} className={k === i ? 'on' : ''} />)}</div>
    </section>
  )
}

const QueEs = ({ onClick }) => (
  <button type="button" className="quees" onClick={onClick} aria-label="¿Qué es esto?">?</button>
)

const AVISO = 'colmena.aviso-prueba.v1'
function AvisoPrueba() {
  const [visto, setVisto] = useState(() => { try { return localStorage.getItem(AVISO) === '1' } catch { return false } })
  if (visto) return null
  const cerrar = () => { try { localStorage.setItem(AVISO, '1') } catch { /* sin almacenamiento */ } setVisto(true) }
  return (
    <aside className="aviso-prueba" aria-label="Prototipo en prueba">
      <p><span className="ej-pill">Prueba</span>Lo marcado como <b>Ejemplo</b> es de muestra: no son personas reales.</p>
      <button type="button" className="iconbtn" onClick={cerrar} aria-label="Cerrar aviso"><Icon n="x" s={16} /></button>
    </aside>
  )
}

export function RetoCard({ irTab, pedirPerfil, completo = false }) {
  const c = useColmena()
  const toast = useToast()
  const r = c.reto
  if (!r) return null
  const gente = c.participantes.filter((x) => x.reto_id === r.id)
  const yoEstoy = c.yo && gente.some((x) => x.perfil_id === c.yo.id)
  const ejGente = cuantosEjemplo(c, gente.map((x) => x.perfil_id))
  const cerrado = new Date(r.cierra_en).getTime() < Date.now()
  const medirse = () => pedirPerfil('Necesitas un carnet para participar en el reto.', async () => {
    try { await c.unirseReto(r.id); toast('Ya estás participando. Sube tu propuesta antes del cierre.'); if (!completo) irTab('encuentro') } catch (e) { toast(e.message, true) }
  })
  return (
    <section className="reto">
      <div className="reto-top">
        <span className="k">Reto de la semana</span>
        <span className="cd">{cierraEn(r.cierra_en)}</span>
      </div>
      <h3>{r.titulo}</h3>
      {completo && r.descripcion && <p className="reto-desc">{r.descripcion}</p>}
      {completo && <p className="reto-pts">Subir tu propuesta suma 2 puntos a tu nivel.</p>}
      {completo && r.pasos?.length > 0 && (
        <ol className="steps">{r.pasos.map((x, i) => <li key={i}><i>{i + 1}</i><span>{x}</span></li>)}</ol>
      )}
      <div className="reto-foot">
        <div className="who-row">
          {gente.length > 0 && <div className="stack">{gente.slice(0, 4).map((x) => <Hex key={x.perfil_id} p={c.perfil(x.perfil_id)} w={24} fs={9} />)}</div>}
          <span>{gente.length === 0 ? 'Nadie participa todavía' : `${gente.length} ${gente.length === 1 ? 'participa' : 'participan'}`}{ejGente > 0 && <em className="ej-inline"> · {ejGente} de ejemplo</em>}</span>
        </div>
        {cerrado ? <span className="tag">Cerrado</span>
          : yoEstoy ? (!completo && <button type="button" className="btn dark sm" onClick={() => irTab('encuentro')}>Subir propuesta</button>)
          : <button type="button" className="btn primary sm" onClick={medirse}>Participar</button>}
      </div>
    </section>
  )
}

export function Post({ post, nav, pedirPerfil }) {
  const c = useColmena()
  const toast = useToast()
  const autor = c.perfil(post.autor_id)
  const mio = c.yo && post.autor_id === c.yo.id
  const escribieron = c.ayudas.filter((a) => a.publicacion_id === post.id)
  const sirve = c.meSirve.filter((m) => m.publicacion_id === post.id)
  const meSirveYa = c.yo && sirve.some((m) => m.perfil_id === c.yo.id)
  const yaEscribi = c.yo && escribieron.some((a) => a.perfil_id === c.yo.id)
  const cta = post.tipo === 'need' ? 'Puedo ayudar' : 'Me interesa'
  const [titular, cuerpo] = dividirTexto(post.texto)
  const vence = quedan(post.vence_en)
  const restan = post.vence_en ? new Date(post.vence_en).getTime() - Date.now() : Infinity
  const pronto = restan < 3 * 3600000
  const hoy = restan < 24 * 3600000
  const resuelta = !!post.resuelta_at

  const escribir = () => pedirPerfil('Necesitas un carnet para escribirle. Así sabe quién eres.', async () => {
    if (autor?.es_ejemplo) { marcarPractica(); toast('Esta publicación es de ejemplo. Con una persona real se abre WhatsApp con un mensaje listo.'); return }
    try {
      const num = await c.contactar(post.autor_id, post.id)
      const msg = `Hola ${firstName(autor?.nombre)}, te vi en Colmena. Sobre tu publicación “${titular}”: ${post.tipo === 'need' ? 'puedo ayudarte.' : 'me interesa.'}`
      if (num) location.href = waLink(num, msg)
      else if (autor?.instagram) location.href = igUrl(autor.instagram)
      else toast(`${firstName(autor?.nombre)} todavía no agregó su WhatsApp. Verá tu respuesta en su publicación.`)
    } catch (e) { toast(e.message, true) }
  })

  const toggleSirve = () => pedirPerfil('Necesitas un carnet para marcar publicaciones como útiles.', async () => {
    try { await c.alternarMeSirve(post.id) } catch (e) { toast(e.message, true) }
  })

  const compartir = () => {
    const url = `${location.origin}/?carnet=${post.autor_id}`
    const txt = post.tipo === 'need'
      ? `Estoy buscando ayuda con esto: “${post.texto}”. Si sabes de alguien, mi publicación está en Colmena: ${url}`
      : `Ofrezco esto: “${post.texto}”. Escríbeme por Colmena: ${url}`
    window.open(waLink('', txt), '_blank', 'noopener')
  }
  const alternarResuelta = async () => {
    try { await c.marcarResuelta(post.id, !resuelta); toast(resuelta ? 'Tu publicación está activa otra vez' : 'Marcaste la publicación como resuelta') } catch (e) { toast(e.message, true) }
  }

  const borrar = async () => {
    if (!confirm('¿Borrar esta publicación?')) return
    try { await c.borrarPublicacion(post.id); toast('Publicación borrada') } catch (e) { toast(e.message, true) }
  }

  const corta = !cuerpo && titular.length <= 70
  const recien = Date.now() - new Date(post.created_at).getTime() < 20000
  const cls = ['post', post.tipo, corta && 'corta', resuelta && 'resuelta', recien && 'recien'].filter(Boolean).join(' ')

  return (
    <article className={cls}>
      <div className="post-top">
        <button type="button" className="who" onClick={() => autor && nav({ t: 'carnet', id: autor.id })}>
          <Hex p={autor} w={36} h={40} fs={13} />
          <span className="who-t">
            <b>{autor?.nombre || 'Miembro'}<Ejemplo p={autor} /></b>
            <span>{[hace(post.created_at), autor?.marca || autor?.rol].filter(Boolean).join(' · ')}</span>
          </span>
        </button>
        <span className="post-tipo">
          {post.tipo === 'offer' && autor?.intercambio && <CobroInsignia modo={autor.intercambio} abrir solo />}
          <span className={'pill ' + post.tipo}><Icon n={post.tipo === 'need' ? 'hand' : 'spark'} s={13} w={2} />{post.tipo === 'need' ? 'Necesito' : 'Ofrezco'}</span>
        </span>
      </div>
      <p className="post-lead">{titular}</p>
      {cuerpo && <p className="post-body">{cuerpo}</p>}
      <p className="post-info">
        {resuelta
          ? <span className="pill ok"><Icon n="check" s={12} w={3} />Resuelta</span>
          : <>{post.categorias.join(' · ')}{vence && hoy && <span className={'vence' + (pronto ? ' pronto' : '')}><Icon n="hour" s={12} />{vence}</span>}</>}
      </p>
      <div className="post-foot">
        {!mio && <button type="button" className="sirve" aria-pressed={!!meSirveYa} onClick={toggleSirve} aria-label={`Útil${sirve.length ? `, ${sirve.length}` : ''}`}>
          <Icon n="thumb" s={18} w={meSirveYa ? 2.2 : 1.7} /><span>Útil</span>{sirve.length > 0 && <b>{sirve.length}</b>}
        </button>}
        {escribieron.length > 0 && !mio && (
          <span className="wrote" aria-label={`${escribieron.length} ${escribieron.length === 1 ? 'persona respondió' : 'personas respondieron'}`}>
            <span className="stack">{escribieron.slice(0, 3).map((a) => <Hex key={a.perfil_id} p={c.perfil(a.perfil_id)} w={20} fs={8} />)}</span>
            {escribieron.length}
          </span>
        )}
        {mio ? (
          <div className="mine">
            <button type="button" className="mine-r" onClick={() => nav({ t: 'publicado', postId: post.id })}>
              {escribieron.length ? `${escribieron.length} ${escribieron.length === 1 ? 'te escribió' : 'te escribieron'}` : 'Sin respuestas todavía'}<Icon n="right" s={14} w={2} />
            </button>
            <div className="mine-acc">
              {!resuelta && <button type="button" className="accion" onClick={compartir}><Icon n="wa" s={16} />Compartir</button>}
              <button type="button" className="accion" onClick={alternarResuelta}>{resuelta ? 'Reabrir' : <><Icon n="check" s={15} w={2.4} />Marcar resuelta</>}</button>
              <button type="button" className="iconbtn" onClick={borrar} aria-label="Borrar publicación"><Icon n="trash" s={18} /></button>
            </div>
          </div>
        ) : resuelta ? (
          <span className="fine">Ya se resolvió</span>
        ) : (
          <button type="button" className={'accion principal' + (yaEscribi ? ' hecho' : '')} onClick={escribir}>
            <Icon n="wa" s={17} />{yaEscribi ? 'Escribir otra vez' : cta}
          </button>
        )}
      </div>
    </article>
  )
}

// La primera frase funciona como titular y el resto como cuerpo.
export function dividirTexto(t) {
  const limpio = t.trim()
  const m = limpio.match(/^(.{8,140}?[.!?])(\s+)([\s\S]+)$/)
  if (m) return [m[1], m[3].trim()]
  return [limpio, '']
}

const LIMITE = 120
export function Composer({ inicial, onDone }) {
  const c = useColmena()
  const [tipo, setTipo] = useState(inicial.tipo || 'need')
  const [texto, setTexto] = useState(inicial.texto || '')
  const [cats, setCats] = useState(inicial.cats || [])
  const [dias, setDias] = useState(3)
  const [enviando, setEnviando] = useState(false)
  const [err, setErr] = useState('')
  const toggle = (x) => setCats((l) => l.includes(x) ? l.filter((y) => y !== x) : l.length < 3 ? [...l, x] : l)
  const valido = texto.trim().length >= 5 && cats.length > 0

  const publicar = async () => {
    setErr(''); setEnviando(true)
    try { const id = await c.publicar(tipo, texto.trim(), cats, dias); onDone(id) }
    catch (e) { setErr(e.message) } finally { setEnviando(false) }
  }

  return (
    <>
      <h3>Publicar en el muro</h3>
      <div className="toggles" role="group" aria-label="Tipo de publicación">
        <button type="button" className="tcard" aria-pressed={tipo === 'need'} onClick={() => setTipo('need')}>
          <Icon n="hand" s={22} /><b>Necesito</b><span>Pide ayuda con algo concreto</span>{tipo === 'need' && <i className="ok"><Icon n="check" s={13} w={3} /></i>}
        </button>
        <button type="button" className="tcard" aria-pressed={tipo === 'offer'} onClick={() => setTipo('offer')}>
          <Icon n="spark" s={22} /><b>Ofrezco</b><span>Comparte lo que sabes hacer</span>{tipo === 'offer' && <i className="ok"><Icon n="check" s={13} w={3} /></i>}
        </button>
      </div>
      <label className="lbl" htmlFor="dx">{tipo === 'need' ? '¿Qué necesitas?' : '¿Qué ofreces?'}</label>
      <div className="ta">
        <textarea id="dx" maxLength={LIMITE} value={texto} onChange={(e) => setTexto(e.target.value)}
          placeholder={tipo === 'need' ? 'Ej: alguien que me revise el logo antes de imprimir' : 'Ej: hago fotos de producto con celular para tu marca'} />
        <span className={'counter' + (texto.length > LIMITE - 10 ? ' warn' : '')}>{texto.length}/{LIMITE}</span>
      </div>
      <span className="lbl">Categoría <small>(hasta 3)</small></span>
      <div className="chips wrap">
        {CATS.map((x) => <button key={x} type="button" className="chip" aria-pressed={cats.includes(x)} onClick={() => toggle(x)}>{x}</button>)}
      </div>
      <span className="lbl">Visible por</span>
      <div className="segbar">
        {[[1, '24 h'], [3, '3 días'], [7, '1 semana']].map(([d, t]) => <button key={d} type="button" aria-pressed={dias === d} onClick={() => setDias(d)}>{t}</button>)}
      </div>
      <p className="note"><Icon n="wa" s={16} /><Icon n="lock" s={14} />Te escriben por WhatsApp. Solo otros miembros ven tu número.</p>
      {err && <p className="err" role="alert">{err}</p>}
      <button type="button" className="btn primary full big" disabled={!valido || enviando} onClick={publicar}>
        {enviando ? 'Publicando…' : 'Publicar'}
      </button>
      {!valido && texto.trim().length >= 5 && <p className="fine center">Elige al menos una categoría.</p>}
    </>
  )
}
