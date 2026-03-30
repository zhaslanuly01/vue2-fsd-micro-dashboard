import Vue from 'vue'
import App from './App.vue'
import { router } from './providers'
import './styles/index.scss'

const app = new Vue({
  router,
  render: (h) => h(App)
})

export { app }
