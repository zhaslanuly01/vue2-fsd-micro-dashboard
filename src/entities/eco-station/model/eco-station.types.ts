export type EcoStatus = 'normal' | 'attention' | 'critical'

export interface EcoStation {
  id: number
  stationName: string
  fieldName: string
  region: string
  status: EcoStatus
  measurementDate: string
  emissionLevel: number
  co2Level: number
  h2sLevel: number
  waterQualityIndex: number
  responsibleUnit: string
  lat: number
  lng: number
}
