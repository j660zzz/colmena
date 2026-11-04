import { Fragment, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { useColmena } from './lib/store'
import { Icon, Hex, ToastProvider, Sheet, SubHeader, Header, Empty, useToast } from './components/ui'
import Muro, { Composer, Publicacion } from './screens/Muro'
import { Bienvenida, Ayuda, introVista, marcarIntroVista } from './screens/Onboarding'
import { AvisoNivel } from './components/Nivel'
import { CargaPantalla, PantallaDatos } from './components/EstadoDatos'
const Publicado = lazy(() => import('./screens/Publicado'))
const Miembros = lazy(() => import('./screens/Miembros'))
const Carnet = lazy(() => import('./screens/Carnet'))
const MiCarnet = lazy(() => import('./screens/MiCarnet'))
const Calificar = lazy(() => import('./screens/Calificar'))
const Encuentro = lazy(() => import('./screens/Encuentro'))
const Herramientas = lazy(() => import('./screens/Herramientas'))
const Ficha = lazy(() => import('./screens/Herramientas').then((m) => ({ default: m.Ficha })))
const Calculadora = lazy(() => import('./screens/Herramientas').then((m) => ({ default: m.Calculadora })))
const Registro = lazy(() => import('./screens/Registro'))
const CarnetListo = lazy(() => import('./screens/Registro').then((m) => ({ default: m.CarnetListo })))
const Editar = lazy(() => import('./screens/Registro').then((m) => ({ default: m.Editar })))
const CarnetParaMostrar = lazy(() => import('./screens/Beneficios').then((m) => ({ default: m.CarnetParaMostrar })))

const TABS = [
  { id: 'muro', label: 'Muro', ic: 'wall' },
  { id: 'miembros', label: 'Miembros', ic: 'users' },
  { id: 'encuentro', label: 'Encuentro', ic: 'cal' },
  { id: 'herramientas', label: 'Beneficios', ic: 'gift' },
  { id: 'carnet', label: 'Carnet', ic: 'card' }
]

function subInicial() {
  const params = new URLSearchParams(location.search)
  const post = params.get('publicacion')
  if (post) return [{ t: 'publicacion', id: post }]
  const id = params.get('carnet')
  return id ? [{ t: 'carnet', id }] : []
}

export default function App() {
  return (
    <main className="app">
      <ToastProvider><Shell /></ToastProvider>
    </main>
  )
}

function Shell() {
  const c = useColmena()
  const toast = useToast()
  const [tab, setTab] = useState('muro')
  const [destino, setDestino] = useState(null)
  const [pila, setPila] = useState(subInicial)
  const [composer, setComposer] = useState(null)
  const [intro, setIntro] = useState(() => !introVista() && !subInicial().length)
  const [ayuda, setAyuda] = useState(null)
  const pendiente = useRef(null)
  const registroAtras = useRef(null)
  useEffect(() => {
    const avisar = () => toast('Hay una nueva versión. Recarga cuando termines de editar.')
    window.addEventListener('colmena-actualizacion', avisar)
    return () => window.removeEventListener('colmena-actualizacion', avisar)
  }, [toast])
  const sub = pila[pila.length - 1]
  useEffect(() => { c.asegurarDatos(sub?.t || tab) }, [tab, sub?.t, c.asegurarDatos])

  useEffect(() => {
    if (!destino || tab !== 'encuentro') return
    const fuentes = destino === 'enc-reto' ? ['reto', 'participantes'] : destino === 'enc-talleres' ? ['talleres', 'interes'] : ['convocatorias']
    if (!fuentes.every((n) => c.datos[n]?.disponible)) return
    const frame = requestAnimationFrame(() => {
      document.getElementById(destino)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
      setDestino(null)
    })
    return () => cancelAnimationFrame(frame)
  }, [destino, tab, c.datos])

  // Resultado de volver de iniciar sesión con el correo Javeriana
  useEffect(() => {
    if (!c.avisoCuenta) return
    toast(c.avisoCuenta.msg, c.avisoCuenta.error)
    if (!c.avisoCuenta.error) { marcarIntroVista(); setIntro(false); setTab('carnet'); setPila([]) }
    c.limpiarAvisoCuenta()
  }, [c.avisoCuenta]) // eslint-disable-line react-hooks/exhaustive-deps

  const nav = useCallback((s) => { setPila((p) => [...p, s]) }, [])
  const atras = useCallback(() => setPila((p) => p.slice(0, -1)), [])
  const reemplazar = useCallback((s) => setPila((p) => [...p.slice(0, -1), s]), [])
  const irTab = useCallback((id, seccion = null) => { setTab(id); setPila([]); setDestino(seccion) }, [])

  // Si no hay carnet, primero se saca y luego se sigue con lo que la persona quería hacer
  const pedirPerfil = useCallback((motivo, fn) => {
    if (c.yo) return fn()
    pendiente.current = motivo ? fn : null
    setPila((p) => [...p, { t: 'registro', motivo }])
  }, [c.yo])

  const abrirComposer = useCallback((prev = {}) => {
    pedirPerfil('Necesitas un carnet para publicar.', () => setComposer(prev))
  }, [pedirPerfil])

  const abrirAyuda = useCallback((tema = null) => setAyuda({ tema }), [])
  const cerrarIntro = () => { marcarIntroVista(); setIntro(false) }

  // Botón atrás del celular: vuelve una pantalla dentro de la app en vez de cerrarla
  const enRaiz = tab === 'muro' && pila.length === 0 && !composer && !ayuda
  const guardia = useRef(false)
  const ignorar = useRef(false)
  const estado = useRef({})
  estado.current = { pila, tab, composer, ayuda }
  useEffect(() => {
    const alVolver = () => {
      if (ignorar.current) { ignorar.current = false; return }
      const { pila: p, tab: t, composer: co, ayuda: ay } = estado.current
      if (co || ay) {
        setComposer(null); setAyuda(null)
        if (p.length || t !== 'muro') history.pushState({ colmena: 1 }, '')
        else guardia.current = false
        return
      }
      if (p[p.length - 1]?.t === 'registro' && registroAtras.current?.()) {
        history.pushState({ colmena: 1 }, '')
        return
      }
      const raizDespues = p.length ? (p.length === 1 && t === 'muro') : true
      if (p.length) setPila(p.slice(0, -1))
      else if (t !== 'muro') setTab('muro')
      // Si todavía no estamos en el muro, se deja otra parada para el siguiente atrás
      if (raizDespues) guardia.current = false
      else history.pushState({ colmena: 1 }, '')
    }
    window.addEventListener('popstate', alVolver)
    return () => window.removeEventListener('popstate', alVolver)
  }, [])
  useEffect(() => {
    if (!enRaiz && !guardia.current) { history.pushState({ colmena: 1 }, ''); guardia.current = true }
    else if (enRaiz && guardia.current) { guardia.current = false; ignorar.current = true; history.back() }
  }, [enRaiz])
  useEffect(() => {
    // Quitar ?carnet= de la dirección para que recargar no vuelva a abrir ese carnet
    if (location.search.includes('carnet=') || (location.search.includes('publicacion=') && sub?.t !== 'publicacion')) history.replaceState(history.state, '', location.pathname)
  }, [sub?.t])

  const avisos = c.pendientes.confirmar.length + c.pendientes.calificar.filter((x) => !x.yo_califique).length
  const headerRight = c.yo
    ? (
      <>
        <button type="button" className="iconbtn bell" onClick={() => irTab('carnet')} aria-label={avisos ? `${avisos} pendientes` : 'Sin novedades'}>
          <Icon n="bell" s={22} />{avisos > 0 && <i className="dot" />}
        </button>
        <button type="button" className="iconbtn avbtn" onClick={() => irTab('carnet')} aria-label="Mi carnet"><Hex p={c.yo} w={32} h={36} fs={12} /></button>
      </>
    )
    : <button type="button" className="enter" onClick={() => pedirPerfil(null, () => {})}>Crear carnet</button>

  const comun = { nav, atras, irTab, pedirPerfil, headerRight, abrirComposer, abrirAyuda }
  let pantalla
  const seguir = () => { const fn = pendiente.current; pendiente.current = null; setPila([]); if (fn) setTimeout(fn, 0) }
  if (sub?.t === 'registro') pantalla = <Registro registroAtras={registroAtras} motivo={sub.motivo} onBack={() => { pendiente.current = null; atras() }} onListo={() => reemplazar({ t: 'listo' })} />
  else if (sub?.t === 'listo') pantalla = <CarnetListo onMuro={() => { pendiente.current = null; setPila([]); setTab('muro') }} onSeguir={pendiente.current ? seguir : null} />
  else if (sub?.t === 'editar') pantalla = <Editar onBack={atras} />
  else if (sub?.t === 'carnet') pantalla = <Carnet id={sub.id} onBack={atras} {...comun} />
  else if (sub?.t === 'publicacion') pantalla = <Publicacion id={sub.id} onBack={atras} {...comun} />
  else if (sub?.t === 'publicado') pantalla = <Publicado postId={sub.postId} onBack={atras} {...comun} />
  else if (sub?.t === 'calificar') pantalla = <Calificar postId={sub.postId} otroId={sub.otro} onBack={atras} />
  else if (sub?.t === 'calc') pantalla = <Calculadora onBack={atras} abrirComposer={abrirComposer} />
  else if (sub?.t === 'mostrar') pantalla = <><SubHeader title="Tu carnet" onBack={atras} /><div className="body fade"><CarnetParaMostrar /></div></>
  else if (sub?.t === 'ficha') pantalla = <Ficha id={sub.id} onBack={atras} />
  else if (tab === 'muro') pantalla = <Muro {...comun} />
  else if (tab === 'miembros') pantalla = <Miembros {...comun} />
  else if (tab === 'encuentro') pantalla = <Encuentro {...comun} />
  else if (tab === 'herramientas') pantalla = <Herramientas {...comun} />
  else pantalla = <MiCarnet {...comun} />

  const fuente = sub?.t || tab
  const necesarias = ['muro', 'publicacion', 'publicado'].includes(fuente) ? ['perfiles', 'publicaciones']
    : ['miembros', 'carnet'].includes(fuente) ? ['perfiles', 'publicaciones', 'ayudas', 'participantes', 'asistencias', 'resenas', 'conexiones']
      : ['editar', 'mostrar', 'listo'].includes(fuente) ? ['perfiles'] : []
  const sinTabs = ['registro', 'listo', 'editar', 'calificar'].includes(sub?.t)

  return (
    <>
      <AvisoNivel />
      {c.errorRed && (
        <button type="button" className="network-banner" onClick={() => c.recargar()}>
          {c.errorRed} Toca para reintentar.
        </button>
      )}
      <Fragment key={(sub?.t || tab) + (sub?.id || sub?.postId || '')}>
        <CargaPantalla>
          <Suspense fallback={<><Header right={headerRight} /><div className="body" role="status"><Empty title="Cargando…" /></div></>}>
            <PantallaDatos nombres={necesarias} headerRight={headerRight}>{pantalla}</PantallaDatos>
          </Suspense>
        </CargaPantalla>
      </Fragment>
      {!sinTabs && (
        <nav className="tabbar" aria-label="Navegación principal">
          {TABS.map((t) => {
            const on = t.id === tab && !(sub && sub.t === 'carnet')
            return (
              <button key={t.id} type="button" className="tab" aria-current={on ? 'page' : undefined} onClick={() => irTab(t.id)}>
                <Icon n={t.ic} s={22} w={on ? 2 : 1.7} /><span>{t.label}</span>
              </button>
            )
          })}
        </nav>
      )}
      <Sheet open={!!ayuda} onClose={() => setAyuda(null)} label="Cómo funciona">
        {ayuda && <Ayuda tema={ayuda.tema} onIntro={() => { setAyuda(null); setIntro(true) }} />}
      </Sheet>
      {intro && !c.yo && (
        <Bienvenida onCerrar={cerrarIntro} onCarnet={() => { cerrarIntro(); pedirPerfil(null, () => {}) }} />
      )}
      {intro && c.yo && <Bienvenida miembro onCerrar={cerrarIntro} onCarnet={cerrarIntro} />}
      <Sheet open={!!composer} onClose={() => setComposer(null)} label="Publicar en el muro">
        {composer && (
          <Composer inicial={composer} onDone={(postId) => {
            setComposer(null)
            if (postId) { toast('Publicado'); setTab('muro'); setPila([{ t: 'publicado', postId }]) }
          }} />
        )}
      </Sheet>
    </>
  )
}
