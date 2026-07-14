<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  logText: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.body.classList.add('modal-open')
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.classList.remove('modal-open')
})
</script>

<template>
  <div>
    <!-- Backdrop -->
    <div class="modal-backdrop fade show" style="z-index: 1050;"></div>
    
    <!-- Modal -->
    <div class="modal fade show d-block shadow-lg" style="z-index: 1055;" tabindex="-1" @click.self="$emit('close')">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0">
          <div class="modal-header bg-danger text-white border-0">
            <h5 class="modal-title fw-bold">Job Execution Logs</h5>
            <button type="button" class="btn-close btn-close-white" aria-label="Close" @click="$emit('close')"></button>
          </div>
          <div class="modal-body p-0 bg-dark text-light" style="max-height: 60vh; overflow-y: auto;">
            <pre class="m-0 p-3" style="white-space: pre-wrap; font-family: monospace; font-size: 0.85rem;">{{ logText }}</pre>
          </div>
          <div class="modal-footer border-0 bg-light">
            <button type="button" class="btn btn-secondary px-4 fw-bold" @click="$emit('close')">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
