<template>
    <div class="container-fluid py-4">
        <div class="row justify-content-center">
            <div class="col-lg-10">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h4 class="mb-0">
                            <i class="bi bi-database me-2"></i>
                            Configuración de Base de Datos - Chat
                        </h4>
                    </div>
                    <div class="card-body">
                        <div class="alert alert-warning" role="alert">
                            <i class="bi bi-exclamation-triangle me-2"></i>
                            <strong>¡Atención!</strong> Esta página ejecutará scripts SQL para crear las tablas
                            necesarias para el sistema de chat.
                        </div>

                        <!-- Estado de las tablas -->
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <div class="card border-info">
                                    <div class="card-body text-center">
                                        <i class="bi bi-chat-dots text-info" style="font-size: 2rem;"></i>
                                        <h6 class="mt-2">Tabla mensajes_reunion</h6>
                                        <span class="badge"
                                            :class="estadoTablas.mensajes_reunion ? 'bg-success' : 'bg-secondary'">
                                            {{ estadoTablas.mensajes_reunion ? 'Creada' : 'No existe' }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card border-success">
                                    <div class="card-body text-center">
                                        <i class="bi bi-people text-success" style="font-size: 2rem;"></i>
                                        <h6 class="mt-2">Tabla participantes_online</h6>
                                        <span class="badge"
                                            :class="estadoTablas.participantes_online ? 'bg-success' : 'bg-secondary'">
                                            {{ estadoTablas.participantes_online ? 'Creada' : 'No existe' }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Acciones -->
                        <div class="text-center mb-4">
                            <button class="btn btn-info me-3" @click="verificarTablas" :disabled="verificando">
                                <span v-if="verificando" class="spinner-border spinner-border-sm me-2"></span>
                                <i v-else class="bi bi-arrow-clockwise me-2"></i>
                                Verificar Estado
                            </button>

                            <button class="btn btn-success me-3" @click="crearTablas"
                                :disabled="creando || todasLasTablas">
                                <span v-if="creando" class="spinner-border spinner-border-sm me-2"></span>
                                <i v-else class="bi bi-plus-circle me-2"></i>
                                Crear Tablas
                            </button>

                            <button class="btn btn-primary" @click="insertarDatosPrueba"
                                :disabled="insertando || !todasLasTablas">
                                <span v-if="insertando" class="spinner-border spinner-border-sm me-2"></span>
                                <i v-else class="bi bi-database-add me-2"></i>
                                Datos de Prueba
                            </button>
                        </div>

                        <!-- Log de actividad -->
                        <div v-if="logs.length > 0" class="card bg-light">
                            <div class="card-header">
                                <h6 class="mb-0">Log de Actividad</h6>
                            </div>
                            <div class="card-body">
                                <div class="log-container" style="max-height: 300px; overflow-y: auto;">
                                    <div v-for="(log, index) in logs" :key="index" class="log-entry" :class="log.tipo">
                                        <small class="text-muted">{{ log.timestamp }}</small> -
                                        <span>{{ log.mensaje }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, computed } from 'vue'
    import Swal from 'sweetalert2'

    const supabase = useSupabaseClient()

    // Estados reactivos
    const estadoTablas = ref({
        mensajes_reunion: false,
        participantes_online: false
    })

    const verificando = ref(false)
    const creando = ref(false)
    const insertando = ref(false)
    const logs = ref([])

    // Computed
    const todasLasTablas = computed(() => {
        return estadoTablas.value.mensajes_reunion && estadoTablas.value.participantes_online
    })

    // Métodos de utilidad
    const agregarLog = (mensaje, tipo = 'info') => {
        logs.value.push({
            timestamp: new Date().toLocaleTimeString(),
            mensaje,
            tipo
        })
    }

    // Verificar si las tablas existen
    const verificarTablas = async () => {
        verificando.value = true
        agregarLog('Verificando estado de las tablas...', 'info')

        try {
            // Verificar tabla mensajes_reunion
            const { data: mensajesData, error: mensajesError } = await supabase
                .from('mensajes_reunion')
                .select('id')
                .limit(1)

            estadoTablas.value.mensajes_reunion = !mensajesError

            // Verificar tabla participantes_online
            const { data: participantesData, error: participantesError } = await supabase
                .from('participantes_online')
                .select('id')
                .limit(1)

            estadoTablas.value.participantes_online = !participantesError

            agregarLog(`mensajes_reunion: ${estadoTablas.value.mensajes_reunion ? 'OK' : 'NO EXISTE'}`,
                estadoTablas.value.mensajes_reunion ? 'success' : 'warning')
            agregarLog(`participantes_online: ${estadoTablas.value.participantes_online ? 'OK' : 'NO EXISTE'}`,
                estadoTablas.value.participantes_online ? 'success' : 'warning')

        } catch (error) {
            console.error('Error verificando tablas:', error)
            agregarLog(`Error: ${error.message}`, 'error')
        } finally {
            verificando.value = false
        }
    }

    // Crear las tablas manualmente usando INSERT/UPDATE en tablas existentes
    const crearTablas = async () => {
        if (todasLasTablas.value) {
            await Swal.fire({
                title: 'Información',
                text: 'Todas las tablas ya existen',
                icon: 'info'
            })
            return
        }

        const result = await Swal.fire({
            title: '¿Crear tablas?',
            text: 'Se crearán las tablas necesarias para el sistema de chat. Esta acción no se puede deshacer.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, crear',
            cancelButtonText: 'Cancelar'
        })

        if (!result.isConfirmed) return

        creando.value = true
        agregarLog('Iniciando creación de tablas...', 'info')

        try {
            // Como no podemos ejecutar DDL directamente, vamos a crear las tablas usando la consola de Supabase
            // Mostrar las instrucciones al usuario

            await Swal.fire({
                title: 'Instrucciones',
                html: `
                <div style="text-align: left; font-size: 0.9rem;">
                    <p><strong>Para crear las tablas, sigue estos pasos:</strong></p>
                    <ol>
                        <li>Ve a <a href="https://supabase.com/dashboard" target="_blank">Supabase Dashboard</a></li>
                        <li>Selecciona tu proyecto</li>
                        <li>Ve a "SQL Editor" en el menú lateral</li>
                        <li>Ejecuta el siguiente SQL:</li>
                    </ol>
                    <textarea readonly style="width: 100%; height: 200px; font-family: monospace; font-size: 0.8rem; margin: 10px 0;">
-- Crear tabla de mensajes de reunión
CREATE TABLE IF NOT EXISTS mensajes_reunion (
    id BIGSERIAL PRIMARY KEY,
    convocatoria_id BIGINT NOT NULL REFERENCES convocatorias(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    tipo_mensaje VARCHAR(20) DEFAULT 'mensaje' CHECK (tipo_mensaje IN ('mensaje', 'sistema', 'info')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de participantes online
CREATE TABLE IF NOT EXISTS participantes_online (
    id BIGSERIAL PRIMARY KEY,
    convocatoria_id BIGINT NOT NULL REFERENCES convocatorias(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT true,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(convocatoria_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_mensajes_reunion_convocatoria_id ON mensajes_reunion(convocatoria_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_reunion_created_at ON mensajes_reunion(created_at);
CREATE INDEX IF NOT EXISTS idx_participantes_online_convocatoria_id ON participantes_online(convocatoria_id);
CREATE INDEX IF NOT EXISTS idx_participantes_online_last_seen ON participantes_online(last_seen);

-- RLS Policies
ALTER TABLE mensajes_reunion ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes_online ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of meetings they are invited to" ON mensajes_reunion
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM convocatorias_users cu 
            WHERE cu.convocatoria_id = mensajes_reunion.convocatoria_id 
            AND cu.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in meetings they are invited to" ON mensajes_reunion
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM convocatorias_users cu 
            WHERE cu.convocatoria_id = mensajes_reunion.convocatoria_id 
            AND cu.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" ON mensajes_reunion
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view online participants of meetings they are invited to" ON participantes_online
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM convocatorias_users cu 
            WHERE cu.convocatoria_id = participantes_online.convocatoria_id 
            AND cu.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can upsert their own online presence" ON participantes_online
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own online presence" ON participantes_online
    FOR UPDATE USING (user_id = auth.uid());
                    </textarea>
                    <p><strong>Después de ejecutar el SQL, regresa aquí y haz clic en "Verificar Estado"</strong></p>
                </div>
            `,
                width: '800px',
                confirmButtonText: 'Entendido'
            })

            agregarLog('Instrucciones mostradas. Ejecuta el SQL en Supabase Dashboard.', 'info')

        } catch (error) {
            console.error('Error:', error)
            agregarLog(`Error: ${error.message}`, 'error')

            await Swal.fire({
                title: 'Error',
                text: 'Hubo un error. Revisa la consola para más detalles.',
                icon: 'error'
            })
        } finally {
            creando.value = false
        }
    }

    // Insertar datos de prueba
    const insertarDatosPrueba = async () => {
        if (!todasLasTablas.value) {
            await Swal.fire({
                title: 'Error',
                text: 'Primero debes crear todas las tablas',
                icon: 'error'
            })
            return
        }

        const result = await Swal.fire({
            title: '¿Insertar datos de prueba?',
            text: 'Se insertarán algunos mensajes de prueba en el sistema',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, insertar',
            cancelButtonText: 'Cancelar'
        })

        if (!result.isConfirmed) return

        insertando.value = true
        agregarLog('Insertando datos de prueba...', 'info')

        try {
            // Verificar que haya convocatorias existentes
            const { data: convocatorias } = await supabase
                .from('convocatorias')
                .select('id')
                .limit(1)

            if (!convocatorias || convocatorias.length === 0) {
                await Swal.fire({
                    title: 'Sin convocatorias',
                    text: 'No hay convocatorias existentes. Crea una reunión primero.',
                    icon: 'info'
                })
                return
            }

            const convocatoriaId = convocatorias[0].id
            const usuario = useSupabaseUser()

            // Insertar mensaje de sistema
            const { error: error1 } = await supabase
                .from('mensajes_reunion')
                .insert({
                    convocatoria_id: convocatoriaId,
                    user_id: usuario.value.id,
                    mensaje: 'El chat ha sido creado correctamente. ¡Bienvenidos!',
                    tipo_mensaje: 'sistema'
                })

            if (error1) throw error1

            // Insertar mensaje normal
            const { error: error2 } = await supabase
                .from('mensajes_reunion')
                .insert({
                    convocatoria_id: convocatoriaId,
                    user_id: usuario.value.id,
                    mensaje: '¡Hola! Este es un mensaje de prueba del sistema de chat.',
                    tipo_mensaje: 'mensaje'
                })

            if (error2) throw error2

            agregarLog('Datos de prueba insertados correctamente', 'success')

            await Swal.fire({
                title: 'Éxito',
                text: 'Los datos de prueba se han insertado correctamente',
                icon: 'success'
            })

        } catch (error) {
            console.error('Error insertando datos:', error)
            agregarLog(`Error: ${error.message}`, 'error')

            await Swal.fire({
                title: 'Error',
                text: `Error insertando datos: ${error.message}`,
                icon: 'error'
            })
        } finally {
            insertando.value = false
        }
    }

    // Lifecycle
    onMounted(() => {
        verificarTablas()
    })
</script>

<style scoped>
    .log-container {
        background: #f8f9fa;
        border-radius: 6px;
        padding: 1rem;
    }

    .log-entry {
        padding: 0.25rem 0;
        border-bottom: 1px solid #e9ecef;
        font-family: 'Courier New', monospace;
        font-size: 0.875rem;
    }

    .log-entry:last-child {
        border-bottom: none;
    }

    .log-entry.success {
        color: #198754;
    }

    .log-entry.warning {
        color: #fd7e14;
    }

    .log-entry.error {
        color: #dc3545;
    }

    .log-entry.info {
        color: #0d6efd;
    }

    textarea {
        resize: none;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 0.5rem;
    }
</style>