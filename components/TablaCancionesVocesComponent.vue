<template>
    <div class="lista">
        <div v-if="cargando" class="loader">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>
        <div v-else>
            <p>
                {{ voz.nombre }}
            </p>
            <ul>
                <li v-for="cancion in canciones" :key="cancion.id">
                    {{ cancion.canciones.titulo }}
                </li>
            </ul>
        </div>
    </div>

</template>


<script setup>
    import { ref, onMounted } from 'vue'
    import { useSupabase } from '~/composables/useSupabase';


    const { supabase } = useSupabase();
    const canciones = ref([])
    const cargando = ref(false)

    const props = defineProps({
        voz: {
            type: Object,
            required: true
        },
        tono: {
            type: Number,
            required: true
        },
        modo: {
            type: Boolean,
            required: true
        },
        tipo: {
            type: Number,
            required: true
        }
    })

    const getCancionesDeVoces = async (voz) => {
        cargando.value = true

        const { data, error } = await supabase
            .rpc('get_repertorio_filtrado', {
                p_user_id: voz.id,
                p_tono_numero: props.tono,
                p_tono_esmenor: props.modo,
                p_tipo: props.tipo
            })

        cargando.value = false

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
    watch(() => props.modo, async (newValue) => {
        await getCancionesDeVoces(props.voz)
    })
    watch(() => props.tipo, async (newValue) => {
        await getCancionesDeVoces(props.voz)
    })

    onMounted(async () => {
        await getCancionesDeVoces(props.voz)
    })


</script>

<style scoped>
    .lista {
        border: 1px solid #ccc;
        padding: 10px;
        margin: 10px;
        border-radius: 5px;
        background-color: #a9defd;
        margin-right: 10px;
        height: fit-content;
        box-shadow: 0 0 5px #ccc;
        min-width: 200px;
    }

    .lista p {
        font-weight: bold;
        margin-bottom: 10px;
        text-align: center;
    }

    ul {
        width: 200px;
    }

    li {
        padding: 5px;
    }

    .loader {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100px;
    }
</style>