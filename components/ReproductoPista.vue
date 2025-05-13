<template>
    <div class="">
        <div class="row border p-3 text-center">
            <div class="col">
                <button id="btn-inc-key" @click="key++; updateKey()">+</button>
                <!-- <input type="range" v-model="key" @input="updateKey" max="7" min="-7" step="1" /> -->
            </div>
            <div class="col text-tono">
                <span>Tono: {{ notas[(notaActual - 1) + key] }}</span>
            </div>
            <div class="col">
                <button id="btn-dec-key" @click="key--; updateKey()">-</button>
            </div>
        </div>
        <!-- Controles -->
        <!-- <input type="range" v-model="tempo" @input="updateTempo" /> -->
        <!-- <input type="range" v-model="pitch" @input="updatePitch" max="2" min="0.1" step="0.01" /> -->
        <!-- <input type="range" v-model="volume" @input="updateVolume" /> -->

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
    import { ref, onMounted } from 'vue';
    import { PitchShifter } from 'soundtouchjs'; // Ajusta el path si es necesario

    // Variables reactivas
    // const tempo = ref(1.0);
    const pitch = ref(1.0);
    // const volume = ref(1.0);
    const key = ref(1);
    const currentTime = ref('0:00');
    const duration = ref('0:00');
    const progress = ref(0);
    const isPlaying = ref(false);
    const shifter = ref(null);
    const audioCtx = ref(null);
    const gainNode = ref(null);
    const notas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const notaOriginal = ref(null);
    const notaActual = ref(null);
    // const url = ref('https://bvgoedrihwmwjipwtwfl.supabase.co/storage/v1/object/sign/pistas/Pista%20Padre%20Nuestro-%20Si.mp3?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwaXN0YXMvUGlzdGEgUGFkcmUgTnVlc3Ryby0gU2kubXAzIiwiaWF0IjoxNzQ3MTA1NDgzLCJleHAiOjE3Nzg2NDE0ODN9.qRCWcA0IYhEJ1U8jPIuv9EqvuMSv0mmkSenaPqoWN7k');
    // Función para inicializar el AudioContext y GainNode
    const loadingAudio = ref(true);


    const initAudioContext = () => {
        audioCtx.value = new (window.AudioContext || window.webkitAudioContext)();
        gainNode.value = audioCtx.value.createGain();
    };

    const props = defineProps({
        url: {
            type: String,
            default: ''
        },
        tonoOriginal: {
            type: Number,
            default: 0
        }
    })

    // Función para cargar el archivo de audio
    const loadSource = (url) => {
        fetch(url)
            .then((response) => response.arrayBuffer())
            .then((buffer) => {
                audioCtx.value.decodeAudioData(buffer, (audioBuffer) => {
                    shifter.value = new PitchShifter(audioCtx.value, audioBuffer, 16384);
                    // shifter.value.tempo = tempo.value;
                    shifter.value.pitch = pitch.value;

                    shifter.value.on('play', (detail) => {
                        currentTime.value = detail.formattedTimePlayed;
                        progress.value = detail.percentagePlayed;
                    });

                    duration.value = shifter.value.formattedDuration;
                    loadingAudio.value = false; // Cambia el estado de carga
                });
            })
            .catch((error) => {
                console.error('Error cargando el archivo de audio:', error);
            });
    };



    // Función para reproducir el audio
    const play = () => {
        if (shifter.value) {
            shifter.value.connect(gainNode.value);
            gainNode.value.connect(audioCtx.value.destination);
            audioCtx.value.resume().then(() => {
                isPlaying.value = true;
            });
        }
    };

    // Función para pausar el audio
    const pause = () => {
        if (shifter.value) {
            shifter.value.disconnect();
            isPlaying.value = false;
        }
    };
    // Función para detener el audio
    const stop = () => {
        if (shifter.value) {
            shifter.value.disconnect();
            isPlaying.value = false;
            currentTime.value = 0;
            progress.value = 0;
            shifter.value.position = 0; // Reiniciar la posición del audio
            loadSource(props.url); // Recargar el audio
            notaActual.value = notaOriginal.value; // Reiniciar la nota actual
            key.value = 1; // Reiniciar la clave
        }
    };

    // // Actualizar tempo
    // const updateTempo = () => {
    //     if (shifter.value) {
    //         shifter.value.tempo = tempo.value;
    //     }
    // };

    // // Actualizar pitch
    // const updatePitch = () => {
    //     if (shifter.value) {
    //         shifter.value.pitch = pitch.value;
    //     }
    // };

    // // Actualizar volumen
    // const updateVolume = () => {
    //     if (gainNode.value) {
    //         gainNode.value.gain.value = volume.value;
    //     }
    // };

    // Actualizar key
    const updateKey = () => {
        if (shifter.value) {
            shifter.value.pitchSemitones = key.value;
        }
    };

    // Cargar el archivo de audio y configurar los controles cuando el componente esté montado
    onMounted(() => {
        initAudioContext();
        loadSource(props.url); // Ajusta la ruta del archivo de audio
        notaOriginal.value = props.tonoOriginal; // Nota original
        notaActual.value = notaOriginal.value; // Nota actual
        console.log('Nota original:', notaOriginal.value);
        console.log('Nota actual:', notaActual.value);
    });
</script>
<style>

    #btn-inc-key,
    #btn-dec-key {
        background-color: transparent;
        border: none;
        color: #007bff;
        cursor: pointer;
        width: 60px;
        height: 60px;
        font-size: 1.5rem;
        padding: 0.5rem;
        border-radius: 5px;
        transition: color 0.3s ease;
        border: 1px solid #007bff;
        background-color: #d4e4f5;

    }

    .text-tono {
        font-size: 1.5rem;
        font-weight: bold;
        color: #333;
    }

    #btn-play,
    #btn-pause,
    #btn-stop {
        background-color: transparent;
        border: none;
        color: #b670e4;
        cursor: pointer;
        font-size: 2rem;
        padding: 0.5rem;
        border-radius: 5px;
        transition: color 0.3s ease;
        border: 1px solid #dd8fec;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
        margin-left: 1rem;
        margin-right: 1rem;
        background-color: #d4e4f5;
    }



</style>