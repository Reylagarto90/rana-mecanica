import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.warn('⚠️ Variables Supabase no configuradas — modo demo activo')
}

export const supabase = url && anon ? createClient(url, anon) : null

// Helper: buscar socio por teléfono
export async function buscarSocioPorTelefono(telefono) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('socios')
    .select('*')
    .eq('telefono', telefono)
    .eq('estado', 'activo')
  if (error) { console.error(error); return null }
  return data
}

// Helper: insertar solicitud de alta
export async function insertarSolicitudAlta(form) {
  if (!supabase) return { ok: true, demo: true }
  const { error } = await supabase.from('solicitudes_alta').insert([form])
  return { ok: !error, error }
}

// Helper: insertar solicitud de verificación/corrección
export async function insertarVerificacion(socioId, campo, valorNuevo, comentario) {
  if (!supabase) return { ok: true, demo: true }
  const { error } = await supabase.from('verificaciones').insert([{
    socio_id: socioId,
    campo,
    valor_nuevo: valorNuevo,
    comentario,
    estado: 'pendiente',
  }])
  return { ok: !error, error }
}
