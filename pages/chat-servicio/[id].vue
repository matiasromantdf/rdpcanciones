<template>
    <div class="container-fluid chat-container">
        <!-- Header del chat -->
        <div class="chat-header">
            <div class="row align-items-center">
                <div class="col">
                    <div class="chat-info">
                        <h4 class="chat-title">
                            <i class="bi bi-music-note-list me-2"></i>
                            {{ servicio?.titulo || 'Chat de Servicio' }}
                        </h4>
                        <p class="chat-subtitle mb-0" v-if="servicio">
                            <i class="bi bi-calendar3 me-2"></i>
                            {{ formatearFecha(servicio.fecha) }} - {{ servicio.hora }}
                        </p>
                    </div>
                </div>
                <div class="col-auto">
                    <div class="chat-actions">
                        <!-- Botón de listado de canciones -->
                        <button class="btn btn-success me-3" @click="mostrarListadoCanciones">
                            <i class="bi bi-music-note-beamed me-2"></i>
                            Listado de Canciones
                        </button>
                        <!-- Indicador de usuarios online -->
                        <div class="usuarios-online me-3">
                            <i class="bi bi-people me-1"></i>
                            <span class="badge bg-success">{{ usuariosOnline.length }}</span>
                        </div>
                        <!-- Botón volver -->
                        <button class="btn btn-outline-secondary" @click="$router.go(-1)">
                            <i class="bi bi-arrow-left me-2"></i>
                            Volver
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Lista de usuarios online (colapsable) -->
        <div class="usuarios-online-panel" v-if="mostrarUsuariosOnline">
            <div class="usuarios-grid">
                <div v-for="userOnline in usuariosOnline" :key="userOnline.user_id" class="usuario-online-item">
                    <div class="usuario-avatar">
                        <img v-if="userOnline.avatar_url" :src="userOnline.avatar_url" :alt="userOnline.full_name"
                            class="avatar-img">
                        <div v-else class="avatar-placeholder">
                            <i class="bi bi-person-fill"></i>
                        </div>
                        <div class="status-indicator"></div>
                    </div>
                    <span class="usuario-nombre">{{ userOnline.full_name || userOnline.email }}</span>
                </div>
            </div>
        </div>

        <!-- Área de mensajes -->
        <div class="chat-messages" ref="messagesContainer">
            <div class="messages-wrapper">
                <!-- Loading inicial -->
                <div v-if="loadingMessages" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando mensajes...</span>
                    </div>
                    <p class="mt-2 text-muted">Cargando historial del chat...</p>
                </div>

                <!-- Mensajes del chat -->
                <div v-for="mensaje in mensajes" :key="mensaje.id" class="mensaje"
                    :class="{ 'mensaje-propio': mensaje.user_id === usuario?.id }">
                    <div class="mensaje-content">
                        <div class="mensaje-header">
                            <span class="usuario-nombre">{{
                                mensaje.usuarios?.raw_user_meta_data?.full_name || mensaje.usuarios?.email
                            }}</span>
                            <span class="mensaje-time">{{ formatearHora(mensaje.created_at) }}</span>
                        </div>
                        <div class="mensaje-text" v-html="formatearMensaje(mensaje.mensaje)"></div>
                    </div>
                </div>

                <!-- Mensaje cuando no hay mensajes -->
                <div v-if="!loadingMessages && mensajes.length === 0" class="no-messages">
                    <div class="text-center py-4">
                        <i class="bi bi-chat-dots text-muted" style="font-size: 3rem;"></i>
                        <h5 class="mt-3 text-muted">¡Comienza la conversación!</h5>
                        <p class="text-muted">Sé el primero en escribir un mensaje en este servicio</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Indicador de escritura -->
        <div v-if="usuarioEscribiendo" class="typing-indicator">
            <span>{{ usuarioEscribiendo }} está escribiendo...</span>
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>

        <!-- Input de mensaje -->
        <div class="chat-input-area">
            <div class="input-group">
                <input v-model="nuevoMensaje" @keyup.enter="enviarMensaje" @input="onTyping"
                    class="form-control chat-input" placeholder="Escribe tu mensaje aquí..."
                    :disabled="enviandoMensaje">
                <button @click="enviarMensaje" class="btn btn-primary"
                    :disabled="!nuevoMensaje.trim() || enviandoMensaje">
                    <div v-if="enviandoMensaje" class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Enviando...</span>
                    </div>
                    <i v-else class="bi bi-send"></i>
                </button>
            </div>
        </div>

        <!-- Modal de Listado de Canciones -->
        <div class="modal fade" id="modalListadoCanciones" tabindex="-1" aria-labelledby="modalListadoCancionesLabel"
            aria-hidden="true" ref="modalListadoCanciones">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalListadoCancionesLabel">
                            <i class="bi bi-music-note-list me-2"></i>
                            Listado de Canciones del Servicio
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Tabs para alternar entre listado del servicio y repertorio personal -->
                        <ul class="nav nav-tabs mb-3" id="cancionesTab" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="servicio-tab" data-bs-toggle="tab"
                                    data-bs-target="#servicio-pane" type="button" role="tab">
                                    <i class="bi bi-list-ul me-2"></i>
                                    Canciones del Servicio ({{ cancionesServicio.length }})
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="repertorio-tab" data-bs-toggle="tab"
                                    data-bs-target="#repertorio-pane" type="button" role="tab">
                                    <i class="bi bi-heart-fill me-2"></i>
                                    Mi Repertorio ({{ repertorioPersonal.length }})
                                </button>
                            </li>
                        </ul>

                        <div class="tab-content" id="cancionesTabContent">
                            <!-- Tab de canciones del servicio -->
                            <div class="tab-pane fade show active" id="servicio-pane" role="tabpanel">
                                <div v-if="cargandoCancionesServicio" class="text-center py-4">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Cargando...</span>
                                    </div>
                                </div>
                                <div v-else-if="cancionesServicio.length === 0" class="text-center py-4">
                                    <i class="bi bi-music-note text-muted" style="font-size: 2.5rem;"></i>
                                    <h5 class="mt-3 text-muted">No hay canciones en este servicio</h5>
                                    <p class="text-muted">Los integrantes pueden agregar canciones desde su repertorio
                                        personal</p>
                                </div>
                                <div v-else>
                                    <div v-for="cancion in cancionesServicio" :key="cancion.id" class="cancion-item">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div class="cancion-info">
                                                <h6 class="mb-1">
                                                    <nuxt-link :to="`/ver-cancion/${cancion.cancion_id}`"
                                                        class="text-decoration-none cancion-link" target="_blank">
                                                        {{ cancion.canciones.titulo }}
                                                        <i class="bi bi-box-arrow-up-right ms-1"
                                                            style="font-size: 0.8rem;"></i>
                                                    </nuxt-link>
                                                </h6>
                                                <small class="text-muted">
                                                    <i class="bi bi-music-note me-1"></i>
                                                    Tono: {{ cancion.tono || 'No especificado' }}
                                                    <span v-if="cancion.orden" class="ms-2">
                                                        <i class="bi bi-list-ol me-1"></i>
                                                        Orden: {{ cancion.orden }}
                                                    </span>
                                                </small>
                                                <div class="mt-1">
                                                    <small class="text-success">
                                                        <i class="bi bi-person-plus me-1"></i>
                                                        Agregada por:
                                                        {{ cancion.usuarios?.raw_user_meta_data?.full_name || cancion.usuarios?.email || 'Usuario desconocido' }}
                                                    </small>
                                                </div>
                                                <div v-if="cancion.observaciones" class="mt-1">
                                                    <small class="text-info">
                                                        <i class="bi bi-journal-text me-1"></i>
                                                        {{ cancion.observaciones }}
                                                    </small>
                                                </div>
                                            </div>
                                            <div class="cancion-actions">
                                                <button v-if="puedeEliminarCancion(cancion)"
                                                    @click="eliminarCancionDelServicio(cancion.id)"
                                                    class="btn btn-outline-danger btn-sm"
                                                    title="Eliminar canción del servicio">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Tab de repertorio personal -->
                            <div class="tab-pane fade" id="repertorio-pane" role="tabpanel">
                                <div v-if="cargandoRepertorio" class="text-center py-4">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Cargando...</span>
                                    </div>
                                </div>
                                <div v-else-if="repertorioPersonal.length === 0" class="text-center py-4">
                                    <i class="bi bi-heart text-muted" style="font-size: 2.5rem;"></i>
                                    <h5 class="mt-3 text-muted">Tu repertorio está vacío</h5>
                                    <p class="text-muted">
                                        Agrega canciones a tu repertorio personal desde el catálogo
                                        <nuxt-link to="/canciones" class="text-decoration-none">aquí</nuxt-link>
                                    </p>
                                </div>
                                <div v-else>
                                    <div v-for="cancion in repertorioPersonal" :key="cancion.id" class="cancion-item">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div class="cancion-info">
                                                <h6 class="mb-1">
                                                    <nuxt-link :to="`/ver-cancion/${cancion.cancion_id}`"
                                                        class="text-decoration-none cancion-link" target="_blank">
                                                        {{ cancion.canciones.titulo }}
                                                        <i class="bi bi-box-arrow-up-right ms-1"
                                                            style="font-size: 0.8rem;"></i>
                                                    </nuxt-link>
                                                </h6>
                                                <small class="text-muted">
                                                    <i class="bi bi-music-note me-1"></i>
                                                    Tu tono:
                                                    {{ obtenerNombreTono(cancion.tono_numero, cancion.tono_esmenor) }}
                                                </small>
                                            </div>
                                            <div class="cancion-actions">
                                                <button @click="agregarCancionAlServicio(cancion)"
                                                    class="btn btn-outline-success btn-sm"
                                                    :disabled="yaEstaEnServicio(cancion.canciones.id)"
                                                    :title="yaEstaEnServicio(cancion.canciones.id) ? 'Ya está en el servicio' : 'Agregar al servicio'">
                                                    <i class="bi bi-plus-circle"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
    import { useRoute } from 'vue-router'
    import Swal from 'sweetalert2'

    const route = useRoute()
    const supabase = useSupabaseClient()
    const usuario = useSupabaseUser()

    // Estados del chat
    const servicio = ref(null)
    const mensajes = ref([])
    const usuariosOnline = ref([])
    const nuevoMensaje = ref('')
    const loadingMessages = ref(true)
    const enviandoMensaje = ref(false)
    const mostrarUsuariosOnline = ref(false)
    const usuarioEscribiendo = ref(null)
    const messagesContainer = ref(null)
    const modalListadoCanciones = ref(null)

    // Estados de canciones
    const cancionesServicio = ref([])
    const repertorioPersonal = ref([])
    const cargandoCancionesServicio = ref(false)
    const cargandoRepertorio = ref(false)

    // Subscripciones de tiempo real
    let mensajesSubscription = null
    let presenciaSubscription = null
    let cancionesSubscription = null

    // Referencias de typing timeout
    let typingTimeout = null
    let presenceInterval = null

    const servicioId = computed(() => parseInt(route.params.id))

    // Obtener información del servicio
    const obtenerServicio = async () => {
        try {
            const { data, error } = await supabase
                .from('servicios')
                .select('*')
                .eq('id', servicioId.value)
                .single()

            if (error) throw error
            servicio.value = data
        } catch (error) {
            console.error('Error obteniendo servicio:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar la información del servicio',
                icon: 'error'
            })
        }
    }

    // Verificar acceso del usuario al servicio
    const verificarAcceso = async () => {
        try {
            const { data, error } = await supabase
                .from('servicios_usuarios')
                .select('*')
                .eq('servicio_id', servicioId.value)
                .eq('user_id', usuario.value.id)
                .single()

            if (error || !data) {
                await Swal.fire({
                    title: 'Acceso denegado',
                    text: 'No tienes acceso a este servicio',
                    icon: 'error'
                })
                navigateTo('/')
                return false
            }
            return true
        } catch (error) {
            console.error('Error verificando acceso:', error)
            return false
        }
    }

    // Cargar mensajes del chat
    const cargarMensajes = async () => {
        try {
            const { data, error } = await supabase
                .from('mensajes_servicio')
                .select(`
                    *,
                    usuarios (
                        email,
                        raw_user_meta_data
                    )
                `)
                .eq('servicio_id', servicioId.value)
                .order('created_at', { ascending: true })

            if (error) throw error
            mensajes.value = data || []

            await nextTick()
            scrollToBottom()
        } catch (error) {
            console.error('Error cargando mensajes:', error)
        } finally {
            loadingMessages.value = false
        }
    }

    // Cargar usuarios online
    const cargarUsuariosOnline = async () => {
        try {
            const { data, error } = await supabase
                .from('participantes_online_servicio')
                .select(`
                    *,
                    usuarios (
                        email,
                        raw_user_meta_data
                    )
                `)
                .eq('servicio_id', servicioId.value)
                .eq('is_online', true)
                .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Últimos 5 minutos

            if (error) throw error
            usuariosOnline.value = data?.map(item => ({
                user_id: item.user_id,
                full_name: item.usuarios?.raw_user_meta_data?.full_name,
                email: item.usuarios?.email,
                avatar_url: item.usuarios?.raw_user_meta_data?.avatar_url,
                last_seen: item.last_seen
            })) || []
        } catch (error) {
            console.error('Error cargando usuarios online:', error)
        }
    }

    // Actualizar presencia del usuario
    const actualizarPresencia = async () => {
        if (!usuario.value) return

        try {
            await supabase
                .from('participantes_online_servicio')
                .upsert({
                    servicio_id: servicioId.value,
                    user_id: usuario.value.id,
                    is_online: true,
                    last_seen: new Date().toISOString()
                }, {
                    onConflict: 'servicio_id,user_id'
                })
        } catch (error) {
            console.error('Error actualizando presencia:', error)
        }
    }

    // Enviar mensaje
    const enviarMensaje = async () => {
        if (!nuevoMensaje.value.trim() || enviandoMensaje.value) return

        enviandoMensaje.value = true
        const mensaje = nuevoMensaje.value.trim()
        nuevoMensaje.value = ''

        try {
            const { error } = await supabase
                .from('mensajes_servicio')
                .insert({
                    servicio_id: servicioId.value,
                    user_id: usuario.value.id,
                    mensaje: mensaje,
                    tipo_mensaje: 'mensaje'
                })

            if (error) throw error

            // Scroll to bottom después de enviar
            await nextTick()
            scrollToBottom()
        } catch (error) {
            console.error('Error enviando mensaje:', error)
            nuevoMensaje.value = mensaje // Restaurar mensaje si falla
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo enviar el mensaje',
                icon: 'error',
                timer: 2000
            })
        } finally {
            enviandoMensaje.value = false
        }
    }

    // Manejar typing indicator
    const onTyping = () => {
        // Lógica para typing indicator (opcional por ahora)
    }

    // Scroll al final de los mensajes
    const scrollToBottom = () => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    }

    // Configurar subscripciones de tiempo real
    const configurarSuscripciones = () => {
        // Suscripción a nuevos mensajes
        mensajesSubscription = supabase
            .channel(`mensajes_servicio:servicio_id=eq.${servicioId.value}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'mensajes_servicio',
                filter: `servicio_id=eq.${servicioId.value}`
            }, async (payload) => {
                // Obtener datos completos del mensaje incluyendo usuario
                const { data: nuevoMensaje } = await supabase
                    .from('mensajes_servicio')
                    .select(`
                        *,
                        usuarios (
                            email,
                            raw_user_meta_data
                        )
                    `)
                    .eq('id', payload.new.id)
                    .single()

                if (nuevoMensaje) {
                    mensajes.value.push(nuevoMensaje)
                    await nextTick()
                    scrollToBottom()
                }
            })
            .subscribe()

        // Suscripción a presencia online
        presenciaSubscription = supabase
            .channel(`participantes_online_servicio:servicio_id=eq.${servicioId.value}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'participantes_online_servicio',
                filter: `servicio_id=eq.${servicioId.value}`
            }, () => {
                cargarUsuariosOnline()
            })
            .subscribe()

        // Suscripción a cambios en canciones del servicio
        cancionesSubscription = supabase
            .channel(`servicios_canciones:servicio_id=eq.${servicioId.value}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'servicios_canciones',
                filter: `servicio_id=eq.${servicioId.value}`
            }, () => {
                cargarCancionesServicio()
            })
            .subscribe()
    }

    // === FUNCIONES DE CANCIONES ===

    // Mostrar modal de listado de canciones
    const mostrarListadoCanciones = () => {
        cargarCancionesServicio()
        cargarRepertorioPersonal()

        // Usar Bootstrap modal
        const modal = new bootstrap.Modal(modalListadoCanciones.value)
        modal.show()
    }

    // Cargar canciones del servicio
    const cargarCancionesServicio = async () => {
        cargandoCancionesServicio.value = true
        try {
            const { data, error } = await supabase
                .from('servicios_canciones')
                .select(`
                    *,
                    canciones (
                        id,
                        titulo
                    ),
                    usuarios:agregado_por (
                        id,
                        email,
                        raw_user_meta_data
                    )
                `)
                .eq('servicio_id', servicioId.value)
                .order('orden', { ascending: true })

            if (error) throw error
            cancionesServicio.value = data || []
        } catch (error) {
            console.error('Error cargando canciones del servicio:', error)
        } finally {
            cargandoCancionesServicio.value = false
        }
    }

    // Cargar repertorio personal del usuario
    const cargarRepertorioPersonal = async () => {
        cargandoRepertorio.value = true
        try {
            const { data, error } = await supabase
                .from('repertorio_voces')
                .select(`
                    *,
                    canciones (
                        id,
                        titulo
                    )
                `)
                .eq('user_id', usuario.value.id)

            if (error) throw error
            repertorioPersonal.value = data || []
        } catch (error) {
            console.error('Error cargando repertorio personal:', error)
        } finally {
            cargandoRepertorio.value = false
        }
    }

    // Agregar canción al servicio desde repertorio personal
    const agregarCancionAlServicio = async (cancionRepertorio) => {
        try {
            const { error } = await supabase
                .from('servicios_canciones')
                .insert({
                    servicio_id: servicioId.value,
                    cancion_id: cancionRepertorio.canciones.id,
                    agregado_por: usuario.value.id,
                    tono: obtenerNombreTono(cancionRepertorio.tono_numero, cancionRepertorio.tono_esmenor),
                    orden: cancionesServicio.value.length + 1
                })

            if (error) throw error

            await Swal.fire({
                title: 'Canción agregada',
                text: `"${cancionRepertorio.canciones.titulo}" se agregó al servicio`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            })

            // Refrescar lista de canciones del servicio
            cargarCancionesServicio()
        } catch (error) {
            console.error('Error agregando canción al servicio:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo agregar la canción al servicio',
                icon: 'error'
            })
        }
    }

    // Eliminar canción del servicio
    const eliminarCancionDelServicio = async (servicioCancionId) => {
        const { value: confirmado } = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Se eliminará la canción del servicio',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (!confirmado) return

        try {
            const { error } = await supabase
                .from('servicios_canciones')
                .delete()
                .eq('id', servicioCancionId)

            if (error) throw error

            await Swal.fire({
                title: 'Canción eliminada',
                text: 'La canción se eliminó del servicio',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            })

            // Refrescar lista
            cargarCancionesServicio()
        } catch (error) {
            console.error('Error eliminando canción del servicio:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar la canción del servicio',
                icon: 'error'
            })
        }
    }

    // Verificar si una canción ya está en el servicio
    const yaEstaEnServicio = (cancionId) => {
        return cancionesServicio.value.some(sc => sc.cancion_id === cancionId)
    }

    // Verificar si el usuario puede eliminar una canción (solo las que agregó)
    const puedeEliminarCancion = (cancionServicio) => {
        // Solo puede eliminar el usuario que agregó la canción
        return cancionServicio.agregado_por === usuario.value?.id
    }

    // Obtener nombre del tono
    const obtenerNombreTono = (numeroTono, esMenor) => {
        const tonos = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        const tono = tonos[(numeroTono - 1) % 12]
        return esMenor ? `${tono}m` : tono
    }

    // === FUNCIONES DE UTILIDAD ===

    const formatearFecha = (fecha) => {
        const date = new Date(fecha)
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        })
    }

    const formatearHora = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatearMensaje = (mensaje) => {
        // Aquí se pueden agregar formatos especiales, por ahora solo texto simple
        return mensaje.replace(/\n/g, '<br>')
    }

    // Lifecycle hooks
    onMounted(async () => {
        if (!usuario.value) {
            navigateTo('/login')
            return
        }

        const tieneAcceso = await verificarAcceso()
        if (!tieneAcceso) return

        await obtenerServicio()
        await cargarMensajes()
        await cargarUsuariosOnline()

        configurarSuscripciones()

        // Actualizar presencia cada 30 segundos
        presenceInterval = setInterval(actualizarPresencia, 30000)
        actualizarPresencia()
    })

    onUnmounted(() => {
        // Limpiar subscripciones
        if (mensajesSubscription) {
            supabase.removeChannel(mensajesSubscription)
        }
        if (presenciaSubscription) {
            supabase.removeChannel(presenciaSubscription)
        }
        if (cancionesSubscription) {
            supabase.removeChannel(cancionesSubscription)
        }

        // Limpiar intervalos
        if (presenceInterval) {
            clearInterval(presenceInterval)
        }
        if (typingTimeout) {
            clearTimeout(typingTimeout)
        }
    })
</script>

<style scoped>
    .chat-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
        padding: 0;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .chat-header {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        padding: 1rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
    }

    .chat-title {
        margin: 0;
        font-weight: 600;
    }

    .chat-subtitle {
        opacity: 0.9;
        font-size: 0.9rem;
    }

    .chat-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .usuarios-online {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.2);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
    }

    .usuarios-online-panel {
        background: rgba(255, 255, 255, 0.95);
        border-bottom: 1px solid #e9ecef;
        padding: 1rem;
        flex-shrink: 0;
    }

    .usuarios-grid {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .usuario-online-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: white;
        padding: 0.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .usuario-avatar {
        position: relative;
        width: 32px;
        height: 32px;
    }

    .avatar-img,
    .avatar-placeholder {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #6c757d;
        color: white;
    }

    .status-indicator {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 10px;
        height: 10px;
        background: #28a745;
        border: 2px solid white;
        border-radius: 50%;
    }

    .usuario-nombre {
        font-size: 0.85rem;
        font-weight: 500;
    }

    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 0;
    }

    .messages-wrapper {
        padding: 1rem;
    }

    .mensaje {
        margin-bottom: 1rem;
        display: flex;
    }

    .mensaje-propio {
        justify-content: flex-end;
    }

    .mensaje-content {
        max-width: 70%;
        background: white;
        border-radius: 12px;
        padding: 0.75rem 1rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        position: relative;
    }

    .mensaje-propio .mensaje-content {
        background: linear-gradient(135deg, #28a745, #20c997);
        color: white;
    }

    .mensaje-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        font-size: 0.8rem;
    }

    .mensaje-propio .mensaje-header {
        color: rgba(255, 255, 255, 0.9);
    }

    .usuario-nombre {
        font-weight: 600;
    }

    .mensaje-time {
        opacity: 0.7;
    }

    .mensaje-text {
        font-size: 0.95rem;
        line-height: 1.4;
        word-wrap: break-word;
    }

    .no-messages {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .typing-indicator {
        padding: 1rem;
        background: rgba(255, 255, 255, 0.9);
        border-top: 1px solid #e9ecef;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: #6c757d;
        flex-shrink: 0;
    }

    .typing-dots {
        display: flex;
        gap: 2px;
    }

    .typing-dots span {
        width: 4px;
        height: 4px;
        background: #6c757d;
        border-radius: 50%;
        animation: typing 1.5s infinite;
    }

    .typing-dots span:nth-child(2) {
        animation-delay: 0.2s;
    }

    .typing-dots span:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes typing {

        0%,
        60%,
        100% {
            opacity: 0.3;
        }

        30% {
            opacity: 1;
        }
    }

    .chat-input-area {
        background: white;
        padding: 1rem;
        border-top: 1px solid #e9ecef;
        flex-shrink: 0;
    }

    .chat-input {
        border-radius: 25px;
        padding: 0.75rem 1.25rem;
        border: 1px solid #e9ecef;
        font-size: 0.95rem;
    }

    .chat-input:focus {
        border-color: #28a745;
        box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
    }

    .input-group .btn {
        border-radius: 25px;
        padding: 0.75rem 1.25rem;
        margin-left: 0.5rem;
    }

    /* Estilos para el modal de canciones */
    .cancion-item {
        padding: 1rem;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        margin-bottom: 0.75rem;
        background: #f8f9fa;
        transition: all 0.2s ease;
    }

    .cancion-item:hover {
        border-color: #28a745;
        box-shadow: 0 2px 8px rgba(40, 167, 69, 0.15);
    }

    .cancion-info h6 {
        color: #2c3e50;
        font-weight: 600;
    }

    .cancion-actions .btn {
        border-radius: 6px;
    }

    /* Estilos para enlaces de canciones */
    .cancion-link {
        color: #2c3e50 !important;
        font-weight: 600;
        transition: color 0.2s ease;
    }

    .cancion-link:hover {
        color: #28a745 !important;
    }

    .cancion-link i {
        opacity: 0.6;
        transition: opacity 0.2s ease;
    }

    .cancion-link:hover i {
        opacity: 1;
    }

    /* Responsivo */
    @media (max-width: 768px) {
        .chat-header {
            padding: 0.75rem;
        }

        .chat-actions {
            flex-direction: column;
            gap: 0.5rem;
        }

        .usuarios-online {
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
        }

        .mensaje-content {
            max-width: 85%;
        }

        .chat-input-area {
            padding: 0.75rem;
        }
    }

    @media (max-width: 576px) {
        .chat-actions .btn {
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
        }

        .mensaje-content {
            max-width: 95%;
            font-size: 0.9rem;
        }
    }
</style>