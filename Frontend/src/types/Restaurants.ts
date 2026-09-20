export type RestaurantApprovalStatus = 'pending' | 'approved' | 'rejected'
export type RestaurantOperationalStatus = 'active' | 'inactive' | 'suspended'
export type RestaurantDisplayStatus = 'approved' | 'pending' | 'suspended'
export type RestaurantFilterStatus = 'all' | RestaurantDisplayStatus

export interface Restaurant {
  id: number
  name: string
  managerName: string
  category: string
  logo: string | null
  approvalStatus: RestaurantApprovalStatus
  operationalStatus: RestaurantOperationalStatus
  createdAt: string
  address?: string
  phone?: string
}

export interface RestaurantsQueryParams {
  search?: string
  status?: RestaurantFilterStatus
}
