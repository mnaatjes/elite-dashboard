<script setup>
import { ref, computed, watch } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { catalogApi } from '../../api/catalog'

// Import Vue Flow styles
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const props = defineProps({
  sourceId: {
    type: String,
    required: true
  },
  initialGraph: {
    type: Object,
    default: () => ({ nodes: [], edges: [] })
  }
})

const { onNodeDragStop, onNodeClick, addNodes } = useVueFlow()

// Swim-lane prefixes
const prefixes = {
  bronze: 'raw_',
  silver: 'stg_',
  gold: 'dim_'
}

const laneXOffsets = {
  bronze: 100,
  silver: 400,
  gold: 700
}

const nodes = ref([])
const edges = ref([])

const { setNodes, setEdges } = useVueFlow()

watch(() => props.initialGraph, (newGraph) => {
  if (newGraph && newGraph.nodes) {
    const layerYTracker = { bronze: 50, silver: 50, gold: 50 }
    
    const formattedNodes = newGraph.nodes.map(n => {
      let x = laneXOffsets[n.layer] || 100
      let y = 0
      
      if (n.ui_metadata && typeof n.ui_metadata.x !== 'undefined') {
        x = n.ui_metadata.x
        y = n.ui_metadata.y
      } else {
        const layer = n.layer || 'bronze'
        y = layerYTracker[layer]
        layerYTracker[layer] += 70 // Fixed vertical gap
      }

      return {
        id: n.id,
        type: 'default',
        position: { x, y },
        data: {
          label: n.id,
          layer: n.layer,
          sql: n.sql_template || null,
          validation: null,
          ui_metadata: n.ui_metadata || {}
        },
        style: {
          background: '#fff',
          border: '2px solid #333',
          borderRadius: '6px',
          padding: '10px',
          width: '200px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }
      }
    })
    
    const formattedEdges = (newGraph.edges || []).map(e => ({
      id: `${e.source}-${e.target}`,
      source: e.source,
      target: e.target
    }))
    
    setNodes(formattedNodes)
    setEdges(formattedEdges)
  }
}, { immediate: true })
const showAddModal = ref(false)
const newNodeName = ref('')
const selectedLayer = ref('bronze')

// Offcanvas state
const showOffcanvas = ref(false)
const activeNodeId = ref(null)
const transientSql = ref('')
const isValidating = ref(false)


// Phase 3: State Gate Lock
const isDeployable = computed(() => {
  const hasFatal = nodes.value.some(n => 
    n.data.validation && n.data.validation.diffs && n.data.validation.diffs.some(d => d.severity === 'FATAL')
  )
  const hasGold = nodes.value.some(n => n.data.layer === 'gold')
  return !hasFatal && hasGold
})

const activeNodeValidation = computed(() => {
  if (!activeNodeId.value) return null
  const node = nodes.value.find(n => n.id === activeNodeId.value)
  return node?.data?.validation || null
})

const highestSeverityColor = computed(() => {
  if (!activeNodeValidation.value || !activeNodeValidation.value.diffs) return 'transparent'
  const hasFatal = activeNodeValidation.value.diffs.some(d => d.severity === 'FATAL')
  if (hasFatal) return '#f8d7da' // Red
  const hasWarning = activeNodeValidation.value.diffs.some(d => d.severity === 'WARNING')
  if (hasWarning) return '#fff3cd' // Yellow/Orange
  return '#d4edda' // Green (Success)
})

const generateDefaultSql = (nodeId) => {
  const incomingEdges = edges.value.filter(e => e.target === nodeId)
  if (incomingEdges.length === 0) {
    return `CREATE TABLE ${nodeId} AS\nSELECT * FROM ...;`
  }
  
  let sql = `CREATE TABLE ${nodeId} AS\nSELECT *\nFROM ${incomingEdges[0].source}`
  for (let i = 1; i < incomingEdges.length; i++) {
    sql += `\nJOIN ${incomingEdges[i].source} ON ...`
  }
  return sql + ';'
}

const openEditor = (node) => {
  activeNodeId.value = node.id
  transientSql.value = node.data.sql || generateDefaultSql(node.id)
  showOffcanvas.value = true
}

const closeEditor = () => {
  showOffcanvas.value = false
  activeNodeId.value = null
}

const saveEditor = async () => {
  if (activeNodeId.value) {
    const node = nodes.value.find(n => n.id === activeNodeId.value)
    if (node) {
      node.data = { ...node.data, sql: transientSql.value }
      
      isValidating.value = true
      try {
        const response = await catalogApi.validateSchema({ sql: transientSql.value })
        node.data.validation = response
      } catch (e) {
        node.data.validation = { diffs: [{ type: 'ERROR', severity: 'FATAL', message: e.message || 'Validation failed' }] }
      } finally {
        isValidating.value = false
      }
    }
  }
}

const addNode = () => {
  if (!newNodeName.value) return
  
  const prefix = prefixes[selectedLayer.value]
  const id = `${prefix}${newNodeName.value.replace(/\s+/g, '_').toLowerCase()}`
  
  const existingInLayer = nodes.value.filter(n => n.data.layer === selectedLayer.value).length
  const position = {
    x: laneXOffsets[selectedLayer.value],
    y: (existingInLayer * 70) + 50
  }
  
  const newNode = {
    id,
    type: 'default',
    position,
    data: { 
      label: id, 
      layer: selectedLayer.value,
      ui_metadata: { x: position.x, y: position.y },
      sql: null,
      validation: null
    },
    style: {
      background: '#fff',
      border: '2px solid #333',
      borderRadius: '6px',
      padding: '10px',
      width: '200px',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }
  }
  
  addNodes([newNode])
  
  showAddModal.value = false
  newNodeName.value = ''
  
  // Trigger offcanvas upon node creation per Phase 2
  openEditor(newNode)
}

onNodeDragStop((e) => {
  e.node.data.ui_metadata = { x: e.node.position.x, y: e.node.position.y }
})

onNodeClick((e) => {
  openEditor(e.node)
})

// Phase 4: Payload Preview & Orchestration
const showPreviewModal = ref(false)
const isDeploying = ref(false)
const pollingStatus = ref(null)

const payloadPreview = computed(() => {
  return nodes.value.map(n => ({
    table_name: n.id,
    layer: n.data.layer,
    sql_template: n.data.sql || '',
    ui_metadata: n.data.ui_metadata
  }))
})

const edgePreview = computed(() => {
  return edges.value.map(e => ({
    source_table: e.source,
    target_table: e.target
  }))
})

let pollInterval = null
const startPolling = () => {
  if (pollInterval) clearInterval(pollInterval)
  pollInterval = setInterval(async () => {
    try {
      const status = await catalogApi.getPipelineStatus(props.sourceId)
      pollingStatus.value = status
      if (status.status === 'SUCCESS' || status.status === 'FAILED') {
        clearInterval(pollInterval)
      }
      // Reactive color update based on node completion
      if (status.completed_nodes) {
        status.completed_nodes.forEach(nodeId => {
          const node = nodes.value.find(n => n.id === nodeId)
          if (node) node.style = { ...node.style, borderColor: 'green', borderWidth: '3px' }
        })
      }
      if (status.failed_nodes) {
        status.failed_nodes.forEach(nodeId => {
          const node = nodes.value.find(n => n.id === nodeId)
          if (node) node.style = { ...node.style, borderColor: 'red', borderWidth: '3px' }
        })
      }
    } catch (e) {
      console.error(e)
      clearInterval(pollInterval)
    }
  }, 3000)
}

const deployPipeline = async () => {
  isDeploying.value = true
  try {
    await catalogApi.commitDag(props.sourceId, {
      nodes: payloadPreview.value,
      edges: edgePreview.value
    })
    await catalogApi.runPipeline(props.sourceId)
    startPolling()
  } catch(e) {
    console.error(e)
  } finally {
    isDeploying.value = false
    showPreviewModal.value = false
  }
}

defineExpose({
  showAddModal,
  showPreviewModal,
  isDeployable
})
</script>

<template>
  <div class="pipeline-graph-container" style="position: relative; height: 100%; width: 100%; border: 1px solid #ccc; overflow: hidden; border-radius: 8px;">
    
    <!-- Swim Lane Backgrounds -->
    <div class="swim-lanes" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; z-index: 1; pointer-events: none;">
      <div style="flex: 1; border-right: 1px dashed #ccc; background: rgba(205, 127, 50, 0.05);">
        <h4 style="text-align: center; color: #666; margin-top: 10px;">Bronze (Raw)</h4>
      </div>
      <div style="flex: 1; border-right: 1px dashed #ccc; background: rgba(192, 192, 192, 0.05);">
        <h4 style="text-align: center; color: #666; margin-top: 10px;">Silver (Staging)</h4>
      </div>
      <div style="flex: 1; background: rgba(255, 215, 0, 0.05);">
        <h4 style="text-align: center; color: #666; margin-top: 10px;">Gold (Core)</h4>
      </div>
    </div>

    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :default-zoom="1"
      :min-zoom="0.2"
      :max-zoom="4"
      :pan-on-scroll="true"
      :pan-on-drag="true"
      :selection-on-drag="false"
      style="z-index: 2;"
    >
      <Background pattern-color="#aaa" gap="20" />
    </VueFlow>

    <!-- Simple Add Node Modal -->
    <div v-if="showAddModal" class="modal-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10; display: flex; align-items: center; justify-content: center;">
      <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; width: 300px;">
        <h5>Add New Node</h5>
        <div class="mb-3">
          <label class="form-label">Medallion Layer</label>
          <select v-model="selectedLayer" class="form-select layer-select">
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Base Entity Name</label>
          <input v-model="newNodeName" type="text" class="form-control node-name-input" placeholder="e.g. users">
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-secondary btn-sm" @click="showAddModal = false">Cancel</button>
          <button class="btn btn-primary btn-sm create-node-btn" @click="addNode">Create</button>
        </div>
      </div>
    </div>

    <!-- Payload Preview Modal -->
    <div v-if="showPreviewModal" class="modal-overlay preview-modal" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 20; display: flex; align-items: center; justify-content: center;">
      <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; width: 600px; max-height: 80vh; display: flex; flex-direction: column;">
        <h5>Payload Preview</h5>
        <div style="flex: 1; overflow: auto; background: #f4f4f4; padding: 10px; margin-bottom: 15px;">
          <pre>{{ JSON.stringify({ nodes: payloadPreview, edges: edgePreview }, null, 2) }}</pre>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-secondary btn-sm" @click="showPreviewModal = false">Cancel</button>
          <button class="btn btn-primary btn-sm confirm-deploy-btn" @click="deployPipeline" :disabled="isDeploying">
            {{ isDeploying ? 'Deploying...' : 'Confirm Deploy' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Offcanvas Editor -->
    <div 
      class="offcanvas-panel" 
      :style="{ right: showOffcanvas ? '0' : '-400px' }"
      style="position: absolute; top: 0; width: 400px; height: 100%; background: #fff; box-shadow: -2px 0 5px rgba(0,0,0,0.2); z-index: 5; transition: right 0.3s ease; display: flex; flex-direction: column;"
    >
      <div style="padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
        <h5 style="margin: 0;">SQL Editor: {{ activeNodeId }}</h5>
        <button class="close-editor-btn" @click="closeEditor" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
      </div>
      <div style="padding: 15px; flex: 1; display: flex; flex-direction: column;">
        <textarea 
          v-model="transientSql" 
          class="sql-textarea"
          style="flex: 1; font-family: monospace; padding: 10px; width: 100%; resize: none;"
          :disabled="isValidating"
        ></textarea>
        
        <!-- Validation Messages -->
        <div v-if="activeNodeValidation?.diffs?.length" class="validation-box" :style="{ backgroundColor: highestSeverityColor, padding: '10px', marginTop: '10px', borderRadius: '5px' }">
          <div v-for="diff in activeNodeValidation.diffs" :key="diff.message" :style="{ color: diff.severity === 'FATAL' ? '#721c24' : '#856404' }">
            <strong>{{ diff.severity }}:</strong> {{ diff.message }}
          </div>
        </div>
      </div>
      <div style="padding: 15px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary" @click="closeEditor">Close</button>
        <button class="btn btn-primary save-btn" @click="saveEditor" :disabled="isValidating">
          {{ isValidating ? 'Validating...' : 'Save & Validate' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles */
</style>
