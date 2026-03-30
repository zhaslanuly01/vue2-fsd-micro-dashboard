import { authHandlers } from '@/features/auth-by-email'
import { userHandlers } from '@/entities/user'

export const handlers = [...authHandlers, ...userHandlers]
