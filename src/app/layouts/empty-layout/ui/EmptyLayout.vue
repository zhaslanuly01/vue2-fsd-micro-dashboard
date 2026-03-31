<template>
  <div class="empty-layout">
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'EmptyLayout'
})
</script>

<style scoped>
.empty-layout {
  min-height: 100vh;
}
</style>
