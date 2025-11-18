<script setup>
import { ref } from 'vue'
import { useSupabaseClient } from '#imports'

// IMPORTS CORRECTOS
import * as mm from "music-metadata-browser"
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"

// Supabase
const supabase = useSupabaseClient()

// FFmpeg
const ffmpeg = createFFmpeg({
  log: true,
  corePath: "/ffmpeg-core.js",
})

const ffmpegLoaded = ref(false)
const files = ref([])
const loading = ref(false)

const bucketName = 'pistas'

// Cargar FFmpeg
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

// Leer metadata del audio
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

// Subir archivo comprimido
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
