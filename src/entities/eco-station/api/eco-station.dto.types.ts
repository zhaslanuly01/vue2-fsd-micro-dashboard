export interface EcoStationDto {
  id: number
  stationName: string
  fieldName: string
  region: string
  status: string
  measurementDate: string
  emissionLevel: number
  co2Level: number
  h2sLevel: number
  waterQualityIndex: number
  responsibleUnit: string
  lat: number
  lng: number
}
