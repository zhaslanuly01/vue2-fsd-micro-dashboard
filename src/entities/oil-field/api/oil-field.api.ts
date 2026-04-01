import type { AxiosPromise } from 'axios'
import { apiInstance } from '@/shared/api/local'
import type { ListResponse, OilFieldQuery } from '../model/oil-field.types'
import type { OilFieldDto } from './oil-field.dto.types'

export const getOilFields = (
  params: OilFieldQuery = {}
): AxiosPromise<ListResponse<OilFieldDto>> => {
  return apiInstance.get('/oil-fields', { params })
}

export const getOilFieldById = (id: number): AxiosPromise<OilFieldDto> => {
  return apiInstance.get(`/oil-fields/${id}`)
}
