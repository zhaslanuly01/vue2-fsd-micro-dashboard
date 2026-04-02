import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Vue from 'vue'

import { __serverStartDatabaseMigration } from '@/shared/lib/server'
import '@/shared/styles/global.css'
import '@/shared/styles/reset.css'
import locale from 'element-ui'
import App from './App.vue'
import { router, store } from './providers'
import { config } from '@/shared/lib'

Vue.use(ElementUI, { locale })

async function enableMocking() {
  if (!config.ENABLE_MSW) {
    return
  }

  const { worker } = await import('./providers/mock/browser')

  await worker.start({
    serviceWorker: {
      url: import.meta.env.BASE_URL + 'mockServiceWorker.js'
    },
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
