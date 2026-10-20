<template>
    <div>
        <MenuComponent />
        <slot />
    </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

const router = useRouter()

const handleOffline = () => {
    if (!router.currentRoute.value.path.startsWith('/offline')) {
        router.replace('/offline/canciones')
    }
}

const handleOnline = () => {
    if (router.currentRoute.value.path.startsWith('/offline')) {
        router.replace('/')
    }
}

let removeGuard = null

onMounted(() => {
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    // Sin conexión, cualquier navegación fuera de /offline va al listado offline
    removeGuard = router.beforeEach((to) => {
        if (!navigator.onLine && !to.path.startsWith('/offline')) {
            return '/offline/canciones'
        }
    })

    if (!navigator.onLine) {
        handleOffline()
    } else {
        // Descarga los chunks de las páginas offline mientras hay conexión
        preloadRouteComponents('/offline/canciones')
        preloadRouteComponents('/offline/ver-cancion/0')
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('offline', handleOffline)
    window.removeEventListener('online', handleOnline)
    removeGuard?.()
})
</script>