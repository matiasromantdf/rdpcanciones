<template>
    <div class="contenedor-dia">
        <div @click="mostrarDia(fecha)" class="numero-dia">
            {{ fecha.getDate() }}
        </div>
        <div class="eventos" v-if="props.eventos.length > 0">
            <div v-for="evento in props.eventos" class="evento" @click="mostrarEvento(evento)">
                {{ evento.titulo }}
            </div>
        </div>
    </div>
</template>
<script setup>

import { defineProps } from 'vue'
import { defineEmits } from 'vue'


const props = defineProps({
    fecha: Date,
    eventos: Array
})
const mostrarDia = (fecha) => {
    console.log(fecha)
}

const emit = defineEmits(['mostrarEvento'])

const mostrarEvento = (evento) => {
    emit('mostrarEvento', evento)
}

</script>

<style scoped>
.contenedor-dia {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    height: 100%;

}

.eventos {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.eventos :hover {
    cursor: pointer;
}

.evento {
    background-color: #c778ff;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: fit-content;
    margin-left: 5px;
    margin-right: 5px;
    margin-top: 2px;
    margin-bottom: 2px;
    text-align: center;
    font-size: 12px;
    padding-left: 5px;
    padding-right: 5px;
}

.numero-dia {
    display: flex;
    width: 30px;
    height: 30px;
    font-size: 12px;
    margin-left: 2px;
    background-color: #f0f0f0;
    text-align: center;
    margin-top: 2px;
    align-items: center;
    justify-content: center;
}

.numero-dia:hover {
    cursor: pointer;
}
</style>
