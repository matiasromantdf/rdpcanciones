export default defineNuxtConfig({
  runtimeConfig: {
    public:{
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    }
  },
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules:['@nuxtjs/supabase'],
 
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

});
  
