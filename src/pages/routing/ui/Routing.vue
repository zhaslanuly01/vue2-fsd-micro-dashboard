<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script lang="ts">
import Vue from 'vue'
import { DefaultLayout } from '@/app/layouts/default-layout'
import { EmptyLayout } from '@/app/layouts/empty-layout'

export default Vue.extend({
  name: 'App',

  computed: {
    layoutComponent() {
      const layout = this.$route.meta?.layout || 'default'

      if (layout === 'empty') {
        return EmptyLayout
      }

      return DefaultLayout
    }
  }
})
</script>
