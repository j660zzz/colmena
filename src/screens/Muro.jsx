import { useMemo, useState } from 'react'
import { useColmena } from '../lib/store'
import { CATS } from '../data/contenido'
import { hace, firstName, igUrl } from '../lib/format'
import { Icon, Hex, Ejemplo, BrandHeader, Sheet, Empty, useToast } from '../components/ui'

export default function Muro({ nav, pedirPerfil, headerRight }) {
  const c = useColmena()
  const toast = useToast()
  const [tipo, setTipo] = useState('todo')
  const [cats, setCats] = useState([])
  const [composer, setComposer] = useState(false)
  const [ayudantesDe, setAyudantesDe] = useState(null)

  const reales = c.perfiles.filter((p) => !p.es_ejemplo)
  const lista = useMemo(() => c.publicaciones.filter((p) => {
    if (tipo !== 'todo' && p.tipo !== tipo) return false
    if (cats.length && !p.categorias.some((x) => cats.includes(x))) return false
    return true
  }), [c.publicaciones, tipo, cats])

  const abrirComposer = () => pedirPerfil('Para publicar en el muro necesitas tu carnet.', () => setComposer(true))
  const toggleCat = (x) => setCats((l) => l.includes(x) ? l.filter((y) => y !== x) : [...l, x])

  const ultimos = reales.slice(0, 5)

  return (
    <>
      <BrandHeader right={headerRight} />
      <div className="body muro-body">
        <div className="muro-intro">
          <p className="eyebrow">Muro · DCV Javeriana</p>
          <h1>Entre todos.</h1>
        <button type="button" className="composer" onClick={abrirComposer}>
          <span>¿Qué necesitas o qué ofreces?</span>
          <span className="plus"><Icon n="plus" s={18} w={2.2} /></span>
        </button>
        </div>

        {ultimos.length > 0 && (
          <div className="pulse">
            <div className="stack">{ultimos.map((p) => <Hex key={p.id} p={p} w={26} fs={10} />)}</div>
            <p>
              <b>{ultimos.slice(0, 2).map((p) => firstName(p.nombre)).join(', ')}</b>
              {reales.length > 2 ? ` y ${reales.length - 2} más ya están en la colmena` : reales.length === 1 ? ' ya está en la colmena' : ' ya están en la colmena'}
            </p>
          </div>
        )}

        <div className="muro-filters">
        <div className="segbar" role="group" aria-label="Tipo de publicación">
          {[['todo', 'Todo'], ['need', 'Necesito'], ['offer', 'Ofrezco']].map(([k, t]) => (
            <button key={k} type="button" aria-pressed={tipo === k} onClick={() => setTipo(k)}>{t}</button>
          ))}
        </div>
        <details className="category-filter">
          <summary>Filtrar{cats.length > 0 && <span className="filter-count">{cats.length}</span>}</summary>
          <div className="category-options">
          <p className="lbl">Por categoría</p>
          <div className="chips wrap" role="group" aria-label="Categorías">
          {CATS.map((x) => <button key={x} type="button" className="chip" aria-pressed={cats.includes(x)} onClick={() => toggleCat(x)}>{x}</button>)}
          </div>
          {cats.length > 0 && <button type="button" className="linkbtn" onClick={() => setCats([])}>Quitar categorías</button>}
          </div>
        </details>
        </div>
        <p className="sr" aria-live="polite">{lista.length} de {c.publicaciones.length} publicaciones</p>

        {lista.length === 0 ? (
          <Empty title="Nada por aquí todavía"
            action={(tipo !== 'todo' || cats.length > 0)
              ? <button type="button" className="btn ghost sm" onClick={() => { setTipo('todo'); setCats([]) }}>Quitar filtros</button>
              : <button type="button" className="btn primary sm" onClick={abrirComposer}>Publicar lo primero</button>}>
            {(tipo !== 'todo' || cats.length > 0) ? 'Con estos filtros no hay publicaciones.' : 'Sé el primero en contar qué necesitas o qué ofreces.'}
          </Empty>
        ) : (
          <div className="rowlist muro-posts">
            {lista.map((p, i) => (
              <div key={p.id}>
                {i > 0 && <div className="divider" />}
                <Post post={p} nav={nav} pedirPerfil={pedirPerfil} onVerAyudantes={() => setAyudantesDe(p.id)} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={composer} onClose={() => setComposer(false)} label="Publicar en el muro">
        <Composer onDone={(msg) => { setComposer(false); toast(msg) }} />
      </Sheet>

      <Sheet open={!!ayudantesDe} onClose={() => setAyudantesDe(null)} label="Quiénes pueden ayudarte">
        <Ayudantes postId={ayudantesDe} nav={(n) => { setAyudantesDe(null); nav(n) }} />
      </Sheet>
    </>
  )
}

function Post({ post, nav, pedirPerfil, onVerAyudantes }) {
  const c = useColmena()
  const toast = useToast()
  const autor = c.perfil(post.autor_id)
  const mio = c.yo && post.autor_id === c.yo.id
  const n = c.ayudas.filter((a) => a.publicacion_id === post.id).length
  const yaAyudo = c.yo && c.ayudas.some((a) => a.publicacion_id === post.id && a.perfil_id === c.yo.id)
  const cta = post.tipo === 'need' ? 'Puedo ayudar' : 'Me interesa'

  const ayudar = () => pedirPerfil('Para responder necesitas tu carnet.', async () => {
    try {
      const on = await c.alternarAyuda(post.id)
      if (on) toast(autor?.es_ejemplo ? 'Listo. Ojo: esta publicación es de ejemplo.' : `${firstName(autor?.nombre)} verá que puedes ayudar`)
    } catch (e) { toast(e.message, true) }
  })

  const borrar = async () => {
    if (!confirm('¿Borrar esta publicación?')) return
    try { await c.borrarPublicacion(post.id); toast('Publicación borrada') } catch (e) { toast(e.message, true) }
  }

  return (
    <article className="post">
      <div className="post-top">
        <button type="button" className="post-avatar" onClick={() => autor && nav({ t: 'carnet', id: autor.id })} aria-label={`Ver carnet de ${autor?.nombre}`}><span className="avatar-frame"><Hex p={autor} w={44} h={48} fs={16} /></span></button>
        <button type="button" className="who" onClick={() => autor && nav({ t: 'carnet', id: autor.id })}>
          <b>{autor?.nombre || 'Miembro'}<Ejemplo p={autor} /></b>
          <span>{[autor?.marca, autor?.rol].filter(Boolean).join(' · ')}</span>
        </button>
      </div>
      <div className="post-meta">
      <span className={'pill ' + post.tipo}>{post.tipo === 'need' ? 'Necesito' : 'Ofrezco'}</span>
      <span className="when">{hace(post.created_at)}</span>
      </div>
      <p>{post.texto}</p>
      <div className="post-foot">
        <div className="post-cats">{post.categorias.map((t) => <span key={t} className="tag">{t}</span>)}</div>
        {mio ? (
          <>
            <button type="button" className="helpbtn" onClick={onVerAyudantes} disabled={!n}>
              <Icon n="users" s={17} />{n ? `${n} ${n === 1 ? 'persona puede' : 'personas pueden'} ${post.tipo === 'need' ? 'ayudarte' : 'interesarse'}` : 'Aún sin respuestas'}
            </button>
            <button type="button" className="iconbtn" onClick={borrar} aria-label="Borrar publicación"><Icon n="trash" s={18} /></button>
          </>
        ) : (
          <button type="button" className="helpbtn" aria-pressed={!!yaAyudo} onClick={ayudar}>
            <Icon n={yaAyudo ? 'check' : post.tipo === 'need' ? 'hand' : 'right'} s={17} w={yaAyudo ? 2.1 : 1.6} />{yaAyudo ? 'Listo' : cta}{n > 0 && <span className="c">{n}</span>}
          </button>
        )}
      </div>
      {yaAyudo && !mio && autor?.instagram && !autor.es_ejemplo && (
        <a className="contact" href={igUrl(autor.instagram)} target="_blank" rel="noopener noreferrer">
          <Icon n="ig" s={18} /><span>Escríbele a @{autor.instagram}</span><Icon n="right" s={16} />
        </a>
      )}
    </article>
  )
}

function Composer({ onDone }) {
  const c = useColmena()
  const toast = useToast()
  const [tipo, setTipo] = useState('need')
  const [texto, setTexto] = useState('')
  const [cats, setCats] = useState([])
  const [enviando, setEnviando] = useState(false)
  const toggle = (x) => setCats((l) => l.includes(x) ? l.filter((y) => y !== x) : l.length < 3 ? [...l, x] : l)

  const publicar = async () => {
    setEnviando(true)
    try { await c.publicar(tipo, texto.trim(), cats); onDone('Publicado. La colmena ya lo está viendo.') }
    catch (e) { toast(e.message, true) }
    finally { setEnviando(false) }
  }

  return (
    <>
      <h3>Publicar en el muro</h3>
      <p className="sheet-sub">Lo que publiques lo ven todos los miembros al instante.</p>
      <div className="segbar" role="group" aria-label="Tipo">
        <button type="button" aria-pressed={tipo === 'need'} onClick={() => setTipo('need')}>Necesito</button>
        <button type="button" aria-pressed={tipo === 'offer'} onClick={() => setTipo('offer')}>Ofrezco</button>
      </div>
      <div className="gap-16" />
      <label className="lbl" htmlFor="dx">{tipo === 'need' ? '¿Qué necesitas?' : '¿Qué ofreces?'}</label>
      <div className="gap-8" />
      <textarea id="dx" maxLength={500} value={texto} onChange={(e) => setTexto(e.target.value)} ref={(el) => { if (el && !el.dataset.f) { el.dataset.f = 1; setTimeout(() => el.focus({ preventScroll: true }), 320) } }}
        placeholder={tipo === 'need' ? 'Sé concreto: qué, para cuándo y si hay presupuesto.' : 'Di qué haces, para quién y en qué condiciones.'} />
      <div className="counter">{texto.length}/500</div>
      <span className="lbl">Categoría <span>(hasta 3)</span></span>
      <div className="gap-8" />
      <div className="chips wrap">
        {CATS.map((x) => <button key={x} type="button" className="chip" aria-pressed={cats.includes(x)} onClick={() => toggle(x)}>{x}</button>)}
      </div>
      <div className="gap-24" />
      <button type="button" className="btn primary full" disabled={texto.trim().length < 5 || enviando} onClick={publicar}>
        {enviando ? 'Publicando…' : 'Publicar'}
      </button>
    </>
  )
}

function Ayudantes({ postId, nav }) {
  const c = useColmena()
  const gente = c.ayudas.filter((a) => a.publicacion_id === postId).map((a) => c.perfil(a.perfil_id)).filter(Boolean)
  return (
    <>
      <h3>Quiénes respondieron</h3>
      <p className="sheet-sub">Abre su carnet para ver qué hacen y escribirles.</p>
      <div className="rowlist">
        {gente.map((p, i) => (
          <div key={p.id}>
            {i > 0 && <div className="divider" />}
            <button type="button" className="mrow" onClick={() => nav({ t: 'carnet', id: p.id })}>
              <Hex p={p} w={40} />
                  <div className="info"><b>{p.nombre}<Ejemplo p={p} /></b><span>{[p.rol, p.marca].filter(Boolean).join(' · ')}</span></div>
              <Icon n="right" s={18} />
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
