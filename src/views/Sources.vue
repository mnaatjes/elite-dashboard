<script setup>
import { ref, onMounted } from 'vue'
import { sourcesApi } from '../api/sources'
import { catalogApi } from '../api/catalog'

const sources = ref([])
const loading = ref(false)
const error = ref(null)

// Form state
const newSourceName = ref('')
const newSourceUrl = ref('')
const newSourceInterval = ref(24)

const fetchSources = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await sourcesApi.getSources()
    // Handle array or wrapped response depending on backend structure
    sources.value = Array.isArray(data) ? data : (data.sources || [])
  } catch (err) {
    error.value = err.message || 'Failed to load sources'
  } finally {
    loading.value = false
  }
}

const handleAddSource = async () => {
  if (!newSourceName.value || !newSourceUrl.value) return
  
  try {
    await sourcesApi.createSource({
      name: newSourceName.value,
      download_uri: newSourceUrl.value,
      schedule_interval_hours: parseInt(newSourceInterval.value, 10)
    })
    // Reset form and refresh list
    newSourceName.value = ''
    newSourceUrl.value = ''
    newSourceInterval.value = 24
    await fetchSources()
  } catch (err) {
    error.value = err.message || 'Failed to create source'
  }
}

const handleSync = async (sourceId) => {
  try {
    const response = await catalogApi.triggerBronzeSync(sourceId)
    alert(`Sync triggered successfully. Job ID: ${response.job_id}`)
  } catch (err) {
    alert(`Failed to trigger sync: ${err.message}`)
  }
}

onMounted(() => {
  fetchSources()
})
</script>

<template>
  <div class="wireframe-box">
    <h1>Source Management</h1>
    
    <div v-if="error" style="color: red; margin-bottom: 1rem; border: 1px solid red; padding: 0.5rem;">
      {{ error }}
    </div>

    <!-- Registration Form -->
    <div class="wireframe-box" style="background: #f9f9f9;">
      <h3>Register New Data Source</h3>
      <form @submit.prevent="handleAddSource" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
        <input v-model="newSourceName" placeholder="Source Name (e.g. spansh)" required />
        <input v-model="newSourceUrl" type="url" placeholder="Download URI" style="flex: 1;" required />
        <label>
          Interval (hrs):
          <input v-model="newSourceInterval" type="number" min="1" style="width: 60px;" required />
        </label>
        <button type="submit">Add Source</button>
      </form>
    </div>

    <!-- Sources Table -->
    <div v-if="loading">Loading sources...</div>
    <table v-else style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
      <thead>
        <tr>
          <th style="border-bottom: 1px solid var(--border-color); text-align: left; padding: 0.5rem;">ID</th>
          <th style="border-bottom: 1px solid var(--border-color); text-align: left; padding: 0.5rem;">Name</th>
          <th style="border-bottom: 1px solid var(--border-color); text-align: left; padding: 0.5rem;">URL</th>
          <th style="border-bottom: 1px solid var(--border-color); text-align: left; padding: 0.5rem;">Interval</th>
          <th style="border-bottom: 1px solid var(--border-color); text-align: left; padding: 0.5rem;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="sources.length === 0">
          <td colspan="5" style="text-align: center; padding: 1rem;">No sources registered.</td>
        </tr>
        <tr v-for="source in sources" :key="source.id || source.source_id">
          <td style="padding: 0.5rem;">{{ source.id || source.source_id }}</td>
          <td style="padding: 0.5rem; font-weight: bold;">{{ source.name }}</td>
          <td style="padding: 0.5rem;">{{ source.download_uri }}</td>
          <td style="padding: 0.5rem;">{{ source.schedule_interval_hours }}h</td>
          <td style="padding: 0.5rem;">
            <button @click="handleSync(source.id || source.source_id)">Run Bronze Sync</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
