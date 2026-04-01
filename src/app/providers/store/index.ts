import Vue from 'vue'
import Vuex from 'vuex'
import { auth } from './modules/auth'
import { wellModule } from '@/entities/well'
import { storageTankModule } from '@/entities/storage-tank'
import { equipmentModule } from '@/entities/equipment'

Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    auth,
    well: wellModule,
    storageTank: storageTankModule,
    equipment: equipmentModule
  }
})

export type RootState = ReturnType<(typeof store)['state']>
