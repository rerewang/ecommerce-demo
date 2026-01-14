import type { CartItem } from '@/store/cart'

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: 'pending' | 'paid' | 'shipped'
  shippingAddress: {
    name: string
    address: string
    city: string
    zip: string
  }
  createdAt: string
}

export type CreateOrderInput = Omit<Order, 'id' | 'status' | 'createdAt'>
