<template>
    <div class="pwa-status-bar" :class="{ 'offline': !isOnline, 'online': isOnline }">
        <div class="container-fluid">
            <div class="row align-items-center">
                <div class="col-auto">
                    <i class="bi" :class="isOnline ? 'bi-wifi' : 'bi-wifi-off'"></i>
                    <span class="status-text">
                        {{ isOnline ? 'En línea' : 'Sin conexión' }}
                    </span>
                </div>

                <div class="col-auto" v-if="isInstalled">
                    <i class="bi bi-phone"></i>
                    <span class="app-installed">PWA Instalada</span>
                </div>

                <div class="col-auto" v-if="!isOnline && cacheInfo.songs > 0">
                    <i class="bi bi-archive"></i>
                    <span class="cache-info">
                        {{ cacheInfo.songs }} canciones en caché
                    </span>
                </div>

                <div class="col-auto ms-auto" v-if="showCacheControls">
                    <button class="btn btn-sm btn-outline-secondary" @click="$emit('clear-cache')"
                        title="Limpiar cache">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { usePWACache } from '~/composables/usePWACache'

    defineProps({
        showCacheControls: {
            type: Boolean,
            default: false
        }
    })

    defineEmits(['clear-cache'])

    const { isOnline, isInstalled, getCacheInfo } = usePWACache()
    const cacheInfo = getCacheInfo()
</script>

<style scoped>
    .pwa-status-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1030;
        padding: 0.25rem 0;
        font-size: 0.8rem;
        transition: all 0.3s ease;
    }

    .pwa-status-bar.online {
        background-color: #d4edda;
        color: #155724;
        border-bottom: 1px solid #c3e6cb;
    }

    .pwa-status-bar.offline {
        background-color: #f8d7da;
        color: #721c24;
        border-bottom: 1px solid #f5c6cb;
    }

    .status-text,
    .app-installed,
    .cache-info {
        margin-left: 0.25rem;
        font-weight: 500;
    }

    .bi {
        font-size: 0.9rem;
    }

    .btn-sm {
        padding: 0.125rem 0.25rem;
        font-size: 0.75rem;
    }
</style>