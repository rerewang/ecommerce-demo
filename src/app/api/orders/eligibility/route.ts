import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getOrderById } from '@/services/orders'

const RETURN_WINDOW_DAYS = 30

function daysBetween(from: string) {
  const fromDate = new Date(from)
  const now = new Date()
  const diffMs = now.getTime() - fromDate.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

function buildEligibility(orderDate: string, status: string) {
  const days = daysBetween(orderDate)
  const withinWindow = days <= RETURN_WINDOW_DAYS
  const statusAllowed = status !== 'cancelled'

  const eligible = withinWindow && statusAllowed
  const reason = eligible
    ? `Eligible: within ${RETURN_WINDOW_DAYS} days of purchase.`
    : !statusAllowed
      ? 'Ineligible: order was cancelled.'
      : `Ineligible: beyond ${RETURN_WINDOW_DAYS}-day return window.`

  return { eligible, reason, daysSincePurchase: days }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const orderId = body?.orderId as string | undefined

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'customer'

    const order = await getOrderById(orderId, supabase)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (role !== 'admin' && order.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { eligible, reason, daysSincePurchase } = buildEligibility(order.createdAt, order.status)

    return NextResponse.json({
      orderId: order.id,
      eligible,
      reason,
      policy: {
        windowDays: RETURN_WINDOW_DAYS,
        notes: 'Items must be unused and in original packaging. Final sale items excluded.',
      },
      daysSincePurchase,
      orderStatus: order.status,
    })
  } catch (error) {
    console.error('[orders/eligibility] error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
