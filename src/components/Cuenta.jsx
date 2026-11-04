import { useState } from 'react'
import { useColmena } from '../lib/store'
import { Icon, useToast } from './ui'

// Guardar el carnet con el correo Javeriana para recuperarlo en otro celular o navegador
export function GuardarCarnet({ compacto = false }) {
  const c = useColmena()
  const toast = useToast()
  const [yendo, setYendo] = useState(false)
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
        <span>Así lo recuperas si cambias de celular o borras el navegador.</span>
      </div>
      <button type="button" className="btn ink sm" onClick={ir} disabled={yendo}>{yendo ? 'Abriendo…' : 'Guardar con correo Javeriana'}</button>
    </section>
  )
}

export function RecuperarCarnet() {
  const c = useColmena()
  const toast = useToast()
  const [yendo, setYendo] = useState(false)
  const ir = async () => {
    setYendo(true)
    try { await c.entrarConJaveriana('recuperar') } catch (e) { toast(e.message, true); setYendo(false) }
  }
  return (
    <button type="button" className="linkbtn recuperar" onClick={ir} disabled={yendo}>
      {yendo ? 'Abriendo…' : '¿Ya tienes carnet? Recupéralo con tu correo Javeriana'}
    </button>
  )
}
