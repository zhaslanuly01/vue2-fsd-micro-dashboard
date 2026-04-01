export type EquipmentStatus = 'operational' | 'warning' | 'critical' | 'offline'
export type EquipmentType = 'pump' | 'compressor' | 'separator' | 'generator'

export interface EquipmentUnit {
  id: number
  name: string
  type: EquipmentType
  fieldName: string
  status: EquipmentStatus
  installDate: string
  efficiency: number
  temperature: number
  pressure: number
  runtimeHours: number
  nextMaintenanceDate: string
  lat: number
  lng: number
}

export interface EquipmentFilters {
  search: string
  status: string
  fieldName: string
  type: string
  sortBy: string
  sortOrder: '' | 'ascending' | 'descending'
  page: number
  pageSize: number
}

export interface EquipmentKpi {
  total: number
  operational: number
  avgEfficiency: number
  avgTemperature: number
}

export interface EquipmentState {
  items: EquipmentUnit[]
  loading: boolean
  error: string | null
  filters: EquipmentFilters
  selectedEquipment: EquipmentUnit | null
  highlightedEquipmentId: number | null
  activeChartStatus: EquipmentStatus | ''
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

export interface EquipmentQuery {
  search?: string
  status?: string
  fieldName?: string
  type?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
