<template>
  <el-aside class="app-sidebar" width="240px">
    <div class="app-sidebar__logo"></div>

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
import { sidebarConfig } from '../lib/sidebar_config.constants'
</script>

<style scoped>
.app-sidebar {
  background-color: var(--color-white);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--neutral-gray-5);
  min-height: 100vh;
}

.app-sidebar__logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  color: var(--label-primary);
}

.app-sidebar__menu {
  border-right: none;
  flex: 1;
  padding: 24px;
}

.app-sidebar__menu :deep(.el-menu-item) {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  border-radius: 12px;
  padding: 0 16px !important;
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

.app-sidebar__label {
  color: inherit;
}
</style>
