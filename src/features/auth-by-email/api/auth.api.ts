import type { AxiosPromise } from 'axios'
import { apiInstance } from '@/shared/api/local'
import { LoginResponseDto } from './auth.dto.types'
import { LoginByEmailParams } from '../models/auth.types'

const BASE_URL = 'auth'

export const loginByEmail = (data: LoginByEmailParams): AxiosPromise<LoginResponseDto> => {
  return apiInstance.post(`${BASE_URL}/login`, data)
}

export const logout = (): AxiosPromise<void> => {
  return apiInstance.post(`${BASE_URL}/logout`)
}
