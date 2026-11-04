import { useState } from 'react'
import { useColmena } from '../lib/store'
import { firstName, hace } from '../lib/format'
import { semanaDelMes } from '../lib/logic'
import { Icon, Hex, Ejemplo, Sheet, useToast } from '../components/ui'

// El mes en Colmena: escribes tu meta, cuentas tu avance cada semana y lo muestras en el encuentro.
const IDEAS = ['Conseguir mi primer cliente', 'Lanzar mi tienda en Instagram', 'Terminar mi logo', 'Calcular mis precios']
const RUTA = [['Semana 1', 'Escribe tu meta'], ['Semana 2', 'Cuenta tu avance'], ['Semana 3', 'Cuenta tu avance'], ['Encuentro', 'Muéstralo']]

export default function TuMes({ nav, pedirPerfil }) {
  const c = useColmena()
  const e = c.encuentro
  if (!e) return null
  const semana = semanaDelMes()
  const delMes = c.metas.filter((m) => m.encuentro_id === e.id)
  const mia = c.yo && delMes.find((m) => m.perfil_id === c.yo.id)
  const otras = delMes.filter((m) => m !== mia)
    .sort((a, b) => (c.perfil(a.perfil_id)?.es_ejemplo - c.perfil(b.perfil_id)?.es_ejemplo) || (new Date(b.updated_at) - new Date(a.updated_at)))
  const muestran = delMes.filter((m) => m.muestra)

  return (
    <section className="mes" aria-label="Tu meta del mes">
      <div className="sec-h"><h3>Tu meta del mes</h3></div>
      <ol className="mes-ruta" aria-label={`Vas en la semana ${Math.min(semana, 3)} del mes`}>
        {RUTA.map(([t, d], i) => (
          <li key={t} className={i + 1 < semana ? 'ok' : i + 1 === semana ? 'now' : ''}>
            <span className="mr-n">{i + 1 < semana ? <Icon n="check" s={12} w={3} /> : i === 3 ? <Icon n="cal" s={12} w={2.2} /> : i + 1}</span>
            <b>{d}</b><small>{t}</small>
          </li>
        ))}
      </ol>
      {mia ? <MiMeta meta={mia} e={e} /> : <NuevaMeta e={e} pedirPerfil={pedirPerfil} />}

      {otras.length > 0 && (
        <>
          <div className="sec-h"><h3>Metas de otros miembros</h3></div>
          <div className="metas">
            {otras.slice(0, 6).map((m) => <MetaCard key={m.id} m={m} nav={nav} />)}
          </div>
        </>
      )}
      {muestran.length > 0 && (
        <div className="muestra">
          <span className="stack">{muestran.slice(0, 5).map((m) => <Hex key={m.id} p={c.perfil(m.perfil_id)} w={26} fs={9} />)}</span>
          <p><b>{muestran.map((m) => firstName(c.perfil(m.perfil_id)?.nombre)).slice(0, 3).join(', ')}{muestran.length > 3 ? ' y más' : ''}</b> {muestran.length === 1 ? 'muestra' : 'muestran'} su avance en el encuentro{muestran.some((m) => c.perfil(m.perfil_id)?.es_ejemplo) ? ' (de ejemplo)' : ''}. Cada persona tiene 3 minutos.</p>
        </div>
      )}
    </section>
  )
}

function NuevaMeta({ e, pedirPerfil, inicial = '', onListo }) {
  const c = useColmena()
  const toast = useToast()
  const [t, setT] = useState(inicial)
  const [enviando, setEnviando] = useState(false)
  const ok = t.trim().length >= 5
  const guardar = () => pedirPerfil('Necesitas un carnet para escribir tu meta.', async () => {
    setEnviando(true)
    try { await c.guardarMeta(e.id, t.trim()); toast('Guardamos tu meta. Cuéntanos cómo vas cada semana.'); onListo?.() }
    catch (x) { toast(x.message, true) } finally { setEnviando(false) }
  })
  return (
    <div className="mi-meta nueva">
      <label htmlFor="meta-t"><b>¿Qué quieres lograr antes del encuentro?</b><span>Una meta corta y concreta. Escribirla y contar tu avance cada semana te ayuda a cumplirla.</span></label>
      <div className="ta"><textarea id="meta-t" maxLength={120} value={t} onChange={(x) => setT(x.target.value)} placeholder="Ej: conseguir mi primer cliente" /><span className="counter">{t.length}/120</span></div>
      <div className="meta-ideas">{IDEAS.map((x) => <button key={x} type="button" className="chip sm" onClick={() => setT(x)}>{x}</button>)}</div>
      <button type="button" className="btn primary full" disabled={!ok || enviando} onClick={guardar}>{enviando ? 'Guardando…' : 'Guardar mi meta'}</button>
    </div>
  )
}

function MiMeta({ meta, e }) {
  const c = useColmena()
  const toast = useToast()
  const [contar, setContar] = useState(false)
  const [editar, setEditar] = useState(false)
  const mios = c.avances.filter((a) => a.meta_id === meta.id)
  const ultimo = mios[0]
  const muestra = async () => {
    try { const on = await c.alternarMuestra(e.id); toast(on ? 'Listo. En el encuentro tienes 3 minutos para mostrar tu avance.' : 'Ya no estás en la muestra.') } catch (x) { toast(x.message, true) }
  }
  const cumplida = async () => {
    try { await c.marcarMetaCumplida(e.id, !meta.cumplida); toast(meta.cumplida ? 'Tu meta sigue en curso.' : 'Meta cumplida. Sumaste 2 puntos a tu nivel.') } catch (x) { toast(x.message, true) }
  }
  if (editar) return <NuevaMeta e={e} pedirPerfil={(_, fn) => fn()} inicial={meta.texto} onListo={() => setEditar(false)} />
  return (
    <div className={'mi-meta' + (meta.cumplida ? ' cumplida' : '')}>
      <div className="mm-top">
        <span className="k">{meta.cumplida ? 'Meta cumplida' : 'Tu meta'}</span>
        <button type="button" className="linkbtn tiny light" onClick={() => setEditar(true)}>Cambiar</button>
      </div>
      <p className="mm-texto">{meta.texto}</p>
      {ultimo
        ? <p className="mm-ultimo"><Icon n="trend" s={15} /><span>{ultimo.texto} <small>· {hace(ultimo.created_at)}</small></span></p>
        : <p className="mm-ultimo vacio">Todavía no has contado ningún avance.</p>}
      <button type="button" className="btn primary full" onClick={() => setContar(true)}><Icon n="plus" s={16} w={2.4} />Contar mi avance</button>
      <div className="mm-acc">
        <button type="button" aria-pressed={meta.muestra} onClick={muestra}><Icon n={meta.muestra ? 'check' : 'spark'} s={16} w={2} />{meta.muestra ? 'Vas a mostrarlo' : 'Mostrar en el encuentro'}</button>
        <button type="button" className="ok" aria-pressed={meta.cumplida} onClick={cumplida}><Icon n="check" s={16} w={2.2} />{meta.cumplida ? 'Cumplida' : 'La cumplí'}</button>
      </div>
      <Sheet open={contar} onClose={() => setContar(false)} label="Contar mi avance">
        {contar && <Avance e={e} onListo={() => setContar(false)} />}
      </Sheet>
    </div>
  )
}

function Avance({ e, onListo }) {
  const c = useColmena()
  const toast = useToast()
  const [t, setT] = useState('')
  const [link, setLink] = useState('')
  const [enviando, setEnviando] = useState(false)
  const linkOk = !link.trim() || /^https?:\/\/\S+\.\S+/.test(link.trim())
  const ok = t.trim().length >= 3 && linkOk
  const enviar = async (x) => {
    x.preventDefault(); if (!ok) return
    setEnviando(true)
    try { await c.contarAvance(e.id, t.trim(), link.trim()); toast('Avance guardado'); onListo() }
    catch (err) { toast(err.message, true) } finally { setEnviando(false) }
  }
  return (
    <form className="ben-det" onSubmit={enviar}>
      <h2>¿Cómo vas?</h2>
      <p className="soft">Una frase basta: qué hiciste esta semana.</p>
      <div className="ta"><textarea maxLength={140} value={t} onChange={(x) => setT(x.target.value)} placeholder="Ej: mandé la cotización a dos clientes" aria-label="Tu avance" /><span className="counter">{t.length}/140</span></div>
      <div className="field"><label htmlFor="av-l">Link <small>(opcional)</small></label><div className="inp"><input id="av-l" type="url" inputMode="url" value={link} onChange={(x) => setLink(x.target.value)} placeholder="https://" /></div>{!linkOk && <span className="hint">El link debe empezar por https://</span>}</div>
      <button type="submit" className="btn primary full big" disabled={!ok || enviando}>{enviando ? 'Guardando…' : 'Guardar avance'}</button>
    </form>
  )
}

function MetaCard({ m, nav }) {
  const c = useColmena()
  const p = c.perfil(m.perfil_id)
  const ultimo = c.avances.find((a) => a.meta_id === m.id)
  return (
    <button type="button" className="meta-card" onClick={() => p && nav({ t: 'carnet', id: p.id })}>
      <span className="who"><Hex p={p} w={32} h={36} fs={12} /><span className="who-t"><b>{p?.nombre || 'Miembro'}<Ejemplo p={p} /></b>{(m.muestra || m.cumplida) && <span className={m.cumplida ? 'ok' : ''}>{m.cumplida ? 'Cumplida' : 'Lo muestra en el encuentro'}</span>}</span></span>
      <span className="mc-texto">{m.texto}</span>
      {ultimo && <span className="mc-ultimo"><Icon n="trend" s={14} />{ultimo.texto} · {hace(ultimo.created_at)}</span>}
    </button>
  )
}
