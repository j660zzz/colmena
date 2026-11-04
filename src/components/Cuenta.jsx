import { useEffect, useState } from 'react'
import { useColmena } from '../lib/store'
import { Icon, useToast } from './ui'
import { SUPABASE_URL, SUPABASE_KEY } from '../lib/supabase'

// Solo consulta la configuración pública: no activa ni modifica el proveedor.
function useCorreoDisponible() {
  const [estado, setEstado] = useState('cargando')
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)
    let vigente = true
    ;(async () => {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_KEY }, signal: controller.signal })
      if (!r.ok) throw new Error('configuración no disponible')
      const data = await r.json()
      if (vigente) setEstado(data.external?.azure ? 'disponible' : 'inactivo')
    })().catch(() => { if (vigente) setEstado('error') })
      .finally(() => clearTimeout(timer))
    return () => { vigente = false; clearTimeout(timer); controller.abort() }
  }, [])
  return estado
}

// Guardar el carnet con el correo Javeriana para recuperarlo en otro celular o navegador
export function GuardarCarnet({ compacto = false }) {
  const c = useColmena()
  const toast = useToast()
  const [yendo, setYendo] = useState(false)
  const correo = useCorreoDisponible()
  if (!c.yo) return null
  if (c.cuenta) {
    return (
      <p className="cuenta-ok"><Icon n="check" s={16} w={2.4} /><span>Guardado con <b>{c.cuenta}</b></span></p>
    )
  }
  const ir = async () => {
    setYendo(true)
    try { await c.entrarConJaveriana('vincular') } catch (e) { toast(e.message, true); setYendo(false) }
  }
  return (
    <section className={'guardar' + (compacto ? ' compacto' : '')} aria-label="Guarda tu carnet">
      <span className="guardar-ic"><Icon n="lock" s={18} /></span>
      <div>
        <b>Guarda tu carnet</b>
        <span>{correo === 'inactivo' ? 'Guardar con correo Javeriana todavía no está disponible. Tu carnet sigue guardado en este navegador.' : 'Así lo recuperas si cambias de celular o borras los datos del navegador.'}</span>
      </div>
      <button type="button" className="btn ink sm" onClick={ir} disabled={yendo || correo === 'cargando' || correo === 'inactivo'}>{yendo ? 'Abriendo…' : correo === 'cargando' ? 'Comprobando disponibilidad…' : 'Guardar con correo Javeriana'}</button>
    </section>
  )
}

export function RecuperarCarnet() {
  const c = useColmena()
  const toast = useToast()
  const [yendo, setYendo] = useState(false)
  const correo = useCorreoDisponible()
  const ir = async () => {
    setYendo(true)
    try { await c.entrarConJaveriana('recuperar') } catch (e) { toast(e.message, true); setYendo(false) }
  }
  if (correo === 'inactivo') return <p className="fine center">Recuperar con correo Javeriana todavía no está disponible.</p>
  return (
    <button type="button" className="linkbtn recuperar" onClick={ir} disabled={yendo || correo === 'cargando' || correo === 'inactivo'}>
      {yendo ? 'Abriendo…' : correo === 'cargando' ? 'Comprobando recuperación…' : '¿Ya tienes carnet? Recupéralo con tu correo Javeriana'}
    </button>
  )
}
