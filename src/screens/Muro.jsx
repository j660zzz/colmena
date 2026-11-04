import { useMemo, useRef, useState } from 'react'
import { useColmena } from '../lib/store'
import { CATS } from '../data/contenido'
import { hace, firstName, initials, igUrl, fechaLarga } from '../lib/format'
import { activa, quedan, cierraEn, panalSemana, quienesTeNecesitan, waLink, cuantosEjemplo, PANAL } from '../lib/logic'
import { Icon, Hex, Ejemplo, BrandHeader, Empty, Panal, Mark, Sheet, useToast } from '../components/ui'
import { PrimerosPasos, marcarPractica } from './Onboarding'

export default function Muro({ nav, irTab, pedirPerfil, headerRight, abrirComposer, abrirAyuda }) {
  const c = useColmena()
  const [tipo, setTipo] = useState('todo')
  const [cat, setCat] = useState(null)

  const activas = useMemo(() => c.publicaciones.filter((p) => activa(p)), [c.publicaciones])
  const lista = activas.filter((p) => (tipo === 'todo' || p.tipo === tipo) && (!cat || p.categorias.includes(cat)))
    .sort((a, b) => (!!a.resuelta_at - !!b.resuelta_at))
  const cuenta = (t) => activas.filter((p) => (t === 'todo' || p.tipo === t) && (!cat || p.categorias.includes(cat))).length
  const teNecesitan = c.yo ? quienesTeNecesitan(c, c.yo) : []
  const irLista = () => setTimeout(() => document.getElementById('lista')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  const porCat = CATS.map((x) => [x, activas.filter((p) => p.categorias.includes(x)).length])
  const [verCats, setVerCats] = useState(false)

  return (
    <>
      <BrandHeader right={headerRight} />
      <div className="body fade">
        <p className="eyebrow">Muro · DCV Javeriana</p>
        {teNecesitan.length > 0 ? (
          <>
            <h1 className="headline"><Mark>{teNecesitan.length} {teNecesitan.length === 1 ? 'persona necesita' : 'personas necesitan'}</Mark> lo que sabes hacer.</h1>
            <button type="button" className="linkbtn" onClick={() => { setTipo('need'); setCat(null); irLista() }}>Ver publicaciones →</button>
          </>
        ) : (
          <h1 className="headline">Ayuda entre <Mark>emprendedores</Mark> de DCV.</h1>
        )}
        <p className="lede">Publica lo que necesitas o lo que sabes hacer. Quien pueda ayudarte te escribe por WhatsApp. <button type="button" className="como-in" onClick={() => abrirAyuda()}>¿Cómo funciona?</button></p>

        <button type="button" className="composer" onClick={() => abrirComposer()}>
          <span>¿Qué necesitas o qué ofreces?</span>
          <span className="plus"><Icon n="plus" s={18} w={2.4} /></span>
        </button>

        <AvisoPrueba />
        <PrimerosPasos irTab={irTab} nav={nav} pedirPerfil={pedirPerfil} abrirComposer={abrirComposer} />

        <Movimiento irTab={irTab} nav={nav} pedirPerfil={pedirPerfil} abrirAyuda={abrirAyuda} />

        <div className="sec-h" id="lista">
          <h3>El muro</h3>
          {cat
            ? <button type="button" className="cat-btn on" onClick={() => setCat(null)} aria-label={`Quitar filtro ${cat}`}>{cat}<Icon n="x" s={14} w={2.2} /></button>
            : <button type="button" className="cat-btn" onClick={() => setVerCats(true)}>Filtrar por categoría<Icon n="right" s={14} w={2} /></button>}
        </div>
        <div className="muro-bar">
          <div className="tabs-t" role="tablist" aria-label="Tipo de publicación">
            {[['todo', 'Todo'], ['need', 'Piden ayuda'], ['offer', 'Ofrecen']].map(([k, t]) => (
              <button key={k} type="button" role="tab" aria-selected={tipo === k} onClick={() => setTipo(k)}>{t}<small>{cuenta(k)}</small></button>
            ))}
          </div>
        </div>
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
            {lista.map((p) => <Post key={p.id} post={p} nav={nav} pedirPerfil={pedirPerfil} />)}
          </div>
        )}
        <p className="fine">Las publicaciones se ocultan solas cuando vencen.</p>
      </div>
    </>
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

  const nBen = c.beneficios.filter((b) => b.tipo === 'digital' && !b.para_todos).length
  const slides = [
    nBen > 0 && (
      <article key="beneficios" className="mov ink">
        <div className="mov-top"><span className="k">Con tu correo Javeriana</span></div>
        <h3>Tienes {nBen} beneficios de estudiante que quizás no estás usando.</h3>
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
      <p className="mov-facts">Materiales, horas y gastos fijos: la calculadora te da un precio en un minuto.</p>
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
      <p><span className="ej-pill">Prueba</span>Lo marcado como <b>Ejemplo</b> no son personas reales.</p>
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
    try { await c.marcarResuelta(post.id, !resuelta); toast(resuelta ? 'Publicación activa otra vez' : 'Marcada como resuelta') } catch (e) { toast(e.message, true) }
  }

  const borrar = async () => {
    if (!confirm('¿Borrar esta publicación?')) return
    try { await c.borrarPublicacion(post.id); toast('Publicación borrada') } catch (e) { toast(e.message, true) }
  }

  return (
    <article className={'post' + (resuelta ? ' resuelta' : '')}>
      <div className="post-top">
        <button type="button" className="who" onClick={() => autor && nav({ t: 'carnet', id: autor.id })}>
          <Hex p={autor} w={40} h={44} fs={14} />
          <span className="who-t">
            <b>{autor?.nombre || 'Miembro'}<Ejemplo p={autor} /></b>
            <span>{[autor?.marca, autor?.rol].filter(Boolean).join(' · ') || 'Miembro de Colmena'}</span>
          </span>
        </button>
      </div>
      <div className="post-meta">
        <span className={'pill ' + post.tipo}>{post.tipo === 'need' ? 'Necesito' : 'Ofrezco'}</span>
        {resuelta && <span className="pill ok"><Icon n="check" s={12} w={3} />Resuelta</span>}
        <span className="when">{hace(post.created_at)}</span>
      </div>
      <p className="post-lead">{titular}</p>
      {cuerpo && <p className="post-body">{cuerpo}</p>}
      <div className="post-tags">
        {post.categorias.map((t) => <span key={t} className="tag">{t}</span>)}
        {vence && !resuelta && <span className="vence"><Icon n="hour" s={13} />{vence}</span>}
      </div>
      <div className="post-foot">
        {!mio && <button type="button" className="sirve" aria-pressed={!!meSirveYa} onClick={toggleSirve}>
          <Icon n="thumb" s={16} w={meSirveYa ? 2.2 : 1.7} />Útil{sirve.length > 0 && <b>{sirve.length}</b>}
        </button>}
        {escribieron.length > 0 && !mio && (
          <span className="wrote">
            <span className="stack">{escribieron.slice(0, 3).map((a) => <Hex key={a.perfil_id} p={c.perfil(a.perfil_id)} w={20} fs={8} />)}</span>
            {escribieron.length} {escribieron.length === 1 ? 'escribió' : 'escribieron'}
          </span>
        )}
        {mio ? (
          <div className="mine">
            <button type="button" className="mine-r" onClick={() => nav({ t: 'publicado', postId: post.id })}>
              {escribieron.length ? `${escribieron.length} ${escribieron.length === 1 ? 'te escribió' : 'te escribieron'}` : 'Sin respuestas todavía'}<Icon n="right" s={14} w={2} />
            </button>
            <div className="mine-acc">
              {!resuelta && <button type="button" className="btn ghost sm" onClick={compartir}><Icon n="wa" s={16} />Compartir</button>}
              <button type="button" className={'btn sm ' + (resuelta ? 'ghost' : 'dark')} onClick={alternarResuelta}>{resuelta ? 'Reabrir' : <><Icon n="check" s={15} w={2.4} />Resuelta</>}</button>
              <button type="button" className="iconbtn" onClick={borrar} aria-label="Borrar publicación"><Icon n="trash" s={18} /></button>
            </div>
          </div>
        ) : resuelta ? (
          <span className="fine">Ya se resolvió</span>
        ) : (
          <button type="button" className={'btn sm ' + (yaEscribi ? 'dark' : 'primary')} onClick={escribir}>
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
        {enviando ? 'Publicando…' : 'Publicar en el muro'}
      </button>
      {!valido && texto.trim().length >= 5 && <p className="fine center">Elige al menos una categoría.</p>}
    </>
  )
}
