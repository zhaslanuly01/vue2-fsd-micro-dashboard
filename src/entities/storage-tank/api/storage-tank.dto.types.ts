export interface StorageTankDto {
  id: number
  tankNumber: string
  terminalName: string
  region: string
  status: string
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
