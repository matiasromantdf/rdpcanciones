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
                <li v-for="integrante in props.evento.integrantes">{{ integrante.nombre }}</li>
            </ul>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-danger" @click="eliminarEvento">Eliminar</button>
        </div>
    </div>
</template>

<script setup>

import { useSupabase } from '~/composables/useSupabase';
import { ref } from 'vue'
import { defineEmits } from 'vue';
import { defineProps } from 'vue';

const props = defineProps({
    evento: Object
})
const { supabase } = useSupabase();

console.log(props.evento)

const emit = defineEmits(['cerrar', 'actualizar'])

const cerrarModal = () => {
    emit('cerrar')
}

const traducirFecha = (fecha) => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    const fechaDate = new Date(fecha)
    return `${dias[fechaDate.getDay()]} ${fechaDate.getDate()} de ${meses[fechaDate.getMonth()]} de ${fechaDate.getFullYear()}`
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
</style>