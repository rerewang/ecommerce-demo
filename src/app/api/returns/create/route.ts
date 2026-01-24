import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { createReturnRequest } from '@/services/returns'
import { z } from 'zod'

const CreateReturnSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().min(1, "Reason is required"),
})

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
    const result = CreateReturnSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error }, { status: 400 })
    }

    const { orderId, reason } = result.data

    const returnRequest = await createReturnRequest(orderId, user.id, reason, supabase)

    return NextResponse.json(returnRequest)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    console.error('POST /api/returns/create error', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
