import { authHandlers } from '@/features/auth-by-email'
import { userHandlers } from '@/entities/user'
import { wellsHandlers } from '@/entities/well'

export const handlers = [...authHandlers, ...userHandlers, ...wellsHandlers]
