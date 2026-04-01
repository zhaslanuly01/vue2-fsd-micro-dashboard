export interface MaintenanceRequestDto {
  id: number
  title: string
  objectName: string
  fieldName: string
  priority: 'low' | 'medium' | 'high'
  status: string
  createdAt: string
  plannedDate: string
  completedAt: string | null
  cost: number
  responsibleTeam: string
  lat: number
  lng: number
}
