export type PipelineStatus = 'operational' | 'inspection' | 'repair' | 'critical'

export interface PipelineSection {
  id: number
  sectionName: string
  region: string
  status: PipelineStatus
  startDate: string
  lengthKm: number
  throughput: number
  pressure: number
  incidentsCount: number
  lastInspectionDate: string
  lat: number
  lng: number
}

export interface PipelineFilters {
  search: string
  status: string
  region: string
  sortBy: string
  sortOrder: '' | 'ascending' | 'descending'
  page: number
  pageSize: number
}

export interface PipelineKpi {
  total: number
  operational: number
  totalLengthKm: number
  avgPressure: number
}

export interface PipelineState {
  items: PipelineSection[]
  loading: boolean
  error: string | null
  filters: PipelineFilters
  selectedPipeline: PipelineSection | null
  highlightedPipelineId: number | null
  activeChartStatus: PipelineStatus | ''
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

export interface PipelineQuery {
  search?: string
  status?: string
  region?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
