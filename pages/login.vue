<template>
    <div class="container">
        <div class="row text-center">
            <div class="d-flex justify-content-center align-items-center" style="height: 90vh;">
                <div class="boto-login" v-if="!usuario">
                    <h1 @click="login()" id="btn">Identificarse</h1>
                </div>
                <div v-else class="datos-user">
                    <h1>Bienvenido, {{ usuario.user_metadata.full_name }}</h1>
                    <img :src="usuario.user_metadata.avatar_url" alt="Avatar de usuario" id="fotoUsuario" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useSupabase } from '~/composables/useSupabase';

const { signIn, usuario } = useSupabase()

const login = async () => {
    await signIn()
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

#fotoUsuario {
    border-radius: 50%;
    width: 100px;
    height: 100px;
    margin: 0 auto;
}
</style>