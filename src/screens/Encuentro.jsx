import { useState } from 'react'
import { useColmena } from '../lib/store'
import { fechaLarga, firstName, hace, initials } from '../lib/format'
import { panalSemana, semanaDelMes, PANAL } from '../lib/logic'
import { Icon, Hex, Ejemplo, Header, Titulo, Panal, useToast } from '../components/ui'
import { RetoCard } from './Muro'
import Convocatorias, { vigentes } from './Convocatorias'

export default function Encuentro({ nav, irTab, pedirPerfil, headerRight }) {
  const c = useColmena()
  const semana = semanaDelMes()
  const ruta = [['Semana 1', 1], ['Semana 2', 2], ['Semana 3', 3], ['Encuentro', 4]]
  const nConv = vigentes(c.convocatorias).length

  return (
    <>
      <Header right={headerRight} />
      <div className="body fade">
        <Titulo title="Encuentro" sub="El encuentro del mes, ferias y convocatorias en Cali, y el reto de la semana." />
        <nav className="enc-saltos" aria-label="Secciones de Encuentro">
          {[['enc-ticket', 'Encuentro', 'cal'], ['enc-ferias', `Ferias y convocatorias${nConv ? ` · ${nConv}` : ''}`, 'bag'], ['enc-reto', 'Reto', 'spark'], ['enc-panal', 'Panal', 'hand']].map(([id, t, ic]) => (
            <button key={id} type="button" onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><Icon n={ic} s={15} />{t}</button>
          ))}
        </nav>
        <div id="enc-ticket"><Ticket pedirPerfil={pedirPerfil} /></div>
        <div id="enc-ferias"><Convocatorias /></div>
        <div id="enc-reto" className="route" aria-label={`Vas en la semana ${semana} del mes`}>
          {ruta.map(([t, i]) => (
            <div key={t} className={'node' + (i < semana ? ' done' : i === semana ? ' now' : '') + (i === 4 ? ' end' : '')}>
              <span className="nh">{i === 4 ? <Icon n="cal" s={14} w={2} /> : i < semana ? <Icon n="check" s={12} w={3} /> : null}</span>
              <small>{t}</small>
              {i === semana && <em>Estás aquí</em>}
            </div>
          ))}
        </div>
        <p className="fine center">Tres semanas en la app y un encuentro presencial al final del mes.</p>

        <RetoCard irTab={irTab} pedirPerfil={pedirPerfil} completo />
        <Propuestas nav={nav} pedirPerfil={pedirPerfil} />
        <div id="enc-panal"><PanalGrande irTab={irTab} /></div>
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
      <b className="big center"><em>{llenas}</em> de {PANAL} ayudas esta semana</b>
      {ejemplos > 0 && <span className="ej-note center">{ejemplos} {ejemplos === 1 ? 'es' : 'son'} de ejemplo</span>}
      <p className="center">Cada ayuda confirmada llena una celda. El panal se reinicia cada lunes.</p>
      {manos.length > 0 && (
        <div className="ultimas">
          <span className="k">Últimas ayudas</span>
          {manos.slice(0, 3).map((m) => {
            const a = c.perfil(m.ayuda), b = c.perfil(m.recibe)
            return (
              <div key={m.publicacion_id + m.perfil_id} className="mano">
                <span className="pair"><Hex p={a} w={22} fs={8} /><i /><Hex p={b} w={22} fs={8} /></span>
                <p><b>{firstName(a?.nombre)}</b> ayudó a <b>{firstName(b?.nombre)}</b>{m.post.categorias[0] ? ` · ${m.post.categorias[0]}` : ''}{m.post.es_ejemplo && <Ejemplo p={{ es_ejemplo: true }} />}</p>
                <small>{hace(m.resuelta_at)}</small>
              </div>
            )
          })}
        </div>
      )}
      <button type="button" className="btn primary full" onClick={() => irTab('muro')}>Ver a quién ayudar</button>
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
    try { await c.unirseReto(r.id, link.trim()); setLink(''); toast('Propuesta publicada') }
    catch (x) { toast(x.message, true) } finally { setEnviando(false) }
  }
  const votar = (x) => pedirPerfil('Necesitas un carnet para votar.', async () => {
    try { await c.alternarVoto(r.id, x.perfil_id) } catch (e) { toast(e.message, true) }
  })

  return (
    <>
      {mia && abierto && (
        <form className="card submit" onSubmit={subir}>
          <span className="k">{mia.link ? 'Tu propuesta está publicada' : 'Ya estás participando'}</span>
          <p className="soft">{mia.link ? 'Puedes cambiar el link cuando quieras antes de que cierre.' : 'Sube tu propuesta como link de Behance, Instagram o Google Drive.'}</p>
          <div className="inp"><input type="url" inputMode="url" placeholder={mia.link || 'https://'} value={link} onChange={(e) => setLink(e.target.value)} aria-label="Link de tu propuesta" /></div>
          <div className="duo">
            <button type="submit" className="btn ink" disabled={!/^https?:\/\/\S+\.\S+/.test(link.trim()) || enviando}>{enviando ? 'Subiendo…' : 'Subir propuesta'}</button>
            <button type="button" className="btn ghost" onClick={async () => { try { await c.salirReto(r.id); toast('Ya no participas en el reto') } catch (e) { toast(e.message, true) } }}>Dejar de participar</button>
          </div>
        </form>
      )}
      <div className="sec-h"><h3>Propuestas del reto</h3><span className="meta">{conLink.length}</span></div>
      {conLink.length === 0 ? (
        <p className="soft">Aquí aparecen las propuestas cuando alguien sube su link. Los miembros votan con “Útil” y las tres más votadas se presentan en el encuentro.</p>
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
                  <Icon n="thumb" s={16} w={voto ? 2.2 : 1.7} />Útil<b>{x.votos.length}</b>
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
  const alternar = () => pedirPerfil('Necesitas un carnet para inscribirte al encuentro.', async () => {
    try { const on = await c.alternarAsistencia(e.id); toast(on ? 'Listo, quedaste inscrito. La fecha se publica aquí.' : 'Cancelaste tu inscripción') }
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
            : <><span className="ghosts"><i /><i /><i /></span><span>Nadie se ha inscrito todavía</span></>}
        </div>
        <button type="button" className={'btn sm ' + (voy ? 'ghost' : 'ink')} onClick={alternar}>{voy ? <><Icon n="check" s={15} w={2.4} />Inscrito</> : 'Quiero ir'}</button>
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
