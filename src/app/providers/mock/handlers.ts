import { authHandlers } from '@/features/auth-by-email'
import { userHandlers } from '@/entities/user'
import { wellsHandlers } from '@/entities/well'
import { storageTankHandlers } from '@/entities/storage-tank'

export const handlers = [...authHandlers, ...userHandlers, ...wellsHandlers, ...storageTankHandlers]
