<template>
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <h1 class="text-center">Nueva Canción</h1>
            </div>
        </div>
        <div class="row">
            <!-- formulario para cargar en supabase titulo, autor y letra-->
            <div class="col-md-6 offset-md-3">
                <form @submit.prevent="handleSend()">
                    <div class="mb-3">
                        <label for="titulo" class="form-label">Título</label>
                        <input type="text" class="form-control" id="titulo" aria-describedby="tituloHelp">
                        <div id="tituloHelp" class="form-text">Ingresa el título de la canción</div>
                    </div>
                    <div class="mb-3">
                        <label for="autor" class="form-label">Autor</label>
                        <input type="text" class="form-control" id="autor" aria-describedby="autorHelp">
                        <div id="autorHelp" class="form-text">Ingresa el autor de la canción</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col">
                            <label for="tono" class="form-label">Tono</label>
                            <select class="form-select" id="tono" v-model="tono">
                                <option v-for="nota in notas" :key="nota.numero" :value="nota.numero">{{ nota.nota }}
                                </option>
                            </select>
                        </div>
                        <div class="col">
                            <label for="mod" class="form-label">Modificador</label>
                            <select class="form-select" id="mod" v-model="mod">
                                <option v-for="mod in modificadores" :key="mod.id" :value="mod.modificador">{{
                                    mod.modificador }}
                                </option>

                            </select>
                        </div>

                    </div>
                    <div class="mb-3">
                        <label for="letra" class="form-label">Letra</label>
                        <textarea class="form-control" id="letra" rows="3"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" :disabled="cargando" id="btn-enviar">Guardar</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
const supabase = useSupabaseClient()
let cargando = ref(false)
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
const modificadores = ref([])
const modificador = ref('')
const tono = ref('')
const mod = ref('')


const handleSend = async () => {
    cargando = true
    document.getElementById('btn-enviar').innerText = 'Guardando...'
    const titulo = document.getElementById('titulo').value
    const autor = document.getElementById('autor').value
    const letra = document.getElementById('letra').value
    let tono = document.getElementById('tono').value
    const modificador = document.getElementById('mod').value



    const { data, error } = await supabase.from('canciones').insert([
        { titulo, autor, letra, numero_tono: tono, modificador: modificador }
    ])

    if (error) {
        console.error(error)
        alert('Ocurrió un error al guardar la canción')
    } else {
        alert('Canción guardada')
        document.getElementById('titulo').value = ''
        document.getElementById('autor').value = ''
        document.getElementById('letra').value = ''
    }
    cargando = false
    document.getElementById('btn-enviar').innerText = 'Guardar'

}

const getModificadores = async () => {
    const { data, error } = await supabase.from('modificadores').select('*')
    if (error) {
        console.error(error)
    } else {
        modificadores.value = data
        //insertar en el array un valor vacio
        modificadores.value.unshift({ modificador: '' })
    }
}

onMounted(() => {
    getModificadores()
})

</script>



<style></style>