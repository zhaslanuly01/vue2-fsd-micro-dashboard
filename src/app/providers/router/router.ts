import Vue from 'vue'
import Router, { type RouteConfig } from 'vue-router'
import { store } from '@/app/providers/store'
import { HomePage } from '@/pages/home'
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
    path: '/well',
    name: 'well',
    component: WellPage,
    meta: {
      requiresAuth: true,
      layout: 'default'
    }
  },
  {
    path: '/',
    name: 'analytics',
    component: AnalyticsPage
  },
  {
    path: '/storage-tank',
    name: 'storage-tank',
    component: StorageTankPage
  },
  {
    path: '/equipment',
    name: 'equipment',
    component: EquipmentPage
  },
  {
    path: '/pipeline-section',
    name: 'pipeline-section',
    component: PipelinePage
  },
  {
    path: '/eco-station',
    name: 'eco-station',
    component: EcoStationPage
  },
  {
    path: '/maintenance-requests',
    name: 'maintenance-requests',
    component: MaintenanceRequestPage
  },
  {
    path: '/oil-field',
    name: 'oil-field',
    component: OilFieldPage
  },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new Router({
  mode: 'history',
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
    next({ name: 'home' })
    return
  }

  next()
})

export { router }
