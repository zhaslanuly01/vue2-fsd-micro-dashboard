import type { AxiosPromise } from 'axios'
import { apiInstance } from '@/shared/api/local'
import type { ListResponse, EquipmentQuery } from '../model/equipment.types'
import type { EquipmentUnitDto } from './equipment.dto.types'

export const getEquipment = (
  params: EquipmentQuery = {}
): AxiosPromise<ListResponse<EquipmentUnitDto>> => {
  return apiInstance.get('/equipment', { params })
}

export const getEquipmentById = (id: number): AxiosPromise<EquipmentUnitDto> => {
  return apiInstance.get(`/equipment/${id}`)
}
