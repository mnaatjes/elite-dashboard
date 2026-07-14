<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  graph: {
    type: Object,
    default: () => ({ nodes: [], edges: [] })
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})
</script>

<template>
  <div class="wireframe-box" style="min-height: 400px;">
    <h3>Lineage Graph Flow</h3>
    
    <div v-if="loading">Loading lineage data...</div>
    <div v-else-if="error" style="color: red;">{{ error }}</div>
    <div v-else-if="!graph || !graph.nodes || graph.nodes.length === 0">No lineage data available for this source.</div>
    
    <div v-else style="display: flex; justify-content: space-between; gap: 2rem; margin-top: 1rem;">
      <div v-for="layer in ['bronze', 'silver', 'gold']" :key="layer" style="flex: 1; border: 1px dashed var(--border-color); padding: 1rem;">
        <h4 style="text-transform: capitalize; margin-top: 0; text-align: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">{{ layer }}</h4>
        <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
          <div 
            v-for="node in graph.nodes.filter(n => n.layer === layer)" 
            :key="node.id"
            style="border: 1px solid var(--border-color); padding: 0.5rem; text-align: center; background: #fafafa;"
          >
            <strong>{{ node.id }}</strong>
          </div>
          <div v-if="graph.nodes.filter(n => n.layer === layer).length === 0" style="text-align: center; font-style: italic; font-size: 0.9rem;">
            No tables
          </div>
        </div>
      </div>
    </div>
    
    <!-- Render textual pseudo-edges to verify the logic -->
    <div v-if="graph && graph.edges && graph.edges.length > 0" style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
      <h4>Dependency Flow Summary</h4>
      <ul style="font-size: 0.9rem;">
        <li v-for="edge in graph.edges" :key="edge.source + '-' + edge.target">
          [{{ edge.source }}] ➔ [{{ edge.target }}]
        </li>
      </ul>
    </div>
  </div>
</template>
