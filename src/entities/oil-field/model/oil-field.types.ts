export type FieldStatus = 'stable' | 'growing' | 'declining' | 'risk'

export interface OilField {
  id: number
  name: string
  region: string
  status: FieldStatus
  startDate: string
  dailyProduction: number
  monthlyProduction: number
  yearlyPlan: number
  yearlyFact: number
  activeWells: number
  totalWells: number
  contractor: string
  lat: number
  lng: number
}

export interface OilFieldFilters {
  search: string
  status: string
  region: string
  contractor: string
  sortBy: string
  sortOrder: '' | 'ascending' | 'descending'
  page: number
  pageSize: number
}

export interface OilFieldKpi {
  total: number
  growing: number
  totalDailyProduction: number
  avgPlanExecution: number
}

export interface OilFieldState {
  items: OilField[]
  loading: boolean
  error: string | null
  filters: OilFieldFilters
  selectedField: OilField | null
  highlightedFieldId: number | null
  activeChartStatus: FieldStatus | ''
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

export interface OilFieldQuery {
  search?: string
  status?: string
  region?: string
  contractor?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
