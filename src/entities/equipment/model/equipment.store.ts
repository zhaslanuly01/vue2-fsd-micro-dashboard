import type { Module } from 'vuex'
import equipmentMock from '@/shared/lib/server/__mocks__/equipment.json'
import type {
  EquipmentFilters,
  EquipmentKpi,
  EquipmentState,
  EquipmentStatus,
  EquipmentType,
  EquipmentUnit
} from './equipment.types'

function applyFilters(items: EquipmentUnit[], filters: EquipmentFilters): EquipmentUnit[] {
  let result = [...items]

  if (filters.search.trim()) {
    const normalized = filters.search.trim().toLowerCase()

    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(normalized) ||
        item.fieldName.toLowerCase().includes(normalized) ||
        item.type.toLowerCase().includes(normalized)
    )
  }

  if (filters.status) {
    result = result.filter((item) => item.status === filters.status)
  }

  if (filters.fieldName) {
    result = result.filter((item) => item.fieldName === filters.fieldName)
  }

  if (filters.type) {
    result = result.filter((item) => item.type === filters.type)
  }

  if (filters.sortBy) {
    result.sort((a, b) => {
      const aValue = Number(a[filters.sortBy as keyof EquipmentUnit] ?? 0)
      const bValue = Number(b[filters.sortBy as keyof EquipmentUnit] ?? 0)

      if (filters.sortOrder === 'ascending') {
        return aValue - bValue
      }

      if (filters.sortOrder === 'descending') {
        return bValue - aValue
      }

      return 0
    })
  }

  return result
}

const initialFilters = (): EquipmentFilters => ({
  search: '',
  status: '',
  fieldName: '',
  type: '',
  sortBy: '',
  sortOrder: '',
  page: 1,
  pageSize: 10
})

export const equipmentModule: Module<EquipmentState, any> = {
  namespaced: true,

  state: (): EquipmentState => ({
    items: [],
    loading: false,
    error: null,
    filters: initialFilters(),
    selectedEquipment: null,
    highlightedEquipmentId: null,
    activeChartStatus: ''
  }),

  getters: {
    filteredItems(state): EquipmentUnit[] {
      return applyFilters(state.items, state.filters)
    },

    paginatedItems(state, getters): EquipmentUnit[] {
      const start = (state.filters.page - 1) * state.filters.pageSize
      const end = start + state.filters.pageSize

      return (getters.filteredItems as EquipmentUnit[]).slice(start, end)
    },

    total(state, getters): number {
      return (getters.filteredItems as EquipmentUnit[]).length
    },

    fieldNames(state): string[] {
      return [...new Set(state.items.map((item) => item.fieldName))].sort()
    },

    types(): Array<{ label: string; value: EquipmentType }> {
      return [
        { label: 'Насос', value: 'pump' },
        { label: 'Компрессор', value: 'compressor' },
        { label: 'Сепаратор', value: 'separator' },
        { label: 'Генератор', value: 'generator' }
      ]
    },

    statuses(): Array<{ label: string; value: EquipmentStatus }> {
      return [
        { label: 'Работает', value: 'operational' },
        { label: 'Предупреждение', value: 'warning' },
        { label: 'Критическое', value: 'critical' },
        { label: 'Оффлайн', value: 'offline' }
      ]
    },

    kpi(state, getters): EquipmentKpi {
      const items = getters.filteredItems as EquipmentUnit[]
      const total = items.length

      return {
        total,
        operational: items.filter((item) => item.status === 'operational').length,
        avgEfficiency: total
          ? Math.round(items.reduce((sum, item) => sum + item.efficiency, 0) / total)
          : 0,
        avgTemperature: total
          ? Math.round(items.reduce((sum, item) => sum + item.temperature, 0) / total)
          : 0
      }
    },

    statusChartData(
      state,
      getters
    ): Array<{ label: string; value: number; status: EquipmentStatus }> {
      const items = getters.filteredItems as EquipmentUnit[]

      const counts: Record<EquipmentStatus, number> = {
        operational: 0,
        warning: 0,
        critical: 0,
        offline: 0
      }

      items.forEach((item) => {
        counts[item.status] += 1
      })

      return [
        { label: 'Работает', value: counts.operational, status: 'operational' },
        { label: 'Предупреждение', value: counts.warning, status: 'warning' },
        { label: 'Критическое', value: counts.critical, status: 'critical' },
        { label: 'Оффлайн', value: counts.offline, status: 'offline' }
      ]
    },

    topEfficiencyEquipment(state, getters): EquipmentUnit[] {
      return [...(getters.filteredItems as EquipmentUnit[])]
        .sort((a, b) => b.efficiency - a.efficiency)
        .slice(0, 5)
    }
  },

  mutations: {
    setLoading(state, payload: boolean) {
      state.loading = payload
    },

    setItems(state, payload: EquipmentUnit[]) {
      state.items = payload
    },

    setError(state, payload: string | null) {
      state.error = payload
    },

    setFilters(state, payload: Partial<EquipmentFilters>) {
      state.filters = {
        ...state.filters,
        ...payload
      }
    },

    resetFilters(state) {
      state.filters = initialFilters()
    },

    setSelectedEquipment(state, payload: EquipmentUnit | null) {
      state.selectedEquipment = payload
    },

    setHighlightedEquipmentId(state, payload: number | null) {
      state.highlightedEquipmentId = payload
    },

    setActiveChartStatus(state, payload: EquipmentStatus | '') {
      state.activeChartStatus = payload
    }
  },

  actions: {
    async fetchEquipment({ commit }) {
      commit('setLoading', true)
      commit('setError', null)

      try {
        await new Promise((resolve) => {
          setTimeout(resolve, 800)
        })

        commit('setItems', equipmentMock as EquipmentUnit[])
      } catch {
        commit('setError', 'Не удалось загрузить список оборудования')
      } finally {
        commit('setLoading', false)
      }
    },

    updateFilters({ commit }, payload: Partial<EquipmentFilters>) {
      commit('setFilters', {
        ...payload,
        page: 1
      })
    },

    changePage({ commit }, page: number) {
      commit('setFilters', { page })
    },

    changePageSize({ commit }, pageSize: number) {
      commit('setFilters', {
        page: 1,
        pageSize
      })
    },

    changeSorting(
      { commit },
      payload: { sortBy: string; sortOrder: '' | 'ascending' | 'descending' }
    ) {
      commit('setFilters', {
        sortBy: payload.sortBy,
        sortOrder: payload.sortOrder,
        page: 1
      })
    },

    resetFilters({ commit }) {
      commit('resetFilters')
      commit('setActiveChartStatus', '')
    },

    selectEquipment({ commit }, equipment: EquipmentUnit) {
      commit('setSelectedEquipment', equipment)
      commit('setHighlightedEquipmentId', equipment.id)
    },

    closeDetails({ commit }) {
      commit('setSelectedEquipment', null)
    },

    highlightEquipment({ commit }, equipmentId: number | null) {
      commit('setHighlightedEquipmentId', equipmentId)
    },

    drilldownByStatus({ commit }, status: EquipmentStatus | '') {
      commit('setActiveChartStatus', status)
      commit('setFilters', {
        status,
        page: 1
      })
    }
  }
}
