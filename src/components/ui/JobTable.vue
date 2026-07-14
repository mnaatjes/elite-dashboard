<script setup>
import { ref, onMounted, watch } from 'vue'
import LogModal from './LogModal.vue'

const props = defineProps({
  sourceId: {
    type: String,
    default: null
  }
})

const jobs = ref([])
const loading = ref(true)
const error = ref(null)

const activeLog = ref(null)

const fetchJobs = async () => {
  loading.value = true
  try {
    let url = '/api/v1/jobs/'
    if (props.sourceId) {
      url += `?source_id=${props.sourceId}`
    }
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to load job history')
    const data = await response.json()
    jobs.value = Array.isArray(data) ? data : (data.jobs || [])
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const viewLogs = async (jobId) => {
  try {
    const response = await fetch(`/api/v1/jobs/${jobId}/logs`)
    if (!response.ok) throw new Error('Failed to load logs')
    const data = await response.json()
    activeLog.value = data.logs || 'No logs available.'
  } catch (err) {
    activeLog.value = 'Error fetching logs: ' + err.message
  }
}

onMounted(() => {
  fetchJobs()
})

watch(() => props.sourceId, () => {
  fetchJobs()
})
</script>

<template>
  <div class="card border-0 shadow-sm">
    <div class="card-header bg-transparent border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
      <h5 class="mb-0 fw-bold text-secondary">{{ sourceId ? 'Pipeline History' : 'Global Job Ledger' }}</h5>
      <button class="btn btn-sm btn-outline-secondary" @click="fetchJobs" :disabled="loading">
        <i class="bi bi-arrow-clockwise"></i> Refresh
      </button>
    </div>
    <div class="card-body p-0 mt-3">
      <div v-if="loading" class="text-center p-4">
        <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
      </div>
      <div v-else-if="error" class="alert alert-danger m-3">{{ error }}</div>
      <div v-else class="table-responsive" style="max-height: 400px; overflow-y: auto;">
        <table class="table table-hover table-sm mb-0 align-middle">
          <thead class="table-light sticky-top">
            <tr>
              <th class="ps-3">Phase</th>
              <th>Status</th>
              <th>Started At</th>
              <th class="text-end pe-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="jobs.length === 0">
              <td colspan="4" class="text-center text-muted p-4">No jobs found.</td>
            </tr>
            <tr v-for="job in jobs" :key="job.id" 
                :class="{
                  'table-danger': job.status === 'failed',
                  'table-warning': job.status === 'skipped',
                  'table-success': job.status === 'success'
                }">
              <td class="ps-3">
                <span class="badge text-capitalize" :class="{
                  'bg-medallion-bronze': job.phase === 'bronze_sync',
                  'bg-medallion-silver': job.phase === 'silver_normalize',
                  'bg-medallion-gold': job.phase === 'gold_aggregate',
                  'bg-secondary': !job.phase || !['bronze_sync', 'silver_normalize', 'gold_aggregate'].includes(job.phase)
                }">
                  {{ job.phase ? job.phase.replace('_', ' ') : 'Unknown' }}
                </span>
              </td>
              <td class="fw-semibold text-uppercase" style="font-size: 0.85rem;">{{ job.status }}</td>
              <td class="text-muted" style="font-size: 0.85rem;">{{ new Date(job.started_at + 'Z').toLocaleString() }}</td>
              <td class="text-end pe-3">
                <button v-if="job.status === 'failed'"
                        class="btn btn-sm btn-outline-dark fw-bold" 
                        @click="viewLogs(job.id)">
                  View Logs
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <LogModal v-if="activeLog" :logText="activeLog" @close="activeLog = null" />
  </div>
</template>
