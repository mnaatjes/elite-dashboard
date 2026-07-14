<script setup>
import { ref } from 'vue'

const emit = defineEmits(['source-registered'])

const formData = ref({
  name: '',
  download_uri: '',
  schedule_interval_hours: 24
})

const loading = ref(false)
const error = ref(null)
const success = ref(false)

const submitForm = async () => {
  loading.value = true
  error.value = null
  success.value = false
  
  try {
    const response = await fetch('/api/v1/sources/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData.value)
    })
    
    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData.detail || 'Failed to register source')
    }
    
    success.value = true
    emit('source-registered')
    
    // Reset form
    formData.value = {
      name: '',
      download_uri: '',
      schedule_interval_hours: 24
    }
    
    // Hide success message after 3 seconds
    setTimeout(() => { success.value = false }, 3000)
    
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="card mb-4 shadow-sm border-0">
    <div class="card-header bg-transparent border-0 pt-4 pb-0">
      <h4 class="mb-0 text-primary fw-bold">Quick Source Registration</h4>
    </div>
    <div class="card-body">
      <div v-if="success" class="alert alert-success alert-dismissible fade show" role="alert">
        Source registered successfully!
        <button type="button" class="btn-close" @click="success = false"></button>
      </div>
      <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
        {{ error }}
        <button type="button" class="btn-close" @click="error = null"></button>
      </div>
      
      <form @submit.prevent="submitForm">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label fw-semibold text-secondary">Source Name</label>
            <input type="text" class="form-control" v-model="formData.name" required placeholder="e.g. spansh_systems">
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold text-secondary">Download URI</label>
            <input type="url" class="form-control" v-model="formData.download_uri" required placeholder="https://...">
          </div>
          <div class="col-md-2">
            <label class="form-label fw-semibold text-secondary">Interval (Hrs)</label>
            <input type="number" class="form-control" v-model="formData.schedule_interval_hours" min="1" required>
          </div>
          <div class="col-12 mt-4 text-end">
            <button type="submit" class="btn btn-primary px-4 fw-bold" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Register Source
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
