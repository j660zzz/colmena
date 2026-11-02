import { useState } from 'react'
import { useColmena } from '../lib/store'
import { fechaLarga, firstName, hace, initials } from '../lib/format'
import { panalSemana, semanaDelMes, PANAL } from '../lib/logic'
import { Icon, Hex, Ejemplo, Header, Panal, useToast } from '../components/ui'
import { RetoCard } from './Muro'

export default function Encuentro({ nav, irTab, pedirPerfil, headerRight }) {
  const c = useColmena()
  const semana = semanaDelMes()
  const ruta = [['Semana 1', 1], ['Semana 2', 2], ['Semana 3', 3], ['Encuentro', 4]]

  return (
    <>
      <Header title="Encuentro" sub="Lo que hacemos juntos este mes" right={headerRight} />
      <div className="body fade">
        <div className="route" aria-label={`Vas en la semana ${semana} del mes`}>
          {ruta.map(([t, i]) => (
            <div key={t} className={'node' + (i < semana ? ' done' : i === semana ? ' now' : '') + (i === 4 ? ' end' : '')}>
              <span className="nh">{i === 4 ? <Icon n="cal" s={14} w={2} /> : i < semana ? <Icon n="check" s={12} w={3} /> : null}</span>
              <small>{t}</small>
              {i === semana && <em>Estás aquí</em>}
            </div>
          ))}
        </div>
        <p className="fine center">Cada semana suma al panal. El mes cierra en persona.</p>

        <PanalGrande irTab={irTab} />
        <RetoCard irTab={irTab} pedirPerfil={pedirPerfil} completo />
        <Propuestas nav={nav} pedirPerfil={pedirPerfil} />
        <Ticket pedirPerfil={pedirPerfil} />
      </div>
    </>
  )
}

function PanalGrande({ irTab }) {
  const c = useColmena()
  const { manos, llenas, ejemplos } = panalSemana(c)
  const celdas = manos.slice(0, PANAL).map((m) => initials(c.perfil(m.ayuda)?.nombre || ''))
  return (
    <section className="panal-card full">
      <span className="k">El panal · semana {semanaDelMes()}</span>
      <Panal celdas={celdas} size={26} />
      <b className="big center"><em>{llenas}</em> de {PANAL} manos dadas</b>
      {ejemplos > 0 && <span className="ej-note center">{ejemplos} {ejemplos === 1 ? 'es' : 'son'} de ejemplo</span>}
      <p className="center">Si lo llenamos antes del domingo, la colmena elige el tema del próximo encuentro.</p>
      {manos.length > 0 && (
        <div className="ultimas">
          <span className="k">Últimas manos</span>
          {manos.slice(0, 3).map((m) => {
            const a = c.perfil(m.ayuda), b = c.perfil(m.recibe)
            return (
              <div key={m.publicacion_id + m.perfil_id} className="mano">
                <span className="pair"><Hex p={a} w={22} fs={8} /><i /><Hex p={b} w={22} fs={8} /></span>
                <p><b>{firstName(a?.nombre)}</b> le dio la mano a <b>{firstName(b?.nombre)}</b>{m.post.categorias[0] ? ` · ${m.post.categorias[0]}` : ''}{m.post.es_ejemplo && <Ejemplo p={{ es_ejemplo: true }} />}</p>
                <small>{hace(m.resuelta_at)}</small>
              </div>
            )
          })}
        </div>
      )}
      <button type="button" className="btn primary full" onClick={() => irTab('muro')}>Dar una mano</button>
    </section>
  )
}

function Propuestas({ nav, pedirPerfil }) {
  const c = useColmena()
  const toast = useToast()
  const r = c.reto
  const [link, setLink] = useState('')
  const [enviando, setEnviando] = useState(false)
  if (!r) return null
  const gente = c.participantes.filter((x) => x.reto_id === r.id)
  const mia = c.yo && gente.find((x) => x.perfil_id === c.yo.id)
  const conLink = gente.filter((x) => x.link)
    .map((x) => ({ ...x, votos: c.votos.filter((v) => v.reto_id === r.id && v.participante_id === x.perfil_id) }))
    .sort((a, b) => b.votos.length - a.votos.length)
  const abierto = new Date(r.cierra_en).getTime() > Date.now()

  const subir = async (e) => {
    e.preventDefault(); setEnviando(true)
    try { await c.unirseReto(r.id, link.trim()); setLink(''); toast('Propuesta subida. Que la colmena vote.') }
    catch (x) { toast(x.message, true) } finally { setEnviando(false) }
  }
  const votar = (x) => pedirPerfil('Para votar necesitas tu carnet.', async () => {
    try { await c.alternarVoto(r.id, x.perfil_id) } catch (e) { toast(e.message, true) }
  })

  return (
    <>
      {mia && abierto && (
        <form className="card submit" onSubmit={subir}>
          <span className="k">{mia.link ? 'Tu propuesta está arriba' : 'Ya te le mediste'}</span>
          <p className="soft">{mia.link ? 'Puedes cambiar el link cuando quieras antes de que cierre.' : 'Sube tu propuesta como link: Behance, Instagram o una carpeta de Drive.'}</p>
          <div className="inp"><input type="url" inputMode="url" placeholder={mia.link || 'https://'} value={link} onChange={(e) => setLink(e.target.value)} aria-label="Link de tu propuesta" /></div>
          <div className="duo">
            <button type="submit" className="btn ink" disabled={!/^https?:\/\/\S+\.\S+/.test(link.trim()) || enviando}>{enviando ? 'Subiendo…' : 'Subir propuesta'}</button>
            <button type="button" className="btn ghost" onClick={async () => { try { await c.salirReto(r.id); toast('Saliste del reto') } catch (e) { toast(e.message, true) } }}>Salirme</button>
          </div>
        </form>
      )}
      <div className="sec-h"><h3>Propuestas del reto</h3><span className="meta">{conLink.length}</span></div>
      {conLink.length === 0 ? (
        <p className="soft">Las propuestas aparecen aquí cuando alguien sube su link. La colmena vota con “Me sirve” y las 3 más votadas se muestran en el Encuentro.</p>
      ) : (
        <div className="cards">
          {conLink.map((x, i) => {
            const p = c.perfil(x.perfil_id)
            const voto = c.yo && x.votos.some((v) => v.votante_id === c.yo.id)
            const mio = c.yo && x.perfil_id === c.yo.id
            return (
              <div key={x.perfil_id} className="row-card">
                <button type="button" className="who" onClick={() => p && nav({ t: 'carnet', id: p.id })}>
                  <span className="rank">{String(i + 1).padStart(2, '0')}</span>
                  <Hex p={p} w={34} fs={12} />
                  <span className="who-t"><b>{p?.nombre}<Ejemplo p={p} /></b>{p?.es_ejemplo
                    ? <span>Propuesta de ejemplo, sin link</span>
                    : <a href={x.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>Ver propuesta <Icon n="ext" s={13} /></a>}</span>
                </button>
                <button type="button" className="sirve" aria-pressed={!!voto} disabled={mio} onClick={() => votar(x)}>
                  <Icon n="thumb" s={16} w={voto ? 2.2 : 1.7} />Me sirve<b>{x.votos.length}</b>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

function Ticket({ pedirPerfil }) {
  const c = useColmena()
  const toast = useToast()
  const [agenda, setAgenda] = useState(false)
  const e = c.encuentro
  if (!e) return null
  const asistentes = c.asistencias.filter((a) => a.encuentro_id === e.id).map((a) => c.perfil(a.perfil_id)).filter(Boolean)
  const voy = c.yo && asistentes.some((p) => p.id === c.yo.id)
  const ejIr = asistentes.filter((p) => p.es_ejemplo).length
  const fecha = fechaLarga(e.fecha)
  const alternar = () => pedirPerfil('Para apuntarte al encuentro necesitas tu carnet.', async () => {
    try { const on = await c.alternarAsistencia(e.id); toast(on ? '¡Te apuntaste! Te avisamos la fecha.' : 'Quitamos tu asistencia') }
    catch (err) { toast(err.message, true) }
  })
  return (
    <section className="ticket">
      <span className="k">Encuentro {String(e.numero).padStart(2, '0')} · cierre del mes</span>
      <h3>{e.titulo}</h3>
      <div className="facts">
        <span><Icon n="cal" s={16} />{fecha || 'Fecha por confirmar'}{e.hora_texto ? ` · ${e.hora_texto}` : ''}</span>
        {e.lugar && <span><Icon n="pin" s={16} />{e.lugar}</span>}
      </div>
      <div className="perf" aria-hidden="true" />
      <div className="ticket-foot">
        <div className="who-row">
          {asistentes.length > 0
            ? <><div className="stack">{asistentes.slice(0, 4).map((p) => <Hex key={p.id} p={p} w={24} fs={9} />)}</div><span>{asistentes.length} {asistentes.length === 1 ? 'quiere ir' : 'quieren ir'}{ejIr > 0 && <em className="ej-inline"> · {ejIr} de ejemplo</em>}</span></>
            : <><span className="ghosts"><i /><i /><i /></span><span>Sé el primero en apuntarte</span></>}
        </div>
        <button type="button" className={'btn sm ' + (voy ? 'ghost' : 'ink')} onClick={alternar}>{voy ? <><Icon n="check" s={15} w={2.4} />Vas</> : 'Quiero ir'}</button>
      </div>
      {e.agenda?.length > 0 && <button type="button" className="linkbtn" aria-expanded={agenda} onClick={() => setAgenda(!agenda)}>{agenda ? 'Ocultar agenda' : 'Ver agenda'}</button>}
      {agenda && (
        <ol className="agenda">
          {e.agenda.map((a, i) => <li key={i}><time className="mono">{a.hora}</time><div><b>{a.titulo}</b>{a.detalle && <span>{a.detalle}</span>}</div></li>)}
          {e.que_llevar && <li className="llevar"><Icon n="bag" s={16} /><div><b>Qué llevar</b><span>{e.que_llevar}</span></div></li>}
        </ol>
      )}
    </section>
  )
}
