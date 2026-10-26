export default defineNuxtConfig({
  modules: ['@nuxtjs/supabase', '@vite-pwa/nuxt'],

  pwa: {
    manifest: {
      name: 'Alabanza RDP',
      short_name: 'Alabanza RDP',
      description: 'Repertorio de Alabanza RDP',
      theme_color: '#f6d365',
      background_color: '#e9f0f7',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    registerType: 'autoUpdate',
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      type: 'module',
      navigateFallback: '/',
    },
    workbox: {
      navigateFallback: undefined,
      globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
      runtimeCaching: [
        {
          // Con red navega normal; si falla, responde con el HTML precacheado de /offline/canciones
          urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'paginas',
            networkTimeoutSeconds: 4,
            plugins: [
              {
                handlerDidError: async () => {
                  const opts = { ignoreSearch: true }
                  return (
                    (await caches.match('/offline/canciones', opts)) ||
                    (await caches.match('/offline/canciones/index.html', opts)) ||
                    Response.error()
                  )
                },
              },
            ],
          },
        },
        {
          urlPattern: /^https:\/\/(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)\/.*/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'cdn-recursos',
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },
  },
  nitro: {
    prerender: {
      routes: ['/offline/canciones'],
    },
  },
  devServer: {
    port: 3007
  },
  runtimeConfig: {
    public: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    }
  },
  alias: {
    'tone': 'tone/build/esm/index.js',
  },
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/',
      exclude: [
        '/',
        '/login',
        '/offline/**',
        '/instalar',
        '/ver-cancion/**',
        '/canciones',
        '/repertorio',
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
      ],
      link: [
        {
          rel: 'manifest',
          href: '/manifest.webmanifest'
        },
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

});
