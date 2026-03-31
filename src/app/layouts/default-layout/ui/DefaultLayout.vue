<template>
  <el-container class="app-layout">
    <Sidebar />

    <el-container direction="vertical">
      <Header />

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
  min-height: 100vh;
  background: #f5f7fa;
}

.app-layout__main {
  padding: 20px;
  background: #f5f7fa;
  overflow: auto;
}
</style>
