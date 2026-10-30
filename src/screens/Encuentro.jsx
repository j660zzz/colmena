import { useColmena } from '../lib/store'
import { fechaLarga, firstName } from '../lib/format'
import { Icon, Hex, Ejemplo, Header, Empty, useToast } from '../components/ui'

export default function Encuentro({ pedirPerfil, headerRight }) {
  const c = useColmena()
  const toast = useToast()
  const e = c.encuentro

  if (!e) {
    return (
      <>
        <Header title="Encuentro" right={headerRight} />
        <div className="body"><Empty icon="cal" title="Próximo encuentro en preparación">Cuando se confirme fecha y lugar, aparece aquí.</Empty></div>
      </>
    )
  }

  const asistentes = c.asistencias.filter((a) => a.encuentro_id === e.id).map((a) => c.perfil(a.perfil_id)).filter(Boolean)
  const voy = c.yo && asistentes.some((p) => p.id === c.yo.id)
  const fecha = fechaLarga(e.fecha)
  const verbo = fecha ? (asistentes.length === 1 ? 'confirmado' : 'confirmados') : (asistentes.length === 1 ? 'quiere ir' : 'quieren ir')

  const alternar = () => pedirPerfil('Para apuntarte al encuentro necesitas tu carnet.', async () => {
    try { const on = await c.alternarAsistencia(e.id); toast(on ? '¡Te apuntaste! Nos vemos allá.' : 'Quitamos tu asistencia') }
    catch (err) { toast(err.message, true) }
  })

  return (
    <>
      <Header title="Encuentro" sub="Una vez al mes, en persona" right={headerRight} />
      <div className="body fade">
        <div className="meet">
          <span className="nbr">Encuentro {String(e.numero).padStart(2, '0')}</span>
          <h3>{e.titulo}</h3>
          <div className="facts">
            <div className="fact"><Icon n="cal" s={18} /><span><b>{fecha || 'Fecha por confirmar'}</b></span></div>
            {e.hora_texto && <div className="fact"><Icon n="clock" s={18} /><span>{e.hora_texto}</span></div>}
            {e.lugar && <div className="fact"><Icon n="pin" s={18} /><span>{e.lugar}</span></div>}
          </div>
          <div className="going">
            {asistentes.length > 0 && <div className="stack">{asistentes.slice(0, 5).map((p) => <Hex key={p.id} p={p} w={30} fs={11} />)}</div>}
            <p>
              <b>{asistentes.length} {verbo}</b><br />
              {asistentes.length === 0 ? 'Sé el primero en apuntarte'
                : <span className="attendee-names">{asistentes.slice(0, 2).map((p, i) => <span key={p.id}>{i > 0 && ', '}{firstName(p.nombre)}<Ejemplo p={p} /></span>)}{asistentes.length > 2 && ` y ${asistentes.length - 2} más`}</span>}
            </p>
          </div>
          <div className="gap-16" />
          <button type="button" className={'btn full ' + (voy ? 'done' : 'primary')} onClick={alternar}>
            {voy ? <><Icon n="check" s={18} w={2.1} />{fecha ? 'Asistencia confirmada' : 'Te avisamos la fecha'}</> : fecha ? 'Confirmar asistencia' : 'Quiero ir'}
          </button>
        </div>

        {e.agenda?.length > 0 && (
          <>
            <div className="sec-h"><h3>Agenda</h3></div>
            <div className="rowlist">
              {e.agenda.map((a, i) => (
                <div key={i}>
                  {i > 0 && <div className="divider" />}
                  <div className="ag"><time>{a.hora}</time><div><b>{a.titulo}</b>{a.detalle && <span>{a.detalle}</span>}</div></div>
                </div>
              ))}
            </div>
          </>
        )}
        {e.que_llevar && (
          <div className="bring"><Icon n="note" s={19} /><p><b>Qué llevar:</b> {e.que_llevar}</p></div>
        )}
      </div>
    </>
  )
}
