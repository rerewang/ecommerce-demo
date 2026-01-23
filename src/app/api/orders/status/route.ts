import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getOrderById } from '@/services/orders'

function buildTimeline(order: { createdAt: string; updatedAt: string; status: string }) {
  const events = [
    { label: 'Order Created', status: 'created', timestamp: order.createdAt },
  ]

  if (order.status === 'paid' || order.status === 'shipped') {
    events.push({ label: 'Payment Confirmed', status: 'paid', timestamp: order.updatedAt })
  }

  if (order.status === 'shipped') {
    events.push({ label: 'Shipped', status: 'shipped', timestamp: order.updatedAt })
  }

  if (order.status === 'cancelled') {
    events.push({ label: 'Cancelled', status: 'cancelled', timestamp: order.updatedAt })
  }

  return events
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')
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

    const timeline = buildTimeline(order)

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      total: order.total,
      shippingAddress: order.shippingAddress,
      timeline,
    })
  } catch (error) {
    console.error('[orders/status] error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
