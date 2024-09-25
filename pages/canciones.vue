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
        <ul v-if="songs.length && !loading">
            <div class="row border p-2 m-2 cancion" v-for="song in songs">
                <div class="col-9">
                    <div class="row">
                        <nuxt-link :to="'/ver-cancion/' + song.id">
                            <div class="col d-flex">
                                <h2>{{ song.titulo }}</h2> <span v-if="song.es_adaptacion"
                                    class="es_adapt">Adaptación</span>
                            </div>
                        </nuxt-link>

                        <div class="col">

                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <p>{{ song.autor }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-2 d-flex align-items-center justify-content-center">
                    <button class="btn btn-danger" v-if="puedeEliminar" @click="deleteSong(song.id)">Eliminar</button>
                </div>

            </div>
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
        .select('*')
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
.cancion {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

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

.es_adapt {
    background-color: #b3b02d;
    color: white;
    padding: 4px;
    border-radius: 5px;
    float: right;
    margin-right: 5px;
    height: 30px;
}

.col h2 {
    float: left;
    margin-right: 10px;
}
</style>