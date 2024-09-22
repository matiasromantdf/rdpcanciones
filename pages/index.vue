<template>
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <h1 class="text-center">App Roca de Paz</h1>
            </div>
        </div>
        <div class="row text-center mt-5" v-if="!usuario">
            <div class="col">
                <p>Si ya tenés usuario, podés ingresar <nuxt-link to="/login">aquí</nuxt-link></p>
            </div>
        </div>
        <div class="row" v-if="usuario">
            <div class="col-md-6 offset-md-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Bienvenido, {{ usuario?.user_metadata.full_name }}</h5>
                        <button @click="logout" class="btn btn-primary">Cerrar sesión</button>
                    </div>
                </div>
            </div>
        </div>
    </div>




</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const supabase = useSupabaseClient()
const router = useRouter()

const usuario = useSupabaseUser()

const logout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Error al cerrar sesión:', error.message)
    } else {
        console.log('Sesión cerrada')
        router.push('/login') // Redirige correctamente al login
    }
}

// Asegúrate de ejecutar la función cuando el componente esté montado

</script>

<style></style>