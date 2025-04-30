<template>
    <div class="container">
        <div class="row text-center">
            <div class="col">
                <h1>Mi repertorio</h1>
            </div>
        </div>
        <div class="row mb-3 mt-4 justify-content-center align-items-center border p-2 m-2">
            <!--menu para filtrar canciones por tono-->
            <div class="col-5">
                <label for="tono" class="form-label">Filtrar por tono</label>
            </div>
            <div class="col-6">
                <select class="form-select" v-model="tono" @change="filtrarPorTono">
                    <option value="">Todos</option>
                    <option v-for="(tono, index) in tonos" :key="index" :value="index + 1">{{ tono }}</option>
                </select>
            </div>
            <div class="col-6">
            </div>
        </div>
        <div class="row" v-if="cargando">
            <div class="col-12 text-center">
                <h1>Cargando...</h1>
            </div>
        </div>

        <div class="row mt-4 p-2 " v-else>
            <div class="col-12 card-cancion" v-for="cancion in repertorio">
                <div class="row">
                    <div class="col-10">
                        <h4 @click="router.push('/ver-cancion/' + cancion.canciones.id)"
                            style="text-decoration: underline;">
                            {{ cancion.canciones.titulo }}
                        </h4>
                        <p> tono: {{ convertirNumeroEnTono(cancion.tono_numero) }}</p>
                    </div>
                    <div class="col">
                        <button @click="eliminarCancion(cancion.id)" class="btn btn-sm"
                            style="float: right; color: red;">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="repertorio.length == 0 && !cargando" class="row mt-4 p-2">
            <div class="col-12 text-center">
                <h1>No tienes canciones en tu repertorio</h1>
            </div>

        </div>
    </div>
</template>

<script setup>
    import { useSupabase } from '~/composables/useSupabase';
    import { onMounted } from 'vue';
    import { useRouter } from 'vue-router'
    const { usuario, roles, hasRole, supabase } = useSupabase();
    import Swal from 'sweetalert2';



    const tonos = [
        'C',
        'C#',
        'D',
        'D#',
        'E',
        'F',
        'F#',
        'G',
        'G#',
        'A',
        'A#',
        'B',
    ]
    const cargando = ref(true)

    const tono = ref('')
    const filtrarPorTono = async () => {
        if (tono.value) {
            cargando.value = true
            await getRepertorio()
            repertorio.value = repertorio.value.filter(cancion => cancion.tono_numero == tono.value)
            cargando.value = false
        } else {
            getRepertorio()
        }
    }

    const esVoces = ref(false)
    const repertorio = ref([])
    const getRepertorio = async () => {
        const { data, error } = await supabase.from('repertorio_voces')
            .select('*, canciones(*)')
            .eq('user_id', usuario.value.id)
        if (error) {
            console.error('Error al obtener el repertorio:', error.message)
        } else {
            repertorio.value = data
        }
        cargando.value = false
    }

    const eliminarCancion = async (id) => {
        const { value: confirm } = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminará la canción de tu repertorio.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Sí, eliminarla!'
        })
        console.log("confirm", confirm);
        if (confirm) {
            cargando.value = true
            const { error } = await supabase
                .from('repertorio_voces')
                .delete()
                .eq('id', id);
            if (error) {
                console.error('Error al eliminar la canción:', error.message);
            } else {
                await getRepertorio();
            }
            cargando.value = false
        }

    }

    const convertirNumeroEnTono = (numero) => {
        return tonos[numero - 1]
    }

    const router = useRouter()

    onMounted(async () => {
        if (!hasRole('voces')) {
            router.push('/')
        }
        await getRepertorio()
    })

</script>
<style>
    .card-cancion {
        cursor: pointer;
        background-color: #f8f9fa;
        border-radius: 5px;
        padding: 10px;
        margin-bottom: 10px;
        transition: background-color 0.3s ease;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .border {
        border: 1px solid #a8acac !important
    }
</style>