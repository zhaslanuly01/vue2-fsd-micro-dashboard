<template>
  <div class="login-page">
    <el-card class="login-card" shadow="hover">
      <div class="login-card__header">
        <h1 class="login-card__title">Авторизация</h1>
        <p class="login-card__subtitle">Авторизуйтесь чтобы продолжить</p>
      </div>

      <AuthByEmailForm />
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { AuthByEmailForm } from '@/features/auth-by-email'

export default Vue.extend({
  name: 'LoginPage',
  components: {
    AuthByEmailForm
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f5f7fa;
}

.login-card {
  width: 100%;
  max-width: 420px;
}

.login-card__header {
  margin-bottom: 24px;
  text-align: center;
}

.login-card__title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
}

.login-card__subtitle {
  margin: 0;
  color: #909399;
}
</style>
