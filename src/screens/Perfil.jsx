import { useState } from 'react'
import { useColmena } from '../lib/store'
import { CATS } from '../data/contenido'
import { carnetId } from '../lib/format'
import { SubHeader, useToast } from '../components/ui'

// Crear carnet (sin cuenta) o editarlo
export default function Perfil({ modo = 'crear', motivo, onBack, onListo }) {
  const c = useColmena()
  const toast = useToast()
  const base = modo === 'editar' && c.yo ? c.yo : null
  const [f, setF] = useState({
    nombre: base?.nombre || '', marca: base?.marca || '', rol: base?.rol || '',
    categorias: base?.categorias || [], habilidades: (base?.habilidades || []).join(', '), instagram: base?.instagram || ''
  })
  const [acepto, setAcepto] = useState(modo === 'editar')
  const [enviando, setEnviando] = useState(false)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const toggle = (x) => setF({ ...f, categorias: f.categorias.includes(x) ? f.categorias.filter((y) => y !== x) : f.categorias.length < 3 ? [...f.categorias, x] : f.categorias })

  const valido = f.nombre.trim().length >= 2 && acepto

  const enviar = async (e) => {
    e.preventDefault()
    if (!valido) return
    setEnviando(true); setErr('')
    const datos = {
      ...f,
      instagram: f.instagram.trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/.*$/, ''),
      habilidades: f.habilidades.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 8)
    }
    try {
      if (modo === 'editar') { await c.actualizarPerfil(datos); toast('Carnet actualizado') }
      else { const r = await c.crearPerfil(datos); toast(`Bienvenido. Tu carnet es ${carnetId(r.carnet)}`) }
      onListo()
    } catch (x) { setErr(x.message) } finally { setEnviando(false) }
  }

  return (
    <>
      <SubHeader title={modo === 'editar' ? 'Editar carnet' : 'Tu carnet'} onBack={onBack} />
      <form className="body fade" onSubmit={enviar}>
        {modo === 'crear' && (
          <p style={{ margin: '0 0 18px', fontSize: 15, lineHeight: 1.5, color: 'var(--ink-2)' }}>
            {motivo || 'Sin contraseñas ni correos.'} Cuéntale a la colmena quién eres y qué haces; toma menos de un minuto.
          </p>
        )}
        <div className="form">
          <div className="field">
            <label htmlFor="p-nombre">Tu nombre *</label>
            <div className="inp"><input id="p-nombre" required maxLength={60} autoComplete="name" value={f.nombre} onChange={set('nombre')} placeholder="Como te conocen" /></div>
          </div>
          <div className="field">
            <label htmlFor="p-marca">Tu emprendimiento o marca</label>
            <div className="inp"><input id="p-marca" maxLength={60} value={f.marca} onChange={set('marca')} placeholder="Si aún no tiene nombre, déjalo vacío" /></div>
          </div>
          <div className="field">
            <label htmlFor="p-rol">¿Qué haces?</label>
            <div className="inp"><input id="p-rol" maxLength={60} value={f.rol} onChange={set('rol')} placeholder="Ej: Fotografía de producto" /></div>
          </div>
          <div className="field">
            <span className="lbl">Categorías <span style={{ color: 'var(--ink-4)', fontWeight: 500 }}>(hasta 3)</span></span>
            <div className="chips wrap">
              {CATS.map((x) => <button key={x} type="button" className="chip" aria-pressed={f.categorias.includes(x)} onClick={() => toggle(x)}>{x}</button>)}
            </div>
          </div>
          <div className="field">
            <label htmlFor="p-hab">Lo que sabes hacer</label>
            <div className="inp"><input id="p-hab" maxLength={200} value={f.habilidades} onChange={set('habilidades')} placeholder="Separado por comas: retoque, reels, empaques" /></div>
            <span className="hint">Así te encuentran en el directorio.</span>
          </div>
          <div className="field">
            <label htmlFor="p-ig">Instagram</label>
            <div className="inp"><span className="pre">@</span><input id="p-ig" maxLength={40} autoCapitalize="none" autoCorrect="off" value={f.instagram} onChange={set('instagram')} placeholder="opcional" /></div>
            <span className="hint">Es la forma en que otros miembros te pueden escribir.</span>
          </div>

          {modo === 'crear' && (
            <label className="consent">
              <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
              <span>
                Acepto que mi nombre, marca, rol, habilidades e Instagram sean visibles para los miembros de Colmena.
                Colmena es un prototipo académico del Proyecto de Grado de Diseño de Comunicación Visual (Pontificia Universidad Javeriana Cali);
                los datos se usan solo dentro de la app y para analizar su uso de forma agregada, conforme a la Ley 1581 de 2012.
                Puedo borrar mi perfil cuando quiera desde mi carnet.
              </span>
            </label>
          )}
          {err && <p className="err">{err}</p>}
          <button type="submit" className="btn primary full" disabled={!valido || enviando}>
            {enviando ? 'Guardando…' : modo === 'editar' ? 'Guardar cambios' : 'Entrar a la colmena'}
          </button>
          <div className="gap-16" />
        </div>
      </form>
    </>
  )
}
