<template>
    <div class="voz">
        <p>{{ voz.nombre }}</p>
        <button class="btn btn-sm btn-danger" @click="eliminarVoz">X</button>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Define the props
const props = defineProps({
    voz: {
        type: Object,
        required: true
    }
})

// Define the emits
const emit = defineEmits(['eliminar'])

// Function to emit the 'eliminar' event
const eliminarVoz = () => {
    emit('eliminar', props.voz.id)
}

</script>

<style scoped>
.voz {
    border: 1px solid #ccc;
    padding: 5px;
    margin: 10px;
    border-radius: 5px;
    display: flex;
    justify-content: space-between;
    width: 400px;
    background-color: #f3f6f8;
    height: 40px;
}

@media (max-width: 768px) {
    .voz {
        width: 95%;
    }
}
</style>