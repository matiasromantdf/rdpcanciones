import { usePWACache } from '~/composables/usePWACache'

export default defineNuxtPlugin(() => {
  if (process.client) {
    const { setupConnectivityListeners, checkIfInstalled, cleanOldCache } = usePWACache()
    
    // Configurar listeners de conectividad
    setupConnectivityListeners()
    
    // Verificar si la app está instalada
    checkIfInstalled()
    
    // Limpiar cache viejo al iniciar la app
    cleanOldCache()
    
    // Mostrar notificación de instalación si es compatible
    let deferredPrompt
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      
      // Opcional: mostrar botón de instalación personalizado
      console.log('PWA es instalable')
    })
    
    window.addEventListener('appinstalled', () => {
      console.log('PWA instalada exitosamente')
      deferredPrompt = null
    })
  }
})