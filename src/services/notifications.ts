import { supabase } from '@/lib/supabase'
import { SupabaseClient } from '@supabase/supabase-js'

export interface Notification {
  id: string
  userId: string
  type: 'price_drop' | 'restock' | 'system'
  title: string
  message: string
  read: boolean
  metadata: Record<string, unknown>
  createdAt: string
}

export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  metadata: Record<string, unknown> = {},
  client: SupabaseClient = supabase
) {
  const { error } = await client.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    metadata,
    read: false
  })

  if (error) {
    console.error('Failed to create notification:', error)
    throw error
  }
}

export async function checkAlertsForProduct(
  productId: string,
  newPrice: number,
  newStock: number,
  client: SupabaseClient = supabase,
  limitType?: Notification['type']
) {
  // 1. Fetch active alerts for this product
  let query = client
    .from('product_alerts')
    .select('*')
    .eq('product_id', productId)
    .eq('status', 'active')

  if (limitType) {
    query = query.eq('type', limitType)
  }

  const { data: alerts, error } = await query

  if (error || !alerts) return

  const notificationsToCreate: {
    user_id: string
    type: Notification['type']
    title: string
    message: string
    metadata: Record<string, unknown>
  }[] = []
  const alertsToUpdate: string[] = []

  for (const alert of alerts) {
    let shouldNotify = false
    let title = ''
    let message = ''

    // Force numeric comparison
    const price = Number(newPrice)
    const stock = Number(newStock)
    const targetPrice = alert.target_price ? Number(alert.target_price) : null

    // Check Price Drop
    if (alert.type === 'price_drop' && targetPrice !== null) {
      if (price <= targetPrice) {
        shouldNotify = true
        title = 'Price Drop Alert!'
        message = `Good news! A product you're watching has dropped to $${price}.`
      }
    } 
    // Check Restock
    else if (alert.type === 'restock') {
      if (stock > 0) {
        shouldNotify = true
        title = 'Restock Alert!'
        message = `A product you're watching is back in stock.`
      }
    }

    if (shouldNotify) {
      notificationsToCreate.push({
        user_id: alert.user_id,
        type: alert.type,
        title,
        message,
        metadata: { product_id: productId, alert_id: alert.id, triggered_price: price }
      })
      
      alertsToUpdate.push(alert.id)
    }
  }

  // 2. Batch create notifications
  if (notificationsToCreate.length > 0) {
    await client.from('notifications').insert(notificationsToCreate)
    
    // 3. Mark alerts as triggered (optional, or keep active?)
    // Usually price alerts are one-time unless recurring. Let's mark triggered.
    await client
      .from('product_alerts')
      .update({ status: 'triggered' })
      .in('id', alertsToUpdate)
  }
}
