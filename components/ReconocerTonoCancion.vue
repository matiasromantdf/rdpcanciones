<script setup>
    import Meyda from 'meyda';
    import { ref } from 'vue';

    const pitch = ref(null);
    const analyzing = ref(false);
    const analizarCancion = ref(false);
    const acumuladorChroma = new Array(12).fill(0);
    const emit = defineEmits(['nota-chroma', 'archivo-cargado']);
    const archivoCargado = ref(false);
    const counter = ref(60);

    const majorProfile = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
    const minorProfile = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
    const notas = ['DO', 'DO#', 'RE', 'RE#', 'MI', 'FA', 'FA#', 'SOL', 'SOL#', 'LA', 'LA#', 'SI'];

    function correlation(a, b) {
        const meanA = a.reduce((s, v) => s + v, 0) / a.length;
        const meanB = b.reduce((s, v) => s + v, 0) / b.length;
        const numerator = a.reduce((sum, v, i) => sum + ((v - meanA) * (b[i] - meanB)), 0);
        const denomA = Math.sqrt(a.reduce((sum, v) => sum + Math.pow(v - meanA, 2), 0));
        const denomB = Math.sqrt(b.reduce((sum, v) => sum + Math.pow(v - meanB, 2), 0));
        return numerator / (denomA * denomB);
    }


    async function analyzeAudio(file) {
        if (!analizarCancion.value) return;

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
            featureExtractors: ['chroma', 'rms'],
            callback: (features) => {
                if (features?.chroma && features.rms > 0.01) {
                    const suma = features.chroma.reduce((a, b) => a + b, 0);
                    const normalizedChroma = features.chroma.map(v => v / suma);
                    normalizedChroma.forEach((valor, i) => {
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

            let mejorCorrelacion = -Infinity;
            let tonalidad = '';

            for (let i = 0; i < 12; i++) {
                const rotado = [...acumuladorChroma.slice(i), ...acumuladorChroma.slice(0, i)];

                const corrMayor = correlation(rotado, majorProfile);
                const corrMenor = correlation(rotado, minorProfile);

                if (corrMayor > mejorCorrelacion) {
                    mejorCorrelacion = corrMayor;
                    tonalidad = `${notas[i]} Mayor`;
                }
                if (corrMenor > mejorCorrelacion) {
                    mejorCorrelacion = corrMenor;
                    tonalidad = `${notas[i]} menor`;
                }
            }

            pitch.value = tonalidad;
            emit('nota-chroma', tonalidad);
            analyzing.value = false;

        }, 60000); // 60 segundos
    }

    // contador para mostrar el tiempo restante
    if (process.client) {
        setInterval(() => {
            if (analyzing.value) {
                counter.value--;
                if (counter.value <= 0) {
                    counter.value = 60;
                }
            }
        }, 1000);
    }

    function handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            acumuladorChroma.fill(0);
            pitch.value = null;
            archivoCargado.value = true;
            emit('archivo-cargado', file);
            if (analizarCancion.value) {
                analyzeAudio(file);
            }
        }
    }
</script>

<template>
    <div class="analizador-container">
        <h2>Pista</h2>

        <div class="input-container">
            <input type="file" @change="handleFileChange" accept="audio/*" :disabled="analyzing" class="file-input" />
        </div>

        <div class="checkbox-container">
            <label>
                <input type="checkbox" v-model="analizarCancion" class="checkbox" />
                Activar análisis de tono
            </label>
        </div>

        <p v-if="archivoCargado" class="archivo-ok">Archivo cargado correctamente ✅</p>

        <div class="d-flex align-items-center" v-if="analyzing">
            <strong class="me-2">Detectando tono... {{ counter }}</strong>
            <div class="spinner-border ml-auto" role="status" aria-hidden="true"></div>
        </div>

        <p v-if="pitch" class="result">Tonalidad detectada: {{ pitch }}</p>
    </div>
</template>

<style scoped>
    .analizador-container {
        font-family: Arial, sans-serif;
        width: 100%;
        max-width: 400px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    h2 {
        text-align: center;
        color: #333;
        font-size: 1.5rem;
        margin-bottom: 20px;
    }

    .input-container {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-bottom: 20px;
    }

    .file-input {
        padding: 10px;
        font-size: 1rem;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #fff;
    }

    .checkbox-container {
        margin-top: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .checkbox {
        margin-right: 5px;
    }

    .result {
        font-size: 1rem;
        font-weight: bold;
        text-align: center;
        color: #333;
        margin-top: 20px;
    }
</style>
