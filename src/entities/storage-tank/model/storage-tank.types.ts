export type TankStatus = 'normal' | 'high_load' | 'maintenance' | 'offline'

export interface StorageTank {
  id: number
  tankNumber: string
  terminalName: string
  region: string
  status: TankStatus
  commissioningDate: string
  capacity: number
  currentVolume: number
  fillPercent: number
  dailyIntake: number
  dailyShipment: number
  productType: 'oil' | 'gas_condensate' | 'fuel_oil'
  lat: number
  lng: number
}
