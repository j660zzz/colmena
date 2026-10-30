import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './supabase'
import { leerSesion, guardarSesion, borrarSesion } from './session'
import { AVATAR_COLORS } from './format'

const Ctx = createContext(null)
export const useColmena = () => useContext(Ctx)

const PERFIL_COLS = 'id,nombre,marca,rol,categorias,habilidades,instagram,color,carnet,es_ejemplo,created_at'

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
    encuentro: async () => {
      const rows = await q(supabase.from('encuentros').select('*').eq('activo', true).order('numero', { ascending: false }).limit(1))
      setEncuentro(rows[0] || null)
    }
  }

  const cargarTodo = useCallback(async () => {
    try {
      await Promise.all(Object.values(cargar).map((f) => f()))
      setErrorRed(null)
    } catch (e) {
      setErrorRed('No pudimos conectar con la colmena. Revisa tu internet.')
      console.error(e)
    } finally {
      setCargando(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { cargarTodo() }, [cargarTodo])

  // Tiempo real: lo que publica uno lo ven todos sin recargar
  useEffect(() => {
    const ch = supabase.channel('colmena')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'publicaciones' }, (p) => {
        cargar.publicaciones()
        const autor = p.new?.autor_id
        if (autor && !perfilesRef.current.some((x) => x.id === autor)) cargar.perfiles()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ayudas' }, () => cargar.ayudas())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'asistencias' }, () => cargar.asistencias())
      .subscribe()
    const t = setInterval(() => { cargar.perfiles(); cargar.conexiones() }, 45000)
    const vis = () => { if (document.visibilityState === 'visible') cargarTodo() }
    document.addEventListener('visibilitychange', vis)
    return () => { supabase.removeChannel(ch); clearInterval(t); document.removeEventListener('visibilitychange', vis) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const yo = useMemo(() => (sesion ? perfiles.find((p) => p.id === sesion.id) || null : null), [sesion, perfiles])

  // Si el perfil guardado ya no existe en la base (lo borraron), se limpia la sesión
  useEffect(() => {
    if (!cargando && sesion && perfiles.length && !yo) { borrarSesion(); setSesion(null) }
  }, [cargando, sesion, perfiles, yo])

  const rpc = async (fn, args) => {
    if (!sesion) throw new Error('Necesitas un perfil')
    const { data, error } = await supabase.rpc(fn, { p_id: sesion.id, p_clave: sesion.clave, ...args })
    if (error) throw new Error(error.message?.includes('no autorizado') ? 'Tu sesión no es válida en este dispositivo.' : error.message)
    return data
  }

  const acciones = {
    async crearPerfil(f) {
      const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
      const { data, error } = await supabase.rpc('crear_perfil', {
        p_nombre: f.nombre, p_marca: f.marca, p_rol: f.rol, p_categorias: f.categorias,
        p_habilidades: f.habilidades, p_instagram: f.instagram, p_color: color
      })
      if (error) throw new Error('No pudimos crear tu perfil. Intenta de nuevo.')
      const s = { id: data.id, clave: data.clave }
      guardarSesion(s)
      await cargar.perfiles()
      setSesion(s)
      return data
    },
    async actualizarPerfil(f) {
      await rpc('actualizar_perfil', {
        p_nombre: f.nombre, p_marca: f.marca, p_rol: f.rol, p_categorias: f.categorias,
        p_habilidades: f.habilidades, p_instagram: f.instagram
      })
      await cargar.perfiles()
    },
    async borrarPerfil() {
      await rpc('borrar_perfil', {})
      borrarSesion(); setSesion(null)
      await cargarTodo()
    },
    async publicar(tipo, texto, categorias) {
      await rpc('publicar', { p_tipo: tipo, p_texto: texto, p_categorias: categorias })
      await cargar.publicaciones()
    },
    async borrarPublicacion(id) {
      setPublicaciones((l) => l.filter((p) => p.id !== id))
      await rpc('borrar_publicacion', { p_post: id })
    },
    async alternarAyuda(postId) {
      const ya = ayudas.some((a) => a.publicacion_id === postId && a.perfil_id === sesion.id)
      setAyudas((l) => ya ? l.filter((a) => !(a.publicacion_id === postId && a.perfil_id === sesion.id)) : [...l, { publicacion_id: postId, perfil_id: sesion.id }])
      try { return await rpc('alternar_ayuda', { p_post: postId }) } catch (e) { cargar.ayudas(); throw e }
    },
    async alternarConexion(aId) {
      const ya = conexiones.some((c) => c.de_id === sesion.id && c.a_id === aId)
      setConexiones((l) => ya ? l.filter((c) => !(c.de_id === sesion.id && c.a_id === aId)) : [...l, { de_id: sesion.id, a_id: aId }])
      try { return await rpc('alternar_conexion', { p_a: aId }) } catch (e) { cargar.conexiones(); throw e }
    },
    async alternarAsistencia(encId) {
      const ya = asistencias.some((a) => a.encuentro_id === encId && a.perfil_id === sesion.id)
      setAsistencias((l) => ya ? l.filter((a) => !(a.encuentro_id === encId && a.perfil_id === sesion.id)) : [...l, { encuentro_id: encId, perfil_id: sesion.id }])
      try { return await rpc('alternar_asistencia', { p_encuentro: encId }) } catch (e) { cargar.asistencias(); throw e }
    }
  }

  const valor = {
    sesion, yo, perfiles, publicaciones, ayudas, conexiones, asistencias, encuentro,
    cargando, errorRed, recargar: cargarTodo, ...acciones,
    perfil: (id) => perfiles.find((p) => p.id === id)
  }
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}
