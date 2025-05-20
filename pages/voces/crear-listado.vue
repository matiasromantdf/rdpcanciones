<template>
    <div class="container">
        <div class="row">
            <div class="col">
                <h1>Crear listado por tono</h1>
            </div>
        </div>
        <div class="row mb-4 d-flex  align-items-center">
            <div class="col-md-4 col-sm-12">
                <label for="voces" class="label"> seleccionar voces</label>
                <select name="voces" id="voces" class="form-control" v-model="vozSeleccionada" @change="aniadirVoz()">
                    <option value="-1">Seleccionar voz</option>
                    <option v-for="voz in voces" :value="voz.id">{{ voz.nombre }}</option>
                </select>
            </div>
            <div class="col-md-4 col-sm-12">
            </div>
        </div>
        <div class="row">
            <voz-seleccionada-component v-for="voz in vocesSeleccionadas" :voz="voz" @eliminar="eliminarVoz" />
        </div>
        <div class="row mb-4">
            <div class="col-4 col-md-4">
                <label for="tonos" class="label">Tono</label>
                <select name="tonos" id="tonos" class="form-control" v-model="tonoSeleccionado">
                    <option v-for="tono in tonos" :value="tono.numero">{{ tono.valor }}</option>
                </select>
            </div>
            <div class="col-4 col-md-4">
                <label for="tonoEsMenor" class="label">Modo</label>
                <select name="tonoEsMenor" id="tonoEsMenor" class="form-control" v-model="tonoEsMenor">
                    <option value="0">Mayor</option>
                    <option value="1">Menor</option>
                </select>
            </div>
            <div class="col-4 col-md-4">
                <label for="tonoEsMenor" class="label">Tipo</label>
                <select name="tonoEsMenor" id="tonoEsMenor" class="form-control" v-model="tipoCancion">
                    <option value="1">Adoración</option>
                    <option value="2">Alabanza</option>
                </select>
            </div>


        </div>
        <div class="tabla">
            <tabla-canciones-voces-component v-for="voz in vocesSeleccionadas" :voz="voz" :tono="tonoSeleccionado"
                v-if="tonoSeleccionado != null" :modo="tonoEsMenor" :tipo="tipoCancion" />

        </div>
    </div>
</template>
<script setup>
    import { useSupabase } from '~/composables/useSupabase';
    import { onMounted } from 'vue';


    const { usuario, hasRole, supabase } = useSupabase();
    const vozSeleccionada = ref(-1)

    const voces = ref([])
    const vocesSeleccionadas = ref([])
    const tonos = [
        { numero: 1, valor: 'Do' },
        { numero: 2, valor: 'Do#' },
        { numero: 3, valor: 'Re' },
        { numero: 4, valor: 'Re#' },
        { numero: 5, valor: 'Mi' },
        { numero: 6, valor: 'Fa' },
        { numero: 7, valor: 'Fa#' },
        { numero: 8, valor: 'Sol' },
        { numero: 9, valor: 'Sol#' },
        { numero: 10, valor: 'La' },
        { numero: 11, valor: 'La#' },
        { numero: 12, valor: 'Si' }
    ]
    const tonoEsMenor = ref(0)
    const tonoSeleccionado = ref(null)
    const casaUsuario = ref(null)
    const tipoCancion = ref(1)

    const getVoces = async () => {
        const { data, error } = await supabase.from('voces_users_view').select('*').eq('casa_id', casaUsuario.value).order('nombre', { ascending: true })
        if (error) {
            console.error('Error al obtener las voces:', error.message)
        } else {
            voces.value = data

        }
    }
    const getCasaUsuario = async () => {
        const { data, error } = await supabase.from('usuarios').select('casa_id').eq('id', usuario.value.id).single()
        if (error) {
            console.error('Error al obtener la casa del usuario:', error.message)
        } else {
            casaUsuario.value = data.casa_id
        }
    }

    const aniadirVoz = () => {
        const voz = voces.value.find(v => v.id === vozSeleccionada.value)
        if (voz) {
            vocesSeleccionadas.value.push(voz)
        }
    }

    const eliminarVoz = (voz) => {
        console.log('Eliminar voz:', voz)
        vocesSeleccionadas.value = vocesSeleccionadas.value.filter(v => v.id !== voz)
    }

    onMounted(async () => {
        if (!hasRole('admin_voces')) {
            router.push('/')
        }
        await getCasaUsuario();
        await getVoces();
    })

</script>

<style scoped>
    .tabla {
        display: flex;
        overflow-x: scroll;
        margin-top: 20px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-bottom: 20px;
    }

    .tabla::-webkit-scrollbar {
        height: 10px;
    }

    .tabla::-webkit-scrollbar-thumb {
        background-color: #ccc;
        border-radius: 5px;
    }

    .label {
        font-weight: bold;
        margin-bottom: 5px;
    }
</style>