import { fetchRestaurants, updateRestaurantApproval } from '@/lib/restaurantsApi'
import type { Restaurant } from '@/types/Restaurants'
import type { RestaurantApplication } from '@/types/Applications'

export function mapApplication(restaurant: Restaurant): RestaurantApplication {
 return {
  id: restaurant.id,
  name: restaurant.name,
  category: restaurant.category,
  status: restaurant.approvalStatus,
  managerName: restaurant.managerName || '—',
  phone: restaurant.phone?.trim() || '—',
  address: restaurant.address?.trim() || '—',
  appliedDate: restaurant.createdAt,
  role: 'restaurant_manager',
}
}

export async function fetchApplications(): Promise<RestaurantApplication[]> {
  const restaurants = await fetchRestaurants()
  return restaurants.map(mapApplication)
}

export async function approveApplication(id: number): Promise<RestaurantApplication> {
  return mapApplication(await updateRestaurantApproval(id, 'approved'))
}

export async function rejectApplication(id: number): Promise<RestaurantApplication> {
  return mapApplication(await updateRestaurantApproval(id, 'rejected'))
}
