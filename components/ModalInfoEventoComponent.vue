<template>
    <div class="fondo">
    </div>
    <div class="modal-evento">
        <div class="modal-header">
            <h5 class="modal-title">{{ props.evento.titulo }}</h5>
            <button type="button" class="btn-close" @click="cerrarModal"></button>
        </div>
        <div class="modal-body">
            <p>{{ props.evento.descripcion }}</p>
            <ul>
                <li v-for="participante in props.evento.participantes">{{ participante.name }}</li>
            </ul>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="cerrarModal">Cerrar</button>
        </div>
    </div>
</template>

<script setup>

import { ref } from 'vue'
import { defineEmits } from 'vue';
import { defineProps } from 'vue';

const props = defineProps({
    evento: Object
})

console.log(props.evento)

const emit = defineEmits(['cerrar'])

const cerrarModal = () => {
    emit('cerrar')
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
</style>