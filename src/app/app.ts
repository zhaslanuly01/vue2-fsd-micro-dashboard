import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App.vue'
import { router, store } from './providers'
import './styles/index.scss'
import { __serverStartDatabaseMigration } from '@/shared/lib/server'

Vue.use(ElementUI)

async function enableMocking() {
  if (!import.meta.env.DEV) {
    return
  }

  const { worker } = await import('./providers/mock/browser')

  await worker.start({
    onUnhandledRequest: 'bypass'
  })
}

async function bootstrap() {
  await enableMocking()

  __serverStartDatabaseMigration()

  try {
    await store.dispatch('auth/initAuth')
  } catch {
    // Игнорируем ошибки, так как мок сервер
  }

  const app = new Vue({
    router,
    store,
    render: (h) => h(App)
  })

  app.$mount('#app')
}

export { bootstrap }
