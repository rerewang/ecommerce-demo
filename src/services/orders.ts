import { supabase, createClientComponentClient } from '@/lib/supabase'
import { SupabaseClient } from '@supabase/supabase-js'
import type { CreateOrderInput, Order, DatabaseOrder, OrderItem, OrderStatus } from '@/types/order'

interface OrderItemWithProduct extends OrderItem {
  product: {
    id: string
    name: string
    price: number
    image_url: string
    stock: number
    category: string
    created_at?: string
    description?: string
  } | null
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const browserClient = createClientComponentClient()
  const { error, data } = await browserClient
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()

  if (error) throw new Error(`Failed to update order status: ${error.message}`)
  
  if (!data || data.length === 0) {
    console.warn(`[updateOrderStatus] Warning: No rows updated for order ${orderId}. Possible RLS restriction.`)
  } else {
    console.log(`[updateOrderStatus] Successfully updated order ${orderId} to ${status}`)
  }
}

// Helper to map database structure to frontend structure
function mapToFrontendOrder(order: DatabaseOrder, items: OrderItemWithProduct[]): Order {
  return {
    id: order.id,
    userId: order.user_id,
    status: order.status,
    total: order.total,
    shippingAddress: order.shipping_address,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: items.map(item => ({
      id: item.id, // The ID of the order item
      product: {
        id: item.product?.id || item.product_id,
        name: item.product?.name || 'Unknown Product',
        description: item.product?.description || '', // Default empty string if undefined
        price: item.price_at_purchase,
        image_url: item.product?.image_url || '',
        stock: item.product?.stock || 0,
        category: item.product?.category || 'Unknown',
        created_at: item.product?.created_at || new Date().toISOString()
      },
      quantity: item.quantity,
      orderId: item.order_id,
      purchasedAt: item.created_at
    }))
  }
}

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

  return mapToFrontendOrder(orderData, itemsData as unknown as OrderItemWithProduct[])
}

export async function getOrders(
  userId: string,
  role: string,
  status?: OrderStatus,
  client: SupabaseClient = supabase
): Promise<Order[]> {
  if (role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }

  let query = client
    .from('orders')
    .select(`
      *,
      items:order_items (
        *,
        product:products (*)
      )
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data: orders, error } = await query

  if (error) throw error
  if (!orders) return []

  return orders.map(order => mapToFrontendOrder(order, order.items as unknown as OrderItemWithProduct[]))
}

export async function getUserOrders(
  userId: string,
  role: string,
  client: SupabaseClient = supabase
): Promise<Order[]> {
  if (!userId) {
    throw new Error('Authentication required')
  }
  
  const validRoles = ['admin', 'customer']
  if (!validRoles.includes(role)) {
    throw new Error('Invalid role')
  }
  
  let query = client
    .from('orders')
    .select(`
      *,
      items:order_items (
        *,
        product:products (*)
      )
    `)
    .order('created_at', { ascending: false })
  
  if (role !== 'admin') {
    query = query.eq('user_id', userId)
  }
  
  const { data: orders, error } = await query
  
  if (error) throw error
  if (!orders) return []
  
  return orders.map(order => mapToFrontendOrder(order, order.items as unknown as OrderItemWithProduct[]))
}

export async function getOrderById(orderId: string, supabaseClient?: SupabaseClient): Promise<Order | null> {
  // Use provided client or fallback to browser client with session context
  const client = supabaseClient || createClientComponentClient()
  
  const { data: order, error } = await client
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

  if (error) {
    console.error('Failed to fetch order:', error)
    return null
  }
  
  if (!order) return null
  
  return mapToFrontendOrder(order, order.items as unknown as OrderItemWithProduct[])
}
