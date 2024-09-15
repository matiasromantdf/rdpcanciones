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
                    <div class="mb-3">
                        <label for="letra" class="form-label">Letra</label>
                        <textarea class="form-control" id="letra" rows="3"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" :disabled="cargando">Guardar</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
const supabase = useSupabaseClient()
let cargando = false

const handleSend = async () => {
    cargando = true
    const titulo = document.getElementById('titulo').value
    const autor = document.getElementById('autor').value
    const letra = document.getElementById('letra').value

    const { data, error } = await supabase.from('canciones').insert([
        { titulo, autor, letra }
    ])

    if (error) {
        console.error(error)
        alert('Ocurrió un error al guardar la canción')
        this.cargando = false
    } else {
        alert('Canción guardada')
        document.getElementById('titulo').value = ''
        document.getElementById('autor').value = ''
        document.getElementById('letra').value = ''
        this.cargando = false
    }

}

</script>



<style></style>