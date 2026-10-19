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
    router.replace('/offline')
}

const handleOnline = () => {
    router.replace('/')
}

onMounted(() => {
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    if (!navigator.onLine) {
        handleOffline()
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('offline', handleOffline)
    window.removeEventListener('online', handleOnline)
})
</script>