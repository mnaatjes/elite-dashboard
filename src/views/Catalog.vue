<script setup>
import { ref, onMounted, watch } from 'vue'
import { sourcesApi } from '../api/sources'
import { catalogApi } from '../api/catalog'
import SqlEditor from '../components/ui/SqlEditor.vue'

const sources = ref([])
const selectedSourceId = ref('')
const activeTab = ref('bronze')

// Bronze State
const bronzeCatalog = ref(null)
const loadingBronze = ref(false)

// Editor State
const validationStatus = ref({ success: false, message: '', error: '' })
const isEditorLoading = ref(false)

// Initialization
onMounted(async () => {
  try {
    const data = await sourcesApi.getSources()
    sources.value = Array.isArray(data) ? data : (data.sources || [])
    if (sources.value.length > 0) {
      selectedSourceId.value = sources.value[0].id || sources.value[0].source_id
    }
  } catch (err) {
    console.error("Failed to fetch sources", err)
  }
})

// Handlers
const loadBronzeCatalog = async () => {
  if (!selectedSourceId.value || activeTab.value !== 'bronze') return
  loadingBronze.value = true
  try {
    const data = await catalogApi.getBronzeCatalog(selectedSourceId.value)
    bronzeCatalog.value = data
  } catch (err) {
    console.error(err)
    bronzeCatalog.value = { error: err.message }
  } finally {
    loadingBronze.value = false
  }
}

watch([selectedSourceId, activeTab], () => {
  validationStatus.value = { success: false, message: '', error: '' }
  if (activeTab.value === 'bronze') {
    loadBronzeCatalog()
  }
})

const processSql = async (sql, isDryRun) => {
  if (!selectedSourceId.value) return
  isEditorLoading.value = true
  validationStatus.value = { success: false, message: '', error: '' }

  const payload = {
    dry_run: isDryRun,
    transformations: [
      { target_table: "tbd_target", sql: sql } // Simplified for wireframe
    ]
  }

  try {
    let res;
    if (activeTab.value === 'silver') {
      res = await catalogApi.normalizeSilver(selectedSourceId.value, payload)
    } else {
      res = await catalogApi.aggregateGold(selectedSourceId.value, payload)
    }
    
    validationStatus.value = { 
      success: true, 
      message: isDryRun ? 'SQL is valid.' : `Execution started. Job ID: ${res?.job_id}` 
    }
  } catch (err) {
    validationStatus.value = { success: false, message: '', error: err.message }
  } finally {
    isEditorLoading.value = false
  }
}
</script>

<template>
  <div class="wireframe-box">
    <h1>Schema Catalog (HitL)</h1>
    
    <div style="margin-bottom: 2rem;">
      <label>
        <strong>Select Context Source: </strong>
        <select v-model="selectedSourceId">
          <option v-for="source in sources" :key="source.id || source.source_id" :value="source.id || source.source_id">
            {{ source.name }}
          </option>
        </select>
      </label>
    </div>

    <!-- Tabs -->
    <div style="display: flex; gap: 1rem; margin-bottom: 1rem; border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem;">
      <button :style="{ fontWeight: activeTab === 'bronze' ? 'bold' : 'normal' }" @click="activeTab = 'bronze'">Bronze (Introspection)</button>
      <button :style="{ fontWeight: activeTab === 'silver' ? 'bold' : 'normal' }" @click="activeTab = 'silver'">Silver (Normalize)</button>
      <button :style="{ fontWeight: activeTab === 'gold' ? 'bold' : 'normal' }" @click="activeTab = 'gold'">Gold (Aggregate)</button>
    </div>

    <!-- Bronze View -->
    <div v-if="activeTab === 'bronze'">
      <h3>Raw Bronze Tables</h3>
      <div v-if="loadingBronze">Loading tables...</div>
      <div v-else-if="bronzeCatalog?.error" style="color: red;">{{ bronzeCatalog.error }}</div>
      <div v-else-if="!bronzeCatalog?.tables || bronzeCatalog.tables.length === 0">No tables found. Run a sync first.</div>
      <div v-else>
        <div v-for="table in bronzeCatalog.tables" :key="table.table_name" style="margin-bottom: 1rem; border: 1px solid var(--border-color); padding: 1rem;">
          <strong>{{ table.table_name }}</strong>
          <table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem;">
            <tr v-for="col in table.columns" :key="col.name">
              <td style="border-bottom: 1px dotted var(--border-color); padding: 0.25rem;">{{ col.name }}</td>
              <td style="border-bottom: 1px dotted var(--border-color); padding: 0.25rem;"><code>{{ col.data_type }}</code></td>
            </tr>
          </table>
        </div>
      </div>
    </div>

    <!-- Silver/Gold View -->
    <div v-else>
      <p>Target Layer: <strong>{{ activeTab.toUpperCase() }}</strong></p>
      <SqlEditor 
        :validationStatus="validationStatus"
        :isLoading="isEditorLoading"
        @dryRun="(sql) => processSql(sql, true)"
        @submit="(sql) => processSql(sql, false)"
      />
    </div>
  </div>
</template>
