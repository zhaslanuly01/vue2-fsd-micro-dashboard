import type { Module } from 'vuex'
import maintenanceRequestMock from '@/shared/lib/server/__mocks__/maintenance-requests.json'
import type {
  MaintenanceRequest,
  MaintenanceRequestFilters,
  MaintenanceRequestKpi,
  MaintenanceRequestState,
  RequestPriority,
  RequestStatus
} from './maintenance-request.types'

function applyFilters(
  items: MaintenanceRequest[],
  filters: MaintenanceRequestFilters
): MaintenanceRequest[] {
  let result = [...items]

  if (filters.search.trim()) {
    const normalized = filters.search.trim().toLowerCase()

    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(normalized) ||
        item.objectName.toLowerCase().includes(normalized) ||
        item.fieldName.toLowerCase().includes(normalized) ||
        item.responsibleTeam.toLowerCase().includes(normalized)
    )
  }

  if (filters.status) {
    result = result.filter((item) => item.status === filters.status)
  }

  if (filters.fieldName) {
    result = result.filter((item) => item.fieldName === filters.fieldName)
  }

  if (filters.priority) {
    result = result.filter((item) => item.priority === filters.priority)
  }

  if (filters.responsibleTeam) {
    result = result.filter((item) => item.responsibleTeam === filters.responsibleTeam)
  }

  if (filters.sortBy) {
    result.sort((a, b) => {
      const aValue = Number(a[filters.sortBy as keyof MaintenanceRequest] ?? 0)
      const bValue = Number(b[filters.sortBy as keyof MaintenanceRequest] ?? 0)

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

const initialFilters = (): MaintenanceRequestFilters => ({
  search: '',
  status: '',
  fieldName: '',
  priority: '',
  responsibleTeam: '',
  sortBy: '',
  sortOrder: '',
  page: 1,
  pageSize: 10
})

export const maintenanceRequestModule: Module<MaintenanceRequestState, any> = {
  namespaced: true,

  state: (): MaintenanceRequestState => ({
    items: [],
    loading: false,
    error: null,
    filters: initialFilters(),
    selectedRequest: null,
    highlightedRequestId: null,
    activeChartStatus: ''
  }),

  getters: {
    filteredItems(state): MaintenanceRequest[] {
      return applyFilters(state.items, state.filters)
    },

    paginatedItems(state, getters): MaintenanceRequest[] {
      const start = (state.filters.page - 1) * state.filters.pageSize
      const end = start + state.filters.pageSize

      return (getters.filteredItems as MaintenanceRequest[]).slice(start, end)
    },

    total(state, getters): number {
      return (getters.filteredItems as MaintenanceRequest[]).length
    },

    fieldNames(state): string[] {
      return [...new Set(state.items.map((item) => item.fieldName))].sort()
    },

    responsibleTeams(state): string[] {
      return [...new Set(state.items.map((item) => item.responsibleTeam))].sort()
    },

    priorities(): Array<{ label: string; value: RequestPriority }> {
      return [
        { label: 'Низкий', value: 'low' },
        { label: 'Средний', value: 'medium' },
        { label: 'Высокий', value: 'high' }
      ]
    },

    statuses(): Array<{ label: string; value: RequestStatus }> {
      return [
        { label: 'Новая', value: 'new' },
        { label: 'В работе', value: 'in_progress' },
        { label: 'Завершена', value: 'completed' },
        { label: 'Просрочена', value: 'overdue' }
      ]
    },

    kpi(state, getters): MaintenanceRequestKpi {
      const items = getters.filteredItems as MaintenanceRequest[]
      const total = items.length

      return {
        total,
        newCount: items.filter((item) => item.status === 'new').length,
        inProgressCount: items.filter((item) => item.status === 'in_progress').length,
        totalCost: items.reduce((sum, item) => sum + item.cost, 0)
      }
    },

    statusChartData(
      state,
      getters
    ): Array<{ label: string; value: number; status: RequestStatus }> {
      const items = getters.filteredItems as MaintenanceRequest[]

      const counts: Record<RequestStatus, number> = {
        new: 0,
        in_progress: 0,
        completed: 0,
        overdue: 0
      }

      items.forEach((item) => {
        counts[item.status] += 1
      })

      return [
        { label: 'Новая', value: counts.new, status: 'new' },
        { label: 'В работе', value: counts.in_progress, status: 'in_progress' },
        { label: 'Завершена', value: counts.completed, status: 'completed' },
        { label: 'Просрочена', value: counts.overdue, status: 'overdue' }
      ]
    },

    topCostRequests(state, getters): MaintenanceRequest[] {
      return [...(getters.filteredItems as MaintenanceRequest[])]
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5)
    }
  },

  mutations: {
    setLoading(state, payload: boolean) {
      state.loading = payload
    },

    setItems(state, payload: MaintenanceRequest[]) {
      state.items = payload
    },

    setError(state, payload: string | null) {
      state.error = payload
    },

    setFilters(state, payload: Partial<MaintenanceRequestFilters>) {
      state.filters = {
        ...state.filters,
        ...payload
      }
    },

    resetFilters(state) {
      state.filters = initialFilters()
    },

    setSelectedRequest(state, payload: MaintenanceRequest | null) {
      state.selectedRequest = payload
    },

    setHighlightedRequestId(state, payload: number | null) {
      state.highlightedRequestId = payload
    },

    setActiveChartStatus(state, payload: RequestStatus | '') {
      state.activeChartStatus = payload
    }
  },

  actions: {
    async fetchMaintenanceRequests({ commit }) {
      commit('setLoading', true)
      commit('setError', null)

      try {
        await new Promise((resolve) => {
          setTimeout(resolve, 800)
        })

        commit('setItems', maintenanceRequestMock as MaintenanceRequest[])
      } catch {
        commit('setError', 'Не удалось загрузить список заявок на обслуживание')
      } finally {
        commit('setLoading', false)
      }
    },

    updateFilters({ commit }, payload: Partial<MaintenanceRequestFilters>) {
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

    selectRequest({ commit }, request: MaintenanceRequest) {
      commit('setSelectedRequest', request)
      commit('setHighlightedRequestId', request.id)
    },

    closeDetails({ commit }) {
      commit('setSelectedRequest', null)
    },

    highlightRequest({ commit }, requestId: number | null) {
      commit('setHighlightedRequestId', requestId)
    },

    drilldownByStatus({ commit }, status: RequestStatus | '') {
      commit('setActiveChartStatus', status)
      commit('setFilters', {
        status,
        page: 1
      })
    }
  }
}
