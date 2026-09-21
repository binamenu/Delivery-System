import { create } from 'zustand'
import type { User, LoginRequest, RegisterRequest } from '@/types'
import api from '@/lib/api'
import { extractAuthPayload, unwrapUser } from '@/lib/http'

interface ResetPasswordData {
  token: string
  email: string
  password: string
  password_confirmation: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (data: ResetPasswordData) => Promise<void>
  logout: () => Promise<void>
  getProfile: () => Promise<void>
  setToken: (token: string, remember?: boolean) => void
}

function applyAuth(
  payload: unknown,
  set: (state: Partial<AuthState>) => void,
  remember = false,
) {
  const { user, access_token } = extractAuthPayload(payload)
  const resolvedUser = unwrapUser<User>(user) ?? unwrapUser<User>(payload)

  if (!resolvedUser) {
    throw new Error('Authentication response was missing a user.')
  }

  if (remember) {
    localStorage.setItem('token', access_token)
    sessionStorage.removeItem('token')
  } else {
    sessionStorage.setItem('token', access_token)
    localStorage.removeItem('token')
  }

  set({
    user: resolvedUser,
    token: access_token,
    isAuthenticated: true,
    isLoading: false,
  })
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token') || sessionStorage.getItem('token'),
  isLoading: false,
  isAuthenticated: !!(
    localStorage.getItem('token') || sessionStorage.getItem('token')
  ),

  login: async (data: LoginRequest) => {
    set({ isLoading: true })

    try {
      const response = await api.post('/login', data)
      applyAuth(response.data, set, data.remember_me ?? false)
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true })

    try {
      const response = await api.post('/register', data)
      applyAuth(response.data, set, false)
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true })

    try {
      await api.post('/forgot-password', { email })
      set({ isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  resetPassword: async (data: ResetPasswordData) => {
    set({ isLoading: true })

    try {
      await api.post('/reset-password', data)
      set({ isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: async () => {
    try {
      await api.post('/logout')
    } finally {
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')

      set({
        user: null,
        token: null,
        isAuthenticated: false,
      })
    }
  },

  getProfile: async () => {
    set({ isLoading: true })

    try {
      const response = await api.get('/profile')
      const user = unwrapUser<User>(response.data)

      if (!user) {
        throw new Error('Profile response was missing a user.')
      }

      set({
        user,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  setToken: (token: string, remember = false) => {
    if (remember) {
      localStorage.setItem('token', token)
      sessionStorage.removeItem('token')
    } else {
      sessionStorage.setItem('token', token)
      localStorage.removeItem('token')
    }

    set({
      token,
      isAuthenticated: true,
    })
  },
}))