import type { Module } from 'vuex'
import wellsMock from '@/shared/lib/server/__mocks__/well.json'
import type { Well, WellStatus, WellsFilters, WellsKpi, WellsState } from './well.types'

function applyFilters(items: Well[], filters: WellsFilters): Well[] {
  let result = [...items]

  if (filters.search.trim()) {
    const normalized = filters.search.trim().toLowerCase()

    result = result.filter(
      (item) =>
        item.wellNumber.toLowerCase().includes(normalized) ||
        item.name.toLowerCase().includes(normalized) ||
        item.fieldName.toLowerCase().includes(normalized) ||
        item.region.toLowerCase().includes(normalized)
    )
  }

  if (filters.status) {
    result = result.filter((item) => item.status === filters.status)
  }

  if (filters.region) {
    result = result.filter((item) => item.region === filters.region)
  }

  if (filters.fieldName) {
    result = result.filter((item) => item.fieldName === filters.fieldName)
  }

  if (filters.sortBy) {
    result.sort((a, b) => {
      const aValue = Number(a[filters.sortBy as keyof Well] ?? 0)
      const bValue = Number(b[filters.sortBy as keyof Well] ?? 0)

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

const initialFilters = (): WellsFilters => ({
  search: '',
  status: '',
  region: '',
  fieldName: '',
  sortBy: '',
  sortOrder: '',
  page: 1,
  pageSize: 10
})

export const wellModule: Module<WellsState, any> = {
  namespaced: true,

  state: (): WellsState => ({
    items: [],
    loading: false,
    error: null,
    filters: initialFilters(),
    selectedWell: null,
    highlightedWellId: null,
    activeChartStatus: ''
  }),

  getters: {
    filteredItems(state): Well[] {
      return applyFilters(state.items, state.filters)
    },

    paginatedItems(state, getters): Well[] {
      const start = (state.filters.page - 1) * state.filters.pageSize
      const end = start + state.filters.pageSize

      return (getters.filteredItems as Well[]).slice(start, end)
    },

    total(state, getters): number {
      return (getters.filteredItems as Well[]).length
    },

    regions(state): string[] {
      return [...new Set(state.items.map((item) => item.region))].sort()
    },

    fieldNames(state): string[] {
      return [...new Set(state.items.map((item) => item.fieldName))].sort()
    },

    statuses(): Array<{ label: string; value: WellStatus }> {
      return [
        { label: 'Активные', value: 'active' },
        { label: 'Неактивные', value: 'inactive' },
        { label: 'На обслуживании', value: 'maintenance' },
        { label: 'Консервация', value: 'conservation' }
      ]
    },

    kpi(state, getters): WellsKpi {
      const items = getters.filteredItems as Well[]
      const total = items.length

      return {
        total,
        active: items.filter((item) => item.status === 'active').length,
        avgOilRate: total
          ? Math.round(items.reduce((sum, item) => sum + item.oilRate, 0) / total)
          : 0,
        avgPressure: total
          ? Math.round(items.reduce((sum, item) => sum + item.pressure, 0) / total)
          : 0
      }
    },

    statusChartData(state, getters): Array<{ label: string; value: number; status: WellStatus }> {
      const items = getters.filteredItems as Well[]

      const counts: Record<WellStatus, number> = {
        active: 0,
        inactive: 0,
        maintenance: 0,
        conservation: 0
      }

      items.forEach((item) => {
        counts[item.status] += 1
      })

      return [
        { label: 'Активные', value: counts.active, status: 'active' },
        { label: 'Неактивные', value: counts.inactive, status: 'inactive' },
        { label: 'На обслуживании', value: counts.maintenance, status: 'maintenance' },
        { label: 'Консервация', value: counts.conservation, status: 'conservation' }
      ]
    },

    topOilRateWells(state, getters): Well[] {
      return [...(getters.filteredItems as Well[])]
        .sort((a, b) => b.oilRate - a.oilRate)
        .slice(0, 5)
    }
  },

  mutations: {
    setLoading(state, payload: boolean) {
      state.loading = payload
    },

    setItems(state, payload: Well[]) {
      state.items = payload
    },

    setError(state, payload: string | null) {
      state.error = payload
    },

    setFilters(state, payload: Partial<WellsFilters>) {
      state.filters = {
        ...state.filters,
        ...payload
      }
    },

    resetFilters(state) {
      state.filters = initialFilters()
    },

    setSelectedWell(state, payload: Well | null) {
      state.selectedWell = payload
    },

    setHighlightedWellId(state, payload: number | null) {
      state.highlightedWellId = payload
    },

    setActiveChartStatus(state, payload: WellStatus | '') {
      state.activeChartStatus = payload
    }
  },

  actions: {
    async fetchWells({ commit }) {
      commit('setLoading', true)
      commit('setError', null)

      try {
        await new Promise((resolve) => {
          setTimeout(resolve, 800)
        })

        commit('setItems', wellsMock as Well[])
      } catch {
        commit('setError', 'Не удалось загрузить список скважин')
      } finally {
        commit('setLoading', false)
      }
    },

    updateFilters({ commit }, payload: Partial<WellsFilters>) {
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

    selectWell({ commit }, well: Well) {
      commit('setSelectedWell', well)
      commit('setHighlightedWellId', well.id)
    },

    closeDetails({ commit }) {
      commit('setSelectedWell', null)
    },

    highlightWell({ commit }, wellId: number | null) {
      commit('setHighlightedWellId', wellId)
    },

    drilldownByStatus({ commit }, status: WellStatus | '') {
      commit('setActiveChartStatus', status)
      commit('setFilters', {
        status,
        page: 1
      })
    }
  }
}
