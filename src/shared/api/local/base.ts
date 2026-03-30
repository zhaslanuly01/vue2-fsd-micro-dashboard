import axios from 'axios'
import { config } from '@/shared/lib'

const TOKEN_KEY = 'access_token'

export const apiInstance = axios.create({
  baseURL: config.API_ENDPOINT
})

apiInstance.interceptors.request.use((request) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    request.headers = request.headers || {}
    request.headers.Authorization = `Bearer ${token}`
  }

  return request
})
