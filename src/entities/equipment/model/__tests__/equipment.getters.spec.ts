import { describe, it, expect } from 'vitest'
import { equipmentModule } from '../equipment.store'

describe('equipment getters', () => {
  it('filteredItems filters by search, status and fieldName', () => {
    const state = {
      items: [
        {
          id: 1,
          name: 'Pump A',
          type: 'pump',
          fieldName: 'Тенгиз',
          status: 'operational',
          efficiency: 91,
          temperature: 54,
          pressure: 12,
          runtimeHours: 1000,
          nextMaintenanceDate: '2026-04-10',
          installDate: '2024-01-01',
          lat: 51.1,
          lng: 71.4
        },
        {
          id: 2,
          name: 'Pump B',
          type: 'pump',
          fieldName: 'Кашаган',
          status: 'critical',
          efficiency: 42,
          temperature: 80,
          pressure: 18,
          runtimeHours: 2200,
          nextMaintenanceDate: '2026-04-05',
          installDate: '2023-11-01',
          lat: 51.2,
          lng: 71.5
        },
        {
          id: 3,
          name: 'Compressor X',
          type: 'compressor',
          fieldName: 'Тенгиз',
          status: 'operational',
          efficiency: 88,
          temperature: 49,
          pressure: 10,
          runtimeHours: 1400,
          nextMaintenanceDate: '2026-04-20',
          installDate: '2023-09-01',
          lat: 51.3,
          lng: 71.6
        }
      ],
      filters: {
        search: 'pump',
        status: 'operational',
        fieldName: 'Тенгиз',
        type: '',
        page: 1,
        pageSize: 10,
        sortBy: '',
        sortOrder: ''
      }
    }

    const result = (equipmentModule.getters as any).filteredItems(state)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
    expect(result[0].name).toBe('Pump A')
  })
})
