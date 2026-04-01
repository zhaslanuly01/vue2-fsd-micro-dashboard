import type { Module } from 'vuex'
import tanksMock from '@/shared/lib/server/__mocks__/storage-tanks.json'
import type {
  ProductType,
  StorageTank,
  StorageTankFilters,
  StorageTankKpi,
  StorageTankState,
  TankStatus
} from './storage-tank.types'

function applyFilters(items: StorageTank[], filters: StorageTankFilters): StorageTank[] {
  let result = [...items]

  if (filters.search.trim()) {
    const normalized = filters.search.trim().toLowerCase()

    result = result.filter(
      (item) =>
        item.tankNumber.toLowerCase().includes(normalized) ||
        item.terminalName.toLowerCase().includes(normalized) ||
        item.region.toLowerCase().includes(normalized)
    )
  }

  if (filters.status) {
    result = result.filter((item) => item.status === filters.status)
  }

  if (filters.region) {
    result = result.filter((item) => item.region === filters.region)
  }

  if (filters.terminalName) {
    result = result.filter((item) => item.terminalName === filters.terminalName)
  }

  if (filters.productType) {
    result = result.filter((item) => item.productType === filters.productType)
  }

  if (filters.sortBy) {
    result.sort((a, b) => {
      const aValue = Number(a[filters.sortBy as keyof StorageTank] ?? 0)
      const bValue = Number(b[filters.sortBy as keyof StorageTank] ?? 0)

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

const initialFilters = (): StorageTankFilters => ({
  search: '',
  status: '',
  region: '',
  terminalName: '',
  productType: '',
  sortBy: '',
  sortOrder: '',
  page: 1,
  pageSize: 10
})

export const storageTankModule: Module<StorageTankState, any> = {
  namespaced: true,

  state: (): StorageTankState => ({
    items: [],
    loading: false,
    error: null,
    filters: initialFilters(),
    selectedTank: null,
    highlightedTankId: null,
    activeChartStatus: ''
  }),

  getters: {
    filteredItems(state): StorageTank[] {
      return applyFilters(state.items, state.filters)
    },

    paginatedItems(state, getters): StorageTank[] {
      const start = (state.filters.page - 1) * state.filters.pageSize
      const end = start + state.filters.pageSize

      return (getters.filteredItems as StorageTank[]).slice(start, end)
    },

    total(state, getters): number {
      return (getters.filteredItems as StorageTank[]).length
    },

    regions(state): string[] {
      return [...new Set(state.items.map((item) => item.region))].sort()
    },

    terminalNames(state): string[] {
      return [...new Set(state.items.map((item) => item.terminalName))].sort()
    },

    productTypes(): Array<{ label: string; value: ProductType }> {
      return [
        { label: 'Нефть', value: 'oil' },
        { label: 'Газоконденсат', value: 'gas_condensate' },
        { label: 'Мазут', value: 'fuel_oil' }
      ]
    },

    topFilledTanks(state, getters): StorageTank[] {
      return [...(getters.filteredItems as StorageTank[])]
        .sort((a, b) => b.fillPercent - a.fillPercent)
        .slice(0, 6)
    },

    statuses(): Array<{ label: string; value: TankStatus }> {
      return [
        { label: 'Нормальный', value: 'normal' },
        { label: 'Высокая нагрузка', value: 'high_load' },
        { label: 'На обслуживании', value: 'maintenance' },
        { label: 'Оффлайн', value: 'offline' }
      ]
    },

    kpi(state, getters): StorageTankKpi {
      const items = getters.filteredItems as StorageTank[]
      const total = items.length

      return {
        total,
        normal: items.filter((item) => item.status === 'normal').length,
        avgFillPercent: total
          ? Math.round(items.reduce((sum, item) => sum + item.fillPercent, 0) / total)
          : 0,
        totalCurrentVolume: items.reduce((sum, item) => sum + item.currentVolume, 0)
      }
    },

    statusChartData(state, getters): Array<{ label: string; value: number; status: TankStatus }> {
      const items = getters.filteredItems as StorageTank[]

      const counts: Record<TankStatus, number> = {
        normal: 0,
        high_load: 0,
        maintenance: 0,
        offline: 0
      }

      items.forEach((item) => {
        counts[item.status] += 1
      })

      return [
        { label: 'Нормальный', value: counts.normal, status: 'normal' },
        { label: 'Высокая нагрузка', value: counts.high_load, status: 'high_load' },
        { label: 'На обслуживании', value: counts.maintenance, status: 'maintenance' },
        { label: 'Оффлайн', value: counts.offline, status: 'offline' }
      ]
    }
  },

  mutations: {
    setLoading(state, payload: boolean) {
      state.loading = payload
    },

    setItems(state, payload: StorageTank[]) {
      state.items = payload
    },

    setError(state, payload: string | null) {
      state.error = payload
    },

    setFilters(state, payload: Partial<StorageTankFilters>) {
      state.filters = {
        ...state.filters,
        ...payload
      }
    },

    resetFilters(state) {
      state.filters = initialFilters()
    },

    setSelectedTank(state, payload: StorageTank | null) {
      state.selectedTank = payload
    },

    setHighlightedTankId(state, payload: number | null) {
      state.highlightedTankId = payload
    },

    setActiveChartStatus(state, payload: TankStatus | '') {
      state.activeChartStatus = payload
    }
  },

  actions: {
    async fetchStorageTanks({ commit }) {
      commit('setLoading', true)
      commit('setError', null)

      try {
        await new Promise((resolve) => {
          setTimeout(resolve, 800)
        })

        commit('setItems', tanksMock as StorageTank[])
      } catch {
        commit('setError', 'Не удалось загрузить список резервуаров')
      } finally {
        commit('setLoading', false)
      }
    },

    updateFilters({ commit }, payload: Partial<StorageTankFilters>) {
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

    selectTank({ commit }, tank: StorageTank) {
      commit('setSelectedTank', tank)
      commit('setHighlightedTankId', tank.id)
    },

    closeDetails({ commit }) {
      commit('setSelectedTank', null)
    },

    highlightTank({ commit }, tankId: number | null) {
      commit('setHighlightedTankId', tankId)
    },

    drilldownByStatus({ commit }, status: TankStatus | '') {
      commit('setActiveChartStatus', status)
      commit('setFilters', {
        status,
        page: 1
      })
    }
  }
}
