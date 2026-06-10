<template>
    <div class="error-container">
        <div class="error-content">
            <div class="error-header">
                <div class="error-icon">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                </div>
                <h1>Oops, algo salió mal</h1>
            </div>

            <div class="error-body">
                <p class="error-message">{{ error?.message || 'Error desconocido' }}</p>

                <div v-if="isOffline" class="offline-info">
                    <i class="bi bi-wifi-off"></i>
                    <p>Parece que no tienes conexión a Internet.</p>
                    <p class="text-small">Intenta conectarte a Internet y recarga la página.</p>
                </div>

                <div class="error-actions">
                    <button @click="handleError" class="btn btn-primary">
                        <i class="bi bi-arrow-clockwise me-2"></i>
                        Reintentar
                    </button>
                    <NuxtLink to="/" class="btn btn-outline-secondary">
                        <i class="bi bi-house-door me-2"></i>
                        Ir al Inicio
                    </NuxtLink>
                </div>
            </div>

            <div v-if="error?.stack && isDev" class="error-stack">
                <details>
                    <summary>Detalles técnicos</summary>
                    <pre>{{ error.stack }}</pre>
                </details>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'

    defineProps({
        error: Object
    })

    const isDev = process.dev
    const isOnline = ref(navigator.onLine)

    const isOffline = computed(() => !isOnline.value)

    const handleError = () => {
        clearError()
    }

    onMounted(() => {
        window.addEventListener('online', () => {
            isOnline.value = true
            setTimeout(() => {
                location.reload()
            }, 1000)
        })
        window.addEventListener('offline', () => {
            isOnline.value = false
        })
    })
</script>

<style scoped>
    .error-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    .error-content {
        background: white;
        border-radius: 16px;
        padding: 3rem 2rem;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .error-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .error-icon {
        font-size: 4rem;
        color: #dc3545;
        margin-bottom: 1rem;
    }

    .error-header h1 {
        font-size: 1.75rem;
        color: #2c3e50;
        margin: 0;
        font-weight: 600;
    }

    .error-body {
        margin-bottom: 2rem;
    }

    .error-message {
        color: #666;
        font-size: 1rem;
        margin-bottom: 1rem;
        text-align: center;
    }

    .offline-info {
        background: #fff3cd;
        border-left: 4px solid #ffc107;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        text-align: center;
    }

    .offline-info i {
        font-size: 2rem;
        color: #ff9800;
        margin-bottom: 0.5rem;
    }

    .offline-info p {
        margin: 0.5rem 0;
        color: #856404;
        font-size: 0.95rem;
    }

    .text-small {
        font-size: 0.85rem;
        opacity: 0.8;
    }

    .error-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .btn {
        flex: 1;
        min-width: 150px;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-outline-secondary {
        background: white;
        color: #667eea;
        border: 2px solid #667eea;
    }

    .btn-outline-secondary:hover {
        background: #f8f9fa;
        transform: translateY(-2px);
    }

    .error-stack {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1.5rem;
        font-size: 0.85rem;
    }

    .error-stack summary {
        cursor: pointer;
        color: #667eea;
        font-weight: 500;
        margin-bottom: 0.5rem;
    }

    .error-stack pre {
        background: #2c3e50;
        color: #ecf0f1;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        margin: 0.5rem 0 0 0;
        font-size: 0.8rem;
        line-height: 1.4;
    }

    @media (max-width: 600px) {
        .error-container {
            padding: 1rem;
        }

        .error-content {
            padding: 2rem 1.5rem;
        }

        .error-header h1 {
            font-size: 1.5rem;
        }

        .error-actions {
            flex-direction: column;
        }

        .btn {
            min-width: auto;
        }
    }
</style>
