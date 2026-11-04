import { useRef, useState } from 'react'
import { useColmena } from '../lib/store'
import { Icon, Panal, CeldaAbierta } from '../components/ui'

// ---------- Recordar qué ya vio cada persona (solo en este navegador) ----------
const leer = (k) => { try { return localStorage.getItem(k) } catch { return null } }
const guardar = (k, v) => { try { localStorage.setItem(k, v) } catch { /* modo privado */ } }

const K_INTRO = 'colmena.intro.v1'
const K_PASOS = 'colmena.pasos-ocultos.v1'
export const K_CALC_ABIERTA = 'colmena.calc-abierta.v1'

export const introVista = () => leer(K_INTRO) === '1'
export const marcarIntroVista = () => guardar(K_INTRO, '1')
export const marcarCalcAbierta = () => guardar(K_CALC_ABIERTA, '1')

// ---------- Bienvenida: 3 pantallas la primera vez ----------
const DEMO = [' ', ' ', ' ', ' ', ' ', ' ', ' ']

export function Bienvenida({ onCarnet, onCerrar, miembro = false }) {
  const [i, setI] = useState(0)
  const pista = useRef(null)
  const ir = (n) => {
    const el = pista.current
    if (el) el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' })
    setI(n)
  }
  const alMover = () => {
    const el = pista.current
    if (el) setI(Math.round(el.scrollLeft / el.clientWidth))
  }
  const ultimo = i === 2

  return (
    <div className="intro" role="dialog" aria-modal="true" aria-label="Bienvenida a Colmena">
      <div className="intro-top">
        <span className="intro-logo"><CeldaAbierta s={22} /> Colmena</span>
        {!ultimo && <button type="button" className="linkbtn" onClick={onCerrar}>Saltar</button>}
      </div>

      <div className="intro-pista" ref={pista} onScroll={alMover}>
        <section className="intro-slide">
          <div className="intro-art"><Panal celdas={DEMO} size={24} /></div>
          <span className="eyebrow">Bienvenido a Colmena</span>
          <h1 className="intro-h">La red de los que emprenden en DCV.</h1>
          <p className="intro-p">Aquí pides ayuda para tu emprendimiento y le das una mano a otros estudiantes de Diseño de la Javeriana. Entre pares y sin costo.</p>
        </section>

        <section className="intro-slide">
          <span className="eyebrow">Así funciona</span>
          <h1 className="intro-h">Tres pasos, nada más.</h1>
          <ol className="intro-pasos">
            <li><i><Icon n="plus" s={18} w={2.2} /></i><div><b>Publica lo que necesitas o lo que ofreces</b><span>Un logo, fotos de producto, una imprenta barata. Cabe en una frase.</span></div></li>
            <li><i><Icon n="wa" s={18} /></i><div><b>Alguien te escribe por WhatsApp</b><span>Quien puede ayudarte toca “Puedo ayudar” y te llega su mensaje.</span></div></li>
            <li><i><Icon n="hand" s={18} /></i><div><b>Confirmas que se dio la mano</b><span>Cada ayuda confirmada llena una celda del panal de la semana.</span></div></li>
          </ol>
        </section>

        <section className="intro-slide">
          <div className="intro-carnet">
            <span className="intro-carnet-top"><CeldaAbierta s={16} /> Colmena <em>Miembro</em></span>
            <span className="intro-carnet-hex">Tú</span>
            <span className="mono">COL-····</span>
          </div>
          <span className="eyebrow">Tu carnet</span>
          <h1 className="intro-h">Es tu entrada a la colmena.</h1>
          <p className="intro-p">Con él publicas, le escribes a otros y te encuentran por lo que sabes hacer. Sin contraseñas, en menos de un minuto.</p>
        </section>
      </div>

      <div className="intro-foot">
        <div className="mov-dots" aria-hidden="true">{[0, 1, 2].map((k) => <i key={k} className={k === i ? 'on' : ''} />)}</div>
        {ultimo && miembro ? (
          <button type="button" className="btn primary full big" onClick={onCerrar}>Entendido</button>
        ) : ultimo ? (
          <>
            <button type="button" className="btn primary full big" onClick={onCarnet}>Sacar mi carnet</button>
            <button type="button" className="btn ghost full" onClick={onCerrar}>Primero quiero mirar</button>
          </>
        ) : (
          <button type="button" className="btn ink full big" onClick={() => ir(i + 1)}>Siguiente</button>
        )}
      </div>
    </div>
  )
}

// ---------- Primeros pasos: lista que se tacha sola ----------
export function PrimerosPasos({ irTab, nav, pedirPerfil, abrirComposer }) {
  const c = useColmena()
  const [oculto, setOculto] = useState(() => leer(K_PASOS) === '1')
  const yo = c.yo
  const pasos = [
    { t: 'Saca tu carnet', d: 'Tu identidad en la colmena.', ok: !!yo, go: () => pedirPerfil(null, () => {}), cta: 'Sacar' },
    { t: 'Publica lo que necesitas u ofreces', d: 'Una frase basta.', ok: !!yo && c.publicaciones.some((p) => p.autor_id === yo.id), go: () => abrirComposer(), cta: 'Publicar' },
    { t: 'Dale una mano a alguien', d: 'Toca “Puedo ayudar” en un Necesito.', ok: !!yo && c.ayudas.some((a) => a.perfil_id === yo.id), go: () => document.getElementById('lista')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), cta: 'Ver el muro' },
    { t: 'Calcula cuánto cobrar', d: 'La calculadora te da un precio.', ok: leer(K_CALC_ABIERTA) === '1', go: () => nav({ t: 'calc' }), cta: 'Abrir' }
  ]
  const hechos = pasos.filter((p) => p.ok).length
  if (oculto || hechos === pasos.length) return null
  const siguiente = pasos.findIndex((p) => !p.ok)
  const ocultar = () => { guardar(K_PASOS, '1'); setOculto(true) }

  return (
    <section className="pasos" aria-label="Tus primeros pasos">
      <div className="pasos-top">
        <div>
          <span className="k">Tus primeros pasos</span>
          <b>{hechos} de {pasos.length}</b>
        </div>
        <button type="button" className="linkbtn" onClick={ocultar}>Ocultar</button>
      </div>
      <div className="prog"><i style={{ width: `${hechos / pasos.length * 100}%` }} /></div>
      <ol>
        {pasos.map((p, k) => (
          <li key={p.t} className={p.ok ? 'ok' : k === siguiente ? 'now' : ''}>
            <span className="paso-n">{p.ok ? <Icon n="check" s={14} w={3} /> : k + 1}</span>
            <div><b>{p.t}</b>{k === siguiente && <span>{p.d}</span>}</div>
            {k === siguiente && <button type="button" className="btn primary sm" onClick={p.go}>{p.cta}</button>}
          </li>
        ))}
      </ol>
    </section>
  )
}

// ---------- ¿Cómo funciona? Glosario en una hoja ----------
export const TEMAS = {
  muro: { t: 'El muro', d: 'Es el centro de Colmena. Cada publicación es un Necesito (pides ayuda) o un Ofrezco (ofreces lo que sabes hacer). Vencen solas para que el muro esté siempre fresco.' },
  mano: { t: 'Dar una mano', d: 'Cuando tocas “Puedo ayudar” o “Me interesa”, se abre WhatsApp con un mensaje listo para esa persona. Después, quien publicó confirma si se dio la mano.' },
  panal: { t: 'El panal', d: 'Cada mano confirmada llena una celda. El panal es de toda la colmena y se reinicia cada lunes: mide cuánto nos ayudamos esta semana.' },
  reto: { t: 'El reto de la semana', d: 'Un ejercicio corto para practicar con un caso real. Te le mides, subes tu propuesta como link y la colmena vota con “Me sirve”.' },
  sirve: { t: 'Me sirve', d: 'Es como guardar o apoyar una publicación. Le muestra a quien publicó que su aporte es útil.' },
  carnet: { t: 'Tu carnet', d: 'Tu identidad en la colmena: quién eres, qué haces y las manos que has dado. Tu WhatsApp solo lo ven miembros con carnet.' },
  ejemplo: { t: 'Contenido de ejemplo', d: 'Lo que dice “Ejemplo” es de muestra para que veas cómo funciona. No son personas reales.' }
}

export function Ayuda({ tema, onIntro }) {
  const orden = tema ? [tema, ...Object.keys(TEMAS).filter((k) => k !== tema)] : Object.keys(TEMAS)
  return (
    <div className="ayuda">
      <h2>¿Cómo funciona?</h2>
      <dl>
        {orden.map((k) => (
          <div key={k} className={k === tema ? 'on' : ''}>
            <dt>{TEMAS[k].t}</dt>
            <dd>{TEMAS[k].d}</dd>
          </div>
        ))}
      </dl>
      <button type="button" className="btn ghost full" onClick={onIntro}>Ver la bienvenida otra vez</button>
    </div>
  )
}
