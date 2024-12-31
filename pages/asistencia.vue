<template>
    <div class="container">
        <h1 v-if="reunion != ''">Asistencia a {{ reunion }}</h1>
        <h1 v-else>Seleccione Reunión</h1>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <!-- <p v-if="successMessage" class="success">{{ successMessage }}</p> -->

        <div class="botones">
            <button class="btn btn-warning mb-3" @click="login" id="btn" v-if="!usuario">Identificarse</button>
            <button :disabled="!permissionGranted || esMuyPronto || reunion.length == 0 || !usuario"
                @click="handleAsistencia" class="asistencia-btn" id="btn-asistencia">
                Enviar Registro
            </button>
            <div class="localization" v-if="permissionGranted">
                <p>{{ localization }}</p>
            </div>
        </div>

    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useSupabase } from '~/composables/useSupabase';
const runtimeConfig = useRuntimeConfig(); // Asegúrate de llamarlo así
const googleApiKey = runtimeConfig.public.googleMapsApiKey;
//importar el router

export default {
    setup() {
        const permissionGranted = ref(false);
        const errorMessage = ref(null);
        const successMessage = ref(null);
        const esMuyPronto = ref(true);
        const localization = ref('Ubicación no disponible');

        const route = useRoute();

        const { usuario, roles, hasRole, supabase, signIn } = useSupabase();

        const reunion = ref('');

        const login = async () => {
            //guardar la url completa para redirigir al usuario
            let origen = window.location.href;
            console.log('origen:', origen);
            await signIn(origen);
            console.log('usuario:', usuario.value);

        }



        // Solicitar permisos de geolocalización
        const requestLocationPermission = () => {
            if (!navigator.geolocation) {
                errorMessage.value = "La geolocalización no está soportada por tu navegador.";
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    permissionGranted.value = true;
                    successMessage.value = "Permisos OK. Podés registrar tu asistencia.";
                    console.log("Ubicación obtenida:", position);
                    getAddress(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage.value = "Has denegado el permiso de ubicación.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage.value = "La información de ubicación no está disponible.";
                            break;
                        case error.TIMEOUT:
                            errorMessage.value = "El tiempo de espera para obtener la ubicación ha expirado.";
                            break;
                        default:
                            errorMessage.value = "Ocurrió un error al solicitar la ubicación.";
                    }
                }
            );
        };

        // Manejar el evento de asistencia
        const handleAsistencia = () => {
            document.getElementById('btn-asistencia').disabled = true;
            if (!navigator.geolocation) {
                console.error("La geolocalización no está soportada por tu navegador.");
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("Ubicación obtenida:", position);
                    saveAsistencia(position.coords.latitude, position.coords.longitude);

                },
                (error) => {
                    console.error("Error al obtener la ubicación:", error);
                }
            );
        };

        const saveAsistencia = async (lat, long) => {
            let momento = new Date();
            let user_id = usuario.value.id;
            let reunion = route.query.id;
            let latitud = lat;
            let longitud = long;

            const { data, error } = await supabase.from('asistencias').insert([
                { user_id, reunion, latitud, longitud, momento, direccion: localization.value }
            ]);

            getLastMark();

            if (error) {
                console.error('Error al guardar la asistencia:', error.message);
                errorMessage.value = 'Error al guardar la asistencia';
            } else {
                console.log('Asistencia guardada:', data);
                successMessage.value = 'Asistencia guardada correctamente';
            }

        }

        const getLastMark = async () => {
            console.log('usuario:', usuario.value);
            if (!usuario.value) {
                return;
            }
            const { data, error } = await supabase.from('asistencias').select('momento').eq('user_id', usuario.value.id).order('momento', { ascending: false }).limit(1)
            if (error) {
                console.error('Error al obtener la última marca:', error.message)
            } else {
                if (data.length > 0) {
                    console.log('Última marca:', data[0].momento);
                    let ultimaMarca = new Date(data[0].momento);
                    let ahora = new Date();
                    let diferencia = ahora - ultimaMarca;
                    console.log('Ahora:', ahora);
                    console.log('Ultima marca:', ultimaMarca);
                    console.log('Diferencia:', diferencia);
                    //si la diferencia es menor a 60 minutos, no se puede marcar
                    if (diferencia < 3600000) {
                        esMuyPronto.value = true;
                    } else {
                        esMuyPronto.value = false;
                    }
                    console.log('esMuyPronto:', esMuyPronto.value);
                }
                else {
                    esMuyPronto.value = false;
                }
            }
        }

        const getAddress = async (lat, long) => {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${googleApiKey}`;

            const response = await fetch(url);
            const data = await response.json();
            console.log(data);

            if (data.status === 'OK') {
                localization.value = data.results[0].formatted_address;
            } else {
                localization.value = 'Ubicación no disponible';
            }

        }

        const getReunionName = async () => {
            const { data, error } = await supabase.from('reuniones').select('nombre').eq('id', route.query.id)
            if (error) {
                console.error('Error al obtener el nombre de la reunión:', error.message)
            } else {
                reunion.value = data[0].nombre;
            }
        }


        // Solicitar permisos al montar el componente
        onMounted(() => {
            requestLocationPermission();
            getLastMark();
            getReunionName();
        });

        return {
            permissionGranted,
            errorMessage,
            successMessage,
            handleAsistencia,
            usuario,
            esMuyPronto,
            reunion,
            localization,
            usuario,
            login
        };
    }
};
</script>

<style scoped>
.botones {
    text-align: center;
    margin-top: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.container {
    text-align: center;
    margin-top: 50px;
}

button.asistencia-btn {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button.asistencia-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.error {
    color: red;
    margin-bottom: 10px;
}

.success {
    color: green;
    margin-bottom: 10px;
}

.localization {
    margin-top: 20px;
}

.localization p {
    color: #666;
}
</style>
