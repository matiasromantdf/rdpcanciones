<template>
    <div class="container">
        <h1>Asistencia</h1>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success">{{ successMessage }}</p>

        <button :disabled="!permissionGranted" @click="handleAsistencia" class="asistencia-btn">
            Asistencia
        </button>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useSupabase } from '~/composables/useSupabase';
//importar el router
import { useRouter } from 'vue-router';

export default {
    setup() {
        // Variables reactivas
        const permissionGranted = ref(false);
        const errorMessage = ref(null);
        const successMessage = ref(null);

        //init router
        const route = useRoute();

        //init supabase

        const { usuario, roles, hasRole, supabase } = useSupabase();


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
                { user_id, reunion, latitud, longitud, momento }
            ]);

            if (error) {
                console.error('Error al guardar la asistencia:', error.message);
                errorMessage.value = 'Error al guardar la asistencia';
            } else {
                console.log('Asistencia guardada:', data);
                successMessage.value = 'Asistencia guardada correctamente';
            }

        }


        // Solicitar permisos al montar el componente
        onMounted(() => {
            requestLocationPermission();
        });

        return {
            permissionGranted,
            errorMessage,
            successMessage,
            handleAsistencia,
            usuario
        };
    }
};
</script>

<style scoped>
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
</style>
