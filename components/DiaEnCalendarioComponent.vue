<template>
    <div class="contenedor-dia">
        <div class="numero-dia">
            {{ fecha.getDate() }}
        </div>
        <div class="eventos" v-if="props.eventos.length > 0">
            <div v-for="evento in props.eventos" class="evento" @click.stop="mostrarEvento(evento)">
                {{ evento.titulo }}
                <span style="color: white;" v-if="esParticipante(evento)"><svg xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24">
                        <title>star</title>
                        <path
                            d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
                    </svg></span>
            </div>
        </div>
    </div>
</template>
<script setup>
import { useSupabase } from '~/composables/useSupabase';

import { defineProps } from 'vue'
import { defineEmits } from 'vue'

const { usuario, roles, hasRole, supabase } = useSupabase();
const props = defineProps({
    fecha: Date,
    eventos: Array
})

const emit = defineEmits(['mostrarEvento'])
const mostrarEvento = (evento) => {
    emit('mostrarEvento', evento)
}

const esParticipante = (evento) => {
    if (evento.integrantes) {
        for (let integrante of evento.integrantes) {
            if (integrante.id == usuario.value.id) {
                return true
            }
        }
    }
    return false
}


</script>

<style scoped>
.contenedor-dia {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: auto;
    height: 100%;

}

.eventos {
    margin-top: 2px;
    margin-left: 2px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    overflow: hidden;
}

.eventos :hover {
    cursor: pointer;
}

.evento {
    background-color: #d49efa;
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
    min-width: 30px;
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

svg {
    width: 20px;
    height: 20px;
    fill: rgb(255, 255, 251);

}
</style>
