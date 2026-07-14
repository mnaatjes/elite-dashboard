import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PipelineGraph from '../ui/PipelineGraph.vue'
import { catalogApi } from '../../api/catalog'
import { flushPromises } from '@vue/test-utils'

vi.mock('../../api/catalog', () => ({
  catalogApi: {
    validateSchema: vi.fn(),
    commitDag: vi.fn(),
    runPipeline: vi.fn(),
    getPipelineStatus: vi.fn()
  }
}))

// Mock useVueFlow to avoid actual library initialization issues in JSDOM
vi.mock('@vue-flow/core', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useVueFlow: () => ({
      onNodeDragStop: vi.fn(),
      onNodeClick: vi.fn(),
      addNodes: vi.fn()
    })
  }
})

// Mock ResizeObserver for JSDOM
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('PipelineGraph.vue (Phase 1)', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(PipelineGraph, {
      props: { sourceId: 'test-source-id' }
    })
  })

  it('renders the Vue Flow canvas container', () => {
    expect(wrapper.find('.pipeline-graph-container').exists()).toBe(true)
  })

  it('renders Medallion Swim-Lanes', () => {
    const text = wrapper.text()
    expect(text).toContain('Bronze (Raw)')
    expect(text).toContain('Silver (Staging)')
    expect(text).toContain('Gold (Core)')
  })

  it('opens the Add Node modal when button is clicked', async () => {
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
    
    await wrapper.find('.controls button').trigger('click')
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
    expect(wrapper.text()).toContain('Add New Node')
  })

  describe('Phase 2: Offcanvas Editor & Transient State', () => {
    it('does not mutate node SQL state until Save is clicked', async () => {
      // 1. Open add modal
      await wrapper.find('.add-node-btn').trigger('click')
      // 2. Set node name and create
      await wrapper.find('.node-name-input').setValue('testnode')
      await wrapper.find('.create-node-btn').trigger('click')
      
      // Simulate addNodes pushing to the v-model (since useVueFlow is mocked in JSDOM)
      wrapper.vm.nodes.push({ 
        id: 'raw_testnode', 
        type: 'default',
        position: { x: 0, y: 0 },
        data: { sql: null } 
      })
      
      // The offcanvas should now be open automatically
      const offcanvas = wrapper.find('.offcanvas-panel')
      expect(offcanvas.attributes('style')).not.toContain('right: -400px')
      
      // 3. Modify the transient SQL
      const textarea = wrapper.find('.sql-textarea')
      await textarea.setValue('SELECT * FROM modified_table;')
      
      // 4. Verify central state is NOT mutated yet
      const { nodes } = wrapper.vm
      expect(nodes[0].data.sql).toBeNull() // Hasn't been saved yet
      
      // 5. Click Save
      await wrapper.find('.save-btn').trigger('click')
      
      // 6. Verify central state IS mutated now
      expect(nodes[0].data.sql).toBe('SELECT * FROM modified_table;')
      
      // Offcanvas should not be closed automatically on save in Phase 3
      expect(wrapper.find('.offcanvas-panel').attributes('style')).not.toContain('right: -400px')
    })
  })

  describe('Phase 3: Schema Diffing UI & State Gate', () => {
    it('shows fatal diffs, turns the box red, and disables the Deploy button', async () => {
      // 1. Open add modal and create a gold node (required to potentially unlock Deploy button)
      await wrapper.find('.add-node-btn').trigger('click')
      await wrapper.find('.layer-select').setValue('gold')
      await wrapper.find('.node-name-input').setValue('goldnode')
      await wrapper.find('.create-node-btn').trigger('click')
      
      wrapper.vm.nodes.push({ 
        id: 'dim_goldnode', 
        type: 'default',
        position: { x: 0, y: 0 },
        data: { sql: null, layer: 'gold', validation: null } 
      })
      
      // 2. Click Save / Apply, mock a FATAL response
      catalogApi.validateSchema.mockResolvedValueOnce({
        diffs: [{ type: 'MUTATIVE', severity: 'FATAL', message: 'Dropped column user_id' }]
      })
      
      await wrapper.find('.save-btn').trigger('click')
      await flushPromises() // Wait for async API call
      
      // 3. Verify validation box appears and is red
      const validationBox = wrapper.find('.validation-box')
      expect(validationBox.exists()).toBe(true)
      expect(validationBox.attributes('style')).toContain('background-color: rgb(248, 215, 218)') // #f8d7da
      expect(validationBox.text()).toContain('FATAL: Dropped column user_id')
      
      // 4. Verify Deploy button is disabled
      const deployBtn = wrapper.find('.deploy-btn')
      // HTML attributes check disabled
      expect(deployBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('Phase 4: Compilation, Orchestration & Polling', () => {
    it('executes pipeline and polls until terminal state', async () => {
      // 1. Setup a valid graph (Gold node, no fatal diffs)
      wrapper.vm.nodes.push({ 
        id: 'dim_test', 
        type: 'default',
        position: { x: 0, y: 0 },
        data: { sql: 'SELECT * FROM raw', layer: 'gold', validation: { diffs: [] } },
        style: {}
      })
      
      // Mocks
      catalogApi.commitDag.mockResolvedValueOnce({})
      catalogApi.runPipeline.mockResolvedValueOnce({})
      
      // Simulate polling states: 1st call RUNNING, 2nd call SUCCESS
      catalogApi.getPipelineStatus
        .mockResolvedValueOnce({ status: 'RUNNING', completed_nodes: [] })
        .mockResolvedValueOnce({ status: 'SUCCESS', completed_nodes: ['dim_test'] })
      
      // Use fake timers for setInterval
      vi.useFakeTimers()
      
      // 2. Open Preview & Deploy
      await wrapper.vm.$nextTick() // Wait for Vue to unlock the button
      await wrapper.find('.deploy-btn').trigger('click')
      await wrapper.find('.confirm-deploy-btn').trigger('click')
      
      // Ensure API calls were made
      expect(catalogApi.commitDag).toHaveBeenCalledWith('test-source-id', expect.any(Object))
      expect(catalogApi.runPipeline).toHaveBeenCalledWith('test-source-id')
      
      // 3. Fast-forward timer by 3s (First poll)
      await vi.advanceTimersByTimeAsync(3000)
      expect(catalogApi.getPipelineStatus).toHaveBeenCalledTimes(1)
      expect(wrapper.vm.pollingStatus.status).toBe('RUNNING')
      
      // 4. Fast-forward timer by another 3s (Second poll, terminal state)
      await vi.advanceTimersByTimeAsync(3000)
      expect(catalogApi.getPipelineStatus).toHaveBeenCalledTimes(2)
      expect(wrapper.vm.pollingStatus.status).toBe('SUCCESS')
      
      // Verify node style updated to green
      expect(wrapper.vm.nodes[0].style.borderColor).toBe('green')
      
      // 5. Fast-forward again to ensure polling stopped
      await vi.advanceTimersByTimeAsync(3000)
      expect(catalogApi.getPipelineStatus).toHaveBeenCalledTimes(2) // Still 2!
      
      vi.useRealTimers()
    })
  })
})
