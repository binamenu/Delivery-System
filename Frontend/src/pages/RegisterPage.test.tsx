import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from './RegisterPage'

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    register: vi.fn(),
    isLoading: false,
    isAuthenticated: false,
  })),
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders registration form', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('renders sign in link', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
    expect(screen.getByText('Sign in')).toHaveAttribute('href', '/login')
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
  })

  it('validates phone format', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/username/i), 'johndoe')
    await user.type(screen.getByLabelText(/phone/i), 'invalid')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')

    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(
      await screen.findByText('Phone number must start with 09 and have 10 digits')
    ).toBeInTheDocument()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/email/i), 'not-an-email')

    const form = screen.getByRole('button', { name: /create account/i }).closest('form')!
    fireEvent.submit(form)

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument()
  })

  it('validates password minimum length', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/^password$/i), 'short')
    await user.tab()

    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument()
  })

  it('validates password confirmation', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'different')
    await user.tab()

    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockRegister = vi.fn().mockResolvedValue(undefined)

    const { useAuthStore } = await import('@/stores/auth')
    vi.mocked(useAuthStore).mockReturnValue({
      register: mockRegister,
      isLoading: false,
      isAuthenticated: false,
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      getProfile: vi.fn(),
      setToken: vi.fn(),
    })

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/username/i), 'johndoe')
    await user.type(screen.getByLabelText(/phone/i), '0912345678')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(mockRegister).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      phone: '0912345678',
      password: 'password123',
      password_confirmation: 'password123',
    })
  })
})
