export type WellStatus = 'active' | 'inactive' | 'maintenance' | 'conservation'

export interface Well {
  id: number
  wellNumber: string
  name: string
  fieldName: string
  region: string
  status: WellStatus
  launchDate: string
  oilRate: number
  gasRate: number
  waterCut: number
  depth: number
  pressure: number
  temperature: number
  engineer: string
  cluster: string
  lastInspectionDate: string
  lat: number
  lng: number
}

export interface WellsFilters {
  search: string
  status: string
  region: string
  fieldName: string
  sortBy: string
  sortOrder: '' | 'ascending' | 'descending'
  page: number
  pageSize: number
}

export interface WellsState {
  items: Well[]
  loading: boolean
  error: string | null
  filters: WellsFilters
  selectedWell: Well | null
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

export interface WellsQuery {
  search?: string
  status?: string
  region?: string
  fieldName?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
