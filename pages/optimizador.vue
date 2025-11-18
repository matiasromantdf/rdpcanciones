<template>
    <div class="p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Optimizador de pistas</h1>
  
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded"
        @click="cargarArchivos"
      >
        Cargar archivos
      </button>
  
      <div v-if="loading" class="mt-3">{{ loading }}</div>
  
      <table
        v-if="files.length"
        class="w-full mt-6 border-collapse border border-gray-300"
      >
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-2">Archivo</th>
            <th class="border p-2 text-right">Tamaño</th>
            <th class="border p-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in files" :key="f.name">
            <td class="border p-2">{{ f.name }}</td>
            <td class="border p-2 text-right">
              {{ formatBytes(f.sizeBytes) }}
            </td>
            <td class="border p-2 text-center">
              <button
                class="px-3 py-1 bg-green-600 text-white rounded"
                @click="procesarArchivo(f)"
                :disabled="procesando === f.name"
              >
                <span v-if="procesando === f.name">Procesando…</span>
                <span v-else>Comprimir</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  definePageMeta({
    ssr: false
  })
  
  import { ref, onMounted } from "vue"
  import { useSupabaseClient } from "#imports"
  
  const supabase = useSupabaseClient()
  const bucketName = "pistas"
  
  const files = ref([])
  const loading = ref("")
  const procesando = ref(null)
  
  let FFmpeg = null
  let fetchFile = null
  let ffmpeg = null
  
  onMounted(async () => {
    // Cargar FFmpeg solo en cliente
    const ffmpegModule = await import("@ffmpeg/ffmpeg")
    const utilModule = await import("@ffmpeg/util")
  
    FFmpeg = ffmpegModule.FFmpeg
    fetchFile = utilModule.fetchFile
  
    ffmpeg = new FFmpeg()
  })
  
  async function loadFFmpeg() {
    if (!ffmpeg.loaded) {
      loading.value = "Cargando FFmpeg…"
      await ffmpeg.load({
        coreURL: "https://unpkg.com/@ffmpeg/core@0.12.4/dist/ffmpeg-core.js"
      })
    }
  }
  
  function formatBytes(bytes) {
    if (!bytes) return "—"
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i]
  }
  
  async function cargarArchivos() {
    loading.value = "Cargando archivos…"
  
    const { data } = await supabase.storage
      .from(bucketName)
      .list("", { limit: 200 })
  
    files.value = await Promise.all(
      data.map(async (f) => {
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(f.name)
  
        let sizeBytes = null
        try {
          const head = await fetch(urlData.publicUrl, { method: "HEAD" })
          sizeBytes = Number(head.headers.get("content-length"))
        } catch {}
  
        return { name: f.name, sizeBytes }
      })
    )
  
    loading.value = ""
  }
  
  async function procesarArchivo(file) {
    procesando.value = file.name
  
    await loadFFmpeg()
  
    loading.value = "Descargando audio…"
    const { data: dl } = await supabase.storage
      .from(bucketName)
      .download(file.name)
  
    ffmpeg.writeFile("input.mp3", await fetchFile(dl))
  
    loading.value = "Comprimiendo…"
    await ffmpeg.exec([
      "-i",
      "input.mp3",
      "-b:a",
      "96k",
      "-ar",
      "44100",
      "output.mp3"
    ])
  
    loading.value = "Subiendo…"
    const data = await ffmpeg.readFile("output.mp3")
    const blob = new Blob([data], { type: "audio/mpeg" })
  
    await supabase.storage
      .from(bucketName)
      .upload(file.name, blob, { upsert: true })
  
    alert("Archivo reemplazado 👍")
    procesando.value = null
    cargarArchivos()
  }
  </script>
  