<template>
    <div class="container">
        <div class="row">
            <div class="col">
                <h1>Crear listado por tono</h1>
            </div>
        </div>
        <div class="row mb-4 d-flex  align-items-center">
            <div class="col-md-4 col-sm-12">
                <label for="voces">Voces</label>
                <select name="voces" id="voces" class="form-control" v-model="vozSeleccionada">
                    <option v-for="voz in voces" :value="voz.id">{{ voz.nombre }}</option>
                </select>
            </div>
            <div class="col-md-4 col-sm-12">
                <button class="btn btn-primary mt-4" @click="aniadirVoz()">Añadir voz</button>
            </div>
        </div>
        <div class="row">
            <voz-seleccionada-component v-for="voz in vocesSeleccionadas" :voz="voz" @eliminar="eliminarVoz" />
        </div>
        <div class="row mb-4">
            <div class="col-md-4 col-sm-12">
                <label for="tonos" class="">Seleccionar tono</label>
                <select name="tonos" id="tonos" class="form-control" v-model="tonoSeleccionado">
                    <option v-for="tono in tonos" :value="tono.numero">{{ tono.valor }}</option>
                </select>
            </div>

        </div>
        <div class="tabla">
            <tabla-canciones-voces-component v-for="voz in vocesSeleccionadas" :voz="voz" :tono="tonoSeleccionado"
                v-if="tonoSeleccionado != null" />

        </div>
    </div>
</template>
<script setup>
import { useSupabase } from '~/composables/useSupabase';
import { onMounted } from 'vue';


const { usuario, roles, hasRole, supabase } = useSupabase();
const vozSeleccionada = ref(null)

const voces = ref([])
const vocesSeleccionadas = ref([])
const tonos = [
    { numero: 1, valor: 'Do' },
    { numero: 2, valor: 'Do#' },
    { numero: 3, valor: 'Re' },
    { numero: 4, valor: 'Re#' },
    { numero: 5, valor: 'Mi' },
    { numero: 6, valor: 'Fa' },
    { numero: 7, valor: 'Fa#' },
    { numero: 8, valor: 'Sol' },
    { numero: 9, valor: 'Sol#' },
    { numero: 10, valor: 'La' },
    { numero: 11, valor: 'La#' },
    { numero: 12, valor: 'Si' }
]
const tonoSeleccionado = ref(null)

const getVoces = async () => {
    const { data, error } = await supabase.from('voces_users_view').select('*')
    if (error) {
        console.error('Error al obtener las voces:', error.message)
    } else {
        voces.value = data
        console.log('Voces:', data)
    }
}

const aniadirVoz = () => {
    const voz = voces.value.find(v => v.id === vozSeleccionada.value)
    if (voz) {
        vocesSeleccionadas.value.push(voz)
    }
}

const eliminarVoz = (voz) => {
    console.log('Eliminar voz:', voz)
    vocesSeleccionadas.value = vocesSeleccionadas.value.filter(v => v.id !== voz)
}

onMounted(async () => {
    if (!hasRole('admin_voces')) {
        router.push('/')
    }
    await getVoces()
})

</script>

<style scoped>
.tabla {
    display: flex;
    overflow-x: scroll;
    margin-top: 20px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-bottom: 20px;
}

.tabla::-webkit-scrollbar {
    height: 10px;
}

.tabla::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 5px;
}
</style>