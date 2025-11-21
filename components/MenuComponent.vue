<template>
    <div>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top text-white">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Alabanza RDP - {{ usuario ? usuario.email.split('@')[0] : '' }}</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                    aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <nuxt-link to="/" class="nav-link">Home</nuxt-link>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                Alabanza
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                                <nuxt-link to="/nuevaCancion" class="dropdown-item" v-if="usuario">Nueva
                                    Canción</nuxt-link>
                                <nuxt-link to="/canciones" class="dropdown-item">Canciones</nuxt-link>
                                <nuxt-link to="/repertorio" class="dropdown-item" v-if="esVoces">Mi
                                    repertorio</nuxt-link>
                                <nuxt-link to="/voces/crear-listado" class="dropdown-item" v-if="esAdminVoces">Crear
                                    listado</nuxt-link>
                                <nuxt-link to="/admgrupos" class="dropdown-item" v-if="esAdminVoces">Administrar
                                    grupos</nuxt-link>
                                <nuxt-link to="/reuniones" class="dropdown-item" v-if="esAdminVoces">
                                    <i class="bi bi-calendar-event me-2"></i>Meetings
                                </nuxt-link>
                                <nuxt-link to="/servicios" class="dropdown-item" v-if="esAdminVoces">
                                    <i class="bi bi-music-note-list me-2"></i>Servicios
                                </nuxt-link>
                                <nuxt-link to="/calendario" class="dropdown-item" v-if="esVoces">Calendario</nuxt-link>

                            </ul>
                        </li>

                        <li class="nav-item dropdown" v-if="usuario">
                            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownUsuario" role="button"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                Usuario
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="navbarDropdownUsuario">
                                <li><a class="dropdown-item" href="#">Perfil</a></li>
                                <nuxt-link to="/install-pwa" class="dropdown-item">
                                    <i class="bi bi-download me-2"></i>Instalar App
                                </nuxt-link>
                                <li><a class="dropdown-item" @click="logout">Cerrar Sesión</a></li>
                                <!-- <nuxt-link to="/gruposAsistencia" class="dropdown-item" v-if="esAdminVoces">Grupos y
                                    asistencias</nuxt-link> -->
                                <!-- <nuxt-link to="/asistencia" class="dropdown-item" v-if="esVoces">Asistencia</nuxt-link> -->
                            </ul>

                        </li>
                    </ul>
                    <!--divisor-->
                    <div>
                    </div>
                    <nuxt-link to="/login" class="nav-link ingresar">
                        <span class="material-icons">
                            login
                        </span>
                    </nuxt-link>
                </div>


            </div>
        </nav>
    </div>
</template>

<script setup>
    import { ref, onMounted, onBeforeUnmount } from 'vue'
    import { useRouter } from 'vue-router'
    import { useSupabase } from '../composables/useSupabase'

    // Definir roles y estado de usuario
    const { hasRole, usuario, roles, signOut } = useSupabase()
    const esVoces = ref(false)
    const esAdminVoces = ref(false)
    const router = useRouter()

    // Función de logout
    const logout = async () => {
        await signOut()
        router.push('/')
    }

    esVoces.value = await hasRole('voces') || await hasRole('vastagos')
    esAdminVoces.value = await hasRole('admin_voces')

    watch(usuario, async (value) => {
        esVoces.value = await hasRole('voces') || await hasRole('vastagos')
    })

    // Función para cerrar el navbar cuando se hace clic fuera de él
    const closeNavbarOnClickOutside = (event) => {
        const navbarCollapse = document.getElementById('navbarSupportedContent')
        const navbarToggle = document.querySelector('.navbar-toggler')

        // Verificar si el clic fue fuera del navbar y del botón de toggle
        if (navbarCollapse && !navbarCollapse.contains(event.target) && !navbarToggle.contains(event.target)) {
            const collapseInstance = bootstrap.Collapse.getInstance(navbarCollapse)
            if (collapseInstance && collapseInstance._isShown) {
                collapseInstance.hide()
            }
        }
    }

    // Registrar el evento cuando el componente se monta
    onMounted(() => {
        document.addEventListener('click', closeNavbarOnClickOutside)
    })

    // Limpiar el evento cuando el componente se desmonta
    onBeforeUnmount(() => {
        document.removeEventListener('click', closeNavbarOnClickOutside)
    })

</script>


<style>
    .nav-item {
        margin-right: 10px;
    }

    .ingresar {
        font-size: 30px;
        color: rgb(172, 60, 206);
    }

    .dropdown-menu li {
        position: relative;
    }

    .dropdown-menu .dropdown-submenu {
        display: none;
        position: absolute;
        left: 100%;
        top: -7px;
    }

    .dropdown-menu .dropdown-submenu-left {
        right: 100%;
        left: auto;
    }

    .dropdown-menu>li:hover>.dropdown-submenu {
        display: block;
    }
</style>