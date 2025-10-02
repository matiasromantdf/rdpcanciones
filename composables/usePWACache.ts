import { ref } from 'vue'

interface CachedSong {
  id: string
  titulo: string
  letra: string
  numero_tono: number
  tono_esmenor: boolean
  pista_url?: string
  cached_at: number
}

interface CachedRepertoire {
  user_id: string
  songs: CachedSong[]
  cached_at: number
}

export const usePWACache = () => {
  // Inicializar con valor por defecto y actualizar en cliente
  const isOnline = ref(true) // Default a true para SSR
  const isInstalled = ref(false)

  // Detectar cambios en el estado de conexión
  const updateOnlineStatus = () => {
    if (process.client && typeof navigator !== 'undefined') {
      isOnline.value = navigator.onLine
    }
  }

  // Configurar listeners para detectar cambios de conectividad
  const setupConnectivityListeners = () => {
    if (process.client && typeof navigator !== 'undefined') {
      // Actualizar estado inicial
      isOnline.value = navigator.onLine
      
      // Agregar listeners
      window.addEventListener('online', updateOnlineStatus)
      window.addEventListener('offline', updateOnlineStatus)
    }
  }

  // Cache de canciones para acceso offline
  const cacheCancion = async (cancion: any) => {
    if (!process.client) return

    try {
      const cachedSong: CachedSong = {
        id: cancion.id,
        titulo: cancion.titulo,
        letra: cancion.letra,
        numero_tono: cancion.numero_tono,
        tono_esmenor: cancion.tono_esmenor,
        pista_url: cancion.pista_url,
        cached_at: Date.now()
      }

      const existingCache = localStorage.getItem('rdp_cached_songs')
      const cachedSongs = existingCache ? JSON.parse(existingCache) : []
      
      // Verificar si ya existe y actualizar o agregar
      const existingIndex = cachedSongs.findIndex((song: CachedSong) => song.id === cancion.id)
      if (existingIndex >= 0) {
        cachedSongs[existingIndex] = cachedSong
      } else {
        cachedSongs.push(cachedSong)
      }

      // Mantener solo las últimas 50 canciones para no llenar el storage
      if (cachedSongs.length > 50) {
        cachedSongs.sort((a: CachedSong, b: CachedSong) => b.cached_at - a.cached_at)
        cachedSongs.splice(50)
      }

      localStorage.setItem('rdp_cached_songs', JSON.stringify(cachedSongs))
    } catch (error) {
      console.error('Error cacheando canción:', error)
    }
  }

  // Obtener canción desde cache
  const getCachedCancion = (id: string): CachedSong | null => {
    if (!process.client) return null

    try {
      const existingCache = localStorage.getItem('rdp_cached_songs')
      if (!existingCache) return null

      const cachedSongs: CachedSong[] = JSON.parse(existingCache)
      return cachedSongs.find(song => song.id === id) || null
    } catch (error) {
      console.error('Error obteniendo canción desde cache:', error)
      return null
    }
  }

  // Cache del repertorio del usuario
  const cacheRepertorio = async (userId: string, repertorio: any[]) => {
    if (!process.client) return

    try {
      const cachedRepertoire: CachedRepertoire = {
        user_id: userId,
        songs: repertorio.map(item => ({
          id: item.canciones.id,
          titulo: item.canciones.titulo,
          letra: item.canciones.letra || '',
          numero_tono: item.tono_numero,
          tono_esmenor: item.tono_esmenor,
          pista_url: item.canciones.pista_url,
          cached_at: Date.now()
        })),
        cached_at: Date.now()
      }

      localStorage.setItem(`rdp_repertorio_${userId}`, JSON.stringify(cachedRepertoire))
    } catch (error) {
      console.error('Error cacheando repertorio:', error)
    }
  }

  // Obtener repertorio desde cache
  const getCachedRepertorio = (userId: string): CachedSong[] => {
    if (!process.client) return []

    try {
      const existingCache = localStorage.getItem(`rdp_repertorio_${userId}`)
      if (!existingCache) return []

      const cachedRepertoire: CachedRepertoire = JSON.parse(existingCache)
      
      // Verificar si el cache no es muy viejo (7 días)
      const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 días en millisegundos
      if (Date.now() - cachedRepertoire.cached_at > maxAge) {
        localStorage.removeItem(`rdp_repertorio_${userId}`)
        return []
      }

      return cachedRepertoire.songs
    } catch (error) {
      console.error('Error obteniendo repertorio desde cache:', error)
      return []
    }
  }

  // Limpiar cache viejo
  const cleanOldCache = () => {
    if (!process.client) return

    try {
      const existingCache = localStorage.getItem('rdp_cached_songs')
      if (!existingCache) return

      const cachedSongs: CachedSong[] = JSON.parse(existingCache)
      const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 días en millisegundos
      
      const validSongs = cachedSongs.filter(song => 
        Date.now() - song.cached_at < maxAge
      )

      localStorage.setItem('rdp_cached_songs', JSON.stringify(validSongs))
    } catch (error) {
      console.error('Error limpiando cache:', error)
    }
  }

  // Verificar si la app está instalada como PWA
  const checkIfInstalled = () => {
    if (!process.client) return

    // Verificar si está ejecutándose en modo standalone
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      isInstalled.value = true
    }

    // Verificar en iOS
    if ((window.navigator as any).standalone) {
      isInstalled.value = true
    }
  }

  // Obtener información del cache para mostrar al usuario
  const getCacheInfo = () => {
    if (!process.client) return { songs: 0, size: '0 KB' }

    try {
      const songsCache = localStorage.getItem('rdp_cached_songs')
      const songsCount = songsCache ? JSON.parse(songsCache).length : 0
      
      // Calcular tamaño aproximado del cache
      let totalSize = 0
      for (let key in localStorage) {
        if (key.startsWith('rdp_')) {
          totalSize += localStorage[key].length
        }
      }

      return {
        songs: songsCount,
        size: `${Math.round(totalSize / 1024)} KB`
      }
    } catch (error) {
      return { songs: 0, size: '0 KB' }
    }
  }

  // Limpiar todo el cache
  const clearAllCache = () => {
    if (!process.client) return

    try {
      const keysToRemove = []
      for (let key in localStorage) {
        if (key.startsWith('rdp_')) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Error limpiando cache:', error)
    }
  }

  return {
    isOnline,
    isInstalled,
    setupConnectivityListeners,
    cacheCancion,
    getCachedCancion,
    cacheRepertorio,
    getCachedRepertorio,
    cleanOldCache,
    checkIfInstalled,
    getCacheInfo,
    clearAllCache
  }
}