<template>
    <div class="container">
        <div class="row text-center mt-2">
            <div class="col">
                <h1>Grupos</h1>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <select class="form-select" aria-label="Default select example" @change="getUsuariosDelGrupo"
                    v-model="selectedReunion">
                    <option selected>Seleccione reunión</option>
                    <option v-for="r in reuniones" :key="r.id" :value="r.id">{{ r.nombre }}</option>
                </select>
            </div>
            <div class="col">
                <select class="form-select" aria-label="Default select example" v-model="selectedUser">
                    <option selected value="-1">Selecciona un usuario</option>
                    <option v-for="u in usuarios" :key="u.id" :value="u.id">{{ u.raw_user_meta_data.name }} -
                        {{ u.email }}
                    </option>
                </select>
            </div>
            <div class="col-1">
                <button class="btn btn-primary" @click="addUserToGroup">Agregar</button>
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
                        <tr v-for="u in usuariosReunion" :key="u.id">
                            <!-- <td>{{ u.raw_user_meta_data.name }}</td> -->
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
const usuariosReunion = ref([])
const reuniones = ref([])
const selectedUser = ref("-1")
const selectedReunion = ref("-1")
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

const getUsuariosDelGrupo = async () => {
    if (selectedReunion.value == "-1") {
        return;
    }
    //obtener los usuarios del grupo tabla usuarios_reunion 
    const { data, error } = await supabase.rpc('obtener_datos_reunion', { reunion_id_param: 1 })
    if (error) {
        console.error('Error:', error.message)
    } else {
        usuariosReunion.value = data
        console.log(usuariosReunion.value)

    }
}

const addUserToGroup = () => {
    let user = usuarios.value.find(u => u.id == selectedUser.value)
    if (usuariosReunion.value.find(u => u.user_id == user.id)) {
        console.log('El usuario ya está en el grupo')
    } else {
        supabase.from('usuarios_reunion').insert([
            { user_id: user.id, reunion_id: selectedReunion.value }
        ]).then(() => {
            getUsuariosDelGrupo();
        }).catch((error) => {
            console.error('Error al guardar la asistencia:', error.message);
        });
    }
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
    getUsuariosDelGrupo();
})
</script>