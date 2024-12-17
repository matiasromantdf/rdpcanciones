<template>
    <div class="container">
        <div class="row text-center mt-2">
            <div class="col">
                <h1>Grupos</h1>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <select class="form-select" aria-label="Default select example">
                    <option selected>Seleccione reunión</option>
                    <option v-for="r in reuniones" :key="r.id">{{ r.nombre }}</option>
                </select>
            </div>
            <div class="col">
                <select class="form-select" aria-label="Default select example" @change="addUserToGroup"
                    v-model="selectedUser">
                    <option selected value="-1">Selecciona un usuario</option>
                    <option v-for="u in usuarios" :key="u.id" :value="u.id">{{ u.raw_user_meta_data.name }} -
                        {{ u.email }}
                    </option>
                </select>
            </div>

        </div>
        <div class="row">
            <div class="col">
                <h2>Usuarios en el grupo</h2>
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Nombre</th>
                            <th scope="col">Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="u in grupo" :key="u.id">
                            <td>{{ u.raw_user_meta_data.name }}</td>
                            <td>{{ u.email }}</td>
                        </tr>
                    </tbody>
                </table>

            </div>
        </div>
    </div>

</template>
<script setup>
import { useSupabase } from '~/composables/useSupabase';

const usuarios = ref([])
const grupo = ref([])
const reuniones = ref([])
const selectedUser = ref("-1")
const { supabase } = useSupabase();

const getUsuarios = async () => {
    //obtener los usuarios del esquema users
    const { data, error } = await supabase.from('users_view').select('id, email, raw_user_meta_data')
    if (error) {
        console.error('Error al obtener las voces:', error.message)
    } else {
        usuarios.value = data

    }

}

const addUserToGroup = () => {
    let user = usuarios.value.find(u => u.id == selectedUser.value)
    grupo.value.push(user)
    usuarios.value = usuarios.value.filter(u => u.id != selectedUser.value)
    selectedUser.value = "-1"
}

const getReuniones = async () => {
    //obtener las reuniones
    const { data, error } = await supabase.from('reuniones').select('*')
    if (error) {
        console.error('Error al obtener las reuniones:', error.message)
    } else {
        reuniones.value = data

    }
}


onMounted(() => {
    getUsuarios();
    getReuniones();
})
</script>