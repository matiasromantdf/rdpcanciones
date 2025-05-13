<script setup>
    import Meyda from 'meyda';
    import { ref } from 'vue';

    const pitch = ref(null);
    const analyzing = ref(false);
    const analizarCancion = ref(false);
    const notas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const acumuladorChroma = new Array(12).fill(0);
    const emit = defineEmits(['nota-chroma', 'archivo-cargado']);
    const archivoCargado = ref(false)
    
    
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
            <input 
                type="file" 
                @change="handleFileChange" 
                accept="audio/*" 
                :disabled="analyzing" 
                class="file-input"
            />
        </div>

        <div class="checkbox-container">
            <label>
                <input type="checkbox" v-model="analizarCancion" class="checkbox" />
                Activar análisis de la canción
            </label>
        </div>
        <p v-if="archivoCargado" class="archivo-ok">Archivo cargado correctamente ✅</p>


        <p v-if="pitch" class="result">Resultado: {{ pitch }}</p>
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
