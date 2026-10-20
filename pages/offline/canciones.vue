<template>
    <div class="container">
        <div class="d-flex justify-content-center align-items-center gap-2">
            <i class="bi bi-wifi-off" style="font-size: 1.5rem;"></i>
            <h1 class="mb-0">Canciones (sin conexión)</h1>
        </div>
        <p class="text-center text-muted mt-2" v-if="savedAt">Datos guardados el {{ savedAt }}</p>

        <input type="text" class="form-control my-3" placeholder="Buscar por título, autor o letra" v-model="search" />

        <p v-if="!songs.length">No hay canciones guardadas en este dispositivo.</p>
        <p v-else>{{ filtradas.length }} canciones</p>

        <div class="border rounded p-3 mb-2" v-for="song in filtradas" :key="song.id">
            <nuxt-link :to="'/offline/ver-cancion/' + song.id">
                <h2 class="h4">{{ song.titulo }}</h2>
            </nuxt-link>
            <p class="mb-0">{{ song.autor }}</p>
        </div>
    </div>
</template>

<script setup>
const songs = ref([])
const savedAt = ref('')
const search = ref('')

onMounted(() => {
    const cache = getCancionesCache()
    songs.value = cache?.songs ?? []
    savedAt.value = cache ? new Date(cache.savedAt).toLocaleString() : ''
})

const filtradas = computed(() => {
    const q = search.value.toLowerCase()
    if (!q) return songs.value
    return songs.value.filter((s) =>
        [s.titulo, s.autor, s.letra].some((t) => (t || '').toLowerCase().includes(q)))
})
</script>

<style scoped>
a {
    text-decoration: none;
    color: black;
}
</style>
