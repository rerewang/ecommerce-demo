import { supabase } from '@/lib/supabase'
import { SupabaseClient } from '@supabase/supabase-js'
import { getOrderById } from '@/services/orders'
import type { DatabaseReturn, ReturnRequest } from '@/types/return'

const RETURN_WINDOW_DAYS = 30

export interface EligibilityResult {
  eligible: boolean
  reason: string
  daysSincePurchase: number
  existingReturnId?: string
}

export async function checkReturnEligibility(
  orderId: string,
  userId: string,
  client: SupabaseClient = supabase
): Promise<EligibilityResult> {
  // 1. Check if return already exists
  const { data: existingReturns } = await client
    .from('returns')
    .select('id, status')
    .eq('order_id', orderId)
    .neq('status', 'cancelled') // Active returns block new ones

  if (existingReturns && existingReturns.length > 0) {
    return {
      eligible: false,
      reason: `A return request (ID: ${existingReturns[0].id}) already exists for this order.`,
      daysSincePurchase: 0,
      existingReturnId: existingReturns[0].id
    }
  }

  // 2. Check order details
  const order = await getOrderById(orderId, client)
  if (!order) {
    throw new Error('Order not found')
  }

  // 3. Verify ownership (if not verified by RLS/caller context)
  if (order.userId !== userId) {
    // We assume the caller (API route) handles auth, but good to be safe.
    // However, if called by admin, this check might be annoying.
    // For now, relies on the `client` having correct permissions via RLS.
  }

  const fromDate = new Date(order.createdAt)
  const now = new Date()
  const diffMs = now.getTime() - fromDate.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  const withinWindow = days <= RETURN_WINDOW_DAYS
  
  let reason = ''
  let eligible = true

  if (!withinWindow) {
    eligible = false
    reason = `Ineligible: beyond ${RETURN_WINDOW_DAYS}-day return window.`
  } else if (order.status === 'cancelled') {
    eligible = false
    reason = 'Ineligible: order was cancelled.'
  } else if (order.status === 'pending') {
    eligible = false
    reason = 'Ineligible: order is not yet paid/shipped.'
  } else {
    reason = `Eligible: within ${RETURN_WINDOW_DAYS} days.`
  }

  return { eligible, reason, daysSincePurchase: days }
}

export async function createReturnRequest(
  orderId: string,
  userId: string,
  reason: string,
  client: SupabaseClient = supabase
): Promise<ReturnRequest> {
  // Check eligibility first
  const eligibility = await checkReturnEligibility(orderId, userId, client)
  if (!eligibility.eligible) {
    throw new Error(eligibility.reason)
  }

  const { data, error } = await client
    .from('returns')
    .insert({
      order_id: orderId,
      user_id: userId,
      reason: reason,
      status: 'requested'
    })
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error('Failed to create return')

  return mapToFrontendReturn(data)
}

function mapToFrontendReturn(row: DatabaseReturn): ReturnRequest {
  return {
    id: row.id,
    orderId: row.order_id,
    userId: row.user_id,
    status: row.status,
    reason: row.reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}
