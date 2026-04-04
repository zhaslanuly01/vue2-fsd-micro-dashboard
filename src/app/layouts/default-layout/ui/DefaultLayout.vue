<template>
  <el-container class="app-layout">
    <div v-if="isMobileSidebarOpen" class="app-layout__overlay" @click="closeMobileSidebar" />

    <Sidebar
      class="app-layout__sidebar"
      :is-mobile-open="isMobileSidebarOpen"
      @close-mobile="closeMobileSidebar"
    />

    <el-container direction="vertical" class="app-layout__content">
      <Header class="app-layout__header" @toggle-sidebar="toggleMobileSidebar" />

      <el-main class="app-layout__main">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Header } from '@/widgets/header'
import { Sidebar } from '@/widgets/sidebar'

const isMobileSidebarOpen = ref(false)

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}
</script>

<style scoped>
.app-layout {
  position: relative;
  min-height: 100vh;
  height: 100vh;
  overflow: hidden;
  background: #f5f7fa;
}

.app-layout__content {
  height: 100vh;
  min-width: 0;
  overflow: hidden;
  flex: 1;
}

.app-layout__sidebar {
  height: 100vh;
  flex-shrink: 0;
  overflow: hidden;
  z-index: 1100;
}

.app-layout__header {
  flex-shrink: 0;
  overflow: hidden;
}

.app-layout__main {
  flex: 1;
  min-height: 0;
  padding: 20px;
  background: #f5f7fa;
  overflow-y: auto;
  overflow-x: hidden;
}

.app-layout__overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.45);
  z-index: 1090;
}

@media (max-width: 991px) {
  .app-layout {
    display: block;
    height: 100dvh;
    min-height: 100dvh;
  }

  .app-layout__content {
    width: 100%;
    height: 100dvh;
  }

  .app-layout__main {
    padding: 16px;
  }
}

@media (max-width: 575px) {
  .app-layout__main {
    padding: 12px;
  }
}
</style>
