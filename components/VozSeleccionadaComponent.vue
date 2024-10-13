<template>
    <div class="voz">
        <h4>{{ voz.nombre }}</h4>
        <button class="btn btn-danger" @click="eliminarVoz">X</button>
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
    padding: 10px;
    margin: 10px;
    border-radius: 5px;
    display: flex;
    justify-content: space-between;
    width: 400px;
    background-color: #e6ebf0;
}

@media (max-width: 768px) {
    .voz {
        width: 100%;
    }
}
</style>