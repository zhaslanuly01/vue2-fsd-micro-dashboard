export interface EquipmentUnitDto {
  id: number
  name: string
  type: 'pump' | 'compressor' | 'separator' | 'generator'
  fieldName: string
  status: string
  installDate: string
  efficiency: number
  temperature: number
  pressure: number
  runtimeHours: number
  nextMaintenanceDate: string
  lat: number
  lng: number
}
