import { create } from 'zustand'
import type { User, LoginRequest, RegisterRequest } from '@/types'
import api from '@/lib/api'
import { extractAuthPayload, unwrapUser } from '@/lib/http'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  getProfile: () => Promise<void>
  setToken: (token: string) => void
}

function applyAuth(payload: unknown, set: (state: Partial<AuthState>) => void) {
  const { user, access_token } = extractAuthPayload(payload)
  const resolvedUser = unwrapUser<User>(user) ?? unwrapUser<User>(payload)
  if (!resolvedUser) {
    throw new Error('Authentication response was missing a user.')
  }
  localStorage.setItem('token', access_token)
  set({
    user: resolvedUser,
    token: access_token,
    isAuthenticated: true,
    isLoading: false,
  })
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (data: LoginRequest) => {
    set({ isLoading: true })
    try {
      const response = await api.post('/login', data)
      applyAuth(response.data, set)
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true })
    try {
      const response = await api.post('/register', data)
      applyAuth(response.data, set)
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
      set({ user: null, token: null, isAuthenticated: false })
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
      set({ user, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  setToken: (token: string) => {
    localStorage.setItem('token', token)
    set({ token, isAuthenticated: true })
  },
}))
