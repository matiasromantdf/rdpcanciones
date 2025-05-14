<script setup>
    import { ref } from 'vue';
    import { useSupabase } from '../composables/useSupabase';



    const { supabase } = useSupabase();
    const analyzing = ref(false);
    const uploading = ref(false);
    const archivoSubido = ref(false);
    const respuestaAnalisis = ref(null);
    const urlCancionSubida = ref(null);

    const props = defineProps({
        id: {
            type: String,
            required: true,
        },
    });

    onMounted(() => {
        console.log('Componente montado, id:', props.id);
    });

    const emit = defineEmits(['archivo-cargado']);

    const analizarCancion = async () => {
        document.getElementById('btn-analizar').disabled = true;
        analyzing.value = true;
        console.log('Analizando canción con ID:', props.id);
        const response = await fetch(
            'https://detect-key-service.onrender.com/detect-key?url=' +
            encodeURIComponent(urlCancionSubida.value)
        );
        respuestaAnalisis.value = await response.json();
        document.getElementById('btn-analizar').disabled = false;
        analyzing.value = false;

    }


    const handleFile = async () => {
        const fileInput = document.querySelector('.file-input');
        const file = fileInput.files[0];
        console.log('Archivo recibido:', file);
        uploading.value = true;

        // Subir el archivo a Supabase Storage
        const { data, error } = await supabase.storage.from('pistas').upload(`${file.name}`, file, {
            upsert: true
        })

        if (error) {
            console.error('Error al subir el archivo:', error)
            return
        }

        // Obtener la URL pública del archivo
        const { data: publicData } = supabase.storage
            .from('pistas')
            .getPublicUrl(`${file.name}`)

        if (publicData && publicData.publicUrl) {
            console.log('URL pública:', publicData.publicUrl)
            urlCancionSubida.value = publicData.publicUrl
            emit('archivo-cargado', publicData.publicUrl)
            archivoSubido.value = true;
        } else {
            console.error('No se pudo obtener la URL pública.')
        }
        uploading.value = false;
    }


</script>

<template>
    <div class="analizador-container">
        <h2>Pista</h2>

        <div class="input-container">
            <input type="file" @change="handleFile" accept="audio/*" :disabled="uploading" class="file-input" />
        </div>

        <p v-if="uploading" class="">Cargando archivo...</p>
        <p v-if="archivoSubido" class="archivo-ok">Archivo subido correctamente</p>

        <div class="row">
            <div class="col">
                <button class="btn btn-primary" @click.prevent="analizarCancion" :disabled="!archivoSubido"
                    id="btn-analizar">Analizar</button>
            </div>
            <div class="col d-flex align-items-center justify-content-center" v-if="analyzing">
                <div class="spinner-border ml-auto" role="status" aria-hidden="true"></div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                {{ respuestaAnalisis }}
            </div>
        </div>

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

    .archivo-ok {
        color: green;
        font-weight: bold;
        text-align: center;
        margin-top: 10px;
    }
</style>
