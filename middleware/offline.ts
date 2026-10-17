export default defineRouteMiddleware(async (to, from) => {
    // Solo ejecutar en cliente
    if (!process.client) return

    const { isOnline } = usePWACache()

    // Si estamos online, permitir paso normal
    if (isOnline.value) return

    // Si estamos offline, solo permitir rutas que tienen cache
    const offlineAllowedRoutes = [
        '/',
        '/canciones',
        '/repertorio',
        /^\/ver-cancion\/.*/, // Dinámicas: /ver-cancion/[id]
    ]

    const isAllowedOffline = offlineAllowedRoutes.some(route => {
        if (typeof route === 'string') return route === to.path
        return route.test(to.path)
    })

    if (!isAllowedOffline) {
        console.warn(`Ruta ${to.path} no disponible offline`)
        return navigateTo('/')
    }
})
