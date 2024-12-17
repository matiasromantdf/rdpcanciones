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
                <div :class="voz.director ? 'voz-seleccionada director' : 'voz-seleccionada'"
                    v-for="voz in vocesSeleccionadas">
                    <div class="boton-director" @click="voz.director = !voz.director">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>compass-outline</title>
                            <path
                                d="M7,17L10.2,10.2L17,7L13.8,13.8L7,17M12,11.1A0.9,0.9 0 0,0 11.1,12A0.9,0.9 0 0,0 12,12.9A0.9,0.9 0 0,0 12.9,12A0.9,0.9 0 0,0 12,11.1M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
                        </svg>
                    </div>
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
                :disabled="(vocesSeleccionadas.length == 0)">Guardar</button>
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
        let voz = voces.value.find(v => v.id == vozSeleccionada.value)
        voz.director = false
        vocesSeleccionadas.value.push(voz)
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
    //ordenar las voces seleccionadas, director primero
    voces.sort((a, b) => {
        if (a.director) {
            return -1
        }
        if (b.director) {
            return 1
        }
        return 0
    })

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

.director {
    font-weight: bold;
    color: rgb(182, 156, 39);
}

.boton-eliminar {
    cursor: pointer;
    color: red;
    margin-left: 0.5rem;
}

.boton-director {
    cursor: pointer;
    margin-right: 0.5rem;
}

.boton-director svg {
    width: 20px;
    height: 20px;
    fill: rgb(97, 96, 96);
    margin-right: 0.5rem;
    margin-bottom: 0.2rem;
}

.director svg {
    fill: rgb(182, 156, 39);
}

.btn-close {
    border: 1px solid black;
    border-radius: 5px;
    padding: 0.5rem;
    margin-left: 10px;
    background-color: gray;
}
</style>