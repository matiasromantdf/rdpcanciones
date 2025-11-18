<template>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Pistas del Bucket</h1>
  
      <table class="min-w-full border">
        <thead class="bg-gray-200">
          <tr>
            <th class="p-2 border">Nombre</th>
            <th class="p-2 border">Tamaño</th>
            <th class="p-2 border">Bitrate</th>
            <th class="p-2 border">Acciones</th>
          </tr>
        </thead>
  
        <tbody>
          <tr
            v-for="f in files"
            :key="f.name"
            class="border-b"
          >
            <td class="p-2 border">{{ f.name }}</td>
            <td class="p-2 border">
              {{ formatBytes(f.metadata?.size || 0) }}
            </td>
            <td class="p-2 border">
              <span v-if="f.bitrate">{{ f.bitrate }} kbps</span>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="p-2 border space-x-2">
              <button
                class="px-3 py-1 bg-blue-600 text-white rounded"
                @click="analyzeFile(f)"
              >
                Analizar
              </button>
  
              <button
                class="px-3 py-1 bg-green-600 text-white rounded"
                @click="compressFile(f)"
              >
                Comprimir (96 kbps)
              </button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <div v-if="loading" class="mt-4 text-blue-600 font-semibold">
        {{ loading }}
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import { createClient } from "@supabase/supabase-js";
  import { parseBuffer } from "music-metadata/browser";
  import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
  
  const files = ref([]);
  const loading = ref("");
  
  /* ------------------------------
     Supabase client
  --------------------------------*/
  const supabase = createClient(
    "https://YOUR_PROJECT.supabase.co",
    "YOUR_ANON_KEY"
  );
  
  /* ------------------------------
     Load files from bucket
  --------------------------------*/
  onMounted(async () => {
    const { data, error } = await supabase.storage
      .from("pistas")
      .list("", { limit: 500 });
  
    if (!error) {
      files.value = data;
    }
  });
  
  function formatBytes(bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
  }
  
  /* ------------------------------
     ANALYZE: read bitrate only
  --------------------------------*/
  async function analyzeFile(file) {
    loading.value = `Analizando ${file.name}...`;
  
    const { data } = await supabase.storage
      .from("pistas")
      .download(file.name);
  
    const buffer = await data.arrayBuffer();
    const metadata = await parseBuffer(new Uint8Array(buffer));
  
    file.bitrate = Math.round((metadata.format.bitrate || 0) / 1000);
  
    loading.value = "";
  }
  
  /* ------------------------------
     COMPRESS: convert to 96 kbps
  --------------------------------*/
  async function compressFile(file) {
    loading.value = `Comprimiendo ${file.name} a 96 kbps...`;
  
    // descargar archivo original
    const { data } = await supabase.storage
      .from("pistas")
      .download(file.name);
  
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
  
    ffmpeg.FS("writeFile", "input.mp3", await fetchFile(data));
  
    await ffmpeg.run(
      "-i",
      "input.mp3",
      "-b:a",
      "96k",
      "output.mp3"
    );
  
    const output = ffmpeg.FS("readFile", "output.mp3");
  
    // subir comprimido
    await supabase.storage
      .from("pistas")
      .upload(
        `compressed/${file.name}`,
        new Blob([output.buffer], { type: "audio/mpeg" }),
        { upsert: true }
      );
  
    loading.value = `Listo: archivo convertido y subido a /compressed/${file.name}`;
    setTimeout(() => (loading.value = ""), 3000);
  }
  </script>
  
  <style>
  table {
    border-collapse: collapse;
    width: 100%;
  }
  </style>
  