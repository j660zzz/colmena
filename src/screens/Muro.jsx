import { useMemo, useState } from 'react'
import { useColmena } from '../lib/store'
import { CATS } from '../data/contenido'
import { hace, firstName, initials, igUrl } from '../lib/format'
import { activa, quedan, cierraEn, panalSemana, quienesTeNecesitan, tendencias, waLink, cuantosEjemplo, PANAL } from '../lib/logic'
import { Icon, Hex, Ejemplo, BrandHeader, Empty, Panal, Mark, useToast } from '../components/ui'

export default function Muro({ nav, irTab, pedirPerfil, headerRight, abrirComposer }) {
  const c = useColmena()
  const [tipo, setTipo] = useState('todo')
  const [cat, setCat] = useState(null)

  const activas = useMemo(() => c.publicaciones.filter((p) => activa(p)), [c.publicaciones])
  const lista = activas.filter((p) => (tipo === 'todo' || p.tipo === tipo) && (!cat || p.categorias.includes(cat)))
  const cuenta = (t) => activas.filter((p) => t === 'todo' || p.tipo === t).length
  const teNecesitan = c.yo ? quienesTeNecesitan(c, c.yo) : []
  const top = tendencias(c)

  return (
    <>
      <BrandHeader right={headerRight} />
      <div className="body fade">
        <p className="eyebrow">Muro · DCV Javeriana</p>
        {teNecesitan.length > 0 ? (
          <>
            <h1 className="headline"><Mark>{teNecesitan.length} {teNecesitan.length === 1 ? 'persona necesita' : 'personas necesitan'}</Mark> lo que sabes hacer.</h1>
            <button type="button" className="linkbtn" onClick={() => { setTipo('need'); setCat(null); document.getElementById('lista')?.scrollIntoView({ behavior: 'smooth' }) }}>Ver quiénes →</button>
          </>
        ) : (
          <h1 className="headline">Aquí nadie arranca <Mark>solo.</Mark></h1>
        )}

        <AvisoPrueba />

        <button type="button" className="composer" onClick={() => abrirComposer()}>
          <span>¿Qué necesitas o qué ofreces?</span>
          <span className="plus"><Icon n="plus" s={18} w={2.4} /></span>
        </button>

        <PanalMini onVer={() => irTab('encuentro')} />
        <RetoCard nav={nav} irTab={irTab} pedirPerfil={pedirPerfil} />

        <div className="segbar" role="group" aria-label="Tipo de publicación" id="lista">
          {[['todo', 'Todo'], ['need', 'Necesito'], ['offer', 'Ofrezco']].map(([k, t]) => (
            <button key={k} type="button" aria-pressed={tipo === k} onClick={() => setTipo(k)}>{t} <small>{cuenta(k)}</small></button>
          ))}
        </div>
        {top.length > 0 && (
          <div className="trend">
            <span className="trend-l"><Icon n="trend" s={16} />Lo más pedido</span>
            <div className="chips">
              {top.map(([x, n]) => <button key={x} type="button" className="chip sm" aria-pressed={cat === x} onClick={() => setCat(cat === x ? null : x)}>{x} · {n}</button>)}
            </div>
          </div>
        )}
        {cat && !top.some(([x]) => x === cat) && <button type="button" className="linkbtn" onClick={() => setCat(null)}>Quitar filtro: {cat}</button>}

        {lista.length === 0 ? (
          <Empty title="Nada por aquí todavía"
            action={<button type="button" className="btn primary sm" onClick={() => abrirComposer({ tipo: tipo === 'offer' ? 'offer' : 'need' })}>Publicar lo primero</button>}>
            Sé el primero en contar qué necesitas o qué ofreces.
          </Empty>
        ) : (
          <div className="posts">
            {lista.map((p) => <Post key={p.id} post={p} nav={nav} pedirPerfil={pedirPerfil} />)}
          </div>
        )}
        <p className="fine">Las publicaciones vencen solas para que el muro siempre esté fresco.</p>
      </div>
    </>
  )
}

const AVISO = 'colmena.aviso-prueba.v1'
function AvisoPrueba() {
  const [visto, setVisto] = useState(() => { try { return localStorage.getItem(AVISO) === '1' } catch { return false } })
  if (visto) return null
  const cerrar = () => { try { localStorage.setItem(AVISO, '1') } catch { /* sin almacenamiento */ } setVisto(true) }
  return (
    <aside className="aviso-prueba" aria-label="Prototipo en prueba">
      <span className="ej-pill">Prototipo en prueba</span>
      <p>Lo que lleva la etiqueta <b>Ejemplo</b> es contenido de muestra para que veas cómo funciona Colmena: no son personas ni publicaciones reales. Todo lo demás es de la comunidad.</p>
      <button type="button" className="linkbtn" onClick={cerrar}>Entendido</button>
    </aside>
  )
}

function PanalMini({ onVer }) {
  const c = useColmena()
  const { manos, llenas, ejemplos } = panalSemana(c)
  const celdas = manos.slice(0, PANAL).map((m) => initials(c.perfil(m.ayuda)?.nombre || ''))
  const faltan = PANAL - llenas
  return (
    <section className="panal-card">
      <div className="panal-txt">
        <span className="k">El panal de esta semana</span>
        <b className="big"><em>{llenas}</em>/{PANAL}</b>
        <p>{llenas === 0 ? 'Cada mano que se confirma llena una celda.' : `manos dadas · ${faltan > 0 ? `faltan ${faltan} para llenarlo` : '¡lo llenamos!'}`}</p>
        {ejemplos > 0 && <span className="ej-note">{ejemplos} {ejemplos === 1 ? 'es' : 'son'} de ejemplo</span>}
        <button type="button" className="go" onClick={onVer}>Ver el panal <Icon n="right" s={15} w={2.2} /></button>
      </div>
      <Panal celdas={celdas} size={17} />
    </section>
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
  const medirse = () => pedirPerfil('Para medírtele al reto necesitas tu carnet.', async () => {
    try { await c.unirseReto(r.id); toast('¡Te le mediste! Sube tu propuesta antes de que cierre.'); if (!completo) irTab('encuentro') } catch (e) { toast(e.message, true) }
  })
  return (
    <section className="reto">
      <div className="reto-top">
        <span className="k">Reto de la semana</span>
        <span className="cd">{cierraEn(r.cierra_en)}</span>
      </div>
      <h3>{r.titulo}</h3>
      {completo && r.descripcion && <p className="reto-desc">{r.descripcion}</p>}
      {completo && r.pasos?.length > 0 && (
        <ol className="steps">{r.pasos.map((x, i) => <li key={i}><i>{i + 1}</i><span>{x}</span></li>)}</ol>
      )}
      <div className="reto-foot">
        <div className="who-row">
          {gente.length > 0 && <div className="stack">{gente.slice(0, 4).map((x) => <Hex key={x.perfil_id} p={c.perfil(x.perfil_id)} w={24} fs={9} />)}</div>}
          <span>{gente.length === 0 ? 'Nadie se le ha medido aún' : `${gente.length} ya se le ${gente.length === 1 ? 'midió' : 'midieron'}`}{ejGente > 0 && <em className="ej-inline"> · {ejGente} de ejemplo</em>}</span>
        </div>
        {cerrado ? <span className="tag">Cerrado</span>
          : yoEstoy ? (!completo && <button type="button" className="btn dark sm" onClick={() => irTab('encuentro')}>Subir propuesta</button>)
          : <button type="button" className="btn primary sm" onClick={medirse}>Me le mido</button>}
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

  const escribir = () => pedirPerfil('Para escribirle necesitas tu carnet. Así sabe quién eres.', async () => {
    if (autor?.es_ejemplo) { toast('Esta publicación es de ejemplo: no hay a quién escribirle.'); return }
    try {
      const num = await c.contactar(post.autor_id, post.id)
      const msg = `Hola ${firstName(autor?.nombre)}, te vi en Colmena. Sobre tu publicación “${titular}”: ${post.tipo === 'need' ? 'puedo ayudarte.' : 'me interesa.'}`
      if (num) location.href = waLink(num, msg)
      else if (autor?.instagram) location.href = igUrl(autor.instagram)
      else toast(`${firstName(autor?.nombre)} aún no agregó su WhatsApp. Ya vio que le escribiste.`)
    } catch (e) { toast(e.message, true) }
  })

  const toggleSirve = () => pedirPerfil('Para marcar Me sirve necesitas tu carnet.', async () => {
    try { await c.alternarMeSirve(post.id) } catch (e) { toast(e.message, true) }
  })

  const borrar = async () => {
    if (!confirm('¿Borrar esta publicación?')) return
    try { await c.borrarPublicacion(post.id); toast('Publicación borrada') } catch (e) { toast(e.message, true) }
  }

  return (
    <article className="post">
      <div className="post-top">
        <button type="button" className="who" onClick={() => autor && nav({ t: 'carnet', id: autor.id })}>
          <Hex p={autor} w={40} h={44} fs={14} />
          <span className="who-t">
            <b>{autor?.nombre || 'Miembro'}<Ejemplo p={autor} /></b>
            <span>{[autor?.marca, autor?.rol].filter(Boolean).join(' · ') || 'Miembro de la colmena'}</span>
          </span>
        </button>
      </div>
      <div className="post-meta">
        <span className={'pill ' + post.tipo}>{post.tipo === 'need' ? 'Necesito' : 'Ofrezco'}</span>
        <span className="when">{hace(post.created_at)}</span>
      </div>
      <p className="post-lead">{titular}</p>
      {cuerpo && <p className="post-body">{cuerpo}</p>}
      <div className="post-tags">
        {post.categorias.map((t) => <span key={t} className="tag">{t}</span>)}
        {vence && <span className="vence"><Icon n="hour" s={13} />{vence}</span>}
      </div>
      <div className="post-foot">
        <button type="button" className="sirve" aria-pressed={!!meSirveYa} onClick={toggleSirve} disabled={mio}>
          <Icon n="thumb" s={16} w={meSirveYa ? 2.2 : 1.7} />Me sirve{sirve.length > 0 && <b>{sirve.length}</b>}
        </button>
        {escribieron.length > 0 && !mio && (
          <span className="wrote">
            <span className="stack">{escribieron.slice(0, 3).map((a) => <Hex key={a.perfil_id} p={c.perfil(a.perfil_id)} w={20} fs={8} />)}</span>
            {escribieron.length} {escribieron.length === 1 ? 'escribió' : 'escribieron'}
          </span>
        )}
        {mio ? (
          <span className="mine">
            <button type="button" className="btn dark sm" onClick={() => nav({ t: 'publicado', postId: post.id })}>
              {escribieron.length ? `${escribieron.length} ${escribieron.length === 1 ? 'te escribió' : 'te escribieron'}` : 'Quién puede ayudar'}
            </button>
            <button type="button" className="iconbtn" onClick={borrar} aria-label="Borrar publicación"><Icon n="trash" s={18} /></button>
          </span>
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
          <Icon n="hand" s={22} /><b>Necesito</b><span>Pídele una mano a la colmena</span>{tipo === 'need' && <i className="ok"><Icon n="check" s={13} w={3} /></i>}
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
      <span className="lbl">Dura</span>
      <div className="segbar">
        {[[1, '24 h'], [3, '3 días'], [7, '1 semana']].map(([d, t]) => <button key={d} type="button" aria-pressed={dias === d} onClick={() => setDias(d)}>{t}</button>)}
      </div>
      <p className="note"><Icon n="wa" s={16} /><Icon n="lock" s={14} />Te escriben por WhatsApp. Solo los miembros con carnet ven tu número.</p>
      {err && <p className="err" role="alert">{err}</p>}
      <button type="button" className="btn primary full big" disabled={!valido || enviando} onClick={publicar}>
        {enviando ? 'Publicando…' : 'Publicar en el muro'}
      </button>
      {!valido && texto.trim().length >= 5 && <p className="fine center">Elige al menos una categoría.</p>}
    </>
  )
}
