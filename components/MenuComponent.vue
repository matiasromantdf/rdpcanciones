<template>
    <div>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">RDP</a>
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

                                <li><a class="dropdown-item" @click="logout">Cerrar Sesión</a></li>
                                <nuxt-link to="/gruposAsistencia" class="dropdown-item" v-if="esAdminVoces">Grupos y
                                    asistencias</nuxt-link>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabase } from '../composables/useSupabase'

const { hasRole, usuario, roles, signOut } = useSupabase()

const esVoces = ref(false) // Inicializamos como `false`
const esAdminVoces = ref(false) // Inicializamos como `false`
const router = useRouter()


const logout = async () => {
    await signOut()
    router.push('/')
}
esVoces.value = await hasRole('voces');
esAdminVoces.value = await hasRole('admin_voces');

watch(usuario, async (value) => {
    esVoces.value = await hasRole('voces')
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