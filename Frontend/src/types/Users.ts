export type UserRole = 'customer' | 'driver' | 'restaurant_manager' | 'admin'
export type UserStatus = 'active' | 'inactive' | 'suspended'
export type UserRoleFilter = 'all' | UserRole

export interface AdminUser {
  id: number
  name: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  createdAt: string
  vehicleType?: string
  vehicleModel?: string
  plateNumber?: string
}

export interface RegisterDriverInput {
  name: string
  email: string
  phone: string
  vehicleType: string
  vehicleModel: string
  plateNumber: string
}

export interface RegisterManagerInput {
  name: string
  email: string
  phone: string
}