<template>
    <div class="loguearse" v-if="!puedeEditar">
        <h1 class="text-center">Sin autorización</h1>
    </div>
    <div class="container" v-else>
        <div class="row">
            <div class="col-md-12">
                <h1 class="text-center">Editar Canción</h1>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 offset-md-3">
                <form @submit.prevent="handleUpdate()">
                    <div class="mb-3">
                        <label for="titulo" class="form-label">Título</label>
                        <input type="text" class="form-control" id="titulo" aria-describedby="tituloHelp"
                            v-model="cancion.titulo">
                        <div id="tituloHelp" class="form-text">Ingresa el título de la canción</div>
                    </div>
                    <div class="mb-3">
                        <label for="autor" class="form-label">Autor</label>
                        <input type="text" class="form-control" id="autor" aria-describedby="autorHelp"
                            v-model="cancion.autor">
                        <div id="autorHelp" class="form-text">Ingresa el autor de la canción</div>
                    </div>
                    <div class="mb-3">
                        <label for="link" class="form-label">Link</label>
                        <input type="text" class="form-control" id="link" aria-describedby="autorHelp"
                            v-model="cancion.link">
                        <div id="autorHelp" class="form-text">Ingresa un link</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col">
                            <label for="tono" class="form-label">Tono</label>
                            <select class="form-select" id="tono" v-model="cancion.numero_tono">
                                <option v-for="nota in notas" :key="nota.numero" :value="nota.numero">{{ nota.nota }}
                                </option>
                            </select>
                        </div>
                        <div class="col">
                            <label for="mod" class="form-label">Modificador</label>
                            <select class="form-select" id="mod" v-model="cancion.modificador">
                                <option v-for="mod in modificadores" :key="mod.id" :value="mod.modificador">
                                    {{ mod.modificador }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="row mb-3 align-items-center">
                        <div class="col-6">
                            <label for="tipo" class="form-label">Tipo</label>
                            <select class="form-select" v-model="cancion.tipo" id="tipo">
                                <option value="1">Adoración</option>
                                <option value="2">Alabanza</option>
                            </select>
                        </div>
                        <div class="col-6">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="es_adaptacion"
                                    v-model="cancion.es_adaptacion">
                                <label class="form-check-label" for="es_adaptacion">Es adaptación</label>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <label for="pista">Pista</label>
                            <SubirCancion @archivo-cargado="setUrl" :id="router.params.id" />
                        </div>

                    </div>
                    <div class="row" v-if="cancion.pista_url">
                        <div class="col">
                            <label for="pista_url">URL Pista</label>
                            <input type="text" class="form-control" id="pista_url" aria-describedby="pista_urlHelp"
                                v-model="cancion.pista_url" readonly>
                            <div id="pista_urlHelp" class="form-text">Ingresa la URL de la pista</div>
                        </div>
                        <div class="col-4 mt-4" v-if="!analizandoCancion">
                            <button class="btn btn-info" @click="analizarCancion" type="button" id="btn-analizar-url">
                                <i class="bi bi-mic"></i>
                                ver tono
                            </button>
                        </div>
                        <div class="col-4 mt-4" v-else>
                            <button class="btn btn-info w-75" type="button" disabled>
                                <div class="spinner-border ml-auto mt-1" role="status" aria-hidden="true"
                                    style="width: 1rem; height: 1rem;"></div>
                            </button>
                        </div>
                    </div>
                    <div class="row" v-if="cancion.pista_url">
                        <div class="col">
                            <label for="tonoPista">Tono pista</label>
                            <select class="form-select" id="tonoPista" v-model="cancion.pista_tono">
                                <option value="0">Seleccionar...</option>
                                <option v-for="nota in notas" :key="nota.numero" :value="nota.numero">{{ nota.nota }}
                                </option>
                            </select>
                        </div>
                        <div class="col">
                            <label for="pista_tono_esmenor">Modo:</label>
                            <select class="form-select" id="pista_tono_esmenor" v-model="cancion.pista_tono_esmenor">
                                <option value="false">Mayor</option>
                                <option value="true">Menor</option>
                            </select>
                        </div>
                    </div>
                    <div class="mb-3 mt-2">
                        <label for="letra" class="form-label">Letra</label>
                        <textarea class="form-control" id="letra" rows="20" v-model="cancion.letra"></textarea>
                    </div>
                    <div class="row mt-3 mb-4 d-flex justify-content-center">
                        <div class="col-4">
                            <button type="submit" class="btn btn-primary mb-3 w-100" :disabled="cargando"
                                id="btn-enviar">Actualizar</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useSupabase } from '../../composables/useSupabase'
    import { useRoute } from 'vue-router'
    import { useRouter } from 'vue-router'
    import Swal from 'sweetalert2'
    import SubirCancion from '~/components/SubirCancion.vue'

    const { supabase } = useSupabase()
    const router = useRoute()
    const routers = useRouter()

    const cargando = ref(false)
    const cancion = ref({
        titulo: '',
        autor: '',
        tono: 1,
        mod: 1,
        tipo: 1,
        es_adaptacion: false,
        letra: '',
        id: 0,
        numero_tono: 1,
        modificador: '',
        link: '',
        tonoPista: '',
        pista_url: '',
        pista_tono: '0',
        pista_tono_esmenor: false
    })
    const analizandoCancion = ref(false)
    const notas = [
        { nota: 'Do', numero: 1 },
        { nota: 'Do#', numero: 2 },
        { nota: 'Re', numero: 3 },
        { nota: 'Re#', numero: 4 },
        { nota: 'Mi', numero: 5 },
        { nota: 'Fa', numero: 6 },
        { nota: 'Fa#', numero: 7 },
        { nota: 'Sol', numero: 8 },
        { nota: 'Sol#', numero: 9 },
        { nota: 'La', numero: 10 },
        { nota: 'La#', numero: 11 },
        { nota: 'Si', numero: 12 }
    ]

    const puedeEditar = ref(true)
    const modificadores = ref([])

    const getCancion = async () => {
        cargando.value = true
        const id = router.params.id
        const { data, error } = await supabase.from('canciones').select('*').eq('id', id)
        if (error) {
            console.error(error)
        } else {
            cancion.value = data[0]
        }
        cargando.value = false
    }

    const getModificadores = async () => {
        const { data, error } = await supabase.from('modificadores').select('*')
        if (error) {
            console.error(error)
        } else {
            modificadores.value = data
            modificadores.value.unshift({ id: 0, modificador: '' })
        }
    }

    const setUrl = (url) => {
        cancion.value.pista_url = url
    }
    const analizarCancion = async () => {

        analizandoCancion.value = true

        let baseUrl = "https://detect-key-service.onrender.com/detect-key?url="
        let url = baseUrl + encodeURIComponent(cancion.value.pista_url)
        const response = await fetch(url)
        const data = await response.json()
        analizandoCancion.value = false
        if (data.escala == 'major') {
            data.escala = 'Mayor'
        }
        else {
            data.escala = 'Menor'
        }

        Swal.fire({
            title: 'Análisis de tono',
            text: `El tono de la pista es: ${data.tono}` + ` escala: ${data.escala}`,
            icon: 'info'
        })
    }

    const handleUpdate = async () => {
        cargando.value = true
        document.getElementById('btn-enviar').innerText = 'Actualizando...'
        const { titulo, autor, letra, numero_tono, modificador, es_adaptacion, tipo, link, pista_url, pista_tono, pista_tono_esmenor } = cancion.value
        const id = router.params.id
        const { data, error } = await supabase.from('canciones').update({
            titulo, autor, letra, numero_tono, modificador, es_adaptacion, tipo, link, pista_url, pista_tono, pista_tono_esmenor
        }).eq('id', id)
        if (error) {
            console.error(error)
            alert('Ocurrió un error al actualizar la canción')
        } else {
            alert('Canción actualizada')
            console.log(cancion.value)
        }
        cargando.value = false
        document.getElementById('btn-enviar').innerText = 'Actualizar'
        routers.push('/canciones')
    }





    onMounted(() => {
        getCancion()
        getModificadores()
    })
</script>
