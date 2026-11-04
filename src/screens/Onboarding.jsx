import { useEffect, useRef, useState } from 'react'
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
const K_PRACTICA = 'colmena.practica-mano.v1'
const avisar = () => { try { window.dispatchEvent(new Event('colmena-pasos')) } catch { /* nada */ } }
export const marcarCalcAbierta = () => { guardar(K_CALC_ABIERTA, '1'); avisar() }
// Tocar "Puedo ayudar" en una publicación de ejemplo cuenta como práctica del paso "Dale una mano"
export const marcarPractica = () => { guardar(K_PRACTICA, '1'); avisar() }

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
          <span className="eyebrow">Te damos la bienvenida</span>
          <h1 className="intro-h">Ayuda entre emprendedores de DCV.</h1>
          <p className="intro-p">Colmena conecta a estudiantes de Diseño de la Javeriana que tienen un emprendimiento. Pides ayuda, ofreces lo que sabes y hablan por WhatsApp. Es gratis.</p>
        </section>

        <section className="intro-slide">
          <span className="eyebrow">Cómo funciona</span>
          <h1 className="intro-h">Tres pasos.</h1>
          <ol className="intro-pasos">
            <li><i><Icon n="plus" s={18} w={2.2} /></i><div><b>Publica lo que necesitas o lo que ofreces</b><span>Por ejemplo: alguien que revise tu logo o fotos para tu producto.</span></div></li>
            <li><i><Icon n="wa" s={18} /></i><div><b>Te escriben por WhatsApp</b><span>Quien puede ayudarte toca “Puedo ayudar” y te llega su mensaje.</span></div></li>
            <li><i><Icon n="hand" s={18} /></i><div><b>Confirmas que te ayudaron</b><span>Cada ayuda confirmada llena una celda del panal de la semana.</span></div></li>
          </ol>
        </section>

        <section className="intro-slide">
          <div className="intro-carnet">
            <span className="intro-carnet-top"><CeldaAbierta s={16} /> Colmena <em>Miembro</em></span>
            <span className="intro-carnet-hex">Tú</span>
            <span className="mono">COL-····</span>
          </div>
          <span className="eyebrow">Tu carnet</span>
          <h1 className="intro-h">Tu carnet es tu perfil.</h1>
          <p className="intro-p">Con él puedes publicar, escribirles a otros miembros y aparecer en el directorio. No necesitas correo ni contraseña.</p>
        </section>
      </div>

      <div className="intro-foot">
        <div className="mov-dots" aria-hidden="true">{[0, 1, 2].map((k) => <i key={k} className={k === i ? 'on' : ''} />)}</div>
        {ultimo && miembro ? (
          <button type="button" className="btn primary full big" onClick={onCerrar}>Entendido</button>
        ) : ultimo ? (
          <>
            <button type="button" className="btn primary full big" onClick={onCarnet}>Crear mi carnet</button>
            <button type="button" className="btn ghost full" onClick={onCerrar}>Explorar primero</button>
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
  const [, refrescar] = useState(0)
  useEffect(() => {
    const f = () => refrescar((n) => n + 1)
    window.addEventListener('colmena-pasos', f)
    return () => window.removeEventListener('colmena-pasos', f)
  }, [])
  const yo = c.yo
  const pasos = [
    { t: 'Crea tu carnet', d: 'Tu perfil en Colmena.', ok: !!yo, go: () => pedirPerfil(null, () => {}), cta: 'Crear' },
    { t: 'Publica lo que necesitas u ofreces', d: 'Lo que necesitas o lo que ofreces.', ok: !!yo && c.publicaciones.some((p) => p.autor_id === yo.id), go: () => abrirComposer(), cta: 'Publicar' },
    { t: 'Responde una publicación', d: 'Toca “Puedo ayudar” en una de ellas.', ok: leer(K_PRACTICA) === '1' || (!!yo && c.ayudas.some((a) => a.perfil_id === yo.id)), go: () => document.getElementById('lista')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), cta: 'Ver el muro' },
    { t: 'Calcula cuánto cobrar', d: 'Usa la calculadora de precios.', ok: leer(K_CALC_ABIERTA) === '1', go: () => nav({ t: 'calc' }), cta: 'Abrir' }
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
            <div><b>{p.t}</b>{!p.ok && <span>{p.d}</span>}</div>
            {!p.ok && <button type="button" className={'btn sm ' + (k === siguiente ? 'primary' : 'ghost')} onClick={p.go}>{p.cta}</button>}
          </li>
        ))}
      </ol>
    </section>
  )
}

// ---------- ¿Cómo funciona? Glosario en una hoja ----------
export const TEMAS = {
  muro: { t: 'El muro', d: 'Donde están todas las publicaciones. Cada una es un “Necesito” (alguien pide ayuda) o un “Ofrezco” (alguien ofrece lo que sabe hacer). Se ocultan solas cuando vencen.' },
  mano: { t: 'Responder', d: 'Al tocar “Puedo ayudar” o “Me interesa” se abre WhatsApp con un mensaje listo para esa persona. Después, quien publicó confirma si la ayuda se concretó.' },
  panal: { t: 'El panal', d: 'Muestra cuántas ayudas se confirmaron esta semana entre todos los miembros. Cada ayuda llena una celda y el panal se reinicia cada lunes.' },
  reto: { t: 'El reto de la semana', d: 'Un ejercicio corto con un caso real. Te inscribes, subes tu propuesta como link y los miembros votan con “Útil”.' },
  sirve: { t: 'Útil', d: 'Marca una publicación o propuesta que te parece valiosa. Le muestra a quien la publicó que su aporte sirve.' },
  carnet: { t: 'Tu carnet', d: 'Tu perfil en Colmena: quién eres, a qué te dedicas y cuántas veces has ayudado. Tu WhatsApp solo lo ven otros miembros.' },
  ejemplo: { t: 'Contenido de ejemplo', d: 'Lo marcado como “Ejemplo” es contenido de muestra para que veas cómo funciona. No son personas reales.' }
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
