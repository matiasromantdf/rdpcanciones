<template>
    <div>
        <ClientOnly>
            <PWAStatusBar />
            <PWAInstallPrompt :delay-before-show="500" :show-on-all-pages="false"
                :enabled-routes="['/', '/canciones', '/repertorio', '/calendario']" />
        </ClientOnly>
        <MenuComponent />
        <slot />
    </div>
</template>

<script setup>
    definePageMeta({
        middleware: 'offline'
    })
</script>