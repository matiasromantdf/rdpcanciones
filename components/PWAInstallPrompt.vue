<template>
    <div>
        <!-- Botón de instalación -->
        <div v-if="showInstallPrompt" class="install-prompt-banner">
            <div class="container-fluid">
                <div class="row align-items-center">
                    <div class="col">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-download me-2"></i>
                            <span>¿Instalar Alabanza RDP como aplicación?</span>
                        </div>
                    </div>
                    <div class="col-auto">
                        <button class="btn btn-sm btn-success me-2" @click="installApp">
                            <i class="bi bi-plus-circle me-1"></i>
                            Instalar
                        </button>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-secondary" @click="dismissTemporarily"
                                title="Recordar por esta sesión">
                                <i class="bi bi-x-lg"></i>
                            </button>
                            <!-- <button class="btn btn-sm btn-outline-danger" @click="dismissPermanently"
                                title="No mostrar más">
                                <i class="bi bi-x-circle"></i>
                            </button> -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Información de instalación manual para iOS -->
        <div v-if="isIOS && !isInstalled && showIOSHint" class="ios-install-hint">
            <div class="container-fluid">
                <div class="row align-items-center">
                    <div class="col">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-info-circle me-2"></i>
                            <small>Para instalar: toca <i class="bi bi-box-arrow-up"></i> y "Agregar a pantalla de
                                inicio"</small>
                        </div>
                    </div>
                    <div class="col-auto">
                        <button class="btn btn-sm btn-outline-primary" @click="dismissIOSHint" title="Cerrar aviso">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'

    // Props para configurar el comportamiento
    const props = defineProps({
        showOnAllPages: {
            type: Boolean,
            default: true
        },
        delayBeforeShow: {
            type: Number,
            default: 1000 // 1 segundo por defecto (reducido de 3)
        },
        enabledRoutes: {
            type: Array,
            default: () => ['/'] // Solo en home por defecto
        }
    })

    const showInstallPrompt = ref(false)
    const isIOS = ref(false)
    const isInstalled = ref(false)
    const shouldShowOnThisPage = ref(true)
    const showIOSHint = ref(false)
    let deferredPrompt = null

    onMounted(() => {
        // Verificar que estemos en el navegador
        if (typeof navigator === 'undefined' || typeof window === 'undefined') {
            return
        }

        // Verificar si debemos mostrar en esta página
        checkIfShouldShowOnCurrentPage()

        // Si no debemos mostrar en esta página, salir
        if (!shouldShowOnThisPage.value) {
            return
        }

        // Detectar iOS
        isIOS.value = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

        // Detectar si ya está instalada
        checkIfInstalled()

        // Verificar si el usuario ya rechazó la instalación en esta sesión
        const dismissedInSession = sessionStorage.getItem('installPromptDismissed')
        const dismissedPermanently = localStorage.getItem('installPromptDismissedPermanently')

        if (dismissedInSession || dismissedPermanently) {
            return
        }

        // Listener para el evento beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt event fired')
            e.preventDefault()
            deferredPrompt = e

            // Mostrar después del delay configurado
            setTimeout(() => {
                if (!isInstalled.value && shouldShowOnThisPage.value) {
                    showInstallPrompt.value = true
                }
            }, props.delayBeforeShow)
        })

        // Listener para cuando se instala la app
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully')
            showInstallPrompt.value = false
            isInstalled.value = true
            deferredPrompt = null
            // Limpiar rechazos previos ya que se instaló
            sessionStorage.removeItem('installPromptDismissed')
            localStorage.removeItem('installPromptDismissedPermanently')
        })

        // En iOS, mostrar hint si no está instalada (con delay reducido)
        if (isIOS.value && !isInstalled.value && !dismissedInSession && !dismissedPermanently) {
            // Verificar si el hint de iOS fue rechazado específicamente
            const iOSHintDismissed = sessionStorage.getItem('iOSInstallHintDismissed')
            if (!iOSHintDismissed) {
                setTimeout(() => {
                    // Solo mostrar si no está en modo standalone
                    if (window.navigator && !window.navigator.standalone && shouldShowOnThisPage.value) {
                        console.log('Showing iOS install hint')
                        showIOSHint.value = true
                    }
                }, props.delayBeforeShow)
            }
        }
    })

    const checkIfShouldShowOnCurrentPage = () => {
        if (props.showOnAllPages) {
            shouldShowOnThisPage.value = true
            return
        }

        // Verificar la ruta actual
        const currentPath = window.location.pathname
        shouldShowOnThisPage.value = props.enabledRoutes.includes(currentPath)
    }

    const checkIfInstalled = () => {
        // Verificar que estemos en el navegador
        if (typeof window === 'undefined') return

        // Verificar si está en modo standalone (instalada)
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            isInstalled.value = true
            return
        }

        // Verificar en iOS
        if (window.navigator && window.navigator.standalone) {
            isInstalled.value = true
            return
        }

        // Verificar si está instalada en Android/Chrome
        if (typeof document !== 'undefined' && document.referrer.includes('android-app://')) {
            isInstalled.value = true
            return
        }
    }

    const installApp = async () => {
        if (!deferredPrompt) {
            console.log('No deferred prompt available')
            return
        }

        try {
            // Mostrar el prompt de instalación
            deferredPrompt.prompt()

            // Esperar la respuesta del usuario
            const { outcome } = await deferredPrompt.userChoice

            console.log(`User response to install prompt: ${outcome}`)

            if (outcome === 'accepted') {
                console.log('User accepted the install prompt')
            } else {
                console.log('User dismissed the install prompt')
            }

            // Limpiar el prompt
            deferredPrompt = null
            showInstallPrompt.value = false
        } catch (error) {
            console.error('Error showing install prompt:', error)
        }
    }

    const dismissPrompt = (permanent = false) => {
        showInstallPrompt.value = false
        deferredPrompt = null

        if (permanent) {
            // No mostrar más en esta instalación del navegador
            localStorage.setItem('installPromptDismissedPermanently', 'true')
        } else {
            // Solo rechazar por esta sesión
            sessionStorage.setItem('installPromptDismissed', 'true')
        }
    }

    const dismissTemporarily = () => dismissPrompt(false)
    const dismissPermanently = () => dismissPrompt(true)

    const dismissIOSHint = () => {
        showIOSHint.value = false
        // Recordar que el usuario rechazó el hint de iOS por esta sesión
        sessionStorage.setItem('iOSInstallHintDismissed', 'true')
    }
</script>

<style scoped>
    .install-prompt-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 0.75rem 0;
        z-index: 1040;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
        animation: slideUp 0.3s ease-out;
    }

    .ios-install-hint {
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        background-color: #e3f2fd;
        color: #1565c0;
        padding: 0.5rem 0;
        z-index: 1035;
        border-bottom: 1px solid #bbdefb;
    }

    @keyframes slideUp {
        from {
            transform: translateY(100%);
            opacity: 0;
        }

        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .btn {
        font-size: 0.875rem;
    }

    .bi {
        font-size: 1rem;
    }
</style>