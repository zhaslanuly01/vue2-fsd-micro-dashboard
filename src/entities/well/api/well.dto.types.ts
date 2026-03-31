export interface WellDto {
  id: number
  wellNumber: string
  name: string
  fieldName: string
  region: string
  status: string
  launchDate: string
  oilRate: number
  gasRate: number
  waterCut: number
  depth: number
  pressure: number
  temperature: number
  engineer: string
  cluster: string
  lastInspectionDate: string
  lat: number
  lng: number
}
