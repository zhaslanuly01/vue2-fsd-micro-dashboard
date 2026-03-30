import type { Module } from 'vuex'
import { getProfile, type User } from '@/entities/user'
import { loginByEmail, logout as logoutRequest } from '@/features/auth-by-email'

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  isLoading: boolean
}

const STORAGE_KEY = 'mock_auth'
const TOKEN_KEY = 'access_token'

const getInitialState = (): AuthState => {
  const raw = localStorage.getItem(STORAGE_KEY)
  const token = localStorage.getItem(TOKEN_KEY)

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as AuthState

      return {
        ...parsed,
        token: token || parsed.token || null,
        isAuthenticated: Boolean(token || parsed.token)
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return {
    isAuthenticated: Boolean(token),
    user: null,
    token: token || null,
    isLoading: false
  }
}
const persistState = (state: AuthState) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      token: state.token,
      isLoading: false
    })
  )
}

export const auth: Module<AuthState, any> = {
  namespaced: true,

  state: getInitialState(),

  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
    user: (state) => state.user,
    token: (state) => state.token,
    isLoading: (state) => state.isLoading
  },

  mutations: {
    SET_LOADING(state, payload: boolean) {
      state.isLoading = payload
    },

    SET_TOKEN(state, token: string | null) {
      state.token = token
      state.isAuthenticated = Boolean(token)

      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
      } else {
        localStorage.removeItem(TOKEN_KEY)
      }

      persistState(state)
    },

    SET_USER(state, user: User | null) {
      state.user = user
      state.isAuthenticated = Boolean(state.token && user)
      persistState(state)
    },

    SET_AUTH(state, payload: { user: User; token: string }) {
      state.token = payload.token
      state.user = payload.user
      state.isAuthenticated = true
      persistState(state)
    },

    LOGOUT(state) {
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.isLoading = false

      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(TOKEN_KEY)
    }
  },

  actions: {
    async login({ commit }, payload: { email: string; password: string }): Promise<void> {
      commit('SET_LOADING', true)

      try {
        const { data } = await loginByEmail(payload)

        commit('SET_TOKEN', data.accessToken)

        const profileResponse = await getProfile()

        commit('SET_USER', profileResponse.data)
      } catch (error) {
        commit('LOGOUT')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchProfile({ commit, state }): Promise<User | null> {
      if (!state.token) {
        commit('SET_USER', null)
        return null
      }

      commit('SET_LOADING', true)

      try {
        const { data } = await getProfile()
        commit('SET_USER', data)
        return data
      } catch (error) {
        commit('LOGOUT')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async initAuth({ dispatch, state, commit }): Promise<void> {
      if (!state.token) {
        commit('LOGOUT')
        return
      }

      try {
        await dispatch('fetchProfile')
      } catch {
        commit('LOGOUT')
      }
    },

    async logout({ commit }): Promise<void> {
      try {
        await logoutRequest()
      } catch {
        // Игнорируем, так как это мок сервер
      } finally {
        commit('LOGOUT')
      }
    }
  }
}
