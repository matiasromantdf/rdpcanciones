<template>
    <div class="fondo">
    </div>
    <div class="modal-evento">
        <div class="modal-header mb-2">
            <h5 class="modal-title">{{ traducirFecha(fecha) }}</h5>
            <button type="button" class="btn-close" @click="cerrarModal"></button>

        </div>
        <hr>
        <div class="modal-body">
            <div class="row voces-seleccionadas">
                <div class="voz-seleccionada" v-for="voz in vocesSeleccionadas">
                    <div class="nombre-voz">
                        {{ voz.nombre }}
                    </div>
                    <div class="boton-eliminar" @click="eliminarVoz(voz)">
                        x
                    </div>
                </div>
            </div>
            <div class="row mb-4 d-flex  align-items-center">
                <div class="col-md-12 col-sm-12">
                    <label for="voces" class="label"> seleccionar voces</label>
                    <select name="voces" id="voces" class="form-control" v-model="vozSeleccionada"
                        @change="aniadirVoz()">
                        <option value="-1">Seleccionar voz</option>
                        <option v-for="voz in voces" :value="voz.id">{{ voz.nombre }}</option>
                    </select>
                </div>
                <div class="col-md-4 col-sm-12">
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-12 col-sm-12">
                    <label for="titulo" class="label">Titulo</label>
                    <input type="text" name="titulo" id="titulo-evento" class="form-control"
                        placeholder="ingrese un título">
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="guardarEvento"
                :disabled="(!vocesSeleccionadas.length > 0)">Guardar</button>
        </div>
    </div>
</template>

<script setup>
import { useSupabase } from '~/composables/useSupabase';

import { ref } from 'vue'
import { defineEmits } from 'vue';
import { defineProps } from 'vue';

const { usuario, roles, hasRole, supabase } = useSupabase();

const voces = ref([])
const getVoces = async () => {
    const { data, error } = await supabase.from('voces_users_view').select('*')
    if (error) {
        console.error('Error al obtener las voces:', error.message)
    } else {
        voces.value = data

    }
}

const vozSeleccionada = ref(-1)
const vocesSeleccionadas = ref([])
const aniadirVoz = () => {
    if (vozSeleccionada.value != -1) {
        vocesSeleccionadas.value.push(voces.value.find(v => v.id == vozSeleccionada.value))
    }
    voces.value = voces.value.filter(v => v.id != vozSeleccionada.value)
    vozSeleccionada.value = -1

}
const eliminarVoz = (voz) => {
    vocesSeleccionadas.value = vocesSeleccionadas.value.filter(v => v.id != voz.id)
}



const props = defineProps({
    fecha: Date,
})

const emit = defineEmits(['cerrar', 'actualizarEventos'])

const cerrarModal = () => {
    emit('cerrar')
}

const traducirFecha = (fecha) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return fecha.toLocaleDateString('es-ES', options)
}

const guardarEvento = () => {
    let titulo = document.getElementById('titulo-evento').value
    let fecha = props.fecha
    let voces = vocesSeleccionadas.value

    supabase.from('eventos').insert({
        titulo: titulo,
        fecha: fecha,
        integrantes: voces
    }).then(({ data, error }) => {
        if (error) {
            console.error('Error al guardar el evento:', error.message)
        } else {
            console.log('Evento guardado:', data)
            emit('actualizarEventos')
            cerrarModal()
        }
    })
}


onMounted(async () => {
    await getVoces()
})

</script>

<style scoped>
.fondo {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 900;
}

.modal-evento {
    z-index: 1000;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    border-radius: 5px;
    padding: 1rem;
    max-width: 500px;
    min-width: 300px;
    margin-left: 10px;
    margin-right: 10px;

}

h5 {
    margin: 0;
    font-size: 1rem;
}

.voces-seleccionadas {
    margin-bottom: 1rem;
    display: flex;
    flex-wrap: wrap;
    font-style: italic;
}

.voz-seleccionada {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 0.5rem;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: fit-content;
    background-color: #f3f6f8;
}

.boton-eliminar {
    cursor: pointer;
    color: red;
    margin-left: 0.5rem;
}

.btn-close {
    border: 1px solid black;
    border-radius: 5px;
    padding: 0.5rem;
    margin-left: 10px;
    background-color: gray;
}
</style>