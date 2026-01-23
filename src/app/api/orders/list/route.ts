import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

const DEFAULT_LIMIT = 5

type ListOrderItem = {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    image_url: string | null
  } | null
}

type ListOrder = {
  id: string
  created_at: string
  total: number
  status: string
  items?: ListOrderItem[]
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limitParam = Number(searchParams.get('limit'))
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 10) : DEFAULT_LIMIT

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

    let query = supabase
      .from('orders')
      .select(
        `
          id,
          created_at,
          total,
          status,
          items:order_items (
            id,
            quantity,
            product:products (id, name, image_url)
          )
        `
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    if (role !== 'admin') {
      query = query.eq('user_id', user.id)
    }

    // Only keep top 2 items per order for brevity
    query = query.limit(2, { foreignTable: 'items' })

    const { data: orders, error } = await query

    if (error) {
      console.error('[orders/list] error', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    const safeOrders = Array.isArray(orders) ? (orders as unknown as ListOrder[]) : []

    const formatted = safeOrders.map((order) => ({
      orderId: order.id,
      shortId: order.id.slice(0, 8),
      createdAt: order.created_at,
      status: order.status,
      total: order.total,
      items: (order.items || []).map((item) => ({
        id: item.id,
        name: item.product?.name ?? 'Unknown item',
        imageUrl: item.product?.image_url ?? '',
        quantity: item.quantity,
      })),
    }))

    return NextResponse.json({ orders: formatted })
  } catch (error) {
    console.error('[orders/list] unexpected error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
