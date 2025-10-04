<template>
    <div class="container">
        <div class="row text-center mb-4">
            <div class="col">
                <div class="header-section">
                    <h1 class="display-5 text-primary mb-2">
                        <i class="bi bi-music-note-list me-3"></i>
                        Mi Repertorio
                    </h1>
                    <p class="lead text-muted">
                        Gestiona las canciones de tu repertorio personal
                    </p>
                </div>
            </div>
        </div>
        <div class="row mb-4">
            <div class="col-lg-6 offset-lg-3">
                <div class="filter-card">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-4">
                                <label for="tono" class="form-label fw-bold">
                                    <i class="bi bi-funnel me-2"></i>Filtrar por tono
                                </label>
                            </div>
                            <div class="col-md-8">
                                <select class="form-select form-select-lg" v-model="tono" @change="filtrarPorTono">
                                    <option value="">🎵 Todos los tonos</option>
                                    <option v-for="(tono, index) in tonos" :key="index" :value="index + 1">
                                        🎼 {{ tono }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row" v-if="cargando">
            <div class="col-12 text-center">
                <div class="loading-container">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <h4 class="mt-3 text-muted">Cargando repertorio...</h4>
                </div>
            </div>
        </div>

        <div class="row" v-else>
            <div class="col-lg-10 offset-lg-1 col-md-12 col-12" v-for="cancion in repertorio" :key="cancion.id">
                <div class="song-card mb-3">
                    <div class="card-body">
                        <div class="row align-items-center song-row">
                            <div class="col-lg-8 col-md-7 col-12">
                                <div class="song-info" @click="router.push('/ver-cancion/' + cancion.canciones.id)">
                                    <h5 class="song-title mb-2">
                                        <i class="bi bi-music-note me-2 text-primary"></i>
                                        {{ cancion.canciones.titulo }}
                                    </h5>
                                    <div class="song-details">
                                        <span class="badge bg-secondary me-2">
                                            <i class="bi bi-vinyl me-1"></i>
                                            Tono:
                                            {{ convertirNumeroEnTono(cancion.tono_numero) }}{{ cancion.tono_esmenor == '1' ? 'm' : '' }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-5 col-12">
                                <div class="song-actions">
                                    <button @click="router.push('/ver-cancion/' + cancion.canciones.id)"
                                        class="btn btn-outline-primary btn-sm me-2" title="Ver canción">
                                        <i class="bi bi-eye"></i>
                                    </button>
                                    <button @click="eliminarCancion(cancion.id)" class="btn btn-outline-danger btn-sm"
                                        title="Eliminar del repertorio">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="repertorio.length == 0 && !cargando" class="row">
            <div class="col-md-8 offset-md-2">
                <div class="empty-state text-center">
                    <div class="empty-icon mb-3">
                        <i class="bi bi-music-note-list" style="font-size: 4rem; color: #6c757d;"></i>
                    </div>
                    <h3 class="text-muted mb-3">Tu repertorio está vacío</h3>
                    <p class="text-muted mb-4">
                        Aún no has añadido canciones a tu repertorio personal.
                        Explora el catálogo y comienza a crear tu colección.
                    </p>
                    <nuxt-link to="/canciones" class="btn btn-primary btn-lg">
                        <i class="bi bi-plus-circle me-2"></i>
                        Explorar Canciones
                    </nuxt-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { useSupabase } from '~/composables/useSupabase';
    import { onMounted } from 'vue';
    import { useRouter } from 'vue-router'
    import { usePWACache } from '~/composables/usePWACache'
    const { usuario, hasRole, supabase } = useSupabase();
    const { isOnline, cacheRepertorio, getCachedRepertorio } = usePWACache();
    import Swal from 'sweetalert2';



    const tonos = [
        'C',
        'C#',
        'D',
        'D#',
        'E',
        'F',
        'F#',
        'G',
        'G#',
        'A',
        'A#',
        'B',
    ]
    const tonoEsMenor = ref(false)

    const cargando = ref(true)

    const tono = ref('')
    const filtrarPorTono = async () => {
        if (tono.value) {
            cargando.value = true
            await getRepertorio()
            repertorio.value = repertorio.value.filter(cancion => cancion.tono_numero == tono.value)
            cargando.value = false
        } else {
            getRepertorio()
        }
    }

    const esVoces = ref(false)
    const repertorio = ref([])
    const getRepertorio = async () => {
        // Intentar cargar desde cache si está offline
        if (!isOnline.value) {
            const cachedRepertoire = getCachedRepertorio(usuario.value.id)
            if (cachedRepertoire.length > 0) {
                // Convertir formato de cache a formato esperado
                repertorio.value = cachedRepertoire.map(song => ({
                    tono_numero: song.numero_tono,
                    tono_esmenor: song.tono_esmenor,
                    canciones: {
                        id: song.id,
                        titulo: song.titulo,
                        letra: song.letra,
                        pista_url: song.pista_url
                    }
                }))
                cargando.value = false
                return
            }
        }

        try {
            const { data, error } = await supabase.from('repertorio_voces')
                .select('*, canciones(*)')
                .eq('user_id', usuario.value.id)
            if (error) {
                console.error('Error al obtener el repertorio:', error.message)
            } else {
                repertorio.value = data
                // Cachear para uso offline
                if (isOnline.value) {
                    await cacheRepertorio(usuario.value.id, data)
                }
            }
        } catch (err) {
            // Si hay error y estamos offline, intentar cache
            if (!isOnline.value) {
                const cachedRepertoire = getCachedRepertorio(usuario.value.id)
                if (cachedRepertoire.length > 0) {
                    repertorio.value = cachedRepertoire.map(song => ({
                        tono_numero: song.numero_tono,
                        tono_esmenor: song.tono_esmenor,
                        canciones: {
                            id: song.id,
                            titulo: song.titulo,
                            letra: song.letra,
                            pista_url: song.pista_url
                        }
                    }))
                } else {
                    console.error('No hay repertorio disponible sin conexión')
                }
            } else {
                console.error('Error al cargar repertorio:', err)
            }
        } finally {
            cargando.value = false
        }
    }

    const eliminarCancion = async (id) => {
        const { value: confirm } = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminará la canción de tu repertorio.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Sí, eliminarla!'
        })
        console.log("confirm", confirm);
        if (confirm) {
            cargando.value = true
            const { error } = await supabase
                .from('repertorio_voces')
                .delete()
                .eq('id', id);
            if (error) {
                console.error('Error al eliminar la canción:', error.message);
            } else {
                await getRepertorio();
            }
            cargando.value = false
        }

    }

    const convertirNumeroEnTono = (numero) => {
        return tonos[numero - 1]
    }

    const router = useRouter()

    onMounted(async () => {
        if (!hasRole('voces')) {
            router.push('/')
        }
        await getRepertorio()
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

    .header-section h1 {
        color: white !important;
    }

    .filter-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        border: none;
    }

    .filter-card .card-body {
        padding: 1.5rem;
    }

    .song-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        border: none;
        transition: all 0.3s ease;
        border-left: 4px solid #667eea;
    }

    .song-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    /* Padding lateral para desktop */
    @media (min-width: 992px) {
        .song-card .card-body {
            padding: 1.5rem 2.5rem;
        }
    }

    @media (min-width: 1200px) {
        .song-card .card-body {
            padding: 1.5rem 3rem;
        }
    }

    .song-info {
        cursor: pointer;
        padding: 0.5rem 0;
    }

    .song-title {
        color: #2c3e50;
        font-weight: 600;
        margin-bottom: 0.5rem;
        transition: color 0.3s ease;
    }

    .song-info:hover .song-title {
        color: #667eea;
    }

    .song-details {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .song-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        align-items: center;
    }

    .loading-container {
        padding: 3rem 0;
    }

    .empty-state {
        background: white;
        border-radius: 15px;
        padding: 3rem 2rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        margin-top: 2rem;
    }

    .empty-icon {
        opacity: 0.6;
    }

    /* Responsividad mejorada */
    @media (max-width: 768px) {
        .header-section {
            padding: 1.5rem 1rem;
            margin: 0 1rem 2rem 1rem;
        }

        .song-row {
            flex-direction: column;
            text-align: center;
            align-items: center !important;
            justify-content: center;
        }

        .song-info {
            text-align: center;
            margin-bottom: 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .song-title {
            text-align: center;
            margin-bottom: 0.75rem !important;
        }

        .song-details {
            justify-content: center;
            margin-bottom: 0.5rem;
        }

        .song-actions {
            justify-content: center;
            margin-top: 0.5rem;
            display: flex;
            align-items: center;
        }

        .song-card .card-body {
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }

        .empty-state {
            margin: 1rem;
            padding: 2rem 1rem;
        }
    }

    /* Animaciones suaves */
    .song-card {
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

    /* Mejoras en badges */
    .badge {
        font-size: 0.85rem;
        padding: 0.5rem 0.8rem;
    }

    /* Botones mejorados */
    .btn {
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.3s ease;
    }

    .btn:hover {
        transform: translateY(-1px);
    }
</style>