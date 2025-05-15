<template>
    <div class="">
        <div class="row">
            <div class="col">
                <audio ref="audioRef" :src="props.url" @loadedmetadata="onLoadedMetadata" @timeupdate="actualizarTiempo"
                    preload="auto" crossorigin="anonymous"></audio>

            </div>
        </div>
        <!-- Controles de tono -->
        <div class="row border p-3 text-center">
            <div class="col">
                <button id="btn-dec-key" @click="bajarTono">
                    <span>-</span>
                </button>
            </div>
            <div class="col text-tono">
                <span>Tono: {{ getNota }}</span>
            </div>
            <div class="col">
                <button id="btn-inc-key" @click="subirTono">
                    <span>+</span>
                </button>
            </div>


        </div>

        <!-- Controles de reproducción -->
        <div class="row border p-3 text-center" v-if="!audioListo">
            <div class="col">
                <div class="spinner-border mt-2" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
        <div class="row border p-3 " v-else>
            <div class="col d-flex justify-content-center">
                <button id="btn-play" @click="togglePlay" :class="isPlaying ? 'playing' : ''"><i
                        :class="!isPlaying ? 'bi bi-play' : 'bi bi-pause'"></i></button>
            </div>
            <div class="col d-flex justify-content-center">
                <button id="btn-stop" @click="stopAudio"><i class="bi bi-stop"></i></button>
            </div>
            <div class="col text-center">
                <progress :value="progress" max="100"></progress>
                <div>
                    <span>{{ tiempo }}</span> / <span>{{ duracion }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';

    const tonos = ['DO', 'DO#', 'RE', 'RE#', 'MI', 'FA', 'FA#', 'SOL', 'SOL#', 'LA', 'LA#', 'SI'];
    const tonoIndex = ref(0); // DO por defecto

    const audioRef = ref(null);
    const audioCtx = ref(null);
    const soundtouchNode = ref(null);
    const sourceNode = ref(null);

    const audioListo = ref(false);
    const isPlaying = ref(false);
    const tiempo = ref('00:00');
    const duracion = ref('00:00');


    const props = defineProps(['url', 'tonoOriginal']);

    const formatTime = (segundos) => {
        const min = Math.floor(segundos / 60);
        const sec = Math.floor(segundos % 60);
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const onLoadedMetadata = () => {
        duracion.value = formatTime(audioRef.value.duration);
        audioListo.value = true;
    };
    const progress = computed(() => {
        if (audioRef.value && audioRef.value.duration) {
            return (audioRef.value.currentTime / audioRef.value.duration) * 100;
        }
        return 0;
    });

    const getNota = computed(() => {
        return tonos[tonoIndex.value];
    });


    const actualizarTiempo = () => {
        if (audioRef.value) {
            tiempo.value = formatTime(audioRef.value.currentTime);
        }
    };

    const actualizarPitch = () => {
        if (soundtouchNode.value) {
            // Asumiendo que 'pitchSemitones' es el parámetro correcto
            soundtouchNode.value.parameters.get('pitchSemitones').value = tonoIndex.value;
        }
    };

    const inicializarAudioContext = async () => {
        if (audioCtx.value) return; // Ya inicializado

        audioCtx.value = new AudioContext();
        await audioCtx.value.audioWorklet.addModule('/soundtouch-worklet.js');

        sourceNode.value = audioCtx.value.createMediaElementSource(audioRef.value);
        soundtouchNode.value = new AudioWorkletNode(audioCtx.value, 'soundtouch-processor');
        sourceNode.value.connect(soundtouchNode.value).connect(audioCtx.value.destination);

        actualizarPitch();
    };

    const togglePlay = async () => {

        if (!audioRef.value) return;

        if (!audioCtx.value) {
            await inicializarAudioContext();
        }

        if (audioCtx.value.state === 'suspended') {
            await audioCtx.value.resume();
        }

        if (isPlaying.value) {
            audioRef.value.pause();
        } else {
            await audioRef.value.play();
        }

        isPlaying.value = !isPlaying.value;
    };

    const stopAudio = async () => {
        if (!audioRef.value) return;

        audioRef.value.pause();
        audioRef.value.currentTime = 0;
        tiempo.value = '00:00';
        isPlaying.value = false;
        tonoIndex.value = props.tonoOriginal

        // NO cerramos el audioContext para evitar errores al reconectar
        // Lo dejamos abierto para la próxima reproducción
    };

    const subirTono = () => {
        if (tonoIndex.value === 11) {
            tonoIndex.value = 0;
        }
        tonoIndex.value = (tonoIndex.value + 1) % tonos.length;
        actualizarPitch();
    };

    const bajarTono = () => {
        if (tonoIndex.value === 0) {
            tonoIndex.value = 11;
        }
        tonoIndex.value = (tonoIndex.value - 1 + tonos.length) % tonos.length;
        actualizarPitch();
    };


    onMounted(() => {
        if (audioRef.value && audioRef.value.readyState >= 3) {
            onLoadedMetadata();
        }
        tonoIndex.value = props.tonoOriginal - 1; // Ajustar el índice para que coincida con el array de tonos
        console.log('Tono original:', props.tonoOriginal);
    });
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

    #btn-play.playing {
        background-color: #b670e4;
        color: #fff;
    }
</style>
