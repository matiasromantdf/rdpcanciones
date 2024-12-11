<template>
    <div class="container">
        <div v-if="loading">Cargando...</div>
        <div v-if="error">Error: {{ error.message }}</div>
        <div v-if="song && !guardando">
            <div class="controles mt-4">
                <div class="controles-tono">
                    <p>cambiar tono</p>
                    <div>
                        <!-- botones mas +1 y -1 para transportar la cancion -->
                        <button class="btn border" @click="transportar(1)">+1 </button>
                        {{ tonoCancion }}
                        <button class="btn border" @click="transportar(-1)">-1</button>
                    </div>
                </div>
                <div class="controles-letra">
                    <!-- botones mas +1 y -1 para transportar la cancion -->
                    <p>Cambiar tamaño</p>
                    <div>
                        <button class="btn border" @click="cambiarTamanio(1)">Inc. </button>
                        <button class="btn border" @click="cambiarTamanio(-1)">Dis.</button>
                    </div>
                </div>
            </div>
            <div class="row mb-4" v-if="!cargardoRepertorio">
                <div class="col-4 col-md-2 d-flex align-items-center" v-if="puedeAddToFavorite"
                    @click="addToRepertorio">
                    <span :class="'material-icons icono ' + classIcono">
                        favorite
                    </span>
                    <span v-if="estaEnRepertorio">en repertorio</span>
                </div>
                <div class="col-2" v-if="song.link" @click="openUrl(song.link)">
                    <span class="material-icons icono-link" style="color: red;">
                        smart_display
                    </span>
                </div>
            </div>
            <div class="row text-center" v-else>
                <div class="col-sm-12 col-md-4">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>

            </div>
            <div class="row">
                <div class="col">
                    <h3>{{ song.titulo }}</h3>
                </div>
            </div>
            <div class="row mb-4">
                <div class="col">
                    <h4>{{ song.autor }}</h4>
                </div>
            </div>

            <div>
                <div v-for="(line, lineIndex) in song.letra.split('\n')" :key="line">
                    <div class="linea-letra">

                        <div :class="(char == 'm' || char == 'M') ? 'char mucho-espacio' : 'char poco-espacio'"
                            v-for="(char, charIndex) in line.split('')" :key="charIndex"
                            @click="openModal(calcularIndice(charIndex, lineIndex))"
                            :id="calcularIndice(charIndex, lineIndex)">
                            <div class="acorde" @click.stop="eliminarAcorde(calcularIndice(charIndex, lineIndex))">
                                {{ devolverAcorde(lineIndex, charIndex) }}{{ devolverModificador(lineIndex, charIndex) }}{{ devolverInvertida(lineIndex, charIndex) }}
                            </div>
                            <p :class="char == ' ' ? 'espacio' : ''">{{ char }}</p>

                        </div>
                    </div>
                </div>

            </div>
        </div>
        <div v-if="guardando">Guardando...</div>
        <div v-if="!song && !loading">Canción no encontrada.</div>
        <!-- Modal para añadir acorde a letra -->
        <div v-if="showModal" class="modal-overlay">
            <div class="modal-content">
                <span class="close" @click="closeModal">&times;</span>
                <h3>Agregar Acorde {{ selectedChar }}</h3>
                <label for="acorde">Acorde:</label>
                <select v-model="acorde" id="acorde">
                    <option v-for="acorde in acordes" :key="acorde.numero" :value="acorde.numero">
                        {{ acorde.acorde }}
                    </option>
                </select>
                <label for="acorde">Invertida:</label>
                <select v-model="invertida" id="invertida">
                    <option v-for="acorde in acordes" :key="acorde.numero" :value="acorde.numero">
                        {{ acorde.acorde }}
                    </option>
                </select>
                <label for="modificador">Modificador:</label>
                <select v-model="modificador" id="modificador">
                    <option v-for="mod in modificadores" :key="mod.id" :value="mod.modificador">{{ mod.modificador }}
                    </option>
                </select>

                <button class="btn btn-success mt-3" @click="saveChord()">Guardar</button>
            </div>
        </div>

        <!--- Modal acorde para añadir a repertorio -->
        <div v-if="showModalToRepertorio" class="modal-overlay">
            <div class="modal-content">
                <span class="close" @click="showModalToRepertorio = false">&times;</span>
                <h3>Indicá tu tono</h3>
                <label for="acorde">Tono:</label>
                <select v-model="acorde" id="acorde">
                    <option v-for="acorde in acordes" :key="acorde.numero" :value="acorde.numero">
                        {{ acorde.acorde }}
                    </option>
                </select>
                <!-- <label for="modificador">Modificador:</label>
                <select v-model="modificador" id="modificador">
                    <option v-for="mod in modificadores" :key="mod.id" :value="mod.modificador">{{ mod.modificador }}
                    </option>
                </select> -->

                <button class="btn btn-success mt-3" @click="guardarEnRepertorio()">Guardar</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const supabase = useSupabaseClient()
const song = ref(null)
const loading = ref(true)
const error = ref(null)
const showModal = ref(false)
const showModalToRepertorio = ref(false)
const acorde = ref('')
const modificador = ref('M')
const invertida = ref(null)
const selectedChar = ref(null)
const acordes = ref([
    {
        numero: 1,
        acorde: 'Do',
    },
    {
        numero: 2,
        acorde: 'Do#',
    },
    {
        numero: 3,
        acorde: 'Re',
    },
    {
        numero: 4,
        acorde: 'Re#',
    },
    {
        numero: 5,
        acorde: 'Mi',
    },
    {
        numero: 6,
        acorde: 'Fa',
    },
    {
        numero: 7,
        acorde: 'Fa#',
    },
    {
        numero: 8,
        acorde: 'Sol',
    },
    {
        numero: 9,
        acorde: 'Sol#',
    },
    {
        numero: 10,
        acorde: 'La',
    },
    {
        numero: 11,
        acorde: 'La#',
    },
    {
        numero: 12,
        acorde: 'Si',
    }
])
const guardando = ref(false)
const acordesCancion = ref([])
const modificadores = ref([])
const usuario = ref(useSupabaseUser())
const cargardoRepertorio = ref(true)


const estaEnRepertorio = ref(false)

const getIsInRepertorio = async () => {
    if (usuario.value) {
        const { data, error } = await supabase
            .from('repertorio_voces')
            .select('id')
            .eq('cancion_id', song.value.id)
            .eq('user_id', usuario.value.id)
        if (error) {
            console.error('Error al obtener el repertorio:', error.message)
        } else {
            console.log('Repertorio:', data)
            estaEnRepertorio.value = data.length > 0
        }
    }
    cargardoRepertorio.value = false
}

const classIcono = computed(() => {
    return estaEnRepertorio.value ? 'in' : 'out'
})

const addToRepertorio = () => {
    //confirmar
    if (estaEnRepertorio.value) {
        if (confirm('¿Estás seguro de quitar esta canción a tu repertorio?')) {
            //quitar de repertorio
            supabase.from('repertorio_voces')
                .delete()
                .eq('cancion_id', song.value.id)
                .eq('user_id', usuario.value.id)
                .then(({ error }) => {
                    if (error) {
                        console.error(error)
                    } else {
                        estaEnRepertorio.value = false
                    }
                })

        }
    } else {
        //agregar a repertorio
        //abrir el modal para seleccionar la el tono
        showModalToRepertorio.value = true
    }
}

const guardarEnRepertorio = () => {
    //guardar en la tabla repertorio_voces, cancion_id, user_id, tono
    const cancion_id = song.value.id
    const user_id = usuario.value.id
    const tono = acorde.value
    supabase.from('repertorio_voces').insert([
        { cancion_id, user_id, tono_numero: tono }
    ]).then(({ error }) => {
        if (error) {
            console.error(error)
            alert('Ocurrió un error al guardar la canción en el repertorio')
        } else {
            alert('Canción guardada en el repertorio')
            estaEnRepertorio.value = true
            showModalToRepertorio.value = false
        }
    })
}

const fetchSong = async () => {
    const songId = route.params.id
    try {
        const { data, error: fetchError } = await supabase
            .from('canciones')
            .select('*')
            .eq('id', songId)
            .single()
        if (fetchError) {
            throw fetchError
        }
        song.value = data
        fetchAcordes()
        getIsInRepertorio()

    } catch (err) {
        error.value = err
    } finally {
        loading.value = false
    }
}

const calcularIndice = (charIndex, line) => {
    //calcular el indice de la letra en el total de la cancion
    let index = 0
    let cantidadLineas = song.value.letra.split('\n').length
    let lineas = song.value.letra.split('\n')
    for (let i = 0; i < cantidadLineas; i++) {
        for (let j = 0; j < lineas[i].length; j++) {
            index++
            if (i == line && j == charIndex) {
                return index
            }
        }
    }


}

const fetchAcordes = async () => {
    try {
        const { data, error: fetchError } = await supabase
            .from('acordes')
            .select('*')
            .eq('cancion_id', song.value.id)

        if (fetchError) {
            throw fetchError
        }

        acordesCancion.value = data
        console.log(data)
    } catch (err) {
        error.value = err
    } finally {
        loading.value = false
    }
}

const getModificadores = async () => {
    const { data, error } = await supabase.from('modificadores').select('*')
    if (error) {
        console.error(error)
    } else {
        modificadores.value = data
    }
}

const puedeEditar = computed(() => {
    //si en el array de roles del usuario esta el rol de admin
    return roles.value.some((rol) => rol.rol === 'acordes_editor')
})

const puedeAddToFavorite = computed(() => {
    //si en el array de roles del usuario esta el rol de admin
    return roles.value.some((rol) => rol.rol === 'voces')
})

const openModal = (charIndex) => {
    if (!puedeEditar.value) {
        return
    }
    selectedChar.value = charIndex
    showModal.value = true
    modificador.value = 'M'
}

const closeModal = () => {
    showModal.value = false
}

const saveChord = () => {
    //guardar en la tabla acordes, cancion_id, numero_acorde, modificador, posicion
    guardando.value = true
    const cancion_id = song.value.id
    const numero_nota = acorde.value
    const invert = invertida.value
    const mod = modificador.value
    const posicion = selectedChar.value

    supabase.from('acordes').insert([
        { cancion_id, numero_nota, modificador: mod, posicion, invertida: invert }
    ]).then(({ error }) => {
        if (error) {
            console.error(error)
            alert('Ocurrió un error al guardar el acorde')
            guardando.value = false
        } else {
            acorde.value = ''
            modificador.value = ''
            closeModal()
            fetchSong()
            guardando.value = false

        }
    })
}

const eliminarAcorde = (index) => {
    let confirmar = confirm('¿Estás seguro de eliminar este acorde?')
    if (confirmar) {
        let pos = index
        let cancion = song.value.id
        supabase.from('acordes').delete().eq('posicion', pos).eq('cancion_id', cancion).then(({ error }) => {
            if (error) {
                console.error(error)
                alert('Ocurrió un error al eliminar el acorde')
            } else {
                fetchSong()
            }
        })
    }
}

const devolverAcorde = (lineIndex, charIndex) => {
    let acorde = ''
    acordesCancion.value.forEach(acordeCancion => {
        if (acordeCancion.posicion == calcularIndice(charIndex, lineIndex)) {
            //buscar el acorde en la lista de acordes
            acordes.value.forEach(acordeLista => {
                if (acordeLista.numero == acordeCancion.numero_nota) {
                    acorde = acordeLista.acorde
                }
            })

        }
    })
    return acorde

}

const devolverModificador = (lineIndex, charIndex) => {
    let modificador = ''
    acordesCancion.value.forEach(acordeCancion => {
        if (acordeCancion.posicion == calcularIndice(charIndex, lineIndex)) {
            modificador = acordeCancion.modificador

        }
    }
    )
    return modificador
}

const devolverInvertida = (lineIndex, charIndex) => {
    let invertida = ''
    acordesCancion.value.forEach(acordeCancion => {
        if (acordeCancion.posicion == calcularIndice(charIndex, lineIndex)) {
            //buscar el acorde en la lista de acordes
            acordes.value.forEach(acordeLista => {
                if (acordeLista.numero == acordeCancion.invertida) {
                    invertida = '/' + acordeLista.acorde

                }
            })
        }
    }
    )
    return invertida

}

const transportar = (numero) => {
    //transportar la cancion
    let tonoCancion = song.value.numero_tono
    tonoCancion += numero
    if (tonoCancion > 12) {
        tonoCancion = 1
    }
    if (tonoCancion < 1) {
        tonoCancion = 12
    }
    song.value.numero_tono = tonoCancion
    //actualizar los acordes de la letra
    acordesCancion.value.forEach(acorde => {
        let nuevoAcorde = acorde.numero_nota + numero
        let nuevoInvertida = acorde.invertida + numero
        if (nuevoAcorde > 12) {
            nuevoAcorde = 1
        }
        if (nuevoAcorde < 1) {
            nuevoAcorde = 12
        }
        if (nuevoInvertida > 12) {
            nuevoInvertida = 1
        }
        if (nuevoInvertida < 1) {
            nuevoInvertida = 12
        }

        acorde.numero_nota = nuevoAcorde
        acorde.invertida = nuevoInvertida
    }
    )

}

const tonoCancion = computed(() => {
    let tono = ''
    let tonoCancion = song.value.numero_tono
    acordes.value.forEach(acorde => {
        if (acorde.numero == tonoCancion) {
            tono = acorde.acorde
        }
    })
    return tono
})

const cambiarTamanio = (numero) => {
    document.querySelectorAll('.char').forEach(char => {
        let fontSize = parseInt(window.getComputedStyle(char).fontSize)
        fontSize += numero
        char.style.fontSize = fontSize + 'px'
        char.style.maxWidth = fontSize + 'px'
    })
    document.querySelectorAll('.acorde').forEach(acorde => {
        let fontSize = parseInt(window.getComputedStyle(acorde).fontSize)
        fontSize += numero
        acorde.style.fontSize = fontSize + 'px'
    })

}

const roles = ref([])
const getRolesUsuario = async () => {
    if (usuario.value != null) {
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
    else {
        console.log('No hay usuario')
        roles.value = []
    }
}

const openUrl = (url) => {
    window.open(url, '_blank')
}


onMounted(() => {
    fetchSong();
    getModificadores();
    getRolesUsuario();
})
</script>

<style scoped>
.icono {
    font-size: 20px;
    border: 1px solid #941c4e;
    padding: 10px;
    border-radius: 50%;
    margin-right: 10px;
    cursor: pointer;
}

.icono.in {
    color: #941c4e;
}

.icono.out {
    color: #ccc;
}

.icono:hover {
    background-color: #941c4e;
    color: white;
}

.h1 {
    text-align: center;
}

.char {
    display: inline-block;
    cursor: pointer;
    max-width: 11px;
    font-size: 20px;
}

.char:hover {
    background-color: #5561a3;
}

.poco-espacio {
    margin-right: 1px;
}

.mucho-espacio {
    margin-right: 6px;
}

.espacio {
    width: 10px;
    display: inline-block;
}

.linea-letra {
    margin-bottom: 15px;
}

.linea-letra .char {
    cursor: pointer;
}

.acorde {
    color: #941c4e;
    font-size: 15px;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    max-width: 400px;
    width: 100%;
}

.close {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    font-size: 24px;
}

.controles-tono {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    align-items: center;
    width: fit-content;
    border: solid 1px #ccc;
    padding: 10px;
    border-radius: 5px;
    background-color: #f5f5f5;
}


.controles-tono button {
    margin: 0 10px;

}

.controles-letra {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    align-items: center;
    width: fit-content;
    border: solid 1px #ccc;
    padding: 10px;
    border-radius: 5px;
    background-color: #f5f5f5;
    margin-left: 20px;
}

.controles-letra button {
    margin: 0 10px;
}

.controles {
    display: flex;
    margin-bottom: 20px;
}

.icono-link {
    font-size: 24px;
    cursor: pointer;
    border: 1px solid #941c4e;
    padding: 10px;
    border-radius: 50%;
}
</style>