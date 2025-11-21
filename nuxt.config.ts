export default defineNuxtConfig({
  devServer: {
    port: 3007
  },
  runtimeConfig: {
    public:{
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    }
  },
  alias: {
    'tone': 'tone/build/esm/index.js',
  },
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules:['@nuxtjs/supabase', '@vite-pwa/nuxt'], 
  supabase: {
    redirectOptions:{
      login: '/login',
      callback: '/',
      exclude: [
        '/login',
        '/ver-cancion/**',
        '/canciones',
        '/asistencia',
      ]
    }
  },
  app: {
    head: {
      title: 'Alabanza RDP',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'lang', content: 'es' },
        { name: 'theme-color', content: '#f6d365' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Alabanza RDP' },
        { name: 'msapplication-TileColor', content: '#f6d365' }
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
        },
        {
          //bootstrap icons
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css',
        },
        {
          rel: 'manifest',
          href: '/manifest.webmanifest'
        },
        {
          rel: 'apple-touch-icon',
          href: '/apple-icon-180.png'
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '196x196',
          href: '/favicon-196.png'
        }
      ],
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
          type: 'application/javascript',
        },
        {
          src: 'https://cdn.jsdelivr.net/gh/bbc/rubberband@master/dist/rubberband.min.js',
          type: 'application/javascript',
          async: true,
        }
      ]
    },
   
  },
  
  pwa: {
    registerType: 'autoUpdate',
    // Usar el manifest manual en lugar de generado automáticamente
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      skipWaiting: true,
      clientsClaim: true
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      type: 'module'
    }
  }

});
  
