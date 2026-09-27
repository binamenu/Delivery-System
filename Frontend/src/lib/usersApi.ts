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

interface AdminCreateUserResponse {
  user?: UserApiRecord
  temporary_password?: string
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

function mergeUsers(users: AdminUser[]): AdminUser[] {
  const byId = new Map<number, AdminUser>()

  for (const user of users) {
    const existing = byId.get(user.id)
    byId.set(user.id, existing ? { ...existing, ...user } : user)
  }

  return Array.from(byId.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime(),
  )
}

async function createAdminUser(
  endpoint: string,
  payload: Record<string, string>,
): Promise<AdminUser> {
  const response = await api.post<AdminCreateUserResponse>(
    endpoint,
    payload,
  )

  const record = unwrapUser<UserApiRecord>(response.data)

  if (!record) {
    throw new Error('Admin registration response was missing a user.')
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

    if (profile) {
      collected.push(mapUser(profile))
    }
  } catch {
    // Profile can fail without blocking locally registered users.
  }

  return mergeUsers(collected)
}

export async function createDriver(
  input: RegisterDriverInput,
): Promise<AdminUser> {
  const phone = toLocalPhone(input.phone)

  if (!/^09\d{8}$/.test(phone)) {
    throw new Error(
      'Phone must be an Ethiopian number in 09xxxxxxxx format.',
    )
  }

  const user = await createAdminUser('/admin/users/drivers', {
    name: input.name.trim(),
    email: input.email.trim(),
    phone,
    vehicle_type: input.vehicleType.trim(),
    vehicle_model: input.vehicleModel.trim(),
    license_number: input.plateNumber.trim(),
  })

  const withVehicle: AdminUser = {
    ...user,
    vehicleType: input.vehicleType,
    vehicleModel: input.vehicleModel,
    plateNumber: input.plateNumber,
  }

  cacheRegisteredUser(withVehicle)

  return withVehicle
}

export async function createRestaurantManager(
  input: RegisterManagerInput,
): Promise<AdminUser> {
  const phone = toLocalPhone(input.phone)

  if (!/^09\d{8}$/.test(phone)) {
    throw new Error(
      'Phone must be an Ethiopian number in 09xxxxxxxx format.',
    )
  }

  return createAdminUser('/admin/users/restaurant-managers', {
    name: input.name.trim(),
    email: input.email.trim(),
    phone,
  })
}