import api from '@/lib/api'
import { unwrapUser } from '@/lib/http'
import type {
  AdminUser,
  RegisterDriverInput,
  RegisterManagerInput,
  UserRole,
  UserStatus,
} from '@/types/Users'

interface UserApiRecord {
  id: number
  name: string
  email?: string
  phone?: string
  role?: UserRole
  status?: UserStatus
  created_at?: string
}

const REGISTERED_USERS_KEY = 'admin-registered-users'

function readRegisteredUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY)
    return raw ? (JSON.parse(raw) as AdminUser[]) : []
  } catch {
    return []
  }
}

function writeRegisteredUsers(users: AdminUser[]) {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users))
}

export function cacheRegisteredUser(user: AdminUser) {
  const current = readRegisteredUsers().filter((item) => item.id !== user.id)
  writeRegisteredUsers([user, ...current])
}

export function mapUser(record: UserApiRecord): AdminUser {
  return {
    id: record.id,
    name: record.name,
    email: record.email ?? '',
    phone: record.phone ?? '',
    role: record.role ?? 'customer',
    status: record.status ?? 'active',
    createdAt: record.created_at ?? new Date().toISOString(),
  }
}

export function toLocalPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (/^09\d{8}$/.test(digits)) return digits
  if (/^9\d{8}$/.test(digits)) return `0${digits}`
  if (/^2519\d{8}$/.test(digits)) return `0${digits.slice(3)}`
  return digits
}

function usernameFromEmail(email: string): string {
  const base = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')

  return `${base || 'user'}_${Date.now().toString(36)}`
}

function generatePassword(): string {
  return `Td${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}A1`
}

function mergeUsers(users: AdminUser[]): AdminUser[] {
  const byId = new Map<number, AdminUser>()
  for (const user of users) {
    const existing = byId.get(user.id)
    byId.set(user.id, existing ? { ...existing, ...user } : user)
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

async function registerAccount(input: {
  name: string
  email: string
  phone: string
}): Promise<AdminUser> {
  const phone = toLocalPhone(input.phone)
  if (!/^09\d{8}$/.test(phone)) {
    throw new Error('Phone must be an Ethiopian number in 09xxxxxxxx format.')
  }

  const password = generatePassword()
  const response = await api.post('/register', {
    name: input.name.trim(),
    email: input.email.trim(),
    username: usernameFromEmail(input.email),
    phone,
    password,
    password_confirmation: password,
  })

  const record = unwrapUser<UserApiRecord>(response.data)
  if (!record) {
    throw new Error('Register response was missing a user.')
  }

  const user = mapUser(record)
  cacheRegisteredUser(user)
  return user
}

export async function fetchUsers(): Promise<AdminUser[]> {
  const collected: AdminUser[] = [...readRegisteredUsers()]

  try {
    const profileResponse = await api.get('/profile')
    const profile = unwrapUser<UserApiRecord>(profileResponse.data)
    if (profile) collected.push(mapUser(profile))
  } catch {
    // Profile can fail without blocking locally registered users.
  }

  return mergeUsers(collected)
}

export async function createDriver(input: RegisterDriverInput): Promise<AdminUser> {
  const user = await registerAccount(input)
  const withVehicle = {
    ...user,
    vehicleType: input.vehicleType,
    vehicleModel: input.vehicleModel,
    plateNumber: input.plateNumber,
  }
  cacheRegisteredUser(withVehicle)
  return withVehicle
}

export async function createRestaurantManager(input: RegisterManagerInput): Promise<AdminUser> {
  return registerAccount(input)
}
