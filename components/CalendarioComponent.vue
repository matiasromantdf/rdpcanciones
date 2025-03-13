<template>
    <div class="container  py-2 mb-3">

        <div class="calendario">
            <div class="nombre-dias">
                <div class="nombre-dia">Lunes</div>
                <div class="nombre-dia">Martes</div>
                <div class="nombre-dia">Miércoles</div>
                <div class="nombre-dia">Jueves</div>
                <div class="nombre-dia">Viernes</div>
                <div class="nombre-dia">Sábado</div>
                <div class="nombre-dia">Domingo</div>
            </div>
            <div class="semanas" v-for="i in 6">
                <div class="dias" v-for="j in 7">
                    <div class="dia">
                        <DiaEnCalendarioComponent :fecha="showDates()[i - 1][j - 1]"
                            :eventos="getEventosDia(showDates()[i - 1][j - 1])" @mostrarEvento="mostrarEvento"
                            @click="addEvent(showDates()[i - 1][j - 1])" />
                    </div>
                </div>

            </div>

        </div>

    </div>
    <ModalInfoEventoComponent v-if="showModalEventos" @cerrar="showModalEventos = false" :evento="eventoParaModal"
        @actualizar="actualizarEventos" />

</template>
<script setup>
import { useSupabase } from '~/composables/useSupabase';
const eventoParaModal = ref({})

const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const { hasRole } = useSupabase();

const props = defineProps({
    mes: Number,
    anio: Number,
    eventos: Array,
})
//convertir las prop a ref
const mes = ref(props.mes)
const anio = ref(props.anio)
const eventos = ref(props.eventos)

const showDates = () => {
    const firstDay = new Date(anio.value, mes.value, 1)
    const lastDay = new Date(anio.value, mes.value + 1, 0)
    let dayOfWeek = firstDay.getDay()

    // Convertir el domingo (0) en el último día de la semana (6)
    if (dayOfWeek === 0) {
        dayOfWeek = 6
    } else {
        dayOfWeek--
    }
    // Inicializar la matriz de 5 filas y 7 columnas
    let daysToShow = Array.from({ length: 6 }, () => Array(7).fill('0'))

    let currentDay = 1;
    let diasPostMes = 1
    let diasAntes = new Date(anio.value, mes.value, 0).getDate()




    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < (dayOfWeek)) {
                // Espacio en blanco para días antes del primer día del mes
                daysToShow[i][j] = new Date(anio.value, mes.value - 1, diasAntes - (dayOfWeek - 1))
                diasAntes++
            } else if (currentDay <= lastDay.getDate()) {
                // Insertar día del mes
                daysToShow[i][j] = new Date(anio.value, mes.value, currentDay)
                currentDay++
            } else {
                // Espacio en blanco para días después del último día del mes
                daysToShow[i][j] = new Date(anio.value, mes.value + 1, diasPostMes)
                diasPostMes++
            }
        }
    }

    // console.log(daysToShow)
    return daysToShow
}

const getEventosDia = (fecha) => {
    //covertir fecha a 'yyyy-mm-dd'
    fecha = fecha.toISOString().split('T')[0]
    let eventosDia = []
    eventos.value.forEach(evento => {
        if (evento.fecha === fecha) {
            eventosDia.push(evento)
        }
        // evento.fecha = new Date(evento.fecha)
        // if (evento.fecha.getDate() === fecha.getDate() && evento.fecha.getMonth() === fecha.getMonth() && evento.fecha.getFullYear() === fecha.getFullYear()) {
        //     for (let i = 0; i < evento.participantes.length; i++) {
        //         if (evento.participantes[i].email === usuario.value.email) {
        //             eventosDia.push(evento)
        //         }
        //     }
        // }
    })
    return eventosDia

}
const puedeCrearEvento = async () => {
    return await hasRole('admin_voces')
}

const showModalEventos = ref(false)
const mostrarEvento = (evento) => {
    eventoParaModal.value = evento
    showModalEventos.value = true
}

const actualizarEventos = () => {
    console.log('Actualizando eventos');
    emit('actualizarEventos')
}
const addEvent = async (date) => {
    if (puedeCrearEvento) {
        emit('addEvent', date)
    }

}

const emit = defineEmits(['addEvent', 'actualizarEventos'])


</script>
<style>
/** al imprimir ocultar las scrollbar */
@media print {
    body {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    body::-webkit-scrollbar {
        display: none;
    }
}

.calendario {
    display: flex;
    flex-wrap: wrap;
    min-height: 600px;
    overflow-x: scroll;
}

.nombre-dias {
    display: flex;
    flex-wrap: nowrap;
    min-height: 50px;
    min-width: 600px;
    width: 100%;
    justify-content: space-around;
}

.nombre-dia {
    min-width: 100px;
    height: 100%;
    align-items: center;
    justify-content: center;
    display: flex;
}


.semanas {
    display: flex;
    flex-wrap: nowrap;
    min-height: 50px;
    min-width: 600px;
    width: 100%;
    justify-content: space-around;
    align-items: center;
}

.dias {
    min-height: 80px;
    min-width: 80px;
    height: 100%;
    width: 100%;
    border: 1px solid #ccc;
}

.dia {
    width: fit-content;
    height: 100%;
    width: 100%;
}
</style>