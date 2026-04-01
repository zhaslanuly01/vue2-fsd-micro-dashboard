export interface PipelineSectionDto {
  id: number
  sectionName: string
  region: string
  status: string
  startDate: string
  lengthKm: number
  throughput: number
  pressure: number
  incidentsCount: number
  lastInspectionDate: string
  lat: number
  lng: number
}
