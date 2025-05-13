<script setup>
    import Meyda from 'meyda';
    import { ref } from 'vue';

    const pitch = ref(null);
    const analyzing = ref(false);
    const notas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const acumuladorChroma = new Array(12).fill(0);
    const emit = defineEmits(['nota-chroma']);

    async function analyzeAudio(file) {
        analyzing.value = true;
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        await audioCtx.resume();

        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;

        const analyzer = Meyda.createMeydaAnalyzer({
            audioContext: audioCtx,
            source,
            bufferSize: 4096,
            featureExtractors: ['chroma'],
            callback: (features) => {
                if (features?.chroma) {
                    features.chroma.forEach((valor, i) => {
                        acumuladorChroma[i] += valor;
                    });
                }
            },
        });

        source.start();
        analyzer.start();

        setTimeout(() => {
            analyzer.stop();
            source.stop();
            audioCtx.close();
            analyzing.value = false;

            const indexNotaMax = acumuladorChroma.indexOf(Math.max(...acumuladorChroma));
            const notaChroma = notas[indexNotaMax];
            pitch.value = `Nota por Chroma: ${notaChroma}`;

            console.log('Nota por Chroma:', notaChroma);
            emit('nota-chroma', notaChroma);
        }, 65000);
    }

    function handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            acumuladorChroma.fill(0);
            pitch.value = null;
            analyzeAudio(file);
        }
    }
</script>

<template>
    <div>
        <input type="file" @change="handleFileChange" accept="audio/*" :disabled="analyzing" />
        <button disabled>
            {{ analyzing ? 'Analizando...' : 'Selecciona un archivo para analizar' }}
        </button>
        <p v-if="pitch">Resultado: {{ pitch }}</p>
    </div>
</template>
