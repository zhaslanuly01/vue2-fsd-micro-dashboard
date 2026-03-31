export type RequestStatus = 'new' | 'in_progress' | 'completed' | 'overdue'

export interface MaintenanceRequest {
  id: number
  title: string
  objectName: string
  fieldName: string
  priority: 'low' | 'medium' | 'high'
  status: RequestStatus
  createdAt: string
  plannedDate: string
  completedAt: string | null
  cost: number
  responsibleTeam: string
  lat: number
  lng: number
}
