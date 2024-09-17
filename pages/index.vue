<template>
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <h1 class="text-center">Cancionero RDP</h1>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 offset-md-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Bienvenido, {{ usuario?.user_metadata.full_name }}</h5>
                        <p class="card-text">Tu rol es: {{ rol }}</p>
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

const rol = ref(null)
const usuario = useSupabaseUser()

const getUserRole = async () => {
    if (usuario.value) {
        const { data, error } = await supabase
            .from('roles')
            .select('rol')
            .eq('user_email', usuario.value.email)
            .single()

        if (error) {
            console.error('Error al obtener el rol:', error.message)
        } else {
            console.log('Rol:', data)
            rol.value = data?.rol
        }
    }
}

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
onMounted(() => {
    getUserRole()
})

</script>

<style></style>