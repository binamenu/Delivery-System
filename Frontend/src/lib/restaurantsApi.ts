import api from '@/lib/api'
import { unwrapList, unwrapRecord } from '@/lib/http'
import type {
  Restaurant,
  RestaurantApprovalStatus,
  RestaurantOperationalStatus,
} from '@/types/Restaurants'

interface RestaurantApiRecord {
  id: number
  name: string
  description?: string | null
  address?: string
  phone?: string
  logo?: string | null
  approval_status?: RestaurantApprovalStatus
  status?: RestaurantOperationalStatus
  created_at?: string
}

export function mapRestaurant(record: RestaurantApiRecord): Restaurant {
  return {
    id: record.id,
    name: record.name,
    managerName: '',
    category: record.description?.trim() || 'Uncategorized',
    logo: record.logo ?? null,
    approvalStatus: record.approval_status ?? 'pending',
    operationalStatus: record.status ?? 'inactive',
    createdAt: record.created_at ?? '',
    address: record.address ?? '',
    phone: record.phone ?? '',
  }
}

export async function fetchRestaurants(): Promise<Restaurant[]> {
  const response = await api.get('/restaurants')
  return unwrapList<RestaurantApiRecord>(response.data).map(mapRestaurant)
}

export async function updateRestaurantApproval(
  id: number,
  approvalStatus: Extract<RestaurantApprovalStatus, 'approved' | 'rejected'>,
): Promise<Restaurant> {
  const response = await api.patch(`/restaurants/${id}/approval-status`, {
    approval_status: approvalStatus,
  })

  const record = unwrapRecord<RestaurantApiRecord>(response.data)
  if (!record) {
    throw new Error('Restaurant approval response was empty.')
  }

  return mapRestaurant(record)
}
