import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SqlEditor from '../SqlEditor.vue'

describe('SqlEditor.vue', () => {
  it('renders validation buttons', () => {
    const wrapper = mount(SqlEditor)
    expect(wrapper.text()).toContain('Dry Run Validate')
    expect(wrapper.text()).toContain('Submit Template')
  })
})
