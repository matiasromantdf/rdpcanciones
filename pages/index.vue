<template>
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <div class="text-center mb-4">
                    <h1 class="display-6 text-primary">
                        <i class="bi bi-music-note-beamed me-2"></i>
                        Alabanza RDP
                    </h1>
                </div>
            </div>
        </div>
        <div class="row mb-4 mt-1">

        </div>
        <div class="row text-center mt-5" v-if="!usuario">
            <div class="col-md-8 offset-md-2">
                <div class="card border-warning">
                    <div class="card-body">
                        <div class="d-flex align-items-center justify-content-center mb-3">
                            <i class="bi bi-exclamation-triangle-fill text-warning me-2" style="font-size: 1.5rem;"></i>
                            <h5 class="card-title mb-0">Estás en modo invitado</h5>
                        </div>
                        <p class="card-text text-muted mb-3">
                            Para acceder a los repertorios y funciones de Alabanza RDP,
                            necesitas iniciar sesión con tu cuenta.
                        </p>
                        <div class="text-center">
                            <nuxt-link to="/login" class="btn btn-primary btn-lg">
                                <i class="bi bi-box-arrow-in-right me-2"></i>
                                Iniciar Sesión
                            </nuxt-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="usuario && roles.length > 0">
            <!-- Bienvenida -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="welcome-card">
                        <div class="welcome-content">
                            <h2 class="welcome-title">
                                ¡Hola, {{ usuario?.user_metadata.full_name }}! 👋
                            </h2>
                            <p class="welcome-subtitle">
                                Bienvenido de vuelta a Alabanza RDP
                            </p>
                        </div>
                        <div class="welcome-actions">
                            <button @click="logout" class="btn btn-outline-primary">
                                <i class="bi bi-box-arrow-right me-2"></i>
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Reuniones próximas -->
            <div class="row mb-4" v-if="!cargandoReuniones">
                <div class="col-12">
                    <div class="reuniones-section">
                        <h4 class="section-title">
                            <i class="bi bi-calendar-event me-2"></i>
                            Próximas Reuniones
                        </h4>

                        <!-- Loading reuniones -->
                        <div v-if="cargandoReuniones" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Cargando reuniones...</span>
                            </div>
                        </div>

                        <!-- Sin reuniones -->
                        <div v-else-if="reunionesProximas.length === 0" class="no-reuniones">
                            <div class="text-center py-4">
                                <i class="bi bi-calendar-x text-muted" style="font-size: 2.5rem;"></i>
                                <h5 class="mt-3 text-muted">No hay reuniones próximas</h5>
                                <p class="text-muted mb-0">Cuando seas convocado a una reunión, aparecerá aquí</p>
                            </div>
                        </div>

                        <!-- Lista de reuniones -->
                        <div v-else>
                            <div v-for="reunion in reunionesProximas" :key="reunion.id" class="reunion-card-home">
                                <div class="reunion-header">
                                    <div class="reunion-icon">
                                        <i class="bi bi-calendar-event"></i>
                                    </div>
                                    <div class="reunion-info">
                                        <h5 class="reunion-titulo">{{ reunion.titulo }}</h5>
                                        <div class="reunion-datetime">
                                            <span class="fecha">
                                                <i class="bi bi-calendar3 me-1"></i>
                                                {{ formatearFecha(reunion.fecha, reunion.hora) }}
                                            </span>

                                        </div>
                                    </div>
                                    <div class="reunion-status">

                                    </div>
                                </div>

                                <div v-if="reunion.detalles" class="reunion-detalles">
                                    <p class="mb-0">
                                        <i class="bi bi-journal-text me-2"></i>
                                        {{ reunion.detalles }}
                                    </p>
                                </div>

                                <div class="reunion-footer">
                                    <!-- <div class="tiempo-restante">
                                        <i class="bi bi-hourglass-split me-1"></i>
                                        <span
                                            class="text-muted">{{ calcularTiempoRestante(reunion.fecha, reunion.hora) }}</span>
                                    </div> -->
                                    <div class="reunion-actions">
                                        <button class="btn btn-sm btn-primary" @click="irAlChat(reunion.id)"
                                            title="Chat de la reunión">
                                            <i class="bi bi-chat-dots me-1"></i>
                                            Chat
                                        </button>
                                        <button class="btn btn-sm btn-outline-info" @click="verDetallesReunion(reunion)"
                                            title="Ver más detalles">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Servicios próximos -->
            <div class="row mb-4" v-if="!cargandoServicios">
                <div class="col-12">
                    <div class="servicios-section">
                        <h4 class="section-title">
                            <i class="bi bi-music-note-list me-2"></i>
                            Próximos Servicios
                        </h4>

                        <!-- Loading servicios -->
                        <div v-if="cargandoServicios" class="text-center py-4">
                            <div class="spinner-border text-success" role="status">
                                <span class="visually-hidden">Cargando servicios...</span>
                            </div>
                        </div>

                        <!-- Sin servicios -->
                        <div v-else-if="serviciosProximos.length === 0" class="no-servicios">
                            <div class="text-center py-4">
                                <i class="bi bi-music-note text-muted" style="font-size: 2.5rem;"></i>
                                <h5 class="mt-3 text-muted">No hay servicios próximos</h5>
                                <p class="text-muted mb-0">Cuando seas asignado a un servicio, aparecerá aquí</p>
                            </div>
                        </div>

                        <!-- Lista de servicios -->
                        <div v-else>
                            <div v-for="servicio in serviciosProximos" :key="servicio.id" class="servicio-card-home">
                                <div class="servicio-header">
                                    <div class="servicio-icon">
                                        <i class="bi bi-bookmark-star"></i>
                                    </div>
                                    <div class="servicio-info">
                                        <h5 class="servicio-titulo">{{ servicio.titulo }}</h5>
                                        <div class="servicio-datetime">
                                            <span class="fecha">
                                                <i class="bi bi-calendar3 me-1"></i>
                                                {{ formatearFecha(servicio.fecha, servicio.hora) }}
                                            </span>
                                            <!-- <span class="hora">
                                                <i class="bi bi-clock me-1"></i>
                                                {{ servicio.hora }}
                                            </span> -->
                                        </div>
                                    </div>
                                    <div class="servicio-badge">
                                    </div>
                                </div>

                                <div v-if="servicio.detalles" class="servicio-detalles">
                                    <p class="mb-0">
                                        <i class="bi bi-journal-text me-2"></i>
                                        {{ servicio.detalles }}
                                    </p>
                                </div>

                                <div class="servicio-footer">
                                    <!-- <div class="tiempo-restante">
                                        <i class="bi bi-hourglass-split me-1"></i>
                                        <span
                                            class="text-muted">{{ calcularTiempoRestante(servicio.fecha, servicio.hora) }}</span>
                                    </div> -->
                                    <div class="servicio-actions">
                                        <button class="btn btn-sm btn-primary" @click="irAlChatServicio(servicio.id)"
                                            title="Chat del servicio">
                                            <i class="bi bi-chat-dots me-1"></i>
                                            Chat
                                        </button>
                                        <button class="btn btn-sm btn-outline-primary"
                                            @click="verDetallesServicio(servicio)" title="Ver más detalles">
                                            <i class="bi bi-eye me-1"></i>
                                            Detalles
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Enlaces rápidos -->
            <div class="row">
                <div class="col-12">
                    <div class="quick-links-section">
                        <h4 class="section-title">
                            <i class="bi bi-lightning me-2"></i>
                            Accesos Rápidos
                        </h4>
                        <div class="row">
                            <div class="col-md-3 col-sm-6 mb-3" v-if="tieneRol('voces')">
                                <nuxt-link to="/repertorio" class="quick-link-card">
                                    <div class="quick-link-icon bg-primary">
                                        <i class="bi bi-music-note-list"></i>
                                    </div>
                                    <div class="quick-link-content">
                                        <h6>Mi Repertorio</h6>
                                        <p class="text-muted mb-0">Gestiona tus canciones</p>
                                    </div>
                                </nuxt-link>
                            </div>
                            <div class="col-md-3 col-sm-6 mb-3">
                                <nuxt-link to="/canciones" class="quick-link-card">
                                    <div class="quick-link-icon bg-success">
                                        <i class="bi bi-music-note-beamed"></i>
                                    </div>
                                    <div class="quick-link-content">
                                        <h6>Canciones</h6>
                                        <p class="text-muted mb-0">Explora el catálogo</p>
                                    </div>
                                </nuxt-link>
                            </div>
                            <div class="col-md-3 col-sm-6 mb-3">
                                <nuxt-link to="/calendario" class="quick-link-card">
                                    <div class="quick-link-icon bg-warning">
                                        <i class="bi bi-calendar3"></i>
                                    </div>
                                    <div class="quick-link-content">
                                        <h6>Calendario</h6>
                                        <p class="text-muted mb-0">Ver eventos</p>
                                    </div>
                                </nuxt-link>
                            </div>
                            <div class="col-md-3 col-sm-6 mb-3" v-if="tieneRol('admin') || tieneRol('lider')">
                                <nuxt-link to="/reuniones" class="quick-link-card">
                                    <div class="quick-link-icon bg-info">
                                        <i class="bi bi-people"></i>
                                    </div>
                                    <div class="quick-link-content">
                                        <h6>Reuniones</h6>
                                        <p class="text-muted mb-0">Gestionar convocatorias</p>
                                    </div>
                                </nuxt-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row text-center" v-if="roles.length === 0 && usuario">
            <div class="col-md-6 offset-md-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Esta cuenta no posee roles asociados todavía, comunicate con el
                            administrador.</h5>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup>
    import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
    import { useRouter } from 'vue-router'
    import Swal from 'sweetalert2'

    const supabase = useSupabaseClient()
    const router = useRouter()

    // Estados reactivos
    const usuario = ref(useSupabaseUser())
    const roles = ref([])
    const reunionesProximas = ref([])
    const cargandoReuniones = ref(true)
    const serviciosProximos = ref([])
    const cargandoServicios = ref(true)
    const servicioModalActual = ref(null)

    // Obtener roles del usuario
    const getRolesUsuario = async () => {
        if (usuario.value) {
            const { data, error } = await supabase
                .from('roles_usuarios')
                .select('rol')
                .eq('user_id', usuario.value.id)

            if (error) {
                console.error('Error al obtener el rol:', error.message)
            } else {
                console.log('Roles:', data)
                roles.value = data
            }
        }
    }

    // Obtener reuniones donde el usuario está convocado
    const getReunionesProximas = async () => {
        if (!usuario.value) return

        try {
            cargandoReuniones.value = true

            // Obtener reuniones donde el usuario está convocado
            const { data: convocatorias, error } = await supabase
                .from('convocatorias_users')
                .select(`
                convocatorias (
                    id,
                    titulo,
                    fecha,
                    hora,
                    detalles
                )
            `)
                .eq('user_id', usuario.value.id)

            if (error) throw error

            // Filtrar reuniones de hoy hacia adelante y ordenar por fecha
            const ahora = new Date()
            const hoyInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())

            const reunionesFuturas = convocatorias
                .map(item => item.convocatorias)
                .filter(reunion => {
                    const fechaReunion = new Date(reunion.fecha + ' ' + reunion.hora)
                    // Incluir reuniones hasta 2 horas después de su inicio
                    return fechaReunion > ahora.getTime() - (2 * 60 * 60 * 1000) // 2 horas de margen
                })
                .sort((a, b) => {
                    const fechaA = new Date(a.fecha + ' ' + a.hora)
                    const fechaB = new Date(b.fecha + ' ' + b.hora)
                    return fechaA - fechaB
                })
                .slice(0, 3) // Mostrar máximo 3 reuniones próximas

            reunionesProximas.value = reunionesFuturas

        } catch (error) {
            console.error('Error obteniendo reuniones:', error)
        } finally {
            cargandoReuniones.value = false
        }
    }

    // Obtener servicios donde el usuario está asignado
    const getServiciosProximos = async () => {
        if (!usuario.value) return

        try {
            cargandoServicios.value = true

            // Obtener servicios donde el usuario está asignado
            const { data: serviciosData, error } = await supabase
                .from('servicios_usuarios')
                .select(`
                    servicios (
                        id,
                        titulo,
                        fecha,
                        hora,
                        detalles
                    )
                `)
                .eq('user_id', usuario.value.id)

            if (error) throw error

            // Filtrar servicios de hoy hacia adelante y ordenar por fecha
            const ahora = new Date()

            const serviciosFuturos = serviciosData
                .map(item => item.servicios)
                .filter(servicio => {
                    const fechaServicio = new Date(servicio.fecha + ' ' + servicio.hora)
                    // Incluir servicios hasta 2 horas después de su inicio
                    return fechaServicio > ahora.getTime() - (2 * 60 * 60 * 1000) // 2 horas de margen
                })
                .sort((a, b) => {
                    const fechaA = new Date(a.fecha + ' ' + a.hora)
                    const fechaB = new Date(b.fecha + ' ' + b.hora)
                    return fechaA - fechaB
                })
                .slice(0, 3) // Mostrar máximo 3 servicios próximos

            serviciosProximos.value = serviciosFuturos

        } catch (error) {
            console.error('Error obteniendo servicios:', error)
        } finally {
            cargandoServicios.value = false
        }
    }

    // Utilidades
    const tieneRol = (rol) => {
        return roles.value.some(r => r.rol === rol)
    }

    const formatearFecha = (fecha, hora = null) => {

        const date = new Date(fecha + 'T00:00:00')
        const opciones = { weekday: 'short', day: 'numeric', month: 'short' }
        return date.toLocaleDateString('es-ES', opciones) +
            (hora ? ` a las ${hora}` : '')

        // const hoy = new Date()
        // const manana = new Date(hoy)
        // manana.setDate(hoy.getDate() + 1)

        // // Comparar solo las fechas (sin hora)
        // const fechaSolo = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        // const hoySolo = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
        // const mananaSolo = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate())

        // // Si se proporciona hora, verificar las 12 horas para "Hoy"
        // if (fechaSolo.getTime() === hoySolo.getTime()) {
        //     if (hora) {
        //         // Calcular si faltan menos de 12 horas
        //         const fechaReunion = new Date(fecha + ' ' + hora)
        //         const diferencia = fechaReunion - hoy
        //         const totalHoras = Math.floor(diferencia / (1000 * 60 * 60))

        //         // Solo mostrar "Hoy" si faltan 12 horas o menos
        //         if (totalHoras <= 12 && diferencia > 0) {
        //             return 'Hoy'
        //         } else {
        //             // Si faltan más de 12 horas, mostrar fecha completa
        //             return date.toLocaleDateString('es-ES', {
        //                 weekday: 'long',
        //                 day: 'numeric',
        //                 month: 'long'
        //             })
        //         }
        //     } else {
        //         return 'Hoy'
        //     }
        // } else if (fechaSolo.getTime() === mananaSolo.getTime()) {
        //     return 'Mañana'
        // } else {
        //     return date.toLocaleDateString('es-ES', {
        //         weekday: 'long',
        //         day: 'numeric',
        //         month: 'long'
        //     })
        // }
    }

    const calcularTiempoRestante = (fecha, hora) => {
        const fechaReunion = new Date(fecha + ' ' + hora)
        const ahora = new Date()
        const diferencia = fechaReunion - ahora

        // Si la diferencia es menor a -2 horas, considerarla pasada
        if (diferencia < -2 * 60 * 60 * 1000) return 'Reunión pasada'

        // Si la diferencia está entre -2 horas y 0, está en curso o recién terminada
        if (diferencia <= 0) {
            const horasPasadas = Math.abs(Math.floor(diferencia / (1000 * 60 * 60)))
            if (horasPasadas === 0) {
                return 'En curso'
            } else {
                return `Terminó hace ${horasPasadas} hora${horasPasadas > 1 ? 's' : ''}`
            }
        }

        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60))
        const totalHoras = Math.floor(diferencia / (1000 * 60 * 60))

        if (dias > 0) {
            return `En ${dias} día${dias > 1 ? 's' : ''}`
        } else if (totalHoras > 12) {
            // Si faltan más de 12 horas, mostrar horas totales
            return `En ${totalHoras} horas`
        } else if (horas > 0) {
            // Solo mostrar "hoy" cuando falten 12 horas o menos
            return `Hoy en ${horas} hora${horas > 1 ? 's' : ''}`
        } else if (minutos > 5) {
            return `Hoy en ${minutos} minutos`
        } else if (minutos > 0) {
            return `¡Muy pronto! (${minutos} min)`
        } else {
            return '¡Ahora mismo!'
        }
    }    // Acciones de reuniones
    const irAlChat = (reunionId) => {
        // Navegar a la página de chat de la reunión
        router.push(`/chat-reunion/${reunionId}`)
    }

    const irAlChatServicio = (servicioId) => {
        // Navegar a la página de chat del servicio
        router.push(`/chat-servicio/${servicioId}`)
    }

    // Navegación a canción desde modal
    const verCancionDesdeModal = (cancionId) => {
        // Guardar el estado actual con información del modal (solo datos básicos serializables)
        const currentState = {
            modalOpen: true,
            modalType: 'detalles-servicio',
            servicioData: {
                id: servicioModalActual.value.id,
                titulo: servicioModalActual.value.titulo,
                fecha: servicioModalActual.value.fecha,
                hora: servicioModalActual.value.hora,
                detalles: servicioModalActual.value.detalles
            }
        }

        // Reemplazar el estado actual en el historial
        console.log('Guardando estado:', currentState) // Debug
        window.history.replaceState(currentState, '')

        // Cerrar el modal de SweetAlert2
        Swal.close()

        // Navegar a la canción después de un pequeño delay
        setTimeout(() => {
            router.push(`/ver-cancion/${cancionId}`)
        }, 100)
    }

    const verDetallesReunion = async (reunion) => {
        try {
            // Obtener lista de todos los convocados
            const { data: participantes, error } = await supabase
                .from('convocatorias_users')
                .select(`
                usuarios(email, raw_user_meta_data)
            `)
                .eq('convocatoria_id', reunion.id)

            if (error) throw error

            const listaParticipantes = participantes
                .map(p => p.usuarios.raw_user_meta_data?.full_name || p.usuarios.email)
                .join(', ')

            await Swal.fire({
                title: reunion.titulo,
                html: `
                <div class="text-start">
                    <p><strong>📅 Fecha:</strong> ${formatearFecha(reunion.fecha)}</p>
                    <p><strong>🕐 Hora:</strong> ${reunion.hora}</p>
                    ${reunion.detalles ? `<p><strong>📝 Detalles:</strong> ${reunion.detalles}</p>` : ''}
                    <p><strong>👥 Otros convocados (${participantes.length - 1}):</strong></p>
                    <p class="small">${listaParticipantes}</p>
                </div>
            `,
                icon: 'info',
                showCloseButton: true,
                confirmButtonText: 'Entendido'
            })
        } catch (error) {
            console.error('Error obteniendo detalles:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los detalles de la reunión',
                icon: 'error'
            })
        }
    }

    const verDetallesServicio = async (servicio) => {
        try {
            // Guardar servicio actual para posible reapertura del modal
            servicioModalActual.value = servicio

            // Obtener lista de todos los participantes del servicio
            const { data: participantes, error } = await supabase
                .from('servicios_usuarios')
                .select(`
                usuarios(email, raw_user_meta_data)
            `)
                .eq('servicio_id', servicio.id)

            if (error) throw error

            // Obtener canciones del servicio con quien las agregó
            const { data: canciones, error: errorCanciones } = await supabase
                .from('servicios_canciones')
                .select(`
                    *,
                    canciones (
                        titulo
                    ),
                    usuarios:agregado_por (
                        email,
                        raw_user_meta_data
                    )
                `)
                .eq('servicio_id', servicio.id)
                .order('orden', { ascending: true })

            if (errorCanciones) throw errorCanciones

            const listaParticipantes = participantes
                .map(p => p.usuarios.raw_user_meta_data?.full_name || p.usuarios.email)
                .join(', ')

            // Crear lista de canciones con quien las agregó
            let cancionesHtml = ''
            if (canciones && canciones.length > 0) {
                cancionesHtml = canciones.map((cancion, index) => {
                    const nombreUsuario = cancion.usuarios?.raw_user_meta_data?.full_name || cancion.usuarios?.email || 'Usuario desconocido'
                    const tono = cancion.tono ? ` (${cancion.tono})` : ''
                    return `${index + 1}. <button onclick="window.verCancionDesdeModal(${cancion.cancion_id})" class="btn-link text-decoration-none text-primary border-0 bg-transparent p-0">${cancion.canciones.titulo} <i class="bi bi-arrow-right" style="font-size: 0.8em;"></i></button>${tono} - <small class="text-success">${nombreUsuario}</small>`
                }).join('<br>')
            }

            await Swal.fire({
                title: servicio.titulo,
                html: `
                <div class="text-start">
                    <p><strong>📅 Fecha:</strong> ${formatearFecha(servicio.fecha)}</p>
                    <p><strong>🕐 Hora:</strong> ${servicio.hora}</p>
                    ${servicio.detalles ? `<p><strong>📝 Detalles:</strong> ${servicio.detalles}</p>` : ''}
                    <p><strong>🎵 Integrantes (${participantes.length}):</strong></p>
                    <p class="small">${listaParticipantes}</p>
                    ${cancionesHtml ? `
                        <hr>
                        <p><strong>🎼 Canciones del servicio (${canciones.length}):</strong></p>
                        <div class="small" style="max-height: 200px; overflow-y: auto;">${cancionesHtml}</div>
                    ` : ''}
                </div>
            `,
                showCloseButton: true,
                confirmButtonText: 'Entendido',
                width: '600px'
            })
        } catch (error) {
            console.error('Error obteniendo detalles del servicio:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los detalles del servicio',
                icon: 'error'
            })
        }
    }

    // Logout
    const logout = async () => {
        const { error } = await supabase.auth.signOut()

        if (error) {
            console.error('Error al cerrar sesión:', error.message)
        } else {
            console.log('Sesión cerrada')
            router.push('/login')
        }
    }

    // Redirección OAuth
    const redirect = () => {
        let originUrl = localStorage.getItem('originUrl')
        let url = window.location.href

        if (url.includes('?code=')) {
            if (originUrl && originUrl !== url) {
                window.location.href = originUrl
            } else {
                router.push('/')
            }
        }
    }

    // Watchers
    watch(usuario, (newUser) => {
        if (newUser) {
            getRolesUsuario()
            getReunionesProximas()
            getServiciosProximos()
        }
    }, { immediate: true })

    // Lifecycle
    onMounted(() => {
        redirect()

        // Exponer función globalmente para uso en modales
        window.verCancionDesdeModal = verCancionDesdeModal

        // Escuchar el evento popstate para reabrir modal al hacer "volver"
        const handlePopstate = (event) => {
            console.log('Popstate event:', event.state) // Debug
            if (event.state?.modalOpen && event.state?.modalType === 'detalles-servicio' && event.state?.servicioData) {
                console.log('Reabriendo modal de servicio:', event.state.servicioData) // Debug
                // Reabrir el modal de detalles del servicio
                nextTick(() => {
                    verDetallesServicio(event.state.servicioData)
                })
            }
        }

        window.addEventListener('popstate', handlePopstate)

        // Limpiar listener al desmontar componente
        onUnmounted(() => {
            window.removeEventListener('popstate', handlePopstate)
        })

        if (usuario.value) {
            getRolesUsuario()
            getReunionesProximas()
            getServiciosProximos()
        }
    })
</script>

<style scoped>
    .welcome-card {
        color: rgb(7, 7, 7);
        border-radius: 15px;
        padding: 2rem;
        margin-bottom: 2rem;
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .welcome-title {
        font-size: 1.75rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .welcome-subtitle {
        font-size: 1.1rem;
        opacity: 0.9;
        margin-bottom: 0;
    }

    .welcome-actions .btn {
        border: 2px solid rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(10px);
    }

    .welcome-actions .btn:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.5);
    }

    .reuniones-section,
    .quick-links-section {
        border-radius: 15px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .section-title {
        color: #2c3e50;
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
        border-bottom: 2px solid #343b42;
        padding-bottom: 0.5rem;
    }

    .reunion-card-home {
        background: linear-gradient(145deg, #f8f9fa, #ffffff);
        border: 1px solid #e9ecef;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        transition: all 0.3s ease;
        position: relative;
    }

    .reunion-card-home:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: #667eea;
    }

    .reunion-card-home:last-child {
        margin-bottom: 0;
    }

    .reunion-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 1rem;
    }

    .reunion-icon {
        width: 50px;
        height: 50px;
        background-color: #dcdde4;
        color: rgb(44, 43, 43);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        margin-right: 1rem;
        flex-shrink: 0;
    }

    .reunion-info {
        flex-grow: 1;
    }

    .reunion-titulo {
        color: #2c3e50;
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .reunion-datetime {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .reunion-datetime .fecha,
    .reunion-datetime .hora {
        display: flex;
        align-items: center;
        color: #6c757d;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .reunion-status {
        flex-shrink: 0;
    }

    .reunion-status .badge {
        font-size: 0.8rem;
        padding: 0.5rem 0.75rem;
    }

    .reunion-detalles {
        background: #f8f9fa;
        border-radius: 0px 8px 8px 0px;
        padding: 1rem;
        margin-bottom: 1rem;
        border-left: 4px solid #667eea;
    }

    .reunion-detalles p {
        color: #5a6c7d;
        font-size: 0.9rem;
        line-height: 1.5;
    }

    .reunion-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 1rem;
        border-top: 1px solid #e9ecef;
    }

    .tiempo-restante {
        display: flex;
        align-items: center;
        color: #6c757d;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .reunion-actions {
        display: flex;
        gap: 0.5rem;
    }

    .reunion-actions .btn {
        border-radius: 6px;
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
    }

    .no-reuniones {
        background: #f8f9fa;
        border-radius: 12px;
        border: 2px dashed #dee2e6;
    }

    /* Estilos para servicios - Diferenciados con paleta verde */
    .servicios-section {
        border-radius: 15px;
        padding: 1.5rem;
        margin-bottom: 1rem;
    }

    .servicio-card-home {
        background: linear-gradient(145deg, #8997df49, #a582af5e);
        border: 1px solid #180d49;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        transition: all 0.3s ease;
        position: relative;
    }

    .servicio-card-home:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(40, 167, 69, 0.15);
        border-color: #2850a7;
    }

    .servicio-card-home:last-child {
        margin-bottom: 0;
    }

    .servicio-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 1rem;
    }

    .servicio-icon {
        width: 50px;
        height: 50px;
        background: linear-gradient(45deg, #7828a7, #3f33ac);
        color: white;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        margin-right: 1rem;
        flex-shrink: 0;
    }

    .servicio-info {
        flex-grow: 1;
    }

    .servicio-titulo {
        color: #292c2a;
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .servicio-datetime {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .servicio-datetime .fecha,
    .servicio-datetime .hora {
        display: flex;
        align-items: center;
        color: #6c757d;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .servicio-badge {
        flex-shrink: 0;
    }

    .servicio-badge .badge {
        font-size: 0.8rem;
        padding: 0.5rem 0.75rem;
    }

    .servicio-detalles {

        background: #fdfdfd54;

        border-radius: 0px 8px 8px 0px;
        padding: 1rem;
        margin-bottom: 1rem;
        border-left: 4px solid #6328a7;
    }

    .servicio-detalles p {
        color: #070635;
        font-size: 0.9rem;
        line-height: 1.5;
    }

    .servicio-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 1rem;
        border-top: 1px solid #d4edda;
    }

    .servicio-actions {
        display: flex;
        gap: 0.5rem;
    }

    .servicio-actions .btn {
        border-radius: 6px;
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
    }

    .no-servicios {
        background: #f8fff8;
        border-radius: 12px;
        border: 2px dashed #d4edda;
    }

    .quick-link-card {
        display: block;
        background: white;
        border: 1px solid #e9ecef;
        border-radius: 12px;
        padding: 1.25rem;
        text-decoration: none;
        transition: all 0.3s ease;
        height: 100%;
    }

    .quick-link-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        text-decoration: none;
        border-color: #667eea;
    }

    .quick-link-icon {
        width: 50px;
        height: 50px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.25rem;
        margin-bottom: 1rem;
    }

    .quick-link-content h6 {
        color: #2c3e50;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .quick-link-content p {
        color: #6c757d;
        font-size: 0.85rem;
        line-height: 1.4;
    }

    /* Estados de carga */
    .spinner-border {
        width: 2rem;
        height: 2rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .welcome-card {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
        }

        .welcome-actions {
            width: 100%;
        }

        .reunion-header,
        .servicio-header {
            flex-direction: column;
            text-align: center;
        }

        .reunion-icon,
        .servicio-icon {
            margin: 0 auto 1rem auto;
        }

        .reunion-datetime,
        .servicio-datetime {
            justify-content: center;
        }

        .reunion-footer,
        .servicio-footer {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }

        .reunion-actions,
        .servicio-actions {
            justify-content: center;
        }

        .section-title {
            text-align: center;
        }
    }

    @media (max-width: 576px) {

        .reuniones-section,
        .servicios-section,
        .quick-links-section {
            padding: 1rem;
            margin-left: 0.5rem;
            margin-right: 0.5rem;
        }

        .welcome-card {
            margin-left: 0.5rem;
            margin-right: 0.5rem;
        }

        .reunion-card-home,
        .servicio-card-home {
            padding: 1rem;
        }
    }

    /* Animaciones */
    .reunion-card-home,
    .quick-link-card {
        animation: fadeInUp 0.6s ease-out;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Badges personalizados */
    .badge.bg-success {
        background: linear-gradient(45deg, #28a745, #20c997) !important;
    }

    .badge.bg-primary {
        background: linear-gradient(45deg, #007bff, #6f42c1) !important;
    }

    .badge.bg-info {
        background: linear-gradient(45deg, #17a2b8, #6f42c1) !important;
    }

    .badge.bg-warning {
        background: linear-gradient(45deg, #ffc107, #fd7e14) !important;
    }

    /* Estilos para botones que actúan como enlaces */
    .btn-link {
        font-size: inherit;
        line-height: inherit;
        cursor: pointer;
        transition: color 0.2s ease;
    }

    .btn-link:hover {
        text-decoration: underline !important;
    }

    .btn-link:focus {
        box-shadow: none;
        outline: 2px solid #007bff;
        outline-offset: 2px;
    }
</style>