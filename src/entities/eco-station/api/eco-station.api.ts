import type { AxiosPromise } from 'axios'
import { apiInstance } from '@/shared/api/local'
import type { ListResponse, EcoStationQuery } from '../model/eco-station.types'
import type { EcoStationDto } from './eco-station.dto.types'

export const getEcoStations = (
  params: EcoStationQuery = {}
): AxiosPromise<ListResponse<EcoStationDto>> => {
  return apiInstance.get('/eco-stations', { params })
}

export const getEcoStationById = (id: number): AxiosPromise<EcoStationDto> => {
  return apiInstance.get(`/eco-stations/${id}`)
}
