import { z } from 'zod'

const envVariables = z.object({
  VITE_API_ENDPOINT: z.string().optional(),
  VITE_API_STORAGE_MODE: z.enum(['session', 'local']).optional(),
  VITE_API_DELAY: z.string().regex(/^\d+$/, { message: 'Must be a positive number' }).optional(),
  VITE_API_USER_EMAIL: z.string().email().optional(),
  VITE_API_USER_PASSWORD: z.string().min(6).optional(),
  VITE_ENABLE_MSW: z.enum(['true', 'false']).optional()
})

envVariables.parse(import.meta.env)

declare global {
  interface ImportMetaEnv extends z.infer<typeof envVariables> {}
}

export const config = {
  API_ENDPOINT: import.meta.env.VITE_API_ENDPOINT || '',
  API_STORAGE_MODE: import.meta.env.VITE_API_STORAGE_MODE || 'session',
  API_DELAY: Number(import.meta.env.VITE_API_DELAY || '300'),
  API_USER_EMAIL: import.meta.env.VITE_API_USER_EMAIL || 'admin@email.com',
  API_USER_PASSWORD: import.meta.env.VITE_API_USER_PASSWORD || 'adminadmin',
  ENABLE_MSW: import.meta.env.VITE_ENABLE_MSW === 'true'
} as const
