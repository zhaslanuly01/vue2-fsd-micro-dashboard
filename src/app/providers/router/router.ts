import Vue from 'vue'
import Router, { type RouteConfig } from 'vue-router'
import { store } from '@/app/providers/store'
import { LoginPage } from '@/pages/login'
import { WellPage } from '@/pages/well'
import { AnalyticsPage } from '@/pages/analytics'
import { StorageTankPage } from '@/pages/storage-tank'
import { EquipmentPage } from '@/pages/equipment'
import { PipelinePage } from '@/pages/pipeline'
import { EcoStationPage } from '@/pages/eco-station'
import { MaintenanceRequestPage } from '@/pages/maintenance-request'
import { OilFieldPage } from '@/pages/oil-field'

Vue.use(Router)

const authMeta = {
  requiresAuth: true,
  layout: 'default'
}

const routes: RouteConfig[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: {
      requiresAuth: false,
      guestOnly: true,
      layout: 'empty'
    }
  },
  {
    path: '/',
    name: 'analytics',
    component: AnalyticsPage,
    meta: authMeta
  },
  {
    path: '/storage-tank',
    name: 'storage-tank',
    component: StorageTankPage,
    meta: authMeta
  },
  {
    path: '/equipment',
    name: 'equipment',
    component: EquipmentPage,
    meta: authMeta
  },
  {
    path: '/pipeline-section',
    name: 'pipeline-section',
    component: PipelinePage,
    meta: authMeta
  },
  {
    path: '/eco-station',
    name: 'eco-station',
    component: EcoStationPage,
    meta: authMeta
  },
  {
    path: '/maintenance-requests',
    name: 'maintenance-requests',
    component: MaintenanceRequestPage,
    meta: authMeta
  },
  {
    path: '/well',
    name: 'well',
    component: WellPage,
    meta: authMeta
  },
  {
    path: '/oil-field',
    name: 'oil-field',
    component: OilFieldPage,
    meta: authMeta
  },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new Router({
  mode: 'hash',
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']

  if (to.matched.some((record) => record.meta?.requiresAuth) && !isAuthenticated) {
    next({
      name: 'login',
      query: {
        redirect: to.fullPath
      }
    })
    return
  }

  if (to.matched.some((record) => record.meta?.guestOnly) && isAuthenticated) {
    next({ name: 'well' })
    return
  }

  next()
})

export { router }
