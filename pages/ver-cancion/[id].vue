<template>
    <div class="container">

        <div v-if="loading">Cargando...</div>
        <div v-if="error">Error: {{ error.message }}</div>
        <div v-if="song">
            <div class="controles mt-4">
                <div class="controles-tono">
                    <!-- botones mas +1 y -1 para transportar la cancion -->
                    <button class="btn border" @click="transportar(1)">+1 </button>
                    {{ tonoCancion }}
                    <button class="btn border" @click="transportar(-1)">-1</button>
                </div>
                <div class="controles-letra">
                    <!-- botones mas +1 y -1 para transportar la cancion -->
                    <button class="btn border" @click="cambiarTamanio(1)">+1 </button>
                    letra
                    <button class="btn border" @click="cambiarTamanio(-1)">-1</button>
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

                        <div class="char" v-for="(char, charIndex) in line.split('')" :key="charIndex"
                            @click="openModal(calcularIndice(charIndex, lineIndex))"
                            :id="calcularIndice(charIndex, lineIndex)">
                            <div class="acorde">
                                {{ devolverAcorde(lineIndex, charIndex) }}{{ devolverModificador(lineIndex, charIndex)
                                }}
                            </div>
                            <p :class="char == ' ' ? 'espacio' : ''">{{ char }}</p>

                        </div>
                    </div>
                </div>

            </div>
        </div>
        <div v-if="!song && !loading">Canción no encontrada.</div>
        <!-- Modal -->
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

                <label for="modificador">Modificador:</label>
                <select v-model="modificador" id="modificador">
                    <option v-for="mod in modificadores" :key="mod.id" :value="mod.modificador">{{ mod.modificador }}
                    </option>
                </select>

                <button class="btn btn-success mt-3" @click="saveChord()">Guardar</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabaseClient } from '#imports'

const route = useRoute()
const supabase = useSupabaseClient()
const song = ref(null)
const loading = ref(true)
const error = ref(null)
const showModal = ref(false)
const acorde = ref('')
const modificador = ref('')
const selectedChar = ref(null)
const selectedLine = ref(null)
const acordes = ref([
    {
        numero: 1,
        acorde: 'C',
    },
    {
        numero: 2,
        acorde: 'C#',
    },
    {
        numero: 3,
        acorde: 'D',
    },
    {
        numero: 4,
        acorde: 'D#',
    },
    {
        numero: 5,
        acorde: 'E',
    },
    {
        numero: 6,
        acorde: 'F',
    },
    {
        numero: 7,
        acorde: 'F#',
    },
    {
        numero: 8,
        acorde: 'G',
    },
    {
        numero: 9,
        acorde: 'G#',
    },
    {
        numero: 10,
        acorde: 'A',
    },
    {
        numero: 11,
        acorde: 'A#',
    },
    {
        numero: 12,
        acorde: 'B',
    },
])
const guardando = ref(false)
const acordesCancion = ref([])
const modificadores = ref([])



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

const openModal = (charIndex) => {
    selectedChar.value = charIndex
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
}

const saveChord = () => {
    //guardar en la tabla acordes, cancion_id, numero_acorde, modificador, posicion
    guardando.value = true
    const cancion_id = song.value.id
    const numero_nota = acorde.value
    const mod = modificador.value
    const posicion = selectedChar.value

    supabase.from('acordes').insert([
        { cancion_id, numero_nota, modificador: mod, posicion }
    ]).then(({ error }) => {
        if (error) {
            console.error(error)
            alert('Ocurrió un error al guardar el acorde')
            guardando.value = false
        } else {
            alert('Acorde guardado')
            acorde.value = ''
            modificador.value = ''
            guardando.value = false
            closeModal()
            fetchSong()

        }
    })
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
        if (nuevoAcorde > 12) {
            nuevoAcorde = 1
        }
        if (nuevoAcorde < 1) {
            nuevoAcorde = 12
        }
        acorde.numero_nota = nuevoAcorde
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


onMounted(() => {
    fetchSong();
    getModificadores()
})
</script>

<style scoped>
h1 {
    text-align: center;
}

.char {
    display: inline-block;
    margin-right: 2px;
    cursor: pointer;
    max-width: 11px;
    font-size: 20px;
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
    float: left;
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
    margin-bottom: 20px;
    align-items: center;
    width: fit-content;
    border: solid 1px #ccc;
    padding: 10px;
}


.controles-tono button {
    margin: 0 10px;
}

.controles-letra {
    display: flex;
    margin-bottom: 20px;
    align-items: center;
    width: fit-content;
    border: solid 1px #ccc;
    padding: 10px;
}

.controles-letra button {
    margin: 0 10px;
}

.controles {
    display: flex;
    margin-bottom: 20px;
}
</style>