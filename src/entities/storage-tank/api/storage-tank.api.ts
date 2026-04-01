import type { AxiosPromise } from 'axios'
import { apiInstance } from '@/shared/api/local'
import type { ListResponse, StorageTankQuery } from '../model/storage-tank.types'
import type { StorageTankDto } from './storage-tank.dto.types'

export const getStorageTanks = (
  params: StorageTankQuery = {}
): AxiosPromise<ListResponse<StorageTankDto>> => {
  return apiInstance.get('/storage-tanks', { params })
}

export const getStorageTankById = (id: number): AxiosPromise<StorageTankDto> => {
  return apiInstance.get(`/storage-tanks/${id}`)
}
