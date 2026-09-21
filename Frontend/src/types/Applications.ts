export type ApplicationStatus = 'pending' | 'rejected' | 'approved'

export interface RestaurantApplication {
  id: number
  name: string
  category: string
  status: ApplicationStatus
  managerName: string
  phone: string
  address: string
  appliedDate: string
  role: 'restaurant_manager'
}

export interface ApplicationStats {
  total: number
  pending: number
}