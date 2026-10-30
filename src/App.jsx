import { useCallback, useState } from 'react'
import { useColmena } from './lib/store'
import { yaVioBienvenida, marcarBienvenida } from './lib/session'
import { Icon, Hex, ToastProvider } from './components/ui'
import Bienvenida from './screens/Bienvenida'
import Muro from './screens/Muro'
import Miembros from './screens/Miembros'
import Carnet from './screens/Carnet'
import Encuentro from './screens/Encuentro'
import Herramientas, { Ficha, Calculadora } from './screens/Herramientas'
import Perfil from './screens/Perfil'

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
    <>
      <main className="app">
        <ToastProvider><Shell /></ToastProvider>
      </main>
    </>
  )
}

function Shell() {
  const c = useColmena()
  const [tab, setTab] = useState('muro')
  const [pila, setPila] = useState(subInicial)
  const [explorando, setExplorando] = useState(() => yaVioBienvenida() || subInicial().length > 0)

  const nav = useCallback((s) => setPila((p) => [...p, s]), [])
  const atras = useCallback(() => setPila((p) => p.slice(0, -1)), [])
  const irTab = (id) => { setTab(id); setPila([]); document.querySelector('.body')?.scrollTo(0, 0) }

  const pedirPerfil = useCallback((motivo, fn) => {
    if (c.yo) return fn()
    setPila((p) => [...p, { t: 'perfil', motivo }])
  }, [c.yo])

  if (c.cargando) return <div className="loading"><div className="hexav" /></div>

  if (!c.yo && !explorando) {
    return (
      <Bienvenida
        onEntrar={() => { marcarBienvenida(); setExplorando(true); setPila([{ t: 'perfil' }]) }}
        onExplorar={() => { marcarBienvenida(); setExplorando(true) }}
      />
    )
  }

  const headerRight = c.yo
    ? <button type="button" className="iconbtn avbtn" onClick={() => irTab('carnet')} aria-label="Mi carnet"><Hex p={c.yo} w={34} h={38} fs={12} /></button>
    : <button type="button" className="enter" onClick={() => pedirPerfil(null, () => {})}>Entrar<Icon n="right" s={16} /></button>

  const comun = { nav, pedirPerfil, headerRight }
  const sub = pila[pila.length - 1]
  let pantalla
  if (sub?.t === 'perfil') pantalla = <Perfil motivo={sub.motivo} onBack={atras} onListo={atras} />
  else if (sub?.t === 'editar') pantalla = <Perfil modo="editar" onBack={atras} onListo={atras} />
  else if (sub?.t === 'carnet') pantalla = <Carnet id={sub.id} onBack={atras} editar={() => nav({ t: 'editar' })} {...comun} />
  else if (sub?.t === 'calc') pantalla = <Calculadora onBack={atras} />
  else if (sub?.t === 'ficha') pantalla = <Ficha id={sub.id} onBack={atras} />
  else if (tab === 'muro') pantalla = <Muro {...comun} />
  else if (tab === 'miembros') pantalla = <Miembros {...comun} />
  else if (tab === 'encuentro') pantalla = <Encuentro {...comun} />
  else if (tab === 'herramientas') pantalla = <Herramientas {...comun} />
  else pantalla = <Carnet editar={() => nav({ t: 'editar' })} {...comun} />

  const ocultarTabs = sub?.t === 'perfil' || sub?.t === 'editar'

  return (
    <>
      {c.errorRed && (
        <button type="button" className="network-banner" onClick={c.recargar}>
          {c.errorRed} Toca para reintentar.
        </button>
      )}
      {pantalla}
      {!ocultarTabs && (
        <nav className="tabbar" aria-label="Navegación principal">
          {TABS.map((t) => {
            const on = t.id === tab && !(sub && sub.t === 'carnet' && sub.id && t.id === 'carnet')
            return (
              <button key={t.id} type="button" className="tab" aria-current={on ? 'page' : undefined} onClick={() => irTab(t.id)}>
                <Icon n={t.ic} s={22} w={on ? 1.9 : 1.6} /><span>{t.label}</span><i className="pip" />
              </button>
            )
          })}
        </nav>
      )}
    </>
  )
}
