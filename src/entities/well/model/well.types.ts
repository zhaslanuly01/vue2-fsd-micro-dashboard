export type WellStatus = 'active' | 'inactive' | 'maintenance' | 'conservation'

export interface Well {
  id: number
  wellNumber: string
  fieldName: string
  region: string
  status: WellStatus
  launchDate: string
  oilRate: number
  waterCut: number
  depth: number
  pressure: number
  lastInspectionDate: string
  lat: number
  lng: number
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
