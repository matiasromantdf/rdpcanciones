<template>
    <div class="container">
        <div class="row">
            <div class="col-md-8 offset-md-2">
                <div class="card text-center">
                    <div class="card-body">
                        <img src="/icon-192.png" alt="Alabanza RDP" width="96" height="96" class="mb-3" />
                        <h2 class="card-title">Instalar Alabanza RDP</h2>

                        <div v-if="instalada" class="alert alert-success mt-3 mb-0">
                            <i class="bi bi-check-circle me-2"></i>
                            La aplicación ya está instalada en este dispositivo.
                        </div>

                        <template v-else>
                            <p class="text-muted">
                                Instalá la app para abrirla más rápido y usarla como una aplicación más.
                            </p>

                            <button v-if="$pwa?.showInstallPrompt" class="btn btn-primary btn-lg" @click="instalar">
                                <i class="bi bi-download me-2"></i>Instalar
                            </button>

                            <div v-else-if="esIOS" class="alert alert-info text-start mb-0">
                                Para instalarla en iPhone/iPad:
                                <ol class="mb-0 mt-2">
                                    <li>Abrí esta página en <strong>Safari</strong>.</li>
                                    <li>Tocá <i class="bi bi-box-arrow-up"></i> Compartir.</li>
                                    <li>Elegí <strong>"Agregar a pantalla de inicio"</strong>.</li>
                                </ol>
                            </div>

                            <div v-else class="alert alert-secondary text-start mb-0">
                                Tu navegador no ofreció la instalación automática. Probá desde el menú del navegador:
                                <ul class="mb-0 mt-2">
                                    <li><strong>Chrome/Edge (PC):</strong> ícono de instalar en la barra de direcciones.</li>
                                    <li><strong>Chrome (Android):</strong> menú ⋮ → "Instalar aplicación".</li>
                                </ul>
                            </div>
                        </template>

                        <div class="mt-4">
                            <nuxt-link to="/" class="btn btn-outline-secondary">
                                <i class="bi bi-arrow-left me-2"></i>Volver al inicio
                            </nuxt-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const { $pwa } = useNuxtApp()
const esIOS = ref(false)
const standalone = ref(false)

const instalada = computed(() => Boolean($pwa?.isPWAInstalled) || standalone.value)

const instalar = async () => {
    await $pwa?.install()
}

onMounted(() => {
    esIOS.value = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    standalone.value =
        window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
})
</script>
