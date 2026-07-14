<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  initialSql: {
    type: String,
    default: ''
  },
  validationStatus: {
    type: Object,
    default: () => ({ success: false, message: '', error: '' })
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['dryRun', 'submit'])
const localSql = ref(props.initialSql)
const validated = ref(false)

watch(() => props.validationStatus, (newVal) => {
  validated.value = newVal?.success === true
}, { deep: true })

// Reset validation state when user edits SQL
watch(localSql, () => {
  validated.value = false
})

const handleDryRun = () => {
  emit('dryRun', localSql.value)
}

const handleSubmit = () => {
  emit('submit', localSql.value)
}
</script>

<template>
  <div class="wireframe-box">
    <h3>SQL Transformation Editor</h3>
    
    <div v-if="validationStatus.error" style="color: red; margin-bottom: 1rem; border: 1px solid red; padding: 0.5rem;">
      <strong>Error:</strong> {{ validationStatus.error }}
    </div>
    
    <div v-if="validationStatus.message && validationStatus.success" style="color: green; margin-bottom: 1rem; border: 1px solid green; padding: 0.5rem;">
      <strong>Success:</strong> {{ validationStatus.message }}
    </div>

    <textarea 
      v-model="localSql"
      style="width: 100%; height: 200px; font-family: monospace; padding: 0.5rem; margin-bottom: 1rem;"
      placeholder="CREATE TABLE AS SELECT..."
      :disabled="isLoading"
    ></textarea>
    
    <div>
      <button @click="handleDryRun" :disabled="isLoading || !localSql">Dry Run Validate</button>
      <button @click="handleSubmit" :disabled="isLoading || !validated" style="margin-left: 1rem;">
        Submit Template
      </button>
    </div>
  </div>
</template>
