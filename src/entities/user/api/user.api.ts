import type { AxiosPromise } from 'axios'
import { apiInstance } from '@/shared/api/local'
import { UserDto } from './user.dto.types'

const BASE_URL = 'profile'

export const getProfile = (): AxiosPromise<UserDto> => {
  return apiInstance.get(BASE_URL)
}
