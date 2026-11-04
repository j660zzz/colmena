import { useCallback, useEffect, useRef, useState } from 'react'
import { useColmena } from './lib/store'
import { Icon, Hex, ToastProvider, Sheet, useToast } from './components/ui'
import Muro, { Composer } from './screens/Muro'
import Publicado from './screens/Publicado'
import Miembros from './screens/Miembros'
import Carnet from './screens/Carnet'
import MiCarnet from './screens/MiCarnet'
import Calificar from './screens/Calificar'
import Encuentro from './screens/Encuentro'
import Herramientas, { Ficha, Calculadora } from './screens/Herramientas'
import Registro, { CarnetListo, Editar } from './screens/Registro'
import { Bienvenida, Ayuda, introVista, marcarIntroVista } from './screens/Onboarding'

const TABS = [
  { id: 'muro', label: 'Muro', ic: 'wall' },
  { id: 'miembros', label: 'Miembros', ic: 'users' },
  { id: 'encuentro', label: 'Encuentro', ic: 'cal' },
  { id: 'herramientas', label: 'Herramientas', ic: 'tools' },
  { id: 'carnet', label: 'Carnet', ic: 'card' }
]

function subInicial() {
  const id = new URLSearchParams(location.search).get('carnet')
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
  const [pila, setPila] = useState(subInicial)
  const [composer, setComposer] = useState(null)
  const [intro, setIntro] = useState(() => !introVista() && !subInicial().length)
  const [ayuda, setAyuda] = useState(null)
  const pendiente = useRef(null)

  const nav = useCallback((s) => { setPila((p) => [...p, s]); document.querySelector('.body')?.scrollTo(0, 0) }, [])
  const atras = useCallback(() => setPila((p) => p.slice(0, -1)), [])
  const reemplazar = useCallback((s) => setPila((p) => [...p.slice(0, -1), s]), [])
  const irTab = useCallback((id) => { setTab(id); setPila([]); document.querySelector('.body')?.scrollTo(0, 0) }, [])

  // Si no hay carnet, primero se saca y luego se sigue con lo que la persona quería hacer
  const pedirPerfil = useCallback((motivo, fn) => {
    if (c.yo) return fn()
    pendiente.current = motivo ? fn : null
    setPila((p) => [...p, { t: 'registro', motivo }])
  }, [c.yo])

  const abrirComposer = useCallback((prev = {}) => {
    pedirPerfil('Para publicar en el muro necesitas tu carnet.', () => setComposer({ tipo: 'need', texto: '', ...prev }))
  }, [pedirPerfil])

  const abrirAyuda = useCallback((tema = null) => setAyuda({ tema }), [])
  const cerrarIntro = () => { marcarIntroVista(); setIntro(false) }

  // Botón atrás del celular: vuelve una pantalla dentro de la app en vez de cerrarla
  const enRaiz = tab === 'muro' && pila.length === 0
  const guardia = useRef(false)
  const ignorar = useRef(false)
  const estado = useRef({})
  estado.current = { pila, tab }
  useEffect(() => {
    const alVolver = () => {
      if (ignorar.current) { ignorar.current = false; return }
      guardia.current = false
      const { pila: p, tab: t } = estado.current
      if (p.length) setPila(p.slice(0, -1))
      else if (t !== 'muro') setTab('muro')
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
    if (location.search.includes('carnet=')) history.replaceState(history.state, '', location.pathname)
  }, [])

  if (c.cargando) return <div className="loading"><div className="hexav" /></div>

  const avisos = c.pendientes.confirmar.length + c.pendientes.calificar.filter((x) => !x.yo_califique).length
  const headerRight = c.yo
    ? (
      <>
        <button type="button" className="iconbtn bell" onClick={() => irTab('carnet')} aria-label={avisos ? `${avisos} cosas por revisar` : 'Sin novedades'}>
          <Icon n="bell" s={22} />{avisos > 0 && <i className="dot" />}
        </button>
        <button type="button" className="iconbtn avbtn" onClick={() => irTab('carnet')} aria-label="Mi carnet"><Hex p={c.yo} w={32} h={36} fs={12} /></button>
      </>
    )
    : <button type="button" className="enter" onClick={() => pedirPerfil(null, () => {})}>Saca tu carnet</button>

  const comun = { nav, atras, irTab, pedirPerfil, headerRight, abrirComposer, abrirAyuda }
  const sub = pila[pila.length - 1]
  let pantalla
  const seguir = () => { const fn = pendiente.current; pendiente.current = null; setPila([]); setTab('muro'); if (fn) setTimeout(fn, 0) }
  if (sub?.t === 'registro') pantalla = <Registro motivo={sub.motivo} onBack={() => { pendiente.current = null; atras() }} onListo={() => reemplazar({ t: 'listo' })} />
  else if (sub?.t === 'listo') pantalla = <CarnetListo onMuro={() => { pendiente.current = null; setPila([]); setTab('muro') }} onSeguir={pendiente.current ? seguir : null} />
  else if (sub?.t === 'editar') pantalla = <Editar onBack={atras} />
  else if (sub?.t === 'carnet') pantalla = <Carnet id={sub.id} onBack={atras} {...comun} />
  else if (sub?.t === 'publicado') pantalla = <Publicado postId={sub.postId} onBack={atras} {...comun} />
  else if (sub?.t === 'calificar') pantalla = <Calificar postId={sub.postId} otroId={sub.otro} onBack={atras} />
  else if (sub?.t === 'calc') pantalla = <Calculadora onBack={atras} abrirComposer={abrirComposer} />
  else if (sub?.t === 'ficha') pantalla = <Ficha id={sub.id} onBack={atras} />
  else if (tab === 'muro') pantalla = <Muro {...comun} />
  else if (tab === 'miembros') pantalla = <Miembros {...comun} />
  else if (tab === 'encuentro') pantalla = <Encuentro {...comun} />
  else if (tab === 'herramientas') pantalla = <Herramientas {...comun} />
  else pantalla = <MiCarnet {...comun} />

  const sinTabs = ['registro', 'listo', 'editar', 'calificar'].includes(sub?.t)

  return (
    <>
      {c.errorRed && (
        <button type="button" className="network-banner" onClick={c.recargar}>
          {c.errorRed} Toca para reintentar.
        </button>
      )}
      {pantalla}
      {!sinTabs && (
        <nav className="tabbar" aria-label="Navegación principal">
          {TABS.map((t) => {
            const on = t.id === tab && !(sub && sub.t === 'carnet')
            return (
              <button key={t.id} type="button" className="tab" aria-current={on ? 'page' : undefined} aria-label={t.label} onClick={() => irTab(t.id)}>
                <Icon n={t.ic} s={22} w={on ? 2 : 1.7} />{on && <span>{t.label}</span>}
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
            if (postId) { toast('Publicado. La colmena ya lo está viendo.'); setTab('muro'); setPila([{ t: 'publicado', postId }]) }
          }} />
        )}
      </Sheet>
    </>
  )
}
