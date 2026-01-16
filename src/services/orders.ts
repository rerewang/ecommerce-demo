import type { Order, CreateOrderInput } from '@/types/order'

// In a real app, this would interact with a database table 'orders'
// For this demo, we'll just simulate an API call
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  return {
    id: Math.random().toString(36).substring(7),
    userId: 'mock-user-id',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...input,
    items: input.items.map(item => ({
      ...item,
      orderId: 'mock-order-id',
      purchasedAt: new Date().toISOString()
    }))
  }
}
