<template>
  <el-aside
    class="app-sidebar"
    :class="{
      'app-sidebar--mobile': isMobile,
      'app-sidebar--mobile-open': isMobile && isMobileOpen
    }"
    width="240px"
  >
    <div class="app-sidebar__logo">
      <span class="app-sidebar__logo-text">Micro Dashboard</span>

      <button
        v-if="isMobile"
        type="button"
        class="app-sidebar__close"
        aria-label="Закрыть меню"
        @click="handleCloseMobile"
      >
        ×
      </button>
    </div>

    <el-menu
      class="app-sidebar__menu"
      :default-active="$route.path"
      active-text-color="var(--blue-blue-9)"
      router
    >
      <el-menu-item
        v-for="item in sidebarConfig"
        :key="item.key"
        :index="item.path"
        class="app-sidebar__menu-item"
        @click="handleMenuItemClick"
      >
        <i v-if="item.icon" :class="item.icon" class="app-sidebar__icon" />

        <img
          v-else-if="item.svgIcon"
          :src="item.svgIcon"
          :alt="item.label"
          class="app-sidebar__svg-icon"
        />

        <span class="body-regular app-sidebar__label">
          {{ item.label }}
        </span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script setup lang="ts">
import { sidebarConfig } from '../lib/sidebar.config.constants'

const props = defineProps<{
  isMobileOpen?: boolean
  isMobile?: boolean
}>()

const emit = defineEmits<{
  (e: 'close-mobile'): void
}>()

const handleCloseMobile = () => {
  emit('close-mobile')
}

const handleMenuItemClick = () => {
  if (props.isMobile) {
    emit('close-mobile')
  }
}
</script>

<style scoped>
.app-sidebar {
  background-color: var(--color-white);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--neutral-gray-5);
  min-height: 100vh;
  width: 240px !important;
}

.app-sidebar__logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  color: var(--label-primary);
  flex-shrink: 0;
}

.app-sidebar__logo-text {
  font-weight: 600;
  font-size: 18px;
}

.app-sidebar__close {
  border: none;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.app-sidebar__menu {
  border-right: none;
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
}

.app-sidebar__menu :deep(.el-menu-item.is-active .app-sidebar__label) {
  font-weight: 600;
}

.app-sidebar__menu :deep(.el-menu-item.is-active) {
  background-color: var(--fill-secondary);
}

.app-sidebar__icon {
  font-size: 20px;
  color: inherit;
}

.app-sidebar__svg-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  stroke: var(--blue-blue-9);
  flex-shrink: 0;
}

.app-sidebar__menu :deep(.el-menu-item) {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  border-radius: 12px;
  padding: 0 16px !important;
  min-width: 0;
  height: 48px;
  line-height: 48px;
}

.app-sidebar__label {
  color: inherit;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-sidebar--mobile {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1100;
  transform: translateX(-100%);
  transition: transform 0.25s ease;
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.15);
  border-right: none;
}

.app-sidebar--mobile-open {
  transform: translateX(0);
}

@media (max-width: 991px) {
  .app-sidebar__menu {
    padding: 16px;
  }
}

@media (max-width: 575px) {
  .app-sidebar {
    width: min(280px, 88vw) !important;
  }

  .app-sidebar__logo {
    padding: 0 16px;
  }

  .app-sidebar__menu :deep(.el-menu-item) {
    padding: 0 12px !important;
  }
}
</style>
