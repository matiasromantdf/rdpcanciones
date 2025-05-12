<template>
    <div>
        <h1>Reproductor de Pista</h1>

        <button @click="playAudio">Reproducir</button>
        <button @click="stopAudio">Detener</button>
        <button @click="subirPitch">Subir tono</button>
        <label for="tono-cancion">Tono de la canción: {{ tonoActual }}</label>
        <button @click="bajarPitch">Bajar tono</button>
        <!-- <input type="range" min="-12" max="12" v-model="pitch" @input="updatePitch" /> -->
        <button @click="iniciarAnalisisDeTono">ver tono predominante</button>


    </div>
</template>

<script setup>
    import { ref, onMounted } from "vue";
    import * as Tone from "tone";
    import Meyda from "meyda";


    const audioUrl = "https://bvgoedrihwmwjipwtwfl.supabase.co/storage/v1/object/sign/pistas/pista.mp3?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwaXN0YXMvcGlzdGEubXAzIiwiaWF0IjoxNzQ2OTk0MjE5LCJleHAiOjE3Nzg1MzAyMTl9.zXACQV5-nq6KxaZm6BJzEqqQsp6DuK7fInScNHOmhX8"; // Reemplaza con la URL real

    let player = null;
    let pitchShift = null;
    const pitch = ref(0);
    const tonoCancion = ref(0);
    const tonos = ref([
        { name: "C", value: 1 },
        { name: "C#", value: 2 },
        { name: "D", value: 3 },
        { name: "D#", value: 4 },
        { name: "E", value: 5 },
        { name: "F", value: 6 },
        { name: "F#", value: 7 },
        { name: "G", value: 8 },
        { name: "G#", value: 9 },
        { name: "A", value: 10 },
        { name: "A#", value: 11 },
        { name: "B", value: 12 },
    ]);

    onMounted(() => {
        pitchShift = new Tone.PitchShift({
            pitch: pitch.value,
        }).toDestination();

        player = new Tone.Player(audioUrl, () => {
            console.log("Audio cargado");
        }).connect(pitchShift);
        tonoCancion.value = 5;// Reemplaza con el tono de la canción cuando viene de la API
    });

    const playAudio = async () => {
        Tone.loaded().then(() => {
            if (player) {
                player.start();
            }
        });
    };

    const tonoActual = computed(() => {
        if (tonoCancion.value === null || tonoCancion.value === undefined) {
            return "Desconocido";
        }
        const tono = tonos.value.find((t) => t.value === tonoCancion.value);
        return tono ? tono.name : "Desconocido";

    });


    const stopAudio = () => {
        if (player) {
            player.stop();
        }
    };



    const subirPitch = () => {
        if (pitch.value < 12) {
            pitch.value++;
            tonoCancion.value++;
            if (tonoCancion.value === 13) {
                tonoCancion.value = 1;
            }
            updatePitch();
        }
    };

    const bajarPitch = () => {
        if (pitch.value > -12) {
            pitch.value--;
            tonoCancion.value--;
            if (tonoCancion.value === 0) {
                tonoCancion.value = 12;
            }
            updatePitch();
        }
    };
    const updatePitch = () => {
        if (pitchShift) {
            pitchShift.pitch = pitch.value;
        }
    };

    // Función para detectar el tono predominante con Meyda
    const iniciarAnalisisDeTono = () => {
        if (!Meyda) {
            console.error("Meyda no está cargado");
            return;
        }

        if (!player) {
            console.error("El reproductor no está inicializado.");
            return;
        }

        const audioCtx = Tone.context;
        const gainNode = new Tone.Gain().toDestination();
        player.connect(gainNode);

        const meydaAnalyzer = Meyda.createAnalyzer({
            audioContext: audioCtx,
            source: audioCtx.createMediaStreamSource(audioCtx.createMediaStreamDestination().stream), // Conexión alternativa
            bufferSize: 1024,
            featureExtractors: ["spectralCentroid"],
            callback: (features) => {
                console.log("Frecuencia dominante:", features.spectralCentroid);
            }
        });

        meydaAnalyzer.start();

        setTimeout(() => {
            meydaAnalyzer.stop();
            console.log("Análisis finalizado.");
        }, 10000); // Analiza por 10 segundos
    };

    // Función para encontrar el tono más cercano en la escala musical
    const calcularTonoCercano = (tono) => {
        const tonoEncontrado = tonos.value.find(t => tono.startsWith(t.name));
        return tonoEncontrado ? tonoEncontrado.value : tonoCancion.value;
    };






</script>
