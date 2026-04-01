import { authHandlers } from '@/features/auth-by-email'
import { userHandlers } from '@/entities/user'
import { wellsHandlers } from '@/entities/well'
import { storageTankHandlers } from '@/entities/storage-tank'
import { equipmentHandlers } from '@/entities/equipment'
import { pipelineHandlers } from '@/entities/pipeline'
import { ecoStationHandlers } from '@/entities/eco-station'

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...wellsHandlers,
  ...storageTankHandlers,
  ...equipmentHandlers,
  ...pipelineHandlers,
  ...ecoStationHandlers
]
