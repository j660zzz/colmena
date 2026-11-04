import { useEffect, useRef, useState } from 'react'
import { useColmena } from '../lib/store'
import { Icon, CeldaAbierta, Sheet } from '../components/ui'

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

// ---------- Bienvenida: un "pase" que se desbloquea al entrar ----------
// Cuatro pantallas cortas con movimiento al llegar a cada una. Las cifras salen de la base de datos.
const SLIDES = ['pase', 'muro', 'beneficios', 'carnet']
const OSCURA = { pase: true, muro: false, beneficios: false, carnet: true }

// Panal que se arma celda por celda (ilustración, no es el símbolo de marca)
const HEX7 = [[0, 0], [1, 0], [0.5, 0.866], [-0.5, 0.866], [-1, 0], [-0.5, -0.866], [0.5, -0.866]]
function PanalArma() {
  const r = 26, w = Math.sqrt(3) * r
  const hex = (cx, cy) => Array.from({ length: 6 }, (_, i) => {
    const a = (60 * i - 90) * Math.PI / 180
    return (cx + (r - 2) * Math.cos(a)).toFixed(1) + ',' + (cy + (r - 2) * Math.sin(a)).toFixed(1)
  }).join(' ')
  return (
    <svg className="intro-panal" viewBox="-90 -80 180 160" aria-hidden="true">
      {HEX7.map(([x, y], i) => (
        <polygon key={i} points={hex(x * w, y * w)} className={'ph a-pop' + (i === 0 ? ' yo' : '')} style={{ '--d': i === 0 ? 0 : i + 1 }} />
      ))}
      <text x="0" y="0" textAnchor="middle" dominantBaseline="central" className="ph-t a-pop" style={{ '--d': 1 }}>Tú</text>
    </svg>
  )
}

// Número que sube hasta su valor cuando la pantalla está a la vista
function Cuenta({ n, activo }) {
  const [v, setV] = useState(n)
  useEffect(() => {
    if (!activo) return
    let quieto = false
    try { quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { /* nada */ }
    if (quieto || n <= 1) { setV(n); return }
    let raf, t0
    const paso = (t) => {
      t0 = t0 || t
      const k = Math.min(1, (t - t0) / 700)
      setV(Math.round(n * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(paso)
    }
    setV(0)
    raf = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(raf)
  }, [n, activo])
  return <>{v}</>
}

export function Bienvenida({ onCarnet, onCerrar, miembro = false }) {
  const c = useColmena()
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
  const ultimo = i === SLIDES.length - 1
  const oscura = OSCURA[SLIDES[i]]

  const digitales = c.beneficios.filter((b) => b.tipo === 'digital')
  const nGratis = digitales.filter((b) => b.gratis).length
  const nDesc = digitales.length - nGratis
  const muestra = [...digitales.filter((b) => b.destacado), ...digitales.filter((b) => !b.destacado && b.gratis)].slice(0, 6)
  const on = (k) => (i === k ? ' on' : '')

  return (
    <div className={'intro' + (oscura ? ' oscura' : '')} role="dialog" aria-modal="true" aria-label="Bienvenida a Colmena">
      <div className="intro-top">
        <div className="intro-prog" aria-hidden="true">
          {SLIDES.map((s, k) => <i key={s} className={k < i ? 'ok' : k === i ? 'on' : ''} />)}
        </div>
        <div className="intro-bar">
          <span className="intro-logo"><CeldaAbierta s={20} color={oscura ? 'var(--polen)' : 'var(--ink)'} /> Colmena</span>
          {!ultimo && <button type="button" className="intro-saltar" onClick={onCerrar}>Saltar</button>}
        </div>
      </div>

      <div className="intro-pista" ref={pista} onScroll={alMover}>
        <section className={'intro-slide' + on(0)} aria-label="Acceso desbloqueado">
          <div className="intro-hero a-up" style={{ '--d': 0 }}><PanalArma /></div>
          <span className="eyebrow a-up" style={{ '--d': 2 }}>Acceso desbloqueado</span>
          <h1 className="intro-h a-up" style={{ '--d': 3 }}>Entraste a Colmena. <mark className="hl">Todo esto ya es tuyo.</mark></h1>
          <div className="pase a-up" style={{ '--d': 4 }}>
            <div className="pase-top"><b>Pase Colmena</b><span>Incluido</span></div>
            <ul>
              <li className="a-up" style={{ '--d': 5 }}><i><Icon n="users" s={16} /></i><div><b>Gente que sabe lo que tú no</b><span>Emprendedores de DCV que te ayudan y a quienes ayudas.</span></div></li>
              <li className="a-up" style={{ '--d': 6 }}><i><Icon n="seal" s={16} /></i><div><b>{digitales.length > 0 ? `${digitales.length} beneficios de estudiante` : 'Beneficios de estudiante'}</b><span>Software y suscripciones gratis o con descuento.</span></div></li>
              <li className="a-up" style={{ '--d': 7 }}><i><Icon n="cal" s={16} /></i><div><b>Un encuentro al mes</b><span>En persona, para conocerse y aprender a cobrar.</span></div></li>
              <li className="a-up" style={{ '--d': 8 }}><i><Icon n="tools" s={16} /></i><div><b>Herramientas para cobrar bien</b><span>Calculadora de precios y fichas prácticas.</span></div></li>
            </ul>
            <div className="pase-precio"><span>Lo que pagas</span><b className="mono">$0</b></div>
          </div>
        </section>

        <section className={'intro-slide' + on(1)} aria-label="Cómo funciona el muro">
          <div className="demo">
            <div className="demo-post a-left" style={{ '--d': 0 }}>
              <span className="pill need">Necesito</span><span className="ejemplo">Ejemplo</span>
              <p>Busco quien me revise el logo antes de imprimir.</p>
            </div>
            <div className="demo-post a-right" style={{ '--d': 2 }}>
              <span className="pill offer">Ofrezco</span><span className="ejemplo">Ejemplo</span>
              <p>Hago fotos de producto con fondo blanco.</p>
            </div>
            <div className="demo-wa a-pop" style={{ '--d': 5 }}><Icon n="wa" s={16} />Hola, te vi en Colmena. ¡Puedo ayudarte!</div>
          </div>
          <span className="eyebrow a-up" style={{ '--d': 3 }}>Ayuda cuando la necesitas</span>
          <h1 className="intro-h a-up" style={{ '--d': 4 }}>Pide ayuda. Ofrece lo que sabes.</h1>
          <p className="intro-p a-up" style={{ '--d': 5 }}>Publicas en el muro y quien sabe hacerlo te escribe por WhatsApp. Sin intermediarios y sin comisiones.</p>
        </section>

        <section className={'intro-slide' + on(2)} aria-label="Beneficios de estudiante">
          {digitales.length > 0 && (
            <div className="ben-cifras a-up" style={{ '--d': 0 }}>
              <span><b><Cuenta n={nGratis} activo={i === 2} /></b>gratis</span>
              <span><b><Cuenta n={nDesc} activo={i === 2} /></b>con descuento</span>
            </div>
          )}
          <span className="eyebrow a-up" style={{ '--d': 1 }}>Beneficios desbloqueados</span>
          <h1 className="intro-h a-up" style={{ '--d': 2 }}>Lo que ya tienes por ser estudiante y quizás no usas.</h1>
          {muestra.length > 0 && (
            <div className="ben-mini">
              {muestra.map((b, k) => (
                <span key={b.id} className={'a-pop ' + (k % 3 === 1 ? 'b' : 'n')} style={{ '--d': k + 3 }}>
                  <em>{b.etiqueta || 'Beneficio'}</em><b>{b.nombre}</b>
                </span>
              ))}
            </div>
          )}
          <p className="intro-p a-up" style={{ '--d': 9 }}>Te decimos cómo activar cada uno, paso a paso.</p>
        </section>

        <section className={'intro-slide' + on(3)} aria-label="Tu carnet">
          <div className="intro-carnet a-rise" style={{ '--d': 0 }}>
            <span className="intro-carnet-top"><CeldaAbierta s={16} /> Colmena <em>Miembro</em></span>
            <div className="intro-carnet-mid">
              <span className="intro-carnet-av">
                <span className="intro-carnet-hex">Tú</span>
                <svg className="nivel-dibuja" viewBox="0 0 100 100" aria-hidden="true">
                  <polygon points="50,2 91.6,26 91.6,74 50,98 8.4,74 8.4,26" pathLength="6" />
                </svg>
              </span>
              <span className="intro-carnet-t"><b>Tu nombre</b><span>Tu emprendimiento</span><small>Tu celda se va cerrando</small></span>
            </div>
            <span className="mono">COL-····</span>
          </div>
          <span className="eyebrow a-up" style={{ '--d': 3 }}>Tu carnet de miembro</span>
          <h1 className="intro-h a-up" style={{ '--d': 4 }}>Tu carnet te abre todas las puertas.</h1>
          <p className="intro-p a-up" style={{ '--d': 5 }}>Con él publicas, escribes a otros miembros y usas los descuentos de aliados. Cada ayuda cierra un lado de tu celda y subes de nivel. Sin correo ni contraseña: lo creas en un minuto.</p>
        </section>
      </div>

      <div className="intro-foot">
        {ultimo && miembro ? (
          <button type="button" className="btn primary full big" onClick={onCerrar}>Entendido</button>
        ) : ultimo ? (
          <>
            <button type="button" className="btn primary full big" onClick={onCarnet}>Activar mi carnet gratis</button>
            <button type="button" className="btn outline-w full" onClick={onCerrar}>Explorar primero</button>
          </>
        ) : (
          <button type="button" className={'btn full big ' + (oscura ? 'primary' : 'ink')} onClick={() => ir(i + 1)}>
            {i === 0 ? 'Ver qué incluye' : 'Siguiente'}<Icon n="right" s={18} w={2.2} />
          </button>
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
  const [todos, setTodos] = useState(false)
  useEffect(() => {
    const f = () => refrescar((n) => n + 1)
    window.addEventListener('colmena-pasos', f)
    return () => window.removeEventListener('colmena-pasos', f)
  }, [])
  const yo = c.yo
  const pasos = [
    { t: 'Crea tu carnet', d: 'Tu perfil en Colmena.', ok: !!yo, go: () => pedirPerfil(null, () => {}), cta: 'Crear' },
    { t: 'Publica lo que necesitas u ofreces', d: 'Una frase corta es suficiente.', ok: !!yo && c.publicaciones.some((p) => p.autor_id === yo.id), go: () => abrirComposer(), cta: 'Publicar' },
    { t: 'Responde una publicación', d: 'Toca “Puedo ayudar” en una de ellas.', ok: leer(K_PRACTICA) === '1' || (!!yo && c.ayudas.some((a) => a.perfil_id === yo.id)), go: () => document.getElementById('lista')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), cta: 'Ver el muro' },
    { t: 'Calcula cuánto cobrar', d: 'Usa la calculadora de precios.', ok: leer(K_CALC_ABIERTA) === '1', go: () => nav({ t: 'calc' }), cta: 'Abrir' }
  ]
  const hechos = pasos.filter((p) => p.ok).length
  if (oculto || hechos === pasos.length) return null
  const siguiente = pasos.findIndex((p) => !p.ok)
  const ocultar = () => { guardar(K_PASOS, '1'); setOculto(true) }

  const sig = pasos[siguiente]
  return (
    <>
      <button type="button" className="pasos-fila" onClick={() => setTodos(true)} aria-label={`Primeros pasos, ${hechos} de ${pasos.length}. Siguiente: ${sig.t}`}>
        <span className="pasos-anillo" aria-hidden="true">
          <svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" className="pa-f" /><circle cx="18" cy="18" r="15" className="pa-o" pathLength="100" style={{ strokeDasharray: `${hechos / pasos.length * 100} 100` }} /></svg>
          <b>{hechos}/{pasos.length}</b>
        </span>
        <span className="pasos-t"><small>Siguiente paso</small><b>{sig.t}</b></span>
        <Icon n="right" s={18} w={2} />
      </button>
      <Sheet open={todos} onClose={() => setTodos(false)} label="Tus primeros pasos">
        {todos && (
          <section className="pasos" aria-label="Tus primeros pasos">
            <div className="pasos-top">
              <div><span className="k">Primeros pasos</span><b>{hechos} de {pasos.length} listos</b></div>
            </div>
            <div className="prog"><i style={{ width: `${hechos / pasos.length * 100}%` }} /></div>
            <ol>
              {pasos.map((p, k) => (
                <li key={p.t} className={p.ok ? 'ok' : k === siguiente ? 'now' : ''}>
                  <span className="paso-n">{p.ok ? <Icon n="check" s={14} w={3} /> : k + 1}</span>
                  <div><b>{p.t}</b>{!p.ok && <span>{p.d}</span>}</div>
                  {!p.ok && <button type="button" className={'btn sm ' + (k === siguiente ? 'primary' : 'ghost')} onClick={() => { setTodos(false); setTimeout(p.go, 0) }}>{p.cta}</button>}
                </li>
              ))}
            </ol>
            <button type="button" className="linkbtn" onClick={() => { setTodos(false); ocultar() }}>Ocultar estos pasos</button>
          </section>
        )}
      </Sheet>
    </>
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
  nivel: { t: 'Tu nivel', d: 'Subes de nivel cuando ayudas a otros miembros, participas en los retos y vas a los encuentros. Cada nivel cierra un lado de tu celda. No pierdes nada si no subes: todo funciona desde el nivel 1.' },
  beneficios: { t: 'Beneficios', d: 'Software y suscripciones que ya tienes gratis o con descuento por ser estudiante de la Javeriana, y negocios de Cali que dan descuento al mostrar tu carnet.' },
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
