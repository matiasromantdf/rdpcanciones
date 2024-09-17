<template>
    <div class="container">
        <h1>Canciones</h1>
        <div class="row mt-4 mb-4 justify-content-center align-items-center">
            <div class="col-md-8 col-sm-10">
                <input type="text" class="form-control m-2" placeholder="Buscar canción por titulo, autor o letra"
                    v-model="search" />
            </div>
            <div class="col-md-2 col-sm-10">
                <button class="btn btn-primary m-2" @click="fetchSongs()">{{ textoBoton }}</button>
            </div>
        </div>
        <div v-if="loading">Cargando...</div>
        <div v-if="error">Error: {{ error.message }}</div>
        <ul v-if="songs.length">

            <li v-for="song in songs" :key="song.id">
                <NuxtLink :to="'/ver-cancion/' + song.id">
                    <h3>{{ song.titulo }}</h3>
                    <p>{{ song.autor }}</p>
                </NuxtLink>
                <button v-if="puedeEliminar" class="btn btn-danger" @click="deleteSong(song.id)">Eliminar</button>
            </li>
        </ul>
        <div v-if="!songs.length && !loading">No hay canciones disponibles.</div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const supabase = useSupabaseClient()
const usuario = useSupabaseUser()
const songs = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref('')


const fetchSongs = async () => {
    loading.value = true
    //agregar los % para que busque en cualquier parte del titulo o autor
    const { data, error } = await supabase
        .from('canciones')
        .select('id, titulo, autor')
        .or(`titulo.ilike.%${search.value}%,autor.ilike.%${search.value}%,letra.ilike.%${search.value}%`)
        .order('titulo')

    if (error) {
        console.error('Error al obtener las canciones:', error.message)
        loading.value = false
        error.value = error
    } else {
        songs.value = data
        loading.value = false
        search.value = ''
    }

}

const roles = ref([])
const getRolesUsuario = async () => {
    if (usuario.value.id) {
        const { data, error } = await supabase
            .from('roles')
            .select('rol')
            .eq('user_email', usuario.value.email)

        if (error) {
            console.error('Error al obtener el rol:', error.message)
        } else {
            console.log('Roles:', data)
            roles.value = data
        }
    }
}

const puedeEliminar = computed(() => {
    //si en el array de roles del usuario esta el rol de admin
    return roles.value.some((rol) => rol.rol === 'letras_editor')
})

const deleteSong = async (id) => {
    //preguntar si esta seguro de eliminar
    if (confirm('¿Estás seguro de eliminar esta canción?')) {
        const { error } = await supabase
            .from('canciones')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error al eliminar la canción:', error.message)
        } else {
            console.log('Canción eliminada')
            fetchSongs()
        }
    }
}

const textoBoton = computed(() => {
    return search.value ? 'Buscar' : 'Ver Todas'
})




onMounted(() => {
    fetchSongs();
    getRolesUsuario()

})
</script>

<style scoped>
/* Estilos opcionales para tu página de canciones */
h1 {
    text-align: center;
}

li {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

a {
    text-decoration: none;
    color: black;
}
</style>