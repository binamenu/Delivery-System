import type { Order, CartItem, Payment } from '../../types/Customer'
import api from '../api'
import { mockOrders } from './mock/orders'

let localOrdersList = [...mockOrders]

export async function getOrders(status?: string): Promise<Order[]> {
  try {
    const response = await api.get('/orders')
    const list = response.data.data as Order[]

    return status
      ? list.filter((o) => o.status === status)
      : list
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 200))

    return status
      ? localOrdersList.filter((o) => o.status === status)
      : localOrdersList
  }
}

export async function getOrder(id: number): Promise<Order | undefined> {
  try {
    const response = await api.get(`/orders/${id}`)
    return response.data.data
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return localOrdersList.find((o) => o.id === id)
  }
}

export interface PlaceOrderData {
  restaurant_id: number
  delivery_address: string
  phone: string
  cartItems: CartItem[]
  subtotal: number
  delivery_fee: number
  total_amount: number
  payment_method: 'telebirr' | 'card'
}

export async function placeOrder(data: PlaceOrderData): Promise<Order> {
  const response = await api.post('/orders', {
    restaurant_id: data.restaurant_id,
    delivery_address: data.delivery_address,
    phone: data.phone,
  })

  return response.data.data
}

export async function initiatePayment(
  orderId: number,
  paymentMethod: 'telebirr' | 'card',
): Promise<Payment> {
  const response = await api.post(`/orders/${orderId}/payment`, {
    payment_method: paymentMethod,
  })

  return response.data.data
}