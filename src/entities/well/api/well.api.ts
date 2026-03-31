import type { AxiosPromise } from 'axios'
import { apiInstance } from '@/shared/api/local'
import { ListResponse, WellsQuery } from '../model/well.types'
import { WellDto } from './well.dto.types'

export const getWells = (params: WellsQuery = {}): AxiosPromise<ListResponse<WellDto>> => {
  return apiInstance.get('/wells', { params })
}

export const getWellById = (id: number): AxiosPromise<WellDto> => {
  return apiInstance.get(`/wells/${id}`)
}
