<template>
    <div class="p-6 max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Optimizador de Pistas</h1>
  
      <button
        @click="cargarArchivos"
        class="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Cargar archivos
      </button>
  
      <div v-if="loading" class="mt-4">Cargando...</div>
  
      <div v-if="files.length" class="mt-6 space-y-4">
        <div
          v-for="file in files"
          :key="file.name"
          class="p-4 border rounded shadow-sm bg-white"
        >
          <h2 class="font-semibold">{{ file.name }}</h2>
  
          <p class="text-sm text-gray-600">
            Tamaño: {{ file.size.toFixed(2) }} MB
          </p>
  
          <p class="text-sm text-gray-600">
            Duración: {{ file.duration ? file.duration.toFixed(1) + 's' : '—' }}
          </p>
  
          <p class="text-sm text-gray-600">
            Bitrate: <strong>{{ file.bitrate ? file.bitrate + ' kbps' : '—' }}</strong>
          </p>
  
          <div class="mt-3 flex gap-3">
            <button
              @click="optimizar(file)"
              class="px-3 py-1 bg-green-600 text-white rounded"
            >
              Comprimir a 96 kbps
            </button>
  
            <button
              @click="optimizar(file, true)"
              class="px-3 py-1 bg-red-600 text-white rounded"
            >
              Reemplazar archivo
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useSupabaseClient } from '#imports'
  import * as mm from "music-metadata-browser"
  
  // Supabase
  const supabase = useSupabaseClient()
  const bucketName = 'pistas'
  
  // Estados
  const ffmpeg = ref(null)
  const ffmpegLoaded = ref(false)
  const files = ref([])
  const loading = ref(false)
  
  // ===========================
  // 1. Cargar FFmpeg (solo cliente)
  // ===========================
  const loadFFmpeg = async () => {
    if (ffmpegLoaded.value) return
  
    // IMPORT dinámico → evita errores SSR
    const ffmpegModule = await import("@ffmpeg/ffmpeg")
    const { createFFmpeg, fetchFile } = ffmpegModule
  
    ffmpeg.value = createFFmpeg({
      log: true,
      corePath: "/ffmpeg-core.js", // lo sirve el navegador automáticamente
    })
  
    await ffmpeg.value.load()
    ffmpegLoaded.value = true
  }
  
  onMounted(async () => {
    await loadFFmpeg()
  })
  
  // ===========================
  // 2. Cargar archivos del bucket
  // ===========================
  const cargarArchivos = async () => {
    loading.value = true
  
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 100 })
  
    if (error) {
      console.error(error)
      loading.value = false
      return
    }
  
    files.value = await Promise.all(
      data.map(async (file) => {
        const { data: url } = supabase.storage
          .from(bucketName)
          .getPublicUrl(file.name)
  
        const metadata = await obtenerMetadata(url.publicUrl)
  
        return {
          name: file.name,
          size: file.metadata?.size ? file.metadata.size / 1024 / 1024 : 0,
          url: url.publicUrl,
          ...metadata,
        }
      })
    )
  
    loading.value = false
  }
  
  // ===========================
  // 3. Leer metadata (bitrate, duracion…)
  // ===========================
  const obtenerMetadata = async (url) => {
    try {
      const resp = await fetch(url)
      const buf = await resp.arrayBuffer()
      const meta = await mm.parseBuffer(Buffer.from(buf))
  
      return {
        duration: meta.format.duration,
        bitrate: meta.format.bitrate ? meta.format.bitrate / 1000 : null,
        sampleRate: meta.format.sampleRate
      }
    } catch (e) {
      console.warn("No se pudo leer metadata", e)
      return { duration: null, bitrate: null, sampleRate: null }
    }
  }
  
  // ===========================
  // 4. Comprimir a 96 kbps
  // ===========================
  const comprimir = async (file) => {
    await loadFFmpeg()
  
    const resp = await fetch(file.url)
    const arrayBuf = await resp.arrayBuffer()
  
    ffmpeg.value.FS('writeFile', 'input.mp3', new Uint8Array(arrayBuf))
  
    await ffmpeg.value.run(
      '-i', 'input.mp3',
      '-b:a', '96k',
      '-ar', '44100',
      'output.mp3'
    )
  
    const data = ffmpeg.value.FS('readFile', 'output.mp3')
    return new Blob([data.buffer], { type: 'audio/mpeg' })
  }
  
  // ===========================
  // 5. Ejecuta proceso + sube archivo
  // ===========================
  const optimizar = async (file, replace = false) => {
    const blob = await comprimir(file)
    await subirArchivo(file, blob, replace)
  }
  
  // ===========================
  // 6. Subir a Supabase
  // ===========================
  const subirArchivo = async (file, blob, replace = false) => {
    const fileName = replace
      ? file.name
      : file.name.replace('.mp3', '_96.mp3')
  
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, blob, { upsert: replace })
  
    if (error) {
      alert('Error al subir: ' + error.message)
    } else {
      alert('Archivo subido con éxito')
      cargarArchivos()
    }
  }
  </script>
  