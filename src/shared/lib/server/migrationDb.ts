import {
  ecoStationsMock,
  equipmentMock,
  maintenanceRequestsMock,
  oilFieldsMock,
  pipelineSectionsMock,
  storageTanksMock,
  usersMock,
  wellsMock
} from './index'
import { db } from './serverDb'

export function startDatabaseMigration() {
  if (db.user.getAll().length === 0) {
    usersMock.forEach((item) => db.user.create(item))
  }

  if (db.well.getAll().length === 0) {
    wellsMock.forEach((item) => db.well.create(item))
  }

  if (db.oilField.getAll().length === 0) {
    oilFieldsMock.forEach((item) => db.oilField.create(item))
  }

  if (db.equipment.getAll().length === 0) {
    equipmentMock.forEach((item) => db.equipment.create(item))
  }

  if (db.maintenanceRequest.getAll().length === 0) {
    maintenanceRequestsMock.forEach((item) => db.maintenanceRequest.create(item))
  }

  if (db.storageTank.getAll().length === 0) {
    storageTanksMock.forEach((item) => db.storageTank.create(item))
  }

  if (db.ecoStation.getAll().length === 0) {
    ecoStationsMock.forEach((item) => db.ecoStation.create(item))
  }

  if (db.pipelineSection.getAll().length === 0) {
    pipelineSectionsMock.forEach((item) => db.pipelineSection.create(item))
  }
}
