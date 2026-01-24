import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { checkReturnEligibility } from '@/services/returns'

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

    // Pass the supabase server client to the service so it can query DB
    const result = await checkReturnEligibility(orderId, user.id, supabase)

    return NextResponse.json({
      orderId,
      eligible: result.eligible,
      reason: result.reason,
      existingReturnId: result.existingReturnId,
      policy: {
        windowDays: 30,
        notes: 'Items must be unused and in original packaging. Final sale items excluded.',
      },
      daysSincePurchase: result.daysSincePurchase,
    })
  } catch (error: any) {
    console.error('[orders/eligibility] error', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
