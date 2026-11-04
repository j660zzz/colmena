import { useMemo, useState } from 'react'
import { useColmena } from '../lib/store'
import { destacadoActual } from '../lib/destacados'
import { construirDestacados, leerVistos } from '../lib/historias'
import { useRelojRetos } from '../lib/reloj'
import { cierraEn, waLink } from '../lib/logic'
import { Icon, Hex, Ejemplo, useToast } from './ui'
import { EstadoDatos } from './EstadoDatos'
import { FilaDestacados, VisorDestacados } from './Historias'
import { Aliados, Logo, rango } from '../screens/Beneficios'
import { vigentes } from '../screens/Convocatorias'

const unir = (n) => (n.length <= 1 ? n[0] || '' : `${n.slice(0, -1).join(', ')} y ${n[n.length - 1]}`)

// Datos que usan el encabezado, los destacados y las vitrinas; si una fuente falla, esa parte no se pinta.
function useHome() {
  const c = useColmena()
  const ahora = useRelojRetos(c.retos)
  const ganador = destacadoActual(c.retos, c.participantes, c.votos, ahora)
  const perfil = ganador && c.perfil(ganador.perfil_id)
  const abierto = !!c.reto && Date.parse(c.reto.cierra_en) > ahora
  return { c, ahora, ganador, perfil, abierto }
}

export function Inicio({ nav, irTab, pedirPerfil }) {
  const { c, ahora, ganador, perfil, abierto } = useHome()
  const toast = useToast()
  const [vistos, setVistos] = useState(leerVistos)
  const [visor, setVisor] = useState(null)
  const participar = () => irTab('encuentro', 'enc-reto')
  const disponibles = c.perfiles.filter((p) => p.disponible).slice(0, 4)
  const nDisp = c.perfiles.filter((p) => p.disponible).length

  const anillos = useMemo(() => construirDestacados({
    ahora, ganador, perfilGanador: perfil, reto: c.reto,
    participantes: c.reto ? c.participantes.filter((x) => x.reto_id === c.reto.id).length : 0,
    aliados: c.datos.beneficios?.disponible ? c.beneficios.filter((b) => b.tipo === 'aliado') : [],
    talleres: c.datos.talleres?.disponible ? c.talleres : [],
    convocatorias: c.datos.convocatorias?.disponible ? c.convocatorias : [],
    beneficios: c.datos.beneficios?.disponible ? c.beneficios.filter((b) => b.tipo === 'digital' && b.destacado).sort((x, y) => rango(x) - rango(y)) : []
  }), [ahora, ganador, perfil, c.reto, c.participantes, c.beneficios, c.talleres, c.convocatorias, c.datos])

  const cerrarVisor = () => { setVisor(null); setVistos(leerVistos()) }
  const ir = (d) => {
    cerrarVisor()
    if (d.tipo === 'tab') irTab(d.tab, d.ancla || null)
    else if (d.tipo === 'nav') nav(d.pantalla)
    else if (d.tipo === 'mostrar') pedirPerfil('Necesitas un carnet para usar los descuentos de aliados.', () => nav({ t: 'mostrar' }))
  }

  const escribir = () =>
    pedirPerfil('Necesitas un carnet para escribirle.', async () => {
      if (perfil.es_ejemplo) { toast('Es un perfil de ejemplo. Con una persona real se abre WhatsApp.'); return }
      try {
        const numero = await c.contactar(perfil.id)
        if (numero) location.href = waLink(numero, `Hola ${perfil.nombre}, vi tu emprendimiento destacado en Colmena.`)
        else toast('Este miembro todavía no agregó su WhatsApp.')
      } catch (e) { toast(e.message, true) }
    })

  return (
    <>
      <div className="home-saludo">
        <h1>{c.yo ? `Hola, ${c.yo.nombre.split(' ')[0]}` : 'Tu comunidad para emprender'}</h1>
        <p>{c.yo ? 'Esto es lo nuevo en la comunidad.' : 'Conoce miembros, encuentra descuentos y comparte lo que haces.'}</p>
        {disponibles.length > 0 && (
          <button type="button" className="home-disp" onClick={() => irTab('miembros')} aria-label={`${nDisp} miembros disponibles ahora. Ver miembros`}>
            <span className="stack">{disponibles.map((p) => <Hex key={p.id} p={p} w={26} fs={10} />)}</span>
            <span className="home-disp-t"><b>Disponibles ahora</b><span>{unir(disponibles.slice(0, 2).map((p) => p.nombre.split(' ')[0]))}{nDisp > 2 ? ` y ${nDisp - 2} más` : ''}{disponibles.every((p) => p.es_ejemplo) ? ' · Ejemplo' : ''}</span></span>
            <Icon n="right" s={16} w={2} />
          </button>
        )}
      </div>

      <FilaDestacados anillos={anillos} vistos={vistos} onAbrir={setVisor} />
      {visor !== null && <VisorDestacados anillos={anillos} inicial={visor} onCerrar={cerrarVisor} onIr={ir} />}

      <EstadoDatos nombres={['reto', 'participantes', 'votos']}>
        <section className={'home-premio' + (perfil ? ' con-ganador' : '')} aria-label="Destacado de la semana">
          <span className="k"><Icon n="star" s={16} /> Destacado de la semana</span>
          {perfil ? (
            <>
              <div className="home-ganador">
                <span className="home-avatar"><Hex p={perfil} w={64} /></span>
                <div>
                  <h2>{perfil.marca || perfil.nombre}</h2>
                  <span>{perfil.nombre}</span>
                  <Ejemplo p={perfil} />
                </div>
              </div>
              <p>{perfil.habilidades.slice(0, 3).join(' · ') || perfil.rol}</p>
              <small>Ganó el reto: {ganador.reto.titulo}</small>
              <div className="home-acciones">
                <button className="btn outline-w sm" onClick={() => nav({ t: 'carnet', id: perfil.id })}>Ver carnet <Icon n="right" s={16} /></button>
                <button className="btn outline-w sm" onClick={escribir}>Escribirle</button>
              </div>
              {perfil.es_ejemplo && <p className="home-nota">Ejemplo: así se verá el emprendimiento ganador. No es una persona real.</p>}
            </>
          ) : (
            <>
              <h2>Tu emprendimiento puede estar aquí.</h2>
              <ol className="home-ruta" aria-label="Cómo se gana">
                <li><i>1</i>Participa</li>
                <li><i>2</i>Reciben Útil</li>
                <li><i>3</i>7 días arriba</li>
              </ol>
              <div className="home-premio-pie">
                <button className="btn outline-w sm" onClick={participar}>{abierto ? 'Participar en el reto' : 'Ver los retos'} <Icon n="right" s={16} /></button>
                {abierto
                  ? <span className="cd">{cierraEn(c.reto.cierra_en)}</span>
                  : <small>El próximo destacado se elige con los votos Útil.</small>}
              </div>
            </>
          )}
        </section>
      </EstadoDatos>

      <EstadoDatos nombres={['beneficios']}>
        <Aliados nav={nav} pedirPerfil={pedirPerfil} limite={3} invitar onVerTodos={() => irTab('herramientas')} />
      </EstadoDatos>
    </>
  )
}

// Vitrina de novedades: pensada para intercalarse entre publicaciones.
export function VitrinaSemana({ nav, irTab }) {
  const { c, ahora, abierto } = useHome()
  const feria = vigentes(c.convocatorias, ahora).find((x) => x.cierre)
  const taller = c.talleres[0]
  const items = [
    abierto && { k: 'reto', ic: 'spark', et: 'Reto', t: c.reto.titulo, s: 'Premio: 7 días en el inicio', ir: 'Participar', go: () => irTab('encuentro', 'enc-reto') },
    taller && { k: 'taller', ic: 'bulb', et: 'Taller', ej: taller, t: taller.titulo, s: `${taller.duracion} · ${taller.modalidad === 'virtual' ? 'Virtual' : 'Presencial'}`, ir: 'Ver talleres', go: () => irTab('encuentro', 'enc-talleres') },
    feria && { k: 'conv', ic: 'hour', et: 'Convocatoria', t: feria.nombre, s: cierraEn(feria.cierre), ir: 'Ver convocatoria', go: () => irTab('encuentro', 'enc-ferias') },
    { k: 'calc', ic: 'cash', et: 'Herramienta', t: 'Calcula cuánto cobrar', s: 'Materiales, horas y gastos fijos.', ir: 'Abrir calculadora', go: () => nav({ t: 'calc' }) }
  ].filter(Boolean)
  return (
    <EstadoDatos nombres={['reto', 'talleres', 'convocatorias']}>
      <section className="home-semana" aria-label="Esta semana">
        <div className="sec-h"><h2>Esta semana</h2><button type="button" className="ver" onClick={() => irTab('encuentro')}>Ver Encuentro</button></div>
        <div className="home-pista">
          {items.map((x) => (
            <button key={x.k} type="button" className="home-mini" onClick={x.go}>
              <span className="k"><Icon n={x.ic} s={16} /> {x.et} {x.ej?.es_ejemplo && <Ejemplo p={x.ej} />}</span>
              <b>{x.t}</b>
              <small>{x.s}</small>
              <span className="home-ir">{x.ir} <Icon n="right" s={16} /></span>
            </button>
          ))}
        </div>
      </section>
    </EstadoDatos>
  )
}

// Beneficios que ya tienes por ser estudiante: lista corta con logo.
export function VitrinaGratis({ irTab }) {
  const c = useColmena()
  const lista = c.beneficios.filter((b) => b.tipo === 'digital' && b.destacado).sort((x, y) => rango(x) - rango(y)).slice(0, 3)
  if (!c.datos.beneficios?.disponible || lista.length === 0) return null
  return (
    <section className="home-gratis" aria-label="Beneficios para estudiantes">
      <div className="sec-h"><h2>Ya los tienes por ser estudiante</h2></div>
      <div className="home-gratis-lista">
        {lista.map((b) => (
          <button key={b.id} type="button" className="home-gratis-fila" onClick={() => irTab('herramientas')}>
            <Logo b={b} s={40} />
            <span><b>{b.nombre}</b><small>{b.oferta}</small></span>
            <em>{b.etiqueta || (b.gratis ? 'Gratis' : 'Ver')}</em>
          </button>
        ))}
      </div>
      <button type="button" className="ver" onClick={() => irTab('herramientas')}>Ver todos los beneficios</button>
    </section>
  )
}
