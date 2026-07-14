<script setup>
import { ref, onMounted } from 'vue'

const analytics = ref({
  total_sources: 0,
  total_tables: 0,
  successful_jobs: 0,
  failed_jobs: 0,
  running_jobs: 0
})
const loading = ref(true)
const error = ref(null)

const fetchAnalytics = async () => {
  try {
    const response = await fetch('/api/v1/analytics/overview')
    if (!response.ok) throw new Error('Failed to fetch analytics')
    analytics.value = await response.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAnalytics()
})
</script>

<template>
  <div class="card mb-4 shadow-sm border-0">
    <div class="card-header bg-transparent border-0 pt-4 pb-0">
      <h4 class="mb-0 text-primary fw-bold">Global Analytics Overview</h4>
    </div>
    <div class="card-body">
      <div v-if="loading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-else class="row g-3">
        <div class="col-md-3">
          <div class="card bg-primary text-white h-100 border-0 rounded-3 shadow-sm">
            <div class="card-body text-center">
              <h5 class="card-title opacity-75">Total Sources</h5>
              <h2 class="display-5 fw-bold mb-0">{{ analytics.total_sources }}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-info text-white h-100 border-0 rounded-3 shadow-sm">
            <div class="card-body text-center">
              <h5 class="card-title opacity-75">Active Tables</h5>
              <h2 class="display-5 fw-bold mb-0">{{ analytics.total_tables }}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-success text-white h-100 border-0 rounded-3 shadow-sm">
            <div class="card-body text-center">
              <h5 class="card-title opacity-75">Successful Jobs</h5>
              <h2 class="display-5 fw-bold mb-0">{{ analytics.successful_jobs }}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-danger text-white h-100 border-0 rounded-3 shadow-sm">
            <div class="card-body text-center">
              <h5 class="card-title opacity-75">Failed Jobs</h5>
              <h2 class="display-5 fw-bold mb-0">{{ analytics.failed_jobs }}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
