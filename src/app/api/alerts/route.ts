import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { createAlert, getUserAlerts } from '@/services/alerts'
import { z } from 'zod'

const CreateAlertSchema = z.object({
  type: z.enum(['price_drop', 'restock']),
  productId: z.string().uuid(),
  targetPrice: z.number().optional(),
})

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

    const alerts = await getUserAlerts(user.id, supabase)
    return NextResponse.json(alerts)
  } catch (error: any) {
    console.error('GET /api/alerts error', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
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

    const newAlert = await createAlert(user.id, productId, type, targetPrice, supabase)

    return NextResponse.json(newAlert)
  } catch (error: any) {
    console.error('POST /api/alerts error', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
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

    const { error } = await supabase
        .from('product_alerts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // Ensure ownership

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/alerts error', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
