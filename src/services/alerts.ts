import { supabase } from '@/lib/supabase'
import { SupabaseClient } from '@supabase/supabase-js'
import type { DatabaseAlert, ProductAlert, AlertType } from '@/types/alert'

export async function createAlert(
  userId: string,
  productId: string,
  type: AlertType,
  targetPrice?: number,
  client: SupabaseClient = supabase
): Promise<ProductAlert> {
  // 1. Verify product exists and get current price
  const { data: product, error: productError } = await client
    .from('products')
    .select('id, price')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    throw new Error('Product not found')
  }

  // 2. If targetPrice not provided for price_drop, use current price
  const finalTargetPrice = (type === 'price_drop' && targetPrice === undefined)
    ? product.price
    : targetPrice

  const { data, error } = await client
    .from('product_alerts')
    .insert({
      user_id: userId,
      product_id: productId,
      type,
      target_price: finalTargetPrice,
      status: 'active'
    })
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error('Failed to create alert')

  return mapToFrontendAlert(data)
}

export async function getUserAlerts(
  userId: string,
  client: SupabaseClient = supabase
): Promise<ProductAlert[]> {
  const { data, error } = await client
    .from('product_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!data) return []

  return data.map(mapToFrontendAlert)
}

function mapToFrontendAlert(row: DatabaseAlert): ProductAlert {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    type: row.type,
    targetPrice: row.target_price ?? undefined,
    status: row.status,
    createdAt: row.created_at
  }
}
