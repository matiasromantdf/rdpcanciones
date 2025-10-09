<template>
    <div class="container-fluid">
        <!-- Header -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="header-section">
                    <h1 class="display-5 text-white mb-2">
                        <i class="bi bi-music-note-list me-3"></i>
                        Gestión de Servicios
                    </h1>
                    <p class="lead text-white-50">
                        Organiza servicios musicales con integrantes y repertorios
                    </p>
                </div>
            </div>
        </div>

        <!-- Botón para nuevo servicio -->
        <div class="row mb-4">
            <div class="col-12">
                <button class="btn btn-primary btn-lg" @click="toggleFormulario">
                    <i class="bi bi-plus-circle me-2"></i>
                    {{ mostrarFormulario ? 'Ocultar Formulario' : 'Nuevo Servicio' }}
                </button>
            </div>
        </div>

        <!-- Formulario para crear/editar servicio -->
        <div class="row mb-4" v-if="mostrarFormulario">
            <div class="col-12">
                <div class="servicio-form-card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h4 class="mb-0">
                            <i
                                :class="editandoServicio ? 'bi bi-pencil-square me-2' : 'bi bi-music-note-beamed me-2'"></i>
                            {{ editandoServicio ? 'Editar Servicio' : 'Crear Nuevo Servicio' }}
                        </h4>
                        <button v-if="editandoServicio" class="btn btn-outline-secondary btn-sm"
                            @click="cancelarEdicion">
                            <i class="bi bi-x-lg me-2"></i>
                            Cancelar Edición
                        </button>
                    </div>
                    <div class="card-body">
                        <!-- Información básica -->
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <label class="form-label fw-bold">
                                    <i class="bi bi-card-text me-2"></i>Título del servicio
                                </label>
                                <input type="text" class="form-control form-control-lg" placeholder="Ej: Culto Domingo."
                                    v-model="nuevoServicio.titulo" />
                            </div>
                            <div class="col-md-3">
                                <label class="form-label fw-bold">
                                    <i class="bi bi-calendar3 me-2"></i>Fecha
                                </label>
                                <input type="date" class="form-control form-control-lg" v-model="nuevoServicio.fecha" />
                            </div>
                            <div class="col-md-3">
                                <label class="form-label fw-bold">
                                    <i class="bi bi-clock me-2"></i>Hora
                                </label>
                                <input type="time" class="form-control form-control-lg" v-model="nuevoServicio.hora" />
                            </div>
                        </div>

                        <!-- Detalles adicionales -->
                        <div class="row mb-4">
                            <div class="col-12">
                                <label class="form-label fw-bold">
                                    <i class="bi bi-journal-text me-2"></i>Detalles adicionales
                                </label>
                                <textarea class="form-control" rows="3"
                                    placeholder="Información adicional sobre el servicio..."
                                    v-model="nuevoServicio.detalles"></textarea>
                            </div>
                        </div>

                        <!-- Selección de participantes -->
                        <div class="participantes-section">
                            <h5 class="section-title">
                                <i class="bi bi-people me-2"></i>
                                Seleccionar Integrantes
                            </h5>

                            <!-- Tabs para grupos e individuos -->
                            <ul class="nav nav-tabs mb-3" role="tablist">
                                <li class="nav-item">
                                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#grupos-tab">
                                        <i class="bi bi-collection me-2"></i>Por Grupos
                                    </button>
                                </li>
                                <li class="nav-item">
                                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#individuales-tab">
                                        <i class="bi bi-person me-2"></i>Individuales
                                    </button>
                                </li>
                            </ul>

                            <div class="tab-content">
                                <!-- Tab de grupos -->
                                <div class="tab-pane fade show active" id="grupos-tab">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <h6 class="text-muted mb-3">Grupos Disponibles</h6>
                                            <div class="grupos-list">
                                                <div v-for="grupo in roles" :key="grupo.id" class="grupo-item"
                                                    :class="{ 'selected': gruposSeleccionados.some(g => g.id === grupo.id) }"
                                                    @click="toggleGrupo(grupo)">
                                                    <div class="grupo-info">
                                                        <i class="bi bi-collection me-2"></i>
                                                        <strong>{{ grupo.rol }}</strong>
                                                        <span class="grupo-count">
                                                            ({{ contarIntegrantes(grupo.id) }} integrantes)
                                                        </span>
                                                    </div>
                                                    <div class="grupo-checkbox">
                                                        <i class="bi bi-check-lg"
                                                            v-if="gruposSeleccionados.some(g => g.id === grupo.id)"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <h6 class="text-muted mb-3">Grupos Seleccionados</h6>
                                            <div class="grupos-seleccionados">
                                                <div v-if="gruposSeleccionados.length === 0" class="empty-state">
                                                    <i class="bi bi-collection text-muted"></i>
                                                    <p class="text-muted">No hay grupos seleccionados</p>
                                                </div>
                                                <div v-else>
                                                    <div v-for="grupo in gruposSeleccionados" :key="grupo.id"
                                                        class="grupo-seleccionado">
                                                        <div class="grupo-info">
                                                            <i class="bi bi-collection me-2"></i>
                                                            <strong>{{ grupo.rol }}</strong>
                                                            <span class="grupo-count">
                                                                ({{ contarIntegrantes(grupo.id) }} integrantes)
                                                            </span>
                                                        </div>
                                                        <button class="btn btn-sm btn-outline-danger"
                                                            @click="quitarGrupo(grupo.id)">
                                                            <i class="bi bi-x-lg"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Tab de individuales -->
                                <div class="tab-pane fade" id="individuales-tab">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <input type="text" class="form-control" placeholder="Buscar usuario..."
                                                    v-model="filtroUsuarios">
                                            </div>
                                            <h6 class="text-muted mb-3">Usuarios Disponibles</h6>
                                            <div class="usuarios-list">
                                                <div v-for="usuario in usuariosFiltrados" :key="usuario.id"
                                                    class="usuario-item"
                                                    :class="{ 'selected': integrantesIndividuales.some(u => u.id === usuario.id) }"
                                                    @click="toggleUsuario(usuario)">
                                                    <div class="user-info">
                                                        <div class="user-avatar">
                                                            <img v-if="usuario.raw_user_meta_data?.avatar_url"
                                                                :src="usuario.raw_user_meta_data.avatar_url"
                                                                :alt="usuario.raw_user_meta_data?.full_name"
                                                                class="avatar-img">
                                                            <div v-else class="avatar-placeholder">
                                                                <i class="bi bi-person-fill"></i>
                                                            </div>
                                                        </div>
                                                        <div class="user-details">
                                                            <strong>{{ usuario.raw_user_meta_data?.full_name || usuario.email }}</strong>
                                                            <small
                                                                class="text-muted d-block">{{ usuario.email }}</small>
                                                        </div>
                                                    </div>
                                                    <div class="usuario-checkbox">
                                                        <i class="bi bi-check-lg"
                                                            v-if="integrantesIndividuales.some(u => u.id === usuario.id)"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <h6 class="text-muted mb-3">Integrantes Seleccionados</h6>
                                            <div class="integrantes-seleccionados">
                                                <div v-if="integrantesIndividuales.length === 0" class="empty-state">
                                                    <i class="bi bi-person text-muted"></i>
                                                    <p class="text-muted">No hay integrantes seleccionados</p>
                                                </div>
                                                <div v-else>
                                                    <div v-for="integrante in integrantesIndividuales"
                                                        :key="integrante.id" class="integrante-seleccionado">
                                                        <div class="user-info">
                                                            <div class="user-avatar-sm">
                                                                <img v-if="integrante.raw_user_meta_data?.avatar_url"
                                                                    :src="integrante.raw_user_meta_data.avatar_url"
                                                                    :alt="integrante.raw_user_meta_data?.full_name"
                                                                    class="avatar-img-sm">
                                                                <div v-else class="avatar-placeholder-sm">
                                                                    <i class="bi bi-person-fill"></i>
                                                                </div>
                                                            </div>
                                                            <div class="user-details">
                                                                <strong>{{ integrante.raw_user_meta_data?.full_name }}</strong>
                                                                <small
                                                                    class="text-muted d-block">{{ integrante.email }}</small>
                                                            </div>
                                                        </div>
                                                        <button class="btn btn-sm btn-outline-danger"
                                                            @click="quitarIntegrante(integrante.id)">
                                                            <i class="bi bi-x-lg"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Resumen y acciones -->
                        <div class="resumen-section">
                            <div class="row align-items-center">
                                <div class="col-md-8">
                                    <div class="stats-grid">
                                        <div class="stat-item">
                                            <i class="bi bi-people-fill text-primary"></i>
                                            <span class="stat-number">{{ totalIntegrantes }}</span>
                                            <span class="stat-label">Total Integrantes</span>
                                        </div>
                                        <div class="stat-item">
                                            <i class="bi bi-collection-fill text-success"></i>
                                            <span class="stat-number">{{ gruposSeleccionados.length }}</span>
                                            <span class="stat-label">Grupos</span>
                                        </div>
                                        <div class="stat-item">
                                            <i class="bi bi-person-fill text-info"></i>
                                            <span class="stat-number">{{ integrantesIndividuales.length }}</span>
                                            <span class="stat-label">Individuales</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 text-end">
                                    <button type="button" class="btn btn-secondary me-2" @click="limpiarFormulario">
                                        <i class="bi bi-arrow-clockwise me-2"></i>
                                        Limpiar
                                    </button>
                                    <button type="button"
                                        :class="editandoServicio ? 'btn btn-warning' : 'btn btn-success'"
                                        @click="editandoServicio ? actualizarServicio() : crearServicio()"
                                        :disabled="!puedeCrearServicio || creandoServicio">
                                        <span v-if="creandoServicio"
                                            class="spinner-border spinner-border-sm me-2"></span>
                                        <i v-else
                                            :class="editandoServicio ? 'bi bi-check-lg me-2' : 'bi bi-send me-2'"></i>
                                        {{ creandoServicio ? (editandoServicio ? 'Actualizando...' : 'Creando...') : (editandoServicio ? 'Actualizar Servicio' : 'Crear Servicio') }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Lista de servicios existentes -->
        <div class="row" v-if="!loading">
            <div class="col-12">
                <div class="servicios-existentes">
                    <h4 class="mb-4">
                        <i class="bi bi-list-ul me-2"></i>
                        Servicios Programados ({{ servicios.length }})
                    </h4>

                    <div v-if="servicios.length === 0" class="empty-state-large">
                        <i class="bi bi-music-note-list"></i>
                        <h5>No hay servicios programados</h5>
                        <p class="text-muted">Crea tu primer servicio para comenzar</p>
                    </div>

                    <div class="servicio-card" v-for="servicio in servicios" :key="servicio.id"
                        :class="{ 'editando': servicioEditando?.id === servicio.id }">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <div class="servicio-info">
                                    <h5 class="servicio-titulo">
                                        <i class="bi bi-music-note-beamed me-2"></i>
                                        {{ servicio.titulo }}
                                        <span v-if="servicioEditando?.id === servicio.id" class="badge bg-warning ms-2">
                                            <i class="bi bi-pencil me-1"></i>
                                            Editando
                                        </span>
                                    </h5>
                                    <div class="servicio-datetime">
                                        <span class="badge bg-primary me-2">
                                            <i class="bi bi-calendar3 me-1"></i>
                                            {{ formatearFecha(servicio.fecha) }}
                                        </span>
                                        <span class="badge bg-info me-2">
                                            <i class="bi bi-clock me-1"></i>
                                            {{ servicio.hora }}
                                        </span>
                                        <span class="badge bg-secondary">
                                            <i class="bi bi-people me-1"></i>
                                            {{ contarParticipantes(servicio.id) }} integrantes
                                        </span>
                                    </div>
                                    <p v-if="servicio.detalles" class="servicio-detalles">
                                        {{ servicio.detalles }}
                                    </p>
                                </div>
                            </div>
                            <div class="col-md-4 text-end">
                                <div class="servicio-actions">
                                    <button class="btn btn-outline-primary btn-sm me-2"
                                        @click="verDetalleServicio(servicio)" title="Ver detalles">
                                        <i class="bi bi-eye"></i>
                                    </button>
                                    <button class="btn btn-outline-success btn-sm me-2"
                                        @click="gestionarRepertorio(servicio)" title="Gestionar repertorio">
                                        <i class="bi bi-music-note-list"></i>
                                    </button>
                                    <button class="btn btn-outline-warning btn-sm me-2"
                                        @click="editarServicio(servicio)" title="Editar">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm" @click="eliminarServicio(servicio.id)"
                                        title="Eliminar">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading state -->
        <div class="row" v-if="loading">
            <div class="col-12 text-center">
                <div class="loading-container">
                    <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
                    <p class="mt-3 text-muted">Cargando servicios...</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { onMounted, ref, computed } from 'vue'
    import { useSupabase } from '~/composables/useSupabase'
    import { useRouter } from 'vue-router'
    import Swal from 'sweetalert2'

    const { supabase, hasRole, usuario } = useSupabase()
    const router = useRouter()

    // Estados reactivos
    const loading = ref(true)
    const creandoServicio = ref(false)
    const mostrarFormulario = ref(false)
    const editandoServicio = ref(false)
    const servicioEditando = ref(null)
    const servicios = ref([])
    const users = ref([])
    const roles = ref([])
    const rolesUsuarios = ref([])
    const serviciosUsuarios = ref([])
    const usuarioCasaId = ref(null)

    // Formulario de nuevo servicio
    const nuevoServicio = ref({
        titulo: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '19:00',
        detalles: ''
    })

    // Selección de participantes
    const gruposSeleccionados = ref([])
    const integrantesIndividuales = ref([])
    const filtroUsuarios = ref('')

    // Computadas
    const usuariosFiltrados = computed(() => {
        if (!filtroUsuarios.value) return users.value

        const filtro = filtroUsuarios.value.toLowerCase()
        return users.value.filter(user => {
            const nombre = user.raw_user_meta_data?.full_name?.toLowerCase() || ''
            const email = user.email.toLowerCase()
            return nombre.includes(filtro) || email.includes(filtro)
        })
    })

    const totalIntegrantes = computed(() => {
        let total = integrantesIndividuales.value.length

        gruposSeleccionados.value.forEach(grupo => {
            total += contarIntegrantes(grupo.id)
        })

        return total
    })

    const puedeCrearServicio = computed(() => {
        return nuevoServicio.value.titulo.trim() !== '' &&
            nuevoServicio.value.fecha !== '' &&
            nuevoServicio.value.hora !== '' &&
            totalIntegrantes.value > 0
    })

    // Métodos de carga
    const cargarDatos = async () => {
        try {
            loading.value = true

            // Obtener casa_id del usuario actual
            if (usuario.value) {
                const { data: usuarioData, error: usuarioError } = await supabase
                    .from('usuarios')
                    .select('casa_id')
                    .eq('id', usuario.value.id)
                    .single()

                if (usuarioError) throw usuarioError
                usuarioCasaId.value = usuarioData.casa_id
            }

            // Cargar servicios
            const { data: serviciosData, error: serviciosError } = await supabase
                .from('servicios')
                .select('*')
                .order('fecha', { ascending: false })

            if (serviciosError) throw serviciosError

            // Cargar usuarios
            const { data: usuariosData, error: usuariosError } = await supabase
                .from('usuarios')
                .select('id, email, raw_user_meta_data')
                .order('email')

            if (usuariosError) throw usuariosError

            // Cargar roles
            const { data: rolesData, error: rolesError } = await supabase
                .from('roles')
                .select('*')
                .order('rol')

            if (rolesError) throw rolesError

            // Cargar roles_usuarios
            const { data: rolesUsuariosData, error: rolesUsuariosError } = await supabase
                .from('roles_usuarios')
                .select('*')

            if (rolesUsuariosError) throw rolesUsuariosError

            // Cargar información adicional de usuarios para obtener casa_id
            const { data: usuariosConCasa, error: usuariosConCasaError } = await supabase
                .from('usuarios')
                .select('id, casa_id, raw_user_meta_data')

            if (usuariosConCasaError) throw usuariosConCasaError

            // Combinar datos de roles_usuarios con información de casa_id
            const rolesUsuariosConCasa = rolesUsuariosData.map(ru => {
                const usuarioInfo = usuariosConCasa.find(u => u.id === ru.user_id)
                return {
                    ...ru,
                    usuarios: usuarioInfo || { casa_id: null, raw_user_meta_data: null }
                }
            })

            // Cargar servicios_usuarios
            const { data: serviciosUsuariosData, error: serviciosUsuariosError } = await supabase
                .from('servicios_usuarios')
                .select('*')

            if (serviciosUsuariosError) throw serviciosUsuariosError

            servicios.value = serviciosData || []
            users.value = usuariosData || []
            roles.value = rolesData || []
            rolesUsuarios.value = rolesUsuariosConCasa || []
            serviciosUsuarios.value = serviciosUsuariosData || []

        } catch (error) {
            console.error('Error cargando datos:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los datos. Intenta recargar la página.',
                icon: 'error'
            })
        } finally {
            loading.value = false
        }
    }

    // Métodos de gestión de participantes
    const contarIntegrantes = (rolId) => {
        // Buscar el rol por ID para obtener su nombre
        const rol = roles.value.find(r => r.id === rolId)
        if (!rol) return 0

        // Contar usuarios que tienen ese rol y pertenecen a la misma casa
        return rolesUsuarios.value.filter(ru => 
            ru.rol === rol.rol && ru.usuarios.casa_id === usuarioCasaId.value
        ).length
    }

    const contarParticipantes = (servicioId) => {
        return serviciosUsuarios.value.filter(su => su.servicio_id === servicioId).length
    }

    const toggleGrupo = (grupo) => {
        const index = gruposSeleccionados.value.findIndex(g => g.id === grupo.id)
        if (index > -1) {
            gruposSeleccionados.value.splice(index, 1)
        } else {
            gruposSeleccionados.value.push(grupo)
        }
    }

    const quitarGrupo = (grupoId) => {
        gruposSeleccionados.value = gruposSeleccionados.value.filter(g => g.id !== grupoId)
    }

    const toggleUsuario = (usuario) => {
        const index = integrantesIndividuales.value.findIndex(u => u.id === usuario.id)
        if (index > -1) {
            integrantesIndividuales.value.splice(index, 1)
        } else {
            integrantesIndividuales.value.push(usuario)
        }
    }

    const quitarIntegrante = (usuarioId) => {
        integrantesIndividuales.value = integrantesIndividuales.value.filter(u => u.id !== usuarioId)
    }

    // Métodos de formulario
    const toggleFormulario = () => {
        if (editandoServicio.value) {
            cancelarEdicion()
        } else {
            mostrarFormulario.value = !mostrarFormulario.value
            if (!mostrarFormulario.value) {
                limpiarFormulario()
            }
        }
    }

    const limpiarFormulario = () => {
        nuevoServicio.value = {
            titulo: '',
            fecha: new Date().toISOString().split('T')[0],
            hora: '10:00',
            detalles: ''
        }
        gruposSeleccionados.value = []
        integrantesIndividuales.value = []
        filtroUsuarios.value = ''
    }

    // CRUD de servicios
    const crearServicio = async () => {
        try {
            creandoServicio.value = true

            // Crear el servicio
            const { data: nuevoServicioData, error: servicioError } = await supabase
                .from('servicios')
                .insert({
                    titulo: nuevoServicio.value.titulo,
                    fecha: nuevoServicio.value.fecha,
                    hora: nuevoServicio.value.hora,
                    detalles: nuevoServicio.value.detalles
                })
                .select()
                .single()

            if (servicioError) throw servicioError

            // Obtener todos los usuarios a agregar
            const usuariosAAgregar = new Set()

            // Agregar usuarios de grupos seleccionados
            gruposSeleccionados.value.forEach(grupo => {
                const usuariosDelGrupo = rolesUsuarios.value
                    .filter(ru => ru.rol === grupo.rol && ru.usuarios.casa_id === usuarioCasaId.value)
                    .map(ru => ru.user_id)
                usuariosDelGrupo.forEach(userId => usuariosAAgregar.add(userId))
            })

            // Agregar usuarios individuales
            integrantesIndividuales.value.forEach(usuario => {
                usuariosAAgregar.add(usuario.id)
            })

            // Insertar participantes del servicio
            if (usuariosAAgregar.size > 0) {
                const serviciosUsers = Array.from(usuariosAAgregar).map(userId => ({
                    servicio_id: nuevoServicioData.id,
                    user_id: userId
                }))

                const { error: usuariosError } = await supabase
                    .from('servicios_usuarios')
                    .insert(serviciosUsers)

                if (usuariosError) throw usuariosError
            }

            await Swal.fire({
                title: '¡Servicio creado!',
                text: `Se ha creado "${nuevoServicio.value.titulo}" con ${usuariosAAgregar.size} integrantes`,
                icon: 'success'
            })

            // Limpiar formulario y recargar datos
            limpiarFormulario()
            mostrarFormulario.value = false
            await cargarDatos()

        } catch (error) {
            console.error('Error creando servicio:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo crear el servicio. Intenta nuevamente.',
                icon: 'error'
            })
        } finally {
            creandoServicio.value = false
        }
    }

    const editarServicio = async (servicio) => {
        try {
            // Cargar datos del servicio en el formulario
            nuevoServicio.value = {
                titulo: servicio.titulo,
                fecha: servicio.fecha,
                hora: servicio.hora,
                detalles: servicio.detalles || ''
            }

            servicioEditando.value = servicio
            editandoServicio.value = true
            mostrarFormulario.value = true

            // Cargar participantes actuales del servicio
            const { data: participantesActuales, error } = await supabase
                .from('servicios_usuarios')
                .select(`
                usuarios(id, email, raw_user_meta_data)
            `)
                .eq('servicio_id', servicio.id)

            if (error) throw error

            // Limpiar selecciones actuales
            gruposSeleccionados.value = []
            integrantesIndividuales.value = []

            // Cargar participantes individuales
            integrantesIndividuales.value = participantesActuales.map(p => ({
                id: p.usuarios.id,
                email: p.usuarios.email,
                raw_user_meta_data: p.usuarios.raw_user_meta_data
            }))

            // Scroll al formulario
            setTimeout(() => {
                document.querySelector('.servicio-form-card')?.scrollIntoView({
                    behavior: 'smooth'
                })
            }, 100)

        } catch (error) {
            console.error('Error cargando servicio para editar:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar el servicio para editar',
                icon: 'error'
            })
        }
    }

    const cancelarEdicion = () => {
        editandoServicio.value = false
        servicioEditando.value = null
        limpiarFormulario()
        mostrarFormulario.value = false
    }

    const actualizarServicio = async () => {
        if (!servicioEditando.value) return

        try {
            creandoServicio.value = true

            // Actualizar datos básicos del servicio
            const { error: servicioError } = await supabase
                .from('servicios')
                .update({
                    titulo: nuevoServicio.value.titulo,
                    fecha: nuevoServicio.value.fecha,
                    hora: nuevoServicio.value.hora,
                    detalles: nuevoServicio.value.detalles
                })
                .eq('id', servicioEditando.value.id)

            if (servicioError) throw servicioError

            // Eliminar participantes actuales
            const { error: deleteError } = await supabase
                .from('servicios_usuarios')
                .delete()
                .eq('servicio_id', servicioEditando.value.id)

            if (deleteError) throw deleteError

            // Obtener todos los usuarios a agregar
            const usuariosAAgregar = new Set()

            // Agregar usuarios de grupos seleccionados
            gruposSeleccionados.value.forEach(grupo => {
                const usuariosDelGrupo = rolesUsuarios.value
                    .filter(ru => ru.rol === grupo.rol && ru.usuarios.casa_id === usuarioCasaId.value)
                    .map(ru => ru.user_id)
                usuariosDelGrupo.forEach(userId => usuariosAAgregar.add(userId))
            })

            // Agregar usuarios individuales
            integrantesIndividuales.value.forEach(usuario => {
                usuariosAAgregar.add(usuario.id)
            })

            // Insertar nuevos participantes
            if (usuariosAAgregar.size > 0) {
                const serviciosUsers = Array.from(usuariosAAgregar).map(userId => ({
                    servicio_id: servicioEditando.value.id,
                    user_id: userId
                }))

                const { error: usuariosError } = await supabase
                    .from('servicios_usuarios')
                    .insert(serviciosUsers)

                if (usuariosError) throw usuariosError
            }

            await Swal.fire({
                title: '¡Servicio actualizado!',
                text: `Se ha actualizado "${nuevoServicio.value.titulo}" con ${usuariosAAgregar.size} integrantes`,
                icon: 'success'
            })

            // Limpiar formulario y recargar datos
            cancelarEdicion()
            await cargarDatos()

        } catch (error) {
            console.error('Error actualizando servicio:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo actualizar el servicio. Intenta nuevamente.',
                icon: 'error'
            })
        } finally {
            creandoServicio.value = false
        }
    }

    const eliminarServicio = async (servicioId) => {
        const { value: confirm } = await Swal.fire({
            title: '¿Eliminar servicio?',
            text: 'Esta acción eliminará el servicio y su repertorio. No se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (!confirm) return

        try {
            // Eliminar primero los participantes
            const { error: usuariosError } = await supabase
                .from('servicios_usuarios')
                .delete()
                .eq('servicio_id', servicioId)

            if (usuariosError) throw usuariosError

            // Eliminar el servicio
            const { error: servicioError } = await supabase
                .from('servicios')
                .delete()
                .eq('id', servicioId)

            if (servicioError) throw servicioError

            await Swal.fire({
                title: '¡Eliminado!',
                text: 'El servicio ha sido eliminado correctamente',
                icon: 'success'
            })

            await cargarDatos()

        } catch (error) {
            console.error('Error eliminando servicio:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el servicio',
                icon: 'error'
            })
        }
    }

    // Métodos de visualización
    const verDetalleServicio = async (servicio) => {
        try {
            // Obtener participantes del servicio
            const { data: participantes, error } = await supabase
                .from('servicios_usuarios')
                .select(`
                *,
                usuarios(email, raw_user_meta_data)
            `)
                .eq('servicio_id', servicio.id)

            if (error) throw error

            const listaParticipantes = participantes
                .map(p => p.usuarios.raw_user_meta_data?.full_name || p.usuarios.email)
                .join(', ')

            await Swal.fire({
                title: servicio.titulo,
                html: `
                <div class="text-start">
                    <p><strong>📅 Fecha:</strong> ${formatearFecha(servicio.fecha)}</p>
                    <p><strong>🕐 Hora:</strong> ${servicio.hora}</p>
                    ${servicio.detalles ? `<p><strong>📝 Detalles:</strong> ${servicio.detalles}</p>` : ''}
                    <p><strong>👥 Integrantes (${participantes.length}):</strong></p>
                    <p class="small">${listaParticipantes || 'Sin integrantes asignados'}</p>
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
                text: 'No se pudieron cargar los detalles del servicio',
                icon: 'error'
            })
        }
    }

    const gestionarRepertorio = (servicio) => {
        // Funcionalidad futura para gestionar el repertorio
        Swal.fire({
            title: 'Gestión de Repertorio',
            text: 'Esta funcionalidad estará disponible próximamente',
            icon: 'info'
        })
    }

    // Utilidades
    const formatearFecha = (fecha) => {
        const date = new Date(fecha)
        const hoy = new Date()
        const manana = new Date(hoy)
        manana.setDate(hoy.getDate() + 1)

        // Comparar solo las fechas (sin hora)
        const fechaSolo = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        const hoySolo = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
        const mananaSolo = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate())

        if (fechaSolo.getTime() === hoySolo.getTime()) {
            return 'Hoy'
        } else if (fechaSolo.getTime() === mananaSolo.getTime()) {
            return 'Mañana'
        } else {
            return date.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            })
        }
    }

    // Lifecycle
    onMounted(async () => {
        // Verificar permisos
        if (!await hasRole('admin_voces')) {
            await Swal.fire({
                title: 'Acceso Denegado',
                text: 'No tienes permisos para gestionar servicios',
                icon: 'error'
            })
            router.push('/')
            return
        }

        await cargarDatos()
    })
</script>

<style scoped>

    /* Usar los mismos estilos que reuniones.vue pero adaptados */
    .header-section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 3rem 2rem;
        border-radius: 20px;
        margin-bottom: 2rem;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }

    .servicio-form-card {
        background: white;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        border: none;
    }

    .servicio-form-card .card-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-bottom: none;
        padding: 1.5rem 2rem;
    }

    .servicio-form-card .card-body {
        padding: 2rem;
    }

    .section-title {
        color: #495057;
        font-weight: 600;
        margin-bottom: 1.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e9ecef;
    }

    .nav-tabs .nav-link {
        border: none;
        background: none;
        color: #6c757d;
        font-weight: 500;
        padding: 1rem 1.5rem;
    }

    .nav-tabs .nav-link.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 10px;
    }

    .participantes-section {
        background: #f8f9fa;
        border-radius: 15px;
        padding: 2rem;
        margin-bottom: 2rem;
    }

    .grupos-list,
    .usuarios-list,
    .grupos-seleccionados,
    .integrantes-seleccionados {
        max-height: 400px;
        overflow-y: auto;
        padding: 1rem;
        background: white;
        border-radius: 10px;
        border: 2px solid #e9ecef;
    }

    .grupo-item,
    .usuario-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        margin-bottom: 0.5rem;
        background: white;
        border: 2px solid #e9ecef;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .grupo-item:hover,
    .usuario-item:hover {
        border-color: #667eea;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
    }

    .grupo-item.selected,
    .usuario-item.selected {
        border-color: #28a745;
        background: linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%);
    }

    .grupo-seleccionado,
    .integrante-seleccionado {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        margin-bottom: 0.5rem;
        background: #e8f5e8;
        border: 2px solid #28a745;
        border-radius: 10px;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .user-avatar,
    .user-avatar-sm {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
    }

    .user-avatar-sm {
        width: 32px;
        height: 32px;
    }

    .avatar-img,
    .avatar-img-sm {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .avatar-placeholder,
    .avatar-placeholder-sm {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.2rem;
    }

    .avatar-placeholder-sm {
        font-size: 1rem;
    }

    .grupo-count {
        color: #6c757d;
        font-size: 0.9rem;
    }

    .empty-state {
        text-align: center;
        padding: 2rem;
        color: #6c757d;
    }

    .empty-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .resumen-section {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 15px;
        padding: 2rem;
        margin-top: 2rem;
    }

    .stats-grid {
        display: flex;
        gap: 2rem;
        flex-wrap: wrap;
    }

    .stat-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .stat-item i {
        font-size: 1.5rem;
    }

    .stat-number {
        font-weight: bold;
        font-size: 1.2rem;
        color: #495057;
    }

    .stat-label {
        font-size: 0.9rem;
        color: #6c757d;
    }

    .servicios-existentes {
        background: white;
        border-radius: 20px;
        padding: 2rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .servicio-card {
        background: white;
        border: 2px solid #e9ecef;
        border-radius: 15px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        transition: all 0.3s ease;
    }

    .servicio-card:hover {
        border-color: #667eea;
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
    }

    .servicio-card.editando {
        border-left: 4px solid #ffc107;
        background: linear-gradient(135deg, #fff8e1 0%, #ffffff 100%);
        box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
        transform: translateY(-2px);
    }

    .servicio-titulo {
        color: #495057;
        font-weight: 600;
        margin-bottom: 1rem;
    }

    .servicio-datetime {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
    }

    .servicio-detalles {
        color: #6c757d;
        margin: 0;
        font-style: italic;
    }

    .servicio-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        flex-wrap: wrap;
    }

    .empty-state-large {
        text-align: center;
        padding: 4rem 2rem;
        color: #6c757d;
    }

    .empty-state-large i {
        font-size: 5rem;
        margin-bottom: 2rem;
        color: #dee2e6;
    }

    .loading-container {
        padding: 4rem 2rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .header-section {
            padding: 2rem 1rem;
            text-align: center;
        }

        .servicio-form-card .card-body {
            padding: 1rem;
        }

        .participantes-section {
            padding: 1rem;
        }

        .grupos-list,
        .usuarios-list,
        .grupos-seleccionados,
        .integrantes-seleccionados {
            max-height: 250px;
        }

        .servicio-actions {
            text-align: center;
            margin-top: 1rem;
        }

        .stat-item {
            margin-bottom: 1rem;
        }
    }

    /* Animaciones */
    .servicio-card,
    .grupo-item,
    .usuario-item {
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

    /* Scrollbars personalizados */
    .grupos-list::-webkit-scrollbar,
    .usuarios-list::-webkit-scrollbar,
    .grupos-seleccionados::-webkit-scrollbar,
    .integrantes-seleccionados::-webkit-scrollbar {
        width: 6px;
    }

    .grupos-list::-webkit-scrollbar-track,
    .usuarios-list::-webkit-scrollbar-track,
    .grupos-seleccionados::-webkit-scrollbar-track,
    .integrantes-seleccionados::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }

    .grupos-list::-webkit-scrollbar-thumb,
    .usuarios-list::-webkit-scrollbar-thumb,
    .grupos-seleccionados::-webkit-scrollbar-thumb,
    .integrantes-seleccionados::-webkit-scrollbar-thumb {
        background: #667eea;
        border-radius: 3px;
    }

    .grupos-list::-webkit-scrollbar-thumb:hover,
    .usuarios-list::-webkit-scrollbar-thumb:hover,
    .grupos-seleccionados::-webkit-scrollbar-thumb:hover,
    .integrantes-seleccionados::-webkit-scrollbar-thumb:hover {
        background: #5a6fd8;
    }
</style>
