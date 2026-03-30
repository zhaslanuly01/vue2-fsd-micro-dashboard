import Vue from 'vue'
import Router, { type RouteConfig } from 'vue-router'
import { HomePage } from '@/pages/home'

Vue.use(Router)

const routes: RouteConfig[] = [
  {
    path: '/',
    name: 'home',
    component: HomePage
  }
]

const router = new Router({
  mode: 'history',
  routes
})

export { router }
