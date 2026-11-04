import { useEffect, useMemo, useRef, useState } from 'react'
import { useColmena } from '../lib/store'
import { CATS } from '../data/contenido'
import { hace, firstName, igUrl } from '../lib/format'
import { activa, quedan, cierraEn, quienesTeNecesitan, waLink, cuantosEjemplo } from '../lib/logic'
import { Icon, Hex, Ejemplo, BrandHeader, SubHeader, Empty, Mark, Sheet, useToast } from '../components/ui'
import { PrimerosPasos, marcarPractica } from './Onboarding'
import { Inicio } from '../components/Inicio'
import { CobroInsignia } from '../components/Cobro'
import { useEstadoVista, useScrollVista, leerBorrador, guardarBorrador, borrarBorrador } from '../lib/vista'

export default function Muro({ nav, irTab, pedirPerfil, headerRight, abrirComposer, abrirAyuda }) {
  const c = useColmena()
  const [tipo, setTipo] = useEstadoVista('muro.tipo', 'todo')
  const [cat, setCat] = useEstadoVista('muro.cat', null)
  const scroll = useScrollVista('muro.scroll')

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
      <div className="body fade muro-body" ref={scroll}>
        <Inicio nav={nav} irTab={irTab} pedirPerfil={pedirPerfil} />
        {teNecesitan.length > 0 && (
          <button type="button" className="te-necesitan" onClick={() => { setTipo('need'); setCat(null); irLista() }}>
            <b><Mark>{teNecesitan.length} {teNecesitan.length === 1 ? 'persona necesita' : 'personas necesitan'}</Mark> lo que sabes hacer.</b>
            <Icon n="right" s={18} w={2} />
          </button>
        )}

        <button type="button" className="composer" onClick={() => abrirComposer()}>
          <span>¿Qué necesitas o qué ofreces?</span>
          <span className="plus"><Icon n="plus" s={18} w={2.4} /></span>
        </button>

        {!c.yo && <PrimerosPasos irTab={irTab} nav={nav} pedirPerfil={pedirPerfil} abrirComposer={abrirComposer} />}

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
            {lista.map((p) => <Post key={p.id} post={p} nav={nav} pedirPerfil={pedirPerfil} />)}
          </div>
        )}
        <div className="muro-fin">
          <b>No hay más publicaciones por ahora.</b>
          <p>Las publicaciones se ocultan solas cuando vencen. <button type="button" className="como-in" onClick={() => abrirAyuda()}>¿Cómo funciona?</button></p>
          <button type="button" className="btn ink sm" onClick={() => abrirComposer()}><Icon n="plus" s={16} w={2.4} />Publicar</button>
        </div>
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
<p className="reto-pts">El perfil ganador aparece 7 días en el inicio y recibe la insignia Destacado de la semana.</p>
      {completo && <p className="fine">Gana la propuesta con más votos Útil al cierre. En empate, quien participó primero. Se necesita al menos un voto.</p>}
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
    const url = `${location.origin}/?publicacion=${post.id}`
    const txt = post.tipo === 'need'
      ? `Estoy buscando ayuda con esto: “${post.texto}”. Si sabes de alguien, mi publicación está en Colmena: ${url}`
      : `Ofrezco esto: “${post.texto}”. Escríbeme por Colmena: ${url}`
    window.open(waLink('', txt), '_blank', 'noopener')
  }
  const alternarResuelta = async () => {
    try { await c.marcarResuelta(post.id, !resuelta); toast(resuelta ? 'Tu publicación está activa otra vez' : 'Marcaste la publicación como resuelta') } catch (e) { toast(e.message, true) }
  }

  const [borrando, setBorrando] = useState(false)
  const borrar = async () => {
    if (borrando) return
    if (!confirm('¿Borrar esta publicación?')) return
    setBorrando(true)
    try { await c.borrarPublicacion(post.id); toast('Publicación borrada') } catch (e) { toast(e.message, true) } finally { setBorrando(false) }
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
              <button type="button" className="iconbtn" onClick={borrar} disabled={borrando} aria-label={borrando ? 'Borrando publicación' : 'Borrar publicación'}><Icon n="trash" s={18} /></button>
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
  const clave = `colmena.borrador.publicacion.${c.sesion?.id || 'visitante'}`
  const [borrador] = useState(() => leerBorrador(clave, {}))
  const [tipo, setTipo] = useState(inicial.tipo || borrador.tipo || 'need')
  const [texto, setTexto] = useState(inicial.texto ?? borrador.texto ?? '')
  const [cats, setCats] = useState(inicial.cats ?? borrador.cats ?? [])
  const [dias, setDias] = useState(borrador.dias || 3)
  useEffect(() => { guardarBorrador(clave, { tipo, texto, cats, dias }) }, [clave, tipo, texto, cats, dias])
  const [enviando, setEnviando] = useState(false)
  const [err, setErr] = useState('')
  const toggle = (x) => setCats((l) => l.includes(x) ? l.filter((y) => y !== x) : l.length < 3 ? [...l, x] : l)
  const valido = texto.trim().length >= 5 && cats.length > 0

  const publicar = async () => {
    setErr(''); setEnviando(true)
    try { const id = await c.publicar(tipo, texto.trim(), cats, dias); borrarBorrador(clave); onDone(id) }
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

// Enlace compartido: conserva el contexto de la publicación, también para visitantes.
export function Publicacion({ id, onBack, nav, pedirPerfil }) {
  const c = useColmena()
  const post = c.publicaciones.find((p) => p.id === id)
  const [estado, setEstado] = useState(post ? 'listo' : 'cargando')
  const cargar = async () => {
    setEstado('cargando')
    try { await c.cargarPublicacion(id); setEstado('listo') } catch { setEstado('error') }
  }
  useEffect(() => { if (!post) cargar() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
  return <><SubHeader title="Publicación" onBack={onBack} /><div className="body fade">
    {post && activa(post) ? <Post post={post} nav={nav} pedirPerfil={pedirPerfil} />
      : estado === 'cargando' ? <Empty title="Cargando publicación…" />
      : estado === 'error' ? <Empty title="No pudimos cargar esta publicación" action={<button className="btn ink" onClick={cargar}>Reintentar</button>}>Revisa tu conexión e inténtalo otra vez.</Empty>
      : <Empty title="Esta publicación ya no está disponible">Puede haber vencido o su autor la borró.</Empty>}
  </div></>
}
