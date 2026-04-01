import type { Module } from 'vuex'
import ecoStationMock from '@/shared/lib/server/__mocks__/eco-station.json'
import type {
  EcoStation,
  EcoStationFilters,
  EcoStationKpi,
  EcoStationState,
  EcoStatus
} from './eco-station.types'

function applyFilters(items: EcoStation[], filters: EcoStationFilters): EcoStation[] {
  let result = [...items]

  if (filters.search.trim()) {
    const normalized = filters.search.trim().toLowerCase()

    result = result.filter(
      (item) =>
        item.stationName.toLowerCase().includes(normalized) ||
        item.fieldName.toLowerCase().includes(normalized) ||
        item.region.toLowerCase().includes(normalized) ||
        item.responsibleUnit.toLowerCase().includes(normalized)
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

  if (filters.responsibleUnit) {
    result = result.filter((item) => item.responsibleUnit === filters.responsibleUnit)
  }

  if (filters.sortBy) {
    result.sort((a, b) => {
      const aValue = Number(a[filters.sortBy as keyof EcoStation] ?? 0)
      const bValue = Number(b[filters.sortBy as keyof EcoStation] ?? 0)

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

const initialFilters = (): EcoStationFilters => ({
  search: '',
  status: '',
  region: '',
  fieldName: '',
  responsibleUnit: '',
  sortBy: '',
  sortOrder: '',
  page: 1,
  pageSize: 10
})

export const ecoStationModule: Module<EcoStationState, any> = {
  namespaced: true,

  state: (): EcoStationState => ({
    items: [],
    loading: false,
    error: null,
    filters: initialFilters(),
    selectedStation: null,
    highlightedStationId: null,
    activeChartStatus: ''
  }),

  getters: {
    filteredItems(state): EcoStation[] {
      return applyFilters(state.items, state.filters)
    },

    paginatedItems(state, getters): EcoStation[] {
      const start = (state.filters.page - 1) * state.filters.pageSize
      const end = start + state.filters.pageSize

      return (getters.filteredItems as EcoStation[]).slice(start, end)
    },

    total(state, getters): number {
      return (getters.filteredItems as EcoStation[]).length
    },

    regions(state): string[] {
      return [...new Set(state.items.map((item) => item.region))].sort()
    },

    fieldNames(state): string[] {
      return [...new Set(state.items.map((item) => item.fieldName))].sort()
    },

    responsibleUnits(state): string[] {
      return [...new Set(state.items.map((item) => item.responsibleUnit))].sort()
    },

    statuses(): Array<{ label: string; value: EcoStatus }> {
      return [
        { label: 'Норма', value: 'normal' },
        { label: 'Внимание', value: 'attention' },
        { label: 'Критично', value: 'critical' }
      ]
    },

    kpi(state, getters): EcoStationKpi {
      const items = getters.filteredItems as EcoStation[]
      const total = items.length

      return {
        total,
        normal: items.filter((item) => item.status === 'normal').length,
        avgEmissionLevel: total
          ? Math.round(items.reduce((sum, item) => sum + item.emissionLevel, 0) / total)
          : 0,
        avgWaterQualityIndex: total
          ? Math.round(items.reduce((sum, item) => sum + item.waterQualityIndex, 0) / total)
          : 0
      }
    },

    statusChartData(state, getters): Array<{ label: string; value: number; status: EcoStatus }> {
      const items = getters.filteredItems as EcoStation[]

      const counts: Record<EcoStatus, number> = {
        normal: 0,
        attention: 0,
        critical: 0
      }

      items.forEach((item) => {
        counts[item.status] += 1
      })

      return [
        { label: 'Норма', value: counts.normal, status: 'normal' },
        { label: 'Внимание', value: counts.attention, status: 'attention' },
        { label: 'Критично', value: counts.critical, status: 'critical' }
      ]
    },

    topEmissionStations(state, getters): EcoStation[] {
      return [...(getters.filteredItems as EcoStation[])]
        .sort((a, b) => b.emissionLevel - a.emissionLevel)
        .slice(0, 5)
    }
  },

  mutations: {
    setLoading(state, payload: boolean) {
      state.loading = payload
    },

    setItems(state, payload: EcoStation[]) {
      state.items = payload
    },

    setError(state, payload: string | null) {
      state.error = payload
    },

    setFilters(state, payload: Partial<EcoStationFilters>) {
      state.filters = {
        ...state.filters,
        ...payload
      }
    },

    resetFilters(state) {
      state.filters = initialFilters()
    },

    setSelectedStation(state, payload: EcoStation | null) {
      state.selectedStation = payload
    },

    setHighlightedStationId(state, payload: number | null) {
      state.highlightedStationId = payload
    },

    setActiveChartStatus(state, payload: EcoStatus | '') {
      state.activeChartStatus = payload
    }
  },

  actions: {
    async fetchEcoStations({ commit }) {
      commit('setLoading', true)
      commit('setError', null)

      try {
        await new Promise((resolve) => {
          setTimeout(resolve, 800)
        })

        commit('setItems', ecoStationMock as EcoStation[])
      } catch {
        commit('setError', 'Не удалось загрузить список экологических станций')
      } finally {
        commit('setLoading', false)
      }
    },

    updateFilters({ commit }, payload: Partial<EcoStationFilters>) {
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

    selectStation({ commit }, station: EcoStation) {
      commit('setSelectedStation', station)
      commit('setHighlightedStationId', station.id)
    },

    closeDetails({ commit }) {
      commit('setSelectedStation', null)
    },

    highlightStation({ commit }, stationId: number | null) {
      commit('setHighlightedStationId', stationId)
    },

    drilldownByStatus({ commit }, status: EcoStatus | '') {
      commit('setActiveChartStatus', status)
      commit('setFilters', {
        status,
        page: 1
      })
    }
  }
}
