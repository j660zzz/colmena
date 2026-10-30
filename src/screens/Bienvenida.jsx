import { useColmena } from '../lib/store'
import { Hex, Ejemplo, CeldaAbierta } from '../components/ui'
import { firstName } from '../lib/format'

export default function Bienvenida({ onEntrar, onExplorar }) {
  const c = useColmena()
  const reales = c.perfiles.filter((p) => !p.es_ejemplo)
  const caras = [...reales, ...c.perfiles.filter((p) => p.es_ejemplo)].slice(0, 5)

  return (
    <div className="welcome">
      <div className="brand-lockup"><CeldaAbierta s={25} /><span>Colmena</span></div>
      <div className="welcome-title">
        <h1>Aquí nadie<br />arranca <mark>solo.</mark></h1>
        <p>Conecta con gente que también está empezando. Pide una mano o comparte lo que sabes.</p>
      </div>
      <div className="welcome-community">
        {caras.length > 0 && <div className="welcome-people">
          {caras.slice(0, 3).map((p) => <div key={p.id} className="welcome-person"><Hex p={p} w={44} h={48} fs={16} /><span>{firstName(p.nombre)}</span><Ejemplo p={p} /></div>)}
        </div>}
        <p>Solos, celdas sueltas;<br />juntos, colmena.</p>
      </div>
      <div className="cta">
        <button type="button" className="btn primary full" onClick={onEntrar}>Crear mi carnet</button>
        <button type="button" className="btn ghost full" onClick={onExplorar}>Explorar primero</button>
        <p className="proof">
          {reales.length >= 3 ? `Ya somos ${reales.length} · ` : 'Sé de los primeros · '}
          Diseño de Comunicación Visual · Javeriana Cali
        </p>
      </div>
    </div>
  )
}
