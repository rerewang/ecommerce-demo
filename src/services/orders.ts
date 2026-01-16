import { supabase } from '@/lib/supabase'
import type { CreateOrderInput, Order, DatabaseOrder } from '@/types/order'

export async function createOrder(input: CreateOrderInput, userId: string): Promise<Order> {
  // 1. Create order record
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total: input.total,
      status: 'pending',
      shipping_address: input.shippingAddress
    })
    .select()
    .single()

  if (orderError) throw new Error(`Failed to create order: ${orderError.message}`)
  if (!orderData) throw new Error('Failed to create order: No data returned')

  // 2. Create order items
  const orderItems = input.items.map(item => ({
    order_id: orderData.id,
    product_id: item.product.id,
    quantity: item.quantity,
    price_at_purchase: item.product.price
  }))

  const { data: itemsData, error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
    .select('*, product:products(*)')

  if (itemsError) {
    // Ideally we should rollback the order here
    throw new Error(`Failed to create order items: ${itemsError.message}`)
  }

  // 3. Decrement stock for each item
  for (const item of input.items) {
    const { error: stockError } = await supabase.rpc('decrement_stock', {
      product_id: item.product.id,
      quantity: item.quantity
    })

    if (stockError) {
      console.error(`Failed to decrement stock for item ${item.product.id}:`, stockError)
      // Non-blocking error for now, but should be handled in production
    }
  }

  return mapToFrontendOrder(orderData, itemsData as any[])
}

export async function getUserOrders(): Promise<Order[]> {
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items (
        *,
        product:products (*)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!orders) return []

  return orders.map(order => mapToFrontendOrder(order, order.items))
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items (
        *,
        product:products (*)
      )
    `)
    .eq('id', orderId)
    .single()

  if (error) return null
  
  return mapToFrontendOrder(order, order.items)
}

// Helper to map database structure to frontend structure
function mapToFrontendOrder(order: DatabaseOrder, items: any[]): Order {
  return {
    id: order.id,
    userId: order.user_id,
    status: order.status,
    total: order.total,
    shippingAddress: order.shipping_address,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: items.map(item => ({
      product: item.product || {
        id: item.product_id,
        name: 'Unknown Product',
        price: item.price_at_purchase,
        image_url: '',
        stock: 0,
        category: 'Unknown'
      },
      quantity: item.quantity,
      orderId: item.order_id,
      purchasedAt: item.created_at
    }))
  }
}
