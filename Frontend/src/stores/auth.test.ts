import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from './auth'

// Mock localStorage and sessionStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

// Mock the API
vi.mock('@/lib/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

import api from '@/lib/api'

describe('Auth Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    sessionStorageMock.getItem.mockReturnValue(null)
    // Reset store state
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    })
  })

  it('has initial state', () => {
    const { result } = renderHook(() => useAuthStore())

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('sets token in localStorage when remember is true', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.setToken('test-token', true)
    })

    expect(result.current.token).toBe('test-token')
    expect(result.current.isAuthenticated).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token')
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('token')
  })

  it('sets token in sessionStorage when remember is false', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.setToken('test-token', false)
    })

    expect(result.current.token).toBe('test-token')
    expect(result.current.isAuthenticated).toBe(true)
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
  })

  it('Scenario A: logs in with remember_me = true -> token only in localStorage', async () => {
    const mockUser = { id: 1, name: 'John', email: 'john@example.com', username: 'john', email_verified_at: null, phone: '0912345678', role: 'customer' as const, status: 'active', created_at: '2026-01-01', updated_at: '2026-01-01' }
    vi.mocked(api.post).mockResolvedValue({
      data: {
        user: mockUser,
        access_token: 'token-scenario-a',
      },
    })

    const { result } = renderHook(() => useAuthStore())
    await act(async () => {
      await result.current.login({ login: 'john@example.com', password: 'password', remember_me: true })
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'token-scenario-a')
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('token')
  })

  it('Scenario B: logs in with remember_me = false -> token only in sessionStorage', async () => {
    const mockUser = { id: 1, name: 'John', email: 'john@example.com', username: 'john', email_verified_at: null, phone: '0912345678', role: 'customer' as const, status: 'active', created_at: '2026-01-01', updated_at: '2026-01-01' }
    vi.mocked(api.post).mockResolvedValue({
      data: {
        user: mockUser,
        access_token: 'token-scenario-b',
      },
    })

    const { result } = renderHook(() => useAuthStore())
    await act(async () => {
      await result.current.login({ login: 'john@example.com', password: 'password', remember_me: false })
    })

    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('token', 'token-scenario-b')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
  })

  it('Scenario C: old localStorage token exists, login with remember_me = false -> old localStorage token removed', async () => {
    const mockUser = { id: 1, name: 'John', email: 'john@example.com', username: 'john', email_verified_at: null, phone: '0912345678', role: 'customer' as const, status: 'active', created_at: '2026-01-01', updated_at: '2026-01-01' }
    vi.mocked(api.post).mockResolvedValue({
      data: {
        user: mockUser,
        access_token: 'token-scenario-c',
      },
    })

    localStorageMock.getItem.mockReturnValue('old-local-token')

    const { result } = renderHook(() => useAuthStore())
    await act(async () => {
      await result.current.login({ login: 'john@example.com', password: 'password', remember_me: false })
    })

    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('token', 'token-scenario-c')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
  })

  it('Scenario D: old sessionStorage token exists, login with remember_me = true -> old sessionStorage token removed', async () => {
    const mockUser = { id: 1, name: 'John', email: 'john@example.com', username: 'john', email_verified_at: null, phone: '0912345678', role: 'customer' as const, status: 'active', created_at: '2026-01-01', updated_at: '2026-01-01' }
    vi.mocked(api.post).mockResolvedValue({
      data: {
        user: mockUser,
        access_token: 'token-scenario-d',
      },
    })

    sessionStorageMock.getItem.mockReturnValue('old-session-token')

    const { result } = renderHook(() => useAuthStore())
    await act(async () => {
      await result.current.login({ login: 'john@example.com', password: 'password', remember_me: true })
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'token-scenario-d')
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('token')
  })

  it('registers user and stores token in sessionStorage by default', async () => {
    const mockUser = { id: 2, name: 'Jane', email: 'jane@example.com', username: 'jane', email_verified_at: null, phone: '0912345678', role: 'customer' as const, status: 'active', created_at: '2026-01-01', updated_at: '2026-01-01' }
    vi.mocked(api.post).mockResolvedValue({
      data: {
        user: mockUser,
        access_token: 'token-reg-123',
      },
    })

    const { result } = renderHook(() => useAuthStore())

    await act(async () => {
      await result.current.register({
        name: 'Jane',
        email: 'jane@example.com',
        username: 'jane',
        phone: '0912345678',
        password: 'password123',
        password_confirmation: 'password123',
      })
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('token', 'token-reg-123')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
  })



  it('logs out user and removes tokens from both storages', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'Logged out' } })

    const { result } = renderHook(() => useAuthStore())

    // First set authenticated state
    act(() => {
      useAuthStore.setState({
        user: { id: 1, name: 'John', email: 'john@example.com', username: 'john', email_verified_at: null, phone: '0912345678', role: 'customer', status: 'active', created_at: '2026-01-01', updated_at: '2026-01-01' },
        token: 'token-123',
        isAuthenticated: true,
      })
    })

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('token')
  })

  it('fetches user profile', async () => {
    const mockUser = { id: 1, name: 'John', email: 'john@example.com', username: 'john', email_verified_at: null, phone: '0912345678', role: 'customer' as const, status: 'active', created_at: '2026-01-01', updated_at: '2026-01-01' }
    vi.mocked(api.get).mockResolvedValue({ data: { data: mockUser } })

    const { result } = renderHook(() => useAuthStore())

    await act(async () => {
      await result.current.getProfile()
    })

    expect(result.current.user).toEqual(mockUser)
  })

  it('handles login error', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('Invalid credentials'))

    const { result } = renderHook(() => useAuthStore())

    await expect(
      act(async () => {
        await result.current.login({ login: 'wrong@example.com', password: 'wrong' })
      })
    ).rejects.toThrow('Invalid credentials')

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
})
