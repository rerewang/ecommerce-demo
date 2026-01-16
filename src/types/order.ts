import type { CartItem } from '@/store/cart'

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled'

// Database structure (matches 'orders' table)
export interface DatabaseOrder {
  id: string
  user_id: string
  status: OrderStatus
  total: number
  shipping_address: {
    name: string
    address: string
    city: string
    zip: string
  }
  created_at: string
  updated_at: string
}

// Database structure (matches 'order_items' table)
export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_purchase: number
  created_at: string
}

// Frontend view model (extends CartItem with order specific info)
export interface OrderItemView extends CartItem {
  orderId: string
  purchasedAt: string
}

// Full Order object for frontend usage (camelCase)
export interface Order {
  id: string
  userId: string
  items: OrderItemView[]
  total: number
  status: OrderStatus
  shippingAddress: {
    name: string
    address: string
    city: string
    zip: string
  }
  createdAt: string
  updatedAt: string
}

// Input for creating a new order
export interface CreateOrderInput {
  items: CartItem[]
  total: number
  shippingAddress: {
    name: string
    address: string
    city: string
    zip: string
  }
}
