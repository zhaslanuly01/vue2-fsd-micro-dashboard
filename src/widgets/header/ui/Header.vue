<template>
  <el-header class="app-header">
    <div class="app-header__left">
      <button
        v-if="isMobile"
        type="button"
        class="app-header__burger"
        aria-label="Открыть меню"
        @click="handleToggleSidebar"
      >
        <span />
        <span />
        <span />
      </button>
    </div>

    <el-dropdown trigger="click" @command="handleCommand">
      <span class="app-header__user-card">
        <img src="@/shared/assets/icons/users.svg" alt="User" class="app-header__user-icon" />

        <span class="body-regular app-header__user-name">
          {{ displayName }}
        </span>
      </span>

      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="logout" divided>Выйти</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </el-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { store } from '@/app/providers/store'
import { getUserFullName, type User } from '@/entities/user'
import { router } from '@/app/providers/router/router'

defineProps<{
  isMobile?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

const user = computed(() => store.getters['auth/user'] as User | null)

const displayName = computed(() => {
  if (!user.value) return 'Admin'
  return getUserFullName(user.value) || user.value.email
})

const handleToggleSidebar = () => {
  emit('toggle-sidebar')
}

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    await store.dispatch('auth/logout')
    router.push('/login')
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
  justify-content: space-between;
  box-sizing: border-box;
  gap: 16px;
}

.app-header__left {
  display: flex;
  align-items: center;
}

.app-header__burger {
  width: 40px;
  height: 40px;
  border: 1px solid var(--neutral-gray-5);
  background: #fff;
  border-radius: 10px;
  padding: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
}

.app-header__burger span {
  display: block;
  width: 18px;
  height: 2px;
  background: #303133;
  border-radius: 999px;
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
  max-width: 100%;
}

.app-header__user-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  flex-shrink: 0;
}

.app-header__user-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 991px) {
  .app-header {
    padding: 12px 16px;
  }
}

@media (max-width: 575px) {
  .app-header {
    padding: 10px 12px;
  }

  .app-header__user-card {
    padding: 10px;
  }

  .app-header__user-name {
    max-width: 120px;
  }
}
</style>
