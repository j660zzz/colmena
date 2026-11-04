import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase, SUPABASE_URL, SUPABASE_KEY } from './supabase'
import { leerSesion, guardarSesion, borrarSesion } from './session'
import { AVATAR_COLORS } from './format'

const Ctx = createContext(null)
export const useColmena = () => useContext(Ctx)

const PERFIL_COLS = 'id,nombre,marca,rol,categorias,habilidades,instagram,color,carnet,es_ejemplo,tiene_whatsapp,created_at,bio,disponible,intercambio,portafolio'

// Mensajes del servidor reescritos para que digan qué pasó y qué hacer (las funciones RPC no se tocan)
const MENSAJES = {
  'Vas muy rápido. Espera unos minutos para volver a publicar.': 'Publicaste varias veces seguidas. Espera unos minutos y vuelve a intentarlo.',
  'Vas muy rápido. Espera un rato para escribir a más personas.': 'Les escribiste a muchas personas seguidas. Espera un rato y vuelve a intentarlo.',
  'Solo se califica una mano confirmada.': 'Solo puedes calificar una ayuda confirmada.',
  'No puedes darte la mano a ti mismo.': 'No puedes confirmar una ayuda contigo.',
  'Ese eres tú.': 'Esta publicación es tuya.',
  'Estado no válido': 'No se pudo guardar. Inténtalo otra vez.',
  'Ese correo ya guarda otro carnet.': 'Ese correo ya tiene otro carnet guardado. Entra con otro correo Javeriana.'
}

// Guardar el carnet con el correo Javeriana (cuenta Microsoft). Antes de salir hacia Microsoft se anota
// qué se quería hacer; al volver, se hace y se cierra la sesión de Auth.
const K_CUENTA = 'colmena.cuenta.pendiente'
const DOMINIO = '@javerianacali.edu.co'
async function microsoftActivo() {
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_KEY } })
    return !!(await r.json())?.external?.azure
  } catch { return false }
}

async function q(promise) {
  const { data, error } = await promise
  if (error) throw error
  return data
}

export function ColmenaProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion)
  const [perfiles, setPerfiles] = useState([])
  const [publicaciones, setPublicaciones] = useState([])
  const [ayudas, setAyudas] = useState([])
  const [conexiones, setConexiones] = useState([])
  const [asistencias, setAsistencias] = useState([])
  const [encuentro, setEncuentro] = useState(null)
  const [meSirve, setMeSirve] = useState([])
  const [reto, setReto] = useState(null)
  const [participantes, setParticipantes] = useState([])
  const [votos, setVotos] = useState([])
  const [resenas, setResenas] = useState([])
  const [beneficios, setBeneficios] = useState([])
  const [convocatorias, setConvocatorias] = useState([])
  const [metas, setMetas] = useState([])
  const [avances, setAvances] = useState([])
  const [pendientes, setPendientes] = useState({ confirmar: [], calificar: [] })
  const [cuenta, setCuenta] = useState(null)
  const [avisoCuenta, setAvisoCuenta] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorRed, setErrorRed] = useState(null)
  const perfilesRef = useRef(perfiles)
  perfilesRef.current = perfiles

  const cargar = {
    perfiles: async () => setPerfiles(await q(supabase.from('perfiles').select(PERFIL_COLS).order('created_at', { ascending: false }))),
    publicaciones: async () => setPublicaciones(await q(supabase.from('publicaciones').select('*').order('created_at', { ascending: false }).limit(300))),
    ayudas: async () => setAyudas(await q(supabase.from('ayudas').select('*'))),
    conexiones: async () => setConexiones(await q(supabase.from('conexiones').select('*'))),
    asistencias: async () => setAsistencias(await q(supabase.from('asistencias').select('*'))),
    meSirve: async () => setMeSirve(await q(supabase.from('me_sirve').select('*'))),
    reto: async () => {
      const rows = await q(supabase.from('retos').select('*').eq('activo', true).order('numero', { ascending: false }).limit(1))
      setReto(rows[0] || null)
    },
    participantes: async () => setParticipantes(await q(supabase.from('reto_participantes').select('*').order('created_at', { ascending: true }))),
    votos: async () => setVotos(await q(supabase.from('reto_votos').select('*'))),
    resenas: async () => setResenas(await q(supabase.rpc('resenas_publicas'))),
    beneficios: async () => setBeneficios(await q(supabase.from('beneficios').select('*').order('tipo').order('orden'))),
    metas: async () => setMetas(await q(supabase.from('metas').select('*').order('updated_at', { ascending: false }))),
    avances: async () => setAvances(await q(supabase.from('avances').select('*').order('created_at', { ascending: false }).limit(500))),
    convocatorias: async () => setConvocatorias(await q(supabase.from('convocatorias').select('*').eq('activo', true).order('orden'))),
    encuentro: async () => {
      const rows = await q(supabase.from('encuentros').select('*').eq('activo', true).order('numero', { ascending: false }).limit(1))
      setEncuentro(rows[0] || null)
    }
  }

  // Carga todo; si algo falla (red del celular que se despierta, por ejemplo) reintenta solo lo que falló
  const cargarTodo = useCallback(async () => {
    let pendientes = Object.entries(cargar)
    for (let intento = 0; intento < 3 && pendientes.length; intento++) {
      if (intento) await new Promise((r) => setTimeout(r, 1200 * intento))
      const res = await Promise.allSettled(pendientes.map(([, f]) => f()))
      res.forEach((r, i) => { if (r.status === 'rejected') console.warn('Colmena: falló', pendientes[i][0], r.reason) })
      pendientes = pendientes.filter((_, i) => res[i].status === 'rejected')
    }
    setErrorRed(pendientes.length ? 'No se pudo conectar. Revisa tu conexión.' : null)
    setCargando(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { cargarTodo() }, [cargarTodo])

  // Si llega actividad de alguien que aún no está en la lista, se recargan los perfiles
  const asegurar = (id) => { if (id && !perfilesRef.current.some((x) => x.id === id)) cargar.perfiles() }

  // Tiempo real: lo que publica uno lo ven todos sin recargar
  useEffect(() => {
    const ch = supabase.channel('colmena')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'publicaciones' }, (p) => {
        cargar.publicaciones()
        const autor = p.new?.autor_id
        if (autor && !perfilesRef.current.some((x) => x.id === autor)) cargar.perfiles()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ayudas' }, (p) => { cargar.ayudas(); cargarPendientes(); asegurar(p.new?.perfil_id) })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'me_sirve' }, () => cargar.meSirve())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reto_participantes' }, (p) => { cargar.participantes(); asegurar(p.new?.perfil_id) })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reto_votos' }, () => cargar.votos())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'asistencias' }, () => cargar.asistencias())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'metas' }, (p) => { cargar.metas(); asegurar(p.new?.perfil_id) })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'avances' }, () => cargar.avances())
      .subscribe()
    const t = setInterval(() => { cargar.perfiles(); cargar.resenas(); cargarPendientes() }, 45000)
    const vis = () => { if (document.visibilityState === 'visible') cargarTodo() }
    document.addEventListener('visibilitychange', vis)
    return () => { supabase.removeChannel(ch); clearInterval(t); document.removeEventListener('visibilitychange', vis) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // La sesión vive en un ref para que una acción pedida antes de sacar el carnet funcione al terminar el registro
  const sesionRef = useRef(sesion)
  sesionRef.current = sesion

  const yo = useMemo(() => (sesion ? perfiles.find((p) => p.id === sesion.id) || null : null), [sesion, perfiles])

  // Si el perfil guardado ya no existe en la base (lo borraron), se limpia la sesión
  useEffect(() => {
    if (!cargando && sesion && perfiles.length && !yo) { borrarSesion(); setSesion(null) }
  }, [cargando, sesion, perfiles, yo])

  const rpc = async (fn, args) => {
    const s = sesionRef.current
    if (!s) throw new Error('Necesitas un carnet para hacer esto.')
    const { data, error } = await supabase.rpc(fn, { p_id: s.id, p_clave: s.clave, ...args })
    if (error) {
      const m = error.message || ''
      if (m.includes('no autorizado')) throw new Error('No pudimos validar tu carnet en este dispositivo. Recarga la página e inténtalo otra vez.')
      if (/fetch|network|Failed/i.test(m)) throw new Error('No se pudo conectar. Revisa tu conexión e inténtalo otra vez.')
      throw new Error(MENSAJES[m] || m)
    }
    return data
  }

  async function cargarPendientes() {
    const s = sesionRef.current
    if (!s) { setPendientes({ confirmar: [], calificar: [] }); return }
    const { data, error } = await supabase.rpc('mis_pendientes', { p_id: s.id, p_clave: s.clave })
    if (!error && data) {
      setPendientes(data)
      const ids = [...data.confirmar.map((x) => x.perfil_id), ...data.calificar.map((x) => x.otro)]
      if (ids.some((id) => !perfilesRef.current.some((p) => p.id === id))) cargar.perfiles()
    }
  }
  useEffect(() => { cargarPendientes() }, [sesion]) // eslint-disable-line react-hooks/exhaustive-deps

  // Con qué correo está guardado el carnet de este dispositivo
  async function cargarCuenta() {
    const s = sesionRef.current
    if (!s) { setCuenta(null); return }
    const { data, error } = await supabase.rpc('mi_cuenta', { p_id: s.id, p_clave: s.clave })
    if (!error) setCuenta(data || null)
  }
  useEffect(() => { cargarCuenta() }, [sesion]) // eslint-disable-line react-hooks/exhaustive-deps

  // Al volver de Microsoft: vincular o recuperar, según lo que se pidió antes de salir
  useEffect(() => {
    let pend = null
    try { pend = localStorage.getItem(K_CUENTA) } catch { /* sin almacenamiento */ }
    if (!pend) return
    const params = new URLSearchParams(location.search + location.hash.replace(/^#/, '&'))
    const limpiar = () => {
      try { localStorage.removeItem(K_CUENTA) } catch { /* nada */ }
      history.replaceState(history.state, '', location.pathname)
    }
    ;(async () => {
      if (params.get('error')) {
        limpiar()
        setAvisoCuenta({ msg: 'No se pudo iniciar sesión con tu correo Javeriana. Inténtalo otra vez.', error: true })
        return
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      try {
        if (!(session.user?.email || '').toLowerCase().endsWith(DOMINIO)) {
          setAvisoCuenta({ msg: `Entraste con ${session.user?.email || 'otra cuenta'}. Usa tu correo ${DOMINIO}.`, error: true })
        } else if (pend === 'recuperar') {
          const { data, error } = await supabase.rpc('recuperar_carnet')
          if (error) throw new Error(MENSAJES[error.message] || error.message)
          if (!data) setAvisoCuenta({ msg: 'Ese correo no tiene un carnet guardado. Crea uno nuevo.', error: true })
          else {
            const s = { id: data.id, clave: data.clave }
            guardarSesion(s); sesionRef.current = s
            await cargar.perfiles()
            setSesion(s)
            setAvisoCuenta({ msg: 'Recuperaste tu carnet.' })
          }
        } else {
          const r = await rpc('vincular_cuenta', {})
          setCuenta(r?.correo || null)
          setAvisoCuenta({ msg: 'Tu carnet quedó guardado con tu correo Javeriana.' })
        }
      } catch (e) {
        setAvisoCuenta({ msg: e.message, error: true })
      } finally {
        limpiar()
        await supabase.auth.signOut().catch(() => {})
      }
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const acciones = {
    // modo: 'vincular' (guardar el carnet de este dispositivo) o 'recuperar' (traerlo a este dispositivo)
    async entrarConJaveriana(modo) {
      if (!(await microsoftActivo())) {
        throw new Error(modo === 'recuperar'
          ? 'Recuperar con el correo Javeriana todavía no está activo.'
          : 'Guardar con el correo Javeriana todavía no está activo. Mientras tanto, tu carnet queda guardado en este navegador.')
      }
      try { localStorage.setItem(K_CUENTA, modo) } catch { throw new Error('Tu navegador no deja guardar datos. Sal del modo privado e inténtalo otra vez.') }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: { scopes: 'email', redirectTo: location.origin + '/', queryParams: { domain_hint: DOMINIO.slice(1), prompt: 'select_account' } }
      })
      if (error) { try { localStorage.removeItem(K_CUENTA) } catch { /* nada */ } throw new Error('No se pudo abrir el inicio de sesión. Revisa tu conexión e inténtalo otra vez.') }
    },
    async crearPerfil(f) {
      const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
      const { data, error } = await supabase.rpc('crear_perfil', {
        p_nombre: f.nombre, p_marca: f.marca, p_rol: f.rol, p_categorias: f.categorias,
        p_habilidades: f.habilidades, p_instagram: f.instagram, p_color: color, p_whatsapp: f.whatsapp
      })
      if (error) throw new Error(error.message?.includes('WhatsApp') ? error.message : 'No pudimos crear tu carnet. Intenta de nuevo.')
      const s = { id: data.id, clave: data.clave }
      guardarSesion(s)
      sesionRef.current = s
      await cargar.perfiles()
      setSesion(s)
      return data
    },
    async proponerBeneficio(negocio, contacto, propuesta) {
      const s = sesionRef.current
      const { error } = await supabase.rpc('proponer_beneficio', { p_negocio: negocio, p_contacto: contacto, p_propuesta: propuesta, p_id: s?.id || null, p_clave: s?.clave || null })
      if (error) throw new Error(error.message?.includes('solicitudes') ? error.message : 'No se pudo enviar. Revisa los datos e intenta de nuevo.')
    },
    async actualizarPerfil(f) {
      await rpc('actualizar_perfil', {
        p_nombre: f.nombre, p_marca: f.marca, p_rol: f.rol, p_categorias: f.categorias,
        p_habilidades: f.habilidades, p_instagram: f.instagram, p_whatsapp: f.whatsapp || null,
        p_bio: f.bio ?? null, p_disponible: f.disponible ?? null, p_intercambio: f.intercambio ?? null, p_portafolio: f.portafolio ?? null
      })
      await cargar.perfiles()
    },
    miWhatsapp: () => rpc('mi_whatsapp', {}),
    async borrarPerfil() {
      await rpc('borrar_perfil', {})
      borrarSesion(); setSesion(null)
      await cargarTodo()
    },
    async publicar(tipo, texto, categorias, dias = 3) {
      const id = await rpc('publicar', { p_tipo: tipo, p_texto: texto, p_categorias: categorias, p_dias: dias })
      await cargar.publicaciones()
      return id
    },
    async contactar(perfilId, postId = null) {
      const n = await rpc('contactar', { p_perfil: perfilId, p_post: postId })
      if (postId) cargar.ayudas()
      return n
    },
    async confirmarMano(postId, perfilId, estado) {
      await rpc('confirmar_mano', { p_post: postId, p_perfil: perfilId, p_estado: estado })
      await Promise.all([cargar.ayudas(), cargarPendientes()])
    },
    async alternarMeSirve(postId) {
      const ya = meSirve.some((m) => m.publicacion_id === postId && m.perfil_id === sesionRef.current.id)
      setMeSirve((l) => ya ? l.filter((m) => !(m.publicacion_id === postId && m.perfil_id === sesionRef.current.id)) : [...l, { publicacion_id: postId, perfil_id: sesionRef.current.id }])
      try { return await rpc('alternar_me_sirve', { p_post: postId }) } catch (e) { cargar.meSirve(); throw e }
    },
    async calificar(postId, paraId, estrellas, chips, comentario) {
      const r = await rpc('calificar', { p_post: postId, p_para: paraId, p_estrellas: estrellas, p_chips: chips, p_comentario: comentario })
      await Promise.all([cargarPendientes(), cargar.resenas()])
      return r
    },
    async unirseReto(retoId, link = '') {
      await rpc('unirse_reto', { p_reto: retoId, p_link: link })
      await cargar.participantes()
    },
    async salirReto(retoId) {
      await rpc('salir_reto', { p_reto: retoId })
      await cargar.participantes()
    },
    async alternarVoto(retoId, participanteId) {
      const r = await rpc('alternar_voto_reto', { p_reto: retoId, p_participante: participanteId })
      await cargar.votos()
      return r
    },
    async marcarResuelta(id, resuelta = true) {
      setPublicaciones((l) => l.map((p) => p.id === id ? { ...p, resuelta_at: resuelta ? new Date().toISOString() : null } : p))
      try { await rpc('marcar_resuelta', { p_post: id, p_resuelta: resuelta }) } catch (e) { cargar.publicaciones(); throw e }
    },
    async borrarPublicacion(id) {
      setPublicaciones((l) => l.filter((p) => p.id !== id))
      await rpc('borrar_publicacion', { p_post: id })
    },
    async alternarAyuda(postId) {
      const ya = ayudas.some((a) => a.publicacion_id === postId && a.perfil_id === sesionRef.current.id)
      setAyudas((l) => ya ? l.filter((a) => !(a.publicacion_id === postId && a.perfil_id === sesionRef.current.id)) : [...l, { publicacion_id: postId, perfil_id: sesionRef.current.id }])
      try { return await rpc('alternar_ayuda', { p_post: postId }) } catch (e) { cargar.ayudas(); throw e }
    },
    async alternarConexion(aId) {
      const ya = conexiones.some((c) => c.de_id === sesionRef.current.id && c.a_id === aId)
      setConexiones((l) => ya ? l.filter((c) => !(c.de_id === sesionRef.current.id && c.a_id === aId)) : [...l, { de_id: sesionRef.current.id, a_id: aId }])
      try { return await rpc('alternar_conexion', { p_a: aId }) } catch (e) { cargar.conexiones(); throw e }
    },
    async guardarMeta(encId, texto) {
      await rpc('guardar_meta', { p_encuentro: encId, p_texto: texto })
      await cargar.metas()
    },
    async contarAvance(encId, texto, link) {
      await rpc('contar_avance', { p_encuentro: encId, p_texto: texto, p_link: link || null })
      await cargar.avances()
    },
    async alternarMuestra(encId) {
      const r = await rpc('alternar_muestra', { p_encuentro: encId })
      await cargar.metas()
      return r
    },
    async marcarMetaCumplida(encId, cumplida) {
      await rpc('marcar_meta_cumplida', { p_encuentro: encId, p_cumplida: cumplida })
      await cargar.metas()
    },
    async alternarAsistencia(encId) {
      const ya = asistencias.some((a) => a.encuentro_id === encId && a.perfil_id === sesionRef.current.id)
      setAsistencias((l) => ya ? l.filter((a) => !(a.encuentro_id === encId && a.perfil_id === sesionRef.current.id)) : [...l, { encuentro_id: encId, perfil_id: sesionRef.current.id }])
      try { return await rpc('alternar_asistencia', { p_encuentro: encId }) } catch (e) { cargar.asistencias(); throw e }
    }
  }

  const valor = {
    sesion, yo, beneficios, convocatorias, metas, avances, perfiles, publicaciones, ayudas, conexiones, asistencias, encuentro,
    meSirve, reto, participantes, votos, resenas, pendientes, cargarPendientes,
    cuenta, avisoCuenta, limpiarAvisoCuenta: () => setAvisoCuenta(null),
    cargando, errorRed, recargar: cargarTodo, ...acciones,
    perfil: (id) => perfiles.find((p) => p.id === id)
  }
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}
