import type { Module } from 'vuex'
import oilFieldMock from '@/shared/lib/server/__mocks__/oil-fields.json'
import type {
  FieldStatus,
  OilField,
  OilFieldFilters,
  OilFieldKpi,
  OilFieldState
} from './oil-field.types'

function applyFilters(items: OilField[], filters: OilFieldFilters): OilField[] {
  let result = [...items]

  if (filters.search.trim()) {
    const normalized = filters.search.trim().toLowerCase()

    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(normalized) ||
        item.region.toLowerCase().includes(normalized) ||
        item.contractor.toLowerCase().includes(normalized)
    )
  }

  if (filters.status) {
    result = result.filter((item) => item.status === filters.status)
  }

  if (filters.region) {
    result = result.filter((item) => item.region === filters.region)
  }

  if (filters.contractor) {
    result = result.filter((item) => item.contractor === filters.contractor)
  }

  if (filters.sortBy) {
    result.sort((a, b) => {
      const aValue = Number(a[filters.sortBy as keyof OilField] ?? 0)
      const bValue = Number(b[filters.sortBy as keyof OilField] ?? 0)

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

const initialFilters = (): OilFieldFilters => ({
  search: '',
  status: '',
  region: '',
  contractor: '',
  sortBy: '',
  sortOrder: '',
  page: 1,
  pageSize: 10
})

export const oilFieldModule: Module<OilFieldState, any> = {
  namespaced: true,

  state: (): OilFieldState => ({
    items: [],
    loading: false,
    error: null,
    filters: initialFilters(),
    selectedField: null,
    highlightedFieldId: null,
    activeChartStatus: ''
  }),

  getters: {
    filteredItems(state): OilField[] {
      return applyFilters(state.items, state.filters)
    },

    paginatedItems(state, getters): OilField[] {
      const start = (state.filters.page - 1) * state.filters.pageSize
      const end = start + state.filters.pageSize

      return (getters.filteredItems as OilField[]).slice(start, end)
    },

    total(state, getters): number {
      return (getters.filteredItems as OilField[]).length
    },

    regions(state): string[] {
      return [...new Set(state.items.map((item) => item.region))].sort()
    },

    contractors(state): string[] {
      return [...new Set(state.items.map((item) => item.contractor))].sort()
    },

    statuses(): Array<{ label: string; value: FieldStatus }> {
      return [
        { label: 'Стабильное', value: 'stable' },
        { label: 'Рост', value: 'growing' },
        { label: 'Снижение', value: 'declining' },
        { label: 'Риск', value: 'risk' }
      ]
    },

    kpi(state, getters): OilFieldKpi {
      const items = getters.filteredItems as OilField[]
      const total = items.length

      const avgPlanExecution = total
        ? Math.round(
            items.reduce((sum, item) => {
              const execution = item.yearlyPlan ? (item.yearlyFact / item.yearlyPlan) * 100 : 0
              return sum + execution
            }, 0) / total
          )
        : 0

      return {
        total,
        growing: items.filter((item) => item.status === 'growing').length,
        totalDailyProduction: items.reduce((sum, item) => sum + item.dailyProduction, 0),
        avgPlanExecution
      }
    },

    statusChartData(state, getters): Array<{ label: string; value: number; status: FieldStatus }> {
      const items = getters.filteredItems as OilField[]

      const counts: Record<FieldStatus, number> = {
        stable: 0,
        growing: 0,
        declining: 0,
        risk: 0
      }

      items.forEach((item) => {
        counts[item.status] += 1
      })

      return [
        { label: 'Стабильное', value: counts.stable, status: 'stable' },
        { label: 'Рост', value: counts.growing, status: 'growing' },
        { label: 'Снижение', value: counts.declining, status: 'declining' },
        { label: 'Риск', value: counts.risk, status: 'risk' }
      ]
    },

    topProductionFields(state, getters): OilField[] {
      return [...(getters.filteredItems as OilField[])]
        .sort((a, b) => b.dailyProduction - a.dailyProduction)
        .slice(0, 5)
    }
  },

  mutations: {
    setLoading(state, payload: boolean) {
      state.loading = payload
    },

    setItems(state, payload: OilField[]) {
      state.items = payload
    },

    setError(state, payload: string | null) {
      state.error = payload
    },

    setFilters(state, payload: Partial<OilFieldFilters>) {
      state.filters = {
        ...state.filters,
        ...payload
      }
    },

    resetFilters(state) {
      state.filters = initialFilters()
    },

    setSelectedField(state, payload: OilField | null) {
      state.selectedField = payload
    },

    setHighlightedFieldId(state, payload: number | null) {
      state.highlightedFieldId = payload
    },

    setActiveChartStatus(state, payload: FieldStatus | '') {
      state.activeChartStatus = payload
    }
  },

  actions: {
    async fetchOilFields({ commit }) {
      commit('setLoading', true)
      commit('setError', null)

      try {
        await new Promise((resolve) => {
          setTimeout(resolve, 800)
        })

        commit('setItems', oilFieldMock as OilField[])
      } catch {
        commit('setError', 'Не удалось загрузить список месторождений')
      } finally {
        commit('setLoading', false)
      }
    },

    updateFilters({ commit }, payload: Partial<OilFieldFilters>) {
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

    selectField({ commit }, field: OilField) {
      commit('setSelectedField', field)
      commit('setHighlightedFieldId', field.id)
    },

    closeDetails({ commit }) {
      commit('setSelectedField', null)
    },

    highlightField({ commit }, fieldId: number | null) {
      commit('setHighlightedFieldId', fieldId)
    },

    drilldownByStatus({ commit }, status: FieldStatus | '') {
      commit('setActiveChartStatus', status)
      commit('setFilters', {
        status,
        page: 1
      })
    }
  }
}
