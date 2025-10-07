<template>
    <div class="container-fluid mb-3">
        <!-- Header -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="header-section">
                    <h1 class="display-5 text-white mb-2">
                        <i class="bi bi-people-fill me-3"></i>
                        Gestión de Roles
                    </h1>
                    <p class="lead text-white-50">
                        Administra los roles y permisos de los usuarios del sistema
                    </p>
                </div>
            </div>
        </div>

        <!-- Loading -->
        <div class="row" v-if="cargando">
            <div class="col-12 text-center">
                <div class="loading-container">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <h4 class="mt-3 text-muted">Cargando usuarios y roles...</h4>
                </div>
            </div>
        </div>

        <!-- Estadísticas -->
        <div class="row mb-4" v-if="!cargando">
            <div class="col-md-3 col-sm-6 mb-3">
                <div class="stats-card">
                    <div class="stats-icon bg-primary">
                        <i class="bi bi-people"></i>
                    </div>
                    <div class="stats-content">
                        <h3>{{ usuarios.length }}</h3>
                        <p>Usuarios Totales</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
                <div class="stats-card">
                    <div class="stats-icon bg-success">
                        <i class="bi bi-shield-check"></i>
                    </div>
                    <div class="stats-content">
                        <h3>{{ roles.length }}</h3>
                        <p>Roles Disponibles</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
                <div class="stats-card">
                    <div class="stats-icon bg-warning">
                        <i class="bi bi-person-check"></i>
                    </div>
                    <div class="stats-content">
                        <h3>{{ usuariosConRoles }}</h3>
                        <p>Con Roles Asignados</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
                <div class="stats-card">
                    <div class="stats-icon bg-danger">
                        <i class="bi bi-person-x"></i>
                    </div>
                    <div class="stats-content">
                        <h3>{{ usuariosSinRoles }}</h3>
                        <p>Sin Roles</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filtros -->
        <div class="row mb-4" v-if="!cargando">
            <div class="col-md-6">
                <div class="filter-card">
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="bi bi-search"></i>
                        </span>
                        <input type="text" class="form-control" placeholder="Buscar por nombre o email..."
                            v-model="filtroUsuario" @input="filtrarUsuarios">
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="filter-card">
                    <select class="form-select" v-model="filtroRol" @change="filtrarUsuarios">
                        <option value="">Todos los roles</option>
                        <option value="sin-rol">Sin roles asignados</option>
                        <option v-for="rol in roles" :key="rol.id" :value="rol.rol">
                            {{ rol.rol }}
                        </option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Lista de Usuarios -->
        <div class="row" v-if="!cargando">
            <div class="col-12">
                <div class="users-container">
                    <div class="user-card" v-for="usuario in usuariosFiltrados" :key="usuario.id">
                        <div class="row align-items-center">
                            <!-- Info del Usuario -->
                            <div class="col-lg-4 col-md-6">
                                <div class="user-info">
                                    <div class="user-avatar">
                                        <img v-if="usuario.raw_user_meta_data?.avatar_url"
                                            :src="usuario.raw_user_meta_data.avatar_url"
                                            :alt="usuario.raw_user_meta_data?.full_name || usuario.email"
                                            class="avatar-img">
                                        <div v-else class="avatar-placeholder">
                                            <i class="bi bi-person-fill"></i>
                                        </div>
                                    </div>
                                    <div class="user-details">
                                        <h5 class="user-name">
                                            {{ usuario.raw_user_meta_data?.full_name || 'Sin nombre' }}
                                        </h5>
                                        <p class="user-email">{{ usuario.email }}</p>
                                        <small class="user-id text-muted">ID:
                                            {{ usuario.id.substring(0, 8) }}...</small>
                                    </div>
                                </div>
                            </div>

                            <!-- Roles Actuales -->
                            <div class="col-lg-4 col-md-6">
                                <div class="user-roles">
                                    <h6 class="roles-title">
                                        <i class="bi bi-shield-fill me-2"></i>Roles Asignados
                                    </h6>
                                    <div class="roles-badges" v-if="usuario.rolesAsignados?.length > 0">
                                        <span v-for="rolUsuario in usuario.rolesAsignados" :key="rolUsuario.id"
                                            class="badge bg-primary me-2 mb-1">
                                            <i class="bi bi-check-circle me-1"></i>
                                            {{ rolUsuario.rol }}
                                        </span>
                                    </div>
                                    <div v-else class="no-roles">
                                        <span class="badge bg-secondary">
                                            <i class="bi bi-exclamation-circle me-1"></i>
                                            Sin roles asignados
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Acciones -->
                            <div class="col-lg-4 col-md-12">
                                <div class="user-actions">
                                    <button class="btn btn-primary btn-sm me-2" @click="abrirModalRoles(usuario)"
                                        title="Gestionar roles">
                                        <i class="bi bi-gear-fill me-1"></i>
                                        Gestionar Roles
                                    </button>
                                    <button class="btn btn-outline-info btn-sm" @click="verDetalleUsuario(usuario)"
                                        title="Ver detalle">
                                        <i class="bi bi-eye-fill"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sin resultados -->
                <div v-if="usuariosFiltrados.length === 0" class="no-results">
                    <div class="text-center">
                        <i class="bi bi-search" style="font-size: 3rem; color: #6c757d;"></i>
                        <h4 class="mt-3 text-muted">No se encontraron usuarios</h4>
                        <p class="text-muted">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal para gestionar roles -->
        <div class="modal fade" id="modalRoles" tabindex="-1" ref="modalRoles">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-person-gear me-2"></i>
                            Gestionar Roles -
                            {{ usuarioSeleccionado?.raw_user_meta_data?.full_name || usuarioSeleccionado?.email }}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6><i class="bi bi-list-check me-2"></i>Roles Disponibles</h6>
                                <div class="roles-list">
                                    <div v-for="rol in roles" :key="rol.id" class="role-item"
                                        :class="{ 'role-assigned': esRolAsignado(rol.rol) }">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" :id="'rol-' + rol.id"
                                                :checked="esRolAsignado(rol.rol)"
                                                @change="toggleRol(rol.rol, $event.target.checked)">
                                            <label class="form-check-label" :for="'rol-' + rol.id">
                                                <i class="bi bi-shield me-2"></i>{{ rol.rol }}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="bi bi-person-check me-2"></i>Roles Asignados</h6>
                                <div class="assigned-roles">
                                    <div v-if="rolesTemporales.length === 0" class="text-muted">
                                        <i class="bi bi-info-circle me-2"></i>
                                        No hay roles asignados
                                    </div>
                                    <div v-else>
                                        <div v-for="rol in rolesTemporales" :key="rol" class="assigned-role-badge">
                                            <span class="badge bg-success me-2 mb-2">
                                                <i class="bi bi-check-circle me-1"></i>
                                                {{ rol }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            Cancelar
                        </button>
                        <button type="button" class="btn btn-primary" @click="guardarRoles" :disabled="guardandoRoles">
                            <span v-if="guardandoRoles" class="spinner-border spinner-border-sm me-2"></span>
                            <i v-else class="bi bi-save me-2"></i>
                            {{ guardandoRoles ? 'Guardando...' : 'Guardar Cambios' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, computed } from 'vue'
    import { useSupabase } from '~/composables/useSupabase'
    import { useRouter } from 'vue-router'
    import Swal from 'sweetalert2'

    const { supabase, hasRole } = useSupabase()
    const router = useRouter()

    // Estados reactivos
    const cargando = ref(true)
    const usuarios = ref([])
    const roles = ref([])
    const usuariosFiltrados = ref([])
    const filtroUsuario = ref('')
    const filtroRol = ref('')

    // Modal
    const modalRoles = ref(null)
    const usuarioSeleccionado = ref(null)
    const rolesTemporales = ref([])
    const guardandoRoles = ref(false)

    // Computadas
    const usuariosConRoles = computed(() => {
        return usuarios.value.filter(user => user.rolesAsignados?.length > 0).length
    })

    const usuariosSinRoles = computed(() => {
        return usuarios.value.filter(user => !user.rolesAsignados || user.rolesAsignados.length === 0).length
    })

    // Métodos
    const cargarDatos = async () => {
        try {
            cargando.value = true

            // Cargar usuarios de la tabla auth.users
            const { data: usuariosData, error: usuariosError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('casa_id', 1) // Filtrar por casa_id = 1, cambiar según necesidad

            if (usuariosError) throw usuariosError

            // Cargar roles disponibles
            const { data: rolesData, error: rolesError } = await supabase
                .from('roles')
                .select('*')

            if (rolesError) throw rolesError

            // Cargar roles asignados
            const { data: rolesUsuarios, error: rolesUsuariosError } = await supabase
                .from('roles_usuarios')
                .select('*')

            if (rolesUsuariosError) throw rolesUsuariosError

            // Combinar datos
            usuarios.value = usuariosData.map(usuario => {
                const rolesAsignados = rolesUsuarios
                    .filter(ru => ru.user_id === usuario.id)
                    .map(ru => ({ id: ru.id, rol: ru.rol }))

                return {
                    ...usuario,
                    rolesAsignados
                }
            })

            roles.value = rolesData
            usuariosFiltrados.value = usuarios.value

        } catch (error) {
            console.error('Error cargando datos:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los datos: ' + error.message,
                icon: 'error'
            })
        } finally {
            cargando.value = false
        }
    }

    const filtrarUsuarios = () => {
        let filtrados = usuarios.value

        // Filtrar por texto (nombre o email)
        if (filtroUsuario.value) {
            const texto = filtroUsuario.value.toLowerCase()
            filtrados = filtrados.filter(user => {
                const nombre = user.raw_user_meta_data?.full_name?.toLowerCase() || ''
                const email = user.email.toLowerCase()
                return nombre.includes(texto) || email.includes(texto)
            })
        }

        // Filtrar por rol
        if (filtroRol.value) {
            if (filtroRol.value === 'sin-rol') {
                filtrados = filtrados.filter(user => !user.rolesAsignados || user.rolesAsignados.length === 0)
            } else {
                filtrados = filtrados.filter(user =>
                    user.rolesAsignados?.some(rol => rol.rol === filtroRol.value)
                )
            }
        }

        usuariosFiltrados.value = filtrados
    }

    const abrirModalRoles = (usuario) => {
        usuarioSeleccionado.value = usuario
        rolesTemporales.value = usuario.rolesAsignados?.map(r => r.rol) || []

        const modal = new bootstrap.Modal(modalRoles.value)
        modal.show()
    }

    const esRolAsignado = (rol) => {
        return rolesTemporales.value.includes(rol)
    }

    const toggleRol = async (rol, asignar) => {
        if (asignar) {
            if (!rolesTemporales.value.includes(rol)) {
                rolesTemporales.value.push(rol)
            }
        } else {
            const index = rolesTemporales.value.indexOf(rol)
            if (index > -1) {
                rolesTemporales.value.splice(index, 1)
            }
        }
    }

    const guardarRoles = async () => {
        try {
            guardandoRoles.value = true

            const userId = usuarioSeleccionado.value.id
            const rolesActuales = usuarioSeleccionado.value.rolesAsignados?.map(r => r.rol) || []

            // Roles a agregar
            const rolesAgregar = rolesTemporales.value.filter(rol => !rolesActuales.includes(rol))

            // Roles a quitar
            const rolesQuitar = rolesActuales.filter(rol => !rolesTemporales.value.includes(rol))

            // Agregar nuevos roles
            for (const rol of rolesAgregar) {
                const { error } = await supabase
                    .from('roles_usuarios')
                    .insert({
                        user_id: userId,
                        rol: rol
                    })

                if (error) throw error
            }

            // Quitar roles
            for (const rol of rolesQuitar) {
                const { error } = await supabase
                    .from('roles_usuarios')
                    .delete()
                    .eq('user_id', userId)
                    .eq('rol', rol)

                if (error) throw error
            }

            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(modalRoles.value)
            modal.hide()

            // Recargar datos
            await cargarDatos()

            await Swal.fire({
                title: 'Éxito',
                text: 'Los roles se han actualizado correctamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            })

        } catch (error) {
            console.error('Error guardando roles:', error)
            await Swal.fire({
                title: 'Error',
                text: 'No se pudieron guardar los cambios: ' + error.message,
                icon: 'error'
            })
        } finally {
            guardandoRoles.value = false
        }
    }

    const verDetalleUsuario = (usuario) => {
        Swal.fire({
            title: 'Detalle del Usuario',
            html: `
            <div class="text-start">
                <p><strong>ID:</strong> ${usuario.id}</p>
                <p><strong>Email:</strong> ${usuario.email}</p>
                <p><strong>Nombre:</strong> ${usuario.raw_user_meta_data?.full_name || 'No especificado'}</p>
                <p><strong>Roles:</strong> ${usuario.rolesAsignados?.map(r => r.rol).join(', ') || 'Sin roles'}</p>
            </div>
        `,
            icon: 'info'
        })
    }

    // Lifecycle
    onMounted(async () => {
        // Verificar permisos
        if (!hasRole('admin')) {
            await Swal.fire({
                title: 'Acceso Denegado',
                text: 'No tienes permisos para acceder a esta sección',
                icon: 'error'
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

    .loading-container {
        padding: 3rem 0;
    }

    .stats-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        display: flex;
        align-items: center;
        transition: transform 0.3s ease;
    }

    .stats-card:hover {
        transform: translateY(-2px);
    }

    .stats-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: white;
        margin-right: 1rem;
    }

    .stats-content h3 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 600;
    }

    .stats-content p {
        margin: 0;
        color: #6c757d;
        font-size: 0.875rem;
    }

    .filter-card {
        background: white;
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }

    .users-container {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }

    .user-card {
        padding: 1.5rem;
        border-bottom: 1px solid #e9ecef;
        transition: background-color 0.3s ease;
    }

    .user-card:hover {
        background-color: #f8f9fa;
    }

    .user-card:last-child {
        border-bottom: none;
    }

    .user-info {
        display: flex;
        align-items: center;
    }

    .user-avatar {
        margin-right: 1rem;
    }

    .avatar-img {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
    }

    .avatar-placeholder {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #e9ecef;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6c757d;
        font-size: 1.5rem;
    }

    .user-name {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
    }

    .user-email {
        margin: 0;
        color: #6c757d;
        font-size: 0.9rem;
    }

    .user-id {
        font-size: 0.75rem;
    }

    .roles-title {
        color: #495057;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }

    .roles-badges .badge {
        font-size: 0.75rem;
    }

    .no-roles .badge {
        font-size: 0.75rem;
    }

    .user-actions {
        text-align: right;
    }

    .no-results {
        background: white;
        border-radius: 12px;
        padding: 3rem 2rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        margin-top: 2rem;
    }

    .roles-list {
        max-height: 300px;
        overflow-y: auto;
    }

    .role-item {
        padding: 0.75rem;
        border-radius: 8px;
        margin-bottom: 0.5rem;
        border: 1px solid #e9ecef;
        transition: all 0.3s ease;
    }

    .role-item:hover {
        background-color: #f8f9fa;
    }

    .role-item.role-assigned {
        background-color: #e7f3ff;
        border-color: #0d6efd;
    }

    .assigned-roles {
        min-height: 100px;
    }

    .assigned-role-badge .badge {
        font-size: 0.8rem;
        padding: 0.5rem 0.75rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .user-actions {
            text-align: center;
            margin-top: 1rem;
        }

        .stats-card {
            margin-bottom: 1rem;
        }
    }
</style>