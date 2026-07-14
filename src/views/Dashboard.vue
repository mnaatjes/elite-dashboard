<script setup>
import { ref, onMounted } from 'vue'
import AnalyticsCards from '../components/ui/AnalyticsCards.vue'
import SourceRegistrationForm from '../components/ui/SourceRegistrationForm.vue'
import JobTable from '../components/ui/JobTable.vue'

const sources = ref([])
const expandedRows = ref([])
const loadingSources = ref(true)

const fetchSources = async () => {
  loadingSources.value = true
  try {
    const response = await fetch('/api/v1/sources/')
    if (response.ok) {
      sources.value = await response.json()
    }
  } catch (err) {
    console.error('Failed to load sources', err)
  } finally {
    loadingSources.value = false
  }
}

const handleAction = async (sourceId, action) => {
  try {
    const response = await fetch(`/api/v1/sources/${sourceId}/${action}`, { method: 'PUT' })
    if (response.ok) {
      fetchSources()
    }
  } catch (err) {
    console.error(`Failed to ${action} source`, err)
  }
}

const toggleHistory = (id) => {
  const index = expandedRows.value.indexOf(id)
  if (index === -1) {
    expandedRows.value.push(id)
  } else {
    expandedRows.value.splice(index, 1)
  }
}

onMounted(() => {
  fetchSources()
})
</script>

<template>
  <div class="container-fluid py-4">
    <!-- Section 1: Global Analytics -->
    <AnalyticsCards />

    <!-- Section 2: Registration Form -->
    <SourceRegistrationForm @source-registered="fetchSources" />

    <!-- Section 3: Active Pipelines Ledger -->
    <div class="card mb-4 shadow-sm border-0">
      <div class="card-header bg-transparent border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
        <h4 class="mb-0 text-primary fw-bold">Active Pipelines Ledger</h4>
        <button class="btn btn-sm btn-outline-secondary" @click="fetchSources">
          <i class="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>
      <div class="card-body">
        <div v-if="loadingSources" class="text-center p-4">
          <div class="spinner-border text-primary" role="status"></div>
        </div>
        <div v-else-if="sources.length === 0" class="text-center text-muted p-4">
          No pipelines registered. Use the form above to add one.
        </div>
        <div v-else class="pipeline-list">
          <div v-for="source in sources" :key="source.id" class="mb-3">
            <div class="pipeline-card d-flex w-100 justify-content-between align-items-center p-3 border rounded shadow-sm bg-white">
              <div>
                <h5 class="mb-1 fw-bold">{{ source.name }}</h5>
                <div class="text-muted small mb-2">ID: {{ source.id }}</div>
                <div class="d-flex gap-2">
                  <span class="badge" 
                        :class="{'bg-warning text-dark': source.state === 'pending_hitl', 'bg-success': source.state === 'approved', 'bg-danger': source.state === 'rejected'}">
                    {{ source.state }}
                  </span>
                  <span class="badge" :class="{
                    'bg-medallion-bronze': source.location === 'BRONZE_SYNCED',
                    'bg-medallion-silver': source.location === 'SILVER_NORMALIZED',
                    'bg-medallion-gold': source.location === 'GOLD_AGGREGATED',
                    'bg-light text-dark': !source.location || source.location === 'REGISTERED'
                  }">
                    {{ source.location || 'REGISTERED' }}
                  </span>
                </div>
              </div>
              <div class="btn-group shadow-sm">
                <template v-if="source.state === 'pending_hitl'">
                  <button class="btn btn-success fw-bold" @click="handleAction(source.id, 'approve')">Approve</button>
                  <button class="btn btn-danger fw-bold" @click="handleAction(source.id, 'reject')">Reject</button>
                </template>
                <button class="btn btn-secondary fw-bold" @click="toggleHistory(source.id)">
                  {{ expandedRows.includes(source.id) ? 'Hide History' : 'Job History' }}
                </button>
                <router-link :to="'/pipelines/' + source.id" class="btn btn-primary fw-bold">
                  Manage Pipeline
                </router-link>
              </div>
            </div>
            
            <!-- Accordion collapse for Job History -->
            <div v-if="expandedRows.includes(source.id)" class="collapse show mt-2 ps-4 border-start border-3 border-secondary">
              <JobTable :source-id="source.id" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 4: Global Job History Ledger -->
    <div class="mt-5">
      <JobTable />
    </div>
  </div>
</template>
