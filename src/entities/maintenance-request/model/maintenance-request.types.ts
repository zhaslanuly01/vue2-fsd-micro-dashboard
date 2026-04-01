export type RequestStatus = 'new' | 'in_progress' | 'completed' | 'overdue'
export type RequestPriority = 'low' | 'medium' | 'high'

export interface MaintenanceRequest {
  id: number
  title: string
  objectName: string
  fieldName: string
  priority: RequestPriority
  status: RequestStatus
  createdAt: string
  plannedDate: string
  completedAt: string | null
  cost: number
  responsibleTeam: string
  lat: number
  lng: number
}

export interface MaintenanceRequestFilters {
  search: string
  status: string
  fieldName: string
  priority: string
  responsibleTeam: string
  sortBy: string
  sortOrder: '' | 'ascending' | 'descending'
  page: number
  pageSize: number
}

export interface MaintenanceRequestKpi {
  total: number
  newCount: number
  inProgressCount: number
  totalCost: number
}

export interface MaintenanceRequestState {
  items: MaintenanceRequest[]
  loading: boolean
  error: string | null
  filters: MaintenanceRequestFilters
  selectedRequest: MaintenanceRequest | null
  highlightedRequestId: number | null
  activeChartStatus: RequestStatus | ''
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

export interface MaintenanceRequestQuery {
  search?: string
  status?: string
  fieldName?: string
  priority?: string
  responsibleTeam?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
