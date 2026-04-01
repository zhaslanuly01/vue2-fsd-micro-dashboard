import Vue from 'vue'
import Vuex from 'vuex'
import { auth } from './modules/auth'
import { wellModule } from '@/entities/well'
import { storageTankModule } from '@/entities/storage-tank'
import { equipmentModule } from '@/entities/equipment'
import { pipelineModule } from '@/entities/pipeline'
import { ecoStationModule } from '@/entities/eco-station'
import { maintenanceRequestModule } from '@/entities/maintenance-request'
import { oilFieldModule } from '@/entities/oil-field'

Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    auth,
    well: wellModule,
    storageTank: storageTankModule,
    equipment: equipmentModule,
    pipeline: pipelineModule,
    ecoStation: ecoStationModule,
    maintenanceRequest: maintenanceRequestModule,
    oilField: oilFieldModule
  }
})

export type RootState = ReturnType<(typeof store)['state']>
