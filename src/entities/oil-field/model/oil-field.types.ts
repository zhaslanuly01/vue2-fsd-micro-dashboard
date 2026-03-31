export type FieldStatus = 'stable' | 'growing' | 'declining' | 'risk'

export interface OilField {
  id: number
  name: string
  region: string
  status: FieldStatus
  startDate: string
  dailyProduction: number
  monthlyProduction: number
  yearlyPlan: number
  yearlyFact: number
  activeWells: number
  totalWells: number
  contractor: string
  lat: number
  lng: number
}
