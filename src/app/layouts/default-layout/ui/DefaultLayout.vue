<template>
  <el-container class="app-layout">
    <Sidebar class="app-layout__sidebar" />

    <el-container direction="vertical" class="app-layout__content">
      <Header class="app-layout__header" />

      <el-main class="app-layout__main">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { Header } from '@/widgets/header'
import { Sidebar } from '@/widgets/sidebar'
</script>

<style scoped>
.app-layout {
  height: 100vh;
  overflow: hidden;
  background: #f5f7fa;
}

.app-layout__sidebar {
  height: 100vh;
  flex-shrink: 0;
  overflow: hidden;
}

.app-layout__content {
  height: 100vh;
  min-width: 0;
  overflow: hidden;
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
</style>
