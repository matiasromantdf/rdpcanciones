<template>
    <div class="container-fluid chat-container">
        <!-- Header del chat -->
        <div class="chat-header">
            <div class="row align-items-center">
                <div class="col">
                    <div class="chat-info">
                        <h4 class="chat-title">
                            <i class="bi bi-chat-dots me-2"></i>
                            {{ reunion?.titulo || 'Chat de Reunión' }}
                        </h4>
                        <p class="chat-subtitle mb-0" v-if="reunion">
                            <i class="bi bi-calendar3 me-2"></i>
                            {{ formatearFecha(reunion.fecha) }} - {{ reunion.hora }}
                        </p>
                    </div>
                </div>
                <div class="col-auto">
                    <div class="chat-actions">
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
            <!-- Loading inicial -->
            <div v-if="cargandoMensajes" class="loading-messages">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando mensajes...</span>
                </div>
                <p class="mt-2 text-muted">Cargando chat...</p>
            </div>

            <!-- Sin mensajes -->
            <div v-else-if="mensajes.length === 0" class="no-messages">
                <div class="text-center">
                    <i class="bi bi-chat-square text-muted" style="font-size: 3rem;"></i>
                    <h5 class="mt-3 text-muted">¡Inicia la conversación!</h5>
                    <p class="text-muted">Sé el primero en enviar un mensaje en este chat</p>
                </div>
            </div>

            <!-- Lista de mensajes -->
            <div v-else class="mensajes-lista">
                <div v-for="mensaje in mensajes" :key="mensaje.id" class="mensaje-item"
                    :class="{ 'mensaje-propio': mensaje.user_id === usuario?.id }">

                    <!-- Mensaje del sistema -->
                    <div v-if="mensaje.tipo_mensaje === 'sistema'" class="mensaje-sistema">
                        <div class="mensaje-sistema-content">
                            <i class="bi bi-info-circle me-2"></i>
                            {{ mensaje.mensaje }}
                        </div>
                        <small class="mensaje-tiempo">
                            {{ formatearHoraMensaje(mensaje.created_at) }}
                        </small>
                    </div>

                    <!-- Mensaje normal -->
                    <div v-else class="mensaje-normal">
                        <div class="mensaje-avatar" v-if="mensaje.user_id !== usuario?.id">
                            <img v-if="mensaje.usuario_info?.avatar_url" :src="mensaje.usuario_info.avatar_url"
                                :alt="mensaje.usuario_info.full_name" class="avatar-img-small">
                            <div v-else class="avatar-placeholder-small">
                                <i class="bi bi-person-fill"></i>
                            </div>
                        </div>

                        <div class="mensaje-content">
                            <div class="mensaje-header" v-if="mensaje.user_id !== usuario?.id">
                                <span class="mensaje-autor">
                                    {{ mensaje.usuario_info?.full_name || mensaje.usuario_info?.email || 'Usuario' }}
                                </span>
                                <small class="mensaje-tiempo">
                                    {{ formatearHoraMensaje(mensaje.created_at) }}
                                </small>
                            </div>

                            <div class="mensaje-texto">
                                {{ mensaje.mensaje }}
                            </div>

                            <div v-if="mensaje.user_id === usuario?.id" class="mensaje-tiempo-propio">
                                {{ formatearHoraMensaje(mensaje.created_at) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Área de escritura -->
        <div class="chat-input-area">
            <div class="input-group">
                <input type="text" class="form-control" placeholder="Escribe tu mensaje..." v-model="nuevoMensaje"
                    @keypress.enter="enviarMensaje" :disabled="enviandoMensaje" ref="inputMensaje">
                <button class="btn btn-primary" @click="enviarMensaje"
                    :disabled="!nuevoMensaje.trim() || enviandoMensaje">
                    <span v-if="enviandoMensaje" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="bi bi-send"></i>
                </button>
            </div>
        </div>

        <!-- Indicador de usuario escribiendo -->
        <div v-if="usuarioEscribiendo" class="typing-indicator">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <span class="typing-text">{{ usuarioEscribiendo }} está escribiendo...</span>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import Swal from 'sweetalert2'

    const supabase = useSupabaseClient()
    const route = useRoute()
    const router = useRouter()
    const usuario = ref(useSupabaseUser())

    // Estados reactivos
    const reunion = ref(null)
    const mensajes = ref([])
    const usuariosOnline = ref([])
    const cargandoMensajes = ref(true)
    const enviandoMensaje = ref(false)
    const nuevoMensaje = ref('')
    const usuarioEscribiendo = ref('')
    const mostrarUsuariosOnline = ref(false)

    // Referencias DOM
    const messagesContainer = ref(null)
    const inputMensaje = ref(null)

    // Subscripciones realtime
    let subscripcionMensajes = null
    let subscripcionUsuariosOnline = null
    let intervalActualizarOnline = null
    let timeoutEscribiendo = null

    // ID de la reunión desde la URL
    const reunionId = route.params.id

    // Métodos de carga
    const cargarReunion = async () => {
        try {
            const { data, error } = await supabase
                .from('convocatorias')
                .select('*')
                .eq('id', reunionId)
                .single()

            if (error) throw error
            reunion.value = data
        } catch (error) {
            console.error('Error cargando reunión:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar la información de la reunión',
                icon: 'error'
            })
            router.push('/')
        }
    }

    const cargarMensajes = async () => {
        try {
            const { data, error } = await supabase
                .from('mensajes_reunion')
                .select(`
                *,
                usuarios(email, raw_user_meta_data)
            `)
                .eq('convocatoria_id', reunionId)
                .order('created_at', { ascending: true })

            if (error) throw error

            mensajes.value = data.map(mensaje => ({
                ...mensaje,
                usuario_info: {
                    email: mensaje.usuarios.email,
                    full_name: mensaje.usuarios.raw_user_meta_data?.full_name,
                    avatar_url: mensaje.usuarios.raw_user_meta_data?.avatar_url
                }
            }))

            await nextTick()
            scrollToBottom()

        } catch (error) {
            console.error('Error cargando mensajes:', error)
        } finally {
            cargandoMensajes.value = false
        }
    }

    const actualizarPresenciaOnline = async () => {
        if (!usuario.value) return

        try {
            // Actualizar última actividad
            const { error } = await supabase
                .from('participantes_online')
                .upsert({
                    convocatoria_id: reunionId,
                    user_id: usuario.value.id,
                    last_seen: new Date().toISOString(),
                    is_online: true
                }, {
                    onConflict: 'convocatoria_id,user_id'
                })

            if (error) throw error

            // Obtener usuarios online (últimos 2 minutos)
            const dosPasado = new Date(Date.now() - 2 * 60 * 1000).toISOString()

            const { data: onlineData, error: onlineError } = await supabase
                .from('participantes_online')
                .select(`
                *,
                usuarios(email, raw_user_meta_data)
            `)
                .eq('convocatoria_id', reunionId)
                .eq('is_online', true)
                .gte('last_seen', dosPasado)

            if (onlineError) throw onlineError

            usuariosOnline.value = onlineData.map(item => ({
                user_id: item.user_id,
                email: item.usuarios.email,
                full_name: item.usuarios.raw_user_meta_data?.full_name,
                avatar_url: item.usuarios.raw_user_meta_data?.avatar_url
            }))

        } catch (error) {
            console.error('Error actualizando presencia:', error)
        }
    }

    // Métodos de mensajería
    const enviarMensaje = async () => {
        if (!nuevoMensaje.value.trim() || enviandoMensaje.value || !usuario.value) return

        try {
            enviandoMensaje.value = true

            const { error } = await supabase
                .from('mensajes_reunion')
                .insert({
                    convocatoria_id: reunionId,
                    user_id: usuario.value.id,
                    mensaje: nuevoMensaje.value.trim(),
                    tipo_mensaje: 'mensaje'
                })

            if (error) throw error

            nuevoMensaje.value = ''
            inputMensaje.value?.focus()

        } catch (error) {
            console.error('Error enviando mensaje:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo enviar el mensaje. Intenta nuevamente.',
                icon: 'error'
            })
        } finally {
            enviandoMensaje.value = false
        }
    }

    // Configurar subscripción a mensajes en tiempo real
    const configurarRealtimeMensajes = () => {
        subscripcionMensajes = supabase
            .channel(`mensajes_reunion_${reunionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'mensajes_reunion',
                    filter: `convocatoria_id=eq.${reunionId}`
                },
                async (payload) => {
                    // Obtener información completa del usuario
                    const { data: userData } = await supabase
                        .from('usuarios')
                        .select('email, raw_user_meta_data')
                        .eq('id', payload.new.user_id)
                        .single()

                    const nuevoMensaje = {
                        ...payload.new,
                        usuario_info: {
                            email: userData?.email,
                            full_name: userData?.raw_user_meta_data?.full_name,
                            avatar_url: userData?.raw_user_meta_data?.avatar_url
                        }
                    }

                    mensajes.value.push(nuevoMensaje)

                    await nextTick()
                    scrollToBottom()
                }
            )
            .subscribe()
    }

    // Utilidades
    const scrollToBottom = () => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    }

    const formatearFecha = (fecha) => {
        const date = new Date(fecha)
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const formatearHoraMensaje = (timestamp) => {
        const fecha = new Date(timestamp)
        const ahora = new Date()

        // Si es hoy, mostrar solo la hora
        if (fecha.toDateString() === ahora.toDateString()) {
            return fecha.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        // Si es otro día, mostrar fecha y hora
        return fecha.toLocaleString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Limpiar al salir
    const limpiarRecursos = async () => {
        if (subscripcionMensajes) {
            await supabase.removeChannel(subscripcionMensajes)
        }

        if (intervalActualizarOnline) {
            clearInterval(intervalActualizarOnline)
        }

        if (timeoutEscribiendo) {
            clearTimeout(timeoutEscribiendo)
        }

        // Marcar usuario como offline
        if (usuario.value) {
            await supabase
                .from('participantes_online')
                .update({ is_online: false })
                .eq('convocatoria_id', reunionId)
                .eq('user_id', usuario.value.id)
        }
    }

    // Watchers
    watch(usuario, (newUser) => {
        if (newUser) {
            actualizarPresenciaOnline()
        }
    })

    // Lifecycle
    onMounted(async () => {
        if (!usuario.value) {
            await Swal.fire({
                title: 'Acceso Denegado',
                text: 'Debes iniciar sesión para acceder al chat',
                icon: 'error'
            })
            router.push('/login')
            return
        }

        await cargarReunion()
        await cargarMensajes()

        // Configurar presencia online
        await actualizarPresenciaOnline()
        intervalActualizarOnline = setInterval(actualizarPresenciaOnline, 30000) // Cada 30 segundos

        // Configurar realtime
        configurarRealtimeMensajes()

        // Focus en input
        await nextTick()
        inputMensaje.value?.focus()
    })

    onUnmounted(() => {
        limpiarRecursos()
    })

    // Limpiar también al cambiar de página
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', limpiarRecursos)
    }
</script>

<style scoped>
    .chat-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: #f8f9fa;
    }

    .chat-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
    }

    .chat-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
    }

    .chat-subtitle {
        opacity: 0.9;
        font-size: 0.9rem;
    }

    .usuarios-online {
        display: flex;
        align-items: center;
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.9rem;
    }

    .usuarios-online-panel {
        background: white;
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
        padding: 0.5rem;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;
    }

    .usuario-avatar {
        position: relative;
    }

    .avatar-img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
    }

    .avatar-placeholder {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #e9ecef;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6c757d;
        font-size: 0.875rem;
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
        font-size: 0.875rem;
        font-weight: 500;
    }

    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        background: white;
    }

    .loading-messages,
    .no-messages {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        text-align: center;
    }

    .mensajes-lista {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .mensaje-item {
        max-width: 80%;
    }

    .mensaje-item.mensaje-propio {
        align-self: flex-end;
        margin-left: auto;
    }

    .mensaje-sistema {
        text-align: center;
        align-self: center;
    }

    .mensaje-sistema-content {
        background: #e3f2fd;
        color: #1976d2;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.875rem;
        display: inline-block;
    }

    .mensaje-normal {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .mensaje-propio .mensaje-normal {
        flex-direction: row-reverse;
    }

    .mensaje-avatar {
        flex-shrink: 0;
    }

    .avatar-img-small {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
    }

    .avatar-placeholder-small {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #e9ecef;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6c757d;
        font-size: 0.875rem;
    }

    .mensaje-content {
        flex: 1;
        min-width: 0;
    }

    .mensaje-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.25rem;
    }

    .mensaje-autor {
        font-weight: 600;
        color: #495057;
        font-size: 0.875rem;
    }

    .mensaje-tiempo {
        color: #6c757d;
        font-size: 0.75rem;
    }

    .mensaje-texto {
        background: #f8f9fa;
        padding: 0.75rem 1rem;
        border-radius: 18px;
        border-top-left-radius: 4px;
        word-wrap: break-word;
        line-height: 1.4;
    }

    .mensaje-propio .mensaje-texto {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-top-left-radius: 18px;
        border-top-right-radius: 4px;
    }

    .mensaje-tiempo-propio {
        text-align: right;
        margin-top: 0.25rem;
        color: #6c757d;
        font-size: 0.75rem;
    }

    .chat-input-area {
        background: white;
        padding: 1rem;
        border-top: 1px solid #e9ecef;
        flex-shrink: 0;
    }

    .input-group .form-control {
        border-radius: 25px;
        border-right: none;
        padding: 0.75rem 1rem;
    }

    .input-group .btn {
        border-radius: 25px;
        border-left: none;
        padding: 0.75rem 1rem;
        min-width: 50px;
    }

    .typing-indicator {
        position: absolute;
        bottom: 80px;
        left: 1rem;
        background: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .typing-dots {
        display: flex;
        gap: 2px;
    }

    .typing-dots span {
        width: 6px;
        height: 6px;
        background: #667eea;
        border-radius: 50%;
        animation: typing 1.4s infinite;
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
            transform: translateY(0);
        }

        30% {
            transform: translateY(-10px);
        }
    }

    .typing-text {
        font-size: 0.875rem;
        color: #6c757d;
        font-style: italic;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .chat-header {
            padding: 0.75rem;
        }

        .chat-messages {
            padding: 0.75rem;
        }

        .mensaje-item {
            max-width: 95%;
        }

        .usuarios-grid {
            gap: 0.5rem;
        }

        .usuario-online-item {
            padding: 0.25rem 0.5rem;
            font-size: 0.8rem;
        }
    }

    /* Scrollbar personalizado */
    .chat-messages::-webkit-scrollbar {
        width: 6px;
    }

    .chat-messages::-webkit-scrollbar-track {
        background: #f1f1f1;
    }

    .chat-messages::-webkit-scrollbar-thumb {
        background: #667eea;
        border-radius: 3px;
    }

    .chat-messages::-webkit-scrollbar-thumb:hover {
        background: #5a6fd8;
    }
</style>