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
    
    // En desarrollo, permitir desabilitar el service worker si hay problemas
    if (process.dev) {
      // Si el usuario presiona una tecla específica (Ctrl+Alt+S), desabilita el SW temporalmente
      window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.key === 's') {
          console.log('⚠️ Service Worker unregistering for debugging...')
          navigator.serviceWorker?.getRegistrations().then(registrations => {
            registrations.forEach(reg => reg.unregister())
          })
        }
      })
    }
  }
})