<template>
    <div class="container  py-2 mb-3">
        <div class="row text-center justify-content-center">
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
        <div class="row" v-if="usuarioEsAdmin">
            sdd
        </div>
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
                            :eventos="getEventosDia(showDates()[i - 1][j - 1])" @mostrarEvento="mostrarEvento" />
                    </div>
                </div>

            </div>

        </div>

    </div>
    <ModalInfoEventoComponent v-if="showModalEventos" @cerrar="showModalEventos = false" :evento="eventoParaModal" />

</template>
<script setup>
import { useSupabase } from '../composables/useSupabase';

const { hasRole, usuario, roles, signOut } = useSupabase()


console.log(usuario.value.email)

const usuarioEsAdmin = hasRole('admin_voces')


const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const eventoParaModal = ref({})


const fecha = new Date()
var anio = ref(null)
var mes = ref(null)
var firstDayOfSeries = ref(null)
var lastDayOfSeries = ref(null)

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

const eventos = ref([])

const getEventos = async () => {
    let eventoMuestra = {
        fecha: new Date('2024-11-01 00:00:00'),
        titulo: 'Culto con el Pastor',
        descripcion: 'Este es un evento de muestra',
        participantes: [{
            email: 'mroman.tdf@gmail.com',
            name: 'Matias Roman'
        },
        {
            email: 'ana@gmail.com',
            name: 'Ana'
        }
        ]
    }
    eventos.value.push(eventoMuestra)

    let eventoMuestra2 = {
        fecha: new Date('2024-11-01 00:00:00'),
        titulo: 'Culto con la Pastora',
        descripcion: 'Este es un evento de muestra',
        participantes: [{
            email: 'jose@gmail.com',
            name: 'Jose'
        }, {
            email: 'mario@gmail.com',
            name: 'Mario'
        }
        ]
    }
    eventos.value.push(eventoMuestra2)
}

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

const eventosDia = ref([])
const getEventosDia = (fecha) => {
    let eventosDia = []
    eventos.value.forEach(evento => {
        if (evento.fecha.getDate() === fecha.getDate() && evento.fecha.getMonth() === fecha.getMonth() && evento.fecha.getFullYear() === fecha.getFullYear()) {
            for (let i = 0; i < evento.participantes.length; i++) {
                if (evento.participantes[i].email === usuario.value.email) {
                    eventosDia.push(evento)
                }
            }
        }
    })
    return eventosDia

}
const showModalEventos = ref(false)
const mostrarEvento = (evento) => {
    eventoParaModal.value = evento
    showModalEventos.value = true
}


onMounted(() => {
    getEventos()
})

//al cambiar el mes, se actualizan los eventos
watch([mes, anio], () => {
    eventos.value = []
    getEventos()
})





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
    min-width: 100px;
    height: 100%;
    width: 100%;
    border: 1px solid #ccc;
}

.dia {
    width: fit-content;
    height: 100%;
}
</style>