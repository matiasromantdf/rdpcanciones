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
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabase } from '../composables/useSupabase'

const { hasRole, usuario, fetchUserRoles, roles, signOut } = useSupabase()

const esVoces = ref(false) // Inicializamos como `false`
const router = useRouter()


const logout = async () => {
    await signOut()
    router.push('/')

}

onMounted(async () => {
    await fetchUserRoles() // Obtenemos los roles del usuario
    esVoces.value = hasRole('voces') // Verificamos si el usuario tiene el rol "voces"
    console.log('Rol voces:', esVoces.value)
})
</script>

<style>
.nav-item {
    margin-right: 10px;
}
</style>