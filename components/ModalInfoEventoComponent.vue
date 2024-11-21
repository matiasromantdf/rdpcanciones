<template>
    <div class="fondo">
    </div>
    <div class="modal-evento">
        <div class="modal-header">
            <h5 class="modal-title">{{ traducirFecha(props.evento.fecha) }}</h5>
            <button type="button" class="btn-close" @click="cerrarModal"></button>
        </div>
        <div class="modal-body">
            <p>{{ props.evento.descripcion }}</p>
            <ul>
                <li v-for="integrante in props.evento.integrantes" :class="integrante.director ? 'director' : ''">
                    {{ integrante.nombre }}
                </li>
            </ul>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-danger" @click="eliminarEvento" v-if="puedeEliminar">Eliminar</button>
        </div>
    </div>
</template>

<script setup>

import { useSupabase } from '~/composables/useSupabase';
import { defineEmits } from 'vue';
import { defineProps } from 'vue';



const props = defineProps({
    evento: Object
})
const { supabase, hasRole } = useSupabase();
const emit = defineEmits(['cerrar', 'actualizar'])

const cerrarModal = () => {
    emit('cerrar')
}

const puedeEliminar = await hasRole('admin_voces')

const traducirFecha = (fecha) => {
    let fechaDate = new Date(fecha)
    //sumar 3 horas para que se muestre la fecha correcta
    fechaDate.setHours(fechaDate.getHours() + 3)
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return fechaDate.toLocaleDateString('es-ES', options)
}



const eliminarEvento = () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este evento?')) {
        return
    }
    supabase.from('eventos').delete().eq('id', props.evento.id).then(({ data, error }) => {
        if (error) {
            console.error('Error al eliminar el evento:', error.message)
        } else {
            emit('actualizar')
            console.log('Evento eliminado:', data)
            emit('cerrar')
        }
    })
}



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
    width: auto;
    min-width: 300px;
    margin-left: 10px;
    margin-right: 10px;

}

.btn-close {
    border: 1px solid black;
    border-radius: 5px;
    padding: 0.5rem;
    margin-left: 10px;
    background-color: gray;
}

.director {
    font-weight: bold;
}

.director:hover {
    cursor: pointer;
}

.director:after {
    content: '(Director)';
    margin-left: 5px;
}
</style>