import { useEffect, useRef, useState } from 'react'
import { useColmena } from '../lib/store'
import { Icon, CeldaAbierta, Sheet } from '../components/ui'
import { CobroLista, CobroIconos } from '../components/Cobro'

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

// ---------- Bienvenida: historias cortas ----------
// Cada pantalla avanza sola (como las historias de Instagram): tocar a la derecha adelanta, a la izquierda
// devuelve y mantener presionado pausa. Con reduced-motion no avanza sola. Las cifras salen de la base de datos.
const SLIDES = [
  { k: 'que', dur: 5000, oscura: true },
  { k: 'muro', dur: 9000, oscura: false },
  { k: 'talleres', dur: 6000, oscura: false },
  { k: 'beneficios', dur: 5000, oscura: false },
  { k: 'carnet', dur: 0, oscura: true }
]

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
      const k = Math.min(1, (t - t0) / 600)
      setV(Math.round(n * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(paso)
    }
    setV(0)
    raf = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(raf)
  }, [n, activo])
  return <>{v}</>
}

// Demo del muro: alguien pide, otro toca "Puedo ayudar" y se abre el chat; luego lo mismo con Ofrezco
function DemoMuro({ activo, pausa, quieto }) {
  const [paso, setPaso] = useState(0)
  useEffect(() => {
    if (!activo) { setPaso(0); return }
    if (quieto) { setPaso(0); return }
    if (pausa) return
    const t = setTimeout(() => setPaso((p) => (p + 1) % 6), paso === 5 ? 1800 : 1400)
    return () => clearTimeout(t)
  }, [activo, pausa, paso, quieto])
  const ofrezco = paso >= 3
  const fase = paso % 3 // 0: publicación, 1: toca el botón, 2: chat
  const x = ofrezco
    ? { tipo: 'offer', pill: 'Ofrezco', ic: 'spark', quien: 'Camila', texto: 'Hago fotos de producto con fondo blanco.', boton: 'Me interesa', chat: 'Hola Camila, me interesan las fotos para mi tienda.', dice: 'Ofreces lo que sabes hacer' }
    : { tipo: 'need', pill: 'Necesito', ic: 'hand', quien: 'Sara', texto: 'Necesito que alguien me revise el logo antes de imprimir.', boton: 'Puedo ayudar', chat: 'Hola Sara, te vi en Colmena. Puedo revisarte el logo.', dice: 'Pides ayuda' }
  return (
    <div className="demo2" aria-hidden="true">
      <div className="demo2-tabs"><span className={!ofrezco ? 'on' : ''}>Necesito</span><span className={ofrezco ? 'on' : ''}>Ofrezco</span></div>
      <div className="demo2-dice" key={'d' + ofrezco}>{x.dice}</div>
      <div className={'demo2-post ' + x.tipo} key={'p' + ofrezco}>
        <div className="demo2-top"><span className="demo2-av">{x.quien[0]}</span><b>{x.quien}</b><span className="ejemplo">Ejemplo</span><span className={'pill ' + x.tipo}><Icon n={x.ic} s={12} w={2} />{x.pill}</span></div>
        <p>{x.texto}</p>
        <span className={'demo2-btn' + (fase >= 1 ? ' toca' : '')}><Icon n="wa" s={15} />{x.boton}</span>
      </div>
      <div className={'demo2-chat' + (fase === 2 ? ' on' : '')}><Icon n="wa" s={15} /><span>{x.chat}</span></div>
    </div>
  )
}

export function Bienvenida({ onCarnet, onCerrar, miembro = false }) {
  const c = useColmena()
  const [i, setI] = useState(0)
  const [pausa, setPausa] = useState(false)
  const [quieto] = useState(() => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false } })
  const dialogo = useRef(null)
  const toque = useRef({ x: 0, t: 0 })
  // El fondo no recibe foco ni toques mientras se muestra la bienvenida.
  useEffect(() => {
    const el = dialogo.current
    const anterior = document.activeElement
    const originales = new Map()
    const aislar = () => {
      for (const hermano of el.parentElement.children) {
        if (hermano === el) continue
        if (!originales.has(hermano)) originales.set(hermano, hermano.inert)
        hermano.inert = true
      }
    }
    aislar()
    const observer = new MutationObserver(aislar)
    observer.observe(el.parentElement, { childList: true })
    el.querySelector('button')?.focus({ preventScroll: true })
    return () => {
      observer.disconnect()
      originales.forEach((valor, hermano) => { hermano.inert = valor })
      if (anterior?.isConnected) anterior.focus({ preventScroll: true })
    }
  }, [])
  const confinarFoco = (e) => {
    if (e.key !== 'Tab') return
    const botones = [...dialogo.current.querySelectorAll('button, a[href]')].filter((el) => el.checkVisibility() && !el.disabled)
    const primero = botones[0], ultimo = botones[botones.length - 1]
    if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo?.focus() }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero?.focus() }
  }
  const total = SLIDES.length
  const ultimo = i === total - 1
  const actual = SLIDES[i]
  const ir = (n) => setI(Math.max(0, Math.min(total - 1, n)))

  // Avance automático
  useEffect(() => {
    if (quieto || pausa || !actual.dur) return
    const t = setTimeout(() => ir(i + 1), actual.dur)
    return () => clearTimeout(t)
  }, [i, pausa, quieto]) // eslint-disable-line react-hooks/exhaustive-deps
  // Pausa si la app pasa a segundo plano
  useEffect(() => {
    const vis = () => setPausa(document.visibilityState !== 'visible')
    document.addEventListener('visibilitychange', vis)
    return () => document.removeEventListener('visibilitychange', vis)
  }, [])
  useEffect(() => {
    const tecla = (e) => { if (e.key === 'ArrowRight') ir(i + 1); if (e.key === 'ArrowLeft') ir(i - 1) }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [i]) // eslint-disable-line react-hooks/exhaustive-deps

  const abajo = (e) => { toque.current = { x: e.clientX, t: Date.now() }; setPausa(true) }
  const arriba = (e) => {
    setPausa(false)
    if (e.target.closest('button, a')) return
    const dx = e.clientX - toque.current.x
    const largo = Date.now() - toque.current.t > 350
    if (Math.abs(dx) > 40) ir(i + (dx < 0 ? 1 : -1))
    else if (!largo) ir(i + (e.clientX > window.innerWidth * 0.33 ? 1 : -1))
  }

  const digitales = c.beneficios.filter((b) => b.tipo === 'digital')
  const nGratis = digitales.filter((b) => b.gratis).length
  const nDesc = digitales.length - nGratis
  const muestra = [...digitales.filter((b) => b.destacado), ...digitales.filter((b) => !b.destacado && b.gratis)].slice(0, 6)
  const on = (k) => (i === k ? ' on' : '')

  return (
    <div ref={dialogo} onKeyDown={confinarFoco} className={'intro' + (actual.oscura ? ' oscura' : '') + (pausa ? ' pausa' : '')} role="dialog" aria-modal="true" aria-label="Bienvenida a Colmena">
      <div className="intro-top">
        <div className="intro-prog" aria-hidden="true">
          {SLIDES.map((x, k) => <i key={x.k} className={k < i ? 'ok' : k === i ? 'on' : ''} style={{ '--dur': `${x.dur || 300}ms` }} />)}
        </div>
        <div className="intro-bar">
          <span className="intro-logo"><CeldaAbierta s={20} color={actual.oscura ? 'var(--polen)' : 'var(--ink)'} /> Colmena</span>
          {!ultimo && <button type="button" className="intro-saltar" onClick={onCerrar}>Saltar</button>}
        </div>
      </div>

      <div className="intro-pista" onPointerDown={abajo} onPointerUp={arriba} onPointerCancel={() => setPausa(false)} onContextMenu={(e) => e.preventDefault()}>
        <section className={'intro-slide' + on(0)} aria-label="Qué es Colmena" aria-hidden={i !== 0}>
          <div className="intro-hero a-up" style={{ '--d': 0 }}><PanalArma /></div>
          <span className="eyebrow a-up" style={{ '--d': 2 }}>Te damos la bienvenida</span>
          <h1 className="intro-h a-up" style={{ '--d': 3 }}>Colmena conecta a estudiantes de DCV que <mark className="hl">emprenden</mark>.</h1>
          <ul className="intro-lista">
            <li className="a-up" style={{ '--d': 4 }}><i><Icon n="wall" s={16} /></i><div><b>Muro</b><span>Pide ayuda u ofrece lo que sabes hacer.</span></div></li>
            <li className="a-up" style={{ '--d': 5 }}><i><Icon n="cal" s={16} /></i><div><b>Encuentro</b><span>Talleres prácticos y una reunión al mes.</span></div></li>
            <li className="a-up" style={{ '--d': 6 }}><i><Icon n="gift" s={16} /></i><div><b>Beneficios</b><span>{digitales.length > 0 ? `${digitales.length} programas` : 'Programas'} gratis o con descuento.</span></div></li>
          </ul>
        </section>

        <section className={'intro-slide' + on(1)} aria-label="Cómo funciona el muro" aria-hidden={i !== 1}>
          <span className="eyebrow a-up" style={{ '--d': 0 }}>El muro</span>
          <h1 className="intro-h a-up" style={{ '--d': 1 }}>Pide ayuda u ofrece lo que sabes.</h1>
          <DemoMuro activo={i === 1} pausa={pausa} quieto={quieto} />
          <p className="intro-p a-up" style={{ '--d': 3 }}>Tocas <b>Puedo ayudar</b> o <b>Me interesa</b> y se abre WhatsApp con el mensaje listo. Sin comisiones.</p>
        </section>

        <section className={'intro-slide' + on(2)} aria-label="Talleres y encuentro" aria-hidden={i !== 2}>
          <span className="eyebrow a-up" style={{ '--d': 0 }}>Encuentro</span>
          <h1 className="intro-h a-up" style={{ '--d': 1 }}>Aprende lo que tu marca necesita.</h1>
          <ol className="intro-ruta">
            {(c.talleres.length ? c.talleres.slice(0, 3).map((t) => [t.categoria, t.titulo]) : [['Video', 'Edita reels con el celular'], ['Web e IA', 'Claude Code: tu primera página web'], ['Foto', 'Fotos de producto con luz natural']]).map(([cat, t], k) => (
              <li key={t} className="a-left" style={{ '--d': 2 + k * 2 }}><i><Icon n={cat === 'Video' ? 'spark' : cat === 'Foto' ? 'ig' : 'bulb'} s={16} /></i><div><small>{cat} · Ejemplo</small><b>{t}</b></div></li>
            ))}
          </ol>
          <p className="intro-p a-up" style={{ '--d': 8 }}>Talleres cortos con otros miembros y una noche al mes para mostrar tu marca.</p>
        </section>

        <section className={'intro-slide' + on(3)} aria-label="Beneficios de estudiante" aria-hidden={i !== 3}>
          {digitales.length > 0 && (
            <div className="ben-cifras a-up" style={{ '--d': 0 }}>
              <span><b><Cuenta n={nGratis} activo={i === 3} /></b>gratis</span>
              <span><b><Cuenta n={nDesc} activo={i === 3} /></b>con descuento</span>
            </div>
          )}
          <span className="eyebrow a-up" style={{ '--d': 1 }}>Beneficios</span>
          <h1 className="intro-h a-up" style={{ '--d': 2 }}>Lo que ya tienes gratis por ser estudiante.</h1>
          {muestra.length > 0 && (
            <div className="ben-mini">
              {muestra.map((b, k) => (
                <span key={b.id} className={'a-pop ' + (k % 3 === 1 ? 'b' : 'n')} style={{ '--d': k + 3 }}>
                  <em>{b.etiqueta || 'Beneficio'}</em><b>{b.nombre}</b>
                </span>
              ))}
            </div>
          )}
          <p className="intro-p a-up" style={{ '--d': 9 }}>Cada uno dice cómo activarlo, paso a paso.</p>
        </section>

        <section className={'intro-slide' + on(4)} aria-label="Tu carnet" aria-hidden={i !== 4}>
          <div className="intro-carnet a-rise" style={{ '--d': 0 }}>
            <span className="intro-carnet-top"><CeldaAbierta s={16} /> Colmena <em>Miembro</em></span>
            <div className="intro-carnet-mid">
              <span className="intro-carnet-av">
                <span className="intro-carnet-hex">Tú</span>
                <svg className="nivel-dibuja" viewBox="0 0 100 100" aria-hidden="true">
                  <polygon points="50,2 91.6,26 91.6,74 50,98 8.4,74 8.4,26" pathLength="6" />
                </svg>
              </span>
              <span className="intro-carnet-t"><b>Tu nombre</b><span>Tu emprendimiento</span><small>Nivel 1</small><span className="intro-cobro"><CobroIconos modo="ambos" s={14} />Cobra o intercambia</span></span>
            </div>
            <span className="mono">COL-····</span>
          </div>
          <span className="eyebrow a-up" style={{ '--d': 3 }}>Tu carnet</span>
          <h1 className="intro-h a-up" style={{ '--d': 4 }}>Crea tu carnet en 3 pasos.</h1>
          <p className="intro-p a-up" style={{ '--d': 5 }}>Con él publicas, escribes a otros miembros y subes de nivel cuando ayudas. Sin contraseña.</p>
        </section>
      </div>

      <div className="intro-foot">
        {ultimo && miembro ? (
          <button type="button" className="btn primary full big" onClick={onCerrar}>Entendido</button>
        ) : ultimo ? (
          <>
            <button type="button" className="btn primary full big" onClick={onCarnet}>Crear carnet</button>
            <button type="button" className="btn outline-w full" onClick={onCerrar}>Explorar primero</button>
          </>
        ) : (
          <button type="button" className={'btn full big ' + (actual.oscura ? 'primary' : 'ink')} onClick={() => ir(i + 1)}>
            Siguiente<Icon n="right" s={18} w={2.2} />
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
  cobro: { t: 'Cobra o intercambia', d: 'Cada carnet muestra cómo trabaja esa persona. Intercambiar es cambiar tu trabajo por el de otro miembro.', extra: 'cobro' },
  nivel: { t: 'Tu nivel', d: 'Subes de nivel cuando ayudas a otros miembros, participas en los retos y vas a los encuentros. Cada nivel cierra un lado de tu celda. No pierdes nada si no subes: todo funciona desde el nivel 1.' },
  talleres: { t: 'Talleres', d: 'Talleres cortos, presenciales o virtuales, dictados por otros miembros: reels, fotos de producto, páginas web con IA y más. Toca Me interesa para que sepamos cuáles programar primero. Si sabes algo que a otros les sirve, puedes dictar uno.' },
  ferias: { t: 'Ferias y convocatorias', d: 'En Encuentro hay ferias para vender y convocatorias para conseguir proyectos en Cali. Cada una tiene su fecha, sus requisitos y el link oficial. Lo que ya cerró se oculta solo.' },
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
            <dd>{TEMAS[k].d}{TEMAS[k].extra === 'cobro' && <CobroLista />}</dd>
          </div>
        ))}
      </dl>
      <button type="button" className="btn ghost full" onClick={onIntro}>Ver la bienvenida otra vez</button>
    </div>
  )
}
