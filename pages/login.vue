<template>
    <div class="container">
        <div class="row text-center">
            <div class="d-flex justify-content-center align-items-center" style="height: 90vh;">
                <div class="boto-login" v-if="!usuario">
                    <h1 @click="login()" id="btn">Identificarse</h1>
                </div>
                <div v-else class="datos-user">
                    <h1>Bienvenido, {{ usuario.user_metadata.full_name }}</h1>
                    <img :src="usuario.user_metadata.avatar_url" alt="Avatar de usuario" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const usuario = useSupabaseUser()
const userData = ref(null)



const login = async () => {
    document.getElementById('btn').innerText = 'Cargando...'
    document.getElementById('btn').style.pointerEvents = 'none'
    const { user, session, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
    })

    if (error) {
        console.error('Error al iniciar sesión:', error.message)
    } else {
        console.log('Usuario:', user)
        console.log('Sesión:', session)
        userData.value = user
    }
}




</script>

<style>
.boto-login {
    background-image: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 300px;
    cursor: pointer;
}

.boto-login:hover {
    background-image: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
    transform: scale(1.05);
    transition: 0.3s;
}

.datos-user {
    background-image: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 300px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
}

.datos-user img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin: 10px auto;
}
</style>