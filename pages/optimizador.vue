<script setup>
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import * as mm from 'music-metadata-browser'

// ✔ FFmpeg desde CDN (sin instalar nada)
import { createFFmpeg, fetchFile } from "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.2/+esm"

const supabase = useSupabaseClient()

const ffmpeg = createFFmpeg({ log: true })
const ffmpegLoaded = ref(false)

const files = ref([])
const loading = ref(false)

const bucketName = 'pistas' /// <-- CAMBIAR

// Cargar FFmpeg vía CDN
const loadFFmpeg = async () => {
  if (!ffmpegLoaded.value) {
    await ffmpeg.load()
    ffmpegLoaded.value = true
  }
}

// Listar archivos del bucket
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
        size: file.metadata?.size
          ? file.metadata.size / 1024 / 1024
          : 0,
        url: url.publicUrl,
        ...metadata
      }
    })
  )

  loading.value = false
}

// Obtener metadata de audio
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
    return {
      duration: null,
      bitrate: null,
      sampleRate: null
    }
  }
}

// Comprimir a 96 kbps
const comprimir = async (file) => {
  await loadFFmpeg()

  const resp = await fetch(file.url)
  const arrayBuf = await resp.arrayBuffer()

  ffmpeg.FS('writeFile', 'input.mp3', new Uint8Array(arrayBuf))

  await ffmpeg.run(
    '-i', 'input.mp3',
    '-b:a', '96k',
    '-ar', '44100',
    'output.mp3'
  )

  const data = ffmpeg.FS('readFile', 'output.mp3')
  return new Blob([data.buffer], { type: 'audio/mpeg' })
}

// Subir el archivo comprimido
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

<template>
  <div class="container py-4">
    <h2>Optimizador de Audio</h2>

    <button class="btn btn-primary my-3" @click="cargarArchivos">
      🔄 Cargar archivos del bucket
    </button>

    <div v-if="loading">Cargando...</div>

    <table class="table" v-if="files.length">
      <thead>
        <tr>
          <th>Archivo</th>
          <th>Tamaño</th>
          <th>Bitrate</th>
          <th>Duración</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="file in files" :key="file.name">
          <td>{{ file.name }}</td>
          <td>{{ file.size.toFixed(2) }} MB</td>
          <td>{{ file.bitrate ? file.bitrate + ' kbps' : '---' }}</td>
          <td>{{ file.duration ? file.duration.toFixed(1) + ' s' : '---' }}</td>

          <td>
            <span
              class="badge"
              :class="file.bitrate > 128 ? 'bg-danger' : 'bg-success'"
            >
              {{ file.bitrate > 128 ? 'Pesado' : 'OK' }}
            </span>
          </td>

          <td>
            <button
              class="btn btn-sm btn-warning me-2"
              @click="async () => {
                const b = await comprimir(file)
                subirArchivo(file, b, false)
              }"
            >
              Copia 96 kbps
            </button>

            <button
              class="btn btn-sm btn-danger"
              @click="async () => {
                const b = await comprimir(file)
                subirArchivo(file, b, true)
              }"
            >
              Reemplazar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
