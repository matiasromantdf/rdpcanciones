<template>
    <div class="container">
        <h1>Canciones</h1>
        <div v-if="loading">Cargando...</div>
        <div v-if="error">Error: {{ error.message }}</div>
        <ul v-if="songs.length">

            <li v-for="song in songs" :key="song.id">
                <NuxtLink :to="'/ver-cancion/' + song.id">
                    <h3>{{ song.titulo }}</h3>
                    <p>{{ song.autor }}</p>
                </NuxtLink>
            </li>
        </ul>
        <div v-if="!songs.length && !loading">No hay canciones disponibles.</div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const supabase = useSupabaseClient()
const songs = ref([])
const loading = ref(true)
const error = ref(null)

const fetchSongs = async () => {
    try {
        const { data, error: fetchError } = await supabase
            .from('canciones')
            .select('*')

        if (fetchError) {
            throw fetchError
        }

        songs.value = data
    } catch (err) {
        error.value = err
    } finally {
        loading.value = false
    }
}


onMounted(() => {
    fetchSongs()
})
</script>

<style scoped>
/* Estilos opcionales para tu página de canciones */
h1 {
    text-align: center;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    padding: 1rem;
    border-radius: 5px;
}

pre {
    white-space: pre-wrap;
    /* Para mostrar correctamente los saltos de línea */
}
</style>