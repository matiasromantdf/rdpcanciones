export default defineNuxtConfig({
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
  
  devServer: {
    https: true,
    port: 3000
  },
 
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
      title: 'RDP',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'lang', content: 'es' },
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
    manifest: {
      name: 'RDP Canciones - Repertorio Digital',
      short_name: 'RDP Canciones',
      description: 'Aplicación para gestionar repertorio de canciones, crear listados por voces y reproducir pistas musicales',
      theme_color: '#f6d365',
      background_color: '#e9f0f7',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      lang: 'es',
      icons: [
        {
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ],
      categories: ['music', 'entertainment'],
      shortcuts: [
        {
          name: 'Mi Repertorio',
          short_name: 'Repertorio',
          description: 'Acceder a mi repertorio de canciones',
          url: '/repertorio',
          icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
        }
      ]
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
      navigateFallback: 'index.html',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module'
    }
  }

});
  
