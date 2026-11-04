import { Component } from 'react'
import { useColmena } from '../lib/store'
import { Empty, Header } from './ui'

export function EstadoDatos({ nombres, children }) {
  const c = useColmena()
  const faltantes = nombres.filter((n) => !c.datos[n]?.disponible)
  if (!faltantes.length) return children
  const error = faltantes.some((n) => c.datos[n]?.estado === 'error')
  return (
    <div role="status" aria-live="polite" aria-busy={!error}>
      <Empty icon={error ? 'alert' : 'clock'} title={error ? 'No pudimos cargar estos datos' : 'Cargando…'}
        action={error && <button type="button" className="btn ink sm" onClick={() => c.reintentar(faltantes)}>Reintentar</button>}>
        {error ? 'Revisa tu conexión e inténtalo otra vez.' : 'Puedes seguir usando las otras secciones.'}
      </Empty>
    </div>
  )
}
export function PantallaDatos({ nombres, headerRight, children }) {
  const c = useColmena()
  if (nombres.every((n) => c.datos[n]?.disponible)) return children
  return <><Header right={headerRight} /><div className="body"><EstadoDatos nombres={nombres} /></div></>
}

export class CargaPantalla extends Component {
  state = { error: false }
  static getDerivedStateFromError() { return { error: true } }
  render() {
    if (!this.state.error) return this.props.children
    return <><Header /><div className="body"><Empty title="No pudimos abrir esta pantalla"
      action={<button type="button" className="btn ink" onClick={() => location.reload()}>Recargar</button>}>
      Revisa tu conexión y recarga la página para intentarlo de nuevo.
    </Empty></div></>
  }
}
