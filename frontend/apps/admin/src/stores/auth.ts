import { defineStore } from 'pinia'
import type { AdminUser } from '@blog/shared-types'
import { apiGet, apiPost } from '../services/api'

const STORAGE_KEY = 'blog-admin-session'

interface LoginPayload {
  username: string
  password: string
}

interface AuthState {
  token: string
  refreshToken: string
  user: AdminUser | null
  hydrated: boolean
}

interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    username: string
    displayName?: string | null
    email?: string | null
  }
}

const mapAdminUser = (user: LoginResponse['user']): AdminUser => ({
  id: user.id,
  name: user.displayName?.trim() || user.username,
  role: 'Admin',
  email: user.email ?? '',
})

export const useAuthStore = defineStore('admin-auth', {
  state: (): AuthState => ({
    token: '',
    refreshToken: '',
    user: null,
    hydrated: false,
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
  },
  actions: {
    restoreSession() {
      if (this.hydrated || typeof window === 'undefined') {
        return
      }

      const cached = window.localStorage.getItem(STORAGE_KEY)
      if (cached) {
        const payload = JSON.parse(cached) as {
          token: string
          refreshToken: string
          user: AdminUser
        }
        this.token = payload.token
        this.refreshToken = payload.refreshToken
        this.user = payload.user
      }

      this.hydrated = true
    },
    persistSession() {
      if (typeof window === 'undefined' || !this.user) {
        return
      }

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          token: this.token,
          refreshToken: this.refreshToken,
          user: this.user,
        }),
      )
    },
    async login(payload: LoginPayload) {
      const result = await apiPost<LoginResponse>('/admin/auth/login', {
        username: payload.username.trim(),
        password: payload.password.trim(),
      })

      this.token = result.accessToken
      this.refreshToken = result.refreshToken
      this.user = mapAdminUser(result.user)
      this.persistSession()
    },
    async refreshSession() {
      if (!this.refreshToken) {
        return false
      }

      const result = await apiPost<LoginResponse>('/admin/auth/refresh', {
        refreshToken: this.refreshToken,
      })

      this.token = result.accessToken
      this.refreshToken = result.refreshToken
      this.user = mapAdminUser(result.user)
      this.persistSession()

      return true
    },
    async fetchProfile() {
      if (!this.token) {
        return null
      }

      const user = await apiGet<LoginResponse['user']>('/admin/auth/profile', {
        token: this.token,
      })

      this.user = mapAdminUser(user)
      this.persistSession()

      return this.user
    },
    logout() {
      this.token = ''
      this.refreshToken = ''
      this.user = null

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    },
  },
})
