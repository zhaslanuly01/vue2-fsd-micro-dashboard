import type { AxiosPromise } from 'axios'
import { apiInstance } from '@/shared/api/local'
import type { ListResponse, MaintenanceRequestQuery } from '../model/maintenance-request.types'
import type { MaintenanceRequestDto } from './maintenance-request.dto.types'

export const getMaintenanceRequests = (
  params: MaintenanceRequestQuery = {}
): AxiosPromise<ListResponse<MaintenanceRequestDto>> => {
  return apiInstance.get('/maintenance-requests', { params })
}

export const getMaintenanceRequestById = (id: number): AxiosPromise<MaintenanceRequestDto> => {
  return apiInstance.get(`/maintenance-requests/${id}`)
}
