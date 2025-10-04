<template>
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <div class="text-center mb-4">
                    <h1 class="display-6 text-primary">
                        <i class="bi bi-music-note-beamed me-2"></i>
                        Alabanza RDP
                    </h1>
                </div>
            </div>
        </div>
        <div class="row mb-4 mt-1">

        </div>
        <div class="row text-center mt-5" v-if="!usuario">
            <div class="col-md-8 offset-md-2">
                <div class="card border-warning">
                    <div class="card-body">
                        <div class="d-flex align-items-center justify-content-center mb-3">
                            <i class="bi bi-exclamation-triangle-fill text-warning me-2" style="font-size: 1.5rem;"></i>
                            <h5 class="card-title mb-0">Estás en modo invitado</h5>
                        </div>
                        <p class="card-text text-muted mb-3">
                            Para acceder a los repertorios y funciones de Alabanza RDP,
                            necesitas iniciar sesión con tu cuenta.
                        </p>
                        <div class="text-center">
                            <nuxt-link to="/login" class="btn btn-primary btn-lg">
                                <i class="bi bi-box-arrow-in-right me-2"></i>
                                Iniciar Sesión
                            </nuxt-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row text-center" v-if="usuario && roles.length > 0">
            <div class="row bienvenida">
                <div class="col">
                    <h5 class="card-title">Bienvenido, {{ usuario?.user_metadata.full_name }}</h5>

                </div>
            </div>
        </div>
        <div class="row text-center" v-if="roles.length === 0 && usuario">
            <div class="col-md-6 offset-md-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Esta cuenta no posee roles asociados todavía, comunicate con el
                            administrador.</h5>
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

    const redirect = () => {
        let originUrl = localStorage.getItem('originUrl')
        let url = window.location.href
        //si la url actual contiene ?code= significa que es una url de autenticación
        if (url.includes('?code=')) {
            //si la url de origen es diferente a la actual, redirigir a la url de origen
            if (originUrl && originUrl !== url) {
                window.location.href = originUrl
            } else {
                router.push('/')
            }
        }


    }

    redirect()



</script>

<style></style>