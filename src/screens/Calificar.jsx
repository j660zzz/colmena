import { useState } from 'react'
import { useColmena } from '../lib/store'
import { CHIPS_CALIFICAR, PALABRA_ESTRELLAS } from '../data/contenido'
import { firstName } from '../lib/format'
import { partesDe } from '../lib/logic'
import { Icon, Hex, SubHeader, Empty, Stars, useToast } from '../components/ui'

export default function Calificar({ postId, otroId, onBack }) {
  const c = useColmena()
  const toast = useToast()
  const [n, setN] = useState(0)
  const [chips, setChips] = useState([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [revelada, setRevelada] = useState(undefined)
  const post = c.publicaciones.find((p) => p.id === postId)
  const otro = c.perfil(otroId)
  const pend = c.pendientes.calificar.find((x) => x.publicacion_id === postId && x.otro === otroId)
  if (!post || !otro) return <><SubHeader title="Calificar la mano" onBack={onBack} /><div className="body"><Empty title="No encontramos esta mano" /></div></>

  const yoAyude = c.yo && partesDe(post, post.autor_id === c.yo.id ? otroId : c.yo.id).ayuda === c.yo.id
  const toggle = (x) => setChips((l) => l.includes(x) ? l.filter((y) => y !== x) : [...l, x])

  const enviar = async () => {
    setEnviando(true)
    try {
      const r = await c.calificar(postId, otroId, n, chips, texto.trim())
      setRevelada(r || null)
      toast('Reseña publicada')
    } catch (e) { toast(e.message, true) } finally { setEnviando(false) }
  }

  if (revelada !== undefined) {
    return (
      <>
        <SubHeader title="Calificar la mano" onBack={onBack} />
        <div className="body fade">
          <div className="success">
            <span className="okhex"><Icon n="check" s={26} w={2.6} /></span>
            <h2>{revelada ? `Esto dijo ${firstName(otro.nombre)} de ti` : 'Listo, tu reseña quedó guardada'}</h2>
          </div>
          {revelada ? (
            <div className="voz big">
              <Stars n={revelada.estrellas} s={20} />
              {revelada.comentario && <p>“{revelada.comentario}”</p>}
              {revelada.chips?.length > 0 && <div className="post-tags">{revelada.chips.map((x) => <span key={x} className="tag">{x}</span>)}</div>}
            </div>
          ) : (
            <p className="soft center">Cuando {firstName(otro.nombre)} califique, se publican las dos y la ves en tu carnet. Si no lo hace en 7 días, la tuya se publica sola.</p>
          )}
          <button type="button" className="btn primary full big" onClick={onBack}>Volver a mi carnet</button>
        </div>
      </>
    )
  }

  return (
    <>
      <SubHeader title="Calificar la mano" onBack={onBack} />
      <div className="body fade">
        <div className="mini-post">
          <div className="who"><Hex p={otro} w={36} fs={13} /><span className="who-t"><b>{otro.nombre}</b><span>{yoAyude ? 'Le diste la mano' : 'Te dio la mano'} · {post.categorias[0] || 'Muro'}</span></span></div>
        </div>
        <h1 className="q">¿Cómo te fue con {firstName(otro.nombre)}?</h1>
        <div className="star-pick" role="radiogroup" aria-label="Calificación">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" role="radio" aria-checked={n === i} aria-label={`${i} de 5`} className={i <= n ? 'on' : ''} onClick={() => setN(i)}>
              <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.5 6 .8-4.4 4.1 1.1 6-5.3-2.9-5.3 2.9 1.1-6-4.4-4.1 6-.8L12 3.5Z" fill={i <= n ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
            </button>
          ))}
        </div>
        <p className="star-word">{PALABRA_ESTRELLAS[n] || 'Toca una estrella'}</p>
        <span className="lbl">¿Qué destacas?</span>
        <div className="chips wrap">{CHIPS_CALIFICAR.map((x) => <button key={x} type="button" className="chip" aria-pressed={chips.includes(x)} onClick={() => toggle(x)}>{x}</button>)}</div>
        <label className="lbl" htmlFor="cal-t">Cuéntale a la colmena <small>(opcional)</small></label>
        <div className="ta">
          <textarea id="cal-t" maxLength={140} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Una frase basta" />
          <span className="counter">{texto.length}/140</span>
        </div>
        <section className="ink-card">
          <div className="who"><span className="lockhex"><Icon n="lock" s={16} w={2} /></span>
            <p>{pend?.otro_califico ? <><b>{firstName(otro.nombre)} ya te calificó.</b> Califícalo para ver lo que dijo de ti.</> : <>Las dos reseñas se publican juntas. Así nadie califica por compromiso.</>}</p>
          </div>
        </section>
        <button type="button" className="btn primary full big" disabled={!n || enviando} onClick={enviar}>
          {enviando ? 'Publicando…' : pend?.otro_califico ? 'Publicar y ver lo que dijo de mí' : 'Publicar mi reseña'}
        </button>
      </div>
    </>
  )
}
