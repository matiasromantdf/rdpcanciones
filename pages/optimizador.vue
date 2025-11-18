<template>
    <div class="p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Optimizador de pistas (Supabase)</h1>
  
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded"
        @click="cargarArchivos"
      >
        Cargar archivos
      </button>
  
      <div v-if="loading" class="mt-4">{{ loading }}</div>
  
      <table v-if="files.length" class="w-full mt-6 border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="p-2 border">Nombre</th>
            <th class="p-2 border text-right">Tamaño</th>
            <th class="p-2 border text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in files" :key="f.name" class="border-b">
            <td class="p-2">{{ f.name }}</td>
            <td class="p-2 text-right">{{ formatBytes(f.sizeBytes) }}</td>
            <td class="p-2 text-center">
              <button
                class="px-3 py-1 bg-green-600 text-white rounded"
                @click="procesarArchivo(f)"
                :disabled="procesando === f.name"
              >
                <span v-if="procesando === f.name">Procesando...</span>
                <span v-else>Comprimir</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <p v-else class="text-gray-600 mt-6">No hay archivos.</p>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue"
  import { useSupabaseClient } from "#imports"
  
  // FFmpeg imports
  import { FFmpeg } from "@ffmpeg/ffmpeg"
  import { fetchFile } from "@ffmpeg/util"
  
  // Supabase client
  const supabase = useSupabaseClient()
  const bucketName = "pistas"
  
  // UI state
  const files = ref([])
  const loading = ref("")
  const procesando = ref(null)
  
  // FFmpeg init
  const ffmpeg = new FFmpeg()
  let ffmpegLoaded = false
  
  async function loadFFmpeg() {
    if (!ffmpegLoaded) {
      loading.value = "Cargando FFmpeg..."
      await ffmpeg.load({
        coreURL: "https://unpkg.com/@ffmpeg/core@0.12.4/dist/ffmpeg-core.js"
      })
      ffmpegLoaded = true
    }
  }
  
  // ---------- UTIL ----------
  function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return "—"
    if (bytes === 0) return "0 B"
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i]
  }
  
  // ---------- LISTAR ----------
  async function cargarArchivos() {
    loading.value = "Cargando archivos..."
  
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list("", { limit: 200 })
  
    if (error) {
      loading.value = "Error al listar"
      return
    }
  
    // Obtener tamaño por HEAD request
    const listado = await Promise.all(
      data.map(async (f) => {
        let sizeBytes = null
        try {
          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(f.name)
  
          const head = await fetch(urlData.publicUrl, { method: "HEAD" })
          sizeBytes = Number(head.headers.get("content-length"))
        } catch (e) {
          console.warn("No se pudo obtener tamaño de", f.name)
        }
  
        return {
          name: f.name,
          sizeBytes
        }
      })
    )
  
    files.value = listado
    loading.value = ""
  }
  
  // ---------- PROCESAR UN ARCHIVO ----------
  async function procesarArchivo(file) {
    procesando.value = file.name
  
    await loadFFmpeg()
  
    // 1. Descargar archivo original
    loading.value = "Descargando..."
  
    const { data: dl, error: dlErr } = await supabase.storage
      .from(bucketName)
      .download(file.name)
  
    if (dlErr) {
      alert("Error al descargar: " + dlErr.message)
      procesando.value = null
      return
    }
  
    // 2. Guardar en FFmpeg FS
    const inputName = "input.mp3"
    const outputName = "output.mp3"
  
    ffmpeg.writeFile(inputName, await fetchFile(dl))
  
    // 3. Ejecutar compresión
    loading.value = "Comprimiendo..."
  
    await ffmpeg.exec([
      "-i", inputName,
      "-b:a", "96k",
      "-ar", "44100",
      outputName
    ])
  
    // 4. Leer archivo comprimido
    const data = await ffmpeg.readFile(outputName)
    const blob = new Blob([data], { type: "audio/mpeg" })
  
    // 5. Subir y reemplazar
    loading.value = "Subiendo..."
  
    const { error: upErr } = await supabase.storage
      .from(bucketName)
      .upload(file.name, blob, { upsert: true })
  
    if (upErr) {
      alert("Error al subir: " + upErr.message)
    } else {
      alert("Archivo reemplazado correctamente")
      cargarArchivos()
    }
  
    procesando.value = null
    loading.value = ""
  }
  </script>
  
  <style scoped>
  table th,
  table td {
    border: 1px solid #ddd;
  }
  </style>
  