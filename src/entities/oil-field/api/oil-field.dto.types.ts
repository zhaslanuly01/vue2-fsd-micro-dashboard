export interface OilFieldDto {
  id: number
  name: string
  region: string
  status: string
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
