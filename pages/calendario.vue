<template>
    <div>
        <div class="container">
            <div class="row text-center justify-content-center mt-2">
                <div class="col">
                    <button class="btn btn-primary" @click="subirUnMes">Anterior</button>
                </div>
                <div class="col">
                    <h4>{{ meses[mes] }} {{ anio }}</h4>
                </div>
                <div class="col">
                    <button class="btn btn-primary" @click="bajarUnMes">Siguiente</button>
                </div>
            </div>
            <!-- <div class="row">
                <div class="col-md-12">
                    <h4>Calendario</h4>
                </div>
            </div> -->
            <div class="row">
                <CalendarioComponent :mes="mes" :anio="anio" :eventos="eventos" :key="key" @addEvent="addEvent"
                    @actualizarEventos="getEventos" />
            </div>
        </div>

        <ModalNuevoEventoComponent v-if="modal" @cerrar="cerrarModal" :fecha="fechaNuevoEvento"
            @actualizarEventos=getEventos />
    </div>

</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useSupabase } from '~/composables/useSupabase';
const fecha = new Date()
var anio = ref(null)
var mes = ref(null)
var key = ref(0)

const { supabase } = useSupabase();
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const modal = ref(false)
const eventos = ref([])
const fechaNuevoEvento = ref(null)


const getEventos = () => {
    supabase.from('eventos').select('*').then(({ data, error }) => {
        if (error) {
            console.error('Error al obtener los eventos:', error.message)
        } else {
            eventos.value = data
        }
    })
}



anio.value = fecha.getFullYear()
mes.value = fecha.getMonth()

const subirUnMes = () => {
    mes.value--
    if (mes.value < 0) {
        mes.value = 11
        anio.value--
    }
}

const bajarUnMes = () => {
    mes.value++
    if (mes.value > 11) {
        mes.value = 0
        anio.value++
    }
}

const addEvent = (ev) => {
    fechaNuevoEvento.value = ev
    console.log('Evento agregado', ev)
    modal.value = true
}

const cerrarModal = () => {
    modal.value = false
}

onMounted(() => {
    getEventos()
})

watch([mes, anio, eventos], () => {
    key.value++
})


</script>