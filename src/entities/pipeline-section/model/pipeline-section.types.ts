export type PipelineStatus = 'operational' | 'inspection' | 'repair' | ' аварийный'

export interface PipelineSection {
  id: number
  sectionName: string
  region: string
  status: PipelineStatus
  startDate: string
  lengthKm: number
  throughput: number
  pressure: number
  incidentsCount: number
  lastInspectionDate: string
  lat: number
  lng: number
}
