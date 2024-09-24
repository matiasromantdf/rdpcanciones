// https://nuxt.com/docs/api/configuration/nuxt-config}}


export default defineNuxtConfig({
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
      ]
    }
  },
  app: {
    head: {
      title: 'RDP',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Nuxt Supabase' },
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
      ],
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
        }
      ]
    },
   
  }, 

});
  
