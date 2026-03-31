import { factory, nullable, primaryKey } from '@mswjs/data'

export const db = factory({
  user: {
    id: primaryKey(Number),
    email: String,
    password: String,
    name: String,
    surname: String,
    middle_name: String,
    organization_id: Number,
    avatar_url: nullable(String),
    role: String
  },

  well: {
    id: primaryKey(Number),
    wellNumber: String,
    name: String,
    fieldName: String,
    region: String,
    status: String,
    launchDate: String,
    oilRate: Number,
    gasRate: Number,
    waterCut: Number,
    depth: Number,
    pressure: Number,
    temperature: Number,
    engineer: String,
    cluster: String,
    lastInspectionDate: String,
    lat: Number,
    lng: Number
  },

  oilField: {
    id: primaryKey(Number),
    name: String,
    region: String,
    status: String,
    startDate: String,
    dailyProduction: Number,
    monthlyProduction: Number,
    yearlyPlan: Number,
    yearlyFact: Number,
    activeWells: Number,
    totalWells: Number,
    contractor: String,
    lat: Number,
    lng: Number
  },

  equipment: {
    id: primaryKey(Number),
    name: String,
    type: String,
    fieldName: String,
    status: String,
    installDate: String,
    efficiency: Number,
    temperature: Number,
    pressure: Number,
    runtimeHours: Number,
    nextMaintenanceDate: String,
    lat: Number,
    lng: Number
  },

  maintenanceRequest: {
    id: primaryKey(Number),
    title: String,
    objectName: String,
    fieldName: String,
    priority: String,
    status: String,
    createdAt: String,
    plannedDate: String,
    completedAt: nullable(String),
    cost: Number,
    responsibleTeam: String,
    lat: Number,
    lng: Number
  },

  storageTank: {
    id: primaryKey(Number),
    tankNumber: String,
    terminalName: String,
    region: String,
    status: String,
    commissioningDate: String,
    capacity: Number,
    currentVolume: Number,
    fillPercent: Number,
    dailyIntake: Number,
    dailyShipment: Number,
    productType: String,
    lat: Number,
    lng: Number
  },

  ecoStation: {
    id: primaryKey(Number),
    stationName: String,
    fieldName: String,
    region: String,
    status: String,
    measurementDate: String,
    emissionLevel: Number,
    co2Level: Number,
    h2sLevel: Number,
    waterQualityIndex: Number,
    responsibleUnit: String,
    lat: Number,
    lng: Number
  },

  pipelineSection: {
    id: primaryKey(Number),
    sectionName: String,
    region: String,
    status: String,
    startDate: String,
    lengthKm: Number,
    throughput: Number,
    pressure: Number,
    incidentsCount: Number,
    lastInspectionDate: String,
    lat: Number,
    lng: Number
  }
})
