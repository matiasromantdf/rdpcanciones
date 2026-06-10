import { usePWACache } from '~/composables/usePWACache'

export default defineNuxtPlugin(() => {
  if (process.client) {
    const { setupConnectivityListeners, checkIfInstalled, cleanOldCache } = usePWACache()
    
    // Configurar listeners de conectividad INMEDIATAMENTE
    setupConnectivityListeners()
    
    // Verificar si la app está instalada
    checkIfInstalled()
    
    // Limpiar cache viejo al iniciar la app
    cleanOldCache()
    
    console.log('🌐 PWA Plugin initialized successfully')
  }
})