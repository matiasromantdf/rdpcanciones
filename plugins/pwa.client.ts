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
    
    // Registrar el service worker manualmente si no se registra automáticamente
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          // Intentar registrar el service worker
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          })
          
          console.log('Service Worker registered successfully:', registration)
          
          // Verificar actualizaciones
          registration.addEventListener('updatefound', () => {
            console.log('New service worker found')
            const newWorker = registration.installing
            
            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker installed')
                // Aquí puedes mostrar un mensaje al usuario sobre la actualización
              }
            })
          })
          
        } catch (error) {
          console.log('Service Worker registration failed:', error)
        }
      })
    }
    
    // Debug: Verificar si todos los requisitos para PWA están cumplidos
    setTimeout(() => {
      checkPWARequirements()
    }, 2000)
  }
})

function checkPWARequirements() {
  console.log('=== PWA Requirements Check ===')
  console.log('HTTPS:', location.protocol === 'https:' || location.hostname === 'localhost')
  console.log('Service Worker supported:', 'serviceWorker' in navigator)
  console.log('Service Worker registered:', navigator.serviceWorker?.controller ? 'Yes' : 'No')
  console.log('Manifest link:', document.querySelector('link[rel="manifest"]') ? 'Yes' : 'No')
  console.log('Display mode:', window.matchMedia('(display-mode: standalone)').matches ? 'Standalone' : 'Browser')
  
  // Verificar si el manifest es accesible
  fetch('/manifest.webmanifest')
    .then(response => {
      console.log('Manifest accessible:', response.ok ? 'Yes' : 'No')
      return response.json()
    })
    .then(manifest => {
      console.log('Manifest content:', manifest)
      console.log('Icons in manifest:', manifest.icons?.length || 0)
    })
    .catch(error => {
      console.log('Manifest error:', error)
    })
}