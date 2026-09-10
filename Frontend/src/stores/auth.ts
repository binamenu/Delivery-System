import { create } from 'zustand'
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types'
import api from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  getProfile: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (data: any) => Promise<void>
  setToken: (token: string, remember?: boolean) => void
}

const getStoredToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: getStoredToken(),
  isLoading: false,
  isAuthenticated: !!getStoredToken(),

  login: async (data: LoginRequest) => {
    set({ isLoading: true })
    try {
      const response = await api.post<AuthResponse>('/login', data)
      const { user, access_token } = response.data
      if (data.remember_me) {
        localStorage.setItem('token', access_token)
        sessionStorage.removeItem('token')
      } else {
        sessionStorage.setItem('token', access_token)
        localStorage.removeItem('token')
      }
      set({ user, token: access_token, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true })
    try {
      const response = await api.post<AuthResponse>('/register', data)
      const { user, access_token } = response.data
      if (data.remember_me) {
        localStorage.setItem('token', access_token)
        sessionStorage.removeItem('token')
      } else {
        sessionStorage.setItem('token', access_token)
        localStorage.removeItem('token')
      }
      set({ user, token: access_token, isAuthenticated: true, isLoading: false })
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
      set({ user: null, token: null, isAuthenticated: false })
    }
  },

  getProfile: async () => {
    set({ isLoading: true })
    try {
      const response = await api.get<{ data: User }>('/profile')
      set({ user: response.data.data, isLoading: false })
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

  resetPassword: async (data: any) => {
    set({ isLoading: true })
    try {
      await api.post('/reset-password', data)
      set({ isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  setToken: (token: string, remember: boolean = true) => {
    if (remember) {
      localStorage.setItem('token', token)
      sessionStorage.removeItem('token')
    } else {
      sessionStorage.setItem('token', token)
      localStorage.removeItem('token')
    }
    set({ token, isAuthenticated: true })
  },
}))
