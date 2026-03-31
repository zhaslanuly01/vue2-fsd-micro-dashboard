<template>
  <el-header class="app-header">
    <el-dropdown trigger="click" @command="handleCommand">
      <span class="app-header__user-card">
        <img src="@/shared/assets/icons/users.svg" alt="User" class="app-header__user-icon" />

        <span class="body-regular">
          {{ displayName }}
        </span>
      </span>

      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="profile">Профиль</el-dropdown-item>
        <el-dropdown-item command="logout" divided>Выйти</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </el-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { store } from '@/app/providers/store'
import { getUserFullName, type User } from '@/entities/user'

const user = computed(() => store.getters['auth/user'] as User | null)

const displayName = computed(() => {
  if (!user.value) return 'Admin'
  return getUserFullName(user.value) || user.value.email
})

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    await store.dispatch('auth/logout')
    window.location.href = '/login'
  }

  if (command === 'profile') {
    window.location.href = '/profile'
  }
}
</script>

<style scoped>
.app-header {
  height: auto !important;
  min-height: unset;
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid var(--neutral-gray-5);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  box-sizing: border-box;
}

.app-header__user-card {
  padding: 12px;
  background: var(--fill-secondary);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-sizing: border-box;
}

.app-header__user-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  flex-shrink: 0;
}
</style>
