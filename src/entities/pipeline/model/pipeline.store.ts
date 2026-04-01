import type { Module } from 'vuex'
import pipelineMock from '@/shared/lib/server/__mocks__/pipeline-sections.json'
import type {
  PipelineFilters,
  PipelineKpi,
  PipelineSection,
  PipelineState,
  PipelineStatus
} from './pipeline.types'

function applyFilters(items: PipelineSection[], filters: PipelineFilters): PipelineSection[] {
  let result = [...items]

  if (filters.search.trim()) {
    const normalized = filters.search.trim().toLowerCase()

    result = result.filter(
      (item) =>
        item.sectionName.toLowerCase().includes(normalized) ||
        item.region.toLowerCase().includes(normalized)
    )
  }

  if (filters.status) {
    result = result.filter((item) => item.status === filters.status)
  }

  if (filters.region) {
    result = result.filter((item) => item.region === filters.region)
  }

  if (filters.sortBy) {
    result.sort((a, b) => {
      const aValue = Number(a[filters.sortBy as keyof PipelineSection] ?? 0)
      const bValue = Number(b[filters.sortBy as keyof PipelineSection] ?? 0)

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

const initialFilters = (): PipelineFilters => ({
  search: '',
  status: '',
  region: '',
  sortBy: '',
  sortOrder: '',
  page: 1,
  pageSize: 10
})

export const pipelineModule: Module<PipelineState, any> = {
  namespaced: true,

  state: (): PipelineState => ({
    items: [],
    loading: false,
    error: null,
    filters: initialFilters(),
    selectedPipeline: null,
    highlightedPipelineId: null,
    activeChartStatus: ''
  }),

  getters: {
    filteredItems(state): PipelineSection[] {
      return applyFilters(state.items, state.filters)
    },

    paginatedItems(state, getters): PipelineSection[] {
      const start = (state.filters.page - 1) * state.filters.pageSize
      const end = start + state.filters.pageSize

      return (getters.filteredItems as PipelineSection[]).slice(start, end)
    },

    total(state, getters): number {
      return (getters.filteredItems as PipelineSection[]).length
    },

    regions(state): string[] {
      return [...new Set(state.items.map((item) => item.region))].sort()
    },

    statuses(): Array<{ label: string; value: PipelineStatus }> {
      return [
        { label: 'Работает', value: 'operational' },
        { label: 'Инспекция', value: 'inspection' },
        { label: 'Ремонт', value: 'repair' },
        { label: 'Аварийный', value: 'critical' }
      ]
    },

    kpi(state, getters): PipelineKpi {
      const items = getters.filteredItems as PipelineSection[]
      const total = items.length

      return {
        total,
        operational: items.filter((item) => item.status === 'operational').length,
        totalLengthKm: items.reduce((sum, item) => sum + item.lengthKm, 0),
        avgPressure: total
          ? Math.round(items.reduce((sum, item) => sum + item.pressure, 0) / total)
          : 0
      }
    },

    statusChartData(
      state,
      getters
    ): Array<{ label: string; value: number; status: PipelineStatus }> {
      const items = getters.filteredItems as PipelineSection[]

      const counts: Record<PipelineStatus, number> = {
        operational: 0,
        inspection: 0,
        repair: 0,
        critical: 0
      }

      items.forEach((item) => {
        counts[item.status] += 1
      })

      return [
        { label: 'Работает', value: counts.operational, status: 'operational' },
        { label: 'Инспекция', value: counts.inspection, status: 'inspection' },
        { label: 'Ремонт', value: counts.repair, status: 'repair' },
        { label: 'Аварийный', value: counts.critical, status: 'critical' }
      ]
    },

    topThroughputSections(state, getters): PipelineSection[] {
      return [...(getters.filteredItems as PipelineSection[])]
        .sort((a, b) => b.throughput - a.throughput)
        .slice(0, 5)
    }
  },

  mutations: {
    setLoading(state, payload: boolean) {
      state.loading = payload
    },

    setItems(state, payload: PipelineSection[]) {
      state.items = payload
    },

    setError(state, payload: string | null) {
      state.error = payload
    },

    setFilters(state, payload: Partial<PipelineFilters>) {
      state.filters = {
        ...state.filters,
        ...payload
      }
    },

    resetFilters(state) {
      state.filters = initialFilters()
    },

    setSelectedPipeline(state, payload: PipelineSection | null) {
      state.selectedPipeline = payload
    },

    setHighlightedPipelineId(state, payload: number | null) {
      state.highlightedPipelineId = payload
    },

    setActiveChartStatus(state, payload: PipelineStatus | '') {
      state.activeChartStatus = payload
    }
  },

  actions: {
    async fetchPipelineSections({ commit }) {
      commit('setLoading', true)
      commit('setError', null)

      try {
        await new Promise((resolve) => {
          setTimeout(resolve, 800)
        })

        commit('setItems', pipelineMock as PipelineSection[])
      } catch {
        commit('setError', 'Не удалось загрузить список участков трубопровода')
      } finally {
        commit('setLoading', false)
      }
    },

    updateFilters({ commit }, payload: Partial<PipelineFilters>) {
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

    selectPipeline({ commit }, pipeline: PipelineSection) {
      commit('setSelectedPipeline', pipeline)
      commit('setHighlightedPipelineId', pipeline.id)
    },

    closeDetails({ commit }) {
      commit('setSelectedPipeline', null)
    },

    highlightPipeline({ commit }, pipelineId: number | null) {
      commit('setHighlightedPipelineId', pipelineId)
    },

    drilldownByStatus({ commit }, status: PipelineStatus | '') {
      commit('setActiveChartStatus', status)
      commit('setFilters', {
        status,
        page: 1
      })
    }
  }
}
