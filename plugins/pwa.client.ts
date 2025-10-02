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
    
    // No registrar manualmente el service worker, dejarlo al módulo PWA
    // El módulo @vite-pwa/nuxt se encarga automáticamente del registro
    
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
  
  // Verificar service worker de manera más robusta
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      console.log('Service Worker registered:', registration ? 'Yes' : 'No')
      console.log('Service Worker state:', registration?.active?.state || 'unknown')
    }).catch(error => {
      console.log('Service Worker error:', error)
    })
  }
  
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
      
      // Verificar si la app cumple con todos los criterios de instalación
      const canBeInstalled = checkInstallCriteria(manifest)
      console.log('Can be installed:', canBeInstalled ? 'Yes' : 'No')
    })
    .catch(error => {
      console.log('Manifest error:', error)
    })
}

function checkInstallCriteria(manifest) {
  const criteria = {
    https: location.protocol === 'https:' || location.hostname === 'localhost',
    manifest: !!manifest,
    serviceWorker: 'serviceWorker' in navigator,
    displayStandalone: manifest?.display === 'standalone',
    icons: manifest?.icons?.length >= 2,
    name: !!manifest?.name,
    startUrl: !!manifest?.start_url
  }
  
  console.log('Install criteria:', criteria)
  
  return Object.values(criteria).every(Boolean)
}