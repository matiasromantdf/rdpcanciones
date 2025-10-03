<template>
    <div class="container mt-4">
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h3><i class="bi bi-download"></i> Instalación de PWA - Alabanza RDP</h3>
                    </div>
                    <div class="card-body">

                        <!-- Estado de la PWA -->
                        <div class="row mb-4">
                            <div class="col-12">
                                <h5>Estado actual:</h5>
                                <div class="alert" :class="isInstalled ? 'alert-success' : 'alert-info'">
                                    <i class="bi" :class="isInstalled ? 'bi-check-circle' : 'bi-info-circle'"></i>
                                    <strong>{{ isInstalled ? 'PWA Instalada' : 'PWA No Instalada' }}</strong>
                                    <p class="mb-0">
                                        {{ isInstalled ? 'La aplicación ya está instalada en tu dispositivo.' : 'Puedes instalar esta aplicación para una mejor experiencia.' }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Requisitos PWA -->
                        <div class="row mb-4">
                            <div class="col-12">
                                <h5>Verificación de requisitos:</h5>
                                <ul class="list-group">
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        <span><i class="bi bi-shield-lock"></i> HTTPS</span>
                                        <span class="badge" :class="isHTTPS ? 'bg-success' : 'bg-danger'">
                                            {{ isHTTPS ? 'OK' : 'Requerido' }}
                                        </span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        <span><i class="bi bi-gear"></i> Service Worker</span>
                                        <span class="badge" :class="hasServiceWorker ? 'bg-success' : 'bg-warning'">
                                            {{ hasServiceWorker ? 'Registrado' : 'Pendiente' }}
                                        </span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        <span><i class="bi bi-file-text"></i> Web Manifest</span>
                                        <span class="badge" :class="hasManifest ? 'bg-success' : 'bg-warning'">
                                            {{ hasManifest ? 'OK' : 'Verificando...' }}
                                        </span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        <span><i class="bi bi-image"></i> Iconos</span>
                                        <span class="badge" :class="iconCount > 0 ? 'bg-success' : 'bg-warning'">
                                            {{ iconCount }} iconos
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <!-- Botón de instalación manual -->
                        <div class="row mb-4" v-if="canInstall">
                            <div class="col-12">
                                <h5>Instalación:</h5>
                                <button class="btn btn-primary btn-lg" @click="installApp">
                                    <i class="bi bi-download"></i>
                                    Instalar Alabanza RDP
                                </button>
                                <p class="text-muted mt-2">
                                    Al instalar, podrás acceder a la aplicación desde tu escritorio o pantalla de
                                    inicio.
                                </p>
                            </div>
                        </div>

                        <!-- Instrucciones por navegador -->
                        <div class="row">
                            <div class="col-12">
                                <h5>Instrucciones por navegador/dispositivo:</h5>

                                <!-- Chrome/Edge Desktop -->
                                <div class="accordion" id="installInstructions">
                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button class="accordion-button collapsed" type="button"
                                                data-bs-toggle="collapse" data-bs-target="#chrome-desktop">
                                                <i class="bi bi-browser-chrome me-2"></i>
                                                Chrome/Edge - Windows/Mac
                                            </button>
                                        </h2>
                                        <div id="chrome-desktop" class="accordion-collapse collapse"
                                            data-bs-parent="#installInstructions">
                                            <div class="accordion-body">
                                                <ol>
                                                    <li>Busca el ícono <i class="bi bi-download"></i> en la barra de
                                                        direcciones</li>
                                                    <li>Haz clic en "Instalar Alabanza RDP"</li>
                                                    <li>Confirma la instalación</li>
                                                </ol>
                                                <p><strong>Alternativa:</strong> Menú (⋮) > "Instalar Alabanza RDP..."
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Chrome Mobile -->
                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button class="accordion-button collapsed" type="button"
                                                data-bs-toggle="collapse" data-bs-target="#chrome-mobile">
                                                <i class="bi bi-phone me-2"></i>
                                                Chrome - Android
                                            </button>
                                        </h2>
                                        <div id="chrome-mobile" class="accordion-collapse collapse"
                                            data-bs-parent="#installInstructions">
                                            <div class="accordion-body">
                                                <ol>
                                                    <li>Toca el menú (⋮) en la esquina superior derecha</li>
                                                    <li>Selecciona "Agregar a pantalla de inicio"</li>
                                                    <li>Confirma el nombre y toca "Agregar"</li>
                                                </ol>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Safari iOS -->
                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button class="accordion-button collapsed" type="button"
                                                data-bs-toggle="collapse" data-bs-target="#safari-ios">
                                                <i class="bi bi-apple me-2"></i>
                                                Safari - iPhone/iPad
                                            </button>
                                        </h2>
                                        <div id="safari-ios" class="accordion-collapse collapse"
                                            data-bs-parent="#installInstructions">
                                            <div class="accordion-body">
                                                <ol>
                                                    <li>Toca el botón de compartir <i class="bi bi-box-arrow-up"></i>
                                                    </li>
                                                    <li>Desplázate y toca "Agregar a pantalla de inicio"</li>
                                                    <li>Confirma el nombre y toca "Agregar"</li>
                                                </ol>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Debug info -->
                        <div class="row mt-4" v-if="showDebug">
                            <div class="col-12">
                                <details>
                                    <summary>Información de debugging</summary>
                                    <pre class="bg-light p-3 mt-2">{{ debugInfo }}</pre>
                                </details>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'

    const isInstalled = ref(false)
    const isHTTPS = ref(false)
    const hasServiceWorker = ref(false)
    const hasManifest = ref(false)
    const iconCount = ref(0)
    const canInstall = ref(false)
    const showDebug = ref(true) // Para debugging
    const debugInfo = ref({})

    let deferredPrompt = null

    onMounted(() => {
        checkPWAStatus()
        setupInstallListeners()
    })

    const checkPWAStatus = async () => {
        // Verificar HTTPS
        isHTTPS.value = location.protocol === 'https:' || location.hostname === 'localhost'

        // Verificar si está instalada
        isInstalled.value = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone

        // Verificar Service Worker
        hasServiceWorker.value = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller

        // Verificar Manifest
        try {
            const response = await fetch('/manifest.webmanifest')
            if (response.ok) {
                const manifest = await response.json()
                hasManifest.value = true
                iconCount.value = manifest.icons?.length || 0

                debugInfo.value = {
                    ...debugInfo.value,
                    manifest: manifest,
                    manifestUrl: '/manifest.webmanifest'
                }
            }
        } catch (error) {
            console.error('Error loading manifest:', error)
            hasManifest.value = false
        }

        // Debug info
        debugInfo.value = {
            ...debugInfo.value,
            userAgent: navigator.userAgent,
            protocol: location.protocol,
            hostname: location.hostname,
            isStandalone: window.matchMedia('(display-mode: standalone)').matches,
            serviceWorkerSupported: 'serviceWorker' in navigator,
            serviceWorkerController: !!navigator.serviceWorker.controller,
            deferredPromptAvailable: !!deferredPrompt
        }
    }

    const setupInstallListeners = () => {
        // Listener para beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt fired')
            e.preventDefault()
            deferredPrompt = e
            canInstall.value = true

            debugInfo.value = {
                ...debugInfo.value,
                beforeinstallpromptFired: true,
                deferredPromptAvailable: true
            }
        })

        // Listener para cuando se instala
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed')
            isInstalled.value = true
            canInstall.value = false
            deferredPrompt = null
        })
    }

    const installApp = async () => {
        if (!deferredPrompt) {
            alert('La instalación automática no está disponible. Por favor, usa las instrucciones manuales según tu navegador.')
            return
        }

        try {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice

            console.log('Install prompt outcome:', outcome)

            if (outcome === 'accepted') {
                console.log('User accepted the install prompt')
            }

            deferredPrompt = null
            canInstall.value = false
        } catch (error) {
            console.error('Error during installation:', error)
        }
    }

    // Meta tags para la página
    useHead({
        title: 'Instalar PWA - Alabanza RDP',
        meta: [
            { name: 'description', content: 'Instrucciones para instalar Alabanza RDP como aplicación web progresiva' }
        ]
    })
</script>