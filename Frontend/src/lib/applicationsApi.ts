import axios from 'axios'
import api from '@/lib/api'
import { updateRestaurantApproval } from '@/lib/restaurantsApi'
import type { ApplicationStatus, RestaurantApplication } from '@/types/Applications'

interface ApplicationApiRecord {
  id: number
  name: string
  description?: string | null
  address?: string
  phone?: string
  approval_status?: ApplicationStatus
  approvalStatus?: ApplicationStatus
  status?: string
  created_at?: string
  createdAt?: string
  applied_at?: string
  appliedDate?: string
  category?: string | { name?: string } | null
  manager?: string | { name?: string } | null
  manager_name?: string
  managerName?: string
  role?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function unwrapList(payload: unknown): ApplicationApiRecord[] {
  if (Array.isArray(payload)) return payload as ApplicationApiRecord[]
  if (isRecord(payload) && Array.isArray(payload.data)) return payload.data as ApplicationApiRecord[]
  if (isRecord(payload) && isRecord(payload.data) && Array.isArray(payload.data.data)) {
    return payload.data.data as ApplicationApiRecord[]
  }
  return []
}

function relationName(value: string | { name?: string } | null | undefined): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.name ?? ''
}

function normalizeStatus(record: ApplicationApiRecord): ApplicationStatus {
  const value = record.approval_status ?? record.approvalStatus
  if (value === 'pending' || value === 'rejected' || value === 'approved') return value
  return 'pending'
}

export function mapApplication(record: ApplicationApiRecord): RestaurantApplication {
  return {
    id: record.id,
    name: record.name,
    category: relationName(record.category) || record.description?.trim() || 'Uncategorized',
    status: normalizeStatus(record),
    managerName: record.managerName ?? record.manager_name ?? (relationName(record.manager) || '-'),
    phone: record.phone?.trim() || '—',
    address: record.address?.trim() || '—',
    appliedDate: record.applied_at ?? record.appliedDate ?? record.created_at ?? record.createdAt ?? '',
    role: 'restaurant_manager',
  }
}

function isMissingEndpoint(error: unknown): boolean {
  return axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 405)
}

async function tryFetch(path: string): Promise<RestaurantApplication[] | null> {
  try {
    const response = await api.get(path)
    return unwrapList(response.data).map(mapApplication)
  } catch (error) {
    if (isMissingEndpoint(error)) return null
    throw error
  }
}

export async function fetchApplications(): Promise<RestaurantApplication[]> {
  const fromDedicated =
    (await tryFetch('/applications')) ??
    (await tryFetch('/admin/applications')) ??
    (await tryFetch('/restaurants/applications'))

  if (fromDedicated) {
    return fromDedicated.filter((item) => item.status !== 'approved')
  }

  const restaurants = (await tryFetch('/restaurants')) ?? []
  return restaurants.filter((item) => item.status !== 'approved')
}

export async function approveApplication(id: number): Promise<RestaurantApplication> {
  const restaurant = await updateRestaurantApproval(id, 'approved')
  return {
    id: restaurant.id,
    name: restaurant.name,
    category: restaurant.category,
    status: restaurant.approvalStatus,
    managerName: restaurant.managerName || '—',
    phone: '—',
    address: '—',
    appliedDate: restaurant.createdAt,
    role: 'restaurant_manager',
  }
}

export async function rejectApplication(id: number): Promise<RestaurantApplication> {
  const restaurant = await updateRestaurantApproval(id, 'rejected')
  return {
    id: restaurant.id,
    name: restaurant.name,
    category: restaurant.category,
    status: restaurant.approvalStatus,
    managerName: restaurant.managerName || '—',
    phone: '—',
    address: '—',
    appliedDate: restaurant.createdAt,
    role: 'restaurant_manager',
  }
}