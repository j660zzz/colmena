import { createClient } from '@supabase/supabase-js'

// La URL y la llave publicable están hechas para ir en el navegador:
// solo permiten leer, y todas las escrituras pasan por funciones que
// validan la clave del dispositivo (ver supabase/schema.sql).
const URL = import.meta.env.VITE_SUPABASE_URL || 'https://gajqknhwlwvgjeionfmo.supabase.co'
const KEY = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_Buhf-XdbWEsBr8izmhX2-Q_9RoOOI0F'

export const supabase = createClient(URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})
