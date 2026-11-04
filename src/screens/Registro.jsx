import { useEffect, useState } from 'react'
import { useColmena } from '../lib/store'
import { CATS, SUGERENCIAS } from '../data/contenido'
import { carnetId } from '../lib/format'
import { completitud, manosDadas } from '../lib/logic'
import { Icon, Hex, SubHeader, CeldaAbierta, Comb, useToast } from '../components/ui'

const limpiarIg = (v) => v.trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/.*$/, '')
const soloDigitos = (v) => v.replace(/\D/g, '')
export const waValido = (v) => /^3\d{9}$/.test(soloDigitos(v).replace(/^57(?=3\d{9}$)/, ''))
// Si pegan el número con +57, se quita el indicativo antes de formatear
const fmtWa = (v) => { let d = soloDigitos(v); if (d.length > 10 && d.startsWith('57')) d = d.slice(2); d = d.slice(0, 10); return [d.slice(0, 3), d.slice(3, 6), d.slice(6)].filter(Boolean).join(' ') }

const COBRA = { dinero: 'Cobra en dinero', trueque: 'Prefiere intercambio', ambos: 'Dinero o intercambio' }

// El carnet como ficha: quién es, en qué te puede ayudar y cómo trabaja
export function CarnetCard({ p, numero, nota, estado }) {
  const c = useColmena()
  const real = !!p.id
  const sabe = (p.habilidades?.length ? p.habilidades : p.categorias || []).slice(0, 3)
  const ayudas = real ? manosDadas(c, p.id) : 0
  return (
    <div className="carnet">
      <Comb className="combmark" viewBox="0 0 210 250" r={26} w={230} h={270} x0={-16} y0={-20} stroke="rgba(15,15,13,.10)" />
      <div className="carnet-head">
        <div className="carnet-lockup"><CeldaAbierta s={18} color="var(--ink)" /><span className="carnet-brand">Colmena</span></div>
        <span className="carnet-badges">{nota && <span className="carnet-live">{nota}</span>}<span className="carnet-badge">MIEMBRO</span></span>
      </div>
      <div className="carnet-body">
        <Hex p={p.nombre ? p : null} w={60} h={66} fs={21} />
        <div className="carnet-info">
          <h3>{p.nombre || 'Tu nombre'}</h3>
          <p className="role">{[p.marca, p.rol].filter(Boolean).join(' · ') || (nota ? 'Tu marca · Lo que haces' : 'Miembro de Colmena')}</p>
        </div>
      </div>
      <div className="carnet-sabe">
        <span className="carnet-lbl">PUEDE AYUDARTE CON</span>
        <div className="carnet-skills">
          {sabe.length ? sabe.map((x) => <span key={x}>{x}</span>) : <><span className="vacio">Lo que sabes hacer</span><span className="vacio">Otra habilidad</span></>}
        </div>
      </div>
      {real && (
        <div className="carnet-datos">
          <span className={p.disponible ? 'on' : ''}><i />{p.disponible ? 'Disponible' : 'Sin cupo'}</span>
          {COBRA[p.intercambio] && <span>{COBRA[p.intercambio]}</span>}
          {ayudas > 0 && <span>{ayudas} {ayudas === 1 ? 'ayuda dada' : 'ayudas dadas'}</span>}
        </div>
      )}
      <div className="carnet-foot">
        <div className="carnet-col"><span className="carnet-lbl">N.º DE CARNET</span><span className="carnet-val mono">{numero ? carnetId(numero) : 'COL-····'}</span></div>
        <div className="carnet-col right">
          <span className="carnet-lbl">ESTADO</span>
          <span className="carnet-status"><i className="status-hex" />{estado || (p.es_ejemplo ? 'Ejemplo' : 'Activa · DCV')}</span>
        </div>
      </div>
    </div>
  )
}

export default function Registro({ motivo, onBack, onListo }) {
  const c = useColmena()
  const [paso, setPaso] = useState(1)
  const [f, setF] = useState({ nombre: '', marca: '', rol: '', whatsapp: '', instagram: '', categorias: [], habilidades: [] })
  const [nueva, setNueva] = useState('')
  const [acepto, setAcepto] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: k === 'whatsapp' ? fmtWa(e.target.value) : e.target.value })
  const toggle = (x) => setF({ ...f, categorias: f.categorias.includes(x) ? f.categorias.filter((y) => y !== x) : f.categorias.length < 3 ? [...f.categorias, x] : f.categorias })

  // Habilidades: se eligen de las sugerencias o se escriben (máximo 5)
  const MAX_HAB = 5
  const tieneHab = (x) => f.habilidades.some((h) => h.toLowerCase() === x.toLowerCase())
  const alternarHab = (x) => setF({ ...f, habilidades: tieneHab(x) ? f.habilidades.filter((h) => h.toLowerCase() !== x.toLowerCase()) : f.habilidades.length < MAX_HAB ? [...f.habilidades, x] : f.habilidades })
  const agregarHab = () => {
    const x = nueva.trim().replace(/\s+/g, ' ').slice(0, 30)
    if (x.length >= 2 && !tieneHab(x) && f.habilidades.length < MAX_HAB) setF({ ...f, habilidades: [...f.habilidades, x] })
    setNueva('')
  }
  const sugeridas = [...new Set(f.categorias.flatMap((k) => SUGERENCIAS[k] || []))].filter((x) => !tieneHab(x)).slice(0, 8)

  const ok = paso === 1 ? f.nombre.trim().length >= 2 : paso === 2 ? waValido(f.whatsapp) && acepto : f.categorias.length > 0 && f.habilidades.length > 0

  const siguiente = async (e) => {
    e.preventDefault()
    if (!ok) return
    if (paso < 3) { setPaso(paso + 1); setErr(''); return }
    setEnviando(true); setErr('')
    try {
      await c.crearPerfil({
        ...f, instagram: limpiarIg(f.instagram),
        habilidades: f.habilidades
      })
      onListo()
    } catch (x) { setErr(x.message) } finally { setEnviando(false) }
  }

  const titulos = ['', 'Tus datos', 'Contacto', 'Lo que haces']

  return (
    <>
      <SubHeader title="Crea tu carnet" onBack={paso > 1 ? () => setPaso(paso - 1) : onBack} />
      <div className="steps-bar" aria-hidden="true">{[1, 2, 3].map((i) => <i key={i} className={i <= paso ? 'on' : ''} />)}</div>
      <form className="body fade" onSubmit={siguiente}>
        <CarnetCard p={f} nota="Vista previa" estado="Por crear" />
        <p className="step-t">Paso {paso} de 3 · {titulos[paso]}</p>
        {paso === 1 && motivo && <p className="soft">{motivo}</p>}
        <div className="form">
          {paso === 1 && (
            <>
              <div className="field">
                <label htmlFor="r-nombre">Nombre *</label>
                <div className="inp"><input id="r-nombre" autoFocus required maxLength={60} autoComplete="name" value={f.nombre} onChange={set('nombre')} placeholder="Nombre y apellido" /></div>
              </div>
              <div className="field">
                <label htmlFor="r-marca">Emprendimiento o marca</label>
                <div className="inp"><input id="r-marca" maxLength={60} value={f.marca} onChange={set('marca')} placeholder="Opcional" /></div>
              </div>
              <div className="field">
                <label htmlFor="r-rol">¿A qué te dedicas?</label>
                <div className="inp"><input id="r-rol" maxLength={60} value={f.rol} onChange={set('rol')} placeholder="Ej: Fotografía de producto" /></div>
              </div>
            </>
          )}
          {paso === 2 && (
            <>
              <div className="field">
                <label htmlFor="r-wa">WhatsApp *</label>
                <div className="inp"><span className="pre mono">+57</span><input id="r-wa" className="mono" autoFocus inputMode="tel" autoComplete="tel-national" value={f.whatsapp} onChange={set('whatsapp')} placeholder="310 555 0142" /></div>
                <span className="hint"><Icon n="lock" s={14} />Solo lo ven otros miembros. No es público.</span>
              </div>
              <div className="field">
                <label htmlFor="r-ig">Instagram <small>(opcional)</small></label>
                <div className="inp"><span className="pre">@</span><input id="r-ig" maxLength={40} autoCapitalize="none" autoCorrect="off" value={f.instagram} onChange={set('instagram')} placeholder="tumarca" /></div>
              </div>
              <label className="consent">
                <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
                <span>
                  Acepto que mi nombre, marca, rol, habilidades y WhatsApp sean visibles para los miembros de Colmena.
                  Prototipo académico del Proyecto de Grado de Diseño de Comunicación Visual, Pontificia Universidad Javeriana Cali.
                  Mis datos se usan solo dentro de la app y para analizar su uso de forma agregada, conforme a la <u>Ley 1581 de 2012</u>.
                  Puedo borrar mi perfil cuando quiera desde mi carnet.
                </span>
              </label>
            </>
          )}
          {paso === 3 && (
            <>
              <div className="field">
                <span className="lbl">Categorías * <small>(hasta 3)</small></span>
                <div className="chips wrap">
                  {CATS.map((x) => <button key={x} type="button" className="chip" aria-pressed={f.categorias.includes(x)} onClick={() => toggle(x)}>{x}</button>)}
                </div>
                <span className="hint">Las usamos para mostrarte publicaciones que te pueden interesar.</span>
              </div>
              <div className="field">
                <span className="lbl">¿En qué puedes ayudar? * <small>(hasta {MAX_HAB})</small></span>
                <span className="hint">Así te encuentran en Miembros y aparece en tu carnet.</span>
                {f.habilidades.length > 0 && (
                  <div className="chips wrap hab-elegidas">
                    {f.habilidades.map((x) => (
                      <button key={x} type="button" className="chip" aria-pressed="true" onClick={() => alternarHab(x)} aria-label={`Quitar ${x}`}>{x}<Icon n="x" s={13} w={2.4} /></button>
                    ))}
                  </div>
                )}
                {sugeridas.length > 0 && f.habilidades.length < MAX_HAB && (
                  <div className="chips wrap">
                    {sugeridas.map((x) => <button key={x} type="button" className="chip sm" onClick={() => alternarHab(x)}><Icon n="plus" s={13} w={2.4} />{x}</button>)}
                  </div>
                )}
                {f.habilidades.length < MAX_HAB && (
                  <div className="inp hab-otra">
                    <input id="r-hab" maxLength={30} value={nueva} onChange={(e) => setNueva(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); agregarHab() } }}
                      placeholder={f.categorias.length ? 'Escribe otra habilidad' : 'Ej: retoque, reels, empaques'} aria-label="Escribe una habilidad" />
                    <button type="button" className="btn ink sm" disabled={nueva.trim().length < 2} onClick={agregarHab}>Agregar</button>
                  </div>
                )}
              </div>
            </>
          )}
          {err && <p className="err" role="alert">{err}</p>}
          <button type="submit" className="btn primary full big" disabled={!ok || enviando}>
            {enviando ? 'Creando tu carnet…' : paso < 3 ? 'Siguiente' : 'Crear carnet'}
          </button>
          {paso === 2 && f.whatsapp && !waValido(f.whatsapp) && <p className="fine center">Escribe un celular colombiano de 10 dígitos.</p>}
          <p className="fine center">No necesitas correo ni contraseña.</p>
        </div>
      </form>
    </>
  )
}

export function CarnetListo({ onMuro, onSeguir }) {
  const c = useColmena()
  const toast = useToast()
  const yo = c.yo
  if (!yo) return null
  const { pct, faltan } = completitud(yo)
  const compartir = async () => {
    const url = `${location.origin}/?carnet=${yo.id}`
    const data = { title: 'Mi carnet en Colmena', text: `Ya tengo mi carnet en Colmena, la red de emprendedores de DCV · ${carnetId(yo.carnet)}`, url }
    try {
      if (navigator.share) await navigator.share(data)
      else { await navigator.clipboard.writeText(`${data.text} ${url}`); toast('Enlace copiado') }
    } catch { /* cancelado */ }
  }
  return (
    <div className="listo">
      <Comb className="listo-comb" viewBox="0 0 200 200" r={22} w={220} h={220} x0={0} y0={0} stroke="rgba(15,15,13,.14)" />
      <div className="listo-in fade">
        <h1>Tu carnet<br />está listo.</h1>
        <CarnetCard p={yo} numero={yo.carnet} />
        <p className="listo-sub">Ya puedes publicar y escribirles a otros miembros.</p>
        <div className="earned">
          <span className="ehex"><Icon n="card" s={20} w={2} /></span>
          <span>Nueva insignia: <b>Miembro de Colmena</b></span>
        </div>
        <div className="pct-card">
          <b>Tu carnet ya va al {pct}%</b>
          <div className="prog"><i style={{ width: pct + '%' }} /></div>
          <span>{faltan.length ? `Siguiente: ${faltan[0].t.toLowerCase()}. Puedes completarlo en Editar.` : 'Tu carnet está completo.'}</span>
        </div>
        {onSeguir && <button type="button" className="btn ink full big" onClick={onSeguir}>Continuar</button>}
        <button type="button" className={'btn full ' + (onSeguir ? 'ghost' : 'ink big')} onClick={compartir}><Icon n="share" s={18} />Compartir mi carnet</button>
        <button type="button" className="btn ghost full" onClick={onMuro}>Ir al muro</button>
      </div>
    </div>
  )
}


export function Editar({ onBack }) {
  const c = useColmena()
  const toast = useToast()
  const b = c.yo
  const [f, setF] = useState({
    nombre: b?.nombre || '', marca: b?.marca || '', rol: b?.rol || '', categorias: b?.categorias || [],
    habilidades: (b?.habilidades || []).join(', '), instagram: b?.instagram || '', whatsapp: '',
    bio: b?.bio || '', disponible: b?.disponible ?? true, intercambio: b?.intercambio || '', portafolio: b?.portafolio || ''
  })
  const [enviando, setEnviando] = useState(false)
  const [err, setErr] = useState('')
  useEffect(() => { c.miWhatsapp().then((n) => n && setF((x) => ({ ...x, whatsapp: fmtWa(n.replace(/^57/, '')) }))).catch(() => {}) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  if (!b) return null
  const set = (k) => (e) => setF({ ...f, [k]: k === 'whatsapp' ? fmtWa(e.target.value) : e.target.value })
  const toggle = (x) => setF({ ...f, categorias: f.categorias.includes(x) ? f.categorias.filter((y) => y !== x) : f.categorias.length < 3 ? [...f.categorias, x] : f.categorias })
  const portOk = !f.portafolio.trim() || /^https?:\/\/\S+\.\S+/.test(f.portafolio.trim())
  const ok = f.nombre.trim().length >= 2 && (!f.whatsapp || waValido(f.whatsapp)) && portOk

  const guardar = async (e) => {
    e.preventDefault(); if (!ok) return
    setEnviando(true); setErr('')
    try {
      await c.actualizarPerfil({ ...f, instagram: limpiarIg(f.instagram), habilidades: f.habilidades.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 8) })
      toast('Carnet actualizado'); onBack()
    } catch (x) { setErr(x.message) } finally { setEnviando(false) }
  }
  const borrar = async () => {
    if (!confirm('Esto borra tu carnet, tus publicaciones y tu actividad de forma permanente. ¿Seguro?')) return
    try { await c.borrarPerfil(); toast('Tu perfil fue borrado'); onBack() } catch (x) { toast(x.message, true) }
  }

  return (
    <>
      <SubHeader title="Editar carnet" onBack={onBack} />
      <form className="body fade" onSubmit={guardar}>
        <div className="form">
          <div className="field"><label htmlFor="e-n">Nombre *</label><div className="inp"><input id="e-n" maxLength={60} value={f.nombre} onChange={set('nombre')} /></div></div>
          <div className="field"><label htmlFor="e-m">Emprendimiento o marca</label><div className="inp"><input id="e-m" maxLength={60} value={f.marca} onChange={set('marca')} placeholder="Opcional" /></div></div>
          <div className="field"><label htmlFor="e-r">¿A qué te dedicas?</label><div className="inp"><input id="e-r" maxLength={60} value={f.rol} onChange={set('rol')} placeholder="Ej: Fotografía de producto" /></div></div>
          <div className="field">
            <label htmlFor="e-w">WhatsApp</label>
            <div className="inp"><span className="pre mono">+57</span><input id="e-w" className="mono" inputMode="tel" value={f.whatsapp} onChange={set('whatsapp')} placeholder="310 555 0142" /></div>
            <span className="hint"><Icon n="lock" s={14} />Solo lo ven otros miembros.</span>
          </div>
          <div className="field"><label htmlFor="e-i">Instagram</label><div className="inp"><span className="pre">@</span><input id="e-i" maxLength={40} autoCapitalize="none" value={f.instagram} onChange={set('instagram')} placeholder="tumarca" /></div></div>
          <div className="field">
            <span className="lbl">Categorías <small>(hasta 3)</small></span>
            <div className="chips wrap">{CATS.map((x) => <button key={x} type="button" className="chip" aria-pressed={f.categorias.includes(x)} onClick={() => toggle(x)}>{x}</button>)}</div>
          </div>
          <div className="field"><label htmlFor="e-h">Habilidades</label><div className="inp"><input id="e-h" maxLength={200} value={f.habilidades} onChange={set('habilidades')} placeholder="Separadas por comas" /></div></div>
          <div className="field">
            <label htmlFor="e-b">Sobre ti</label>
            <div className="ta"><textarea id="e-b" maxLength={280} value={f.bio} onChange={set('bio')} placeholder="Qué haces, para quién y cómo trabajas. Dos o tres líneas." /><span className="counter">{f.bio.length}/280</span></div>
          </div>
          <div className="field">
            <span className="lbl">Disponibilidad</span>
            <div className="segbar" role="group" aria-label="Disponibilidad">
              <button type="button" aria-pressed={f.disponible} onClick={() => setF({ ...f, disponible: true })}>Disponible</button>
              <button type="button" aria-pressed={!f.disponible} onClick={() => setF({ ...f, disponible: false })}>Sin cupo</button>
            </div>
          </div>
          <div className="field">
            <span className="lbl">¿Cómo prefieres trabajar?</span>
            <div className="segbar" role="group" aria-label="Forma de pago">
              {[['dinero', 'Dinero'], ['trueque', 'Intercambio'], ['ambos', 'Ambos']].map(([k, t]) => (
                <button key={k} type="button" aria-pressed={f.intercambio === k} onClick={() => setF({ ...f, intercambio: f.intercambio === k ? '' : k })}>{t}</button>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="e-p">Link de portafolio</label>
            <div className="inp"><input id="e-p" type="url" inputMode="url" autoCapitalize="none" maxLength={200} value={f.portafolio} onChange={set('portafolio')} placeholder="https://www.behance.net/tu-usuario" /></div>
            {!portOk && <span className="hint">El link debe empezar por https://</span>}
          </div>
          {err && <p className="err" role="alert">{err}</p>}
          <button type="submit" className="btn primary full big" disabled={!ok || enviando}>{enviando ? 'Guardando…' : 'Guardar cambios'}</button>
          <div className="center"><button type="button" className="linkbtn danger" onClick={borrar}>Borrar mi perfil y mis datos</button></div>
        </div>
      </form>
    </>
  )
}
