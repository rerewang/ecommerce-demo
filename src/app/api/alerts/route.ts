import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { z } from 'zod'

const CreateAlertSchema = z.object({
  type: z.enum(['price_drop', 'restock']),
  productId: z.string().uuid(),
  targetPrice: z.number().optional(),
})

// Mock alerts store since we haven't created the table yet
// In a real app, this would be a Supabase table 'product_alerts'
// id, user_id, product_id, type, target_price, created_at
interface MockAlert {
  id: string
  userId: string
  productId: string
  type: string
  targetPrice?: number
  createdAt: string
  active: boolean
}

const MOCK_ALERTS_STORE: MockAlert[] = []

export async function GET(req: Request) {
  void req
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In real app: select * from product_alerts where user_id = user.id
    const userAlerts = MOCK_ALERTS_STORE.filter(a => a.userId === user.id)
    return NextResponse.json(userAlerts)
  } catch (error) {
    console.error('GET /api/alerts error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const result = CreateAlertSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error }, { status: 400 })
    }

    const { type, productId, targetPrice } = result.data

    const newAlert: MockAlert = {
      id: crypto.randomUUID(),
      userId: user.id,
      productId,
      type,
      targetPrice,
      createdAt: new Date().toISOString(),
      active: true
    }

    MOCK_ALERTS_STORE.push(newAlert)

    return NextResponse.json(newAlert)
  } catch (error) {
    console.error('POST /api/alerts error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const index = MOCK_ALERTS_STORE.findIndex(a => a.id === id && a.userId === user.id)
    if (index !== -1) {
      MOCK_ALERTS_STORE.splice(index, 1)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
  } catch (error) {
    console.error('DELETE /api/alerts error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
