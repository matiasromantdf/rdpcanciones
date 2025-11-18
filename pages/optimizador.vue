<script setup>
definePageMeta({ ssr: false })

import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'

const supabase = useSupabaseClient()

let mm = null
let createFFmpeg = null
let fetchFile = null

const ffmpeg = ref(null)
const ffmpegLoaded = ref(false)

const files = ref([])
const loading = ref(false)

const bucketName = 'pistas'

// ⬇️ Se cargan las librerías SOLO en el navegador (evita errores en build)
onMounted(async () => {
    mm = await import("https://unpkg.com/music-metadata-browser@2.6.1/dist/music-metadata-browser.esm.min.js")
  const ff = await import("https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.2/+esm")
  createFFmpeg = ff.createFFmpeg
  fetchFile = ff.fetchFile

  ffmpeg.value = createFFmpeg({ log: true })
})

const loadFFmpeg = async () => {
  if (!ffmpegLoaded.value) {
    await ffmpeg.value.load()
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

const obtenerMetadata = async (url) => {
  try {
    const resp = await fetch(url)
    const buf = await resp.arrayBuffer()
    const meta = await mm.parseBuffer(new Uint8Array(buf))

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
