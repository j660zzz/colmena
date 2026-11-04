import { useColmena } from '../lib/store'
import { destacadoActual } from '../lib/destacados'
import { useRelojRetos } from '../lib/reloj'
import { cierraEn, waLink } from '../lib/logic'
import { Icon, Hex, Ejemplo, useToast } from './ui'
import { EstadoDatos } from './EstadoDatos'
import { Aliados, Logo } from '../screens/Beneficios'
import { vigentes } from '../screens/Convocatorias'

export function Inicio({ nav, irTab, pedirPerfil }) {
  const c = useColmena()
  const ahora = useRelojRetos(c.retos)
  const ganador = destacadoActual(c.retos, c.participantes, c.votos, ahora)
  const perfil = ganador && c.perfil(ganador.perfil_id)
  const toast = useToast()
  const abierto = c.reto && Date.parse(c.reto.cierra_en) > ahora
  const participar = () => irTab('encuentro', 'enc-reto')
  const escribir = () =>
    pedirPerfil('Necesitas un carnet para escribirle.', async () => {
      if (perfil.es_ejemplo) {
        toast('Es un perfil de ejemplo. Con una persona real se abre WhatsApp.')
        return
      }
      try {
        const numero = await c.contactar(perfil.id)
        if (numero)
          location.href = waLink(
            numero,
            `Hola ${perfil.nombre}, vi tu emprendimiento destacado en Colmena.`,
          )
        else toast('Este miembro todavía no agregó su WhatsApp.')
      } catch (e) {
        toast(e.message, true)
      }
    })
  const feria = vigentes(c.convocatorias, ahora).find((x) => x.cierre)
  const taller = c.talleres[0]
  const beneficios = c.beneficios
    .filter(
      (b) =>
        b.tipo === 'digital' &&
        b.destacado &&
        ['Diseño', 'Web'].includes(b.categoria),
    )
    .slice(0, 2)
  return (
    <>
      <div className="home-saludo">
        <h1>
          {c.yo
            ? `Hola, ${c.yo.nombre.split(' ')[0]}`
            : 'Tu comunidad para emprender'}
        </h1>
        <p>Conoce miembros, encuentra descuentos y comparte lo que haces.</p>
      </div>
      <EstadoDatos nombres={['reto', 'participantes', 'votos']}>
        <section className="home-premio" aria-label="Destacado de la semana">
          <span className="k">
            <Icon n="star" s={16} /> Destacado de la semana
          </span>
          {perfil ? (
            <>
              <div className="home-ganador">
                <span className="home-avatar">
                  <Hex p={perfil} w={64} />
                </span>
                <div>
                  <h2>{perfil.marca || perfil.nombre}</h2>
                  <span>{perfil.nombre}</span>
                  <Ejemplo p={perfil} />
                </div>
              </div>
              <p>{perfil.habilidades.slice(0, 3).join(' · ') || perfil.rol}</p>
              <small>Ganó el reto: {ganador.reto.titulo}</small>
              <div className="home-acciones">
                <button
                  className="btn outline-w sm"
                  onClick={() => nav({ t: 'carnet', id: perfil.id })}
                >
                  Ver carnet <Icon n="right" s={16} />
                </button>
                <button className="btn outline-w sm" onClick={escribir}>
                  Escribirle
                </button>
              </div>
              {perfil.es_ejemplo && (
                <p className="home-nota">
                  Ejemplo: así se verá el emprendimiento ganador. No es una
                  persona real.
                </p>
              )}
            </>
          ) : (
            <>
              <h2>Tu emprendimiento puede estar aquí.</h2>
              <p>Gana el reto y consigue 7 días de exposición en el inicio.</p>
              <button className="btn outline-w sm" onClick={participar}>
                {abierto ? 'Participar en el reto' : 'Ver los retos'}{' '}
                <Icon n="right" s={16} />
              </button>
              <small>
                {abierto
                  ? cierraEn(c.reto.cierra_en)
                  : 'El próximo destacado se elige con los votos Útil.'}
              </small>
            </>
          )}
        </section>
      </EstadoDatos>
      <EstadoDatos nombres={['beneficios']}>
        <Aliados nav={nav} pedirPerfil={pedirPerfil} />
      </EstadoDatos>
      <EstadoDatos
        nombres={['reto', 'talleres', 'convocatorias', 'beneficios']}
      >
        <section className="home-semana" aria-label="Esta semana">
          <div className="sec-h">
            <h2>Esta semana</h2>
            <button className="ver" onClick={() => irTab('encuentro')}>
              Ver Encuentro
            </button>
          </div>
          <div className="home-pista">
            {abierto && (
              <button className="home-mini" onClick={participar}>
                <span className="k">
                  <Icon n="spark" s={16} /> Reto
                </span>
                <b>{c.reto.titulo}</b>
                <small>Premio: 7 días en el inicio</small>
                <span className="home-ir">
                  Participar <Icon n="right" s={16} />
                </span>
              </button>
            )}
            {taller && (
              <button
                className="home-mini"
                onClick={() => irTab('encuentro', 'enc-talleres')}
              >
                <span className="k">
                  <Icon n="bulb" s={16} /> Taller{' '}
                  {taller.es_ejemplo && <Ejemplo p={taller} />}
                </span>
                <b>{taller.titulo}</b>
                <small>
                  {taller.duracion} ·{' '}
                  {taller.modalidad === 'virtual' ? 'Virtual' : 'Presencial'}
                </small>
                <span className="home-ir">
                  Ver talleres <Icon n="right" s={16} />
                </span>
              </button>
            )}
            {feria && (
              <button
                className="home-mini"
                onClick={() => irTab('encuentro', 'enc-ferias')}
              >
                <span className="k">
                  <Icon n="hour" s={16} /> Convocatoria
                </span>
                <b>{feria.nombre}</b>
                <small>{cierraEn(feria.cierre)}</small>
                <span className="home-ir">
                  Ver convocatoria <Icon n="right" s={16} />
                </span>
              </button>
            )}
            {beneficios.map((b) => (
              <button
                key={b.id}
                className="home-mini"
                onClick={() => irTab('herramientas')}
              >
                <Logo b={b} s={36} />
                <b>{b.nombre}</b>
                <small>{b.oferta}</small>
                <span className="home-ir">
                  Ver Beneficios <Icon n="right" s={16} />
                </span>
              </button>
            ))}
            <button className="home-mini" onClick={() => nav({ t: 'calc' })}>
              <span className="k">
                <Icon n="cash" s={16} /> Herramienta
              </span>
              <b>Calcula cuánto cobrar</b>
              <small>Materiales, horas y gastos fijos.</small>
              <span className="home-ir">
                Abrir calculadora <Icon n="right" s={16} />
              </span>
            </button>
          </div>
        </section>
      </EstadoDatos>
    </>
  )
}
