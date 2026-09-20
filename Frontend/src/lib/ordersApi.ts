import api from '@/lib/api'
import { unwrapPaginated, API_FEATURES } from '@/lib/http'
import { buildOrdersListResponse, filterAdminOrders } from '@/lib/adminStats'
import type { Order, OrderStatus, OrdersListResponse, OrdersQueryParams } from '@/types/Orders'

interface OrderApiRecord {
  id?: number
  status?: OrderStatus
  total_amount?: number | string
  created_at?: string
  customer?: { id: number; name: string; phone?: string } | null
  restaurant?: { id: number; name: string } | null
  driver?: {
    id?: number
    user_id?: number
    name?: string
    phone?: string
    vehicle_type?: string
  } | null
}

export interface AdminOrderParty {
  id: number
  name: string
  phone: string
  email?: string
  vehicleType?: string
  role: 'customer' | 'driver'
}

export interface AdminOrderRecord {
  order: Order
  customer: AdminOrderParty | null
  driver: AdminOrderParty | null
}

function mapOrder(record: OrderApiRecord): Order | null {
  if (typeof record.id !== 'number') return null

  return {
    id: record.id,
    orderNumber: `#ORD-${record.id}`,
    customer: {
      id: record.customer?.id ?? 0,
      name: record.customer?.name ?? 'Unknown customer',
    },
    restaurant: {
      id: record.restaurant?.id ?? 0,
      name: record.restaurant?.name ?? 'Unknown restaurant',
    },
    status: record.status ?? 'pending',
    totalAmount: Number(record.total_amount ?? 0),
    createdAt: record.created_at ?? '',
  }
}

function mapAdminOrder(record: OrderApiRecord): AdminOrderRecord | null {
  const order = mapOrder(record)
  if (!order) return null

  const driverId = record.driver?.user_id ?? record.driver?.id

  return {
    order,
    customer: record.customer?.id
      ? {
          id: record.customer.id,
          name: record.customer.name,
          phone: record.customer.phone ?? '',
          role: 'customer',
        }
      : null,
    driver:
      record.driver && driverId
        ? {
            id: driverId,
            name: record.driver.name ?? `Driver ${driverId}`,
            phone: record.driver.phone ?? '',
            vehicleType: record.driver.vehicle_type,
            role: 'driver',
          }
        : null,
  }
}

const MAX_PAGES = 10

export async function fetchAdminOrderRecords(): Promise<AdminOrderRecord[]> {
  if (!API_FEATURES.orders) {
    return []
  }
  try {
    const collected: AdminOrderRecord[] = []
    let page = 1
    let lastPage = 1

    while (page <= lastPage && page <= MAX_PAGES) {
      const response = await api.get('/orders', { params: { page } })
      const paginated = unwrapPaginated<OrderApiRecord>(response.data)
      const mapped = paginated.items
        .map(mapAdminOrder)
        .filter((item): item is AdminOrderRecord => item !== null)

      collected.push(...mapped)

      if (mapped.length === 0) break

      lastPage = Math.min(paginated.lastPage || 1, MAX_PAGES)
      page += 1
    }

    return collected
  } catch {
    return []
  }
}

export async function fetchAllOrders(): Promise<Order[]> {
  const records = await fetchAdminOrderRecords()
  return records.map((record) => record.order)
}

export async function fetchOrders(params: OrdersQueryParams = {}): Promise<OrdersListResponse> {
  const allOrders = await fetchAllOrders()
  const orders = filterAdminOrders(allOrders, params)
  const stats = buildOrdersListResponse(allOrders).stats

  return { stats, orders }
}
