<template>
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <h1 class="text-center">App Roca de Paz</h1>
            </div>
        </div>
        <div class="row mb-4 mt-1">

        </div>
        <div class="row text-center mt-5" v-if="!usuario">
            <!-- <div class="col">
                <p>Si ya tenés usuario, podés ingresar <nuxt-link to="/login">aquí</nuxt-link></p>
            </div> -->
        </div>
        <div class="row text-center" v-if="roles.length > 0">
            <div class="col-md-6 offset-md-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Bienvenido, {{ usuario?.user_metadata.full_name }}</h5>
                        <button @click="logout" class="btn btn-primary mt-5">Cerrar sesión</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="row text-center" v-if="roles.length === 0 && usuario">
            <div class="col-md-6 offset-md-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Esta cuenta no posee roles asociados</h5>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const supabase = useSupabaseClient()
const router = useRouter()

const usuario = ref(useSupabaseUser())
const roles = ref([])
const getRolesUsuario = async () => {
    if (usuario.value) {
        const { data, error } = await supabase
            .from('roles_usuarios')
            .select('rol')
            .eq('user_id', usuario.value.id)

        if (error) {
            console.error('Error al obtener el rol:', error.message)
        } else {
            console.log('Roles:', data)
            roles.value = data
        }
    }
}
getRolesUsuario()

const logout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Error al cerrar sesión:', error.message)
    } else {
        console.log('Sesión cerrada')
        router.push('/login')
    }
}



</script>

<style></style>