import Vue from 'vue'
import Vuex from 'vuex'
import { auth } from './modules/auth'
import { wellModule } from '@/entities/well'
import { storageTankModule } from '@/entities/storage-tank'

Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    auth,
    well: wellModule,
    storageTank: storageTankModule
  }
})

export type RootState = ReturnType<(typeof store)['state']>
