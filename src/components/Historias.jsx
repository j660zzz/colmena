import { useEffect, useRef, useState } from 'react'
import { Icon, Hex, CeldaAbierta } from './ui'
import { cierraEn } from '../lib/logic'
import { estaVisto, leerVistos, marcarVisto } from '../lib/historias'

const quietoAhora = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false } }
const DURACION = { ganador: 7000, reto: 7000, aliado: 6000, taller: 7000, conv: 6000, beneficio: 5000 }
const HEX = 'M12 2.5 20.2 7.25v9.5L12 21.5 3.8 16.75v-9.5L12 2.5Z'

// Fila de anillos hexagonales. Sin datos no pinta nada: nunca estorba al resto del inicio.
export function FilaDestacados({ anillos, onAbrir, vistos }) {
  if (!anillos.length) return null
  return (
    <nav className="dest-fila" aria-label="Destacados">
      {anillos.map((a, i) => {
        const visto = estaVisto(vistos, a)
        return (
          <button key={a.id} type="button" className={'dest-item' + (visto ? ' visto' : '')} onClick={() => onAbrir(i)}
            aria-label={`${a.nombre}${visto ? '' : ', nuevo'}`}>
            <span className="dest-hex">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={HEX} className="dest-aro" /></svg>
              <i><Icon n={a.icono} s={22} w={1.9} /></i>
            </span>
            <span className="dest-n">{a.nombre}</span>
          </button>
        )
      })}
    </nav>
  )
}

// Visor a pantalla completa. Barra por pantalla, tocar a la derecha adelanta y a la izquierda vuelve,
// mantener presionado pausa, deslizar de lado cambia de destacado y hacia abajo cierra. Escape cierra.
export function VisorDestacados({ anillos, inicial, onCerrar, onIr }) {
  const dialogo = useRef(null)
  const [a, setA] = useState(inicial)
  const [s, setS] = useState(0)
  const [pausa, setPausa] = useState(false)
  const [prog, setProg] = useState(0)
  const [quieto] = useState(quietoAhora)
  const toque = useRef({ x: 0, y: 0, t: 0 })
  const transcurrido = useRef(0)
  const anillo = anillos[a]
  const slide = anillo?.slides[s]

  useEffect(() => {
    const el = dialogo.current
    if (!el.open) el.showModal()
    return () => { if (el.open) el.close() }
  }, [])
  useEffect(() => { if (anillo) marcarVisto(anillo) }, [a]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { transcurrido.current = 0; setProg(0) }, [a, s])

  const siguiente = () => {
    if (s < anillo.slides.length - 1) setS(s + 1)
    else if (a < anillos.length - 1) { setA(a + 1); setS(0) }
    else onCerrar()
  }
  const anterior = () => {
    if (s > 0) setS(s - 1)
    else if (a > 0) { setA(a - 1); setS(0) }
  }

  // Avance automático con un reloj propio: al pausar, la barra y el tiempo se detienen juntos.
  const dur = DURACION[slide?.k] || 6000
  useEffect(() => {
    if (quieto || pausa) return
    const t0 = performance.now() - transcurrido.current
    const id = setInterval(() => {
      const e = performance.now() - t0
      transcurrido.current = e
      if (e >= dur) { clearInterval(id); siguiente() } else setProg(e / dur)
    }, 60)
    return () => clearInterval(id)
  }, [a, s, pausa, quieto]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const vis = () => setPausa(document.visibilityState !== 'visible')
    document.addEventListener('visibilitychange', vis)
    return () => document.removeEventListener('visibilitychange', vis)
  }, [])
  useEffect(() => {
    const tecla = (e) => { if (e.key === 'ArrowRight') siguiente(); if (e.key === 'ArrowLeft') anterior() }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }) // se reasigna en cada pantalla para usar el estado actual

  const abajo = (e) => { toque.current = { x: e.clientX, y: e.clientY, t: Date.now() }; setPausa(true) }
  const arriba = (e) => {
    setPausa(false)
    if (e.target.closest('button, a')) return
    const dx = e.clientX - toque.current.x, dy = e.clientY - toque.current.y
    const largo = Date.now() - toque.current.t > 350
    const r = dialogo.current.getBoundingClientRect()
    if (dy > 80 && Math.abs(dy) > Math.abs(dx)) onCerrar()
    else if (Math.abs(dx) > 60) { if (dx < 0 && a < anillos.length - 1) { setA(a + 1); setS(0) } else if (dx > 0 && a > 0) { setA(a - 1); setS(0) } }
    else if (!largo) { if (e.clientX - r.left > r.width * 0.33) siguiente(); else anterior() }
  }
  if (!anillo) return null

  return (
    <dialog ref={dialogo} className={'visor' + (slide.oscura ? ' oscura' : '') + (pausa ? ' pausa' : '')} aria-label={`Destacado: ${anillo.nombre}`}
      onCancel={(e) => { e.preventDefault(); onCerrar() }}>
      <div className="visor-top">
        <div className="visor-prog" aria-hidden="true">
          {anillo.slides.map((x, k) => <i key={x.id} className={k < s ? 'ok' : ''}><b style={{ transform: `scaleX(${k < s ? 1 : k === s ? (quieto ? 1 : prog) : 0})` }} /></i>)}
        </div>
        <div className="visor-bar">
          <span className="visor-logo"><CeldaAbierta s={18} color={slide.oscura ? 'var(--polen)' : 'var(--ink)'} />{anillo.nombre}</span>
          <button type="button" className="iconbtn" onClick={onCerrar} aria-label="Cerrar"><Icon n="x" s={22} /></button>
        </div>
      </div>

      <div className="visor-pista" onPointerDown={abajo} onPointerUp={arriba} onPointerCancel={() => setPausa(false)} onContextMenu={(e) => e.preventDefault()}>
        <section key={slide.id} className={'visor-slide ' + slide.k} aria-live="polite">
          <span className="visor-kicker">{slide.kicker}{slide.ejemplo && <span className="ejemplo">Ejemplo</span>}</span>
          {slide.k === 'aliado' ? (
            <div className="visor-cupon">
              <div className="vc-valor"><strong>{slide.valor}</strong></div>
              <div className="vc-cuerpo"><h2>{slide.titulo}</h2>{slide.texto && <p>{slide.texto}</p>}</div>
            </div>
          ) : (
            <>
              {slide.k === 'ganador' ? <span className="visor-av"><Hex p={slide.perfil} w={104} /></span> : <span className="visor-ico"><Icon n={anillo.icono} s={34} w={1.8} /></span>}
              {slide.valor ? <strong className="visor-valor">{slide.valor}</strong> : null}
              <h2>{slide.titulo}</h2>
              {slide.subtitulo && <span className="visor-sub">{slide.subtitulo}</span>}
              {slide.texto && <p>{slide.texto}</p>}
            </>
          )}
          {slide.cierra && <span className="visor-cierra"><Icon n="hour" s={16} />{cierraEn(slide.cierra)}</span>}
          {slide.nota && <small>{slide.nota}</small>}
          {slide.ejemplo && slide.k === 'aliado' && <small>Ejemplo: así se verá un descuento real. Hoy no hay negocio detrás.</small>}
          {slide.ejemplo && slide.k === 'ganador' && <small>Ejemplo: no es una persona real.</small>}
        </section>
      </div>

      <div className="visor-foot">
        <button type="button" className="btn primary full big" onClick={() => onIr(slide.cta.ir)}>{slide.cta.texto}<Icon n="right" s={18} w={2.2} /></button>
      </div>
    </dialog>
  )
}
