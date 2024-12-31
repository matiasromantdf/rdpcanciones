<template>
    <div class="container">
        <div class="row mt-2">
            <div class="col">
                <ul class="nav nav-tabs" id="myTab" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="grupos" data-bs-toggle="tab" data-bs-target="#home-tab-pane"
                            type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">Grupos</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="asistencia-tab" data-bs-toggle="tab"
                            data-bs-target="#asistencia-tab-pane" type="button" role="tab"
                            aria-controls="asistencia-tab-pane" aria-selected="false">Registro manual</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="asistencias-tab" data-bs-toggle="tab"
                            data-bs-target="#asistencias-tab-pane" type="button" role="tab"
                            aria-controls="contact-tab-pane" aria-selected="false">Asistencias</button>
                    </li>

                </ul>
            </div>
        </div>
        <div class="tab-content" id="myTabContent">
            <div class="tab-pane fade show active" id="home-tab-pane" role="tabpanel" aria-labelledby="grupos"
                tabindex="0">
                <div class="row mt-2">
                    <div class="col">
                        <select class="form-select" aria-label="Default select example" @change="getUsuariosDelGrupo"
                            v-model="selectedReunion">
                            <option selected value="-1">Seleccione reunión</option>
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
                                    <th scope="col">#</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="u in usuariosReunion" :key="u.id">
                                    <!-- <td>{{ u.raw_user_meta_data.name }}</td> -->
                                    <td>{{ u.usuarios.raw_user_meta_data.name }}</td>
                                    <td>{{ u.usuarios.raw_user_meta_data.email }}</td>
                                    <td><button class="btn btn-sm btn-danger"
                                            @click="eliminarDelGrupo(u.usuario_id)">Eliminar</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
            <div class="tab-pane fade" id="asistencia-tab-pane" role="tabpanel" aria-labelledby="asistencia-tab"
                tabindex="0">

                <div class="row mt-2">
                    <div class="col">
                        <h4>Registrar asistencia de usuario</h4>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <select class="form-select" aria-label="Default select example" @change="getUsuariosDelGrupo"
                            v-model="selectedReunion">
                            <option selected value="-1">Seleccione reunión</option>
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
                        <button class="btn btn-primary" @click="sendMark">Enviar</button>
                    </div>
                </div>
                <hr>
            </div>
            <div class="tab-pane fade" id="asistencias-tab-pane" role="tabpanel" aria-labelledby="asistencias-tab"
                tabindex="0">
                <div class="row">
                    <div class="col">
                        <h4>Asistencias</h4>
                    </div>
                </div>
                <div class="row">
                    <div class="col-6 col-md-4">
                        <label for="desde">Desde:</label>
                        <input type="date" id="desde" class="form-control">
                    </div>
                    <div class="col-6 col-md-4">
                        <label for="hasta">Hasta:</label>
                        <input type="date" id="hasta" class="form-control">
                    </div>
                    <div class="col-12 col-md-4">
                        <label for="reunion">Reunión:</label>
                        <select class="form-select" aria-label="Default select example" id="selectReunion">
                            <option selected value="-1">Seleccione reunión</option>
                            <option v-for="r in reuniones" :key="r.id" :value="r.id">{{ r.nombre }}</option>
                        </select>
                    </div>
                    <div class="col-1 col-sm-12 mt-4">
                        <button class="btn btn-primary" @click="getAsistencias">Buscar</button>
                    </div>
                </div>
                <div class="row mb-4">
                    <div class="contenedor-tabla">
                        <table class="tabla">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th v-for="a in diasDeReunionEntreFechas" :key="a">
                                        {{ a.getDate() }} /
                                        {{ a.getMonth() + 1 }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="usuario in usuariosReunionTablaPresentismo" :key="usuario.usuario_id">
                                    <td>{{ usuario.raw_user_meta_data.name }} - {{ getPorcentajeAsistencia(usuario) }}
                                    </td>
                                    <td v-for="dia in diasDeReunionEntreFechas" :key="dia">
                                        {{ usuarioAsistio(dia, usuario) }}

                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                </div>

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
const diasDeReunionEntreFechas = ref([])
const usuariosReunionTablaPresentismo = ref([])


const getUsuarios = async () => {
    //obtener los usuarios del esquema users
    const { data, error } = await supabase.from('usuarios')
        .select('id, email, raw_user_meta_data')
        .order('raw_user_meta_data->>name', { ascending: true })
    if (error) {
        console.error('Error al obtener las voces:', error.message)
    } else {
        usuarios.value = data
    }

}

const eliminarDelGrupo = (id) => {
    if (!confirm('¿Está seguro que desea eliminar del grupo?')) {
        return;
    }
    supabase.from('usuarios_reunion').delete().eq('usuario_id', id).eq('reunion_id', selectedReunion.value)
        .then(() => {
            getUsuariosDelGrupo();
        }).catch((error) => {
            console.error('Error al eliminar del grupo:', error.message);
        });

}

const getUsuariosDelGrupo = async () => {
    usuariosReunion.value = []
    if (selectedReunion.value == "-1") {
        return;
    }
    //obtener los usuarios del grupo tabla usuarios_reunion 
    const { data, error } = await supabase.from('usuarios_reunion').select('usuario_id, usuarios(raw_user_meta_data)').eq('reunion_id', selectedReunion.value)
    if (error) {
        console.error('Error al obtener los usuarios del grupo:', error.message)
    } else {
        usuariosReunion.value = data
    }
}

const addUserToGroup = () => {
    let user = usuarios.value.find(u => u.id == selectedUser.value)
    if (usuariosReunion.value.find(u => u.usuario_id == user.id)) {
        alert('El usuario ya está en el grupo')
        return;
    } else {
        supabase.from('usuarios_reunion').insert([
            { usuario_id: user.id, reunion_id: selectedReunion.value }
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

const sendMark = async () => {
    let usuario = selectedUser.value;
    let reunion = selectedReunion.value;
    if (usuario == "-1" || reunion == "-1") {
        alert('Seleccione un usuario y una reunión')
        return;
    }
    if (!navigator.geolocation) {
        console.error("La geolocalización no está soportada por tu navegador.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            console.log("Ubicación obtenida:", position);
            let lat = position.coords.latitude;
            let long = position.coords.longitude;
            let direccion = await getAddress(lat, long);
            let confirma = confirm('registrar en la direccion: ' + direccion)
            if (!confirma) {
                return;
            }
            let momento = new Date();
            const { data, error } = await supabase.from('asistencias').insert([
                { user_id: usuario, reunion, latitud: lat, longitud: long, momento, direccion }
            ]);
            if (error) {
                console.error('Error al guardar la asistencia:', error.message);
            } else {
                console.log('Asistencia guardada:', data);
            }

        },
        (error) => {
            console.error("Error al obtener la ubicación:", error);
        }
    );
}
const getAddress = async (lat, long) => {
    let apiKey = 'AIzaSyDeXGi3hIgV7fTbvoPs0Xk_MkAHtrs7ysY';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();
    console.log(data);

    if (data.status === 'OK') {
        return data.results[0].formatted_address;
    } else {
        return 'Ubicación no disponible';
    }

}
const getAsistencias = async () => {
    let desde = document.getElementById('desde').value;
    let hasta = document.getElementById('hasta').value;
    hasta = hasta + ' 23:59:59';
    let reunion = document.getElementById('selectReunion').value;
    if (desde == '' || hasta == '' || reunion == '-1') {
        alert('Seleccione las fechas y la reunión');
        return;
    }
    diasDeReunionEntreFechas.value = await getDiasReunidos(reunion);

    const { data, error } = await supabase.rpc('obtener_asistencias', {
        p_reunion_id: reunion,
        p_fecha_inicio: desde,
        p_fecha_fin: hasta
    });
    if (error) {
        console.error('Error al obtener las asistencias:', error.message)
    } else {
        console.log('Asistencias:', data)
        usuariosReunionTablaPresentismo.value = data;
    }

}

const getDiasReunidos = async (id_reunion) => {
    const { data, error } = await supabase.from('reuniones').select('dia').eq('id', id_reunion)
    if (error) {
        console.error('Error al obtener el dia de la reunión:', error.message)
    } else {
        let dia = data[0].dia;
        dia = pasarDiaANumero(dia);
        let fecha_inicio = document.getElementById('desde').value;
        let fecha_fin = document.getElementById('hasta').value;

        let fecha = new Date(fecha_inicio);
        let fecha2 = new Date(fecha_fin);
        let dias = [];

        while (fecha <= fecha2) {
            if (fecha.getDay() == dia) {
                //crear copia de la fecha
                let fecha_copia = new Date(fecha);
                dias.push(fecha_copia);

            }
            fecha.setDate(fecha.getDate() + 1);
        }
        return dias;
    }
}


const usuarioAsistio = (dia, usuario) => {
    usuario.asistencias = usuario.asistencias != null ? usuario.asistencias : [];
    let fecha = new Date(dia);
    let result = [];

    usuario.asistencias.forEach(asistencia => {
        if (asistencia && asistencia.momento) {
            let asistencia_fecha = new Date(asistencia.momento);
            if (fecha.getDate() === asistencia_fecha.getDate() && fecha.getMonth() === asistencia_fecha.getMonth()) {
                // Extraer la hora de momento
                let hora = asistencia_fecha.getHours();
                let minutos = asistencia_fecha.getMinutes();
                let text = hora + ':' + (minutos < 10 ? '0' : '') + minutos;
                result.push(text);
            }
        }
    });

    if (result.length > 0) {
        // Incrementar cantidadDeAsistencias si aún no se ha contado esta fecha
        if (!usuario.asistenciasContadas) {
            usuario.asistenciasContadas = new Set(); // Usar un Set para registrar fechas contadas
        }
        const fechaClave = `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}`;
        if (!usuario.asistenciasContadas.has(fechaClave)) {
            usuario.cantidadDeAsistencias = (usuario.cantidadDeAsistencias || 0) + 1;
            usuario.asistenciasContadas.add(fechaClave); // Marcar esta fecha como contada
        }
        return result.join(' - ');
    } else {
        return '';
    }
};

const getPorcentajeAsistencia = (usuario) => {
    if (!usuario.asistencias) {
        return '0%';
    }
    const cantidadDeAsistencias = usuario.cantidadDeAsistencias || 0;
    const cantidadDeDias = diasDeReunionEntreFechas.value.length;
    return `${Math.round((cantidadDeAsistencias / cantidadDeDias) * 100)}%`;
};


const pasarDiaANumero = (dia) => {
    switch (dia) {
        case 'domingo':
            return 0;
        case 'lunes':
            return 1;
        case 'martes':
            return 2;
        case 'miércoles':
            return 3;
        case 'jueves':
            return 4;
        case 'viernes':
            return 5;
        case 'sábado':
            return 6;
    }
}


onMounted(() => {
    getUsuarios();
    getReuniones();
    getUsuariosDelGrupo();
})
</script>
<style scoped>
.tabla table {
    width: 100%;
    border-collapse: collapse;
}

.tabla td {
    text-align: center;
    border: 1px solid #ccc;
    height: 100px;
    min-width: 100px;
}

.tabla th {
    text-align: center;
    border: 1px solid #ccc;
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: rgb(230, 225, 225);
    width: 100px;
}

.tabla th:first-child {
    position: sticky;
    left: -15px;
    z-index: 2;
}

.tabla td:first-child {
    position: sticky;
    left: -15px;
    z-index: 1;
    background-color: rgb(230, 225, 225);
    border: 1px solid #ccc;
}

.contenedor-tabla {
    margin-top: 20px;
    height: 500px;
    width: fit-content;
    overflow: auto;
}

/*** hacer los scrolls finos */
::-webkit-scrollbar {
    width: 5px;
    height: 5px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
    background: #888;
}

::-webkit-scrollbar-thumb:hover {
    background: #555;
}

.tab-content {
    margin-top: 20px;
}

/** hacer los scrolls horizontal finos */
</style>