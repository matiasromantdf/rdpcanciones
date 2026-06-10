<template>
    <div v-if="!isOnline" class="offline-indicator">
        <div class="offline-content">
            <div class="offline-icon">
                <i class="bi bi-wifi-off"></i>
            </div>
            <div class="offline-message">
                <h2>Sin conexión a Internet</h2>
                <p>Estás en modo offline. Solo puedes ver contenido cacheado.</p>
                <p class="text-small">La app se sincronizará automáticamente cuando recuperes la conexión.</p>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { usePWACache } from '~/composables/usePWACache'

    const { isOnline } = usePWACache()
</script>

<style scoped>
    .offline-indicator {
        display: none;
    }

    .offline-indicator:has(.offline-content) {
        display: block;
    }

    @media (max-width: 600px) {
        .offline-indicator {
            position: fixed;
            top: 60px;
            left: 0;
            right: 0;
            z-index: 100;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
            padding: 1rem;
            color: white;
            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }

        .offline-content {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .offline-icon {
            font-size: 2rem;
            flex-shrink: 0;
        }

        .offline-message {
            flex: 1;
            margin: 0;
        }

        .offline-message h2 {
            font-size: 1rem;
            margin: 0 0 0.25rem 0;
            font-weight: 600;
        }

        .offline-message p {
            font-size: 0.85rem;
            margin: 0.25rem 0;
            opacity: 0.95;
        }

        .text-small {
            font-size: 0.75rem;
            opacity: 0.85;
        }
    }
</style>
