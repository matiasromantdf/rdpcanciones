<template>
    <div class="container">
        <h1>Canciones</h1>
        <div class="row mt-4 mb-4 justify-content-center align-items-center">
            <div class="col-md-8 col-sm-10">
                <input type="text" class="form-control m-2" placeholder="Buscar canción por titulo, autor o letra"
                    v-model="search" />
            </div>
            <div class="col-md-4 col-sm-5">
                <div class="row text-center">
                    <div class="col">
                        <button class="btn btn-primary m-2" @click="applySearchFilter"
                            :disabled="search.length === 0">{{ textoBoton }}</button>

                    </div>
                    <div class="col">
                        <button class="btn btn-primary m-2" @click="search = ''; fetchSongs()">Mostrar Todos</button>
                    </div>
                </div>
            </div>

        </div>
        <div class="row p-2 d-flex align-items-center" v-if="puedeEliminar">
            <div class="col-6">
                <label class="form-label">Tipo</label>
                <select class="form-select" v-model="tipoFilter" @change="applyTipoFilter">
                    <option value="0">Todas</option>
                    <option value="1">Adoración</option>
                    <option value="2">Alabanza</option>
                </select>
            </div>
            <div class="col">
                <p class="mt-4">{{ songsForShow.length }} canciones encontradas</p>
            </div>

        </div>
        <div v-if="loading">Cargando...</div>
        <ul v-if="songs.length && !loading">
            <div class="row border p-2 m-2 cancion" v-for="song in songsForShow">
                <div class="col md-10 sm-9">
                    <div class="row">
                        <div class="col-10 d-flex">
                            <div class="col">
                                <div class="d-flex">
                                    <nuxt-link :to="'/ver-cancion/' + song.id">
                                        <h2 style="text-decoration: underline;">{{ song.titulo }}</h2>
                                    </nuxt-link>
                                    <div v-if="song.link" @click="openUrl(song.link)">
                                        <span class="material-icons boton" style="color: red;">
                                            smart_display
                                        </span>
                                    </div>
                                    <div class="col d-flex justify-content-center"
                                        v-if="song.pista_url && esVoces">
                                        <i class="bi bi-file-music ms-2" style="font-size: 1.5rem;"></i>
                                    </div>

                                </div>
                            </div>

                        </div>

                    </div>
                    <div class="row justify-content-between p-1">
                        <div class="col d-flex">
                            <p>{{ song.autor }}</p>
                            <span v-if="song.es_adaptacion" class="es_adapt">Adaptación</span>
                        </div>

                    </div>
                </div>
                <div class="col-md-2 col-sm-12 d-flex align-items-center justify-content-center mt-2">
                    <span v-if="puedeEliminar" @click="deleteSong(song.id)" class="material-icons boton"
                        style="color:brown">
                        delete
                    </span>
                    <span v-if="puedeEliminar" @click="editSong(song.id)" class="material-icons boton"
                        style="color:cornflowerblue">
                        edit
                    </span>
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
    const router = useRouter()
    const tipoFilter = ref(0)
    const songsForShow = ref([])

    const applyTipoFilter = () => {
        if (tipoFilter.value == 0) {
            songsForShow.value = songs.value
        } else {
            songsForShow.value = songs.value.filter((song) => song.tipo == tipoFilter.value)
        }
    }
    const applySearchFilter = () => {
        if (search.value.length > 0) {
            //agregar los % para que busque en cualquier parte del titulo o autor
            songsForShow.value = songs.value.filter((song) => {
                return song.titulo.toLowerCase().includes(search.value.toLowerCase()) ||
                    song.autor.toLowerCase().includes(search.value.toLowerCase()) ||
                    song.letra.toLowerCase().includes(search.value.toLowerCase())
            })
        } else {
            songsForShow.value = songs.value
        }
    }

    const fetchSongs = async () => {
        loading.value = true
        //agregar los % para que busque en cualquier parte del titulo o autor
        const { data, error } = await supabase
            .from('canciones')
            .select('*')
            // .or(`titulo.ilike.%${search.value}%,autor.ilike.%${search.value}%,letra.ilike.%${search.value}%`)
            .order('titulo', { ascending: true })

        if (error) {
            console.error('Error al obtener las canciones:', error.message)
            loading.value = false
            error.value = error
        } else {
            songs.value = data
            loading.value = false
            songsForShow.value = songs.value
        }

    }

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

    const puedeEliminar = computed(() => {
        //si en el array de roles del usuario esta el rol de admin
        return roles.value.some((rol) => rol.rol === 'letras_editor')
    })

    const esVoces = computed(()=>{
        return roles.value.some((rol) => rol.rol === 'voces')

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
        return 'Buscar'
    })

    const editSong = (id) => {
        //preguntar si esta seguro de eliminar
        if (confirm('¿Estás seguro de editar esta canción?')) {
            //redirigir a la página de edición
            router.push(`/editar-cancion/${id}`)
        }
    }
    const openUrl = (url) => {
        window.open(url, '_blank')
    }




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
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        background-color: #f9f9f9;
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
        position: relative;
        border-radius: 5px;
        margin-left: 10px;
        height: 25px;
        padding-left: 5px;
        padding-right: 5px;

    }

    @media (max-width: 768px) {
        .es_adapt {
            font-size: 0.8rem;
            height: 20px;
        }
    }

    .col h2 {
        float: left;
        margin-right: 10px;
    }

    .boton {
        cursor: pointer;
        border-radius: 50%;
        padding: 5px;
        border: 1px solid #ccc;
        margin-left: 5px;

    }
</style>