<template>
    <div class="container">
        <div class="row text-center mt-2">
            <div class="col">
                <h1>Mi repertorio</h1>
            </div>
        </div>
        <div class="row" v-if="cargando">
            <div class="col-12 text-center">
                <h1>Cargando...</h1>
            </div>
        </div>
        <div class="row mt-4 border p-2 shadow " v-for="cancion in repertorio" v-else
            @click="router.push('/ver-cancion/' + cancion.canciones.id)">
            <div class="col-12">
                <h4>{{ cancion.canciones.titulo }}</h4>
                <p> tono: {{ convertirNumeroEnTono(cancion.tono_numero) }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useSupabase } from '~/composables/useSupabase';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router'
const { usuario, roles, fetchUserRoles, hasRole, supabase } = useSupabase();

const tonos = [
    'Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'
]
const cargando = ref(true)

const esVoces = ref(false)
const repertorio = ref([])
const getRepertorio = async () => {
    const { data, error } = await supabase.from('repertorio_voces').select('*, canciones(*)')
    if (error) {
        console.error('Error al obtener el repertorio:', error.message)
    } else {
        repertorio.value = data
    }
    cargando.value = false
}

const convertirNumeroEnTono = (numero) => {
    return tonos[numero - 1]
}

const router = useRouter()

onMounted(async () => {
    await fetchUserRoles()
    if (!hasRole('voces')) {
        router.push('/')
    }
    await getRepertorio()
})

</script>