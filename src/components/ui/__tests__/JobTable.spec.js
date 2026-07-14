import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import JobTable from '../JobTable.vue'

describe('JobTable.vue', () => {
  it('renders table headers correctly', () => {
    const wrapper = mount(JobTable)
    expect(wrapper.text()).toContain('Global Job Ledger')
  })
})
