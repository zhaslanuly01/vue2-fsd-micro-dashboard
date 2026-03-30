<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-position="top"
    @submit.native.prevent="handleSubmit"
  >
    <el-form-item label="Электронная почта" prop="email">
      <el-input
        v-model="form.email"
        placeholder="Введите электронную почту"
        autocomplete="username"
      />
    </el-form-item>

    <el-form-item label="Пароль" prop="password">
      <el-input
        v-model="form.password"
        type="password"
        placeholder="Введите пароль"
        autocomplete="current-password"
        show-password
      />
    </el-form-item>

    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="error"
      :closable="false"
      class="auth-form__error"
    />

    <el-button type="primary" native-type="submit" :loading="isLoading" class="auth-form__submit">
      Войти
    </el-button>

    <div class="auth-form__hint">
      <div>Тестовый email: <b>admin@email.com</b></div>
      <div>Тестовый пароль: <b>123456</b></div>
    </div>
  </el-form>
</template>

<script lang="ts">
import Vue from 'vue'
import type { LoginForm } from '../models/auth.types'

type FormRef = {
  validate: (cb: (valid: boolean) => void) => void
}

export default Vue.extend({
  name: 'AuthByEmailForm',

  data() {
    return {
      form: {
        email: 'admin@email.com',
        password: 'adminadmin'
      } as LoginForm,
      errorMessage: '',
      rules: {
        email: [
          { required: true, message: 'Введите электронную почту', trigger: 'blur' },
          { type: 'email', message: 'Некорректный email', trigger: ['blur', 'change'] }
        ],
        password: [
          { required: true, message: 'Введите пароль', trigger: 'blur' },
          { min: 6, message: 'Минимум 6 символов', trigger: 'blur' }
        ]
      }
    }
  },

  computed: {
    isLoading(): boolean {
      return this.$store.getters['auth/isLoading']
    }
  },

  methods: {
    handleSubmit() {
      const formRef = this.$refs.formRef as FormRef | undefined

      if (!formRef) return

      formRef.validate(async (valid: boolean) => {
        if (!valid) return

        this.errorMessage = ''

        try {
          await this.$store.dispatch('auth/login', {
            email: this.form.email,
            password: this.form.password
          })

          const redirectPath =
            typeof this.$route.query.redirect === 'string' ? this.$route.query.redirect : '/'

          await this.$router.push(redirectPath)
        } catch (error) {
          if (
            error &&
            typeof error === 'object' &&
            'response' in error &&
            error.response &&
            typeof error.response === 'object' &&
            'data' in error.response &&
            error.response.data &&
            typeof error.response.data === 'object' &&
            'message' in error.response.data
          ) {
            this.errorMessage = String(error.response.data.message)
            return
          }

          this.errorMessage = 'Ошибка входа'
        }
      })
    }
  }
})
</script>

<style scoped>
.auth-form__error {
  margin-bottom: 16px;
}

.auth-form__submit {
  width: 100%;
}

.auth-form__hint {
  margin-top: 20px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  color: #606266;
  font-size: 13px;
}
</style>
