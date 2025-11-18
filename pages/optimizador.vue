<template>
    <div class="p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Listar archivos - Bucket "{{ bucketName }}"</h1>
  
      <div class="mb-4 flex gap-2">
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="cargarArchivos">
          🔄 Cargar archivos
        </button>
  
        <span v-if="loading" class="text-sm text-gray-600 self-center">{{ loading }}</span>
      </div>
  
      <table v-if="files.length" class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="p-2 text-left border">Nombre</th>
            <th class="p-2 text-right border">Tamaño</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in files" :key="f.name" class="border-b">
            <td class="p-2">{{ f.name }}</td>
            <td class="p-2 text-right">{{ formatBytes(f.sizeBytes) }}</td>
          </tr>
        </tbody>
      </table>
  
      <div v-else class="mt-6 text-gray-600">
        No hay archivos o aún no cargaste la lista.
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useSupabaseClient } from '#imports'
  
  const supabase = useSupabaseClient()
  
  // Cambiá el nombre del bucket si corresponde
  const bucketName = 'pistas'
  
  const files = ref([])
  const loading = ref('')
  
  // Formatea bytes a KB/MB/GB legible
  function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return '—'
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  // Carga listado del bucket y extrae size (en bytes) en cada item
  async function cargarArchivos() {
    loading.value = 'Cargando...'
    files.value = []
  
    try {
      // Listar objetos del bucket (ajustá limit si necesitás más)
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 1000 })
  
      if (error) {
        console.error('Error listando bucket:', error)
        loading.value = 'Error al listar archivos'
        return
      }
  
      // Supabase devuelve objetos con metadata, pero no siempre incluye size en metadata.
      // Aquí intentamos usar file.metadata.size si existe; si no, hacemos HEAD para obtener tamaño.
      const mapped = await Promise.all(
        data.map(async (f) => {
          let sizeBytes = null
  
          // caso 1: la respuesta tiene metadata.size (algunas SDKs lo proveen)
          if (f?.metadata?.size) {
            sizeBytes = Number(f.metadata.size)
          } else {
            // caso 2: intentamos usar getPublicUrl y hacer HEAD para obtener content-length (rápido)
            try {
              const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(f.name)
              const url = urlData.publicUrl
              // Hacemos una HEAD request para obtener tamaño sin descargar
              const headResp = await fetch(url, { method: 'HEAD' })
              const cl = headResp.headers.get('content-length')
              if (cl) sizeBytes = Number(cl)
            } catch (e) {
              // si falla, lo dejamos null y se mostrará —
              console.warn('No se pudo obtener tamaño por HEAD para', f.name, e)
              sizeBytes = null
            }
          }
  
          return {
            name: f.name,
            sizeBytes
          }
        })
      )
  
      files.value = mapped
      loading.value = ''
    } catch (e) {
      console.error(e)
      loading.value = 'Error inesperado'
    }
  }
  </script>
  
  <style scoped>
  table th, table td { border: 1px solid #e5e7eb; }
  </style>
  