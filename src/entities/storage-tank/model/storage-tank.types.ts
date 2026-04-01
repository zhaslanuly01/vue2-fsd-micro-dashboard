export type TankStatus = 'normal' | 'high_load' | 'maintenance' | 'offline'
export type ProductType = 'oil' | 'gas_condensate' | 'fuel_oil'

export interface StorageTank {
  id: number
  tankNumber: string
  terminalName: string
  region: string
  status: TankStatus
  commissioningDate: string
  capacity: number
  currentVolume: number
  fillPercent: number
  dailyIntake: number
  dailyShipment: number
  productType: ProductType
  lat: number
  lng: number
}

export interface StorageTankFilters {
  search: string
  status: string
  region: string
  terminalName: string
  productType: string
  sortBy: string
  sortOrder: '' | 'ascending' | 'descending'
  page: number
  pageSize: number
}

export interface StorageTankKpi {
  total: number
  normal: number
  avgFillPercent: number
  totalCurrentVolume: number
}

export interface StorageTankState {
  items: StorageTank[]
  loading: boolean
  error: string | null
  filters: StorageTankFilters
  selectedTank: StorageTank | null
  highlightedTankId: number | null
  activeChartStatus: TankStatus | ''
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

export interface StorageTankQuery {
  search?: string
  status?: string
  region?: string
  terminalName?: string
  productType?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
