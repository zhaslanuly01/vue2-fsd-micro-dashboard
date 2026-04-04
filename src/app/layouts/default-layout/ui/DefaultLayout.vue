<template>
  <el-container class="app-layout" :class="{ 'app-layout--mobile': isMobile }">
    <div
      v-if="isMobile && isMobileSidebarOpen"
      class="app-layout__overlay"
      @click="closeMobileSidebar"
    />

    <Sidebar
      class="app-layout__sidebar"
      :is-mobile="isMobile"
      :is-mobile-open="isMobileSidebarOpen"
      @close-mobile="closeMobileSidebar"
    />

    <el-container direction="vertical" class="app-layout__content">
      <Header
        class="app-layout__header"
        :is-mobile="isMobile"
        @toggle-sidebar="toggleMobileSidebar"
      />

      <el-main ref="mainContent" class="app-layout__main">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import Vue from 'vue'
import { getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Header } from '@/widgets/header'
import { Sidebar } from '@/widgets/sidebar'

const isMobileSidebarOpen = ref(false)
const isMobile = ref(false)
const mainContent = ref<HTMLElement | Vue | null>(null)

let mediaQuery: MediaQueryList | null = null

const instance = getCurrentInstance()

const updateIsMobile = () => {
  isMobile.value = mediaQuery ? mediaQuery.matches : window.innerWidth <= 991
}

const toggleMobileSidebar = () => {
  if (!isMobile.value) return
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}

const getMainElement = (): HTMLElement | null => {
  if (!mainContent.value) return null

  if (mainContent.value instanceof HTMLElement) {
    return mainContent.value
  }

  return mainContent.value.$el as HTMLElement | null
}

const scrollToTop = async () => {
  await nextTick()

  const element = getMainElement()

  if (!element) return

  element.scrollTo({
    top: 0,
    behavior: 'auto'
  })
}

watch(
  () => instance?.proxy?.$route.fullPath,
  async () => {
    closeMobileSidebar()
    await scrollToTop()
  }
)

watch(isMobile, (mobile) => {
  if (!mobile) {
    isMobileSidebarOpen.value = false
  }
})

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 991px)')
  updateIsMobile()

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', updateIsMobile)
  } else {
    mediaQuery.addListener(updateIsMobile)
  }
})

onBeforeUnmount(() => {
  if (!mediaQuery) return

  if (mediaQuery.removeEventListener) {
    mediaQuery.removeEventListener('change', updateIsMobile)
  } else {
    mediaQuery.removeListener(updateIsMobile)
  }
})
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

.app-layout--mobile {
  display: block;
  height: 100dvh;
  min-height: 100dvh;
}

.app-layout--mobile .app-layout__content {
  width: 100%;
  height: 100dvh;
}

.app-layout--mobile .app-layout__main {
  padding: 16px;
}

@media (max-width: 575px) {
  .app-layout--mobile .app-layout__main {
    padding: 12px;
  }
}
</style>
