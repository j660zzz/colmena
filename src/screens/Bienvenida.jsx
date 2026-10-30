import { useColmena } from '../lib/store'
import { Hex, Comb, CeldaAbierta } from '../components/ui'

const CELDAS = [[160, 52], [92, 96], [228, 96], [126, 148], [194, 148]]

export default function Bienvenida({ onEntrar, onExplorar }) {
  const c = useColmena()
  const reales = c.perfiles.filter((p) => !p.es_ejemplo)
  const caras = [...reales, ...c.perfiles.filter((p) => p.es_ejemplo)].slice(0, 5)

  return (
    <div className="welcome fade">
      <div className="art">
        <Comb viewBox="0 0 320 262" r={34} w={310} h={250} x0={22} y0={18} stroke="rgba(15,15,13,.12)" sw={1.5} inset={2.5} />
        {caras.map((p, i) => (
          <Hex key={p.id} p={p} w={52} h={58} fs={17} style={{ position: 'absolute', left: CELDAS[i][0] - 26, top: CELDAS[i][1] - 29 }} />
        ))}
      </div>
      <div className="wm">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
          <CeldaAbierta s={38} color="var(--ink)" />
          <h1 style={{ margin: 0, fontFamily: 'var(--disp)', fontSize: 42, fontWeight: 700, letterSpacing: '-0.045em', color: 'var(--ink)' }}>Colmena</h1>
        </div>
        <p className="tl">Donde el que empieza deja de estar solo.</p>
        <p className="prem">Solos, celdas sueltas; juntos, colmena.</p>
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
