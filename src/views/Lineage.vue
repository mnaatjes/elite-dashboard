<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { sourcesApi } from '../api/sources'
import { catalogApi } from '../api/catalog'
import PipelineGraph from '../components/ui/PipelineGraph.vue'

const route = useRoute()
const sources = ref([])
const selectedSourceId = ref('')
const graphData = ref(null)
const loading = ref(false)
const error = ref(null)
const graphRef = ref(null)

onMounted(async () => {
  try {
    const data = await sourcesApi.getSources()
    sources.value = Array.isArray(data) ? data : (data.sources || [])
    if (route.params.id) {
      selectedSourceId.value = route.params.id
    } else if (sources.value.length > 0) {
      selectedSourceId.value = sources.value[0].id || sources.value[0].source_id
    }
  } catch (err) {
    console.error("Failed to fetch sources for lineage", err)
  }
})

const fetchLineage = async () => {
  if (!selectedSourceId.value) return
  loading.value = true
  error.value = null
  try {
    const data = await catalogApi.getLineage(selectedSourceId.value)
    
    const rawNodes = data.nodes || []
    const rawEdges = data.edges || []
    
    const nodes = rawNodes.map(n => ({
      ...n,
      id: n.table_name || n.id,
      layer: n.layer || 'bronze'
    }))
    const edges = rawEdges.map(e => ({
      ...e,
      source: e.source_table,
      target: e.target_table
    }))
    
    graphData.value = { nodes, edges }
  } catch (err) {
    error.value = err.message || 'Failed to fetch lineage graph'
    graphData.value = null
  } finally {
    loading.value = false
  }
}

watch(selectedSourceId, () => {
  fetchLineage()
})
</script>

<template>
  <div class="wireframe-box" style="display: flex; flex-direction: column; height: 100vh;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h1 style="margin: 0;">Declarative DAG Builder</h1>
      <div v-if="graphRef">
        <button class="btn btn-primary btn-sm add-node-btn" @click="graphRef.showAddModal = true">Add Node</button>
        <button class="btn btn-success btn-sm deploy-btn" @click="graphRef.showPreviewModal = true" :disabled="!graphRef.isDeployable" style="margin-left: 10px;">Deploy & Execute Pipeline</button>
      </div>
    </div>
    
    <div style="margin-bottom: 1rem; background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <label style="display: flex; align-items: center; gap: 10px; margin: 0;">
        <strong>Select Context Source: </strong>
        <select v-model="selectedSourceId" class="form-select" style="max-width: 300px;">
          <option v-for="source in sources" :key="source.id || source.source_id" :value="source.id || source.source_id">
            {{ source.name }}
          </option>
        </select>
      </label>
    </div>

    <div style="flex: 1; padding-bottom: 2rem;">
      <PipelineGraph 
        ref="graphRef"
        v-if="selectedSourceId"
        :sourceId="selectedSourceId"
        :initialGraph="graphData || { nodes: [], edges: [] }"
      />
    </div>
  </div>
</template>
