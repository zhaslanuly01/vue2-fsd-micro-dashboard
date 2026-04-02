import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { EquipmentKpi } from '..'

describe('EquipmentKpi', () => {
  it('renders skeletons when loading=true', () => {
    const wrapper = shallowMount(EquipmentKpi, {
      propsData: {
        loading: true
      },
      mocks: {
        $store: {
          getters: {
            'equipment/kpi': {
              total: 120,
              operational: 87,
              avgEfficiency: 84,
              avgTemperature: 56
            }
          }
        }
      },
      stubs: {
        'el-card': {
          template: '<div><slot /></div>'
        }
      }
    })

    const skeletons = wrapper.findAll('.equipment-kpi__skeleton')

    expect(skeletons.length).toBe(4)
    expect(wrapper.text()).not.toContain('120')
    expect(wrapper.text()).not.toContain('87')
  })
})
