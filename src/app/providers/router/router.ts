import Vue from 'vue'
import Router, { type RouteConfig } from 'vue-router'
import { store } from '@/app/providers/store'
import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { WellPage } from '@/pages/well'

Vue.use(Router)

const routes: RouteConfig[] = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: {
      requiresAuth: true,
      layout: 'default'
    }
  },
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
    component: WellPage
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
