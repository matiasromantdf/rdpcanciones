const KEY = 'canciones_cache'

export const getCancionesCache = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) // { songs, updated_at, savedAt }
  } catch {
    return null
  }
}

export const clearCancionesCache = () => localStorage.removeItem(KEY)

// Devuelve las canciones usando la caché si sigue vigente; si no, descarga y guarda.
export const loadCanciones = async (supabase) => {
  const cache = getCancionesCache()

  const [vista, total] = await Promise.all([
    supabase.from('last_updated_songs_view').select('updated_at').maybeSingle(),
    supabase.from('canciones').select('id', { count: 'exact', head: true }),
  ])
  if (vista.error) throw vista.error
  if (total.error) throw total.error

  // El count detecta borrados, que no cambian el updated_at
  if (cache && cache.updated_at === vista.data?.updated_at && cache.songs.length === total.count) {
    return cache.songs
  }

  const { data, error } = await supabase
    .from('canciones')
    .select('*')
    .order('titulo', { ascending: true })
  if (error) throw error

  try {
    localStorage.setItem(KEY, JSON.stringify({
      songs: data,
      updated_at: vista.data?.updated_at ?? null,
      savedAt: new Date().toISOString(),
    }))
  } catch (e) {
    console.warn('No se pudo guardar la caché de canciones:', e)
  }
  return data
}
