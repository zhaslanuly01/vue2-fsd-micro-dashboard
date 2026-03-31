export type EquipmentStatus = 'operational' | 'warning' | 'critical' | 'offline'

export interface EquipmentUnit {
  id: number
  name: string
  type: 'pump' | 'compressor' | 'separator' | 'generator'
  fieldName: string
  status: EquipmentStatus
  installDate: string
  efficiency: number
  temperature: number
  pressure: number
  runtimeHours: number
  nextMaintenanceDate: string
  lat: number
  lng: number
}
