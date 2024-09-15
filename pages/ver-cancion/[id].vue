<template>
    <div class="container">
        <h1>Detalles de la Canción</h1>
        <div v-if="loading">Cargando...</div>
        <div v-if="error">Error: {{ error.message }}</div>
        <div v-if="song">
            <h2>{{ song.nombre }}</h2>
            <p><strong>Autor:</strong> {{ song.autor }}</p>
            <div class="song-lyrics">
                <div v-for="(line, lineIndex) in song.letra.split('\n')" :key="lineIndex">
                    <span v-for="(char, charIndex) in line.split('')" :key="charIndex"
                        @click="openModal(charIndex, lineIndex)">
                        {{ char }}
                    </span>
                </div>
            </div>
        </div>
        <div v-if="!song && !loading">Canción no encontrada.</div>

        <!-- Modal -->
        <div v-if="showModal" class="modal-overlay">
            <div class="modal-content">
                <span class="close" @click="closeModal">&times;</span>
                <h3>Agregar Acorde</h3>
                <label for="acorde">Acorde:</label>
                <select v-model="acorde" id="acorde">
                    <option v-for="acorde in acordes" :key="acorde.numero" :value="acorde.acorde">
                        {{ acorde.acorde }}
                    </option>
                </select>

                <label for="modificador">Modificador:</label>
                <input v-model="modificador" type="text" id="modificador" />

                <button class="btn btn-success mt-3" @click="saveChord">Guardar</button>
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
    } catch (err) {
        error.value = err
    } finally {
        loading.value = false
    }
}

const openModal = (charIndex, lineIndex) => {
    selectedChar.value = charIndex
    selectedLine.value = lineIndex
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
}

const saveChord = () => {
    console.log(`Acorde: ${acorde.value}, Modificador: ${modificador.value}, Posición: [Línea: ${selectedLine.value + 1}, Carácter: ${selectedChar.value + 1}]`)
    closeModal()
}

onMounted(() => {
    fetchSong()
})
</script>

<style scoped>
h1 {
    text-align: center;
}

.song-lyrics {
    white-space: pre-wrap;
    line-height: 2.6;
    font-family: monospace;
}

.song-lyrics div {
    white-space: pre-wrap;
}

.song-lyrics span {
    display: inline;
    cursor: pointer;
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
</style>