<template>
    <div class="container-fluid">
        <!-- Header -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="header-section">
                    <h1 class="display-5 text-white mb-2">
                        <i class="bi bi-calendar-event me-3"></i>
                        Gestión de Reuniones
                    </h1>
                    <p class="lead text-white-50">
                        Organiza y convoca reuniones para los diferentes grupos del ministerio
                    </p>
                </div>
            </div>
        </div>

        <!-- Botón para nueva reunión -->
        <div class="row mb-4">
            <div class="col-12">
                <button class="btn btn-primary btn-lg" @click="toggleFormulario">
                    <i class="bi bi-plus-circle me-2"></i>
                    {{ mostrarFormulario ? 'Ocultar Formulario' : 'Nueva Reunión' }}
                </button>
            </div>
        </div>

        <!-- Formulario para crear reunión -->
        <div class="row mb-4" v-if="mostrarFormulario">
            <div class="col-12">
                <div class="reunion-form-card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h4 class="mb-0">
                            <i :class="editandoReunion ? 'bi bi-pencil-square me-2' : 'bi bi-calendar-plus me-2'"></i>
                            {{ editandoReunion ? 'Editar Reunión' : 'Crear Nueva Reunión' }}
                        </h4>
                        <button v-if="editandoReunion" class="btn btn-outline-secondary btn-sm"
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
                                    <i class="bi bi-card-text me-2"></i>Título de la reunión
                                </label>
                                <input type="text" class="form-control form-control-lg"
                                    placeholder="Ej: Ensayo General, Reunión de Voces, etc."
                                    v-model="nuevaReunion.titulo" />
                            </div>
                            <div class="col-md-3">
                                <label class="form-label fw-bold">
                                    <i class="bi bi-calendar3 me-2"></i>Fecha
                                </label>
                                <input type="date" class="form-control form-control-lg" v-model="nuevaReunion.fecha" />
                            </div>
                            <div class="col-md-3">
                                <label class="form-label fw-bold">
                                    <i class="bi bi-clock me-2"></i>Hora
                                </label>
                                <input type="time" class="form-control form-control-lg" v-model="nuevaReunion.hora" />
                            </div>
                        </div>

                        <div class="row mb-4">
                            <div class="col-12">
                                <label class="form-label fw-bold">
                                    <i class="bi bi-journal-text me-2"></i>Detalles adicionales
                                </label>
                                <textarea class="form-control" rows="3"
                                    placeholder="Agenda, temas a tratar, materiales necesarios, etc."
                                    v-model="nuevaReunion.detalles"></textarea>
                            </div>
                        </div>

                        <!-- Selector de participantes -->
                        <div class="row mb-4">
                            <div class="col-12">
                                <h5 class="section-title">
                                    <i class="bi bi-people me-2"></i>
                                    Convocar Participantes
                                </h5>

                                <!-- Tabs para selección -->
                                <ul class="nav nav-tabs mb-3" role="tablist">
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link active" id="grupos-tab" data-bs-toggle="tab"
                                            data-bs-target="#grupos-panel" type="button" role="tab">
                                            <i class="bi bi-collection me-2"></i>Por Grupos
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="individuales-tab" data-bs-toggle="tab"
                                            data-bs-target="#individuales-panel" type="button" role="tab">
                                            <i class="bi bi-person me-2"></i>Individual
                                        </button>
                                    </li>
                                </ul>

                                <div class="tab-content">
                                    <!-- Panel de grupos -->
                                    <div class="tab-pane fade show active" id="grupos-panel" role="tabpanel">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <h6 class="fw-bold mb-3">
                                                    <i class="bi bi-list-check me-2"></i>Grupos Disponibles
                                                </h6>
                                                <div class="grupos-list">
                                                    <div v-for="rol in roles" :key="rol.rol" class="grupo-item"
                                                        :class="{ 'selected': gruposSeleccionados.includes(rol.rol) }">
                                                        <div class="form-check">
                                                            <input class="form-check-input" type="checkbox"
                                                                :id="'grupo-' + rol.rol" :value="rol.rol"
                                                                v-model="gruposSeleccionados"
                                                                @change="actualizarIntegrantesPorGrupos">
                                                            <label class="form-check-label" :for="'grupo-' + rol.rol">
                                                                <i class="bi bi-people-fill me-2"></i>
                                                                <strong>{{ rol.rol }}</strong>
                                                                <span class="badge bg-secondary ms-2">
                                                                    {{ contarUsuariosPorRol(rol.rol) }} personas
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <h6 class="fw-bold mb-3">
                                                    <i class="bi bi-check-circle me-2"></i>Grupos Seleccionados
                                                </h6>
                                                <div class="grupos-seleccionados" v-if="gruposSeleccionados.length > 0">
                                                    <div v-for="grupo in gruposSeleccionados" :key="grupo"
                                                        class="selected-grupo-badge">
                                                        <span class="badge bg-success me-2 mb-2">
                                                            <i class="bi bi-people-fill me-1"></i>
                                                            {{ grupo }}
                                                            <span class="ms-1">({{ contarUsuariosPorRol(grupo)
                                                                }})</span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div v-else class="text-muted">
                                                    <i class="bi bi-info-circle me-2"></i>
                                                    Selecciona grupos para convocar
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Panel individual -->
                                    <div class="tab-pane fade" id="individuales-panel" role="tabpanel">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <h6 class="fw-bold mb-3">
                                                    <i class="bi bi-search me-2"></i>Buscar Personas
                                                </h6>
                                                <input type="text" class="form-control mb-3"
                                                    placeholder="Buscar por nombre..." v-model="filtroUsuarios" />

                                                <div class="usuarios-list">
                                                    <div v-for="user in usuariosFiltrados" :key="user.id"
                                                        class="usuario-item" @click="toggleIntegrante(user)">
                                                        <div class="user-info">
                                                            <div class="user-avatar">
                                                                <img v-if="user.raw_user_meta_data?.avatar_url"
                                                                    :src="user.raw_user_meta_data.avatar_url"
                                                                    :alt="user.raw_user_meta_data?.full_name"
                                                                    class="avatar-img">
                                                                <div v-else class="avatar-placeholder">
                                                                    <i class="bi bi-person-fill"></i>
                                                                </div>
                                                            </div>
                                                            <div class="user-details">
                                                                <strong>{{ user.raw_user_meta_data?.full_name || 'Sin nombre' }}</strong>
                                                                <small
                                                                    class="text-muted d-block">{{ user.email }}</small>
                                                                <div class="user-roles">
                                                                    <span v-for="rol in obtenerRolesUsuario(user.id)"
                                                                        :key="rol" class="badge bg-info me-1">
                                                                        {{ rol }}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="selection-indicator">
                                                            <i v-if="esIntegranteSeleccionado(user.id)"
                                                                class="bi bi-check-circle-fill text-success"></i>
                                                            <i v-else class="bi bi-plus-circle text-muted"></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <h6 class="fw-bold mb-3">
                                                    <i class="bi bi-person-check me-2"></i>Personas Seleccionadas
                                                </h6>
                                                <div class="integrantes-seleccionados">
                                                    <div v-if="integrantesIndividuales.length === 0" class="text-muted">
                                                        <i class="bi bi-info-circle me-2"></i>
                                                        Selecciona personas individualmente
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
                                                                @click="quitarIntegrante(integrante.id)"
                                                                title="Quitar de la lista">
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
                        </div>

                        <!-- Resumen de convocados -->
                        <div class="row mb-4">
                            <div class="col-12">
                                <div class="resumen-convocados">
                                    <h6 class="fw-bold mb-3">
                                        <i class="bi bi-clipboard-check me-2"></i>
                                        Resumen de Convocatoria
                                    </h6>
                                    <div class="resumen-content">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="stat-item">
                                                    <div class="stat-number">{{ totalConvocados }}</div>
                                                    <div class="stat-label">Total Convocados</div>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="stat-item">
                                                    <div class="stat-number">{{ gruposSeleccionados.length }}</div>
                                                    <div class="stat-label">Grupos Seleccionados</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Botones de acción -->
                        <div class="row">
                            <div class="col-12 text-end">
                                <button type="button" class="btn btn-secondary me-2" @click="limpiarFormulario">
                                    <i class="bi bi-arrow-clockwise me-2"></i>
                                    Limpiar
                                </button>
                                <button type="button" :class="editandoReunion ? 'btn btn-warning' : 'btn btn-success'"
                                    @click="editandoReunion ? actualizarReunion() : crearReunion()"
                                    :disabled="!puedeCrearReunion || creandoReunion">
                                    <span v-if="creandoReunion" class="spinner-border spinner-border-sm me-2"></span>
                                    <i v-else :class="editandoReunion ? 'bi bi-check-lg me-2' : 'bi bi-send me-2'"></i>
                                    {{ creandoReunion ? (editandoReunion ? 'Actualizando...' : 'Creando...') : (editandoReunion ? 'Actualizar Reunión' : 'Crear Reunión') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Lista de reuniones existentes -->
        <div class="row" v-if="!loading">
            <div class="col-12">
                <div class="reuniones-existentes">
                    <h4 class="mb-4">
                        <i class="bi bi-calendar3 me-2"></i>
                        Reuniones Programadas
                    </h4>

                    <div v-if="convocatorias.length === 0" class="empty-state">
                        <i class="bi bi-calendar-x" style="font-size: 3rem; color: #6c757d;"></i>
                        <h5 class="mt-3 text-muted">No hay reuniones programadas</h5>
                        <p class="text-muted">Crea una nueva reunión para comenzar</p>
                    </div>

                    <div class="reunion-card" v-for="reunion in convocatorias" :key="reunion.id"
                        :class="{ 'editando': reunionEditando?.id === reunion.id }">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <div class="reunion-info">
                                    <h5 class="reunion-titulo">
                                        <i class="bi bi-calendar-event me-2"></i>
                                        {{ reunion.titulo }}
                                        <span v-if="reunionEditando?.id === reunion.id" class="badge bg-warning ms-2">
                                            <i class="bi bi-pencil me-1"></i>
                                            Editando
                                        </span>
                                    </h5>
                                    <div class="reunion-datetime">
                                        <span class="badge bg-primary me-2">
                                            <i class="bi bi-calendar3 me-1"></i>
                                            {{ formatearFecha(reunion.fecha) }}
                                        </span>
                                        <span class="badge bg-info">
                                            <i class="bi bi-clock me-1"></i>
                                            {{ reunion.hora }}
                                        </span>
                                    </div>
                                    <p v-if="reunion.detalles" class="reunion-detalles">
                                        {{ reunion.detalles }}
                                    </p>
                                </div>
                            </div>
                            <div class="col-md-4 text-end">
                                <div class="reunion-actions">
                                    <button class="btn btn-outline-primary btn-sm me-2"
                                        @click="verDetalleReunion(reunion)" title="Ver detalles">
                                        <i class="bi bi-eye"></i>
                                    </button>
                                    <button class="btn btn-outline-warning btn-sm me-2" @click="editarReunion(reunion)"
                                        title="Editar">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm" @click="eliminarReunion(reunion.id)"
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
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <h4 class="mt-3 text-muted">Cargando reuniones...</h4>
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
    const creandoReunion = ref(false)
    const mostrarFormulario = ref(false)
    const editandoReunion = ref(false)
    const reunionEditando = ref(null)
    const convocatorias = ref([])
    const users = ref([])
    const roles = ref([])
    const rolesUsuarios = ref([])
    const usuarioCasaId = ref(null)

    // Formulario de nueva reunión
    const nuevaReunion = ref({
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

    const totalConvocados = computed(() => {
        let total = integrantesIndividuales.value.length

        // Sumar usuarios de grupos seleccionados (evitando duplicados)
        const usuariosDeGrupos = new Set()
        gruposSeleccionados.value.forEach(rol => {
            const usuariosDelRol = rolesUsuarios.value
                .filter(ru => ru.rol === rol && ru.usuarios.casa_id === usuarioCasaId.value)
                .map(ru => ru.user_id)
            usuariosDelRol.forEach(userId => usuariosDeGrupos.add(userId))
        })

        // Agregar usuarios de grupos que no estén ya en individuales
        usuariosDeGrupos.forEach(userId => {
            if (!integrantesIndividuales.value.some(u => u.id === userId)) {
                total++
            }
        })

        return total
    })

    const puedeCrearReunion = computed(() => {
        return nuevaReunion.value.titulo.trim() &&
            nuevaReunion.value.fecha &&
            nuevaReunion.value.hora &&
            totalConvocados.value > 0
    })

    // Métodos de carga de datos
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

            // Cargar convocatorias
            const { data: convocatoriasData, error: convocatoriasError } = await supabase
                .from('convocatorias')
                .select('*')
                .order('fecha', { ascending: false })

            if (convocatoriasError) throw convocatoriasError

            // Cargar usuarios
            const { data: usuariosData, error: usuariosError } = await supabase
                .from('usuarios')
                .select('id, email, raw_user_meta_data')

            if (usuariosError) throw usuariosError

            // Cargar roles disponibles
            const { data: rolesData, error: rolesError } = await supabase
                .from('roles')
                .select('*')

            if (rolesError) throw rolesError

            // Cargar roles de usuarios
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

            convocatorias.value = convocatoriasData || []
            users.value = usuariosData || []
            roles.value = rolesData || []
            rolesUsuarios.value = rolesUsuariosConCasa || []

        } catch (error) {
            console.error('Error cargando datos:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los datos: ' + error.message,
                icon: 'error'
            })
        } finally {
            loading.value = false
        }
    }

    // Métodos de utilidad
    const contarUsuariosPorRol = (rol) => {
        return rolesUsuarios.value.filter(ru => ru.rol === rol && ru.usuarios.casa_id === usuarioCasaId.value).length
    }

    const obtenerRolesUsuario = (userId) => {
        return rolesUsuarios.value
            .filter(ru => ru.user_id === userId)
            .map(ru => ru.rol)
    }

    const esIntegranteSeleccionado = (userId) => {
        return integrantesIndividuales.value.some(u => u.id === userId)
    }

    // Métodos de selección
    const toggleIntegrante = (user) => {
        const index = integrantesIndividuales.value.findIndex(u => u.id === user.id)
        if (index > -1) {
            integrantesIndividuales.value.splice(index, 1)
        } else {
            integrantesIndividuales.value.push(user)
        }
    }

    const quitarIntegrante = (userId) => {
        const index = integrantesIndividuales.value.findIndex(u => u.id === userId)
        if (index > -1) {
            integrantesIndividuales.value.splice(index, 1)
        }
    }

    const actualizarIntegrantesPorGrupos = () => {
        // Esta función se ejecuta cuando cambian los grupos seleccionados
        // La lógica de conteo ya está en la computada totalConvocados
    }

    // Métodos de reuniones
    const crearReunion = async () => {
        try {
            creandoReunion.value = true

            // Validaciones
            if (!puedeCrearReunion.value) {
                await Swal.fire({
                    title: 'Datos incompletos',
                    text: 'Por favor completa todos los campos requeridos y selecciona al menos un participante',
                    icon: 'warning'
                })
                return
            }

            // Crear la convocatoria
            const { data: nuevaConvocatoria, error: convocatoriaError } = await supabase
                .from('convocatorias')
                .insert({
                    titulo: nuevaReunion.value.titulo,
                    fecha: nuevaReunion.value.fecha,
                    hora: nuevaReunion.value.hora,
                    detalles: nuevaReunion.value.detalles
                })
                .select()
                .single()

            if (convocatoriaError) throw convocatoriaError

            // Recopilar todos los usuarios a convocar
            const usuariosAConvocar = new Set()

            // Agregar usuarios individuales
            integrantesIndividuales.value.forEach(user => {
                usuariosAConvocar.add(user.id)
            })

            // Agregar usuarios de grupos seleccionados
            gruposSeleccionados.value.forEach(rol => {
                const usuariosDelRol = rolesUsuarios.value
                    .filter(ru => ru.rol === rol && ru.usuarios.casa_id === usuarioCasaId.value)
                    .map(ru => ru.user_id)
                usuariosDelRol.forEach(userId => usuariosAConvocar.add(userId))
            })

            // Insertar en convocatorias_users
            const convocatoriasUsers = Array.from(usuariosAConvocar).map(userId => ({
                convocatoria_id: nuevaConvocatoria.id,
                user_id: userId
            }))

            const { error: usuariosError } = await supabase
                .from('convocatorias_users')
                .insert(convocatoriasUsers)

            if (usuariosError) throw usuariosError

            // Mostrar confirmación
            await Swal.fire({
                title: '¡Reunión creada!',
                text: `Se ha convocado a ${usuariosAConvocar.size} personas para "${nuevaReunion.value.titulo}"`,
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            })

            // Limpiar formulario y recargar datos
            limpiarFormulario()
            mostrarFormulario.value = false
            await cargarDatos()

        } catch (error) {
            console.error('Error creando reunión:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo crear la reunión: ' + error.message,
                icon: 'error'
            })
        } finally {
            creandoReunion.value = false
        }
    }

    const limpiarFormulario = () => {
        nuevaReunion.value = {
            titulo: '',
            fecha: new Date().toISOString().split('T')[0],
            hora: '19:00',
            detalles: ''
        }
        gruposSeleccionados.value = []
        integrantesIndividuales.value = []
        filtroUsuarios.value = ''
    }

    const verDetalleReunion = async (reunion) => {
        try {
            // Obtener participantes de la reunión
            const { data: participantes, error } = await supabase
                .from('convocatorias_users')
                .select(`
                *,
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
                    <p><strong>👥 Convocados (${participantes.length}):</strong></p>
                    <p class="small">${listaParticipantes}</p>
                </div>
            `,
                icon: 'info',
                showCloseButton: true
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

    const editarReunion = async (reunion) => {
        try {
            // Cargar datos de la reunión en el formulario
            nuevaReunion.value = {
                titulo: reunion.titulo,
                fecha: reunion.fecha,
                hora: reunion.hora,
                detalles: reunion.detalles || ''
            }

            reunionEditando.value = reunion
            editandoReunion.value = true
            mostrarFormulario.value = true

            // Cargar participantes actuales de la reunión
            const { data: participantesActuales, error } = await supabase
                .from('convocatorias_users')
                .select(`
                    usuarios(id, email, raw_user_meta_data)
                `)
                .eq('convocatoria_id', reunion.id)

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
                document.querySelector('.reunion-form-card')?.scrollIntoView({
                    behavior: 'smooth'
                })
            }, 100)

        } catch (error) {
            console.error('Error cargando reunión para editar:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar la reunión para editar',
                icon: 'error'
            })
        }
    }

    const toggleFormulario = () => {
        if (editandoReunion.value) {
            cancelarEdicion()
        } else {
            mostrarFormulario.value = !mostrarFormulario.value
            if (!mostrarFormulario.value) {
                limpiarFormulario()
            }
        }
    }

    const cancelarEdicion = () => {
        editandoReunion.value = false
        reunionEditando.value = null
        limpiarFormulario()
        mostrarFormulario.value = false
    }

    const actualizarReunion = async () => {
        if (!reunionEditando.value) return

        try {
            creandoReunion.value = true

            // Actualizar datos básicos de la reunión
            const { error: convocatoriaError } = await supabase
                .from('convocatorias')
                .update({
                    titulo: nuevaReunion.value.titulo,
                    fecha: nuevaReunion.value.fecha,
                    hora: nuevaReunion.value.hora,
                    detalles: nuevaReunion.value.detalles
                })
                .eq('id', reunionEditando.value.id)

            if (convocatoriaError) throw convocatoriaError

            // Eliminar participantes actuales
            const { error: deleteError } = await supabase
                .from('convocatorias_users')
                .delete()
                .eq('convocatoria_id', reunionEditando.value.id)

            if (deleteError) throw deleteError

            // Obtener todos los usuarios a convocar
            const usuariosAConvocar = new Set()

            // Agregar usuarios de grupos seleccionados
            gruposSeleccionados.value.forEach(grupo => {
                const usuariosDelGrupo = rolesUsuarios.value
                    .filter(ru => ru.rol === grupo.rol && ru.usuarios.casa_id === usuarioCasaId.value)
                    .map(ru => ru.user_id)
                usuariosDelGrupo.forEach(userId => usuariosAConvocar.add(userId))
            })

            // Agregar usuarios individuales
            integrantesIndividuales.value.forEach(usuario => {
                usuariosAConvocar.add(usuario.id)
            })

            // Insertar nuevos participantes
            if (usuariosAConvocar.size > 0) {
                const convocatoriasUsers = Array.from(usuariosAConvocar).map(userId => ({
                    convocatoria_id: reunionEditando.value.id,
                    user_id: userId
                }))

                const { error: usuariosError } = await supabase
                    .from('convocatorias_users')
                    .insert(convocatoriasUsers)

                if (usuariosError) throw usuariosError
            }

            await Swal.fire({
                title: '¡Reunión actualizada!',
                text: `Se ha actualizado "${nuevaReunion.value.titulo}" con ${usuariosAConvocar.size} participantes`,
                icon: 'success'
            })

            // Limpiar formulario y recargar datos
            cancelarEdicion()
            await cargarDatos()

        } catch (error) {
            console.error('Error actualizando reunión:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo actualizar la reunión. Intenta nuevamente.',
                icon: 'error'
            })
        } finally {
            creandoReunion.value = false
        }
    }

    const eliminarReunion = async (reunionId) => {
        const { value: confirm } = await Swal.fire({
            title: '¿Eliminar reunión?',
            text: 'Esta acción no se puede deshacer',
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
                .from('convocatorias_users')
                .delete()
                .eq('convocatoria_id', reunionId)

            if (usuariosError) throw usuariosError

            // Eliminar la convocatoria
            const { error: convocatoriaError } = await supabase
                .from('convocatorias')
                .delete()
                .eq('id', reunionId)

            if (convocatoriaError) throw convocatoriaError

            await Swal.fire({
                title: 'Eliminada',
                text: 'La reunión ha sido eliminada correctamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            })

            await cargarDatos()

        } catch (error) {
            console.error('Error eliminando reunión:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar la reunión: ' + error.message,
                icon: 'error'
            })
        }
    }

    const formatearFecha = (fecha) => {
        const date = new Date(fecha)
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    // Lifecycle
    onMounted(async () => {
        // Verificar permisos (opcional - puedes ajustar según necesites)
        if (!hasRole('admin') && !hasRole('lider')) {
            await Swal.fire({
                title: 'Acceso Restringido',
                text: 'Solo administradores y líderes pueden gestionar reuniones',
                icon: 'warning'
            })
            router.push('/')
            return
        }

        await cargarDatos()
    })
</script>
<style scoped>
    .header-section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        border-radius: 15px;
        margin-bottom: 1rem;
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .reunion-form-card {
        background: white;
        border-radius: 15px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .reunion-form-card .card-header {
        background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
        color: white;
        padding: 1.5rem;
        border: none;
    }

    .reunion-form-card .card-body {
        padding: 2rem;
    }

    .section-title {
        color: #2c3e50;
        border-bottom: 2px solid #e9ecef;
        padding-bottom: 0.5rem;
        margin-bottom: 1.5rem;
    }

    .nav-tabs .nav-link {
        border-radius: 8px 8px 0 0;
        font-weight: 500;
        color: #6c757d;
    }

    .nav-tabs .nav-link.active {
        background: linear-gradient(45deg, #667eea, #764ba2);
        color: white;
        border-color: transparent;
    }

    .grupos-list,
    .usuarios-list {
        max-height: 350px;
        overflow-y: auto;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 0.5rem;
    }

    .grupo-item {
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 0.5rem;
        border: 1px solid #e9ecef;
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .grupo-item:hover {
        background-color: #f8f9fa;
        transform: translateX(3px);
    }

    .grupo-item.selected {
        background: linear-gradient(45deg, #e3f2fd, #f3e5f5);
        border-color: #667eea;
    }

    .usuario-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 0.5rem;
        border: 1px solid #e9ecef;
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .usuario-item:hover {
        background-color: #f8f9fa;
        transform: translateX(3px);
    }

    .user-info {
        display: flex;
        align-items: center;
        flex-grow: 1;
    }

    .user-avatar,
    .user-avatar-sm {
        margin-right: 0.75rem;
    }

    .avatar-img,
    .avatar-img-sm {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
    }

    .avatar-img-sm {
        width: 32px;
        height: 32px;
    }

    .avatar-placeholder,
    .avatar-placeholder-sm {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #e9ecef;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6c757d;
    }

    .avatar-placeholder-sm {
        width: 32px;
        height: 32px;
        font-size: 0.875rem;
    }

    .user-roles .badge {
        font-size: 0.7rem;
        margin: 0.1rem;
    }

    .selection-indicator {
        font-size: 1.2rem;
    }

    .grupos-seleccionados,
    .integrantes-seleccionados {
        min-height: 200px;
        max-height: 350px;
        overflow-y: auto;
        padding: 0.5rem;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        background: #f8f9fa;
    }

    .selected-grupo-badge .badge {
        font-size: 0.9rem;
        padding: 0.5rem 0.75rem;
    }

    .integrante-seleccionado {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem;
        margin-bottom: 0.5rem;
        background: white;
        border-radius: 8px;
        border: 1px solid #e9ecef;
    }

    .resumen-convocados {
        background: linear-gradient(45deg, #e8f5e8, #f0f8ff);
        border-radius: 12px;
        padding: 1.5rem;
        border: 1px solid #d4edda;
    }

    .stat-item {
        text-align: center;
        padding: 1rem;
    }

    .stat-number {
        font-size: 2rem;
        font-weight: bold;
        color: #28a745;
    }

    .stat-label {
        color: #6c757d;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .reuniones-existentes {
        background: white;
        border-radius: 15px;
        padding: 1.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }

    .reunion-card {
        padding: 1.5rem;
        border-radius: 12px;
        margin-bottom: 1rem;
        background: white;
        border: 1px solid #e9ecef;
        transition: all 0.3s ease;
    }

    .reunion-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .reunion-titulo {
        color: #2c3e50;
        font-weight: 600;
        margin-bottom: 0.75rem;
    }

    .reunion-datetime {
        margin-bottom: 0.75rem;
    }

    .reunion-datetime .badge {
        font-size: 0.8rem;
        padding: 0.4rem 0.6rem;
    }

    .reunion-detalles {
        color: #6c757d;
        margin-bottom: 0;
        font-style: italic;
    }

    .reunion-actions .btn {
        margin-left: 0.25rem;
    }

    .empty-state {
        text-align: center;
        padding: 3rem 2rem;
        color: #6c757d;
    }

    .loading-container {
        padding: 3rem 0;
        text-align: center;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .reunion-form-card .card-body {
            padding: 1rem;
        }

        .grupos-list,
        .usuarios-list,
        .grupos-seleccionados,
        .integrantes-seleccionados {
            max-height: 250px;
        }

        .reunion-actions {
            text-align: center;
            margin-top: 1rem;
        }

        .stat-item {
            margin-bottom: 1rem;
        }
    }

    /* Estado de edición */
    .reunion-card.editando {
        border-left: 4px solid #ffc107;
        background: linear-gradient(135deg, #fff8e1 0%, #ffffff 100%);
        box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
        transform: translateY(-2px);
    }

    /* Animaciones */
    .reunion-card,
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
</style>