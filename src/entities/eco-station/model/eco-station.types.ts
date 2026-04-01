export type EcoStatus = 'normal' | 'attention' | 'critical'

export interface EcoStation {
  id: number
  stationName: string
  fieldName: string
  region: string
  status: EcoStatus
  measurementDate: string
  emissionLevel: number
  co2Level: number
  h2sLevel: number
  waterQualityIndex: number
  responsibleUnit: string
  lat: number
  lng: number
}

export interface EcoStationFilters {
  search: string
  status: string
  region: string
  fieldName: string
  responsibleUnit: string
  sortBy: string
  sortOrder: '' | 'ascending' | 'descending'
  page: number
  pageSize: number
}

export interface EcoStationKpi {
  total: number
  normal: number
  avgEmissionLevel: number
  avgWaterQualityIndex: number
}

export interface EcoStationState {
  items: EcoStation[]
  loading: boolean
  error: string | null
  filters: EcoStationFilters
  selectedStation: EcoStation | null
  highlightedStationId: number | null
  activeChartStatus: EcoStatus | ''
}

export interface ListResponse<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  filters: Record<string, string>
}

export interface EcoStationQuery {
  search?: string
  status?: string
  region?: string
  fieldName?: string
  responsibleUnit?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
