<template>
    <div class="lista">
        <p>
            {{ voz.nombre }}
        </p>
        <ul>
            <li v-for="cancion in canciones" :key="cancion.id">
                {{ cancion.canciones.titulo }}
            </li>
        </ul>
    </div>

</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useSupabase } from '~/composables/useSupabase';


const { supabase } = useSupabase();
const canciones = ref([])

const props = defineProps({
    voz: {
        type: Object,
        required: true
    },
    tono: {
        type: Number,
        required: true
    }
})

const getCancionesDeVoces = async (voz) => {
    const { error, data } = await supabase.from('repertorio_voces').select('*, canciones(*)').eq('user_id', voz.id).eq('tono_numero', props.tono)
    if (error) {
        console.error('Error al obtener el repertorio:', error.message)
    } else {
        canciones.value = data
    }

}

watch(() => props.tono, async (newValue) => {
    await getCancionesDeVoces(props.voz)
})
watch(() => props.voz, async (newValue) => {
    await getCancionesDeVoces(newValue)
})


</script>

<style scoped>
.lista {
    border: 1px solid #ccc;
    padding: 10px;
    margin: 10px;
    border-radius: 5px;
    background-color: #e6ebf0;
    margin-right: 10px;
}

ul {
    width: 200px;
}

li {
    padding: 5px;
}
</style>