<template>
    <div>
        <!-- Controles de tono -->
        <div class="row border p-3 text-center">
            <div class="col">
                <button id="btn-inc-key" :disabled="loadingNotaMas" @click="incrementarNota">
                    <span v-if="loadingNotaMas" class="spinner-border spinner-border-sm" role="status"
                        aria-hidden="true"></span>
                    <span v-else>+</span>
                </button>
            </div>
            <div class="col text-tono">
                <span>Tono: {{ getNota }}</span>
            </div>
            <div class="col">
                <button id="btn-dec-key" :disabled="loadingNotaMenos" @click="decrementarNota">
                    <span v-if="loadingNotaMenos" class="spinner-border spinner-border-sm" role="status"
                        aria-hidden="true"></span>
                    <span v-else>-</span>
                </button>
            </div>
        </div>

        <!-- Controles de reproducción -->
        <div class="row border p-3 text-center">
            <div class="col" v-if="loadingAudio">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            <div class="col" v-else>
                <button id="btn-play" :disabled="isPlaying" @click="play"><i class="bi bi-play"></i></button>
            </div>
            <div class="col">
                <button id="btn-pause" :disabled="!isPlaying" @click="pause"><i class="bi bi-pause"></i></button>
            </div>
            <div class="col">
                <button id="btn-stop" @click="stop"><i class="bi bi-stop"></i></button>
            </div>
            <div class="col">
                <progress :value="progress" max="100"></progress>
                <div>
                    <span>{{ currentTime }}</span> / <span>{{ duration }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
    import { PitchShifter } from 'soundtouchjs'

    const props = defineProps({
        url: { type: String, required: true },
        tonoOriginal: { type: Number, default: 0 },
    })

    const pitch = ref(1.0)
    const key = ref(1)
    const currentTime = ref('0:00')
    const duration = ref('0:00')
    const progress = ref(0)
    const isPlaying = ref(false)
    const loadingAudio = ref(true)
    const loadingNotaMas = ref(false)
    const loadingNotaMenos = ref(false)

    const shifter = ref(null)
    const audioCtx = ref(null)
    const gainNode = ref(null)
    const sourceBuffer = ref(null)

    const notas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const notaOriginal = ref(props.tonoOriginal)

    const getNota = computed(() => {
        const index = (notaOriginal.value - 1 + key.value + 12) % 12
        return notas[index]
    })

    function initAudioContext() {
        audioCtx.value = new (window.AudioContext || window.webkitAudioContext)()
        gainNode.value = audioCtx.value.createGain()
    }

    async function loadSource() {
        loadingAudio.value = true

        try {
            const response = await fetch(props.url)
            const buffer = await response.arrayBuffer()
            const audioBuffer = await audioCtx.value.decodeAudioData(buffer)

            sourceBuffer.value = audioBuffer

            shifter.value = new PitchShifter(audioCtx.value, audioBuffer, 16384)
            shifter.value.pitchSemitones = key.value
            shifter.value.connect(gainNode.value)
            gainNode.value.connect(audioCtx.value.destination)

            shifter.value.on('play', (detail) => {
                currentTime.value = detail.formattedTimePlayed
                progress.value = detail.percentagePlayed
            })

            duration.value = shifter.value.formattedDuration
        } catch (err) {
            console.error('Error cargando audio:', err)
        }

        loadingAudio.value = false
    }

    async function updateKey() {
        if (!sourceBuffer.value || !audioCtx.value) return

        if (shifter.value) {
            shifter.value.disconnect()
        }

        shifter.value = new PitchShifter(audioCtx.value, sourceBuffer.value, 16384)
        shifter.value.pitchSemitones = key.value
        shifter.value.connect(gainNode.value)
        gainNode.value.connect(audioCtx.value.destination)

        shifter.value.on('play', (detail) => {
            currentTime.value = detail.formattedTimePlayed
            progress.value = detail.percentagePlayed
        })

        duration.value = shifter.value.formattedDuration

        if (isPlaying.value) {
            play()
        }
    }

    const incrementarNota = async () => {
        if (loadingNotaMas.value) return
        loadingNotaMas.value = true

        key.value = key.value === 7 ? -7 : key.value + 1
        await updateKey()

        loadingNotaMas.value = false
    }

    const decrementarNota = async () => {
        if (loadingNotaMenos.value) return
        loadingNotaMenos.value = true

        key.value = key.value === -7 ? 7 : key.value - 1
        await updateKey()

        loadingNotaMenos.value = false
    }

    function play() {
        if (shifter.value) {
            shifter.value.connect(gainNode.value)
            gainNode.value.connect(audioCtx.value.destination)

            audioCtx.value.resume().then(() => {
                isPlaying.value = true
            })
        }
    }

    function pause() {
        if (shifter.value) {
            shifter.value.disconnect()
            isPlaying.value = false
        }
    }

    function stop() {
        if (shifter.value) {
            shifter.value.disconnect()
            isPlaying.value = false
            shifter.value.position = 0
            currentTime.value = '0:00'
            progress.value = 0
        }
    }

    onMounted(async () => {
        initAudioContext()
        await loadSource()
    })

    onBeforeUnmount(() => {
        if (audioCtx.value) {
            audioCtx.value.close()
        }
    })
</script>

<style>

    #btn-inc-key,
    #btn-dec-key {
        background-color: #d4e4f5;
        border: 1px solid #007bff;
        color: #007bff;
        cursor: pointer;
        width: 60px;
        height: 60px;
        font-size: 1.5rem;
        padding: 0.5rem;
        border-radius: 5px;
        transition: color 0.3s ease;
    }

    .text-tono {
        font-size: 1.5rem;
        font-weight: bold;
        color: #333;
    }

    #btn-play,
    #btn-pause,
    #btn-stop {
        background-color: #d4e4f5;
        border: 1px solid #dd8fec;
        color: #b670e4;
        cursor: pointer;
        font-size: 2rem;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 1rem 1rem;
    }
</style>
