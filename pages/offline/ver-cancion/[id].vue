<template>
    <div class="container">
        <nuxt-link to="/offline/canciones">← Volver al listado</nuxt-link>
        <p v-if="!song" class="mt-3">Canción no encontrada en este dispositivo.</p>
        <div v-else class="texto-cancion">
            <h1>{{ song.titulo }}</h1>
            <h2>{{ song.autor }}</h2>
            <pre>{{ song.letra }}</pre>
        </div>
    </div>
</template>

<script setup>
const route = useRoute()
const song = ref(null)

onMounted(() => {
    const cache = getCancionesCache()
    song.value = cache?.songs.find((s) => String(s.id) === route.params.id) ?? null
})
</script>

<style scoped>
.texto-cancion {
    margin-top: 20px;
    padding: 24px 16px;
    background-color: #f5f5f5;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
}

h1 {
    font-size: 1.8rem;
    font-weight: 700;
}

h2 {
    font-size: 1.2rem;
    color: #555;
    margin-bottom: 1.5rem;
}

pre {
    white-space: pre-wrap;
    font-family: inherit;
    font-size: 1.3rem;
    line-height: 1.8;
}
</style>
